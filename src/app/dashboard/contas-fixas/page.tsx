'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { formatBRL, formatDate, formatVencimento, getMesAtual, getAnoAtual } from '@/lib/utils'
import { MESES, NOMES_CARTOES, type ContaFixa, type Cartao } from '@/types'
import DriveUploadModal from '@/components/DriveUploadModal'

const GRUPOS = [
  'Contas Fixas de Casa',
  'Escola e Faculdade',
  'Vestuário',
  'Dentista',
  'Gasolina Mensal',
  'Previdência Yan',
  'Academia',
  'Juros Bancários Conta',
  'Outros',
]

const ICONES_GRUPO: Record<string, string> = {
  'Contas Fixas de Casa': '🏠',
  'Escola e Faculdade': '🎒',
  'Vestuário': '👕',
  'Dentista': '🦷',
  'Gasolina Mensal': '⛽',
  'Previdência Yan': '💰',
  'Academia': '💪',
  'Juros Bancários Conta': '🏦',
  'Outros': '📌',
}

let cachedUserId: string | null = null

export default function ContasFixasPage() {
  const supabase = createClient()
  const ano = getAnoAtual()
  const [mes, setMes] = useState(getMesAtual())
  const [contas, setContas] = useState<ContaFixa[]>([])
  const [cartoes, setCartoes] = useState<Cartao[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState<Partial<ContaFixa>>({})
  const [saving, setSaving] = useState(false)
  const [cartoesExpandido, setCartoesExpandido] = useState(true)
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
    function handleMes(e: Event) { setMes((e as CustomEvent).detail as number) }
    window.addEventListener('mesChange', handleMes)
    return () => window.removeEventListener('mesChange', handleMes)
  }, [])

  useEffect(() => {
    if (userIdRef.current) carregarTudo()
  }, [mes])

  // Carrega contas fixas + cartões do mês em paralelo
  async function carregarTudo() {
    const uid = userIdRef.current
    if (!uid) return
    setLoading(true)

    const [{ data: contasData }, { data: cartoesData }] = await Promise.all([
      supabase
        .from('contas_fixas')
        .select('*')
        .eq('user_id', uid)
        .eq('mes', mes)
        .eq('ano', ano)
        .order('categoria'),
      supabase
        .from('cartoes')
        .select('*')
        .eq('user_id', uid)
        .eq('mes', mes)
        .eq('ano', ano)
        .order('nome'),
    ])

    setContas(contasData || [])
    setCartoes(cartoesData || [])
    setLoading(false)
  }

  async function salvar() {
    const uid = userIdRef.current
    if (!uid) return
    setSaving(true)
    const payload = {
      ...form,
      user_id: uid,
      mes,
      ano,
      valor: Number(form.valor || 0),
      pago: !!form.pago,
    }
    if (form.id) {
      const { data } = await supabase.from('contas_fixas').update(payload).eq('id', form.id).select().single()
      if (data) setContas(prev => prev.map(c => c.id === form.id ? data : c))
    } else {
      const { data } = await supabase.from('contas_fixas').insert(payload).select().single()
      if (data) setContas(prev => [...prev, data])
    }
    fecharModal()
    setSaving(false)
  }

  async function togglePago(conta: ContaFixa) {
    const novo = !conta.pago
    setContas(prev => prev.map(c => c.id === conta.id ? { ...c, pago: novo } : c))
    await supabase.from('contas_fixas').update({ pago: novo }).eq('id', conta.id)
  }

  async function togglePagoCartao(cartao: Cartao) {
    const novo = !cartao.pago
    setCartoes(prev => prev.map(c => c.id === cartao.id ? { ...c, pago: novo } : c))
    await supabase.from('cartoes').update({ pago: novo }).eq('id', cartao.id)
  }

  async function excluir(id: string) {
    if (!confirm('Excluir esta conta?')) return
    await supabase.from('contas_fixas').delete().eq('id', id)
    setContas(prev => prev.filter(c => c.id !== id))
  }

  function fecharModal() { setModal(false); setForm({}) }

  // Agrupamento de contas fixas
  const grupos = GRUPOS.map(g => ({
    grupo: g,
    icone: ICONES_GRUPO[g] || '📌',
    itens: contas.filter(c => c.categoria === g),
  })).filter(g => g.itens.length > 0)

  const outrosItens = contas.filter(c => !GRUPOS.includes(c.categoria))
  if (outrosItens.length > 0) {
    grupos.push({ grupo: 'Outros', icone: '📌', itens: outrosItens })
  }

  const totalFixas = contas.reduce((s, c) => s + Number(c.valor), 0)
  const totalCartoes = cartoes.reduce((s, c) => s + Number(c.valor), 0)
  const totalGeral = totalFixas + totalCartoes
  const totalPagoCartoes = cartoes.filter(c => c.pago).reduce((s, c) => s + Number(c.valor), 0)
  const totalPagoFixas = contas.filter(c => c.pago).reduce((s, c) => s + Number(c.valor), 0)
  const totalPago = totalPagoCartoes + totalPagoFixas
  const totalPendente = totalGeral - totalPago

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🏠 Contas do Mês</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{MESES[mes - 1]} {ano}</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => { setForm({ categoria: GRUPOS[0] }); setModal(true) }}
        >
          + Nova Conta Fixa
        </button>
      </div>

      {/* Cards de resumo geral */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="card bg-gray-50 border border-gray-200">
          <div className="text-xs text-gray-400 dark:text-gray-500 font-semibold uppercase mb-1">Total Geral</div>
          <div className="text-xl font-bold text-gray-800 dark:text-gray-100">{formatBRL(totalGeral)}</div>
        </div>
        <div className="card bg-blue-50 border border-blue-100">
          <div className="text-xs text-blue-400 font-semibold uppercase mb-1">Cartões</div>
          <div className="text-xl font-bold text-blue-700">{formatBRL(totalCartoes)}</div>
        </div>
        <div className="card bg-orange-50 border border-orange-100">
          <div className="text-xs text-orange-400 font-semibold uppercase mb-1">Contas Fixas</div>
          <div className="text-xl font-bold text-orange-600">{formatBRL(totalFixas)}</div>
        </div>
        <div className="card bg-red-50 border border-red-100">
          <div className="text-xs text-red-400 font-semibold uppercase mb-1">A Pagar</div>
          <div className="text-xl font-bold text-red-600">{formatBRL(totalPendente)}</div>
        </div>
      </div>

      {loading ? (
        /* Skeleton */
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="card animate-pulse">
              <div className="flex justify-between mb-4">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-40" />
                <div className="h-5 bg-gray-100 dark:bg-gray-800 rounded w-20" />
              </div>
              <div className="space-y-3">
                {[1, 2, 3].map(j => (
                  <div key={j} className="flex justify-between">
                    <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-48" />
                    <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-20" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">

          {/* ── SEÇÃO: CARTÕES DE CRÉDITO ─────────────────────────── */}
          <div className="card">
            {/* Cabeçalho da seção cartões */}
            <button
              className="w-full flex items-center justify-between"
              onClick={() => setCartoesExpandido(v => !v)}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">💳</span>
                <h3 className="font-bold text-gray-800 dark:text-gray-200 text-base">Cartões de Crédito</h3>
                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                  {cartoes.length} cartões
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-base font-bold text-blue-700 dark:text-blue-400">{formatBRL(totalCartoes)}</span>
                <span className="text-blue-400 text-xs font-bold">{cartoesExpandido ? '▲' : '▼'}</span>
              </div>
            </button>

            {cartoesExpandido && (
              <div className="mt-4 pt-3 border-t border-gray-100">
                {cartoes.length === 0 ? (
                  <div className="text-center py-6 text-gray-400 dark:text-gray-500 text-sm bg-gray-50 dark:bg-gray-800/40 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
                    Nenhum cartão cadastrado para {MESES[mes - 1]}.
                    <br />
                    <span className="text-xs">Acesse a página <strong>Cartões de Crédito</strong> para adicionar.</span>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {cartoes.map(cartao => (
                      <div key={cartao.id} className="flex items-center justify-between py-3 group">
                        <div className="flex items-center gap-3">
                          {/* Toggle pago */}
                          <button
                            onClick={() => togglePagoCartao(cartao)}
                            title={cartao.pago ? 'Marcar como pendente' : 'Marcar como pago'}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs transition-all flex-shrink-0 ${
                              cartao.pago
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'border-gray-300 hover:border-green-400'
                            }`}
                          >
                            {cartao.pago ? '✓' : ''}
                          </button>

                          <div>
                            <div className={`text-sm font-semibold ${cartao.pago ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                              {cartao.nome}
                            </div>
                            {cartao.vencimento && (
                              <div className="text-xs text-gray-400 dark:text-gray-500">
                                Venc: {formatVencimento(cartao.vencimento)}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`font-bold text-sm ${cartao.pago ? 'text-green-600 line-through opacity-70' : 'text-gray-900'}`}>
                            {formatBRL(cartao.valor)}
                          </span>
                          <span className={cartao.pago ? 'badge-ok' : 'badge-pendente'}>
                            {cartao.pago ? 'Pago' : 'Pendente'}
                          </span>
                          <button
                            onClick={() => setDriveModal({ descricao: cartao.nome, valor: cartao.valor })}
                            title="Enviar comprovante para o Google Drive"
                            className="w-7 h-7 flex items-center justify-center rounded hover:bg-green-100 dark:hover:bg-green-900/30 text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors text-sm"
                          >☁️</button>
                        </div>
                      </div>
                    ))}

                    {/* Subtotal cartões */}
                    <div className="flex justify-between items-center pt-3 mt-1">
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                        Subtotal Cartões
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-blue-700">{formatBRL(totalCartoes)}</div>
                        {totalPagoCartoes > 0 && (
                          <div className="text-xs text-green-600">
                            {formatBRL(totalPagoCartoes)} pago
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── SEÇÕES: CONTAS FIXAS POR CATEGORIA ───────────────── */}
          {contas.length === 0 && grupos.length === 0 ? (
            <div className="card text-center py-12 text-gray-400">
              <div className="text-4xl mb-3">🏠</div>
              <p>Nenhuma conta fixa cadastrada para {MESES[mes - 1]}.</p>
              <button
                className="btn-primary mt-4"
                onClick={() => { setForm({ categoria: GRUPOS[0] }); setModal(true) }}
              >
                Adicionar Conta Fixa
              </button>
            </div>
          ) : (
            grupos.map(({ grupo, icone, itens }) => {
              const subtotal = itens.reduce((s, c) => s + Number(c.valor), 0)
              const pagos = itens.filter(c => c.pago).length

              return (
                <div key={grupo} className="card">
                  {/* Cabeçalho do grupo */}
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{icone}</span>
                      <h3 className="font-bold text-gray-800 dark:text-gray-200">{grupo}</h3>
                      <span className="text-xs text-gray-400">
                        {pagos}/{itens.length} pagos
                      </span>
                    </div>
                    <span className="text-sm font-bold text-gray-600 dark:text-gray-400">{formatBRL(subtotal)}</span>
                  </div>

                  {/* Itens do grupo */}
                  <div className="divide-y divide-gray-50">
                    {itens.map(conta => (
                      <div key={conta.id} className="flex items-center justify-between py-2.5 group">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => togglePago(conta)}
                            title={conta.pago ? 'Marcar como pendente' : 'Marcar como pago'}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs transition-all flex-shrink-0 ${
                              conta.pago
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'border-gray-300 hover:border-green-400'
                            }`}
                          >
                            {conta.pago ? '✓' : ''}
                          </button>

                          <div>
                            <div className={`text-sm font-medium ${conta.pago ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                              {conta.descricao}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              {conta.data_vencimento && (
                                <span>Venc: {formatDate(conta.data_vencimento)}</span>
                              )}
                              {conta.parcela && (
                                <span className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded">
                                  {conta.parcela}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`font-semibold text-sm ${conta.pago ? 'text-green-600' : 'text-gray-900'}`}>
                            {formatBRL(conta.valor)}
                          </span>
                          <span className={conta.pago ? 'badge-ok' : 'badge-pendente'}>
                            {conta.pago ? 'Pago' : 'Pendente'}
                          </span>
                          {/* Ações aparecem no hover */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => { setForm(conta); setModal(true) }}
                              title="Editar"
                              className="w-7 h-7 flex items-center justify-center rounded hover:bg-blue-100 text-gray-300 hover:text-blue-600 transition-colors"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => excluir(conta.id)}
                              title="Excluir"
                              className="w-7 h-7 flex items-center justify-center rounded hover:bg-red-100 text-gray-300 hover:text-red-500 transition-colors"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })
          )}

          {/* ── RODAPÉ RESUMO FINAL ────────────────────────────────── */}
          {(cartoes.length > 0 || contas.length > 0) && (
            <div className="card bg-gray-900 text-white">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-gray-300 uppercase text-xs tracking-widest">Resumo do Mês</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 dark:text-gray-500">💳 Total Cartões</span>
                  <span className="font-semibold">{formatBRL(totalCartoes)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 dark:text-gray-500">🏠 Total Contas Fixas</span>
                  <span className="font-semibold">{formatBRL(totalFixas)}</span>
                </div>
                <div className="border-t border-gray-700 pt-2 mt-2 flex justify-between items-center">
                  <span className="text-gray-300 dark:text-gray-400 font-semibold">Total Geral</span>
                  <span className="text-xl font-bold text-white">{formatBRL(totalGeral)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-green-400">✓ Já pago</span>
                  <span className="text-green-400 font-semibold">{formatBRL(totalPago)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-red-400">⏳ A pagar</span>
                  <span className="text-red-400 font-semibold">{formatBRL(totalPendente)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL: Nova / Editar Conta Fixa */}
      {modal && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={e => e.target === e.currentTarget && fecharModal()}
        >
          <div className="bg-white dark:bg-gray-900 dark:border dark:border-gray-700 rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg text-gray-900 dark:text-gray-100">{form.id ? 'Editar Conta Fixa' : 'Nova Conta Fixa'}</h2>
              <button
                onClick={fecharModal}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400"
              >✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="label">Categoria</label>
                <select
                  className="input"
                  value={form.categoria || GRUPOS[0]}
                  onChange={e => setForm({ ...form, categoria: e.target.value })}
                >
                  {GRUPOS.map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Descrição</label>
                <input
                  className="input"
                  value={form.descricao || ''}
                  onChange={e => setForm({ ...form, descricao: e.target.value })}
                  placeholder="Ex: Energia Elétrica"
                  autoFocus
                />
              </div>
              <div>
                <label className="label">Data de Vencimento</label>
                <input
                  type="date"
                  className="input"
                  value={form.data_vencimento || ''}
                  onChange={e => setForm({ ...form, data_vencimento: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="input"
                  value={form.valor || ''}
                  onChange={e => setForm({ ...form, valor: Number(e.target.value) })}
                  placeholder="0,00"
                />
              </div>
              <div>
                <label className="label">Parcela (opcional)</label>
                <input
                  className="input"
                  value={form.parcela || ''}
                  onChange={e => setForm({ ...form, parcela: e.target.value })}
                  placeholder="Ex: 03 de 10"
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pago_fixo"
                  checked={!!form.pago}
                  onChange={e => setForm({ ...form, pago: e.target.checked })}
                  className="w-4 h-4 accent-green-500"
                />
                <label htmlFor="pago_fixo" className="text-sm text-gray-700">Já pago</label>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button className="btn-secondary flex-1" onClick={fecharModal}>Cancelar</button>
              <button
                className="btn-primary flex-1"
                onClick={salvar}
                disabled={saving || !form.descricao}
              >
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drive Upload Modal */}
      {driveModal && (
        <DriveUploadModal
          mes={mes}
          descricao={driveModal.descricao}
          valor={driveModal.valor}
          onFechar={() => setDriveModal(null)}
        />
      )}
    </div>
  )
}
