import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendTelegramMessage } from '@/lib/telegram'
import { formatBRL, formatDate } from '@/lib/utils'

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

    // Data de amanhã no formato YYYY-MM-DD
    const amanha = new Date()
    amanha.setDate(amanha.getDate() + 1)
    const ano = amanha.getFullYear()
    const mes = String(amanha.getMonth() + 1).padStart(2, '0')
    const dia = String(amanha.getDate()).padStart(2, '0')
    const dataAlvo = `${ano}-${mes}-${dia}`

    // Buscar contas que vencem amanhã e ainda não foram pagas
    const { data: contas, error } = await supabase
      .from('contas_fixas')
      .select('*')
      .eq('pago', false)
      .eq('data_vencimento', dataAlvo)

    if (error) throw error

    if (!contas || contas.length === 0) {
      return NextResponse.json({ message: 'Nenhuma conta para amanhã' })
    }

    // Agrupar por usuário (caso haja múltiplos)
    const contasPorUser = contas.reduce((acc: any, conta: any) => {
      if (!acc[conta.user_id]) acc[conta.user_id] = []
      acc[conta.user_id].push(conta)
      return acc
    }, {})

    let envios = 0

    for (const userId in contasPorUser) {
      const contasUser = contasPorUser[userId]
      let msg = `📅 <b>Lembrete de Vencimento!</b>\n\nVocê tem ${contasUser.length} conta(s) vencendo amanhã (${formatDate(dataAlvo)}):\n\n`
      
      let total = 0
      contasUser.forEach((c: any) => {
        msg += `🔹 <b>${c.descricao}</b>: ${formatBRL(Number(c.valor))}\n`
        total += Number(c.valor)
      })

      msg += `\n💰 <b>Total a pagar amanhã: ${formatBRL(total)}</b>`

      await sendTelegramMessage(msg)
      envios++
    }

    return NextResponse.json({ 
      success: true, 
      contasEncontradas: contas.length,
      mensagensEnviadas: envios 
    })
  } catch (error: any) {
    console.error('Erro no cron de vencimentos:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
