'use client'
import { useState } from 'react'
import { formatBRL } from '@/lib/utils'
import { MESES } from '@/types'
import { Card } from '@/components/ui/Card'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899']

export default function DashboardClientView({ mes, ano, resumo, pieData, dadosMensais, totalSaidas, saldo }: any) {
  const [visao, setVisao] = useState<'mensal' | 'anual'>('mensal')

  const totalAnoEntradas = dadosMensais.reduce((acc: number, d: any) => acc + d.entradas, 0)
  const totalAnoSaidas = dadosMensais.reduce((acc: number, d: any) => acc + d.saidas, 0)
  const saldoAno = totalAnoEntradas - totalAnoSaidas

  return (
    <div>
      {/* Header and Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">📊 Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Resumo financeiro da família</p>
        </div>
        <div className="flex items-center bg-gray-200 dark:bg-gray-800 p-1 rounded-lg">
          <button
            onClick={() => setVisao('mensal')}
            className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${visao === 'mensal' ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
          >
            Visão Mensal ({MESES[mes - 1]})
          </button>
          <button
            onClick={() => setVisao('anual')}
            className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${visao === 'anual' ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
          >
            Visão Anual ({ano})
          </button>
        </div>
      </div>

      {visao === 'mensal' ? (
        <>
          {/* Cards de resumo Mensal */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase mb-1">Entradas</div>
              <div className="text-2xl font-bold text-green-600">{formatBRL(resumo.entradas)}</div>
            </Card>
            <Card>
              <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase mb-1">Cartões</div>
              <div className="text-2xl font-bold text-blue-600">{formatBRL(resumo.cartoes)}</div>
            </Card>
            <Card>
              <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase mb-1">Contas Fixas</div>
              <div className="text-2xl font-bold text-orange-500">{formatBRL(resumo.fixas)}</div>
            </Card>
            <Card>
              <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase mb-1">Total Saídas</div>
              <div className="text-2xl font-bold text-red-600">{formatBRL(totalSaidas)}</div>
            </Card>
          </div>

          {/* Saldo Mensal */}
          <Card className={`mb-6 border-l-4 ${saldo >= 0 ? 'border-l-green-500' : 'border-l-red-500'}`}>
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
          </Card>

          {/* Gráficos Mensais */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
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
                      {pieData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: any) => formatBRL(Number(v))} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-gray-400 py-16">Sem dados para {MESES[mes - 1]}</div>
              )}
            </Card>

            <Card>
              <h2 className="font-bold text-gray-800 dark:text-gray-200 mb-4">
                Entradas vs Saídas — {ano}
              </h2>
              {dadosMensais.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={dadosMensais} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: any) => `R$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: any) => formatBRL(Number(v))} />
                    <Legend />
                    <Bar dataKey="entradas" name="Entradas" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="saidas" name="Saídas" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-gray-400 py-16">Sem dados para exibir</div>
              )}
            </Card>
          </div>

          {/* Progresso de Pagamentos Mensal */}
          {totalSaidas > 0 && (
            <Card>
              <h2 className="font-bold text-gray-800 dark:text-gray-200 mb-4">
                Progresso de Pagamentos — {MESES[mes - 1]}
              </h2>
              <div className="space-y-3 text-sm">
                {[
                  { label: 'Entradas', valor: resumo.entradas, cor: 'bg-green-500' },
                  { label: 'Cartões', valor: resumo.cartoes, cor: 'bg-blue-500' },
                  { label: 'Contas Fixas', valor: resumo.fixas, cor: 'bg-orange-500' },
                  { label: 'Combustível', valor: resumo.combustivel, cor: 'bg-yellow-500' },
                ].filter(i => i.valor > 0).map(item => {
                  const pct = totalSaidas > 0 ? Math.min(100, (item.valor / Math.max(resumo.entradas, totalSaidas)) * 100) : 0
                  return (
                    <div key={item.label}>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-600 dark:text-gray-400 font-medium">{item.label}</span>
                        <span className="font-bold text-gray-800 dark:text-gray-200">{formatBRL(item.valor)}</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div className={`h-2 rounded-full ${item.cor}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          )}
        </>
      ) : (
        <>
          {/* Visão Anual */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-green-50 dark:bg-green-950/20 border-green-100 dark:border-green-900">
              <div className="text-xs text-green-600 dark:text-green-500 font-semibold uppercase mb-1">Entradas no Ano</div>
              <div className="text-3xl font-bold text-green-700 dark:text-green-400">{formatBRL(totalAnoEntradas)}</div>
            </Card>
            <Card className="bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900">
              <div className="text-xs text-red-600 dark:text-red-500 font-semibold uppercase mb-1">Saídas no Ano</div>
              <div className="text-3xl font-bold text-red-700 dark:text-red-400">{formatBRL(totalAnoSaidas)}</div>
            </Card>
            <Card className={saldoAno >= 0 ? "bg-blue-50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900" : "bg-orange-50 dark:bg-orange-950/20 border-orange-100 dark:border-orange-900"}>
              <div className={`text-xs font-semibold uppercase mb-1 ${saldoAno >= 0 ? 'text-blue-600 dark:text-blue-500' : 'text-orange-600 dark:text-orange-500'}`}>Saldo Anual</div>
              <div className={`text-3xl font-bold ${saldoAno >= 0 ? 'text-blue-700 dark:text-blue-400' : 'text-orange-700 dark:text-orange-400'}`}>{formatBRL(saldoAno)}</div>
            </Card>
          </div>

          <Card>
            <h2 className="font-bold text-gray-800 dark:text-gray-200 mb-4 text-center">
              Evolução Patrimonial — {ano}
            </h2>
            {dadosMensais.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={dadosMensais} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="mes" tick={{ fontSize: 13, fill: '#6b7280' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(v: any) => `R$${(v / 1000).toFixed(0)}k`} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(v: any) => formatBRL(Number(v))} cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="entradas" name="Entradas" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="saidas" name="Saídas" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-gray-400 py-24">Sem dados ao longo do ano de {ano}</div>
            )}
          </Card>
        </>
      )}
    </div>
  )
}
