'use client'
/**
 * Gráficos do Dashboard (recharts).
 * Isolados neste módulo para serem carregados sob demanda (next/dynamic),
 * mantendo o recharts fora do bundle inicial do dashboard.
 */
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
  ReferenceLine, Area, AreaChart,
} from 'recharts'
import { formatBRL } from '@/lib/utils'

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899']

// Tooltip customizado para gráficos
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60
                    rounded-2xl shadow-2xl p-4 text-sm font-semibold min-w-[140px]">
      {label && <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">{label}</div>}
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center justify-between gap-4 py-0.5">
          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
            <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
            {entry.name}
          </span>
          <span className="font-black text-slate-900 dark:text-slate-100">{formatBRL(Number(entry.value))}</span>
        </div>
      ))}
    </div>
  )
}

export function DistribuicaoPie({ pieData }: { pieData: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={pieData} dataKey="value" nameKey="name"
          cx="50%" cy="50%" innerRadius={62} outerRadius={92} paddingAngle={4}
          animationBegin={0} animationDuration={1400}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {pieData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  )
}

export function EntradasSaidasBar({ dadosMensais }: { dadosMensais: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={dadosMensais} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-slate-800" opacity={0.6} />
        <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} tickFormatter={(v: any) => `R$${(v / 1000).toFixed(0)}k`} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.04)', radius: 8 }} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12, fontWeight: 600 }} />
        <Bar dataKey="entradas" name="Entradas" fill="#10b981" radius={[6, 6, 0, 0]} animationBegin={200} animationDuration={1400} />
        <Bar dataKey="saidas"   name="Saídas"   fill="#6366f1" radius={[6, 6, 0, 0]} animationBegin={400} animationDuration={1400} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function EvolucaoAnualBar({ dadosMensais }: { dadosMensais: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={380}>
      <BarChart data={dadosMensais} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-800" vertical={false} opacity={0.6} />
        <XAxis dataKey="mes" tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} tickFormatter={(v: any) => `R$${(v / 1000).toFixed(0)}k`} tickLine={false} axisLine={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.04)', radius: 8 }} />
        <Legend wrapperStyle={{ paddingTop: '24px', fontSize: 12, fontWeight: 600 }} />
        <Bar dataKey="entradas" name="Entradas" fill="#10b981" radius={[8, 8, 0, 0]} maxBarSize={28} />
        <Bar dataKey="saidas"   name="Saídas"   fill="#6366f1" radius={[8, 8, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function SaldoAcumuladoArea({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
        <defs>
          <linearGradient id="gradientAcumulado" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#10b981" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0}    />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-800" vertical={false} opacity={0.6} />
        <XAxis dataKey="mes" tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} tickFormatter={(v: any) => `R$${(v / 1000).toFixed(0)}k`} tickLine={false} axisLine={false} />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }}
        />
        <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="4 4" strokeWidth={1.5} />
        <Legend wrapperStyle={{ paddingTop: '16px', fontSize: 12, fontWeight: 600 }}
          formatter={(v) => v === 'acumulado' ? 'Saldo Acumulado' : 'Saldo do Mês'} />
        <Area
          type="monotone" dataKey="acumulado"
          stroke="#10b981" strokeWidth={2.5}
          fill="url(#gradientAcumulado)"
          dot={(props: any) => {
            const { cx, cy, payload } = props
            return (
              <circle key={`dot-${payload.mes}`} cx={cx} cy={cy} r={4}
                fill={payload.acumulado >= 0 ? '#10b981' : '#ef4444'}
                stroke="white" strokeWidth={2}
              />
            )
          }}
          activeDot={{ r: 7, stroke: 'white', strokeWidth: 2 }}
          animationBegin={200} animationDuration={1600}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
