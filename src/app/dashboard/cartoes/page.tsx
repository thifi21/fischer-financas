'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { formatBRL, formatDate, formatVencimento, getMesAtual, getAnoAtual } from '@/lib/utils'
import { MESES, NOMES_CARTOES, type Cartao, type LancamentoCartao } from '@/types'

type ModalState =
  | { tipo: 'cartao'; dados?: Cartao }
  | { tipo: 'lancamento'; cartaoId: string; cartaoNome: string; dados?: LancamentoCartao }
  | null

let cachedUserId: string | null = null

export default function CartoesPage() {
  const supabase = createClient()
  const ano = getAnoAtual()
  const [mes, setMes] = useState(getMesAtual())
  const [cartoes, setCartoes] = useState<Cartao[]>([])
  const [todosLancamentos, setTodosLancamentos] = useState<Record<string, LancamentoCartao[]>>({})
  const [expandidos, setExpandidos] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<ModalState>(null)
  const [form, setForm] = useState<any>({})
  const [saving, setSaving] = useState(false)
  const userIdRef = useRef<string | null>(cachedUserId)

  useEffect(() => {
    async function init() {
      if (!userIdRef.current) {
        const { data: { user } } = await supabase.auth.getUser()
        userIdRef.current = user?.id ?? null
        cachedUserId = user?.id ?? null
      }
      carregarTudo()
    }
    init()
  }, [])

  useEffect(() => {
    function handleMes(e: Event) {
      setMes((e as CustomEvent).detail as number)
      setExpandidos(new Set())
    }
    window.addEventListener('mesChange', handleMes)
    return () => window.removeEventListener('mesChange', handleMes)
  }, [])

  useEffect(() => {
    if (userIdRef.current) carregarTudo()
  }, [mes])

  // Carrega cartões + TODOS os lançamentos do mês em apenas 2 queries paralelas
  async function carregarTudo() {
    const uid = userIdRef.current
    if (!uid) return
    setLoading(true)

    const [{ data: cartoesData }, { data: lancsData }] = await Promise.all([
      supabase
        .from('cartoes')
        .select('*')
        .eq('user_id', uid)
        .eq('mes', mes)
        .eq('ano', ano)
        .order('nome'),
      supabase
        .from('lancamentos_cartao')
        .select('*')
        .eq('user_id', uid)
        .eq('mes', mes)
        .eq('ano', ano)
        .order('data_compra'),
    ])

    setCartoes(cartoesData || [])

    // Agrupa lançamentos por cartao_id localmente — zero queries adicionais
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

  // Atualiza o total do cartão localmente (instantâneo) e persiste no banco
  async function recalcularTotal(cartaoId: string, lista: LancamentoCartao[]) {
    const novoTotal = lista.reduce((s, l) => s + Number(l.valor), 0)
    setCartoes(prev => prev.map(c => c.id === cartaoId ? { ...c, valor: novoTotal } : c))
    await supabase.from('cartoes').update({ valor: novoTotal }).eq('id', cartaoId)
  }

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
      if (data) setCartoes(prev => prev.map(c => c.id === form.id ? data : c))
    } else {
      const { data } = await supabase.from('cartoes').insert(payload).select().single()
      if (data) setCartoes(prev => [...prev, data].sort((a, b) => a.nome.localeCompare(b.nome)))
    }
    fecharModal()
    setSaving(false)
  }

  async function salvarLancamento() {
    const uid = userIdRef.current
    if (!uid || modal?.tipo !== 'lancamento') return
    setSaving(true)
    const cartaoId = modal.cartaoId
    const payload = {
      user_id: uid, cartao_id: cartaoId, mes, ano,
      data_compra: form.data_compra || null,
      local: form.local,
      parcela: form.parcela || null,
      valor: Number(form.valor || 0),
    }

    let novaLista: LancamentoCartao[]
    if (form.id) {
      const { data } = await supabase.from('lancamentos_cartao').update(payload).eq('id', form.id).select().single()
      novaLista = (todosLancamentos[cartaoId] || []).map(l => l.id === form.id ? (data ?? l) : l)
    } else {
      const { data } = await supabase.from('lancamentos_cartao').insert(payload).select().single()
      novaLista = [...(todosLancamentos[cartaoId] || []), data!].filter(Boolean)
      novaLista.sort((a, b) => (a.data_compra ?? '').localeCompare(b.data_compra ?? ''))
    }

    setTodosLancamentos(prev => ({ ...prev, [cartaoId]: novaLista }))
    await recalcularTotal(cartaoId, novaLista)
    fecharModal()
    setSaving(false)
  }

  async function excluirLancamento(l: LancamentoCartao) {
    if (!confirm(`Excluir "${l.local}" — ${formatBRL(l.valor)}?`)) return
    await supabase.from('lancamentos_cartao').delete().eq('id', l.id)
    const novaLista = (todosLancamentos[l.cartao_id] || []).filter(x => x.id !== l.id)
    setTodosLancamentos(prev => ({ ...prev, [l.cartao_id]: novaLista }))
    await recalcularTotal(l.cartao_id, novaLista)
  }

  async function togglePago(cartao: Cartao) {
    const novoPago = !cartao.pago
    setCartoes(prev => prev.map(c => c.id === cartao.id ? { ...c, pago: novoPago } : c))
    await supabase.from('cartoes').update({ pago: novoPago }).eq('id', cartao.id)
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

  function fecharModal() { setModal(null); setForm({}) }

  const totalMes = cartoes.reduce((s, c) => s + Number(c.valor), 0)
  const totalLancs = Object.values(todosLancamentos).flat().length

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">💳 Cartões de Crédito</h1>
          <p className="text-gray-500 text-sm">
            {MESES[mes - 1]} {ano}
            {!loading && (
              <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                {totalLancs} lançamentos
              </span>
            )}
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={() => { setForm({ nome: NOMES_CARTOES[0] }); setModal({ tipo: 'cartao' }) }}
        >
          + Adicionar Cartão
        </button>
      </div>

      {/* Total do mês */}
      <div className="card mb-5 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-gray-600 dark:text-gray-300 font-semibold">Total de Cartões em {MESES[mes - 1]}</span>
            {!loading && (
              <div className="text-xs text-gray-400 mt-0.5">
                {cartoes.filter(c => c.pago).length} de {cartoes.length} pagos
              </div>
            )}
          </div>
          <span className="text-2xl font-bold text-blue-700">{formatBRL(totalMes)}</span>
        </div>
      </div>

      {/* Skeleton loading */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="card animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700" />
                  <div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-36 mb-2" />
                    <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-24" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 dark:bg-gray-700 rounded w-24" />
                  <div className="h-5 bg-gray-100 dark:bg-gray-800 rounded w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : cartoes.length === 0 ? (
        <div className="card text-center py-16 text-gray-400 dark:text-gray-500">
          <div className="text-4xl mb-3">💳</div>
          <p>Nenhum cartão cadastrado para {MESES[mes - 1]}.</p>
          <button
            className="btn-primary mt-4"
            onClick={() => { setForm({ nome: NOMES_CARTOES[0] }); setModal({ tipo: 'cartao' }) }}
          >
            Adicionar Cartão
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {cartoes.map(cartao => {
            const lancs = todosLancamentos[cartao.id] || []
            const aberto = expandidos.has(cartao.id)
            const subtotal = lancs.reduce((s, l) => s + Number(l.valor), 0)

            return (
              <div key={cartao.id} className="card hover:shadow-md transition-shadow">
                {/* Linha do cartão */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => togglePago(cartao)}
                      title={cartao.pago ? 'Marcar como pendente' : 'Marcar como pago'}
                      className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-sm transition-all flex-shrink-0 ${
                        cartao.pago
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-gray-300 hover:border-green-400'
                      }`}
                    >
                      {cartao.pago ? '✓' : ''}
                    </button>

                    <div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100">{cartao.nome}</div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {cartao.vencimento && (
                          <span className="text-xs text-gray-400 dark:text-gray-500">Venc: {formatVencimento(cartao.vencimento)}</span>
                        )}
                        <span className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 px-1.5 py-0.5 rounded">
                          {lancs.length} lançamento{lancs.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-lg font-bold ${cartao.pago ? 'text-green-600 line-through opacity-60' : 'text-gray-900'}`}>
                      {formatBRL(cartao.valor)}
                    </span>
                    <span className={cartao.pago ? 'badge-ok' : 'badge-pendente'}>
                      {cartao.pago ? 'Pago' : 'Pendente'}
                    </span>
                    <button
                      onClick={() => toggleExpandido(cartao.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-50 text-blue-400 hover:text-blue-600 transition-colors text-xs font-bold"
                    >
                      {aberto ? '▲' : '▼'}
                    </button>
                    <button
                      onClick={() => { setForm({ ...cartao }); setModal({ tipo: 'cartao' }) }}
                      title="Editar cartão"
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => excluirCartao(cartao)}
                      title="Excluir cartão"
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Painel de lançamentos */}
                {aberto && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-600">Lançamentos</span>
                        {lancs.length > 0 && (
                          <span className="text-xs text-gray-400">
                            subtotal: <span className="font-semibold text-blue-600">{formatBRL(subtotal)}</span>
                          </span>
                        )}
                      </div>
                      <button
                        className="btn-primary text-xs px-3 py-1.5"
                        onClick={() => abrirModalLancamento(cartao)}
                      >
                        + Novo Lançamento
                      </button>
                    </div>

                    {lancs.length === 0 ? (
                      <div className="text-center py-6 text-gray-400 dark:text-gray-500 text-sm bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
                        Nenhum lançamento.{' '}
                        <button
                          className="text-blue-500 hover:underline font-medium"
                          onClick={() => abrirModalLancamento(cartao)}
                        >
                          Adicionar primeiro lançamento
                        </button>
                      </div>
                    ) : (
                      <div className="rounded-lg border border-gray-100 overflow-hidden">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gray-50 dark:bg-gray-800 text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                              <th className="text-left px-3 py-2">Data</th>
                              <th className="text-left px-3 py-2">Local / Estabelecimento</th>
                              <th className="text-left px-3 py-2">Parcela</th>
                              <th className="text-right px-3 py-2">Valor</th>
                              <th className="px-3 py-2 w-20">Ações</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {lancs.map(l => (
                              <tr key={l.id} className="hover:bg-blue-50/40 dark:hover:bg-gray-800/50 transition-colors group">
                                <td className="px-3 py-2.5 text-gray-500 dark:text-gray-400 whitespace-nowrap text-xs">
                                  {formatDate(l.data_compra)}
                                </td>
                                <td className="px-3 py-2.5 font-medium text-gray-800 dark:text-gray-200">{l.local}</td>
                                <td className="px-3 py-2.5 text-xs text-gray-400 dark:text-gray-500">
                                  {l.parcela || '—'}
                                </td>
                                <td className="px-3 py-2.5 text-right font-semibold text-gray-900 dark:text-gray-100">
                                  {formatBRL(l.valor)}
                                </td>
                                <td className="px-3 py-2.5">
                                  {/* Botões aparecem no hover da linha */}
                                  <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={() => abrirModalLancamento(cartao, l)}
                                      title="Editar lançamento"
                                      className="w-7 h-7 flex items-center justify-center rounded hover:bg-blue-100 text-gray-400 hover:text-blue-600 transition-colors"
                                    >
                                      ✏️
                                    </button>
                                    <button
                                      onClick={() => excluirLancamento(l)}
                                      title="Excluir lançamento"
                                      className="w-7 h-7 flex items-center justify-center rounded hover:bg-red-100 text-gray-300 hover:text-red-500 transition-colors"
                                    >
                                      🗑️
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="bg-gray-50 dark:bg-gray-800 border-t-2 border-gray-200 dark:border-gray-700">
                              <td colSpan={3} className="px-3 py-2.5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                                Total dos lançamentos
                              </td>
                              <td className="px-3 py-2.5 text-right font-bold text-blue-700 dark:text-blue-400 text-base">
                                {formatBRL(subtotal)}
                              </td>
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
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={e => e.target === e.currentTarget && fecharModal()}
        >
          <div className="bg-white dark:bg-gray-900 dark:border dark:border-gray-700 rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg text-gray-900 dark:text-gray-100">{form.id ? 'Editar Cartão' : 'Novo Cartão'}</h2>
              <button onClick={fecharModal} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400">✕</button>
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
                <input
                  className="input"
                  value={form.vencimento || ''}
                  onChange={e => setForm({ ...form, vencimento: e.target.value })}
                  placeholder="ex: 10/03"
                />
              </div>
              <div>
                <label className="label">Valor Total da Fatura (R$)</label>
                <input
                  type="number" step="0.01" min="0"
                  className="input"
                  value={form.valor || ''}
                  onChange={e => setForm({ ...form, valor: e.target.value })}
                  placeholder="0,00"
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox" id="pago_c"
                  checked={!!form.pago}
                  onChange={e => setForm({ ...form, pago: e.target.checked })}
                  className="w-4 h-4 accent-green-500"
                />
                <label htmlFor="pago_c" className="text-sm text-gray-700">Fatura já paga</label>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button className="btn-secondary flex-1" onClick={fecharModal}>Cancelar</button>
              <button className="btn-primary flex-1" onClick={salvarCartao} disabled={saving || !form.nome}>
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Lançamento */}
      {modal?.tipo === 'lancamento' && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={e => e.target === e.currentTarget && fecharModal()}
        >
          <div className="bg-white dark:bg-gray-900 dark:border dark:border-gray-700 rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                {form.id ? 'Editar Lançamento' : 'Novo Lançamento'}
              </h2>
              <button onClick={fecharModal} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400">✕</button>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
              Cartão: <span className="font-semibold text-gray-600 dark:text-gray-300">{modal.cartaoNome}</span>
            </p>
            <div className="space-y-3">
              <div>
                <label className="label">Data da Compra</label>
                <input
                  type="date" className="input"
                  value={form.data_compra || ''}
                  onChange={e => setForm({ ...form, data_compra: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Local / Estabelecimento</label>
                <input
                  className="input"
                  value={form.local || ''}
                  onChange={e => setForm({ ...form, local: e.target.value })}
                  placeholder="Ex: Shopee, Netflix, Mercadinho..."
                  autoFocus
                />
              </div>
              <div>
                <label className="label">Parcela</label>
                <input
                  className="input"
                  value={form.parcela || ''}
                  onChange={e => setForm({ ...form, parcela: e.target.value })}
                  placeholder="Ex: 01/12"
                />
              </div>
              <div>
                <label className="label">Valor (R$)</label>
                <input
                  type="number" step="0.01" min="0"
                  className="input text-lg font-semibold"
                  value={form.valor || ''}
                  onChange={e => setForm({ ...form, valor: e.target.value })}
                  placeholder="0,00"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button className="btn-secondary flex-1" onClick={fecharModal}>Cancelar</button>
              <button
                className="btn-primary flex-1"
                onClick={salvarLancamento}
                disabled={saving || !form.local || !form.valor}
              >
                {saving ? 'Salvando...' : form.id ? 'Salvar Alterações' : 'Adicionar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
