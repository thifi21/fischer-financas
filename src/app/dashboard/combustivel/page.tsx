'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { formatBRL, formatDate, getMesAtual, getAnoAtual } from '@/lib/utils'
import { MESES, type Combustivel } from '@/types'

export default function CombustivelPage() {
  const supabase = createClient()
  const [mes, setMes] = useState(getMesAtual())
  const ano = getAnoAtual()
  const [registros, setRegistros] = useState<Combustivel[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState<Partial<Combustivel>>({})
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
    const { data } = await supabase.from('combustivel')
      .select('*').eq('user_id', user.id).eq('mes', mes).eq('ano', ano)
      .order('data_abastecimento')
    setRegistros(data || [])
    setLoading(false)
  }

  async function salvar() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const payload = {
      ...form, user_id: user.id, mes, ano,
      valor: Number(form.valor || 0),
      litros: form.litros ? Number(form.litros) : null,
      km: form.km ? Number(form.km) : null,
      preco_litro: form.preco_litro ? Number(form.preco_litro) : null,
    }
    if (form.id) {
      await supabase.from('combustivel').update(payload).eq('id', form.id)
    } else {
      await supabase.from('combustivel').insert(payload)
    }
    setModal(false)
    setForm({})
    await carregar()
    setSaving(false)
  }

  async function excluir(id: string) {
    if (!confirm('Excluir este registro?')) return
    await supabase.from('combustivel').delete().eq('id', id)
    await carregar()
  }

  const totalValor = registros.reduce((s, r) => s + Number(r.valor), 0)
  const totalLitros = registros.reduce((s, r) => s + Number(r.litros || 0), 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">⛽ Combustível</h1>
          <p className="text-gray-500 text-sm">{MESES[mes - 1]} {ano}</p>
        </div>
        <button className="btn-primary" onClick={() => { setForm({}); setModal(true) }}>
          + Novo Abastecimento
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="card bg-yellow-50 border border-yellow-100">
          <div className="text-xs text-gray-500 font-semibold uppercase mb-1">Total Gasto</div>
          <div className="text-2xl font-bold text-yellow-700">{formatBRL(totalValor)}</div>
        </div>
        <div className="card bg-yellow-50 border border-yellow-100">
          <div className="text-xs text-gray-500 font-semibold uppercase mb-1">Total Litros</div>
          <div className="text-2xl font-bold text-yellow-700">{totalLitros.toFixed(3)} L</div>
        </div>
      </div>

      {loading ? (
        <div className="text-gray-400 text-center py-16">Carregando...</div>
      ) : registros.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">⛽</div>
          <p>Nenhum abastecimento registrado para {MESES[mes - 1]}.</p>
          <button className="btn-primary mt-4" onClick={() => { setForm({}); setModal(true) }}>
            Registrar Abastecimento
          </button>
        </div>
      ) : (
        <div className="card">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 uppercase border-b">
                <th className="text-left py-3">Data</th>
                <th className="text-right py-3">Litros</th>
                <th className="text-right py-3">Valor</th>
                <th className="text-right py-3">Preço/L</th>
                <th className="text-right py-3">KM</th>
                <th className="py-3"></th>
              </tr>
            </thead>
            <tbody>
              {registros.map(r => (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 text-gray-500">{formatDate(r.data_abastecimento)}</td>
                  <td className="py-3 text-right">{r.litros ? `${Number(r.litros).toFixed(3)} L` : '-'}</td>
                  <td className="py-3 text-right font-semibold text-yellow-700">{formatBRL(r.valor)}</td>
                  <td className="py-3 text-right text-gray-500">{r.preco_litro ? `R$ ${Number(r.preco_litro).toFixed(2)}` : '-'}</td>
                  <td className="py-3 text-right text-gray-400">{r.km ? r.km.toLocaleString('pt-BR') : '-'}</td>
                  <td className="py-3 text-right">
                    <button onClick={() => { setForm(r); setModal(true) }} className="text-gray-300 hover:text-gray-600 mr-1">✏️</button>
                    <button onClick={() => excluir(r.id)} className="text-gray-300 hover:text-red-500">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-200">
                <td className="py-3 font-bold text-gray-600">Total</td>
                <td className="py-3 text-right font-bold">{totalLitros.toFixed(3)} L</td>
                <td className="py-3 text-right font-bold text-yellow-700">{formatBRL(totalValor)}</td>
                <td colSpan={3}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="font-bold text-lg mb-4">{form.id ? 'Editar' : 'Novo'} Abastecimento</h2>
            <div className="space-y-3">
              <div>
                <label className="label">Data</label>
                <input type="date" className="input" value={form.data_abastecimento || ''} onChange={e => setForm({ ...form, data_abastecimento: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Litros</label>
                  <input type="number" step="0.001" className="input" value={form.litros || ''} onChange={e => setForm({ ...form, litros: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="label">Valor (R$)</label>
                  <input type="number" step="0.01" className="input" value={form.valor || ''} onChange={e => setForm({ ...form, valor: Number(e.target.value) })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Preço por Litro</label>
                  <input type="number" step="0.001" className="input" value={form.preco_litro || ''} onChange={e => setForm({ ...form, preco_litro: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="label">KM do Odômetro</label>
                  <input type="number" className="input" value={form.km || ''} onChange={e => setForm({ ...form, km: Number(e.target.value) })} />
                </div>
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
