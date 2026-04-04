'use client'
/**
 * Fischer Finanças 2026 — Layout Principal
 * Desenvolvido por Thiago Fischer
 */
import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { MESES } from '@/types'
import DrivePanel from '@/components/DrivePanel'
import CotacoesPanel from '@/components/CotacoesPanel'
import { MesProvider, useMes } from '@/context/MesContext'

const NAV_ITEMS = [
  { href: '/dashboard',              icon: '📊', label: 'Dashboard',             grupo: 'principal' },
  { href: '/dashboard/cartoes',      icon: '💳', label: 'Cartões de Crédito',   grupo: 'principal' },
  { href: '/dashboard/contas-fixas', icon: '🏠', label: 'Contas Fixas',         grupo: 'principal' },
  { href: '/dashboard/entradas',     icon: '💵', label: 'Entradas / Salários',  grupo: 'principal' },
  { href: '/dashboard/combustivel',  icon: '⛽', label: 'Combustível',           grupo: 'principal' },
  { href: '/dashboard/metas',        icon: '🎯', label: 'Metas e Orçamento',    grupo: 'principal' },
  { href: '/dashboard/relatorios',   icon: '📈', label: 'Relatórios',           grupo: 'principal' },
  { href: '/dashboard/notificacoes', icon: '🔔', label: 'Notificações',         grupo: 'principal' },
  // Fase 3
  { href: '/dashboard/open-finance', icon: '🏦', label: 'Open Finance',         grupo: 'avancado'  },
  { href: '/dashboard/ia-analise',   icon: '🤖', label: 'IA Financeira',        grupo: 'avancado'  },
  { href: '/dashboard/familia',      icon: '👨‍👩‍👧‍👦', label: 'Modo Família',         grupo: 'avancado'  },
  { href: '/dashboard/investimentos',icon: '📈', label: 'Investimentos',        grupo: 'avancado'  },
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
  const router   = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const { hora, data }        = useClock()
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
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950 transition-colors duration-200">

      {/* ── SIDEBAR ─────────────────────────────────────────── */}
      <aside className="w-64 bg-blue-900 dark:bg-gray-950 dark:border-r dark:border-gray-800 text-white flex flex-col min-h-screen fixed top-0 left-0 z-30">

        {/* Logo */}
        <div className="p-5 border-b border-blue-800 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <span className="text-3xl">💰</span>
            <div>
              <div className="font-bold text-base">Família Fischer</div>
              <div className="text-blue-300 dark:text-gray-500 text-xs">Finanças {ano}</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {/* Navegação Principal */}
          {NAV_ITEMS.filter(n => n.grupo === 'principal').map(({ href, icon, label }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={`${href}?mes=${mes}&ano=${ano}`}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-blue-700 dark:bg-blue-900 text-white shadow-inner'
                    : 'hover:bg-blue-800 dark:hover:bg-gray-800 text-blue-100 dark:text-gray-300'
                }`}
              >
                <span className="text-base">{icon}</span>
                {label}
              </Link>
            )
          })}

          {/* Seção Fase 3 — Recursos Avançados */}
          <div className="pt-3 pb-1">
            <div className="text-blue-400 dark:text-gray-500 text-xs uppercase tracking-widest px-3 pb-1 font-semibold">
              Recursos Avançados
            </div>
          </div>
          {NAV_ITEMS.filter(n => n.grupo === 'avancado').map(({ href, icon, label }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={`${href}?mes=${mes}&ano=${ano}`}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-blue-700 dark:bg-blue-900 text-white shadow-inner'
                    : 'hover:bg-blue-800 dark:hover:bg-gray-800 text-blue-100 dark:text-gray-300'
                }`}
              >
                <span className="text-base">{icon}</span>
                {label}
              </Link>
            )
          })}

          {/* Seletor de Ano/Mês — árvore expansível */}
          <div className="pt-5 pb-2 space-y-1">
            <div className="text-blue-400 dark:text-gray-500 text-xs uppercase tracking-widest px-3 pb-1 font-semibold">
              Período
            </div>

            {Array.from({ length: 2030 - 2026 + 1 }, (_, i) => 2026 + i).map(a => {
              const isAnoAtivo  = a === ano
              const isExpandido = a === anoExpandido
              return (
                <div key={a}>
                  {/* Cabeçalho do ano */}
                  <button
                    onClick={() => setAnoExpandido(isExpandido ? 0 : a)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      isAnoAtivo
                        ? 'bg-blue-700 dark:bg-blue-900 text-white'
                        : 'hover:bg-blue-800 dark:hover:bg-gray-800 text-blue-100 dark:text-gray-300'
                    }`}
                  >
                    <span>📅 {a}</span>
                    <span className="text-xs opacity-70">{isExpandido ? '▲' : '▼'}</span>
                  </button>

                  {/* Meses do ano expandido */}
                  {isExpandido && (
                    <div className="ml-3 mt-0.5 space-y-0.5 border-l-2 border-blue-700/40 dark:border-gray-700 pl-2">
                      {MESES.map((nome, i) => {
                        const m = i + 1
                        const ativo = isAnoAtivo && m === mes
                        return (
                          <button
                            key={m}
                            onClick={() => { setAno(a); setMes(m) }}
                            className={`w-full text-left px-2 py-1.5 rounded text-xs font-medium transition-colors ${
                              ativo
                                ? 'bg-blue-500 dark:bg-blue-700 text-white'
                                : 'text-blue-200 dark:text-gray-400 hover:bg-blue-800 dark:hover:bg-gray-800 hover:text-white'
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

            {/* Comprovantes Drive */}
            <div className="pt-2">
              <DrivePanel mes={mes} />
            </div>

            {/* Cotações ao vivo */}
            <CotacoesPanel />
          </div>
        </nav>
      </aside>

      {/* ── ÁREA PRINCIPAL ───────────────────────────────────── */}
      <div className="ml-64 flex-1 flex flex-col min-h-screen">

        {/* ── TOPBAR ────────────────────────────────────────── */}
        <header className="sticky top-0 z-20 h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 shadow-sm transition-colors">

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
            <div className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-2.5 py-1.5 rounded-lg border border-blue-100 dark:border-blue-900">
              <span>📅</span>
              <span>{MESES[mes - 1]} {ano}</span>
            </div>
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
        <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-950 transition-colors">
          {children}
        </main>
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
