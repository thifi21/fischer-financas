'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { MESES } from '@/types'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [mesAtivo, setMesAtivo] = useState(new Date().getMonth() + 1)
  const [menuAberto, setMenuAberto] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.push('/')
      else setLoading(false)
    })
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-gray-500">Carregando...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-900 text-white flex flex-col min-h-screen fixed top-0 left-0 z-30">
        <div className="p-5 border-b border-blue-800">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💰</span>
            <div>
              <div className="font-bold text-sm">Família Fischer</div>
              <div className="text-blue-300 text-xs">Finanças 2026</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-800 text-sm font-medium transition-colors">
            📊 Dashboard
          </Link>
          <Link href="/dashboard/cartoes" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-800 text-sm font-medium transition-colors">
            💳 Cartões de Crédito
          </Link>
          <Link href="/dashboard/contas-fixas" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-800 text-sm font-medium transition-colors">
            🏠 Contas Fixas
          </Link>
          <Link href="/dashboard/entradas" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-800 text-sm font-medium transition-colors">
            💵 Entradas / Salários
          </Link>
          <Link href="/dashboard/combustivel" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-800 text-sm font-medium transition-colors">
            ⛽ Combustível
          </Link>

          <div className="pt-4 pb-2">
            <div className="text-blue-400 text-xs uppercase tracking-widest px-3 mb-2">Mês Ativo</div>
            <select
              value={mesAtivo}
              onChange={e => {
                setMesAtivo(Number(e.target.value))
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('mesChange', { detail: Number(e.target.value) }))
                }
              }}
              className="w-full bg-blue-800 text-white border border-blue-700 rounded-lg px-3 py-2 text-sm"
            >
              {MESES.map((m, i) => (
                <option key={i} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>
        </nav>

        <div className="p-4 border-t border-blue-800">
          <button onClick={handleLogout} className="w-full text-left text-sm text-blue-300 hover:text-white px-3 py-2 rounded-lg hover:bg-blue-800 transition-colors">
            🚪 Sair
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 flex-1 p-6 min-h-screen">
        {children}
      </main>
    </div>
  )
}
