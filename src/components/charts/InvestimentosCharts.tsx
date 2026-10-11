'use client'
/**
 * Gráficos da página de Investimentos (recharts), isolados para carregamento sob demanda.
 */
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend,
} from 'recharts'
import { formatBRL } from '@/lib/utils'

export function ComparacaoLineChart({
  data, nomeA, nomeB,
}: { data: any[]; nomeA: string; nomeB: string }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
        <Tooltip formatter={(v: any, name: string) => [formatBRL(Number(v)), name]} />
        <Legend />
        <Line type="monotone" dataKey={nomeA} stroke="#3b82f6" strokeWidth={2.5} dot={false} />
        <Line type="monotone" dataKey={nomeB} stroke="#a855f7" strokeWidth={2.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function PatrimonioLineChart({
  data, modo, metaValor, rendaDesejada, taxaMensal,
}: {
  data: any[]
  modo: string
  metaValor: number
  rendaDesejada: number
  taxaMensal: number
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
        <Tooltip
          formatter={(v: any, name: string) => [
            formatBRL(Number(v)),
            name === 'valor' ? 'Patrimônio' : name === 'aportado' ? 'Total Aportado' : 'Juros',
          ]}
        />
        {modo === 'meta' && metaValor > 0 && (
          <ReferenceLine y={metaValor} stroke="#f59e0b" strokeDasharray="5 5"
            label={{ value: 'Meta', fill: '#f59e0b', fontSize: 11 }} />
        )}
        {modo === 'aposentadoria' && rendaDesejada > 0 && (
          <ReferenceLine y={rendaDesejada / (taxaMensal / 100)} stroke="#8b5cf6"
            strokeDasharray="5 5"
            label={{ value: 'Capital Necessário', fill: '#8b5cf6', fontSize: 11 }} />
        )}
        <Line type="monotone" dataKey="valor" stroke="#3b82f6" strokeWidth={2.5}
          dot={false} name="valor" />
        <Line type="monotone" dataKey="aportado" stroke="#9ca3af" strokeWidth={1.5}
          dot={false} strokeDasharray="4 4" name="aportado" />
      </LineChart>
    </ResponsiveContainer>
  )
}
