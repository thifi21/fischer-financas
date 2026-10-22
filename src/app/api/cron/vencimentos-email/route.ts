import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { formatBRL, formatDate } from '@/lib/utils'
import { verifyCronRequest } from '@/lib/cron-auth'
import { dataBrasilMaisDias } from '@/lib/datetime'
import { criarLogger } from '@/lib/logger'
import type { Cartao, ContaFixa } from '@/types'

const log = criarLogger('cron:vencimentos-email')

const DIAS_ANTECEDENCIA = 5
const DESTINO_PADRAO = 'thifi21@gmail.com'

type Item = { nome: string; valor: number; tipo: 'Conta fixa' | 'Fatura de cartão' }

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function montarHtml(itens: Item[], dataAlvo: string) {
  const total = itens.reduce((s, i) => s + i.valor, 0)
  const linhas = itens
    .map(
      i => `<tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0">${escapeHtml(i.nome)}<br><small style="color:#64748b">${i.tipo}</small></td>
        <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:bold">${formatBRL(i.valor)}</td>
      </tr>`
    )
    .join('')
  return `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto">
    <h2 style="color:#1d4ed8">📅 Vencimentos em ${DIAS_ANTECEDENCIA} dias</h2>
    <p>Você tem ${itens.length} item(ns) não pago(s) vencendo em <b>${formatDate(dataAlvo)}</b>:</p>
    <table style="width:100%;border-collapse:collapse">${linhas}</table>
    <p style="font-size:16px"><b>Total: ${formatBRL(total)}</b></p>
    <p style="color:#94a3b8;font-size:12px">Fischer Finanças — aviso automático</p>
  </div>`
}

export async function GET(request: Request) {
  const naoAutorizado = verifyCronRequest(request)
  if (naoAutorizado) return naoAutorizado

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const resendKey = process.env.RESEND_API_KEY
    if (!supabaseUrl || !supabaseServiceKey) throw new Error('Supabase URL ou Service Key ausentes')
    if (!resendKey) throw new Error('RESEND_API_KEY ausente')

    const destino = process.env.EMAIL_AVISO_DESTINO || DESTINO_PADRAO
    const remetente = process.env.EMAIL_FROM || 'Fischer Finanças <onboarding@resend.dev>'

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const dataAlvo = dataBrasilMaisDias(DIAS_ANTECEDENCIA)

    const [contasRes, cartoesRes] = await Promise.all([
      supabase.from('contas_fixas').select('*').eq('pago', false).eq('data_vencimento', dataAlvo),
      supabase.from('cartoes').select('*').eq('pago', false).eq('vencimento', dataAlvo),
    ])
    if (contasRes.error) throw contasRes.error
    if (cartoesRes.error) throw cartoesRes.error

    const itens: Item[] = [
      ...((contasRes.data ?? []) as ContaFixa[]).map(c => ({
        nome: c.descricao, valor: Number(c.valor), tipo: 'Conta fixa' as const,
      })),
      ...((cartoesRes.data ?? []) as Cartao[]).map(c => ({
        nome: c.nome, valor: Number(c.valor), tipo: 'Fatura de cartão' as const,
      })),
    ]

    if (itens.length === 0) {
      return NextResponse.json({ message: `Nada vence em ${DIAS_ANTECEDENCIA} dias` })
    }

    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: remetente,
        to: [destino],
        subject: `📅 ${itens.length} vencimento(s) em ${DIAS_ANTECEDENCIA} dias (${formatDate(dataAlvo)})`,
        html: montarHtml(itens, dataAlvo),
      }),
    })
    if (!resp.ok) throw new Error(`Falha ao enviar e-mail: ${resp.status} ${await resp.text()}`)

    log.info('E-mail enviado', { itens: itens.length })
    return NextResponse.json({ success: true, itens: itens.length })
  } catch (error) {
    log.error('Erro no cron de vencimentos por e-mail', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno' },
      { status: 500 }
    )
  }
}
