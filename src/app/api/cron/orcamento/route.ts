import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendTelegramMessage } from '@/lib/telegram'
import { formatBRL } from '@/lib/utils'

export async function GET(request: Request) {
  // Autenticação do Vercel Cron
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Mês/ano atual em Brasília (UTC-3)
    const agora = new Date()
    agora.setUTCHours(agora.getUTCHours() - 3)
    const mes = agora.getUTCMonth() + 1
    const ano = agora.getUTCFullYear()

    // Buscar todas as metas ativas do mês corrente
    const { data: metas, error } = await supabase
      .from('metas')
      .select('*')
      .eq('mes', mes)
      .eq('ano', ano)
      .eq('ativo', true)

    if (error) throw error
    if (!metas || metas.length === 0) {
      return NextResponse.json({ message: 'Nenhuma meta ativa para o mês', mes, ano })
    }

    // Buscar preferências dos usuários para respeitar notificar_metas
    const userIds = [...new Set(metas.map((m: any) => m.user_id))]
    const { data: prefs } = await supabase
      .from('preferencias_usuario')
      .select('user_id, notificar_metas')
      .in('user_id', userIds)

    const prefsMap: Record<string, boolean> = {}
    prefs?.forEach((p: any) => { prefsMap[p.user_id] = p.notificar_metas })

    let alertasEnviados = 0

    for (const userId of userIds) {
      // Respeitar preferência notificar_metas (default: true se não configurado)
      if (prefsMap[userId] === false) continue

      const metasUsuario = metas.filter((m: any) => m.user_id === userId)

      // Buscar gastos do usuário no mês
      const [
        { data: cartoes },
        { data: fixas },
        { data: combustivel },
      ] = await Promise.all([
        supabase.from('cartoes').select('valor').eq('user_id', userId).eq('mes', mes).eq('ano', ano),
        supabase.from('contas_fixas').select('valor').eq('user_id', userId).eq('mes', mes).eq('ano', ano),
        supabase.from('combustivel').select('valor').eq('user_id', userId).eq('mes', mes).eq('ano', ano),
      ])

      const soma = (arr: any[] | null) => (arr || []).reduce((s, r) => s + Number(r.valor), 0)
      const gastos = {
        cartoes: soma(cartoes),
        fixas: soma(fixas),
        combustivel: soma(combustivel),
        total: 0
      }
      gastos.total = gastos.cartoes + gastos.fixas + gastos.combustivel

      const alertas: string[] = []

      for (const meta of metasUsuario) {
        const gasto = gastos[meta.categoria as keyof typeof gastos] || 0
        const percentual = meta.valor_limite > 0 ? (gasto / meta.valor_limite) * 100 : 0

        if (percentual >= meta.notificar_em) {
          const emoji = percentual >= 100 ? '🚨' : '⚠️'
          const status = percentual >= 100 ? 'EXCEDIDA' : `${percentual.toFixed(0)}% atingido`
          alertas.push(
            `${emoji} <b>${meta.categoria.toUpperCase()}</b> — Meta: ${formatBRL(meta.valor_limite)} | Gasto: ${formatBRL(gasto)} | ${status}`
          )
        }
      }

      if (alertas.length > 0) {
        const msg = `📊 <b>Alerta de Orçamento — ${String(mes).padStart(2, '0')}/${ano}</b>\n\n${alertas.join('\n\n')}\n\n<i>Fischer Finanças • Verificação diária de orçamento</i>`
        await sendTelegramMessage(msg, {
          userId,
          titulo: `Alerta de Orçamento ${mes}/${ano}`,
        })
        alertasEnviados++
      }
    }

    return NextResponse.json({
      success: true,
      mes,
      ano,
      alertasEnviados,
      usuariosVerificados: userIds.length,
    })
  } catch (error: any) {
    console.error('Erro no cron de orçamento:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
