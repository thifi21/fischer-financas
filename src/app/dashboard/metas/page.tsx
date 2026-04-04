'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { useMes } from '@/context/MesContext'
import { formatBRL } from '@/lib/utils'
import { MESES, type Meta } from '@/types'

let cachedUserId: string | null = null

const CATEGORIAS = [
  { id: 'cartoes', label: 'Cartões de Crédito', icon: '💳', color: 'blue' },
  { id: 'fixas', label: 'Contas Fixas', icon: '🏠', color: 'green' },
  { id: 'combustivel', label: 'Combustível', icon: '⛽', color: 'yellow' },
  { id: 'total', label: 'Total Geral', icon: '💰', color: 'purple' },
] as const

type Categoria = typeof CATEGORIAS[number]['id']

export default function MetasPage() {
  const supabase = createClient()
  const { mes, ano } = useMes()
  
  const [metas, setMetas] = useState<Meta[]>([])
  const [gastos, setGastos] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState<Partial<Meta>>({})
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
    if (userIdRef.current) carregarTudo()
  }, [mes, ano])

  async function carregarTudo() {
    const uid = userIdRef.current
    if (!uid) return
    setLoading(true)

    // Busca metas e gastos em paralelo
    const [
      { data: metasData },
      { data: cartoesData },
      { data: fixasData },
      { data: combustivelData }
    ] = await Promise.all([
      supabase.from('metas').select('*').eq('user_id', uid).eq('mes', mes).eq('ano', ano),
      supabase.from('cartoes').select('valor').eq('user_id', uid).eq('mes', mes).eq('ano', ano),
      supabase.from('contas_fixas').select('valor').eq('user_id', uid).eq('mes', mes).eq('ano', ano),
      supabase.from('combustivel').select('valor').eq('user_id', uid).eq('mes', mes).eq('ano', ano),
    ])

    setMetas(metasData || [])

    const soma = (arr: any[] | null) => (arr || []).reduce((s, r) => s + Number(r.valor), 0)
    const cartoes = soma(cartoesData)
    const fixas = soma(fixasData)
    const combustivel = soma(combustivelData)

    setGastos({
      cartoes,
      fixas,
      combustivel,
      total: cartoes + fixas + combustivel
    })

    setLoading(false)
  }

  function abrirModal(meta?: Meta) {
    if (meta) {
      setForm({ ...meta })
    } else {
      setForm({ 
        categoria: 'cartoes',
        valor_limite: 0,
        notificar_em: 80,
        ativo: true 
      })
    }
    setModal(true)
  }

  function fecharModal() {
    setModal(false)
    setForm({})
  }

  async function salvarMeta() {
    const uid = userIdRef.current
    if (!uid || !form.categoria || !form.valor_limite) return

    setSaving(true)

    const payload = {
      user_id: uid,
      categoria: form.categoria,
      valor_limite: Number(form.valor_limite),
      mes,
      ano,
      notificar_em: form.notificar_em || 80,
      ativo: form.ativo !== false,
    }

    if (form.id) {
      // Editar
      await supabase.from('metas').update(payload).eq('id', form.id)
    } else {
      // Criar
      await supabase.from('metas').insert(payload)
    }

    setSaving(false)
    fecharModal()
    carregarTudo()
  }

  async function excluirMeta(meta: Meta) {
    if (!confirm(`Excluir meta de ${getCategoriaInfo(meta.categoria).label}?`)) return
    await supabase.from('metas').delete().eq('id', meta.id)
    carregarTudo()
  }

  async function toggleAtivo(meta: Meta) {
    const novoAtivo = !meta.ativo
    await supabase.from('metas').update({ ativo: novoAtivo }).eq('id', meta.id)
    setMetas(prev => prev.map(m => m.id === meta.id ? { ...m, ativo: novoAtivo } : m))
  }

  function getCategoriaInfo(cat: string) {
    return CATEGORIAS.find(c => c.id === cat) || CATEGORIAS[0]
  }

  function getPercentual(gasto: number, limite: number) {
    return limite > 0 ? (gasto / limite) * 100 : 0
  }

  function getCorStatus(percentual: number) {
    if (percentual >= 100) return 'red'
    if (percentual >= 90) return 'orange'
    if (percentual >= 70) return 'yellow'
    return 'green'
  }

  // Cards de resumo das categorias
  function MetaCard({ categoria }: { categoria: Categoria }) {
    const meta = metas.find(m => m.categoria === categoria && m.ativo)
    const gasto = gastos[categoria] || 0
    const info = getCategoriaInfo(categoria)

    if (!meta) {
      return (
        <div className="card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => abrirModal({ categoria } as Meta)}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`text-3xl bg-${info.color}-50 dark:bg-${info.color}-900/20 w-12 h-12 rounded-lg flex items-center justify-center`}>
              {info.icon}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">{info.label}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Sem meta definida</p>
            </div>
          </div>
          <div className="text-center py-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
            <p className="text-sm text-gray-400 dark:text-gray-500">+ Definir meta</p>
          </div>
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            <strong>Gasto atual:</strong> {formatBRL(gasto)}
          </div>
        </div>
      )
    }

    const percentual = getPercentual(gasto, meta.valor_limite)
    const cor = getCorStatus(percentual)
    const diferenca = meta.valor_limite - gasto
    const alertaAtingido = percentual >= meta.notificar_em

    return (
      <div className="card hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`text-3xl bg-${info.color}-50 dark:bg-${info.color}-900/20 w-12 h-12 rounded-lg flex items-center justify-center`}>
              {info.icon}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">{info.label}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Meta: {formatBRL(meta.valor_limite)}</p>
            </div>
          </div>
          <div className="flex gap-1">
            <button onClick={() => abrirModal(meta)} className="text-blue-600 hover:text-blue-700 p-1" title="Editar">✏️</button>
            <button onClick={() => excluirMeta(meta)} className="text-red-600 hover:text-red-700 p-1" title="Excluir">🗑️</button>
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-600 dark:text-gray-400">Progresso</span>
            <span className={`font-semibold ${
              cor === 'red' ? 'text-red-600' :
              cor === 'orange' ? 'text-orange-600' :
              cor === 'yellow' ? 'text-yellow-600' :
              'text-green-600'
            }`}>
              {percentual.toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${
                cor === 'red' ? 'bg-red-500' :
                cor === 'orange' ? 'bg-orange-500' :
                cor === 'yellow' ? 'bg-yellow-500' :
                'bg-green-500'
              }`}
              style={{ width: `${Math.min(percentual, 100)}%` }}
            />
          </div>
        </div>

        {/* Valores */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Gasto</p>
            <p className="font-bold text-gray-900 dark:text-gray-100">{formatBRL(gasto)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 dark:text-gray-400">{diferenca >= 0 ? 'Disponível' : 'Excedido'}</p>
            <p className={`font-bold ${diferenca >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatBRL(Math.abs(diferenca))}
            </p>
          </div>
        </div>

        {/* Alertas */}
        {alertaAtingido && percentual < 100 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-2 text-xs text-yellow-800 dark:text-yellow-400">
            ⚠️ Você atingiu {percentual.toFixed(0)}% da meta!
          </div>
        )}
        {percentual >= 100 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-2 text-xs text-red-800 dark:text-red-400">
            🚨 Meta excedida em {formatBRL(Math.abs(diferenca))}!
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse card h-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="animate-pulse card h-64" />)}
        </div>
      </div>
    )
  }

  const totalGasto = gastos.total || 0
  const metaTotal = metas.find(m => m.categoria === 'total' && m.ativo)
  const percentualTotal = metaTotal ? getPercentual(totalGasto, metaTotal.valor_limite) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">🎯 Metas e Orçamento</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{MESES[mes - 1]} {ano}</p>
        </div>
        <button onClick={() => abrirModal()} className="btn-primary">
          + Nova Meta
        </button>
      </div>

      {/* Card de Resumo Geral */}
      <div className="card bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-2 border-purple-200 dark:border-purple-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">💰 Resumo Geral</h2>
          {metaTotal && (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Meta: {formatBRL(metaTotal.valor_limite)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-6">
          <div className="flex-1">
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{formatBRL(totalGasto)}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total de gastos no mês</p>
          </div>
          {metaTotal && (
            <div className="text-right">
              <p className={`text-2xl font-bold ${percentualTotal >= 100 ? 'text-red-600' : percentualTotal >= 80 ? 'text-yellow-600' : 'text-green-600'}`}>
                {percentualTotal.toFixed(0)}%
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">da meta</p>
            </div>
          )}
        </div>
      </div>

      {/* Grid de Metas por Categoria */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {CATEGORIAS.map(cat => (
          <MetaCard key={cat.id} categoria={cat.id} />
        ))}
      </div>

      {/* Lista de Todas as Metas */}
      {metas.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">📊 Todas as Metas</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 px-3 text-gray-600 dark:text-gray-400">Categoria</th>
                  <th className="text-right py-2 px-3 text-gray-600 dark:text-gray-400">Limite</th>
                  <th className="text-right py-2 px-3 text-gray-600 dark:text-gray-400">Gasto</th>
                  <th className="text-right py-2 px-3 text-gray-600 dark:text-gray-400">%</th>
                  <th className="text-center py-2 px-3 text-gray-600 dark:text-gray-400">Alerta</th>
                  <th className="text-center py-2 px-3 text-gray-600 dark:text-gray-400">Status</th>
                  <th className="text-center py-2 px-3 text-gray-600 dark:text-gray-400">Ações</th>
                </tr>
              </thead>
              <tbody>
                {metas.map(meta => {
                  const info = getCategoriaInfo(meta.categoria)
                  const gasto = gastos[meta.categoria] || 0
                  const percentual = getPercentual(gasto, meta.valor_limite)
                  const cor = getCorStatus(percentual)
                  
                  return (
                    <tr key={meta.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          <span>{info.icon}</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{info.label}</span>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-right text-gray-900 dark:text-gray-100">{formatBRL(meta.valor_limite)}</td>
                      <td className="py-2 px-3 text-right text-gray-900 dark:text-gray-100">{formatBRL(gasto)}</td>
                      <td className="py-2 px-3 text-right">
                        <span className={`font-semibold ${
                          cor === 'red' ? 'text-red-600' :
                          cor === 'orange' ? 'text-orange-600' :
                          cor === 'yellow' ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {percentual.toFixed(0)}%
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center text-gray-600 dark:text-gray-400">
                        {meta.notificar_em}%
                      </td>
                      <td className="py-2 px-3 text-center">
                        <button 
                          onClick={() => toggleAtivo(meta)}
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            meta.ativo 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                              : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                          }`}
                        >
                          {meta.ativo ? '✓ Ativa' : '○ Inativa'}
                        </button>
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => abrirModal(meta)} className="text-blue-600 hover:text-blue-700 p-1" title="Editar">✏️</button>
                          <button onClick={() => excluirMeta(meta)} className="text-red-600 hover:text-red-700 p-1" title="Excluir">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Criar/Editar Meta */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={e => e.target === e.currentTarget && fecharModal()}>
          <div className="bg-white dark:bg-gray-900 dark:border dark:border-gray-700 rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                {form.id ? '✏️ Editar Meta' : '🎯 Nova Meta'}
              </h2>
              <button onClick={fecharModal} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label">Categoria</label>
                <select 
                  className="input" 
                  value={form.categoria || ''} 
                  onChange={e => setForm({ ...form, categoria: e.target.value as Categoria })}
                  disabled={!!form.id}
                >
                  {CATEGORIAS.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
                  ))}
                </select>
                {form.id && <p className="text-xs text-gray-500 mt-1">Não é possível alterar a categoria de uma meta existente</p>}
              </div>

              <div>
                <label className="label">Valor Limite (R$)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  className="input text-lg font-semibold" 
                  value={form.valor_limite || ''} 
                  onChange={e => setForm({ ...form, valor_limite: parseFloat(e.target.value) })}
                  placeholder="0,00"
                  autoFocus
                />
              </div>

              <div>
                <label className="label">Notificar ao atingir (%)</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="range" 
                    min="50" 
                    max="100" 
                    step="5"
                    className="flex-1" 
                    value={form.notificar_em || 80} 
                    onChange={e => setForm({ ...form, notificar_em: parseInt(e.target.value) })}
                  />
                  <span className="text-lg font-bold text-gray-900 dark:text-gray-100 w-12 text-right">
                    {form.notificar_em || 80}%
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Você será alertado ao atingir este percentual da meta</p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="ativo" 
                  checked={form.ativo !== false} 
                  onChange={e => setForm({ ...form, ativo: e.target.checked })}
                  className="w-4 h-4 accent-green-500"
                />
                <label htmlFor="ativo" className="text-sm text-gray-700 dark:text-gray-300">
                  Meta ativa (será monitorada)
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button className="btn-secondary flex-1" onClick={fecharModal}>
                Cancelar
              </button>
              <button 
                className="btn-primary flex-1" 
                onClick={salvarMeta}
                disabled={saving || !form.categoria || !form.valor_limite}
              >
                {saving ? 'Salvando...' : form.id ? 'Salvar' : 'Criar Meta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
