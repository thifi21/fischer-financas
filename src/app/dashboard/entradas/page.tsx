'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { useMes } from '@/context/MesContext'
import { formatBRL } from '@/lib/utils'
import { MESES, type Entrada } from '@/types'

let cachedUserId: string | null = null

export default function EntradasPage() {
  const supabase = createClient()
  
  const { mes, ano } = useMes()
  const [entradas, setEntradas] = useState<Entrada[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]     = useState(false)
  const [form, setForm]       = useState<Partial<Entrada>>({})
  const [saving, setSaving]   = useState(false)
  const userIdRef = useRef<string | null>(cachedUserId)

  useEffect(() => {
    async function init() {
      if (!userIdRef.current) {
        const { data: { user } } = await supabase.auth.getUser()
        userIdRef.current = user?.id ?? null
        cachedUserId = user?.id ?? null
      }
      carregar()
    }
    init()
  }, [])


  useEffect(() => { if (userIdRef.current) carregar() }, [mes])

  async function carregar() {
    const uid = userIdRef.current
    if (!uid) return
    setLoading(true)
    const { data } = await supabase
      .from('entradas')
      .select('*')
      .eq('user_id', uid)
      .eq('mes', mes)
      .eq('ano', ano)
      .order('descricao')
    setEntradas(data || [])
    setLoading(false)
  }

  async function salvar() {
    const uid = userIdRef.current
    if (!uid) return
    setSaving(true)
    const payload = { ...form, user_id: uid, mes, ano, valor: Number(form.valor || 0) }
    if (form.id) {
      const { data } = await supabase.from('entradas').update(payload).eq('id', form.id).select().single()
      if (data) setEntradas(prev => prev.map(e => e.id === form.id ? data : e))
    } else {
      const { data } = await supabase.from('entradas').insert(payload).select().single()
      if (data) setEntradas(prev => [...prev, data].sort((a, b) => a.descricao.localeCompare(b.descricao)))
    }
    fecharModal()
    setSaving(false)
  }

  async function excluir(id: string) {
    if (!confirm('Excluir esta entrada?')) return
    await supabase.from('entradas').delete().eq('id', id)
    setEntradas(prev => prev.filter(e => e.id !== id))
  }

  function fecharModal() { setModal(false); setForm({}) }

  const total = entradas.reduce((s, e) => s + Number(e.valor), 0)

  const CATEGORIAS = [
    { value: 'salario',      label: '💼 Salário'       },
    { value: '13salario',    label: '🎁 13º Salário'   },
    { value: '14salario',    label: '🎉 14º Salário'   },
    { value: 'freelance',    label: '💻 Freelance'     },
    { value: 'extra',        label: '⭐ Extra'          },
    { value: 'investimento', label: '📈 Investimento'  },
    { value: 'outro',        label: '📌 Outro'         },
  ]

  const catLabel = (v: string) => CATEGORIAS.find(c => c.value === v)?.label ?? v

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">💵 Entradas / Salários</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{MESES[mes - 1]} {ano}</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => { setForm({ categoria: 'salario' }); setModal(true) }}
        >
          + Nova Entrada
        </button>
      </div>

      {/* Total */}
      <div className="card mb-5 bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-gray-600 dark:text-gray-300 font-semibold">
              Total de Entradas em {MESES[mes - 1]}
            </span>
            {!loading && (
              <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                {entradas.length} registro{entradas.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
          <span className="text-2xl font-bold text-green-700 dark:text-green-400">{formatBRL(total)}</span>
        </div>
      </div>

      {/* Skeleton */}
      {loading ? (
        <div className="card animate-pulse space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="flex justify-between py-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
            </div>
          ))}
        </div>
      ) : entradas.length === 0 ? (
        <div className="card text-center py-16 text-gray-400 dark:text-gray-500">
          <div className="text-4xl mb-3">💵</div>
          <p>Nenhuma entrada cadastrada para {MESES[mes - 1]}.</p>
          <button
            className="btn-primary mt-4"
            onClick={() => { setForm({ categoria: 'salario' }); setModal(true) }}
          >
            Adicionar Entrada
          </button>
        </div>
      ) : (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 dark:text-gray-500 uppercase border-b border-gray-100 dark:border-gray-800">
                  <th className="text-left py-3 px-2">Descrição</th>
                  <th className="text-left py-3 px-2">Categoria</th>
                  <th className="text-right py-3 px-2">Valor</th>
                  <th className="py-3 px-2 w-20"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {entradas.map(e => (
                  <tr key={e.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                    <td className="py-3 px-2 font-semibold text-gray-800 dark:text-gray-200">{e.descricao}</td>
                    <td className="py-3 px-2">
                      <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-xs px-2 py-0.5 rounded-full">
                        {catLabel(e.categoria)}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right font-bold text-green-700 dark:text-green-400">
                      {formatBRL(e.valor)}
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => { setForm(e); setModal(true) }}
                          className="w-7 h-7 flex items-center justify-center rounded hover:bg-blue-100 dark:hover:bg-blue-900/40 text-gray-400 hover:text-blue-600 transition-colors"
                        >✏️</button>
                        <button
                          onClick={() => excluir(e.id)}
                          className="w-7 h-7 flex items-center justify-center rounded hover:bg-red-100 dark:hover:bg-red-900/40 text-gray-300 hover:text-red-500 transition-colors"
                        >🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200 dark:border-gray-700">
                  <td colSpan={2} className="py-3 px-2 font-bold text-gray-600 dark:text-gray-400 text-sm uppercase tracking-wide">
                    Total
                  </td>
                  <td className="py-3 px-2 text-right font-bold text-green-700 dark:text-green-400 text-lg">
                    {formatBRL(total)}
                  </td>
                  <td />
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
                {form.id ? 'Editar Entrada' : 'Nova Entrada'}
              </h2>
              <button
                onClick={fecharModal}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"
              >✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="label">Descrição</label>
                <input
                  className="input"
                  value={form.descricao || ''}
                  onChange={e => setForm({ ...form, descricao: e.target.value })}
                  placeholder="Ex: Salário Thiago"
                  autoFocus
                />
              </div>
              <div>
                <label className="label">Categoria</label>
                <select
                  className="input"
                  value={form.categoria || 'salario'}
                  onChange={e => setForm({ ...form, categoria: e.target.value })}
                >
                  {CATEGORIAS.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Valor (R$)</label>
                <input
                  type="number" step="0.01" min="0"
                  className="input text-lg font-semibold"
                  value={form.valor || ''}
                  onChange={e => setForm({ ...form, valor: Number(e.target.value) })}
                  placeholder="0,00"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button className="btn-secondary flex-1" onClick={fecharModal}>Cancelar</button>
              <button
                className="btn-primary flex-1"
                onClick={salvar}
                disabled={saving || !form.descricao || !form.valor}
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
