import { NextRequest, NextResponse } from 'next/server'
import { enforceRateLimit, requireApiUser } from '@/lib/api-auth'
import { extrairParcelaDaDescricao } from '@/lib/ofx-parser'

const PLUGGY_API = 'https://api.pluggy.ai'

async function getPluggyApiKey(): Promise<string> {
  const clientId = process.env.PLUGGY_CLIENT_ID
  const clientSecret = process.env.PLUGGY_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    throw new Error('PLUGGY_NOT_CONFIGURED')
  }

  const res = await fetch(`${PLUGGY_API}/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientId, clientSecret }),
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error('Credenciais da Pluggy inválidas. Verifique PLUGGY_CLIENT_ID e PLUGGY_CLIENT_SECRET no .env.local')
  }
  const data = await res.json()
  return data.apiKey as string
}

function categorizarPorDescricao(desc: string): string {
  const d = desc.toLowerCase()
  if (/mercado|supermercado|padaria|restaurante|ifood|lanche|hortifruti|acougue/.test(d)) return 'alimentacao'
  if (/posto|combustivel|gasolina|etanol|uber|99|pedagio|ipiranga|shell|petrobras/.test(d)) return 'transporte'
  if (/farmacia|drogaria|hospital|clinica|medico|dentista|unimed/.test(d)) return 'saude'
  if (/escola|faculdade|curso|livraria/.test(d)) return 'educacao'
  if (/energia|celesc|agua|sanepar|casan|internet|telecom|condominio|aluguel|claro|vivo|tim/.test(d)) return 'moradia'
  if (/salario|remuneracao|vencimento|pro-labore/.test(d)) return 'salario'
  if (/fatura|cartao/.test(d)) return 'cartao'
  return 'outros'
}

// GET /api/open-finance/pluggy -> lista contas e cartões disponíveis nos PLUGGY_ITEM_IDS (ou do item informado via ?itemId=)
export async function GET(req: NextRequest) {
  try {
    const auth = await requireApiUser(req)
    if (auth.error) return auth.error

    const configurado = Boolean(process.env.PLUGGY_CLIENT_ID && process.env.PLUGGY_CLIENT_SECRET)
    if (!configurado) {
      return NextResponse.json({ configured: false, accounts: [] })
    }

    const apiKey = await getPluggyApiKey()

    // Se pediu apenas um connectToken para abrir o Widget do Pluggy Connect (e vincular o MeuPluggy)
    if (req.nextUrl.searchParams.get('connectToken') === '1') {
      const ctRes = await fetch(`${PLUGGY_API}/connect_token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-KEY': apiKey },
        body: JSON.stringify({}),
        cache: 'no-store',
      })
      const ctData = await ctRes.json()
      if (!ctRes.ok || !ctData.accessToken) {
        return NextResponse.json({ error: 'Não foi possível gerar o Connect Token da Pluggy' }, { status: 502 })
      }
      return NextResponse.json({ connectToken: ctData.accessToken })
    }

    const queryRaw = req.nextUrl.searchParams.get('itemId') || ''
    const extrairUuid = (raw: string): string | null => {
      const m = raw.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i)
      return m ? m[0] : (raw.trim() || null)
    }
    const queryItems = queryRaw
      .split(',')
      .map(s => extrairUuid(s))
      .filter((s): s is string => Boolean(s))
    const envItems = (process.env.PLUGGY_ITEM_IDS || '')
      .split(',')
      .map(s => extrairUuid(s))
      .filter((s): s is string => Boolean(s))

    const itemIds = Array.from(new Set([...queryItems, ...envItems]))
    const accounts: {
      id: string
      name: string
      type: string
      subtype: string
      number: string
      balance: number
      institution: string
    }[] = []

    const seenAccountKeys = new Set<string>()

    for (const itemId of itemIds) {
      const accRes = await fetch(`${PLUGGY_API}/accounts?itemId=${encodeURIComponent(itemId)}`, {
        headers: { 'X-API-KEY': apiKey },
        cache: 'no-store',
      })
      if (!accRes.ok) continue
      const accData = await accRes.json()
      for (const a of accData.results || []) {
        const name = a.name || a.marketingName || 'Conta / Cartão'
        const number = a.number || ''
        const dedupKey = `${a.type}:${name}:${number}`
        if (seenAccountKeys.has(a.id) || seenAccountKeys.has(dedupKey)) continue
        seenAccountKeys.add(a.id)
        seenAccountKeys.add(dedupKey)

        accounts.push({
          id: a.id,
          name,
          type: a.type, // BANK ou CREDIT
          subtype: a.subtype || '',
          number,
          balance: Number(a.balance || 0),
          institution: a.bankData?.transferNumber || name || 'Open Finance',
        })
      }
    }

    return NextResponse.json({
      configured: true,
      itemIds,
      accounts,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Erro ao consultar Pluggy' }, { status: 500 })
  }
}

// POST /api/open-finance/pluggy -> busca transações de uma accountId no mês/ano e cria uma importação pronta para revisar/sincronizar
export async function POST(req: NextRequest) {
  try {
    const auth = await requireApiUser(req)
    if (auth.error) return auth.error
    const { supabase, user } = auth

    const limited = await enforceRateLimit(user.id, 'pluggy-fetch', 10, 60)
    if (limited) return limited

    const body = await req.json()
    const accountId = String(body.accountId || '').trim()
    const accountName = String(body.accountName || 'Open Finance Pluggy').trim()
    const accountType = String(body.accountType || 'BANK').trim()
    const mes = Number(body.mes)
    const ano = Number(body.ano)

    if (!accountId || !Number.isInteger(mes) || mes < 1 || mes > 12 || !Number.isInteger(ano)) {
      return NextResponse.json({ error: 'Selecione uma conta/cartão e um período válido.' }, { status: 400 })
    }

    const apiKey = await getPluggyApiKey()
    const from = `${ano}-${String(mes).padStart(2, '0')}-01`
    const ultimoDia = new Date(ano, mes, 0).getDate()
    const to = `${ano}-${String(mes).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`

    const txRes = await fetch(
      `${PLUGGY_API}/transactions?accountId=${encodeURIComponent(accountId)}&from=${from}&to=${to}&pageSize=500`,
      { headers: { 'X-API-KEY': apiKey }, cache: 'no-store' }
    )
    if (!txRes.ok) {
      return NextResponse.json({ error: 'Não foi possível buscar as transações na Pluggy.' }, { status: 502 })
    }

    const txJson = await txRes.json()
    const results: any[] = txJson.results || []
    if (results.length === 0) {
      return NextResponse.json({ error: 'Nenhuma transação encontrada neste período para esta conta.' }, { status: 422 })
    }

    const lancamentos = results
      .filter(tx => Number(tx.amount) !== 0)
      .map(tx => {
        const bruto = String(tx.description || tx.descriptionRaw || 'Lançamento Open Finance')
        const { descricaoLimpa, parcela } = extrairParcelaDaDescricao(bruto)
        const parcelaMeta =
          tx.creditCardMetadata?.installmentNumber && tx.creditCardMetadata?.totalInstallments
            ? `${String(tx.creditCardMetadata.installmentNumber).padStart(2, '0')}/${String(tx.creditCardMetadata.totalInstallments).padStart(2, '0')}`
            : parcela

        // Em cartão de crédito (CREDIT), compras vêm como DEBIT ou valor positivo; tratamos compras como 'debito'
        const isCreditCard = accountType === 'CREDIT'
        const tipo: 'debito' | 'credito' = isCreditCard
          ? 'debito'
          : tx.type === 'CREDIT' || Number(tx.amount) > 0
            ? 'credito'
            : 'debito'

        return {
          data: String(tx.date || from).slice(0, 10),
          descricao: descricaoLimpa,
          valor: Math.abs(Number(tx.amount)),
          tipo,
          categoria: categorizarPorDescricao(descricaoLimpa),
          parcela: parcelaMeta,
        }
      })

    const { data: importacao, error: impErr } = await supabase
      .from('importacoes_ofx')
      .insert({
        user_id: user.id,
        banco: `Open Finance · ${accountName}`,
        arquivo_nome: `pluggy_${from}_${to}`,
        total_lancamentos: lancamentos.length,
        sincronizados: 0,
        status: 'pendente',
      })
      .select()
      .single()

    if (impErr || !importacao) {
      return NextResponse.json({ error: 'Erro ao registrar importação: ' + (impErr?.message || '') }, { status: 500 })
    }

    const inserts = lancamentos.map(l => ({
      importacao_id: importacao.id,
      user_id: user.id,
      data_transacao: l.data,
      descricao: l.descricao,
      valor: l.valor,
      tipo: l.tipo,
      categoria: l.categoria,
      destino: 'nao_sincronizado',
      sincronizado: false,
    }))

    const { data: inseridos, error: lancErr } = await supabase
      .from('lancamentos_importados')
      .insert(inserts)
      .select('id, data_transacao, descricao, valor, tipo, categoria')

    if (lancErr || !inseridos) {
      return NextResponse.json({ error: 'Erro ao salvar transações: ' + (lancErr?.message || '') }, { status: 500 })
    }

    const lancamentosComId = inseridos.map((row, idx) => ({
      id: row.id,
      data: row.data_transacao,
      descricao: row.descricao,
      valor: Number(row.valor),
      tipo: row.tipo as 'debito' | 'credito',
      categoria: row.categoria,
      parcela: lancamentos[idx]?.parcela ?? null,
    }))

    return NextResponse.json({
      importacaoId: importacao.id,
      banco: `Open Finance · ${accountName}`,
      accountType,
      total: lancamentosComId.length,
      lancamentos: lancamentosComId,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Erro interno' }, { status: 500 })
  }
}

