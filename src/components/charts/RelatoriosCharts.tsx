'use client'
/**
 * Gráficos da página de Relatórios (recharts), isolados para carregamento sob demanda.
 */
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { formatBRL } from '@/lib/utils'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

export function EvolucaoPorMesBar({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="mes" />
        <YAxis />
        <Tooltip formatter={(value: any) => formatBRL(value)} />
        <Legend />
        <Bar dataKey="cartoes" fill="#3b82f6" name="Cartões" />
        <Bar dataKey="fixas" fill="#10b981" name="Contas Fixas" />
        <Bar dataKey="combustivel" fill="#f59e0b" name="Combustível" />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function DistribuicaoCategoriaPie({ data, totalGeral }: { data: any[]; totalGeral: number }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={(entry: any) => `${entry.name}: ${((entry.value / totalGeral) * 100).toFixed(0)}%`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry: any, index: number) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: any) => formatBRL(value)} />
      </PieChart>
    </ResponsiveContainer>
  )
}
