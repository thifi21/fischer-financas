import { NextRequest, NextResponse } from 'next/server'
import { enforceRateLimit, requireApiUser } from '@/lib/api-auth'

export async function POST(req: NextRequest) {
  const auth = await requireApiUser(req)
  if (auth.error) return auth.error
  const limited = await enforceRateLimit(auth.supabase, 'open-finance-sync', 5, 60)
  if (limited) return limited

  let body: { importacaoId?: unknown; mes?: unknown; ano?: unknown; itens?: unknown }
  try { body = await req.json() }
  catch { return NextResponse.json({ error: 'Solicitação inválida' }, { status: 400 }) }
  if (typeof body.importacaoId !== 'string' ||
      !/^[0-9a-f-]{36}$/i.test(body.importacaoId) ||
      !Number.isInteger(body.mes) || Number(body.mes) < 1 || Number(body.mes) > 12 ||
      !Number.isInteger(body.ano) || Number(body.ano) < 2000 || Number(body.ano) > 2100 ||
      !Array.isArray(body.itens) || body.itens.length > 500) {
    return NextResponse.json({ error: 'Dados da importação inválidos' }, { status: 400 })
  }

  const { data, error } = await auth.supabase.rpc('sincronizar_importacao', {
    p_importacao_id: body.importacaoId,
    p_mes: body.mes,
    p_ano: body.ano,
    p_itens: body.itens,
  })
  if (error) {
    console.error('Falha ao sincronizar importação:', error)
    return NextResponse.json({ error: error.code === '42883'
      ? 'Aplique a migração 008 no Supabase antes de sincronizar.'
      : 'A importação não foi gravada. Confira as escolhas e tente novamente.' }, { status: 422 })
  }
  return NextResponse.json({ sincronizados: data })
}
