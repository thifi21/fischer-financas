import { NextRequest, NextResponse } from 'next/server'
import { enforceRateLimit, requireApiUser } from '@/lib/api-auth'

type ItemSync = {
  id: string
  destino: 'entradas' | 'apenas_extrato' | 'contas_fixas' | 'combustivel' | 'cartoes' | 'ignorado' | 'quitar_conta' | 'quitar_cartao'
  cartao_id?: string
  conta_id?: string
  parcela?: string | null
}

function parseParcela(parcela: string | null | undefined): { atual: number; total: number } | null {
  if (!parcela?.trim()) return null
  const clean = parcela.trim().replace(/\s+de\s+/i, '/')
  const m = clean.match(/^(\d+)\/(\d+)$/)
  if (!m) return null
  const atual = parseInt(m[1], 10)
  const total = parseInt(m[2], 10)
  if (isNaN(atual) || isNaN(total) || atual < 1 || total < 1 || atual > total || total > 48) return null
  return { atual, total }
}

function formatParcela(atual: number, total: number): string {
  return `${String(atual).padStart(2, '0')}/${String(total).padStart(2, '0')}`
}

function proximoMesAno(mes: number, ano: number): { mes: number; ano: number } {
  return mes === 12 ? { mes: 1, ano: ano + 1 } : { mes: mes + 1, ano }
}

function normalizarTexto(s: string): string {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function mesmaDescricao(a: string, b: string): boolean {
  const na = normalizarTexto(a)
  const nb = normalizarTexto(b)
  if (!na || !nb) return false
  if (na === nb || na.includes(nb) || nb.includes(na)) return true
  const tokensA = na.split(' ').filter(t => t.length >= 4)
  const tokensB = nb.split(' ').filter(t => t.length >= 4)
  if (tokensA.length === 0 || tokensB.length === 0) return false
  return tokensA.some(t => tokensB.includes(t))
}

export async function POST(req: NextRequest) {
  const auth = await requireApiUser(req)
  if (auth.error) return auth.error
  const { supabase, user } = auth
  const limited = await enforceRateLimit(user.id, 'open-finance-sync', 5, 60)
  if (limited) return limited

  let body: { importacaoId?: unknown; mes?: unknown; ano?: unknown; modoImportacao?: unknown; itens?: unknown }
  try { body = await req.json() }
  catch { return NextResponse.json({ error: 'Solicitação inválida' }, { status: 400 }) }

  if (typeof body.importacaoId !== 'string' ||
      !/^[0-9a-f-]{36}$/i.test(body.importacaoId) ||
      !Number.isInteger(body.mes) || Number(body.mes) < 1 || Number(body.mes) > 12 ||
      !Number.isInteger(body.ano) || Number(body.ano) < 2000 || Number(body.ano) > 2100 ||
      !Array.isArray(body.itens) || body.itens.length > 500) {
    return NextResponse.json({ error: 'Dados da importação inválidos' }, { status: 400 })
  }

  const mes = Number(body.mes)
  const ano = Number(body.ano)
  const modoImportacao = body.modoImportacao === 'fatura_cartao' ? 'fatura_cartao' : 'extrato'
  const itens = body.itens as ItemSync[]

  // Se estamos sincronizando um Extrato Bancário, remove eventuais linhas antigas ocultas de `entradas`
  if (modoImportacao === 'extrato') {
    await supabase
      .from('entradas')
      .delete()
      .eq('user_id', user.id)
      .eq('mes', mes)
      .eq('ano', ano)
      .eq('oculto_extrato', true)
  }

  // 1) Processa baixas de contas/cartões existentes ("quitar_conta" e "quitar_cartao"),
  // grava movimentações do extrato bancário e evita duplicar lançamentos!
  let baixasRealizadas = 0
  let duplicadosIgnorados = 0
  let lancamentosExtratoCriados = 0
  const itensParaRpc = []
  const idsDuplicadosNoCartao = new Set<string>()
  const idsEntradasConsumidos = new Set<string>()

  // Carrega lançamentos importados, de cartão e entradas existentes no mês para checagem de duplicidade
  const [{ data: importadosMes }, { data: lancsExistentesMes }, { data: entradasExistentesMes }] = await Promise.all([
    supabase
      .from('lancamentos_importados')
      .select('id, descricao, valor, data_transacao, tipo, categoria')
      .eq('importacao_id', body.importacaoId)
      .eq('user_id', user.id),
    supabase
      .from('lancamentos_cartao')
      .select('id, cartao_id, local, valor, data_compra, parcela, conferido')
      .eq('user_id', user.id)
      .eq('mes', mes)
      .eq('ano', ano),
    supabase
      .from('entradas')
      .select('id, descricao, valor, data_entrada, categoria')
      .eq('user_id', user.id)
      .eq('mes', mes)
      .eq('ano', ano)
      .eq('oculto_extrato', false),
  ])

  const mapaImp = new Map((importadosMes || []).map(x => [x.id, x]))
  const lancsDoMes = lancsExistentesMes || []
  const entradasDoMes = entradasExistentesMes || []

  async function registrarMovimentoExtrato(
    imp: { descricao: string; valor: number; data_transacao: string; tipo: string },
    categoriaAlvo: 'salario' | 'extrato_entrada' | 'extrato_saida'
  ) {
    const valorAbs = Math.abs(Number(imp.valor))
    const dataIso = (imp.data_transacao || '').slice(0, 10)
    const jaExiste = entradasDoMes.find(ex => {
      if (idsEntradasConsumidos.has(ex.id)) return false
      if (ex.categoria !== categoriaAlvo) return false
      const mesmoValor = Math.abs(Number(ex.valor) - valorAbs) <= 0.02
      const mesmaData = (ex.data_entrada || '').slice(0, 10) === dataIso
      return mesmoValor && mesmaData && mesmaDescricao(ex.descricao, imp.descricao)
    })

    if (jaExiste) {
      idsEntradasConsumidos.add(jaExiste.id)
      duplicadosIgnorados++
      return false
    }

    const { error: errIns } = await supabase.from('entradas').insert({
      user_id: user.id,
      mes,
      ano,
      descricao: imp.descricao,
      valor: valorAbs,
      categoria: categoriaAlvo,
      data_entrada: dataIso,
      conferido: true,
      oculto_extrato: false,
    })
    if (!errIns) {
      lancamentosExtratoCriados++
      return true
    }
    return false
  }

  for (const item of itens) {
    const imp = mapaImp.get(item.id)

    if (item.destino === 'entradas' && imp) {
      // Na aba Salários entram apenas os salários oriundos da OBR (Nayara) ou da Implatec (Thiago)
      const descLower = (imp.descricao || '').toLowerCase()
      const ehSalarioObrOuImplatec =
        imp.categoria === 'salario' ||
        /\bobr\b|implatec|nayara|thiago.*implatec|ted\s*salario|cred\s*salario/i.test(descLower)
      const catAlvo = ehSalarioObrOuImplatec ? 'salario' : 'extrato_entrada'
      await registrarMovimentoExtrato(imp, catAlvo)
      itensParaRpc.push({ id: item.id, destino: 'ignorado' })
    } else if (item.destino === 'apenas_extrato' && imp) {
      const catAlvo = imp.tipo === 'credito' ? 'extrato_entrada' : 'extrato_saida'
      await registrarMovimentoExtrato(imp, catAlvo)
      itensParaRpc.push({ id: item.id, destino: 'ignorado' })
    } else if (item.destino === 'quitar_conta' && item.conta_id && /^[0-9a-f-]{36}$/i.test(item.conta_id)) {
      const { error } = await supabase
        .from('contas_fixas')
        .update({ pago: true, oculto_extrato: true })
        .eq('id', item.conta_id)
        .eq('user_id', user.id)
      if (!error) baixasRealizadas++
      if (modoImportacao === 'extrato' && imp) {
        await registrarMovimentoExtrato(imp, 'extrato_saida')
      }
      itensParaRpc.push({ id: item.id, destino: 'ignorado' })
    } else if (item.destino === 'quitar_cartao' && item.cartao_id && /^[0-9a-f-]{36}$/i.test(item.cartao_id)) {
      const { error } = await supabase
        .from('cartoes')
        .update({ pago: true, oculto_extrato: true })
        .eq('id', item.cartao_id)
        .eq('user_id', user.id)
      if (!error) baixasRealizadas++
      if (modoImportacao === 'extrato' && imp) {
        await registrarMovimentoExtrato(imp, 'extrato_saida')
      }
      itensParaRpc.push({ id: item.id, destino: 'ignorado' })
    } else if (item.destino === 'cartoes' && item.cartao_id) {
      // Verifica se já existe lançamento igual neste cartão/mês/ano para NÃO duplicar nem alterar
      const parsedParc = parseParcela(item.parcela)
      const parcFmt = parsedParc ? formatParcela(parsedParc.atual, parsedParc.total) : null

      const jaExiste = imp && lancsDoMes.find(ex => {
        if (ex.cartao_id !== item.cartao_id) return false
        const mesmoValor = Math.abs(Number(ex.valor) - Math.abs(Number(imp.valor))) <= 0.05
        if (!mesmoValor) return false
        const mesmaData = ex.data_compra && imp.data_transacao && ex.data_compra.slice(0, 10) === imp.data_transacao.slice(0, 10)
        const mesmaParc = parcFmt && ex.parcela && formatParcela(parseParcela(ex.parcela)?.atual || 0, parseParcela(ex.parcela)?.total || 0) === parcFmt
        return mesmaDescricao(ex.local, imp.descricao) || Boolean(mesmaData) || Boolean(mesmaParc)
      })

      if (jaExiste) {
        // Já existe no cartão: não altera valor nem duplica, apenas marca como conferido se ainda não estava
        if (!jaExiste.conferido) {
          await supabase.from('lancamentos_cartao').update({ conferido: true }).eq('id', jaExiste.id).eq('user_id', user.id)
        }
        duplicadosIgnorados++
        idsDuplicadosNoCartao.add(item.id)
        itensParaRpc.push({ id: item.id, destino: 'ignorado' })
      } else {
        itensParaRpc.push({
          id: item.id,
          destino: item.destino,
          cartao_id: item.cartao_id,
        })
      }
    } else {
      if (modoImportacao === 'extrato' && imp && (item.destino === 'combustivel' || item.destino === 'contas_fixas')) {
        await registrarMovimentoExtrato(imp, 'extrato_saida')
      }
      itensParaRpc.push({
        id: item.id,
        destino: item.destino,
        cartao_id: item.cartao_id,
      })
    }
  }

  // 2) Executa o RPC atômico para gravar entradas, contas_fixas novas, combustível e compras de cartão
  const { data: syncCount, error } = await supabase.rpc('sincronizar_importacao', {
    p_importacao_id: body.importacaoId,
    p_mes: mes,
    p_ano: ano,
    p_itens: itensParaRpc,
  })

  if (error) {
    console.error('Falha ao sincronizar importação:', error)
    return NextResponse.json({ error: error.code === '42883'
      ? 'Aplique a migração 008 no Supabase antes de sincronizar.'
      : 'A importação não foi gravada. Confira as escolhas e tente novamente.' }, { status: 422 })
  }

  // 3) Pós-processamento das compras de cartão com parcela (ex.: "01/06" -> grava parcela e propaga 02/06..06/06)
  let parcelasFuturasCriadas = 0
  const itensComParcela = itens.filter(i => i.destino === 'cartoes' && i.cartao_id && !idsDuplicadosNoCartao.has(i.id) && parseParcela(i.parcela))

  if (itensComParcela.length > 0) {
    const { data: importados } = await supabase
      .from('lancamentos_importados')
      .select('id, descricao, valor, data_transacao')
      .in('id', itensComParcela.map(i => i.id))
      .eq('user_id', user.id)

    const { data: cartoesMes } = await supabase
      .from('cartoes')
      .select('id, nome, vencimento')
      .eq('user_id', user.id)
      .eq('mes', mes)
      .eq('ano', ano)

    const mapaImportado = new Map((importados || []).map(x => [x.id, x]))
    const mapaCartao = new Map((cartoesMes || []).map(c => [c.id, c]))
    const cartoesFuturosAfetados = new Set<string>()

    for (const item of itensComParcela) {
      const imp = mapaImportado.get(item.id)
      const cartao = item.cartao_id ? mapaCartao.get(item.cartao_id) : undefined
      const parsed = parseParcela(item.parcela)
      if (!imp || !cartao || !parsed) continue

      const compraId = crypto.randomUUID()
      const parcelaAtualStr = formatParcela(parsed.atual, parsed.total)

      // Atualiza o lançamento recém-criado no mês atual com a parcela e o compra_id
      await supabase
        .from('lancamentos_cartao')
        .update({ parcela: parcelaAtualStr, compra_id: compraId })
        .eq('user_id', user.id)
        .eq('cartao_id', cartao.id)
        .eq('mes', mes)
        .eq('ano', ano)
        .eq('local', imp.descricao)
        .eq('valor', Math.abs(Number(imp.valor)))
        .is('parcela', null)

      // Propaga parcelas futuras (parsed.atual + 1 até parsed.total)
      const faltam = parsed.total - parsed.atual
      let m = mes
      let a = ano
      for (let i = 1; i <= faltam; i++) {
        const next = proximoMesAno(m, a)
        m = next.mes
        a = next.ano

        // Busca ou cria o cartão no mês futuro
        let cartaoFuturoId: string | null = null
        const { data: existente } = await supabase
          .from('cartoes')
          .select('id')
          .eq('user_id', user.id)
          .eq('nome', cartao.nome)
          .eq('mes', m)
          .eq('ano', a)
          .maybeSingle()

        if (existente?.id) {
          cartaoFuturoId = existente.id
        } else {
          const { data: novo } = await supabase
            .from('cartoes')
            .insert({
              user_id: user.id,
              nome: cartao.nome,
              mes: m,
              ano: a,
              vencimento: cartao.vencimento || null,
              valor: 0,
              pago: false,
            })
            .select('id')
            .single()
          cartaoFuturoId = novo?.id ?? null
        }

        if (!cartaoFuturoId) continue

        // Antes de inserir a parcela futura, verifica se ela já não existe naquele mês (não duplica!)
        const parcelaFuturaStr = formatParcela(parsed.atual + i, parsed.total)
        const { data: futExistentes } = await supabase
          .from('lancamentos_cartao')
          .select('id, local, valor, parcela')
          .eq('user_id', user.id)
          .eq('cartao_id', cartaoFuturoId)
          .eq('mes', m)
          .eq('ano', a)

        const jaTemFutura = (futExistentes || []).some(fe =>
          Math.abs(Number(fe.valor) - Math.abs(Number(imp.valor))) <= 0.05 &&
          (fe.parcela === parcelaFuturaStr || mesmaDescricao(fe.local, imp.descricao))
        )
        if (jaTemFutura) continue

        cartoesFuturosAfetados.add(cartaoFuturoId)

        const { error: errFut } = await supabase.from('lancamentos_cartao').insert({
          user_id: user.id,
          cartao_id: cartaoFuturoId,
          compra_id: compraId,
          mes: m,
          ano: a,
          data_compra: imp.data_transacao,
          local: imp.descricao,
          parcela: parcelaFuturaStr,
          valor: Math.abs(Number(imp.valor)),
          conferido: false,
        })
        if (!errFut) parcelasFuturasCriadas++
      }
    }

    // Recalcula o total de todos os cartões futuros afetados
    for (const cId of cartoesFuturosAfetados) {
      const { data: somaRows } = await supabase
        .from('lancamentos_cartao')
        .select('valor')
        .eq('cartao_id', cId)
        .eq('user_id', user.id)
      const soma = (somaRows || []).reduce((s, r) => s + Number(r.valor || 0), 0)
      await supabase.from('cartoes').update({ valor: Math.round(soma * 100) / 100 }).eq('id', cId).eq('user_id', user.id)
    }
  }

  return NextResponse.json({
    sincronizados: Number(syncCount || 0) + baixasRealizadas + lancamentosExtratoCriados,
    baixasRealizadas,
    lancamentosExtratoCriados,
    parcelasFuturasCriadas,
    duplicadosIgnorados,
  })
}
