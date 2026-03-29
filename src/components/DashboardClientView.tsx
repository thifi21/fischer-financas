'use client'
import { formatBRL } from '@/lib/utils'
import { MESES } from '@/types'
import { Card } from '@/components/ui/Card'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899']

export default function DashboardClientView({ mes, ano, resumo, pieData, dadosMensais, totalSaidas, saldo }: any) {
  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">📊 Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">{MESES[mes - 1]} {ano}</p>
      </div>

      {/* Cards de resumo */}
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

      {/* Saldo */}
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

      {/* Gráficos */}
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
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: any) => formatBRL(Number(v))} />
                <Legend />
                <Bar dataKey="entradas" name="Entradas" fill="#10b981" radius={[4,4,0,0]} />
                <Bar dataKey="saidas"   name="Saídas"   fill="#ef4444" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-gray-400 py-16">Sem dados para exibir</div>
          )}
        </Card>
      </div>

      {/* Progresso de Pagamentos */}
      {totalSaidas > 0 && (
        <Card>
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
                    <div className={`h-2 rounded-full ${item.cor}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}
