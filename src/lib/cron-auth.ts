import { timingSafeEqual } from 'crypto'
import { NextResponse } from 'next/server'

/**
 * Valida a chamada do Vercel Cron.
 * Falha de forma segura: se CRON_SECRET não estiver configurada, NENHUMA
 * requisição é autorizada (evita o bypass com "Bearer undefined").
 * Retorna null quando autorizado, ou a NextResponse de erro.
 */
export function verifyCronRequest(request: Request): NextResponse | null {
  const secret = process.env.CRON_SECRET?.trim()
  if (!secret) {
    console.error('CRON_SECRET não configurada — requisição de cron recusada.')
    return NextResponse.json({ error: 'Cron não configurado' }, { status: 503 })
  }

  const header = request.headers.get('authorization') ?? ''
  const esperado = Buffer.from(`Bearer ${secret}`)
  const recebido = Buffer.from(header)

  const ok = esperado.length === recebido.length && timingSafeEqual(esperado, recebido)
  if (!ok) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
  return null
}
