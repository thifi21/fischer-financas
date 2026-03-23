'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { useMes } from '@/context/MesContext'
import { formatBRL, formatDate, getAnoAtual } from '@/lib/utils'
import { MESES, type Combustivel } from '@/types'

let cachedUserId: string | null = null

// ── Extrai mês e ano de uma string de data (AAAA-MM-DD) ──────────
function mesAnoDeData(dataStr: string): { mes: number; ano: number } {
  const [ano, mes] = dataStr.split('-').map(Number)
  return { mes, ano }
}

export default function CombustivelPage() {
  const supabase = createClient()
  const { mes }  = useMes()
  const anoAtual = getAnoAtual()

  const [registros, setRegistros] = useState<Combustivel[]>([])
  const [loading, setLoading]     = useState(true)
  const [modal, setModal]         = useState(false)
  const [form, setForm]           = useState<Partial<Combustivel>>({})
  const [saving, setSaving]       = useState(false)
  const [erro, setErro]           = useState('')
  const userIdRef = useRef<string | null>(cachedUserId)

  // ── Init: resolve userId uma única vez ───────────────────────
  useEffect(() => {
    async function init() {
      if (!userIdRef.current) {
        const { data: { user } } = await supabase.auth.getUser()
        userIdRef.current = user?.id ?? null
        cachedUserId      = user?.id ?? null
      }
      carregar(mes)
    }
    init()
  }, [])

  // ── Recarrega sempre que o mês mudar ─────────────────────────
  useEffect(() => {
    if (userIdRef.current) carregar(mes)
  }, [mes])

  // ── Carregar — recebe mes como parâmetro para evitar closure ─
  const carregar = useCallback(async (mesBusca: number) => {
    const uid = userIdRef.current
    if (!uid) return
    setLoading(true)
    setErro('')

    // Busca registros do mês selecionado em QUALQUER ano
    // para não perder dados históricos
    const { data, error } = await supabase
      .from('combustivel')
      .select('*')
      .eq('user_id', uid)
      .eq('mes', mesBusca)
      .order('data_abastecimento')

    if (error) {
      setErro('Erro ao carregar abastecimentos.')
      setLoading(false)
      return
    }

    setRegistros(data || [])
    setLoading(false)
  }, [])

  // ── Salvar ───────────────────────────────────────────────────
  async function salvar() {
    const uid = userIdRef.current
    if (!uid) return
    setSaving(true)
    setErro('')

    // Deriva mes e ano da data inserida pelo usuário
    // Isso garante que um abastecimento de Janeiro fique em Janeiro
    let mesSalvar  = mes
    let anoSalvar  = anoAtual
    if (form.data_abastecimento) {
      const derivado = mesAnoDeData(form.data_abastecimento)
      mesSalvar = derivado.mes
      anoSalvar = derivado.ano
    }

    const payload = {
      user_id:             uid,
      mes:                 mesSalvar,
      ano:                 anoSalvar,
      data_abastecimento:  form.data_abastecimento || null,
      valor:               Number(form.valor || 0),
      litros:              form.litros      ? Number(form.litros)      : null,
      km:                  form.km          ? Number(form.km)          : null,
      preco_litro:         form.preco_litro ? Number(form.preco_litro) : null,
    }

    try {
      if (form.id) {
        // Edição
        const { data, error } = await supabase
          .from('combustivel')
          .update(payload)
          .eq('id', form.id)
          .select()
          .single()

        if (error) throw error

        if (data) {
          // Se o mês/ano mudaram com a edição, remove da lista atual
          if (data.mes !== mes) {
            setRegistros(prev => prev.filter(r => r.id !== form.id))
          } else {
            setRegistros(prev => prev.map(r => r.id === form.id ? data : r))
          }
        }
      } else {
        // Novo registro
        const { data, error } = await supabase
          .from('combustivel')
          .insert(payload)
          .select()
          .single()

        if (error) throw error

        if (data) {
          // Só adiciona na lista se o mês salvo for o mesmo exibido
          if (data.mes === mes) {
            setRegistros(prev =>
              [...prev, data].sort((a, b) =>
                (a.data_abastecimento ?? '').localeCompare(b.data_abastecimento ?? '')
              )
            )
          } else {
            // Mês diferente do exibido — avisa o usuário
            const nomeMes = MESES[data.mes - 1]
            setErro(
              `Abastecimento salvo em ${nomeMes} ${data.ano} (baseado na data informada). ` +
              `Selecione ${nomeMes} na barra lateral para visualizar.`
            )
          }
        }
      }

      fecharModal()
    } catch (e: any) {
      setErro(`Erro ao salvar: ${e?.message ?? 'tente novamente.'}`)
    } finally {
      setSaving(false)
    }
  }

  async function excluir(id: string) {
    if (!confirm('Excluir este abastecimento?')) return
    const { error } = await supabase.from('combustivel').delete().eq('id', id)
    if (!error) setRegistros(prev => prev.filter(r => r.id !== id))
  }

  function fecharModal() { setModal(false); setForm({}); setErro('') }

  const totalValor  = registros.reduce((s, r) => s + Number(r.valor), 0)
  const totalLitros = registros.reduce((s, r) => s + Number(r.litros || 0), 0)
  const precoMedio  = totalLitros > 0 ? totalValor / totalLitros : 0

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">⛽ Combustível</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{MESES[mes - 1]} {anoAtual}</p>
        </div>
        <button className="btn-primary" onClick={() => { setForm({}); setModal(true) }}>
          + Novo Abastecimento
        </button>
      </div>

      {/* Aviso de mês diferente */}
      {erro && !modal && (
        <div className="mb-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 rounded-lg px-4 py-3 text-sm flex items-start gap-2">
          <span className="text-base flex-shrink-0">ℹ️</span>
          <span>{erro}</span>
          <button onClick={() => setErro('')} className="ml-auto text-blue-400 hover:text-blue-600 flex-shrink-0">✕</button>
        </div>
      )}

      {/* Cards resumo */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="card bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-100 dark:border-yellow-900">
          <div className="text-xs text-yellow-600 dark:text-yellow-500 font-semibold uppercase mb-1">Total Gasto</div>
          <div className="text-xl font-bold text-yellow-700 dark:text-yellow-400">{formatBRL(totalValor)}</div>
        </div>
        <div className="card bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-100 dark:border-yellow-900">
          <div className="text-xs text-yellow-600 dark:text-yellow-500 font-semibold uppercase mb-1">Total Litros</div>
          <div className="text-xl font-bold text-yellow-700 dark:text-yellow-400">{totalLitros.toFixed(3)} L</div>
        </div>
        <div className="card bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-100 dark:border-yellow-900">
          <div className="text-xs text-yellow-600 dark:text-yellow-500 font-semibold uppercase mb-1">Preço Médio</div>
          <div className="text-xl font-bold text-yellow-700 dark:text-yellow-400">
            {precoMedio > 0 ? `R$ ${precoMedio.toFixed(3)}` : '—'}
          </div>
        </div>
      </div>

      {/* Skeleton */}
      {loading ? (
        <div className="card animate-pulse space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="flex justify-between py-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
            </div>
          ))}
        </div>
      ) : registros.length === 0 ? (
        <div className="card text-center py-16 text-gray-400 dark:text-gray-500">
          <div className="text-4xl mb-3">⛽</div>
          <p>Nenhum abastecimento em {MESES[mes - 1]}.</p>
          <button className="btn-primary mt-4" onClick={() => { setForm({}); setModal(true) }}>
            Registrar Abastecimento
          </button>
        </div>
      ) : (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 dark:text-gray-500 uppercase border-b border-gray-100 dark:border-gray-800">
                  <th className="text-left py-3 px-2">Data</th>
                  <th className="text-right py-3 px-2">Litros</th>
                  <th className="text-right py-3 px-2">Valor</th>
                  <th className="text-right py-3 px-2">Preço/L</th>
                  <th className="text-right py-3 px-2">KM</th>
                  <th className="py-3 px-2 w-20"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {registros.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                    <td className="py-3 px-2 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {formatDate(r.data_abastecimento)}
                    </td>
                    <td className="py-3 px-2 text-right text-gray-700 dark:text-gray-300">
                      {r.litros ? `${Number(r.litros).toFixed(3)} L` : '—'}
                    </td>
                    <td className="py-3 px-2 text-right font-bold text-yellow-700 dark:text-yellow-400">
                      {formatBRL(r.valor)}
                    </td>
                    <td className="py-3 px-2 text-right text-gray-500 dark:text-gray-400">
                      {r.preco_litro ? `R$ ${Number(r.preco_litro).toFixed(3)}` : '—'}
                    </td>
                    <td className="py-3 px-2 text-right text-gray-400 dark:text-gray-500 tabular-nums">
                      {r.km ? r.km.toLocaleString('pt-BR') : '—'}
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => { setForm(r); setModal(true) }}
                          className="w-7 h-7 flex items-center justify-center rounded hover:bg-blue-100 dark:hover:bg-blue-900/40 text-gray-400 hover:text-blue-600 transition-colors"
                        >✏️</button>
                        <button
                          onClick={() => excluir(r.id)}
                          className="w-7 h-7 flex items-center justify-center rounded hover:bg-red-100 dark:hover:bg-red-900/40 text-gray-300 hover:text-red-500 transition-colors"
                        >🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200 dark:border-gray-700">
                  <td className="py-3 px-2 font-bold text-gray-500 dark:text-gray-400 text-xs uppercase">Total</td>
                  <td className="py-3 px-2 text-right font-bold text-gray-700 dark:text-gray-300">
                    {totalLitros.toFixed(3)} L
                  </td>
                  <td className="py-3 px-2 text-right font-bold text-yellow-700 dark:text-yellow-400 text-base">
                    {formatBRL(totalValor)}
                  </td>
                  <td className="py-3 px-2 text-right text-gray-500 dark:text-gray-400 text-xs">
                    {precoMedio > 0 ? `R$ ${precoMedio.toFixed(3)} médio` : ''}
                  </td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={e => e.target === e.currentTarget && fecharModal()}
        >
          <div className="bg-white dark:bg-gray-900 dark:border dark:border-gray-700 rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                {form.id ? 'Editar Abastecimento' : 'Novo Abastecimento'}
              </h2>
              <button onClick={fecharModal} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">✕</button>
            </div>

            {/* Aviso quando data é de outro mês */}
            {form.data_abastecimento && (() => {
              const { mes: md, ano: ad } = mesAnoDeData(form.data_abastecimento)
              if (md !== mes || ad !== anoAtual) {
                return (
                  <div className="mb-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 rounded-lg px-3 py-2 text-xs flex items-center gap-2">
                    <span>⚠️</span>
                    <span>
                      A data {form.data_abastecimento} pertence a <strong>{MESES[md - 1]} {ad}</strong>.
                      O registro será salvo nesse mês.
                    </span>
                  </div>
                )
              }
              return null
            })()}

            <div className="space-y-3">
              <div>
                <label className="label">Data do Abastecimento</label>
                <input
                  type="date" className="input"
                  value={form.data_abastecimento || ''}
                  onChange={e => setForm({ ...form, data_abastecimento: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Litros</label>
                  <input
                    type="number" step="0.001" min="0" className="input"
                    value={form.litros || ''}
                    onChange={e => setForm({ ...form, litros: Number(e.target.value) })}
                    placeholder="0.000"
                  />
                </div>
                <div>
                  <label className="label">Valor (R$)</label>
                  <input
                    type="number" step="0.01" min="0" className="input"
                    value={form.valor || ''}
                    onChange={e => setForm({ ...form, valor: Number(e.target.value) })}
                    placeholder="0,00"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Preço por Litro (R$)</label>
                  <input
                    type="number" step="0.001" min="0" className="input"
                    value={form.preco_litro || ''}
                    onChange={e => setForm({ ...form, preco_litro: Number(e.target.value) })}
                    placeholder="0.000"
                  />
                </div>
                <div>
                  <label className="label">KM do Odômetro</label>
                  <input
                    type="number" min="0" className="input"
                    value={form.km || ''}
                    onChange={e => setForm({ ...form, km: Number(e.target.value) })}
                    placeholder="000000"
                  />
                </div>
              </div>
            </div>

            {/* Erro dentro do modal */}
            {erro && (
              <div className="mt-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg px-3 py-2 text-xs">
                ⚠️ {erro}
              </div>
            )}

            <div className="flex gap-3 mt-5">
              <button className="btn-secondary flex-1" onClick={fecharModal}>Cancelar</button>
              <button
                className="btn-primary flex-1"
                onClick={salvar}
                disabled={saving || !form.valor}
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
