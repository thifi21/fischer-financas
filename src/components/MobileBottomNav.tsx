'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { LayoutDashboard, CreditCard, Home, DollarSign, Plus, X } from 'lucide-react'

const TABS = [
  { href: '/dashboard',              icon: LayoutDashboard, label: 'Início'  },
  { href: '/dashboard/cartoes',      icon: CreditCard,      label: 'Cartões' },
  { href: '/dashboard/contas-fixas', icon: Home,            label: 'Contas'  },
  { href: '/dashboard/entradas',     icon: DollarSign,      label: 'Entradas' },
]

const ACOES = [
  { href: '/dashboard/contas-fixas', icon: Home,       label: 'Conta fixa'  },
  { href: '/dashboard/cartoes',      icon: CreditCard, label: 'Cartão'      },
  { href: '/dashboard/entradas',     icon: DollarSign, label: 'Entrada'     },
]

/** Barra inferior + botão "+ Lançamento" — somente mobile; o menu lateral continua intacto. */
export default function MobileBottomNav({ mes, ano }: { mes: number; ano: number }) {
  const pathname = usePathname()
  const [aberto, setAberto] = useState(false)
  const q = `?mes=${mes}&ano=${ano}`

  return (
    <div className="md:hidden">
      <AnimatePresence>
        {aberto && (
          <>
            <motion.button
              type="button"
              aria-label="Fechar menu de lançamento"
              onClick={() => setAberto(false)}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-slate-950/50"
            />
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}
              className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-stretch w-52"
              role="menu"
            >
              {ACOES.map(({ href, icon: Icon, label }) => (
                <Link
                  key={label} href={href + q} role="menuitem" onClick={() => setAberto(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl glass shadow-xl text-sm font-bold text-slate-800 dark:text-slate-100"
                >
                  <Icon size={18} aria-hidden /> Novo: {label}
                </Link>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <nav
        aria-label="Navegação rápida"
        className="fixed bottom-0 inset-x-0 z-40 glass border-t border-slate-200/60 dark:border-slate-700/50 px-2 pb-[env(safe-area-inset-bottom)]"
      >
        <ul className="grid grid-cols-5 items-end h-16">
          {TABS.slice(0, 2).map(t => <Tab key={t.href} {...t} q={q} active={pathname === t.href} />)}
          <li className="flex justify-center">
            <button
              type="button"
              onClick={() => setAberto(v => !v)}
              aria-label={aberto ? 'Fechar novo lançamento' : 'Novo lançamento'}
              aria-expanded={aberto}
              className="-mt-6 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl shadow-blue-600/30"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
            >
              {aberto ? <X size={24} /> : <Plus size={26} />}
            </button>
          </li>
          {TABS.slice(2).map(t => <Tab key={t.href} {...t} q={q} active={pathname === t.href} />)}
        </ul>
      </nav>
    </div>
  )
}

function Tab({ href, icon: Icon, label, active, q }: {
  href: string; icon: React.ElementType; label: string; active: boolean; q: string
}) {
  return (
    <li>
      <Link
        href={href + q}
        aria-current={active ? 'page' : undefined}
        className={`flex flex-col items-center justify-center gap-0.5 h-16 text-[11px] font-bold transition-colors ${
          active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'
        }`}
      >
        <Icon size={20} strokeWidth={active ? 2.3 : 1.8} aria-hidden />
        {label}
      </Link>
    </li>
  )
}
