'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { formatBRL, formatDate, getMesAtual, getAnoAtual } from '@/lib/utils'
import { MESES, NOMES_CARTOES, type Cartao, type LancamentoCartao } from '@/types'

export default function CartoesPage() {
  const supabase = createClient()
  const [mes, setMes] = useState(getMesAtual())
  const ano = getAnoAtual()
  const [cartoes, setCartoes] = useState<Cartao[]>([])
  const [lancamentos, setLancamentos] = useState<Record<string, LancamentoCartao[]>>({})
  const [expandido, setExpandido] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<{ tipo: 'cartao' | 'lancamento'; cartaoId?: string } | null>(null)
  const [form, setForm] = useState<any>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    function handleMes(e: Event) { setMes((e as CustomEvent).detail) }
    window.addEventListener('mesChange', handleMes)
    return () => window.removeEventListener('mesChange', handleMes)
  }, [])

  useEffect(() => { carregarCartoes() }, [mes])

  async function carregarCartoes() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('cartoes')
      .select('*').eq('user_id', user.id).eq('mes', mes).eq('ano', ano)
      .order('nome')
    setCartoes(data || [])
    setLoading(false)
  }

  async function carregarLancamentos(cartaoId: string) {
    const { data } = await supabase.from('lancamentos_cartao')
      .select('*').eq('cartao_id', cartaoId).order('data_compra')
    setLancamentos(prev => ({ ...prev, [cartaoId]: data || [] }))
  }

  async function toggleExpandido(cartaoId: string) {
    if (expandido === cartaoId) { setExpandido(null); return }
    setExpandido(cartaoId)
    await carregarLancamentos(cartaoId)
  }

  async function salvarCartao() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const payload = { ...form, user_id: user.id, mes, ano, valor: Number(form.valor || 0) }
    if (form.id) {
      await supabase.from('cartoes').update(payload).eq('id', form.id)
    } else {
      await supabase.from('cartoes').insert(payload)
    }
    setModal(null)
    setForm({})
    await carregarCartoes()
    setSaving(false)
  }

  async function salvarLancamento() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const cartaoId = modal?.cartaoId
    const payload = {
      ...form, user_id: user.id, cartao_id: cartaoId, mes, ano,
      valor: Number(form.valor || 0)
    }
    if (form.id) {
      await supabase.from('lancamentos_cartao').update(payload).eq('id', form.id)
    } else {
      await supabase.from('lancamentos_cartao').insert(payload)
    }
    // Recalcular total do cartão
    const { data: lancs } = await supabase.from('lancamentos_cartao')
      .select('valor').eq('cartao_id', cartaoId)
    const novoTotal = (lancs || []).reduce((s, r) => s + Number(r.valor), 0)
    await supabase.from('cartoes').update({ valor: novoTotal }).eq('id', cartaoId)
    setModal(null)
    setForm({})
    await carregarCartoes()
    if (cartaoId) await carregarLancamentos(cartaoId)
    setSaving(false)
  }

  async function excluirLancamento(id: string, cartaoId: string) {
    if (!confirm('Excluir este lançamento?')) return
    await supabase.from('lancamentos_cartao').delete().eq('id', id)
    const { data: lancs } = await supabase.from('lancamentos_cartao')
      .select('valor').eq('cartao_id', cartaoId)
    const novoTotal = (lancs || []).reduce((s, r) => s + Number(r.valor), 0)
    await supabase.from('cartoes').update({ valor: novoTotal }).eq('id', cartaoId)
    await carregarCartoes()
    await carregarLancamentos(cartaoId)
  }

  async function togglePago(cartao: Cartao) {
    await supabase.from('cartoes').update({ pago: !cartao.pago }).eq('id', cartao.id)
    await carregarCartoes()
  }

  async function excluirCartao(id: string) {
    if (!confirm('Excluir este cartão e todos os lançamentos?')) return
    await supabase.from('lancamentos_cartao').delete().eq('cartao_id', id)
    await supabase.from('cartoes').delete().eq('id', id)
    await carregarCartoes()
  }

  const totalMes = cartoes.reduce((s, c) => s + Number(c.valor), 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">💳 Cartões de Crédito</h1>
          <p className="text-gray-500 text-sm">{MESES[mes - 1]} {ano}</p>
        </div>
        <button className="btn-primary" onClick={() => { setForm({ nome: NOMES_CARTOES[0] }); setModal({ tipo: 'cartao' }) }}>
          + Adicionar Cartão
        </button>
      </div>

      {/* Total */}
      <div className="card mb-5 bg-blue-50 border border-blue-100">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 font-semibold">Total de Cartões no Mês</span>
          <span className="text-2xl font-bold text-blue-700">{formatBRL(totalMes)}</span>
        </div>
      </div>

      {loading ? (
        <div className="text-gray-400 text-center py-16">Carregando...</div>
      ) : cartoes.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">💳</div>
          <p>Nenhum cartão cadastrado para {MESES[mes - 1]}.</p>
          <button className="btn-primary mt-4" onClick={() => { setForm({ nome: NOMES_CARTOES[0] }); setModal({ tipo: 'cartao' }) }}>
            Adicionar Cartão
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {cartoes.map(cartao => (
            <div key={cartao.id} className="card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button onClick={() => togglePago(cartao)}
                    className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-sm transition-colors ${cartao.pago ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'}`}>
                    {cartao.pago ? '✓' : ''}
                  </button>
                  <div>
                    <div className="font-semibold text-gray-900">{cartao.nome}</div>
                    {cartao.vencimento && <div className="text-xs text-gray-400">Venc: {cartao.vencimento}</div>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-lg font-bold ${cartao.pago ? 'text-green-600 line-through opacity-60' : 'text-gray-900'}`}>
                    {formatBRL(cartao.valor)}
                  </span>
                  <span className={cartao.pago ? 'badge-ok' : 'badge-pendente'}>
                    {cartao.pago ? 'Pago' : 'Pendente'}
                  </span>
                  <button onClick={() => toggleExpandido(cartao.id)} className="text-blue-500 hover:text-blue-700 text-sm px-2">
                    {expandido === cartao.id ? '▲' : '▼'}
                  </button>
                  <button onClick={() => { setForm(cartao); setModal({ tipo: 'cartao' }) }} className="text-gray-400 hover:text-gray-600 text-sm">✏️</button>
                  <button onClick={() => excluirCartao(cartao.id)} className="text-gray-400 hover:text-red-500 text-sm">🗑️</button>
                </div>
              </div>

              {/* Lançamentos expandidos */}
              {expandido === cartao.id && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-semibold text-gray-600">Lançamentos</span>
                    <button className="btn-primary text-xs px-3 py-1"
                      onClick={() => { setForm({ cartao_id: cartao.id }); setModal({ tipo: 'lancamento', cartaoId: cartao.id }) }}>
                      + Lançamento
                    </button>
                  </div>
                  {(lancamentos[cartao.id] || []).length === 0 ? (
                    <div className="text-gray-400 text-sm text-center py-4">Nenhum lançamento</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-xs text-gray-400 border-b">
                            <th className="text-left py-2">Data</th>
                            <th className="text-left py-2">Local</th>
                            <th className="text-left py-2">Parcela</th>
                            <th className="text-right py-2">Valor</th>
                            <th className="py-2"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {(lancamentos[cartao.id] || []).map(l => (
                            <tr key={l.id} className="border-b border-gray-50 hover:bg-gray-50">
                              <td className="py-2 text-gray-500">{formatDate(l.data_compra)}</td>
                              <td className="py-2 font-medium">{l.local}</td>
                              <td className="py-2 text-gray-400">{l.parcela || '-'}</td>
                              <td className="py-2 text-right font-semibold">{formatBRL(l.valor)}</td>
                              <td className="py-2 text-right">
                                <button onClick={() => excluirLancamento(l.id, cartao.id)} className="text-gray-300 hover:text-red-500 text-xs">🗑️</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal Cartão */}
      {modal?.tipo === 'cartao' && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="font-bold text-lg mb-4">{form.id ? 'Editar' : 'Novo'} Cartão</h2>
            <div className="space-y-3">
              <div>
                <label className="label">Nome do Cartão</label>
                <select className="input" value={form.nome || ''} onChange={e => setForm({ ...form, nome: e.target.value })}>
                  {NOMES_CARTOES.map(n => <option key={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Vencimento</label>
                <input className="input" value={form.vencimento || ''} onChange={e => setForm({ ...form, vencimento: e.target.value })} placeholder="ex: 10/01" />
              </div>
              <div>
                <label className="label">Valor Total (R$)</label>
                <input type="number" step="0.01" className="input" value={form.valor || ''} onChange={e => setForm({ ...form, valor: e.target.value })} />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="pago" checked={!!form.pago} onChange={e => setForm({ ...form, pago: e.target.checked })} />
                <label htmlFor="pago" className="text-sm text-gray-700">Já pago</label>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button className="btn-secondary flex-1" onClick={() => { setModal(null); setForm({}) }}>Cancelar</button>
              <button className="btn-primary flex-1" onClick={salvarCartao} disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Lançamento */}
      {modal?.tipo === 'lancamento' && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="font-bold text-lg mb-4">Novo Lançamento</h2>
            <div className="space-y-3">
              <div>
                <label className="label">Data da Compra</label>
                <input type="date" className="input" value={form.data_compra || ''} onChange={e => setForm({ ...form, data_compra: e.target.value })} />
              </div>
              <div>
                <label className="label">Local / Estabelecimento</label>
                <input className="input" value={form.local || ''} onChange={e => setForm({ ...form, local: e.target.value })} placeholder="Ex: Mercadinho" />
              </div>
              <div>
                <label className="label">Parcela</label>
                <input className="input" value={form.parcela || ''} onChange={e => setForm({ ...form, parcela: e.target.value })} placeholder="Ex: 01/12" />
              </div>
              <div>
                <label className="label">Valor (R$)</label>
                <input type="number" step="0.01" className="input" value={form.valor || ''} onChange={e => setForm({ ...form, valor: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button className="btn-secondary flex-1" onClick={() => { setModal(null); setForm({}) }}>Cancelar</button>
              <button className="btn-primary flex-1" onClick={salvarLancamento} disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
