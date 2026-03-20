'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { formatBRL, getMesAtual, getAnoAtual } from '@/lib/utils'
import { MESES, type Entrada } from '@/types'

export default function EntradasPage() {
  const supabase = createClient()
  const [mes, setMes] = useState(getMesAtual())
  const ano = getAnoAtual()
  const [entradas, setEntradas] = useState<Entrada[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState<Partial<Entrada>>({})
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
    const { data } = await supabase.from('entradas')
      .select('*').eq('user_id', user.id).eq('mes', mes).eq('ano', ano)
      .order('descricao')
    setEntradas(data || [])
    setLoading(false)
  }

  async function salvar() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const payload = { ...form, user_id: user.id, mes, ano, valor: Number(form.valor || 0) }
    if (form.id) {
      await supabase.from('entradas').update(payload).eq('id', form.id)
    } else {
      await supabase.from('entradas').insert(payload)
    }
    setModal(false)
    setForm({})
    await carregar()
    setSaving(false)
  }

  async function excluir(id: string) {
    if (!confirm('Excluir esta entrada?')) return
    await supabase.from('entradas').delete().eq('id', id)
    await carregar()
  }

  const total = entradas.reduce((s, e) => s + Number(e.valor), 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">💵 Entradas / Salários</h1>
          <p className="text-gray-500 text-sm">{MESES[mes - 1]} {ano}</p>
        </div>
        <button className="btn-primary" onClick={() => { setForm({ categoria: 'salario' }); setModal(true) }}>
          + Nova Entrada
        </button>
      </div>

      <div className="card mb-5 bg-green-50 border border-green-100">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 font-semibold">Total de Entradas em {MESES[mes - 1]}</span>
          <span className="text-2xl font-bold text-green-700">{formatBRL(total)}</span>
        </div>
      </div>

      {loading ? (
        <div className="text-gray-400 text-center py-16">Carregando...</div>
      ) : entradas.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">💵</div>
          <p>Nenhuma entrada cadastrada para {MESES[mes - 1]}.</p>
          <button className="btn-primary mt-4" onClick={() => { setForm({ categoria: 'salario' }); setModal(true) }}>
            Adicionar Entrada
          </button>
        </div>
      ) : (
        <div className="card">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 uppercase border-b">
                <th className="text-left py-3">Descrição</th>
                <th className="text-left py-3">Categoria</th>
                <th className="text-right py-3">Valor</th>
                <th className="py-3"></th>
              </tr>
            </thead>
            <tbody>
              {entradas.map(e => (
                <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 font-semibold text-gray-800">{e.descricao}</td>
                  <td className="py-3">
                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full capitalize">{e.categoria}</span>
                  </td>
                  <td className="py-3 text-right font-bold text-green-700">{formatBRL(e.valor)}</td>
                  <td className="py-3 text-right">
                    <button onClick={() => { setForm(e); setModal(true) }} className="text-gray-400 hover:text-gray-600 mr-2">✏️</button>
                    <button onClick={() => excluir(e.id)} className="text-gray-400 hover:text-red-500">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-200">
                <td colSpan={2} className="py-3 font-bold text-gray-600">Total</td>
                <td className="py-3 text-right font-bold text-green-700 text-lg">{formatBRL(total)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="font-bold text-lg mb-4">{form.id ? 'Editar' : 'Nova'} Entrada</h2>
            <div className="space-y-3">
              <div>
                <label className="label">Descrição</label>
                <input className="input" value={form.descricao || ''} onChange={e => setForm({ ...form, descricao: e.target.value })} placeholder="Ex: Salário Thiago" />
              </div>
              <div>
                <label className="label">Categoria</label>
                <select className="input" value={form.categoria || 'salario'} onChange={e => setForm({ ...form, categoria: e.target.value })}>
                  <option value="salario">Salário</option>
                  <option value="freelance">Freelance</option>
                  <option value="extra">Extra</option>
                  <option value="investimento">Investimento</option>
                  <option value="outro">Outro</option>
                </select>
              </div>
              <div>
                <label className="label">Valor (R$)</label>
                <input type="number" step="0.01" className="input" value={form.valor || ''} onChange={e => setForm({ ...form, valor: Number(e.target.value) })} />
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
