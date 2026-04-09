'use client'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899']

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

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
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* Cards de resumo Mensal */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div variants={itemVariants} whileHover={{ y: -5, scale: 1.02 }} transition={{ type: 'spring', stiffness: 300 }}>
              <Card className="h-full border-b-4 border-b-emerald-500/50">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2 ml-0.5">Entradas</div>
                <div className="text-2xl font-black text-emerald-600 tracking-tight">{formatBRL(resumo.entradas)}</div>
              </Card>
            </motion.div>
            <motion.div variants={itemVariants} whileHover={{ y: -5, scale: 1.02 }} transition={{ type: 'spring', stiffness: 300 }}>
              <Card className="h-full border-b-4 border-b-indigo-500/50">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2 ml-0.5">Cartões</div>
                <div className="text-2xl font-black text-indigo-600 tracking-tight">{formatBRL(resumo.cartoes)}</div>
              </Card>
            </motion.div>
            <motion.div variants={itemVariants} whileHover={{ y: -5, scale: 1.02 }} transition={{ type: 'spring', stiffness: 300 }}>
              <Card className="h-full border-b-4 border-b-amber-500/50">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2 ml-0.5">Contas Fixas</div>
                <div className="text-2xl font-black text-amber-600 tracking-tight">{formatBRL(resumo.fixas)}</div>
              </Card>
            </motion.div>
            <motion.div variants={itemVariants} whileHover={{ y: -5, scale: 1.02 }} transition={{ type: 'spring', stiffness: 300 }}>
              <Card className="h-full border-b-4 border-b-rose-500/50">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2 ml-0.5">Total Saídas</div>
                <div className="text-2xl font-black text-rose-600 tracking-tight">{formatBRL(totalSaidas)}</div>
              </Card>
            </motion.div>
          </div>

          {/* Saldo Mensal */}
          <motion.div variants={itemVariants}>
            <Card className={`mb-8 border-l-8 overflow-hidden relative ${saldo >= 0 ? 'border-l-emerald-500' : 'border-l-rose-500'}`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-current opacity-5 rounded-full -mr-16 -mt-16 pointer-events-none" />
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <div className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.2em]">
                    Saldo do Mês — {MESES[mes - 1]}
                  </div>
                  <div className={`text-4xl font-black mt-2 tracking-tighter ${saldo >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {formatBRL(saldo)}
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400/80 mt-2">
                    <span className="text-emerald-500/80">{formatBRL(resumo.entradas)} IN</span> 
                    <span className="opacity-30">|</span>
                    <span className="text-rose-500/80">{formatBRL(totalSaidas)} OUT</span>
                  </div>
                </div>
                <div className="text-6xl drop-shadow-xl select-none">{saldo >= 0 ? '✅' : '⚠️'}</div>
              </div>
            </Card>
          </motion.div>

          {/* Gráficos Mensais */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <motion.div variants={itemVariants}>
              <Card className="h-full">
                <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 px-1 border-l-4 border-indigo-500 pl-3">
                  Distribuição de Gastos — {MESES[mes - 1]}
                </h2>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%" cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        animationBegin={0}
                        animationDuration={1500}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {pieData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} cornerRadius={4} />)}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                        formatter={(v: any) => formatBRL(Number(v))} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-slate-400 py-16 font-medium italic">Sem dados para {MESES[mes - 1]}</div>
                )}
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="h-full">
                <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 px-1 border-l-4 border-emerald-500 pl-3">
                  Entradas vs Saídas — {ano}
                </h2>
                {dadosMensais.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={dadosMensais} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                      <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} tickFormatter={(v: any) => `R$${(v / 1000).toFixed(0)}k`} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                        formatter={(v: any) => formatBRL(Number(v))} 
                      />
                      <Legend iconType="circle" />
                      <Bar dataKey="entradas" name="Entradas" fill="#10b981" radius={[6, 6, 0, 0]} animationBegin={300} animationDuration={1500} />
                      <Bar dataKey="saidas" name="Saídas" fill="#6366f1" radius={[6, 6, 0, 0]} animationBegin={500} animationDuration={1500} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-slate-400 py-16 font-medium italic">Sem dados para exibir</div>
                )}
              </Card>
            </motion.div>
          </div>

          {/* Progresso de Pagamentos Mensal */}
          {totalSaidas > 0 && (
            <motion.div variants={itemVariants}>
              <Card>
                <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 px-1 border-l-4 border-amber-500 pl-3">
                  Alocação de Renda — {MESES[mes - 1]}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 text-sm">
                  {[
                    { label: 'Entradas', valor: resumo.entradas, cor: 'bg-emerald-500', shadow: 'shadow-emerald-500/20' },
                    { label: 'Cartões', valor: resumo.cartoes, cor: 'bg-indigo-500', shadow: 'shadow-indigo-500/20' },
                    { label: 'Contas Fixas', valor: resumo.fixas, cor: 'bg-amber-500', shadow: 'shadow-amber-500/20' },
                    { label: 'Combustível', valor: resumo.combustivel, cor: 'bg-yellow-500', shadow: 'shadow-yellow-500/20' },
                  ].filter(i => i.valor > 0).map(item => {
                    const pct = totalSaidas > 0 ? Math.min(100, (item.valor / Math.max(resumo.entradas, totalSaidas)) * 100) : 0
                    return (
                      <div key={item.label} className="group">
                        <div className="flex justify-between mb-2">
                          <span className="text-slate-500 font-bold group-hover:text-slate-800 transition-colors uppercase text-[10px] tracking-widest">{item.label}</span>
                          <span className="font-black text-slate-900 dark:text-slate-100">{formatBRL(item.valor)}</span>
                        </div>
                        <div className="w-full h-3 bg-slate-100 dark:bg-slate-800/50 rounded-full overflow-hidden p-0.5 border border-slate-200/50 dark:border-slate-700/50">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 1.5, ease: 'circOut' }}
                            className={`h-full rounded-full ${item.cor} ${item.shadow} shadow-lg`} 
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Card>
            </motion.div>
          )}
        </motion.div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* Visão Anual */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div variants={itemVariants} whileHover={{ y: -5 }}>
              <Card className="!bg-emerald-50/50 dark:!bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30">
                <div className="text-[10px] text-emerald-600 dark:text-emerald-500 font-black uppercase tracking-widest mb-2">Entradas no Ano</div>
                <div className="text-3xl font-black text-emerald-700 dark:text-emerald-400 tracking-tighter">{formatBRL(totalAnoEntradas)}</div>
              </Card>
            </motion.div>
            <motion.div variants={itemVariants} whileHover={{ y: -5 }}>
              <Card className="!bg-rose-50/50 dark:!bg-rose-900/10 border-rose-100 dark:border-rose-900/30">
                <div className="text-[10px] text-rose-600 dark:text-rose-500 font-black uppercase tracking-widest mb-2">Saídas no Ano</div>
                <div className="text-3xl font-black text-rose-700 dark:text-rose-400 tracking-tighter">{formatBRL(totalAnoSaidas)}</div>
              </Card>
            </motion.div>
            <motion.div variants={itemVariants} whileHover={{ y: -5 }}>
              <Card className={saldoAno >= 0 ? "!bg-indigo-50/50 dark:!bg-indigo-900/10 border-indigo-100 dark:border-indigo-900/30" : "!bg-amber-50/50 dark:!bg-amber-900/10 border-amber-100 dark:border-amber-900/30"}>
                <div className={`text-[10px] font-black uppercase tracking-widest mb-2 ${saldoAno >= 0 ? 'text-indigo-600 dark:text-indigo-500' : 'text-amber-600 dark:text-amber-500'}`}>Saldo Anual</div>
                <div className={`text-3xl font-black tracking-tighter ${saldoAno >= 0 ? 'text-indigo-700 dark:text-indigo-400' : 'text-amber-700 dark:text-amber-400'}`}>{formatBRL(saldoAno)}</div>
              </Card>
            </motion.div>
          </div>

          <motion.div variants={itemVariants}>
            <Card className="overflow-hidden">
              <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-10 text-center">
                Evolução Patrimonial — {ano}
              </h2>
              {dadosMensais.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={dadosMensais} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} opacity={0.5} />
                    <XAxis dataKey="mes" tick={{ fontSize: 11, fontWeight: 'bold', fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} tickFormatter={(v: any) => `R$${(v / 1000).toFixed(0)}k`} tickLine={false} axisLine={false} />
                    <Tooltip 
                      cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }} 
                      contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', fontWeight: 'bold', padding: '16px' }}
                      formatter={(v: any) => formatBRL(Number(v))} 
                    />
                    <Legend wrapperStyle={{ paddingTop: '30px' }} />
                    <Bar dataKey="entradas" name="Entradas" fill="#10b981" radius={[8, 8, 0, 0]} maxBarSize={32} />
                    <Bar dataKey="saidas" name="Saídas" fill="#6366f1" radius={[8, 8, 0, 0]} maxBarSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-slate-400 py-24 font-medium italic">Sem dados ao longo do ano de {ano}</div>
              )}
            </Card>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
