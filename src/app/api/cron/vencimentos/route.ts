import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendTelegramMessage } from '@/lib/telegram'
import { formatBRL, formatDate } from '@/lib/utils'
import { verifyCronRequest } from '@/lib/cron-auth'
import { dataBrasilMaisDias } from '@/lib/datetime'
import { criarLogger } from '@/lib/logger'
import type { ContaFixa, PreferenciasUsuario } from '@/types'

const log = criarLogger('cron:vencimentos')

export async function GET(request: Request) {
  const naoAutorizado = verifyCronRequest(request)
  if (naoAutorizado) return naoAutorizado

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase URL ou Service Key ausentes')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Data de amanhã (fuso de Brasília) no formato YYYY-MM-DD
    const dataAlvo = dataBrasilMaisDias(1)

    // Buscar contas que vencem amanhã e ainda não foram pagas
    const { data, error } = await supabase
      .from('contas_fixas')
      .select('*')
      .eq('pago', false)
      .eq('data_vencimento', dataAlvo)

    if (error) throw error

    const contas = (data ?? []) as ContaFixa[]
    if (contas.length === 0) {
      return NextResponse.json({ message: 'Nenhuma conta para amanhã' })
    }

    // Agrupar por usuário
    const contasPorUser = contas.reduce<Record<string, ContaFixa[]>>((acc, conta) => {
      ;(acc[conta.user_id] ??= []).push(conta)
      return acc
    }, {})

    // Chat de destino de cada usuário (fallback: TELEGRAM_CHAT_ID)
    const userIds = Object.keys(contasPorUser)
    const { data: prefsList } = await supabase
      .from('preferencias_usuario')
      .select('user_id, telegram_chat_id')
      .in('user_id', userIds)
    const chatPorUser: Record<string, string | null | undefined> = {}
    ;((prefsList ?? []) as Pick<PreferenciasUsuario, 'user_id' | 'telegram_chat_id'>[]).forEach(p => {
      chatPorUser[p.user_id] = p.telegram_chat_id
    })

    let envios = 0

    for (const userId of userIds) {
      const contasUser = contasPorUser[userId]
      let msg = `📅 <b>Lembrete de Vencimento!</b>\n\nVocê tem ${contasUser.length} conta(s) vencendo amanhã (${formatDate(dataAlvo)}):\n\n`

      let total = 0
      contasUser.forEach(c => {
        msg += `🔹 <b>${c.descricao}</b>: ${formatBRL(Number(c.valor))}\n`
        total += Number(c.valor)
      })

      msg += `\n💰 <b>Total a pagar amanhã: ${formatBRL(total)}</b>`

      await sendTelegramMessage(msg, {
        userId,
        chatId: chatPorUser[userId],
        titulo: `Vencimentos de ${formatDate(dataAlvo)}`,
      })
      envios++
    }

    log.info('Cron concluído', { contasEncontradas: contas.length, mensagensEnviadas: envios })
    return NextResponse.json({
      success: true,
      contasEncontradas: contas.length,
      mensagensEnviadas: envios,
    })
  } catch (error) {
    log.error('Erro no cron de vencimentos', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno' },
      { status: 500 }
    )
  }
}
