'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { useMes } from '@/context/MesContext'
import { formatBRL } from '@/lib/utils'
import { MESES } from '@/types'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899']

let cachedUserId: string | null = null

export default function DashboardPage() {
  const supabase  = createClient()
  const { mes, ano } = useMes()
  const [resumo, setResumo]       = useState({ entradas: 0, cartoes: 0, fixas: 0, combustivel: 0 })
  const [dadosMensais, setDados]  = useState<any[]>([])
  const [pieData, setPie]         = useState<any[]>([])
  const [loading, setLoading]     = useState(true)
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

    // Busca mês atual + todos os meses em PARALELO (1 rodada de queries)
    const mesQueries = Array.from({ length: 12 }, (_, i) => i + 1).map(m =>
      Promise.all([
        supabase.from('entradas')    .select('valor').eq('user_id', uid).eq('mes', m).eq('ano', ano),
        supabase.from('cartoes')     .select('valor').eq('user_id', uid).eq('mes', m).eq('ano', ano),
        supabase.from('contas_fixas').select('valor').eq('user_id', uid).eq('mes', m).eq('ano', ano),
        supabase.from('combustivel') .select('valor').eq('user_id', uid).eq('mes', m).eq('ano', ano),
      ])
    )

    const resultados = await Promise.all(mesQueries)

    const soma = (rows: any[] | null) => (rows || []).reduce((s, r) => s + Number(r.valor), 0)

    const mesesData: any[] = []
    resultados.forEach(([{ data: e }, { data: c }, { data: f }, { data: cb }], idx) => {
      const m = idx + 1
      const ent = soma(e)
      const sai = soma(c) + soma(f) + soma(cb)
      if (ent > 0 || sai > 0) {
        mesesData.push({ mes: MESES[idx].substring(0, 3), entradas: ent, saidas: sai })
      }
      if (m === mes) {
        const cart = soma(c)
        const fix  = soma(f)
        const comb = soma(cb)
        setResumo({ entradas: ent, cartoes: cart, fixas: fix, combustivel: comb })
        setPie([
          { name: 'Cartões',      value: cart },
          { name: 'Contas Fixas', value: fix  },
          { name: 'Combustível',  value: comb },
        ].filter(d => d.value > 0))
      }
    })

    setDados(mesesData)
    setLoading(false)
  }

  const totalSaidas = resumo.cartoes + resumo.fixas + resumo.combustivel
  const saldo = resumo.entradas - totalSaidas

  // Skeleton card
  const SkCard = () => (
    <div className="card animate-pulse">
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-3" />
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32" />
    </div>
  )

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">📊 Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">{MESES[mes - 1]} {ano}</p>
      </div>

      {loading ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[1,2,3,4].map(i => <SkCard key={i} />)}
          </div>
          <div className="card mb-6 animate-pulse h-24" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card animate-pulse h-64" />
            <div className="card animate-pulse h-64" />
          </div>
        </>
      ) : (
        <>
          {/* Cards de resumo */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="card">
              <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase mb-1">Entradas</div>
              <div className="text-2xl font-bold text-green-600">{formatBRL(resumo.entradas)}</div>
            </div>
            <div className="card">
              <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase mb-1">Cartões</div>
              <div className="text-2xl font-bold text-blue-600">{formatBRL(resumo.cartoes)}</div>
            </div>
            <div className="card">
              <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase mb-1">Contas Fixas</div>
              <div className="text-2xl font-bold text-orange-500">{formatBRL(resumo.fixas)}</div>
            </div>
            <div className="card">
              <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase mb-1">Total Saídas</div>
              <div className="text-2xl font-bold text-red-600">{formatBRL(totalSaidas)}</div>
            </div>
          </div>

          {/* Saldo */}
          <div className={`card mb-6 border-l-4 ${saldo >= 0 ? 'border-l-green-500' : 'border-l-red-500'}`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wide">
                  Saldo do Mês — {MESES[mes - 1]}
                </div>
                <div className={`text-3xl font-bold mt-1 ${saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatBRL(saldo)}
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {formatBRL(resumo.entradas)} de entradas − {formatBRL(totalSaidas)} de saídas
                </div>
              </div>
              <div className="text-5xl">{saldo >= 0 ? '✅' : '⚠️'}</div>
            </div>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Pizza */}
            <div className="card">
              <h2 className="font-bold text-gray-800 dark:text-gray-200 mb-4">
                Distribuição de Gastos — {MESES[mes - 1]}
              </h2>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%" cy="50%"
                      outerRadius={85}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={true}
                    >
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: any) => formatBRL(Number(v))} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-gray-400 py-16">
                  <div className="text-3xl mb-2">📊</div>
                  Sem dados para {MESES[mes - 1]}
                </div>
              )}
            </div>

            {/* Barras */}
            <div className="card">
              <h2 className="font-bold text-gray-800 dark:text-gray-200 mb-4">
                Entradas vs Saídas — {ano}
              </h2>
              {dadosMensais.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={dadosMensais} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: any) => formatBRL(Number(v))} />
                    <Legend />
                    <Bar dataKey="entradas" name="Entradas" fill="#10b981" radius={[4,4,0,0]} />
                    <Bar dataKey="saidas"   name="Saídas"   fill="#ef4444" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-gray-400 py-16">
                  <div className="text-3xl mb-2">📈</div>
                  Sem dados para exibir
                </div>
              )}
            </div>
          </div>

          {/* Barra de progresso pago x pendente */}
          {totalSaidas > 0 && (
            <div className="card">
              <h2 className="font-bold text-gray-800 dark:text-gray-200 mb-4">
                Progresso de Pagamentos — {MESES[mes - 1]}
              </h2>
              <div className="space-y-3 text-sm">
                {[
                  { label: 'Entradas',    valor: resumo.entradas,    cor: 'bg-green-500' },
                  { label: 'Cartões',     valor: resumo.cartoes,     cor: 'bg-blue-500'  },
                  { label: 'Contas Fixas',valor: resumo.fixas,       cor: 'bg-orange-500'},
                  { label: 'Combustível', valor: resumo.combustivel, cor: 'bg-yellow-500'},
                ].filter(i => i.valor > 0).map(item => {
                  const pct = totalSaidas > 0 ? Math.min(100, (item.valor / Math.max(resumo.entradas, totalSaidas)) * 100) : 0
                  return (
                    <div key={item.label}>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-600 dark:text-gray-400 font-medium">{item.label}</span>
                        <span className="font-bold text-gray-800 dark:text-gray-200">{formatBRL(item.valor)}</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-2 rounded-full ${item.cor} transition-all duration-700`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
