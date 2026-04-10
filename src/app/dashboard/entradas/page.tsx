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
  conferido?: boolean
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
  
  // Estados aba Extrato_Manual
  const [modalManual, setModalManual] = useState(false)
  const [formManual, setFormManual] = useState<Partial<Entrada & { tipo: 'entrada' | 'saida' }>>({})
  const [savingManual, setSavingManual] = useState(false)
  
  // Estados de Edição Unificada do Extrato
  const [modalEdicao, setModalEdicao] = useState<ExtratoItem | null>(null)
  const [formEdicao, setFormEdicao]   = useState<any>({})
  const [savingEdicao, setSavingEdicao] = useState(false)

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
      .neq('categoria', 'extrato_entrada') // Oculta manual do extrato
      .neq('categoria', 'extrato_saida') // Oculta manual do extrato
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
       const ts = e.data_entrada || (e.created_at ? e.created_at.split('T')[0] : get5thBusinessDayFormatado(ano, mes))
       const isSaida = e.categoria === 'extrato_saida'
       items.push({
         id: e.id,
         data: ts,
         descricao: e.descricao,
         categoria: e.categoria,
         valor: e.valor,
         tipo: isSaida ? 'saida' : 'entrada',
         tabelaOrigem: 'entradas',
         conferido: !!e.conferido
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
        tabelaOrigem: 'contas_fixas',
        conferido: !!e.conferido
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
        tabelaOrigem: 'cartoes',
        conferido: !!e.conferido
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
        tabelaOrigem: 'combustivel',
        conferido: !!e.conferido
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

  async function salvarManual() {
    const uid = userIdRef.current
    if (!uid) return
    setSavingManual(true)
    
    const payload = { 
      user_id: uid, 
      mes, 
      ano, 
      descricao: formManual.descricao,
      valor: Number(formManual.valor || 0),
      categoria: formManual.tipo === 'saida' ? 'extrato_saida' : 'extrato_entrada',
      data_entrada: formManual.data_entrada || get5thBusinessDayFormatado(ano, mes)
    }

    if (formManual.id) {
      await supabase.from('entradas').update(payload).eq('id', formManual.id)
    } else {
      await supabase.from('entradas').insert(payload)
    }
    
    await carregarExtrato()
    setModalManual(false)
    setFormManual({})
    setSavingManual(false)
  }

  async function excluirManual(id: string) {
    if (!confirm('Excluir esta movimentação avulsa?')) return
    await supabase.from('entradas').delete().eq('id', id)
    await carregarExtrato()
  }

  function abrirModalManual() {
    setFormManual({
      tipo: 'saida',
      data_entrada: get5thBusinessDayFormatado(ano, mes)
    })
    setModalManual(true)
  }

  // ==========================================
  // LÓGICA DE CONCILIAÇÃO E EDIÇÃO UNIFICADA
  // ==========================================
  async function toggleConferidoExtrato(item: ExtratoItem) {
    const novoStatus = !item.conferido
    setExtrato(prev => prev.map(x => x.id === item.id && x.tabelaOrigem === item.tabelaOrigem ? { ...x, conferido: novoStatus } : x))
    await supabase.from(item.tabelaOrigem).update({ conferido: novoStatus }).eq('id', item.id)
  }

  function abrirEdicaoExtrato(item: ExtratoItem) {
    setFormEdicao({ ...item })
    setModalEdicao(item)
  }

  async function salvarEdicaoExtrato() {
    if (!modalEdicao) return
    setSavingEdicao(true)
    const { tabelaOrigem, id } = modalEdicao
    let payload: any = {
      descricao: formEdicao.descricao,
      valor: Number(formEdicao.valor || 0)
    }
    if (tabelaOrigem === 'entradas') payload.data_entrada = formEdicao.data
    else if (tabelaOrigem === 'contas_fixas') payload.data_vencimento = formEdicao.data
    else if (tabelaOrigem === 'combustivel') payload.data_abastecimento = formEdicao.data
    await supabase.from(tabelaOrigem).update(payload).eq('id', id)
    await carregarExtrato()
    setModalEdicao(null)
    setSavingEdicao(false)
  }

  // ==========================================
  // RENDERIZAÇÃO
  // ==========================================
  const totalEntradas = entradas.reduce((s, e) => s + Number(e.valor), 0)
  const saldoFinalCalculado = extrato.reduce((acc, item) => acc + (item.tipo === 'entrada' ? item.valor : -item.valor), Number(saldoInicial.valor || 0))

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">💵 Receitas & Extrato</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{MESES[mes - 1]} {ano}</p>
        </div>
        <div className="flex bg-gray-200 dark:bg-gray-800 p-1 rounded-lg">
          <button
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${activeTab === 'entradas' ? 'bg-white dark:bg-gray-900 shadow-sm' : 'text-gray-600'}`}
            onClick={() => setActiveTab('entradas')}
          >
            Salários (Lançamentos)
          </button>
          <button
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${activeTab === 'extrato' ? 'bg-white dark:bg-gray-900 shadow-sm' : 'text-gray-600'}`}
            onClick={() => setActiveTab('extrato')}
          >
            Extrato da Conta
          </button>
        </div>
      </div>

      {activeTab === 'entradas' && (
        <>
          <div className="flex justify-end mb-4">
            <button className="btn-primary" onClick={abrirModalNova}>+ Nova Entrada</button>
          </div>
          <div className="card mb-5 bg-green-50 dark:bg-green-950/30 border border-green-100">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-semibold">Total em {MESES[mes - 1]}</span>
              <span className="text-2xl font-bold text-green-700">{formatBRL(totalEntradas)}</span>
            </div>
          </div>
          {loading ? (
            <div className="card animate-pulse space-y-3">
               {[1,2,3].map(i => <div key={i} className="h-4 bg-gray-200 rounded w-full" />)}
            </div>
          ) : (
            <div className="card">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs uppercase border-b">
                      <th className="text-left py-3 px-2">Data</th>
                      <th className="text-left py-3 px-2">Descrição</th>
                      <th className="text-left py-3 px-2">Categoria</th>
                      <th className="text-right py-3 px-2">Valor</th>
                      <th className="py-3 px-2 w-20"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {entradas.map(e => (
                      <tr key={e.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="py-3 px-2">{formatDateBr(e.data_entrada ?? '')}</td>
                        <td className="py-3 px-2 font-semibold">{e.descricao}</td>
                        <td className="py-3 px-2">{catLabel(e.categoria)}</td>
                        <td className="py-3 px-2 text-right text-green-700 font-bold">{formatBRL(e.valor)}</td>
                        <td className="py-3 px-2">
                           <button onClick={() => { setForm(e); setModal(true) }} className="p-1">✏️</button>
                           <button onClick={() => excluir(e.id)} className="p-1">🗑️</button>
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

      {activeTab === 'extrato' && (
        <>
          <div className="card mb-5 flex items-end gap-4 bg-gray-50">
            <div className="flex-1 max-w-sm">
              <label className="label">Saldo em Conta no Dia 01 / {String(mes).padStart(2,'0')}</label>
              <input type="number" step="0.01" className="input font-bold" value={saldoInicial.valor || ''} onChange={e => setSaldoInicial({ ...saldoInicial, valor: Number(e.target.value) })} />
            </div>
            <button className="btn-primary" onClick={salvarSaldoInicial} disabled={savingSaldo}>{savingSaldo ? 'Salvando...' : 'Salvar Saldo'}</button>
          </div>

          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold">Movimentações do Mês (Realizadas)</h2>
              <button className="btn-primary text-sm" onClick={abrirModalManual}>+ Movimentação Avulsa</button>
            </div>
            {loadingExtrato ? (
               <div className="animate-pulse space-y-3">
                 {[1,2,3,4].map(i => <div key={i} className="h-8 bg-gray-200 rounded w-full" />)}
               </div>
            ) : (
               <div className="overflow-x-auto">
                 <table className="w-full text-sm">
                   <thead>
                     <tr className="text-xs uppercase border-b">
                       <th className="text-left py-3 px-2">Data</th>
                       <th className="text-left py-3 px-2">Descrição</th>
                       <th className="text-center py-3 px-2">Tipo</th>
                       <th className="text-right py-3 px-2">Valor</th>
                       <th className="text-right py-3 px-2">Saldo Progressivo</th>
                       <th className="py-3 px-2 w-10">✓</th>
                       <th className="py-3 px-2 w-10"></th>
                     </tr>
                   </thead>
                   <tbody>
                     <tr className="bg-gray-50 font-medium">
                        <td className="py-3 px-2">01/{String(mes).padStart(2,'0')}</td>
                        <td>Saldo Inicial</td>
                        <td className="text-center">-</td>
                        <td className="text-right"></td>
                        <td className="text-right font-bold">{formatBRL(saldoInicial.valor || 0)}</td>
                        <td colSpan={2}></td>
                     </tr>
                     {(() => {
                        let runningBalance = Number(saldoInicial.valor || 0)
                        return extrato.map((item, index) => {
                          runningBalance += (item.tipo === 'entrada' ? item.valor : -item.valor)
                          return (
                            <tr key={`${item.tabelaOrigem}-${item.id}-${index}`} className="hover:bg-gray-50 transition-colors">
                              <td className="py-3 px-2">{formatDateBr(item.data)}</td>
                              <td className="py-3 px-2 font-semibold">{item.descricao}</td>
                              <td className="py-3 px-2 text-center text-xs">{item.tipo === 'entrada' ? 'Depósito' : 'Pagamento'}</td>
                              <td className={`py-3 px-2 text-right font-bold ${item.tipo === 'entrada' ? 'text-green-600' : 'text-red-500'}`}>
                                {item.tipo === 'entrada' ? '+' : '-'} {formatBRL(item.valor)}
                              </td>
                              <td className="py-3 px-2 text-right font-bold">{formatBRL(runningBalance)}</td>
                              <td className="py-3 px-2">
                                <button 
                                  onClick={() => toggleConferidoExtrato(item)}
                                  className={`w-6 h-6 rounded border-2 ${item.conferido ? 'bg-green-500 border-green-500 text-white' : 'border-gray-200 text-transparent hover:border-green-400'}`}
                                >✓</button>
                              </td>
                              <td className="py-3 px-2 text-right">
                                <button onClick={() => abrirEdicaoExtrato(item)} className="text-gray-400 p-1">✏️</button>
                              </td>
                            </tr>
                          )
                        })
                     })()}
                   </tbody>
                 </table>
               </div>
            )}
            {!loadingExtrato && (
              <div className="mt-6 p-5 rounded-xl border bg-gray-50 flex justify-between items-center text-lg font-bold">
                <span>Saldo Atual da Conta</span>
                <span className={saldoFinalCalculado >= 0 ? 'text-blue-600' : 'text-red-600'}>{formatBRL(saldoFinalCalculado)}</span>
              </div>
            )}
          </div>
        </>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="font-bold text-lg mb-4">{form.id ? 'Editar Entrada' : 'Nova Entrada'}</h2>
            <div className="space-y-3">
              <label className="label">Data</label>
              <input type="date" className="input" value={form.data_entrada || ''} onChange={e => setForm({ ...form, data_entrada: e.target.value })} />
              <label className="label">Descrição</label>
              <input className="input" value={form.descricao || ''} onChange={e => setForm({ ...form, descricao: e.target.value })} />
              <label className="label">Categoria</label>
              <select className="input" value={form.categoria || 'salario'} onChange={e => setForm({ ...form, categoria: e.target.value })}>
                {CATEGORIAS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              <label className="label">Valor</label>
              <input type="number" step="0.01" className="input" value={form.valor || ''} onChange={e => setForm({ ...form, valor: Number(e.target.value) })} />
            </div>
            <div className="flex gap-3 mt-5">
              <button className="btn-secondary flex-1" onClick={fecharModal}>Cancelar</button>
              <button className="btn-primary flex-1" onClick={salvarEntrada} disabled={saving || !form.descricao || !form.valor}>{saving ? 'Salvando...' : 'Salvar'}</button>
            </div>
          </div>
        </div>
      )}

      {modalManual && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="font-bold text-lg mb-4">Nova Movimentação Avulsa</h2>
            <div className="space-y-4">
               <div className="flex gap-4">
                  <button className={`flex-1 p-2 border rounded ${formManual.tipo === 'entrada' ? 'bg-green-100 border-green-500' : ''}`} onClick={() => setFormManual({...formManual, tipo: 'entrada'})}>Crédito</button>
                  <button className={`flex-1 p-2 border rounded ${formManual.tipo === 'saida' ? 'bg-red-100 border-red-500' : ''}`} onClick={() => setFormManual({...formManual, tipo: 'saida'})}>Débito</button>
               </div>
               <label className="label">Data</label>
               <input type="date" className="input" value={formManual.data_entrada || ''} onChange={e => setFormManual({ ...formManual, data_entrada: e.target.value })} />
               <label className="label">Descrição</label>
               <input className="input" value={formManual.descricao || ''} onChange={e => setFormManual({ ...formManual, descricao: e.target.value })} />
               <label className="label">Valor</label>
               <input type="number" step="0.01" className="input" value={formManual.valor || ''} onChange={e => setFormManual({ ...formManual, valor: Number(e.target.value) })} />
            </div>
            <div className="flex gap-3 mt-6">
               <button className="btn-secondary flex-1" onClick={() => setModalManual(false)}>Cancelar</button>
               <button className="btn-primary flex-1" onClick={salvarManual} disabled={savingManual || !formManual.descricao || !formManual.valor}>{savingManual ? 'Salvando...' : 'Adicionar'}</button>
            </div>
          </div>
        </div>
      )}

      {modalEdicao && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="font-bold text-lg mb-4">Editar Lançamento</h2>
            <div className="space-y-4">
              <label className="label">Descrição</label>
              <input className="input" value={formEdicao.descricao || ''} onChange={e => setFormEdicao({ ...formEdicao, descricao: e.target.value })} />
              {modalEdicao.tabelaOrigem !== 'cartoes' && (
                <>
                  <label className="label">Data</label>
                  <input type="date" className="input" value={formEdicao.data || ''} onChange={e => setFormEdicao({ ...formEdicao, data: e.target.value })} />
                </>
              )}
              <label className="label">Valor</label>
              <input type="number" step="0.01" className="input" value={formEdicao.valor || ''} onChange={e => setFormEdicao({ ...formEdicao, valor: Number(e.target.value) })} />
            </div>
            <div className="flex gap-3 mt-6">
              <button className="btn-secondary flex-1" onClick={() => setModalEdicao(null)}>Cancelar</button>
              <button className="btn-primary flex-1" onClick={salvarEdicaoExtrato} disabled={savingEdicao || !formEdicao.descricao || !formEdicao.valor}>{savingEdicao ? 'Salvando...' : 'Salvar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
