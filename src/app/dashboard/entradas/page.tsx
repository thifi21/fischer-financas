'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { useMes } from '@/context/MesContext'
import { formatBRL } from '@/lib/utils'
import { MESES, type Entrada } from '@/types'

let cachedUserId: string | null = null

// Helper para calcular o 5º dia útil do mês
function get5thBusinessDayFormatado(ano: number, mes: number) {
  let count = 0
  let day = 1
  const date = new Date(ano, mes - 1, day)
  while (count < 5) {
    const w = date.getDay()
    // 0 = Domingo, 6 = Sábado
    if (w !== 0 && w !== 6) count++
    if (count < 5) {
      day++
      date.setDate(day)
    }
  }
  // Ajuste de fuso horário local para evitar que YYYY-MM-DD mude devido ao UTC
  const diaStr = String(date.getDate()).padStart(2, '0')
  const mesStr = String(mes).padStart(2, '0')
  return `${ano}-${mesStr}-${diaStr}`
}

function formatDateBr(isoStr: string) {
  if (!isoStr) return ''
  const [y, m, d] = isoStr.split('-')
  if (!y || !m || !d) return isoStr
  return `${d.substring(0,2)}/${m}/${y}`
}

interface ExtratoItem {
  id: string
  data: string
  descricao: string
  categoria: string
  valor: number
  tipo: 'entrada' | 'saida'
  tabelaOrigem: string
}

export default function EntradasPage() {
  const supabase = createClient()
  
  const { mes, ano } = useMes()
  
  // Abas
  const [activeTab, setActiveTab] = useState<'entradas' | 'extrato'>('entradas')

  // Estados aba Entradas
  const [entradas, setEntradas] = useState<Entrada[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]     = useState(false)
  const [form, setForm]       = useState<Partial<Entrada>>({})
  const [saving, setSaving]   = useState(false)
  
  // Estados aba Extrato
  const [extrato, setExtrato] = useState<ExtratoItem[]>([])
  const [loadingExtrato, setLoadingExtrato] = useState(false)
  const [saldoInicial, setSaldoInicial] = useState<Partial<Entrada>>({ valor: 0 })
  const [savingSaldo, setSavingSaldo] = useState(false)

  const userIdRef = useRef<string | null>(cachedUserId)

  useEffect(() => {
    async function init() {
      if (!userIdRef.current) {
        const { data: { user } } = await supabase.auth.getUser()
        userIdRef.current = user?.id ?? null
        cachedUserId = user?.id ?? null
      }
      if (activeTab === 'entradas') carregarEntradas()
      else carregarExtrato()
    }
    init()
  }, [])

  useEffect(() => { 
    if (userIdRef.current) {
      if (activeTab === 'entradas') carregarEntradas()
      else carregarExtrato()
    }
  }, [mes, ano, activeTab])

  // ==========================================
  // LÓGICA DE ENTRADAS (SALÁRIOS)
  // ==========================================
  async function carregarEntradas() {
    const uid = userIdRef.current
    if (!uid) return
    setLoading(true)
    const { data } = await supabase
      .from('entradas')
      .select('*')
      .eq('user_id', uid)
      .eq('mes', mes)
      .eq('ano', ano)
      .neq('categoria', 'saldo_inicial') // Oculta saldo inicial da lista comum
      .order('descricao')
      
    setEntradas(data || [])
    setLoading(false)
  }

  async function salvarEntrada() {
    const uid = userIdRef.current
    if (!uid) return
    setSaving(true)
    
    // Default date is 5th business day if not provided
    const defaultDate = get5thBusinessDayFormatado(ano, mes)
    const data_entrada = form.data_entrada || defaultDate

    const payload = { 
      ...form, 
      user_id: uid, 
      mes, 
      ano, 
      valor: Number(form.valor || 0),
      data_entrada
    }

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

  function abrirModalNova() {
    setForm({ 
      categoria: 'salario',
      data_entrada: get5thBusinessDayFormatado(ano, mes)
    })
    setModal(true)
  }

  // ==========================================
  // LÓGICA DO EXTRATO BANCÁRIO
  // ==========================================
  async function carregarExtrato() {
    const uid = userIdRef.current
    if (!uid) return
    setLoadingExtrato(true)
    
    const [resEntradas, resFixas, resCartoes, resComb] = await Promise.all([
      supabase.from('entradas').select('*').eq('user_id', uid).eq('mes', mes).eq('ano', ano),
      supabase.from('contas_fixas').select('*').eq('user_id', uid).eq('mes', mes).eq('ano', ano).eq('pago', true),
      supabase.from('cartoes').select('*').eq('user_id', uid).eq('mes', mes).eq('ano', ano).eq('pago', true),
      supabase.from('combustivel').select('*').eq('user_id', uid).eq('mes', mes).eq('ano', ano)
    ])

    let items: ExtratoItem[] = []

    // 1. Entradas normais
    resEntradas.data?.filter(e => e.categoria !== 'saldo_inicial').forEach(e => {
       // Pega o YYYY-MM-DD do banco
       const ts = e.data_entrada || (e.created_at ? e.created_at.split('T')[0] : get5thBusinessDayFormatado(ano, mes))
       items.push({
         id: e.id,
         data: ts,
         descricao: e.descricao,
         categoria: e.categoria,
         valor: e.valor,
         tipo: 'entrada',
         tabelaOrigem: 'entradas'
       })
    })

    // 2. Contas Fixas 
    resFixas.data?.forEach(e => {
      const ts = e.data_vencimento || (e.created_at ? e.created_at.split('T')[0] : '')
      items.push({
        id: e.id,
        data: ts,
        descricao: e.descricao,
        categoria: e.categoria,
        valor: e.valor,
        tipo: 'saida',
        tabelaOrigem: 'contas_fixas'
      })
    })

    // 3. Cartões
    resCartoes.data?.forEach(e => {
      const ts = e.vencimento ? `${ano}-${String(mes).padStart(2,'0')}-${String(e.vencimento.split('/')[0]).padStart(2,'0')}` : (e.created_at ? e.created_at.split('T')[0] : '')
      items.push({
        id: e.id,
        data: ts,
        descricao: `Fatura Cartão: ${e.nome}`,
        categoria: 'cartao',
        valor: e.valor,
        tipo: 'saida',
        tabelaOrigem: 'cartoes'
      })
    })

    // 4. Combustível
    resComb.data?.forEach(e => {
      const ts = e.data_abastecimento || (e.created_at ? e.created_at.split('T')[0] : '')
      items.push({
        id: e.id,
        data: ts,
        descricao: 'Abastecimento',
        categoria: 'combustivel',
        valor: e.valor,
        tipo: 'saida',
        tabelaOrigem: 'combustivel'
      })
    })

    // Ordenar itens por data
    items.sort((a, b) => new Date(a.data || '2000-01-01').getTime() - new Date(b.data || '2000-01-01').getTime())
    setExtrato(items)

    // Procurar saldo inicial
    const sInicial = resEntradas.data?.find(e => e.categoria === 'saldo_inicial')
    if (sInicial) {
      setSaldoInicial(sInicial)
    } else {
      setSaldoInicial({ valor: 0 })
    }

    setLoadingExtrato(false)
  }

  async function salvarSaldoInicial() {
    const uid = userIdRef.current
    if (!uid) return
    setSavingSaldo(true)
    
    const payload = { 
      user_id: uid, 
      mes, 
      ano, 
      descricao: 'Saldo Inicial', 
      valor: Number(saldoInicial.valor || 0),
      categoria: 'saldo_inicial',
      data_entrada: `${ano}-${String(mes).padStart(2,'0')}-01`
    }

    if (saldoInicial.id) {
      const { data } = await supabase.from('entradas').update(payload).eq('id', saldoInicial.id).select().single()
      if (data) setSaldoInicial(data)
    } else {
      const { data } = await supabase.from('entradas').insert(payload).select().single()
      if (data) setSaldoInicial(data)
    }
    setSavingSaldo(false)
  }

  // ==========================================
  // RENDERIZAÇÃO
  // ==========================================

  const totalEntradas = entradas.reduce((s, e) => s + Number(e.valor), 0)

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">💵 Receitas & Extrato</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{MESES[mes - 1]} {ano}</p>
        </div>
        
        {/* Toggle Abas */}
        <div className="flex bg-gray-200 dark:bg-gray-800 p-1 rounded-lg">
          <button
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
              activeTab === 'entradas' 
                ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
            onClick={() => setActiveTab('entradas')}
          >
            Salários (Lançamentos)
          </button>
          <button
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
              activeTab === 'extrato' 
                ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
            onClick={() => setActiveTab('extrato')}
          >
            Extrato da Conta
          </button>
        </div>
      </div>

      {/* --- CONTEÚDO ABA ENTRADAS --- */}
      {activeTab === 'entradas' && (
        <>
          <div className="flex justify-end mb-4">
            <button className="btn-primary" onClick={abrirModalNova}>
              + Nova Entrada
            </button>
          </div>

          <div className="card mb-5 bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-gray-600 dark:text-gray-300 font-semibold">
                  Total Previsto/Recebido em {MESES[mes - 1]}
                </span>
              </div>
              <span className="text-2xl font-bold text-green-700 dark:text-green-400">{formatBRL(totalEntradas)}</span>
            </div>
          </div>

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
              <button className="btn-primary mt-4" onClick={abrirModalNova}>Adicionar Entrada</button>
            </div>
          ) : (
            <div className="card">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-gray-400 dark:text-gray-500 uppercase border-b border-gray-100 dark:border-gray-800">
                      <th className="text-left py-3 px-2">Data</th>
                      <th className="text-left py-3 px-2">Descrição</th>
                      <th className="text-left py-3 px-2">Categoria</th>
                      <th className="text-right py-3 px-2">Valor</th>
                      <th className="py-3 px-2 w-20"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {entradas.map(e => (
                      <tr key={e.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                        <td className="py-3 px-2 text-gray-600 dark:text-gray-400">
                          {formatDateBr(e.data_entrada ?? '')}
                        </td>
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
                            <button onClick={() => { setForm(e); setModal(true) }} className="w-7 h-7 flex items-center justify-center rounded hover:bg-blue-100 dark:hover:bg-blue-900/40 text-gray-400 hover:text-blue-600 transition-colors">✏️</button>
                            <button onClick={() => excluir(e.id)} className="w-7 h-7 flex items-center justify-center rounded hover:bg-red-100 dark:hover:bg-red-900/40 text-gray-300 hover:text-red-500 transition-colors">🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* --- CONTEÚDO ABA EXTRATO --- */}
      {activeTab === 'extrato' && (
        <>
          <div className="card mb-5 flex items-end gap-4 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex-1 max-w-sm">
              <label className="label">Saldo em Conta no Dia 01 / {String(mes).padStart(2,'0')}</label>
              <input
                type="number" step="0.01"
                className="input text-lg font-bold"
                value={saldoInicial.valor || ''}
                onChange={e => setSaldoInicial({ ...saldoInicial, valor: Number(e.target.value) })}
                placeholder="R$ 0,00"
              />
            </div>
            <button 
              className="btn-primary" 
              onClick={salvarSaldoInicial}
              disabled={savingSaldo}
            >
              {savingSaldo ? 'Salvando...' : 'Salvar Saldo'}
            </button>
          </div>

          <div className="card">
            <h2 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-100">Movimentações do Mês (Realizadas)</h2>
            
            {loadingExtrato ? (
               <div className="animate-pulse space-y-3">
                 {[1,2,3,4].map(i => <div key={i} className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-full" />)}
               </div>
            ) : (
               <div className="overflow-x-auto">
                 <table className="w-full text-sm">
                   <thead>
                     <tr className="text-xs text-gray-400 dark:text-gray-500 uppercase border-b border-gray-100 dark:border-gray-800">
                       <th className="text-left py-3 px-2">Data</th>
                       <th className="text-left py-3 px-2">Descrição</th>
                       <th className="text-center py-3 px-2">Tipo</th>
                       <th className="text-right py-3 px-2">Valor</th>
                       <th className="text-right py-3 px-2">Saldo Progressivo</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                     {/* Linha inicial */}
                     <tr className="bg-gray-50 dark:bg-gray-900/50">
                        <td className="py-3 px-2 text-gray-500 font-medium font-mono text-xs">01/{String(mes).padStart(2,'0')}</td>
                        <td className="py-3 px-2 font-semibold text-gray-600 dark:text-gray-400">Saldo Inicial</td>
                        <td className="py-3 px-2 text-center">-</td>
                        <td className="py-3 px-2 text-right"></td>
                        <td className="py-3 px-2 text-right font-bold text-gray-800 dark:text-gray-200">{formatBRL(saldoInicial.valor || 0)}</td>
                     </tr>
                     
                     {/* Linhas dinâmicas com reduce de saldo */}
                     {(() => {
                       let runningBalance = Number(saldoInicial.valor || 0)
                       return extrato.map((item, index) => {
                         runningBalance += (item.tipo === 'entrada' ? item.valor : -item.valor)
                         return (
                           <tr key={`${item.tabelaOrigem}-${item.id}-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                            <td className="py-3 px-2 text-gray-600 dark:text-gray-400 font-mono text-xs">
                              {formatDateBr(item.data)}
                            </td>
                            <td className="py-3 px-2 font-semibold text-gray-800 dark:text-gray-200">
                              {item.descricao}
                            </td>
                            <td className="py-3 px-2 text-center">
                              {item.tipo === 'entrada' 
                                ? <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400">Depósito</span>
                                : <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400">Pagamento</span>
                              }
                            </td>
                            <td className={`py-3 px-2 text-right font-bold ${item.tipo === 'entrada' ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                              {item.tipo === 'entrada' ? '+' : '-'} {formatBRL(item.valor)}
                            </td>
                            <td className={`py-3 px-2 text-right font-bold ${runningBalance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
                              {formatBRL(runningBalance)}
                            </td>
                           </tr>
                         )
                       })
                     })()}
                   </tbody>
                 </table>
               </div>
            )}
          </div>
        </>
      )}

      {/* Modal de Entradas */}
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
              <button onClick={fecharModal} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="label">Data de Lançamento / Recebimento</label>
                <input
                  type="date"
                  className="input"
                  value={form.data_entrada || ''}
                  onChange={e => setForm({ ...form, data_entrada: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Descrição</label>
                <input
                  className="input"
                  value={form.descricao || ''}
                  onChange={e => setForm({ ...form, descricao: e.target.value })}
                  placeholder="Ex: Salário Thiago"
                />
              </div>
              <div>
                <label className="label">Categoria</label>
                <select
                  className="input"
                  value={form.categoria || 'salario'}
                  onChange={e => setForm({ ...form, categoria: e.target.value })}
                >
                  {CATEGORIAS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
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
                onClick={salvarEntrada}
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
