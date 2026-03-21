'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { MESES } from '@/types'
import DrivePanel from '@/components/DrivePanel'
import { MesProvider, useMes } from '@/context/MesContext'

const NAV_ITEMS = [
  { href: '/dashboard',              icon: '📊', label: 'Dashboard'           },
  { href: '/dashboard/cartoes',      icon: '💳', label: 'Cartões de Crédito'  },
  { href: '/dashboard/contas-fixas', icon: '🏠', label: 'Contas Fixas'        },
  { href: '/dashboard/entradas',     icon: '💵', label: 'Entradas / Salários'  },
  { href: '/dashboard/combustivel',  icon: '⛽', label: 'Combustível'          },
]

// ── Relógio ────────────────────────────────────────────────────
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

// ── Dark mode — padrão CLARO ───────────────────────────────────
function useDarkMode() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    // Só ativa dark se o usuário tiver salvo explicitamente
    const saved = localStorage.getItem('fischer-dark')
    const isDark = saved === 'true'
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

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const [loading, setLoading]   = useState(true)
  const [mesAtivo, setMesAtivo] = useState(new Date().getMonth() + 1)
  const { hora, data } = useClock()
  const { dark, toggle: toggleDark } = useDarkMode()
  const checked = useRef(false)
  const [ultimoAcesso, setUltimoAcesso] = useState<string>('')

  useEffect(() => {
    const salvo = localStorage.getItem('fischer-ultimo-acesso')
    if (salvo) setUltimoAcesso(salvo)
  }, [])

  useEffect(() => {
    if (checked.current) return
    checked.current = true

    // Verifica sessão UMA vez — sem loop, sem dupla requisição
    // getSession() usa cache local do Supabase, é praticamente instantâneo
    supabase.auth.getSession().then(({ data: d }) => {
      if (!d.session) {
        router.replace('/')
      } else {
        setLoading(false)
      }
    })
  }, [])

  async function handleLogout() {
    // Salva timestamp do último acesso antes de sair
    if (typeof window !== 'undefined') {
      localStorage.setItem('fischer-ultimo-acesso',
        new Date().toLocaleString('pt-BR', {
          day: '2-digit', month: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit'
        })
      )
    }
    await supabase.auth.signOut()
    router.replace('/')
  }

  function handleMesChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const m = Number(e.target.value)
    setMesAtivo(m)
    window.dispatchEvent(new CustomEvent('mesChange', { detail: m }))
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
              <div className="text-blue-300 dark:text-gray-500 text-xs">Finanças 2026</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map(({ href, icon, label }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
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

          {/* Mês Ativo + Comprovantes Drive logo abaixo */}
          <div className="pt-5 pb-2 space-y-2">
            <div className="text-blue-400 dark:text-gray-500 text-xs uppercase tracking-widest px-3 font-semibold">
              Mês Ativo
            </div>
            <select
              value={mesAtivo}
              onChange={handleMesChange}
              className="w-full bg-blue-800 dark:bg-gray-800 text-white border border-blue-700 dark:border-gray-700 rounded-lg px-3 py-2 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {MESES.map((m, i) => (
                <option key={i} value={i + 1}>{m}</option>
              ))}
            </select>

            {/* Comprovantes Drive — imediatamente abaixo do seletor de mês */}
            <DrivePanel mes={mesAtivo} />
          </div>
        </nav>
      </aside>

      {/* ── ÁREA PRINCIPAL ───────────────────────────────────── */}
      <div className="ml-64 flex-1 flex flex-col min-h-screen">

        {/* ── TOPBAR ────────────────────────────────────────── */}
        <header className="sticky top-0 z-20 h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 shadow-sm transition-colors">

          {/* Relógio */}
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

          {/* Ações */}
          <div className="flex items-center gap-2">

            {/* Indicador de dados salvos */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-green-600 dark:text-green-500 bg-green-50 dark:bg-green-950/30 px-2.5 py-1.5 rounded-lg border border-green-100 dark:border-green-900">
              <span>✓</span>
              <span className="font-medium">Dados salvos</span>
            </div>

            {/* Dark mode toggle */}
            <button
              onClick={toggleDark}
              title={dark ? 'Modo claro' : 'Modo escuro'}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-lg"
            >
              {dark ? '☀️' : '🌙'}
            </button>

            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />

            {/* Sair com confirmação */}
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
          <MesProvider>
            {children}
          </MesProvider>
        </main>
      </div>
    </div>
  )
}
