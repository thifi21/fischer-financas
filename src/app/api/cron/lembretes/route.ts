import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendTelegramMessage } from '@/lib/telegram'
import { formatDate } from '@/lib/utils'

const ICONES: Record<string, string> = {
  vencimento: '📅',
  meta: '🎯',
  geral: '📌',
}

const PRIORIDADE_LABEL: Record<string, string> = {
  alta: '🔴 Alta',
  media: '🟡 Média',
  baixa: '🔵 Baixa',
}

export async function GET(request: Request) {
  // Autenticação do Vercel Cron
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase URL ou Service Key ausentes')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Data de hoje e hora atual no fuso de Brasília (UTC-3)
    const agora = new Date()
    agora.setUTCHours(agora.getUTCHours() - 3)
    const horaAtual = agora.getUTCHours() // hora em Brasília
    const ano = agora.getUTCFullYear()
    const mes = String(agora.getUTCMonth() + 1).padStart(2, '0')
    const dia = String(agora.getUTCDate()).padStart(2, '0')
    const dataHoje = `${ano}-${mes}-${dia}`

    // Buscar lembretes de hoje que ainda não foram lidos e estão ativos
    const { data: lembretes, error } = await supabase
      .from('lembretes')
      .select('*')
      .eq('data_lembrete', dataHoje)
      .eq('ativo', true)
      .eq('lido', false)

    if (error) throw error

    if (!lembretes || lembretes.length === 0) {
      return NextResponse.json({ message: 'Nenhum lembrete para hoje', data: dataHoje })
    }

    // Agrupar por user_id
    const lembretePorUser = lembretes.reduce((acc: any, l: any) => {
      if (!acc[l.user_id]) acc[l.user_id] = []
      acc[l.user_id].push(l)
      return acc
    }, {})

    // Buscar preferências dos usuários (item 6 — hora de envio e filtros)
    const userIds = Object.keys(lembretePorUser)
    const { data: prefsList } = await supabase
      .from('preferencias_usuario')
      .select('user_id, hora_envio_lembretes, notificar_cartoes, notificar_fixas, notificar_metas')
      .in('user_id', userIds)

    const prefsMap: Record<string, any> = {}
    prefsList?.forEach((p: any) => { prefsMap[p.user_id] = p })

    let envios = 0
    const idsParaMarcar: string[] = []

    for (const userId in lembretePorUser) {
      const prefs = prefsMap[userId]

      // Respeitar hora de envio configurada (tolerância de ±1h, default 9h)
      const horaPreferida = prefs?.hora_envio_lembretes ?? 9
      if (Math.abs(horaAtual - horaPreferida) > 1) {
        // Fora da janela de envio deste usuário — pular
        continue
      }

      const itens = lembretePorUser[userId]

      let msg = `📌 <b>Lembretes do dia ${formatDate(dataHoje)}</b>\n\n`

      itens.forEach((l: any) => {
        const icone = ICONES[l.tipo] || '📌'
        const prioridade = PRIORIDADE_LABEL[l.prioridade] || ''
        msg += `${icone} <b>${l.titulo}</b>`
        if (prioridade) msg += ` — ${prioridade}`
        if (l.mensagem) msg += `\n   ${l.mensagem}`
        msg += '\n\n'
      })

      msg += `<i>Fischer Finanças • ${itens.length} lembrete(s) para hoje</i>`

      await sendTelegramMessage(msg, {
        userId,
        titulo: `Lembretes do dia ${formatDate(dataHoje)}`,
      })
      envios++
      itens.forEach((l: any) => idsParaMarcar.push(l.id))
    }

    // Marcar todos como lidos
    if (idsParaMarcar.length > 0) {
      await supabase
        .from('lembretes')
        .update({ lido: true })
        .in('id', idsParaMarcar)
    }

    return NextResponse.json({
      success: true,
      data: dataHoje,
      horaAtual,
      lembretesProcessados: lembretes.length,
      mensagensEnviadas: envios,
    })
  } catch (error: any) {
    console.error('Erro no cron de lembretes:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
