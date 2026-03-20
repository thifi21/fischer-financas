'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { formatBRL, getMesAtual, getAnoAtual } from '@/lib/utils'
import { MESES } from '@/types'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'

const COLORS = ['#3b82f6','#f59e0b','#10b981','#ef4444','#8b5cf6','#ec4899']

export default function DashboardPage() {
  const supabase = createClient()
  const [mes, setMes] = useState(getMesAtual())
  const ano = getAnoAtual()
  const [resumo, setResumo] = useState({
    entradas: 0, cartoes: 0, fixas: 0, combustivel: 0
  })
  const [dadosMensais, setDadosMensais] = useState<any[]>([])
  const [pieData, setPieData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    function handleMes(e: Event) {
      setMes((e as CustomEvent).detail)
    }
    window.addEventListener('mesChange', handleMes)
    return () => window.removeEventListener('mesChange', handleMes)
  }, [])

  useEffect(() => { carregarDados() }, [mes])

  async function carregarDados() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [
      { data: entradas },
      { data: cartoes },
      { data: fixas },
      { data: comb }
    ] = await Promise.all([
      supabase.from('entradas').select('valor').eq('user_id', user.id).eq('mes', mes).eq('ano', ano),
      supabase.from('cartoes').select('valor').eq('user_id', user.id).eq('mes', mes).eq('ano', ano),
      supabase.from('contas_fixas').select('valor').eq('user_id', user.id).eq('mes', mes).eq('ano', ano),
      supabase.from('combustivel').select('valor').eq('user_id', user.id).eq('mes', mes).eq('ano', ano),
    ])

    const totalEntradas = (entradas || []).reduce((s, r) => s + Number(r.valor), 0)
    const totalCartoes = (cartoes || []).reduce((s, r) => s + Number(r.valor), 0)
    const totalFixas = (fixas || []).reduce((s, r) => s + Number(r.valor), 0)
    const totalComb = (comb || []).reduce((s, r) => s + Number(r.valor), 0)

    setResumo({ entradas: totalEntradas, cartoes: totalCartoes, fixas: totalFixas, combustivel: totalComb })

    // Gráfico pizza
    setPieData([
      { name: 'Cartões', value: totalCartoes },
      { name: 'Contas Fixas', value: totalFixas },
      { name: 'Combustível', value: totalComb },
    ].filter(d => d.value > 0))

    // Gráfico barras - todos os meses
    const mesesData = []
    for (let m = 1; m <= 12; m++) {
      const [{ data: e2 }, { data: c2 }, { data: f2 }] = await Promise.all([
        supabase.from('entradas').select('valor').eq('user_id', user.id).eq('mes', m).eq('ano', ano),
        supabase.from('cartoes').select('valor').eq('user_id', user.id).eq('mes', m).eq('ano', ano),
        supabase.from('contas_fixas').select('valor').eq('user_id', user.id).eq('mes', m).eq('ano', ano),
      ])
      const ent = (e2 || []).reduce((s: number, r: any) => s + Number(r.valor), 0)
      const sai = (c2 || []).reduce((s: number, r: any) => s + Number(r.valor), 0) +
                  (f2 || []).reduce((s: number, r: any) => s + Number(r.valor), 0)
      if (ent > 0 || sai > 0) {
        mesesData.push({ mes: MESES[m - 1].substring(0, 3), entradas: ent, saidas: sai })
      }
    }
    setDadosMensais(mesesData)
    setLoading(false)
  }

  const totalSaidas = resumo.cartoes + resumo.fixas + resumo.combustivel
  const saldo = resumo.entradas - totalSaidas

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm">{MESES[mes - 1]} {ano}</p>
        </div>
      </div>

      {loading ? (
        <div className="text-gray-400 text-center py-20">Carregando dados...</div>
      ) : (
        <>
          {/* Cards de resumo */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="card">
              <div className="text-xs text-gray-500 font-semibold uppercase mb-1">Entradas</div>
              <div className="text-2xl font-bold text-green-600">{formatBRL(resumo.entradas)}</div>
            </div>
            <div className="card">
              <div className="text-xs text-gray-500 font-semibold uppercase mb-1">Cartões</div>
              <div className="text-2xl font-bold text-blue-600">{formatBRL(resumo.cartoes)}</div>
            </div>
            <div className="card">
              <div className="text-xs text-gray-500 font-semibold uppercase mb-1">Contas Fixas</div>
              <div className="text-2xl font-bold text-orange-500">{formatBRL(resumo.fixas)}</div>
            </div>
            <div className="card">
              <div className="text-xs text-gray-500 font-semibold uppercase mb-1">Total Saídas</div>
              <div className="text-2xl font-bold text-red-600">{formatBRL(totalSaidas)}</div>
            </div>
          </div>

          {/* Saldo */}
          <div className={`card mb-6 border-l-4 ${saldo >= 0 ? 'border-l-green-500' : 'border-l-red-500'}`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 font-semibold uppercase">Saldo do Mês</div>
                <div className={`text-3xl font-bold mt-1 ${saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatBRL(saldo)}
                </div>
              </div>
              <div className="text-5xl">{saldo >= 0 ? '✅' : '⚠️'}</div>
            </div>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="card">
              <h2 className="font-bold text-gray-800 mb-4">Distribuição de Gastos</h2>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => formatBRL(v)} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-gray-400 py-10">Sem dados este mês</div>
              )}
            </div>

            <div className="card">
              <h2 className="font-bold text-gray-800 mb-4">Entradas vs Saídas por Mês</h2>
              {dadosMensais.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={dadosMensais}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: number) => formatBRL(v)} />
                    <Legend />
                    <Bar dataKey="entradas" name="Entradas" fill="#10b981" radius={[4,4,0,0]} />
                    <Bar dataKey="saidas" name="Saídas" fill="#ef4444" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-gray-400 py-10">Sem dados para exibir</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
