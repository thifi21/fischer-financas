'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { useMes } from '@/context/MesContext'
import { formatBRL, formatDate, formatVencimento } from '@/lib/utils'
import { notificarPagamento } from '@/lib/notifications'
import { MESES, NOMES_CARTOES, ORDEM_CARTOES, LOGOS_CARTOES, type Cartao, type LancamentoCartao } from '@/types'
import DriveUploadModal from '@/components/DriveUploadModal'

type ModalState =
  | { tipo: 'cartao'; dados?: Cartao }
  | { tipo: 'lancamento'; cartaoId: string; cartaoNome: string; dados?: LancamentoCartao }
  | null

let cachedUserId: string | null = null

// ── Analisa campo parcela e extrai atual/total ────────────────────
// Aceita formatos: "01/12", "1/12", "01 de 12", "1 de 12"
function parseParcela(parcela: string): { atual: number; total: number } | null {
  if (!parcela?.trim()) return null
  const clean = parcela.trim().replace(/\s+de\s+/i, '/')
  const match = clean.match(/^(\d+)\/(\d+)$/)
  if (!match) return null
  const atual = parseInt(match[1])
  const total = parseInt(match[2])
  if (isNaN(atual) || isNaN(total) || atual < 1 || total < 1 || atual > total) return null
  return { atual, total }
}

// ── Avança mês (trata virada de ano) ─────────────────────────────
function proximoMesAno(mes: number, ano: number): { mes: number; ano: number } {
  return mes === 12
    ? { mes: 1, ano: ano + 1 }
    : { mes: mes + 1, ano }
}

// ── Formata parcela como "02/12" ──────────────────────────────────
function formatParcela(atual: number, total: number): string {
  return `${String(atual).padStart(2, '0')}/${String(total).padStart(2, '0')}`
}

export default function CartoesPage() {
  const supabase  = createClient()
  
  const { mes, ano } = useMes()

  const [cartoes, setCartoes]                       = useState<Cartao[]>([])
  const [todosLancamentos, setTodosLancamentos]     = useState<Record<string, LancamentoCartao[]>>({})
  const [expandidos, setExpandidos]                 = useState<Set<string>>(new Set())
  const [loading, setLoading]                       = useState(true)
  const [modal, setModal]                           = useState<ModalState>(null)
  const [form, setForm]                             = useState<any>({})
  const [saving, setSaving]                         = useState(false)
  const [parcelasPreview, setParcelasPreview]       = useState<string[]>([])
  const [driveModal, setDriveModal]                 = useState<{ cartao: Cartao } | null>(null)
  const userIdRef = useRef<string | null>(cachedUserId)

  // ── Init ──────────────────────────────────────────────────────
  useEffect(() => {
    async function init() {
      if (!userIdRef.current) {
        const { data: { user } } = await supabase.auth.getUser()
        userIdRef.current = user?.id ?? null
        cachedUserId      = user?.id ?? null
      }
      carregarTudo()
    }
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => { setExpandidos(new Set()) }, [mes])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (userIdRef.current) carregarTudo() }, [mes])

  // ── Atualiza preview de parcelas ao digitar ───────────────────
  useEffect(() => {
    if (modal?.tipo !== 'lancamento' || form.id) {
      setParcelasPreview([])
      return
    }
    const parsed = parseParcela(form.parcela || '')
    if (!parsed || parsed.atual === parsed.total) {
      setParcelasPreview([])
      return
    }
    const faltam = parsed.total - parsed.atual
    const preview: string[] = []
    let m = mes, a = ano
    for (let i = 1; i <= Math.min(faltam, 5); i++) {
      const next = proximoMesAno(m, a)
      m = next.mes; a = next.ano
      const label = a !== ano
        ? `${MESES[m - 1]} ${a} — parcela ${formatParcela(parsed.atual + i, parsed.total)}`
        : `${MESES[m - 1]} — parcela ${formatParcela(parsed.atual + i, parsed.total)}`
      preview.push(label)
    }
    if (faltam > 5) preview.push(`... mais ${faltam - 5} parcela(s)`)
    setParcelasPreview(preview)
  }, [form.parcela, mes, ano, modal])

  // ── Carregamento ──────────────────────────────────────────────
  async function carregarTudo() {
    const uid = userIdRef.current
    if (!uid) return
    setLoading(true)
    const [{ data: cartoesData }, { data: lancsData }] = await Promise.all([
      supabase.from('cartoes').select('*').eq('user_id', uid).eq('mes', mes).eq('ano', ano),
      supabase.from('lancamentos_cartao').select('*').eq('user_id', uid).eq('mes', mes).eq('ano', ano).order('data_compra'),
    ])
    const ordenados = (cartoesData || []).sort((a, b) =>
      (ORDEM_CARTOES[a.nome] ?? 99) - (ORDEM_CARTOES[b.nome] ?? 99)
    )
    setCartoes(ordenados)
    const agrupado: Record<string, LancamentoCartao[]> = {}
    for (const l of lancsData || []) {
      if (!agrupado[l.cartao_id]) agrupado[l.cartao_id] = []
      agrupado[l.cartao_id].push(l)
    }
    setTodosLancamentos(agrupado)
    setLoading(false)
  }

  function toggleExpandido(cartaoId: string) {
    setExpandidos(prev => {
      const next = new Set(prev)
      next.has(cartaoId) ? next.delete(cartaoId) : next.add(cartaoId)
      return next
    })
  }

  async function recalcularTotal(cartaoId: string, lista: LancamentoCartao[]) {
    const novoTotal = lista.reduce((s, l) => s + Number(l.valor), 0)
    setCartoes(prev => prev.map(c => c.id === cartaoId ? { ...c, valor: novoTotal } : c))
    await supabase.from('cartoes').update({ valor: novoTotal }).eq('id', cartaoId)
  }

  // ── Busca ou cria cartão em um mês/ano específico ─────────────
  async function obterCartaoFuturo(
    uid: string,
    nomeCartao: string,
    mesFuturo: number,
    anoFuturo: number,
    vencimento: string | null
  ): Promise<string> {
    // Busca cartão existente naquele mês
    const { data: existente } = await supabase
      .from('cartoes')
      .select('id')
      .eq('user_id', uid)
      .eq('nome', nomeCartao)
      .eq('mes', mesFuturo)
      .eq('ano', anoFuturo)
      .single()

    if (existente) return existente.id

    // Cria cartão novo naquele mês se não existir
    const { data: novo } = await supabase
      .from('cartoes')
      .insert({
        user_id: uid,
        nome: nomeCartao,
        mes: mesFuturo,
        ano: anoFuturo,
        vencimento: vencimento || null,
        valor: 0,
        pago: false,
      })
      .select('id')
      .single()

    return novo!.id
  }

  // ── CRUD Cartão ───────────────────────────────────────────────
  async function salvarCartao() {
    const uid = userIdRef.current
    if (!uid) return
    setSaving(true)
    const payload = {
      user_id: uid, mes, ano,
      nome: form.nome,
      vencimento: form.vencimento || null,
      valor: Number(form.valor || 0),
      pago: !!form.pago,
    }
    if (form.id) {
      const { data } = await supabase.from('cartoes').update(payload).eq('id', form.id).select().single()
      if (data) {
        setCartoes(prev => prev.map(c => c.id === form.id ? data : c))
        if (data.pago && !cartoes.find(c => c.id === data.id)?.pago) {
          notificarPagamento(data.nome, data.valor, '💳')
        }
      }
    } else {
      const { data } = await supabase.from('cartoes').insert(payload).select().single()
      if (data) {
        setCartoes(prev => [...prev, data].sort((a, b) =>
          (ORDEM_CARTOES[a.nome] ?? 99) - (ORDEM_CARTOES[b.nome] ?? 99)))
        if (data.pago) notificarPagamento(data.nome, data.valor, '💳')
      }
    }
    fecharModal()
    setSaving(false)
  }

  // ── CRUD Lançamento com propagação automática de parcelas ─────
  async function salvarLancamento() {
    const uid = userIdRef.current
    if (!uid || modal?.tipo !== 'lancamento') return
    setSaving(true)

    const cartaoId   = modal.cartaoId
    const cartaoNome = modal.cartaoNome
    // Pega vencimento do cartão atual para replicar nos futuros
    const cartaoAtual = cartoes.find(c => c.id === cartaoId)
    const vencimento  = cartaoAtual?.vencimento ?? null

    const payload = {
      user_id: uid,
      cartao_id: cartaoId,
      mes,
      ano,
      data_compra: form.data_compra || null,
      local: form.local,
      parcela: form.parcela || null,
      valor: Number(form.valor || 0),
      conferido: form.conferido ?? false,
    }

    if (form.id) {
      // Edição simples — só atualiza este lançamento
      const { data } = await supabase
        .from('lancamentos_cartao')
        .update(payload)
        .eq('id', form.id)
        .select()
        .single()
      const novaLista = (todosLancamentos[cartaoId] || [])
        .map(l => l.id === form.id ? (data ?? l) : l)
      setTodosLancamentos(prev => ({ ...prev, [cartaoId]: novaLista }))
      await recalcularTotal(cartaoId, novaLista)
    } else {
      // Novo lançamento — insere no mês atual
      const { data: lancAtual } = await supabase
        .from('lancamentos_cartao')
        .insert(payload)
        .select()
        .single()

      const novaLista = [...(todosLancamentos[cartaoId] || []), lancAtual!]
        .filter(Boolean)
        .sort((a, b) => (a.data_compra ?? '').localeCompare(b.data_compra ?? ''))

      setTodosLancamentos(prev => ({ ...prev, [cartaoId]: novaLista }))
      await recalcularTotal(cartaoId, novaLista)

      // ── Propaga parcelas futuras automaticamente ──────────────
      const parsed = parseParcela(form.parcela || '')
      if (parsed && parsed.atual < parsed.total) {
        const faltam = parsed.total - parsed.atual
        let mesFuturo = mes
        let anoFuturo = ano

        for (let i = 1; i <= faltam; i++) {
          const next = proximoMesAno(mesFuturo, anoFuturo)
          mesFuturo = next.mes
          anoFuturo = next.ano

          // Busca ou cria o cartão naquele mês
          const cartaoFuturoId = await obterCartaoFuturo(
            uid, cartaoNome, mesFuturo, anoFuturo, vencimento
          )

          // Insere a parcela futura
          await supabase.from('lancamentos_cartao').insert({
            user_id: uid,
            cartao_id: cartaoFuturoId,
            mes: mesFuturo,
            ano: anoFuturo,
            data_compra: form.data_compra || null,
            local: form.local,
            parcela: formatParcela(parsed.atual + i, parsed.total),
            valor: Number(form.valor || 0),
            conferido: false,
          })

          // Recalcula o total do cartão futuro
          const { data: lancsF } = await supabase
            .from('lancamentos_cartao')
            .select('valor')
            .eq('cartao_id', cartaoFuturoId)
          const totalF = (lancsF || []).reduce((s, r) => s + Number(r.valor), 0)
          await supabase.from('cartoes').update({ valor: totalF }).eq('id', cartaoFuturoId)
        }
      }
    }

    fecharModal()
    setSaving(false)
  }

  async function excluirLancamento(l: LancamentoCartao) {
    const parsed = parseParcela(l.parcela || '')
    const temParcelas = parsed && parsed.total > 1

    const msg = temParcelas
      ? `Excluir "${l.local}" (${l.parcela})?\n\nDeseja excluir apenas esta parcela ou TODAS as parcelas restantes?`
      : `Excluir "${l.local}" — ${formatBRL(l.valor)}?`

    if (!confirm(msg)) return

    if (temParcelas) {
      // Pergunta se exclui todas as parcelas
      const excluirTodas = confirm(
        `Excluir TODAS as ${parsed!.total} parcelas de "${l.local}"?\n\nOK = excluir todas\nCancelar = excluir só esta`
      )

      if (excluirTodas) {
        // Exclui todos os lançamentos com mesmo local e mesmo cartão (todos os meses)
        const uid = userIdRef.current
        if (uid) {
          // Busca cartões do mesmo nome em todos os meses
          const { data: cartoesDoNome } = await supabase
            .from('cartoes')
            .select('id')
            .eq('user_id', uid)
            .eq('nome', cartoes.find(c => c.id === l.cartao_id)?.nome ?? '')
            .eq('ano', l.ano)

          if (cartoesDoNome) {
            for (const c of cartoesDoNome) {
              // Remove lançamentos com mesmo local neste cartão
              await supabase
                .from('lancamentos_cartao')
                .delete()
                .eq('cartao_id', c.id)
                .eq('local', l.local)
                .eq('ano', l.ano)

              // Recalcula total
              const { data: lancsR } = await supabase
                .from('lancamentos_cartao')
                .select('valor')
                .eq('cartao_id', c.id)
              const total = (lancsR || []).reduce((s, r) => s + Number(r.valor), 0)
              await supabase.from('cartoes').update({ valor: total }).eq('id', c.id)
            }
          }
        }
        await carregarTudo()
        return
      }
    }

    // Exclui só esta parcela
    await supabase.from('lancamentos_cartao').delete().eq('id', l.id)
    const novaLista = (todosLancamentos[l.cartao_id] || []).filter(x => x.id !== l.id)
    setTodosLancamentos(prev => ({ ...prev, [l.cartao_id]: novaLista }))
    await recalcularTotal(l.cartao_id, novaLista)
  }

  async function togglePago(cartao: Cartao) {
    const novoPago = !cartao.pago
    setCartoes(prev => prev.map(c => c.id === cartao.id ? { ...c, pago: novoPago } : c))
    await supabase.from('cartoes').update({ pago: novoPago }).eq('id', cartao.id)
    if (novoPago) notificarPagamento(cartao.nome, cartao.valor, '💳')
  }

  async function toggleConferido(lancamento: LancamentoCartao) {
    const novoConferido = !lancamento.conferido
    // Atualiza localmente
    setTodosLancamentos(prev => ({
      ...prev,
      [lancamento.cartao_id]: (prev[lancamento.cartao_id] || []).map(l =>
        l.id === lancamento.id ? { ...l, conferido: novoConferido } : l
      )
    }))
    // Atualiza no banco
    await supabase
      .from('lancamentos_cartao')
      .update({ conferido: novoConferido })
      .eq('id', lancamento.id)
  }

  async function excluirCartao(cartao: Cartao) {
    const qtd = (todosLancamentos[cartao.id] || []).length
    if (!confirm(`Excluir "${cartao.nome}" e ${qtd} lançamento(s)?`)) return
    await supabase.from('lancamentos_cartao').delete().eq('cartao_id', cartao.id)
    await supabase.from('cartoes').delete().eq('id', cartao.id)
    setCartoes(prev => prev.filter(c => c.id !== cartao.id))
    setTodosLancamentos(prev => { const n = { ...prev }; delete n[cartao.id]; return n })
  }

  function abrirModalLancamento(cartao: Cartao, lancamento?: LancamentoCartao) {
    setForm(lancamento ? { ...lancamento } : {})
    setModal({ tipo: 'lancamento', cartaoId: cartao.id, cartaoNome: cartao.nome, dados: lancamento })
  }

  function fecharModal() { setModal(null); setForm({}); setParcelasPreview([]) }

  const totalMes   = cartoes.reduce((s, c) => s + Number(c.valor), 0)
  const totalLancs = Object.values(todosLancamentos).flat().length

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">💳 Cartões de Crédito</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {MESES[mes - 1]} {ano}
            {!loading && (
              <span className="ml-2 text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">
                {totalLancs} lançamentos
              </span>
            )}
          </p>
        </div>
        <button className="btn-primary" onClick={() => { setForm({ nome: NOMES_CARTOES[0] }); setModal({ tipo: 'cartao' }) }}>
          + Adicionar Cartão
        </button>
      </div>

      {/* Total */}
      <div className="card mb-5 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-gray-600 dark:text-gray-300 font-semibold">Total de Cartões em {MESES[mes - 1]}</span>
            {!loading && (
              <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                {cartoes.filter(c => c.pago).length} de {cartoes.length} pagos
              </div>
            )}
          </div>
          <span className="text-2xl font-bold text-blue-700 dark:text-blue-400">{formatBRL(totalMes)}</span>
        </div>
      </div>

      {/* Skeleton */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="card animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700" />
                  <div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-36 mb-2" />
                    <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-24" />
                  </div>
                </div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : cartoes.length === 0 ? (
        <div className="card text-center py-16 text-gray-400 dark:text-gray-500">
          <div className="text-4xl mb-3">💳</div>
          <p>Nenhum cartão cadastrado para {MESES[mes - 1]}.</p>
          <button className="btn-primary mt-4" onClick={() => { setForm({ nome: NOMES_CARTOES[0] }); setModal({ tipo: 'cartao' }) }}>
            Adicionar Cartão
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {cartoes.map(cartao => {
            const lancs    = todosLancamentos[cartao.id] || []
            const aberto   = expandidos.has(cartao.id)
            const subtotal = lancs.reduce((s, l) => s + Number(l.valor), 0)

            return (
              <div key={cartao.id} className="card hover:shadow-md transition-shadow">
                {/* Linha do cartão */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button onClick={() => togglePago(cartao)}
                      title={cartao.pago ? 'Marcar como pendente' : 'Marcar como pago'}
                      className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-sm transition-all flex-shrink-0 ${
                        cartao.pago ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-green-400'
                      }`}
                    >
                      {cartao.pago ? '✓' : ''}
                    </button>
                    {/* Logo do cartão */}
                    {LOGOS_CARTOES[cartao.nome] ? (
                      <div
                        className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 overflow-hidden"
                        style={{ backgroundColor: LOGOS_CARTOES[cartao.nome].bg }}
                      >
                        <img
                          src={LOGOS_CARTOES[cartao.nome].src}
                          alt={cartao.nome}
                          className="w-5 h-5 object-contain"
                          onError={e => {
                            const el = e.currentTarget
                            el.style.display = 'none'
                            if (el.parentElement) el.parentElement.innerHTML = '💳'
                          }}
                        />
                      </div>
                    ) : (
                      <span className="text-base flex-shrink-0">💳</span>
                    )}
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100">{cartao.nome}</div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {cartao.vencimento && (
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            Venc: {formatVencimento(cartao.vencimento)}
                          </span>
                        )}
                        <span className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 px-1.5 py-0.5 rounded">
                          {lancs.length} lançamento{lancs.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-lg font-bold ${cartao.pago ? 'text-green-600 line-through opacity-60' : 'text-gray-900 dark:text-gray-100'}`}>
                      {formatBRL(cartao.valor)}
                    </span>
                    <span className={cartao.pago ? 'badge-ok' : 'badge-pendente'}>
                      {cartao.pago ? 'Pago' : 'Pendente'}
                    </span>
                    <button onClick={() => toggleExpandido(cartao.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-400 hover:text-blue-600 transition-colors text-xs font-bold">
                      {aberto ? '▲' : '▼'}
                    </button>
                    <button onClick={() => setDriveModal({ cartao })} title="Enviar comprovante"
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-green-50 dark:hover:bg-green-900/30 text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                      ☁️
                    </button>
                    <button onClick={() => { setForm({ ...cartao }); setModal({ tipo: 'cartao' }) }} title="Editar cartão"
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-700 transition-colors">
                      ✏️
                    </button>
                    <button onClick={() => excluirCartao(cartao)} title="Excluir cartão"
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-300 hover:text-red-500 transition-colors">
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Lançamentos */}
                {aberto && (
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Lançamentos</span>
                        {lancs.length > 0 && (
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            subtotal: <span className="font-semibold text-blue-600 dark:text-blue-400">{formatBRL(subtotal)}</span>
                          </span>
                        )}
                      </div>
                      <button className="btn-primary text-xs px-3 py-1.5" onClick={() => abrirModalLancamento(cartao)}>
                        + Novo Lançamento
                      </button>
                    </div>

                    {lancs.length === 0 ? (
                      <div className="text-center py-6 text-gray-400 dark:text-gray-500 text-sm bg-gray-50 dark:bg-gray-800/40 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
                        Nenhum lançamento.{' '}
                        <button className="text-blue-500 hover:underline font-medium" onClick={() => abrirModalLancamento(cartao)}>
                          Adicionar primeiro lançamento
                        </button>
                      </div>
                    ) : (
                      <div className="rounded-lg border border-gray-100 dark:border-gray-800 overflow-hidden">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gray-50 dark:bg-gray-800 text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                              <th className="text-left px-3 py-2">Data</th>
                              <th className="text-left px-3 py-2">Local / Estabelecimento</th>
                              <th className="text-left px-3 py-2">Parcela</th>
                              <th className="text-right px-3 py-2">Valor</th>
                              <th className="text-center px-3 py-2 w-16">✓</th>
                              <th className="px-3 py-2 w-20">Ações</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                            {lancs.map(l => (
                              <tr key={l.id} className="hover:bg-blue-50/40 dark:hover:bg-gray-800/50 transition-colors group">
                                <td className="px-3 py-2.5 text-gray-500 dark:text-gray-400 whitespace-nowrap text-xs">
                                  {formatDate(l.data_compra)}
                                </td>
                                <td className="px-3 py-2.5 font-medium text-gray-800 dark:text-gray-200">{l.local}</td>
                                <td className="px-3 py-2.5 text-xs">
                                  {l.parcela ? (
                                    <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded font-mono">
                                      {l.parcela}
                                    </span>
                                  ) : (
                                    <span className="text-gray-300 dark:text-gray-600">—</span>
                                  )}
                                </td>
                                <td className="px-3 py-2.5 text-right font-semibold text-gray-900 dark:text-gray-100">
                                  {formatBRL(l.valor)}
                                </td>
                                <td className="px-3 py-2.5">
                                  <div className="flex items-center justify-center">
                                    <button
                                      onClick={() => toggleConferido(l)}
                                      className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                                        l.conferido
                                          ? 'bg-green-500 border-green-500 text-white hover:bg-green-600'
                                          : 'border-gray-300 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-500'
                                      }`}
                                      title={l.conferido ? 'Marcar como não conferido' : 'Marcar como conferido'}
                                    >
                                      {l.conferido && '✓'}
                                    </button>
                                  </div>
                                </td>
                                <td className="px-3 py-2.5">
                                  <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => abrirModalLancamento(cartao, l)} title="Editar"
                                      className="w-7 h-7 flex items-center justify-center rounded hover:bg-blue-100 dark:hover:bg-blue-900/40 text-gray-400 hover:text-blue-600 transition-colors">✏️</button>
                                    <button onClick={() => excluirLancamento(l)} title="Excluir"
                                      className="w-7 h-7 flex items-center justify-center rounded hover:bg-red-100 dark:hover:bg-red-900/40 text-gray-300 hover:text-red-500 transition-colors">🗑️</button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="bg-gray-50 dark:bg-gray-800 border-t-2 border-gray-200 dark:border-gray-700">
                              <td colSpan={4} className="px-3 py-2.5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Total</td>
                              <td className="px-3 py-2.5 text-right font-bold text-blue-700 dark:text-blue-400 text-base">{formatBRL(subtotal)}</td>
                              <td />
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* MODAL: Cartão */}
      {modal?.tipo === 'cartao' && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={e => e.target === e.currentTarget && fecharModal()}>
          <div className="bg-white dark:bg-gray-900 dark:border dark:border-gray-700 rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg text-gray-900 dark:text-gray-100">{form.id ? 'Editar Cartão' : 'Novo Cartão'}</h2>
              <button onClick={fecharModal} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="label">Nome do Cartão</label>
                <select className="input" value={form.nome || ''} onChange={e => setForm({ ...form, nome: e.target.value })}>
                  {NOMES_CARTOES.map(n => <option key={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Vencimento</label>
                <input className="input" value={form.vencimento || ''} onChange={e => setForm({ ...form, vencimento: e.target.value })} placeholder="ex: 10/03" />
              </div>
              <div>
                <label className="label">Valor Total da Fatura (R$)</label>
                <input type="number" step="0.01" min="0" className="input" value={form.valor || ''} onChange={e => setForm({ ...form, valor: e.target.value })} placeholder="0,00" />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input type="checkbox" id="pago_c" checked={!!form.pago} onChange={e => setForm({ ...form, pago: e.target.checked })} className="w-4 h-4 accent-green-500" />
                <label htmlFor="pago_c" className="text-sm text-gray-700 dark:text-gray-300">Fatura já paga</label>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button className="btn-secondary flex-1" onClick={fecharModal}>Cancelar</button>
              <button className="btn-primary flex-1" onClick={salvarCartao} disabled={saving || !form.nome}>{saving ? 'Salvando...' : 'Salvar'}</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Lançamento */}
      {modal?.tipo === 'lancamento' && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={e => e.target === e.currentTarget && fecharModal()}>
          <div className="bg-white dark:bg-gray-900 dark:border dark:border-gray-700 rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                {form.id ? 'Editar Lançamento' : 'Novo Lançamento'}
              </h2>
              <button onClick={fecharModal} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">✕</button>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
              Cartão: <span className="font-semibold text-gray-600 dark:text-gray-300">{modal.cartaoNome}</span>
            </p>

            <div className="space-y-3">
              <div>
                <label className="label">Data da Compra</label>
                <input type="date" className="input" value={form.data_compra || ''} onChange={e => setForm({ ...form, data_compra: e.target.value })} />
              </div>
              <div>
                <label className="label">Local / Estabelecimento</label>
                <input className="input" value={form.local || ''} onChange={e => setForm({ ...form, local: e.target.value })} placeholder="Ex: Shopee, Netflix, Mercadinho..." autoFocus />
              </div>
              <div>
                <label className="label">Parcela</label>
                <input
                  className="input"
                  value={form.parcela || ''}
                  onChange={e => setForm({ ...form, parcela: e.target.value })}
                  placeholder="Ex: 01/12 ou 01 de 12"
                />
                {/* Preview das parcelas que serão criadas automaticamente */}
                {parcelasPreview.length > 0 && !form.id && (
                  <div className="mt-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-lg px-3 py-2.5">
                    <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1.5 flex items-center gap-1">
                      <span>⚡</span>
                      Parcelas criadas automaticamente nos próximos meses:
                    </div>
                    <ul className="space-y-0.5">
                      {parcelasPreview.map((p, i) => (
                        <li key={i} className="text-xs text-blue-500 dark:text-blue-400 flex items-center gap-1.5">
                          <span className="text-blue-300">→</span> {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div>
                <label className="label">Valor por Parcela (R$)</label>
                <input type="number" step="0.01" min="0" className="input text-lg font-semibold" value={form.valor || ''} onChange={e => setForm({ ...form, valor: e.target.value })} placeholder="0,00" />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button className="btn-secondary flex-1" onClick={fecharModal}>Cancelar</button>
              <button
                className="btn-primary flex-1"
                onClick={salvarLancamento}
                disabled={saving || !form.local || !form.valor}
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⏳</span>
                    {parcelasPreview.length > 0 ? `Criando ${parcelasPreview.length + 1} parcelas...` : 'Salvando...'}
                  </span>
                ) : (
                  parcelasPreview.length > 0 && !form.id
                    ? `Adicionar + ${parcelasPreview.length} parcela(s)`
                    : form.id ? 'Salvar Alterações' : 'Adicionar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Drive Upload */}
      {driveModal && (
        <DriveUploadModal
          mes={mes}
          descricao={driveModal.cartao.nome}
          valor={driveModal.cartao.valor}
          onFechar={() => setDriveModal(null)}
        />
      )}
    </div>
  )
}
