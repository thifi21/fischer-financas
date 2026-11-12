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
    const isCreditCard = accountType === 'CREDIT'

    // Para conta bancária (ex.: Caixa), buscamos desde o dia 01 do mês até hoje para calcular com exatidão
    // o saldo da conta no dia 01/MM/AAAA a partir do saldo atual (currentBalance - soma das transações desde 01/MM/AAAA).
    const queryEnd = isCreditCard ? to : '2099-12-31'

    const todasTransacoes: any[] = []
    let nextQuery: string | null =
      `?accountId=${encodeURIComponent(accountId)}&dateFrom=${from}&dateTo=${queryEnd}`
    let paginas = 0
    while (nextQuery && paginas < 20) {
      const txRes: Response = await fetch(`${PLUGGY_API}/v2/transactions${nextQuery}`, {
        headers: { 'X-API-KEY': apiKey },
        cache: 'no-store',
      })
      if (!txRes.ok) {
        const detalhe = await txRes.text().catch(() => '')
        console.error('Pluggy /v2/transactions erro', txRes.status, detalhe)
        return NextResponse.json({ error: `Não foi possível buscar as transações na Pluggy (HTTP ${txRes.status}).` }, { status: 502 })
      }
      const txJson: { results?: any[]; next?: string | null } = await txRes.json()
      todasTransacoes.push(...(txJson.results || []))
      const nxt: string | null = txJson.next || null
      nextQuery = nxt ? (nxt.startsWith('?') ? nxt : nxt.includes('?') ? nxt.slice(nxt.indexOf('?')) : `?${nxt}`) : null
      paginas++
    }

    // Calcula e grava o Saldo em Conta em 01/MM/AAAA quando for conta bancária (BANK)
    let saldoDia01: number | null = null
    if (!isCreditCard) {
      const accRes = await fetch(`${PLUGGY_API}/accounts/${encodeURIComponent(accountId)}`, {
        headers: { 'X-API-KEY': apiKey },
        cache: 'no-store',
      })
      if (accRes.ok) {
        const accJson = await accRes.json()
        const currentBalance = Number(accJson.balance || 0)
        const somaDesdeDia01 = todasTransacoes.reduce((acc, t) => acc + Number(t.amount || 0), 0)
        saldoDia01 = Math.round((currentBalance - somaDesdeDia01) * 100) / 100

        // Atualiza ou cria o Saldo Inicial (01/MM/AAAA) na aba Extrato da Conta
        const { data: saldoExistente } = await supabase
          .from('entradas')
          .select('id')
          .eq('user_id', user.id)
          .eq('mes', mes)
          .eq('ano', ano)
          .eq('categoria', 'saldo_inicial')
          .maybeSingle()

        const payloadSaldo = {
          user_id: user.id,
          mes,
          ano,
          descricao: 'Saldo Inicial',
          valor: saldoDia01,
          categoria: 'saldo_inicial',
          data_entrada: from,
          oculto_extrato: false,
        }
        if (saldoExistente?.id) {
          await supabase.from('entradas').update(payloadSaldo).eq('id', saldoExistente.id).eq('user_id', user.id)
        } else {
          await supabase.from('entradas').insert(payloadSaldo)
        }
      }
    }

    // Filtra apenas as transações pertencentes ao mês/ano solicitado
    const results = todasTransacoes.filter(tx => {
      const dataIso = String(tx.date || '').slice(0, 10)
      return dataIso >= from && dataIso <= to
    })

    if (results.length === 0) {
      return NextResponse.json({ error: 'Nenhuma transação encontrada neste período para esta conta.' }, { status: 422 })
    }

    const lancamentos = results
      .filter(tx => Number(tx.amount) !== 0)
      .map(tx => {
        const dataIso = String(tx.date || from).slice(0, 10)
        const base = String(tx.description || tx.descriptionRaw || 'Lançamento Open Finance')
        // Enriquecer descrições genéricas (ex.: "DEB PIX QR COD EST") com o nome do recebedor/estabelecimento ou pagador
        const favorecido: string =
          tx.paymentData?.receiver?.name ||
          tx.merchant?.businessName ||
          tx.merchant?.name ||
          tx.paymentData?.payer?.name ||
          ''
        const bruto =
          favorecido && !base.toLowerCase().includes(favorecido.toLowerCase())
            ? `${base} - ${favorecido}`
            : base
        const { descricaoLimpa, parcela } = extrairParcelaDaDescricao(bruto)
        const parcelaMeta =
          tx.creditCardMetadata?.installmentNumber && tx.creditCardMetadata?.totalInstallments
            ? `${String(tx.creditCardMetadata.installmentNumber).padStart(2, '0')}/${String(tx.creditCardMetadata.totalInstallments).padStart(2, '0')}`
            : parcela

        // Cartão de crédito: compras vêm com type DEBIT (valor positivo); pagamentos/estornos com type CREDIT.
        // Conta bancária: CREDIT/valor positivo = entrada; DEBIT/valor negativo = saída.
        const tipo: 'debito' | 'credito' = isCreditCard
          ? tx.type === 'CREDIT' ? 'credito' : 'debito'
          : tx.type === 'CREDIT' || Number(tx.amount) > 0
            ? 'credito'
            : 'debito'

        let descricaoFinal = descricaoLimpa
        let categoriaFinal = categorizarPorDescricao(descricaoLimpa)

        // Na conta bancária, apenas os salários da OBR (Nayara: salário e adiantamento) e da Implatec (Thiago)
        // entram como 'salario' (para alimentar a aba Salários). Demais créditos entram como 'extrato_entrada'.
        if (!isCreditCard && tipo === 'credito') {
          const payerDoc = String(tx.paymentData?.payer?.documentNumber?.value || '').replace(/\D/g, '')
          const payerName = String(tx.paymentData?.payer?.name || '')
          const textoSalario = `${base} ${payerName} ${tx.operationType || ''}`.toLowerCase()
          const isPortabilidadeSalario =
            tx.operationType === 'PORTABILIDADE_SALARIO' ||
            /ted\s*salario|cred\s*salario|portabilidade\s*salario/i.test(textoSalario)
          const dia = parseInt(dataIso.slice(8, 10), 10) || 1

          if (
            /implatec/i.test(textoSalario) ||
            (isPortabilidadeSalario && (payerDoc === '04630489975' || /thiago\s*fischer/i.test(payerName)))
          ) {
            descricaoFinal = 'Salário Thiago - Implatec'
            categoriaFinal = 'salario'
          } else if (
            /\bobr\b/i.test(textoSalario) ||
            (isPortabilidadeSalario && (payerDoc === '06798499988' || /nayara/i.test(textoSalario) || payerDoc !== '04630489975'))
          ) {
            descricaoFinal = dia >= 15 || /adiant/i.test(textoSalario)
              ? 'Adiantamento Nayara - OBR'
              : 'Salário Nayara - OBR'
            categoriaFinal = 'salario'
          } else {
            categoriaFinal = 'extrato_entrada'
          }
        }

        return {
          data: dataIso,
          descricao: descricaoFinal,
          valor: Math.abs(Number(tx.amount)),
          tipo,
          categoria: categoriaFinal,
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
      saldoDia01,
      total: lancamentosComId.length,
      lancamentos: lancamentosComId,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Erro interno' }, { status: 500 })
  }
}

