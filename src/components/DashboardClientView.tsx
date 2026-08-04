'use client'
import { useState, useMemo } from 'react'
import { motion, type Variants } from 'framer-motion'
import { formatBRL } from '@/lib/utils'
import { MESES } from '@/types'
import { Card } from '@/components/ui/Card'
import {
  TrendingUp, TrendingDown, CreditCard, Home, ArrowDownCircle,
  DollarSign, ArrowUpCircle, CheckCircle2, AlertTriangle,
  Activity, BarChart3,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
  ReferenceLine, Area, AreaChart,
} from 'recharts'

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899']

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { staggerChildren: 0.08 } },
}
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  show:   { opacity: 1, y: 0, transition: { ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
}

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

// Mini-card de resumo
function SummaryCard({ label, value, color, BgColor, Icon, trend }: {
  label: string; value: number; color: string; BgColor: string; Icon: React.ElementType; trend?: 'up' | 'down' | null
}) {
  return (
    <motion.div variants={itemVariants} whileHover={{ y: -4, scale: 1.015 }} transition={{ type: 'spring', stiffness: 300 }}>
      <Card className={`h-full border-b-4 ${color} overflow-hidden relative`}>
        {/* Ícone de fundo decorativo */}
        <div className={`absolute -right-3 -top-3 w-16 h-16 rounded-2xl ${BgColor} flex items-center justify-center opacity-40`}>
          <Icon size={28} strokeWidth={1.5} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-8 h-8 rounded-xl ${BgColor} flex items-center justify-center`}>
              <Icon size={15} strokeWidth={2} />
            </div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">{label}</div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">{formatBRL(value)}</div>
          {trend && (
            <div className={`flex items-center gap-1 mt-1 text-[11px] font-bold ${trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
              {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              vs. mês anterior
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  )
}

export default function DashboardClientView({ mes, ano, resumo, pieData, dadosMensais, totalSaidas, saldo }: any) {
  const [visao, setVisao] = useState<'mensal' | 'anual'>('mensal')

  const totalAnoEntradas = dadosMensais.reduce((acc: number, d: any) => acc + d.entradas, 0)
  const totalAnoSaidas   = dadosMensais.reduce((acc: number, d: any) => acc + d.saidas, 0)
  const saldoAno         = totalAnoEntradas - totalAnoSaidas

  const saldoAcumuladoData = useMemo(() => {
    let acumulado = 0
    return dadosMensais.map((d: any) => {
      const saldoMes = d.entradas - d.saidas
      acumulado += saldoMes
      return { mes: d.mes, saldoMes, acumulado }
    })
  }, [dadosMensais])

  return (
    <div>
      {/* Header + Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-7 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
            <span className="gradient-text">Dashboard</span>
          </h1>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-0.5">Resumo financeiro da família Fischer</p>
        </div>

        {/* Segmented control */}
        <div className="flex items-center glass p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/40 self-start sm:self-auto">
          {([['mensal', MESES[mes - 1]], ['anual', String(ano)]] as [string, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setVisao(key as 'mensal' | 'anual')}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                visao === key
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              {key === 'mensal' ? 'Mensal' : 'Anual'} <span className="opacity-70 text-xs">({label})</span>
            </button>
          ))}
        </div>
      </div>

      {visao === 'mensal' ? (
        <motion.div variants={containerVariants} initial="hidden" animate="show">

          {/* Cards de resumo */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-7">
            <SummaryCard label="Entradas"     value={resumo.entradas} color="border-b-emerald-500/60" BgColor="bg-emerald-100 dark:bg-emerald-500/10" Icon={DollarSign}      />
            <SummaryCard label="Cartões"      value={resumo.cartoes}  color="border-b-indigo-500/60"  BgColor="bg-indigo-100 dark:bg-indigo-500/10"  Icon={CreditCard}      />
            <SummaryCard label="Contas Fixas" value={resumo.fixas}    color="border-b-amber-500/60"   BgColor="bg-amber-100 dark:bg-amber-500/10"    Icon={Home}            />
            <SummaryCard label="Total Saídas" value={totalSaidas}     color="border-b-rose-500/60"    BgColor="bg-rose-100 dark:bg-rose-500/10"      Icon={ArrowDownCircle} />
          </div>

          {/* Card de saldo mensal */}
          <motion.div variants={itemVariants}>
            <Card className={`mb-7 overflow-hidden relative ${saldo >= 0 ? 'border-l-4 border-l-emerald-500' : 'border-l-4 border-l-rose-500'}`}>
              {/* Gradiente de fundo sutil */}
              <div
                className="absolute inset-0 opacity-[0.04] pointer-events-none"
                style={{
                  background: saldo >= 0
                    ? 'radial-gradient(ellipse at 80% 50%, #10b981 0%, transparent 70%)'
                    : 'radial-gradient(ellipse at 80% 50%, #ef4444 0%, transparent 70%)',
                }}
              />
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.2em] flex items-center gap-1.5">
                    <Activity size={12} />
                    Saldo do Mês — {MESES[mes - 1]}
                  </div>
                  <div className={`text-4xl font-black mt-2 tracking-tighter ${saldo >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {formatBRL(saldo)}
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-400/80 mt-2">
                    <span className="flex items-center gap-1 text-emerald-500">
                      <ArrowUpCircle size={12} /> {formatBRL(resumo.entradas)}
                    </span>
                    <span className="opacity-30">|</span>
                    <span className="flex items-center gap-1 text-rose-500">
                      <ArrowDownCircle size={12} /> {formatBRL(totalSaidas)}
                    </span>
                  </div>
                </div>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl ${
                  saldo >= 0
                    ? 'bg-emerald-100 dark:bg-emerald-500/15'
                    : 'bg-rose-100 dark:bg-rose-500/15'
                }`}>
                  {saldo >= 0
                    ? <CheckCircle2 size={32} className="text-emerald-500" strokeWidth={1.5} />
                    : <AlertTriangle size={32} className="text-rose-500" strokeWidth={1.5} />
                  }
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Gráficos mensais */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-7">
            <motion.div variants={itemVariants}>
              <Card className="h-full">
                <h2 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2 border-l-4 border-indigo-500 pl-3">
                  <BarChart3 size={13} /> Distribuição — {MESES[mes - 1]}
                </h2>
                {pieData.length > 0 ? (
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
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-slate-300 dark:text-slate-700">
                    <BarChart3 size={40} strokeWidth={1} />
                    <p className="text-sm mt-3 font-medium text-slate-400 dark:text-slate-600">Sem dados para {MESES[mes - 1]}</p>
                  </div>
                )}
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="h-full">
                <h2 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2 border-l-4 border-emerald-500 pl-3">
                  <Activity size={13} /> Entradas vs Saídas — {ano}
                </h2>
                {dadosMensais.length > 0 ? (
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
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-slate-300 dark:text-slate-700">
                    <BarChart3 size={40} strokeWidth={1} />
                    <p className="text-sm mt-3 font-medium text-slate-400 dark:text-slate-600">Sem dados para exibir</p>
                  </div>
                )}
              </Card>
            </motion.div>
          </div>

          {/* Alocação de renda */}
          {totalSaidas > 0 && (
            <motion.div variants={itemVariants}>
              <Card>
                <h2 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2 border-l-4 border-amber-500 pl-3">
                  <TrendingUp size={13} /> Alocação de Renda — {MESES[mes - 1]}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-5">
                  {[
                    { label: 'Entradas',     valor: resumo.entradas,   cor: 'bg-emerald-500', shadow: 'shadow-emerald-500/30' },
                    { label: 'Cartões',      valor: resumo.cartoes,    cor: 'bg-indigo-500',  shadow: 'shadow-indigo-500/30'  },
                    { label: 'Contas Fixas', valor: resumo.fixas,      cor: 'bg-amber-500',   shadow: 'shadow-amber-500/30'   },
                    { label: 'Combustível',  valor: resumo.combustivel, cor: 'bg-yellow-500', shadow: 'shadow-yellow-500/30'  },
                  ].filter(i => i.valor > 0).map(item => {
                    const pct = Math.min(100, (item.valor / Math.max(resumo.entradas, totalSaidas)) * 100)
                    return (
                      <div key={item.label} className="group">
                        <div className="flex justify-between mb-2">
                          <span className="text-slate-500 dark:text-slate-400 font-bold text-[11px] uppercase tracking-widest">{item.label}</span>
                          <span className="font-black text-slate-900 dark:text-slate-100 text-sm">{formatBRL(item.valor)}</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800/70 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 1.4, ease: 'circOut' }}
                            className={`h-full rounded-full ${item.cor} ${item.shadow} shadow-md`}
                          />
                        </div>
                        <div className="text-right text-[10px] text-slate-400 dark:text-slate-600 mt-1 font-medium">{pct.toFixed(0)}%</div>
                      </div>
                    )
                  })}
                </div>
              </Card>
            </motion.div>
          )}
        </motion.div>

      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="show">

          {/* Cards anuais */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-7">
            {[
              { label: 'Entradas no Ano', valor: totalAnoEntradas, Icon: ArrowUpCircle,   bg: 'bg-emerald-100 dark:bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-100 dark:border-emerald-900/30' },
              { label: 'Saídas no Ano',   valor: totalAnoSaidas,   Icon: ArrowDownCircle, bg: 'bg-rose-100 dark:bg-rose-500/10',      text: 'text-rose-700 dark:text-rose-400',       border: 'border-rose-100 dark:border-rose-900/30'     },
              { label: 'Saldo Anual',     valor: saldoAno,         Icon: Activity,        bg: saldoAno >= 0 ? 'bg-indigo-100 dark:bg-indigo-500/10' : 'bg-amber-100 dark:bg-amber-500/10', text: saldoAno >= 0 ? 'text-indigo-700 dark:text-indigo-400' : 'text-amber-700 dark:text-amber-400', border: saldoAno >= 0 ? 'border-indigo-100 dark:border-indigo-900/30' : 'border-amber-100 dark:border-amber-900/30' },
            ].map(({ label, valor, Icon, bg, text, border }) => (
              <motion.div key={label} variants={itemVariants} whileHover={{ y: -4 }}>
                <Card className={`${bg} ${border} border`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center border ${border}`}>
                      <Icon size={16} className={text} strokeWidth={2} />
                    </div>
                    <div className={`text-[10px] font-black uppercase tracking-widest ${text}`}>{label}</div>
                  </div>
                  <div className={`text-3xl font-black tracking-tighter ${text}`}>{formatBRL(valor)}</div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Gráfico anual */}
          <motion.div variants={itemVariants}>
            <Card className="overflow-hidden mb-6">
              <h2 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.25em] mb-8 text-center">
                Evolução Patrimonial — {ano}
              </h2>
              {dadosMensais.length > 0 ? (
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
              ) : (
                <div className="flex flex-col items-center justify-center py-24 text-slate-300 dark:text-slate-700">
                  <BarChart3 size={48} strokeWidth={1} />
                  <p className="text-sm mt-3 font-medium text-slate-400 dark:text-slate-600">Sem dados ao longo do ano de {ano}</p>
                </div>
              )}
            </Card>
          </motion.div>

          {/* Saldo acumulado */}
          {saldoAcumuladoData.length > 0 && (
            <motion.div variants={itemVariants}>
              <Card className="overflow-hidden">
                <h2 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.25em] mb-8 text-center">
                  Evolução do Saldo Acumulado — {ano}
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={saldoAcumuladoData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
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
              </Card>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  )
}
