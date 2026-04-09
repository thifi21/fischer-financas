'use client'
/**
 * Fischer Finanças 2026 — Layout Principal
 * Desenvolvido por Thiago Fischer
 */
import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { MESES } from '@/types'
import DrivePanel from '@/components/DrivePanel'
import CotacoesPanel from '@/components/CotacoesPanel'
import { MesProvider, useMes } from '@/context/MesContext'

const NAV_ITEMS = [
  { href: '/dashboard', icon: '📊', label: 'Dashboard', grupo: 'principal' },
  { href: '/dashboard/cartoes', icon: '💳', label: 'Cartões de Crédito', grupo: 'principal' },
  { href: '/dashboard/contas-fixas', icon: '🏠', label: 'Contas Fixas', grupo: 'principal' },
  { href: '/dashboard/entradas', icon: '💵', label: 'Entradas / Salários', grupo: 'principal' },
  { href: '/dashboard/combustivel', icon: '⛽', label: 'Combustível', grupo: 'principal' },
  { href: '/dashboard/metas', icon: '🎯', label: 'Metas e Orçamento', grupo: 'principal' },
  { href: '/dashboard/relatorios', icon: '📈', label: 'Relatórios', grupo: 'principal' },
  { href: '/dashboard/notificacoes', icon: '🔔', label: 'Notificações', grupo: 'principal' },
  // Fase 3
  { href: '/dashboard/open-finance', icon: '🏦', label: 'Open Finance', grupo: 'avancado' },
  { href: '/dashboard/ia-analise', icon: '🤖', label: 'IA Financeira', grupo: 'avancado' },
  { href: '/dashboard/investimentos', icon: '📈', label: 'Investimentos', grupo: 'avancado' },
]

function useClock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  return {
    hora: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    data: now.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' }),
  }
}

function useDarkMode() {
  const [dark, setDark] = useState(false)
  useEffect(() => {
    const isDark = localStorage.getItem('fischer-dark') === 'true'
    setDark(isDark)
    document.documentElement.classList.toggle('dark', isDark)
  }, [])
  const toggle = useCallback(() => {
    setDark(prev => {
      const next = !prev
      document.documentElement.classList.toggle('dark', next)
      localStorage.setItem('fischer-dark', String(next))
      return next
    })
  }, [])
  return { dark, toggle }
}

// ── Componente interno que usa o contexto do mês ───────────────
// Separado para poder chamar useMes() dentro do MesProvider
function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const { hora, data } = useClock()
  const { dark, toggle: toggleDark } = useDarkMode()
  const checked = useRef(false)

  // Lê o mês do contexto — fonte única de verdade
  const { mes, setMes, ano, setAno } = useMes()

  // Estado local para controlar qual ano está expandido na sidebar
  const [anoExpandido, setAnoExpandido] = useState<number>(ano)

  useEffect(() => {
    if (checked.current) return
    checked.current = true
    supabase.auth.getSession().then(({ data: d }) => {
      if (!d.session) router.replace('/')
      else setLoading(false)
    })
  }, [])

  async function handleLogout() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('fischer-ultimo-acesso',
        new Date().toLocaleString('pt-BR', {
          day: '2-digit', month: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit',
        })
      )
    }
    await supabase.auth.signOut()
    router.replace('/')
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="text-center">
        <div className="text-4xl mb-4 animate-bounce">💰</div>
        <div className="text-gray-500 dark:text-gray-400 text-sm font-medium">
          Carregando Fischer Finanças...
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex bg-[#f8fafc] dark:bg-[#020617] transition-colors duration-500">

      {/* ── SIDEBAR ─────────────────────────────────────────── */}
      <aside className="w-64 glass dark:glass-dark !bg-blue-900/90 dark:!bg-slate-950/80 text-white flex flex-col h-[calc(100vh-2rem)] fixed top-4 left-4 z-30 rounded-3xl overflow-hidden shadow-2xl border-white/20 dark:border-slate-800/50">

        {/* Logo */}
        <div className="p-6 border-b border-white/10 dark:border-slate-800/50">
          <div className="flex items-center gap-3">
            <motion.span 
              initial={{ rotate: -20, scale: 0.8 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="text-3xl filter drop-shadow-md"
            >
              💰
            </motion.span>
            <div>
              <div className="font-bold text-base tracking-tight">Família Fischer</div>
              <div className="text-blue-200/60 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest">Finanças {ano}</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-0.5">
          {/* Navegação Principal */}
          <div className="pt-1 pb-1">
            <div className="text-blue-300/60 dark:text-gray-500 text-[10px] uppercase tracking-[0.2em] px-3 font-black">
              Contas Mensais
            </div>
          </div>
          {NAV_ITEMS.filter(n => n.grupo === 'principal').map(({ href, icon, label }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={`${href}?mes=${mes}&ano=${ano}`}
                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 group ${active
                    ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-lg shadow-blue-500/20 active:scale-95'
                    : 'hover:bg-white/10 dark:hover:bg-slate-800/50 text-blue-100/80 dark:text-slate-400 hover:text-white dark:hover:text-slate-200'
                  }`}
              >
                <span className={`text-base transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-125'}`}>{icon}</span>
                {label}
              </Link>
            )
          })}

          {/* Seletor de Ano/Mês — árvore expansível */}
          <div className="pt-3 pb-1 space-y-0.5">
            <div className="text-blue-300/60 dark:text-gray-500 text-[10px] uppercase tracking-[0.2em] px-3 font-black">
              Período
            </div>

            {Array.from({ length: 2030 - 2026 + 1 }, (_, i) => 2026 + i).map(a => {
              const isAnoAtivo = a === ano
              const isExpandido = a === anoExpandido
              return (
                <div key={a}>
                  {/* Cabeçalho do ano */}
                  <button
                    onClick={() => setAnoExpandido(isExpandido ? 0 : a)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all duration-300 ${isAnoAtivo
                        ? 'bg-blue-600/20 dark:bg-blue-500/10 text-white border border-white/10'
                        : 'hover:bg-white/5 dark:hover:bg-slate-800/30 text-blue-100/60 dark:text-slate-500 hover:text-white'
                      }`}
                  >
                    <span className="flex items-center gap-2">📅 {a}</span>
                    <span className={`text-[8px] transition-transform duration-300 ${isExpandido ? 'rotate-180' : ''}`}>▼</span>
                  </button>

                  {/* Meses do ano expandido */}
                  {isExpandido && (
                    <div className="ml-2.5 mt-0.5 space-y-0.5 border-l-2 border-blue-700/40 dark:border-gray-700 pl-2">
                      {MESES.map((nome, i) => {
                        const m = i + 1
                        const ativo = isAnoAtivo && m === mes
                        return (
                          <button
                            key={m}
                            onClick={() => { setAno(a); setMes(m) }}
                            className={`w-full text-left px-2 py-1 rounded-lg text-xs font-bold transition-all duration-300 ${ativo
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'text-blue-100/40 dark:text-slate-600 hover:bg-white/10 dark:hover:bg-slate-800/10 hover:text-white dark:hover:text-slate-300'
                              }`}
                          >
                            {nome}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Seção Fase 3 — Recursos Avançados */}
          <div className="pt-3 pb-1">
            <div className="text-blue-300/60 dark:text-gray-500 text-[10px] uppercase tracking-[0.2em] px-3 font-black">
              Recursos Avançados
            </div>
          </div>
          {NAV_ITEMS.filter(n => n.grupo === 'avancado').map(({ href, icon, label }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={`${href}?mes=${mes}&ano=${ano}`}
                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 group ${active
                    ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-lg shadow-blue-500/20 active:scale-95'
                    : 'hover:bg-white/10 dark:hover:bg-slate-800/50 text-blue-100/80 dark:text-slate-400 hover:text-white dark:hover:text-slate-200'
                  }`}
              >
                <span className={`text-base transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-125'}`}>{icon}</span>
                {label}
              </Link>
            )
          })}

          {/* Comprovantes Drive */}
          <div className="pt-5 pb-2">
            <DrivePanel mes={mes} />
          </div>

          {/* Cotações ao vivo */}
          <div className="pt-2">
            <CotacoesPanel />
          </div>
        </nav>
      </aside>

      {/* ── ÁREA PRINCIPAL ───────────────────────────────────── */}
      <div className="ml-[18rem] flex-1 flex flex-col min-h-screen p-4 pr-6">

        {/* ── TOPBAR ────────────────────────────────────────── */}
        <header className="sticky top-4 z-20 h-16 glass dark:glass-dark !bg-white/80 dark:!bg-slate-900/60 rounded-2xl flex items-center justify-between px-8 shadow-xl border-white/40 dark:border-slate-800/50 mb-6 mx-2 transition-all duration-500">

          {/* Relógio + Mês ativo */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-lg select-none">🕐</span>
              <div className="leading-tight">
                <div className="text-base font-bold text-gray-800 dark:text-gray-100 tabular-nums tracking-wide">
                  {hora}
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500 capitalize">
                  {data}
                </div>
              </div>
            </div>
            {/* Indicador do mês ativo */}
            <motion.div 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="hidden md:flex items-center gap-2 text-[10px] font-bold uppercase tracking-tighter text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-full border border-blue-100 dark:border-blue-800"
            >
              <span>📅</span>
              <span>{MESES[mes - 1]} {ano}</span>
            </motion.div>
          </div>

          {/* Ações */}
          <div className="flex items-center gap-2">

            {/* Dados salvos */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-green-600 dark:text-green-500 bg-green-50 dark:bg-green-950/30 px-2.5 py-1.5 rounded-lg border border-green-100 dark:border-green-900">
              <span>✓</span>
              <span className="font-medium">Dados salvos</span>
            </div>

            {/* Dark mode */}
            <button
              onClick={toggleDark}
              title={dark ? 'Modo claro' : 'Modo escuro'}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-lg"
            >
              {dark ? '☀️' : '🌙'}
            </button>

            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />

            {/* Sair */}
            <button
              onClick={() => {
                if (window.confirm('Deseja sair? Seus dados estão salvos automaticamente no banco de dados.')) {
                  handleLogout()
                }
              }}
              title="Sair da conta (dados salvos automaticamente)"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              <span className="text-base">🚪</span>
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </header>

        {/* ── CONTEÚDO ─────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.main 
            key={pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 p-2"
          >
            {children}
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  )
}

// ── Layout raiz — MesProvider envolve TUDO incluindo a sidebar ──
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const mesInicial = new Date().getMonth() + 1
  const anoInicial = new Date().getFullYear()
  return (
    <MesProvider mesInicial={mesInicial} anoInicial={anoInicial}>
      <DashboardShell>{children}</DashboardShell>
    </MesProvider>
  )
}
