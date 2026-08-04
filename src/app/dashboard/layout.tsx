'use client'
export const dynamic = 'force-dynamic'
/**
 * Fischer Finanças 2026 — Layout Principal
 * Desenvolvido por Thiago Fischer
 */
import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { MESES } from '@/types'
import DrivePanel from '@/components/DrivePanel'
import CotacoesPanel from '@/components/CotacoesPanel'
import { MesProvider, useMes } from '@/context/MesContext'
import { UserProvider } from '@/context/UserContext'
import AIChatBot from '@/components/AIChatBot'
import GlobalSearch from '@/components/GlobalSearch'
import {
  LayoutDashboard, CreditCard, Home, DollarSign, Fuel,
  Target, BarChart2, Bell, Landmark, Bot, TrendingUp,
  Star, ChevronDown, Calendar, Search, Sun, Moon,
  LogOut, Wallet, PanelLeftClose, PanelLeftOpen,
  Clock as ClockIcon, CheckCircle2,
} from 'lucide-react'

// ── Mapeamento de ícones ─────────────────────────────────────────
const NAV_ITEMS = [
  { href: '/dashboard',                   icon: LayoutDashboard, label: 'Dashboard',           grupo: 'principal' },
  { href: '/dashboard/cartoes',           icon: CreditCard,      label: 'Cartões de Crédito',  grupo: 'principal' },
  { href: '/dashboard/contas-fixas',      icon: Home,            label: 'Contas Fixas',         grupo: 'principal' },
  { href: '/dashboard/entradas',          icon: DollarSign,      label: 'Entradas / Salários',  grupo: 'principal' },
  { href: '/dashboard/combustivel',       icon: Fuel,            label: 'Combustível',          grupo: 'principal' },
  { href: '/dashboard/metas',             icon: Target,          label: 'Metas e Orçamento',    grupo: 'principal' },
  { href: '/dashboard/relatorios',        icon: BarChart2,       label: 'Relatórios',           grupo: 'principal' },
  { href: '/dashboard/notificacoes',      icon: Bell,            label: 'Notificações',         grupo: 'principal' },
  { href: '/dashboard/open-finance',      icon: Landmark,        label: 'Open Finance',         grupo: 'avancado'  },
  { href: '/dashboard/ia-analise',        icon: Bot,             label: 'IA Financeira',        grupo: 'avancado'  },
  { href: '/dashboard/investimentos',     icon: TrendingUp,      label: 'Investimentos',        grupo: 'avancado'  },
  { href: '/dashboard/sonhos',            icon: Star,            label: 'Meus Sonhos',          grupo: 'planejamento' },
]

// ── Relógio isolado (evita re-render do layout a cada segundo) ───
function Clock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="leading-tight">
      <div className="text-sm font-bold text-slate-800 dark:text-slate-100 tabular-nums tracking-wide">
        {now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </div>
      <div className="text-[11px] text-slate-400 dark:text-slate-500 capitalize">
        {now.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })}
      </div>
    </div>
  )
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

// ── Atalhos de teclado ← → Alt+← Alt+→ ─────────────────────────
function useKeyboardNav(setMes: (m: number) => void, setAno: (a: number) => void, mes: number, ano: number) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if (e.altKey && e.key === 'ArrowLeft')  { e.preventDefault(); setAno(ano - 1) }
      else if (e.altKey && e.key === 'ArrowRight') { e.preventDefault(); setAno(ano + 1) }
      else if (e.key === 'ArrowLeft')  { e.preventDefault(); if (mes === 1)  { setMes(12); setAno(ano - 1) } else setMes(mes - 1) }
      else if (e.key === 'ArrowRight') { e.preventDefault(); if (mes === 12) { setMes(1);  setAno(ano + 1) } else setMes(mes + 1) }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [mes, ano, setMes, setAno])
}

// ── Componente de item de navegação ─────────────────────────────
function NavItem({ href, icon: Icon, label, active, mes, ano, collapsed }: {
  href: string; icon: React.ElementType; label: string;
  active: boolean; mes: number; ano: number; collapsed: boolean
}) {
  return (
    <Link
      href={`${href}?mes=${mes}&ano=${ano}`}
      title={collapsed ? label : undefined}
      className={`nav-item relative ${active ? 'nav-item-active' : 'nav-item-inactive'}`}
    >
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-white rounded-r-full" />
      )}
      <Icon size={16} strokeWidth={active ? 2.2 : 1.8} className="shrink-0" />
      <AnimatePresence>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
            className="truncate"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  )
}

function DashboardShell({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()
  const supabase = useMemo(() => createClient(), [])
  const [loading, setLoading]         = useState(true)
  const [buscaAberta, setBuscaAberta] = useState(false)
  const [collapsed, setCollapsed]     = useState(false)
  const { dark, toggle: toggleDark }  = useDarkMode()
  const checked = useRef(false)

  const { mes, setMes, ano, setAno } = useMes()
  const [anoExpandido, setAnoExpandido] = useState<number>(ano)

  useKeyboardNav(setMes, setAno, mes, ano)

  // Ctrl+K abre busca global
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setBuscaAberta(prev => !prev) }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const hoje = useMemo(() => ({ mes: new Date().getMonth() + 1, ano: new Date().getFullYear() }), [])

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
    <div className="min-h-screen flex items-center justify-center bg-[#f4f7fb] dark:bg-[#050d1a]">
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl animate-pulse-ring"
          style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
        >
          <Wallet size={26} className="text-white" strokeWidth={1.8} />
        </div>
        <div className="text-slate-400 dark:text-slate-500 text-sm font-medium tracking-wide">
          Carregando Fischer Finanças...
        </div>
      </div>
    </div>
  )

  const sidebarW = collapsed ? 72 : 256

  return (
    <div className="min-h-screen flex bg-[#f4f7fb] dark:bg-[#050d1a] transition-colors duration-500">

      {/* ── SIDEBAR ──────────────────────────────────────────────── */}
      <motion.aside
        animate={{ width: sidebarW }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-4 left-4 z-30 h-[calc(100vh-2rem)] flex flex-col rounded-3xl overflow-hidden shadow-2xl"
        style={{
          background: 'linear-gradient(180deg, #1e3a8a 0%, #1e1b4b 100%)',
          border: '1px solid rgba(255,255,255,0.1)',
          width: sidebarW,
        }}
      >
        {/* Logo + colapso */}
        <div className={`flex items-center border-b border-white/10 shrink-0 ${collapsed ? 'justify-center p-4' : 'justify-between p-5'}`}>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 overflow-hidden"
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-lg"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
              >
                <Wallet size={18} className="text-white" strokeWidth={1.8} />
              </div>
              <div className="overflow-hidden">
                <div className="font-bold text-base text-white tracking-tight truncate">Família Fischer</div>
                <div className="text-blue-300/50 text-xs font-bold uppercase tracking-widest">Finanças {ano}</div>
              </div>
            </motion.div>
          )}
          {collapsed && (
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
            >
              <Wallet size={18} className="text-white" strokeWidth={1.8} />
            </div>
          )}
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="text-blue-300/40 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
              title="Colapsar sidebar"
            >
              <PanelLeftClose size={16} />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className={`flex-1 overflow-y-auto overflow-x-hidden py-3 space-y-0.5 ${collapsed ? 'px-2' : 'px-3'}`}>

          {/* Contas Mensais */}
          {!collapsed && (
            <div className="text-blue-300/40 text-[10.5px] uppercase tracking-[0.25em] px-3 font-black pt-1 pb-1.5">
              Contas Mensais
            </div>
          )}
          {NAV_ITEMS.filter(n => n.grupo === 'principal').map(({ href, icon, label }) => (
            <NavItem key={href} href={href} icon={icon} label={label}
              active={pathname === href} mes={mes} ano={ano} collapsed={collapsed} />
          ))}

          {/* Período */}
          {!collapsed && (
            <>
              <div className="text-blue-300/40 text-[10.5px] uppercase tracking-[0.25em] px-3 font-black pt-4 pb-1.5">
                Período
              </div>
              {Array.from({ length: 2030 - 2026 + 1 }, (_, i) => 2026 + i).map(a => {
                const isAnoAtivo  = a === ano
                const isExpandido = a === anoExpandido
                return (
                  <div key={a}>
                    <button
                      onClick={() => setAnoExpandido(isExpandido ? 0 : a)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold
                                  transition-all duration-200 ${isAnoAtivo
                        ? 'bg-blue-600/20 text-white border border-white/10'
                        : 'hover:bg-white/5 text-blue-100/50 hover:text-white'}`}
                    >
                      <span className="flex items-center gap-2">
                        <Calendar size={12} className="shrink-0" />
                        {a}
                      </span>
                      <ChevronDown
                        size={12}
                        className={`transition-transform duration-300 ${isExpandido ? 'rotate-180' : ''}`}
                      />
                    </button>

                    <AnimatePresence>
                      {isExpandido && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: 'easeInOut' }}
                          className="overflow-hidden ml-3 border-l border-blue-700/30 pl-2 mt-0.5 space-y-0.5"
                        >
                          {MESES.map((nome, i) => {
                            const m    = i + 1
                            const ativo  = isAnoAtivo && m === mes
                            const ehHoje = a === hoje.ano && m === hoje.mes
                            return (
                              <button
                                key={m}
                                onClick={() => { setAno(a); setMes(m) }}
                                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold
                                            transition-all duration-200 flex items-center justify-between gap-1 ${ativo
                                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                                  : 'text-blue-100/40 hover:bg-white/10 hover:text-white'}`}
                              >
                                <span>{nome}</span>
                                {ehHoje && (
                                  <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-black leading-none ${ativo
                                    ? 'bg-white/25 text-white'
                                    : 'bg-emerald-400/25 text-emerald-300'
                                  }`}>
                                    Hoje
                                  </span>
                                )}
                              </button>
                            )
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </>
          )}

          {/* Recursos Avançados */}
          {!collapsed && (
            <div className="text-blue-300/40 text-[10.5px] uppercase tracking-[0.25em] px-3 font-black pt-4 pb-1.5">
              Recursos Avançados
            </div>
          )}
          {NAV_ITEMS.filter(n => n.grupo === 'avancado').map(({ href, icon, label }) => (
            <NavItem key={href} href={href} icon={icon} label={label}
              active={pathname === href} mes={mes} ano={ano} collapsed={collapsed} />
          ))}

          {/* Planejamento */}
          {!collapsed && (
            <div className="text-blue-300/40 text-[10.5px] uppercase tracking-[0.25em] px-3 font-black pt-4 pb-1.5">
              Planejamento
            </div>
          )}
          {NAV_ITEMS.filter(n => n.grupo === 'planejamento').map(({ href, icon, label }) => (
            <NavItem key={href} href={href} icon={icon} label={label}
              active={pathname === href} mes={mes} ano={ano} collapsed={collapsed} />
          ))}

          {/* Drive + Cotações — apenas quando expandido */}
          {!collapsed && (
            <>
              <div className="pt-4 pb-1 border-t border-white/5 mt-3">
                <DrivePanel mes={mes} />
              </div>
              <div className="pt-2">
                <CotacoesPanel />
              </div>
            </>
          )}
        </nav>

        {/* Footer — logout + expandir */}
        <div className={`shrink-0 border-t border-white/10 ${collapsed ? 'p-2 flex flex-col gap-2 items-center' : 'p-3 flex items-center gap-2'}`}>
          {collapsed ? (
            <>
              <button
                onClick={() => setCollapsed(false)}
                className="w-9 h-9 flex items-center justify-center rounded-xl text-blue-300/60
                           hover:text-white hover:bg-white/10 transition-all"
                title="Expandir sidebar"
              >
                <PanelLeftOpen size={16} />
              </button>
              <button
                onClick={() => { if (window.confirm('Deseja sair?')) handleLogout() }}
                className="w-9 h-9 flex items-center justify-center rounded-xl text-blue-300/60
                           hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                title="Sair"
              >
                <LogOut size={15} />
              </button>
            </>
          ) : (
            <>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-white/80 truncate">Fischer Finanças</div>
                <div className="text-[11px] text-blue-300/40 truncate">v3.7</div>
              </div>
              <button
                onClick={() => { if (window.confirm('Deseja sair? Seus dados estão salvos automaticamente.')) handleLogout() }}
                title="Sair da conta"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold
                           text-blue-200/50 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
              >
                <LogOut size={14} />
                Sair
              </button>
            </>
          )}
        </div>
      </motion.aside>

      {/* ── ÁREA PRINCIPAL ────────────────────────────────────────── */}
      <motion.div
        animate={{ marginLeft: sidebarW + 16 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="flex-1 flex flex-col min-h-screen p-4 pr-6"
        style={{ marginLeft: sidebarW + 16 }}
      >

        {/* ── TOPBAR ───────────────────────────────────────────── */}
        <header className="sticky top-4 z-20 h-16 glass dark:glass rounded-2xl flex items-center justify-between px-6 shadow-lg mb-6 transition-all duration-500"
          style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(20px)' }}
        >

          {/* Esquerda — relógio + mês */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <ClockIcon size={16} className="text-slate-400 dark:text-slate-500 shrink-0" />
              <Clock />
            </div>

            <div className="w-px h-7 bg-slate-200 dark:bg-slate-700/60" />

            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="hidden md:flex items-center gap-1.5 text-[11px] font-bold text-blue-600 dark:text-blue-400
                         bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-full
                         border border-blue-100 dark:border-blue-800/50 select-none"
            >
              <Calendar size={12} />
              {MESES[mes - 1]} {ano}
            </motion.div>
          </div>

          {/* Direita — ações */}
          <div className="flex items-center gap-2">

            {/* Busca global */}
            <button
              id="global-search-btn"
              onClick={() => setBuscaAberta(true)}
              title="Busca Global (Ctrl+K)"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium
                         text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/50
                         hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200
                         transition-all"
            >
              <Search size={14} />
              <span className="hidden lg:inline text-[11px] text-slate-400 dark:text-slate-600 font-bold">Ctrl+K</span>
            </button>

            {/* Dados salvos */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-500
                            bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1.5 rounded-xl
                            border border-emerald-100 dark:border-emerald-900/50">
              <CheckCircle2 size={13} />
              <span className="font-semibold">Salvo</span>
            </div>

            {/* Dark mode */}
            <button
              onClick={toggleDark}
              title={dark ? 'Modo claro' : 'Modo escuro'}
              className="w-9 h-9 flex items-center justify-center rounded-xl
                         bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700
                         text-slate-600 dark:text-slate-400 transition-all"
            >
              {dark
                ? <Sun size={16} className="text-amber-400" />
                : <Moon size={16} className="text-slate-500" />
              }
            </button>
          </div>
        </header>

        {/* ── CONTEÚDO ──────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.main
            key={pathname}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 pb-8"
          >
            {children}
          </motion.main>
        </AnimatePresence>
      </motion.div>

      {/* Assistente IA Flutuante */}
      <AIChatBot />

      {/* Busca Global */}
      <GlobalSearch isOpen={buscaAberta} onClose={() => setBuscaAberta(false)} />
    </div>
  )
}

// ── Layout raiz ─────────────────────────────────────────────────
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const mesInicial = new Date().getMonth() + 1
  const anoInicial = new Date().getFullYear()
  return (
    <UserProvider>
      <MesProvider mesInicial={mesInicial} anoInicial={anoInicial}>
        <DashboardShell>{children}</DashboardShell>
      </MesProvider>
    </UserProvider>
  )
}
