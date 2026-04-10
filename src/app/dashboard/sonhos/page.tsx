'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { useMes } from '@/context/MesContext'
import { formatBRL } from '@/lib/utils'
import { type Sonho } from '@/types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { motion, AnimatePresence } from 'framer-motion'

const ICONS = ['🎯', '🚀', '✨', '🏠', '🚗', '✈️', '🏝️', '💍', '💻', '🎓', '🏥', '💰']
const COLORS = [
  { name: 'Azul', value: 'blue' },
  { name: 'Verde', value: 'green' },
  { name: 'Roxo', value: 'purple' },
  { name: 'Laranja', value: 'orange' },
  { name: 'Rosa', value: 'pink' },
  { name: 'Ciano', value: 'cyan' },
]

export default function SonhosPage() {
  const supabase = createClient()
  const { mes, ano } = useMes()
  
  const [sonhos, setSonhos] = useState<Sonho[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState<Partial<Sonho>>({})
  const [saving, setSaving] = useState(false)
  const userIdRef = useRef<string | null>(null)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      userIdRef.current = user?.id ?? null
      carregarSonhos()
    }
    init()
  }, [])

  async function carregarSonhos() {
    if (!userIdRef.current) return
    setLoading(true)
    const { data, error } = await supabase
      .from('sonhos')
      .select('*')
      .eq('user_id', userIdRef.current)
      .order('prioridade', { ascending: false })
      .order('created_at', { ascending: true })

    if (!error) setSonhos(data || [])
    setLoading(false)
  }

  function abrirModal(sonho?: Sonho) {
    if (sonho) {
      setForm({ ...sonho })
    } else {
      setForm({
        titulo: '',
        valor_alvo: 0,
        valor_atual: 0,
        icone: '🎯',
        cor: 'blue',
        prioridade: 2,
        status: 'em_andamento'
      })
    }
    setModal(true)
  }

  async function salvarSonho() {
    if (!userIdRef.current || !form.titulo || !form.valor_alvo) return
    setSaving(true)

    const payload = {
      ...form,
      user_id: userIdRef.current,
      valor_alvo: Number(form.valor_alvo),
      valor_atual: Number(form.valor_atual || 0)
    }

    let error
    if (form.id) {
      const { error: err } = await supabase.from('sonhos').update(payload).eq('id', form.id)
      error = err
    } else {
      const { error: err } = await supabase.from('sonhos').insert(payload)
      error = err
    }

    if (!error) {
      setModal(false)
      carregarSonhos()
    }
    setSaving(false)
  }

  async function excluirSonho(id: string) {
    if (!confirm('Deseja realmente excluir este sonho?')) return
    await supabase.from('sonhos').delete().eq('id', id)
    carregarSonhos()
  }

  function calcularMesesRestantes(dataLimite: string | null) {
    if (!dataLimite) return null
    const hoje = new Date()
    const limite = new Date(dataLimite)
    const diff = limite.getTime() - hoje.getTime()
    const meses = Math.ceil(diff / (1000 * 60 * 60 * 24 * 30))
    return meses > 0 ? meses : 0
  }

  if (loading) return <div className="p-8 text-center animate-pulse">Carregando seus sonhos...</div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <span>🎯</span> Planejamento de Sonhos
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Objetivos de médio e longo prazo para a família</p>
        </div>
        <Button onClick={() => abrirModal()} className="bg-blue-600 hover:bg-blue-700 text-white">
          + Novo Sonho
        </Button>
      </div>

      {/* Lista de Sonhos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sonhos.map(sonho => {
          const percentual = Math.min(100, (sonho.valor_atual / sonho.valor_alvo) * 100)
          const mesesRestantes = calcularMesesRestantes(sonho.data_limite)
          const faltaGuardar = sonho.valor_alvo - sonho.valor_atual
          const sugestaoMensal = mesesRestantes && mesesRestantes > 0 ? faltaGuardar / mesesRestantes : null

          return (
            <motion.div key={sonho.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-t-4" style={{ borderTopColor: `var(--color-${sonho.cor}-500)` }}>
                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`text-3xl w-12 h-12 rounded-2xl flex items-center justify-center bg-${sonho.cor}-50 dark:bg-${sonho.cor}-900/20 text-${sonho.cor}-600`}>
                        {sonho.icone}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-gray-100 leading-tight">{sonho.titulo}</h3>
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-${sonho.cor}-100 dark:bg-${sonho.cor}-900/40 text-${sonho.cor}-700 dark:text-${sonho.cor}-300`}>
                          Prioridade {sonho.prioridade === 3 ? 'Alta' : sonho.prioridade === 2 ? 'Média' : 'Baixa'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => abrirModal(sonho)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg text-blue-600">✏️</button>
                      <button onClick={() => excluirSonho(sonho.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-600">🗑️</button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-gray-500">Progresso</span>
                      <span className="text-gray-900 dark:text-gray-100">{percentual.toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${percentual}%` }} 
                        className={`h-full bg-${sonho.cor}-500`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Guardado</p>
                      <p className="font-bold text-gray-900 dark:text-gray-100">{formatBRL(sonho.valor_atual)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Objetivo</p>
                      <p className="font-bold text-gray-900 dark:text-gray-100">{formatBRL(sonho.valor_alvo)}</p>
                    </div>
                  </div>

                  {sugestaoMensal && percentual < 100 && (
                    <div className={`p-3 rounded-xl bg-${sonho.cor}-50 dark:bg-${sonho.cor}-900/10 border border-${sonho.cor}-100 dark:border-${sonho.cor}-800/50`}>
                      <p className={`text-[10px] font-bold text-${sonho.cor}-700 dark:text-${sonho.cor}-400 uppercase`}>Sugestão Mensal</p>
                      <p className={`text-sm font-black text-${sonho.cor}-900 dark:text-white`}>
                        Poupar {formatBRL(sugestaoMensal)} / mês
                      </p>
                      <p className="text-[10px] text-gray-500 mt-0.5">Para realizar em {mesesRestantes} meses</p>
                    </div>
                  )}

                  {sonho.status === 'concluido' && (
                    <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-800/50 text-center">
                      <p className="text-xs font-bold text-green-700">🏆 Sonho Realizado!</p>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          )
        })}
        {sonhos.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-3xl">
            <p className="text-gray-400">Você ainda não cadastrou nenhum sonho. Que tal começar agora? 🚀</p>
          </div>
        )}
      </div>

      {/* Modal Criar/Editar */}
      <AnimatePresence>
        {modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, y: 100 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: 100 }}
              className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
                <h2 className="font-bold text-xl">{form.id ? 'Editar Sonho' : 'Novo Sonho 🚀'}</h2>
                <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase text-gray-400 mb-1 block">Título do Sonho</label>
                  <input 
                    type="text" 
                    className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={form.titulo || ''}
                    onChange={e => setForm({...form, titulo: e.target.value})}
                    placeholder="Ex: Viagem para Europa, Novo Carro..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase text-gray-400 mb-1 block">Valor Alvo (R$)</label>
                    <input 
                      type="number" 
                      className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm outline-none"
                      value={form.valor_alvo || ''}
                      onChange={e => setForm({...form, valor_alvo: Number(e.target.value)})}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-gray-400 mb-1 block">Já Guardado (R$)</label>
                    <input 
                      type="number" 
                      className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm outline-none"
                      value={form.valor_atual || ''}
                      onChange={e => setForm({...form, valor_atual: Number(e.target.value)})}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-gray-400 mb-1 block">Data Limite (Opcional)</label>
                  <input 
                    type="date" 
                    className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm outline-none"
                    value={form.data_limite || ''}
                    onChange={e => setForm({...form, data_limite: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase text-gray-400 mb-1 block">Prioridade</label>
                    <select 
                      className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm outline-none"
                      value={form.prioridade}
                      onChange={e => setForm({...form, prioridade: Number(e.target.value) as 1|2|3})}
                    >
                      <option value={3}>Alta</option>
                      <option value={2}>Média</option>
                      <option value={1}>Baixa</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-gray-400 mb-1 block">Cor de Destaque</label>
                    <div className="flex gap-2 mt-2">
                      {COLORS.map(c => (
                        <button 
                          key={c.value}
                          onClick={() => setForm({...form, cor: c.value})}
                          className={`w-6 h-6 rounded-full border-2 transition-all ${form.cor === c.value ? 'scale-125 border-gray-400' : 'border-transparent opacity-60'}`}
                          style={{ backgroundColor: `var(--color-${c.value}-500)` }}
                          title={c.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-gray-400 mb-1 block">Ícone Representativo</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {ICONS.map(i => (
                      <button 
                        key={i}
                        onClick={() => setForm({...form, icone: i})}
                        className={`w-10 h-10 text-xl flex items-center justify-center rounded-xl border transition-all ${form.icone === i ? 'bg-blue-50 border-blue-200 scale-110' : 'bg-gray-50 dark:bg-slate-950 border-transparent'}`}
                      >
                        {i}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gray-50 dark:bg-slate-950/50 flex gap-3">
                <Button onClick={() => setModal(false)} className="flex-1 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300">Cancelar</Button>
                <Button onClick={salvarSonho} disabled={saving} className="flex-1 bg-blue-600 text-white">
                  {saving ? 'Gravando...' : 'Salvar Objetivo'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        :root {
          --color-blue-500: #3b82f6;
          --color-green-500: #22c55e;
          --color-purple-500: #a855f7;
          --color-orange-500: #f97316;
          --color-pink-500: #ec4899;
          --color-cyan-500: #06b6d4;
        }
      `}</style>
    </div>
  )
}
