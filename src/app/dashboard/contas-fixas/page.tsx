'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { formatBRL, formatDate, getMesAtual, getAnoAtual } from '@/lib/utils'
import { MESES, CATEGORIAS_FIXAS, type ContaFixa } from '@/types'

const GRUPOS = [
  'Contas Fixas de Casa',
  'Escola e Faculdade',
  'Vestuário',
  'Dentista',
  'Gasolina Mensal',
  'Previdência Yan',
  'Academia',
  'Juros Bancários Conta',
  'Outros'
]

export default function ContasFixasPage() {
  const supabase = createClient()
  const [mes, setMes] = useState(getMesAtual())
  const ano = getAnoAtual()
  const [contas, setContas] = useState<ContaFixa[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState<Partial<ContaFixa>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    function handleMes(e: Event) { setMes((e as CustomEvent).detail) }
    window.addEventListener('mesChange', handleMes)
    return () => window.removeEventListener('mesChange', handleMes)
  }, [])

  useEffect(() => { carregar() }, [mes])

  async function carregar() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('contas_fixas')
      .select('*').eq('user_id', user.id).eq('mes', mes).eq('ano', ano)
      .order('categoria')
    setContas(data || [])
    setLoading(false)
  }

  async function salvar() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const payload = {
      ...form, user_id: user.id, mes, ano,
      valor: Number(form.valor || 0),
      pago: !!form.pago
    }
    if (form.id) {
      await supabase.from('contas_fixas').update(payload).eq('id', form.id)
    } else {
      await supabase.from('contas_fixas').insert(payload)
    }
    setModal(false)
    setForm({})
    await carregar()
    setSaving(false)
  }

  async function togglePago(conta: ContaFixa) {
    await supabase.from('contas_fixas').update({ pago: !conta.pago }).eq('id', conta.id)
    await carregar()
  }

  async function excluir(id: string) {
    if (!confirm('Excluir esta conta?')) return
    await supabase.from('contas_fixas').delete().eq('id', id)
    await carregar()
  }

  // Agrupar por categoria
  const grupos = GRUPOS.map(g => ({
    grupo: g,
    itens: contas.filter(c => c.categoria === g)
  })).filter(g => g.itens.length > 0)

  const outrosItens = contas.filter(c => !GRUPOS.includes(c.categoria))
  if (outrosItens.length > 0) grupos.push({ grupo: 'Outros', itens: outrosItens })

  const total = contas.reduce((s, c) => s + Number(c.valor), 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🏠 Contas Fixas</h1>
          <p className="text-gray-500 text-sm">{MESES[mes - 1]} {ano}</p>
        </div>
        <button className="btn-primary" onClick={() => { setForm({ categoria: GRUPOS[0] }); setModal(true) }}>
          + Nova Conta
        </button>
      </div>

      <div className="card mb-5 bg-orange-50 border border-orange-100">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 font-semibold">Total Contas Fixas</span>
          <span className="text-2xl font-bold text-orange-600">{formatBRL(total)}</span>
        </div>
      </div>

      {loading ? (
        <div className="text-gray-400 text-center py-16">Carregando...</div>
      ) : contas.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">🏠</div>
          <p>Nenhuma conta fixa cadastrada para {MESES[mes - 1]}.</p>
          <button className="btn-primary mt-4" onClick={() => { setForm({ categoria: GRUPOS[0] }); setModal(true) }}>
            Adicionar Conta
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {grupos.map(({ grupo, itens }) => {
            const subtotal = itens.reduce((s, c) => s + Number(c.valor), 0)
            return (
              <div key={grupo} className="card">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-gray-800">{grupo}</h3>
                  <span className="text-sm font-semibold text-gray-500">{formatBRL(subtotal)}</span>
                </div>
                <div className="divide-y divide-gray-50">
                  {itens.map(conta => (
                    <div key={conta.id} className="flex items-center justify-between py-2.5">
                      <div className="flex items-center gap-3">
                        <button onClick={() => togglePago(conta)}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs transition-colors ${conta.pago ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'}`}>
                          {conta.pago ? '✓' : ''}
                        </button>
                        <div>
                          <div className={`text-sm font-medium ${conta.pago ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                            {conta.descricao}
                          </div>
                          <div className="text-xs text-gray-400 flex gap-2">
                            {conta.data_vencimento && <span>Venc: {formatDate(conta.data_vencimento)}</span>}
                            {conta.parcela && <span>{conta.parcela}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`font-semibold ${conta.pago ? 'text-green-600' : 'text-gray-900'}`}>
                          {formatBRL(conta.valor)}
                        </span>
                        <span className={conta.pago ? 'badge-ok' : 'badge-pendente'}>
                          {conta.pago ? 'Pago' : 'Pendente'}
                        </span>
                        <button onClick={() => { setForm(conta); setModal(true) }} className="text-gray-300 hover:text-gray-600 text-sm">✏️</button>
                        <button onClick={() => excluir(conta.id)} className="text-gray-300 hover:text-red-500 text-sm">🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="font-bold text-lg mb-4">{form.id ? 'Editar' : 'Nova'} Conta Fixa</h2>
            <div className="space-y-3">
              <div>
                <label className="label">Categoria</label>
                <select className="input" value={form.categoria || GRUPOS[0]} onChange={e => setForm({ ...form, categoria: e.target.value })}>
                  {GRUPOS.map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Descrição</label>
                <input className="input" value={form.descricao || ''} onChange={e => setForm({ ...form, descricao: e.target.value })} placeholder="Ex: Energia Elétrica" />
              </div>
              <div>
                <label className="label">Data de Vencimento</label>
                <input type="date" className="input" value={form.data_vencimento || ''} onChange={e => setForm({ ...form, data_vencimento: e.target.value })} />
              </div>
              <div>
                <label className="label">Valor (R$)</label>
                <input type="number" step="0.01" className="input" value={form.valor || ''} onChange={e => setForm({ ...form, valor: Number(e.target.value) })} />
              </div>
              <div>
                <label className="label">Parcela (opcional)</label>
                <input className="input" value={form.parcela || ''} onChange={e => setForm({ ...form, parcela: e.target.value })} placeholder="Ex: 03 de 10" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="pago_fixo" checked={!!form.pago} onChange={e => setForm({ ...form, pago: e.target.checked })} />
                <label htmlFor="pago_fixo" className="text-sm text-gray-700">Já pago</label>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button className="btn-secondary flex-1" onClick={() => { setModal(false); setForm({}) }}>Cancelar</button>
              <button className="btn-primary flex-1" onClick={salvar} disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
