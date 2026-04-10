'use client'
import { useState, useEffect, useCallback } from 'react'
export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

function useDarkMode() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    // Lê preferência salva pelo usuário (padrão: claro)
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

export default function LoginPage() {
  const [email, setEmail]         = useState('')
  const [senha, setSenha]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [erro, setErro]           = useState('')
  const [showSenha, setShowSenha] = useState(false)
  const router   = useRouter()
  const supabase = createClient()
  const { dark, toggle: toggleDark } = useDarkMode()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErro('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: senha,
    })

    if (error || !data.session) {
      setErro('Email ou senha incorretos. Verifique e tente novamente.')
      setLoading(false)
      return
    }

    // Usa replace (não push) — mais rápido, não empilha no histórico
    router.replace('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center px-4 transition-colors duration-300">

      {/* Botão dark mode flutuante no canto superior direito */}
      <button
        onClick={toggleDark}
        title={dark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
        className="fixed top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 dark:bg-black/30 dark:hover:bg-black/50 backdrop-blur-sm text-white transition-all shadow-lg text-lg"
      >
        {dark ? '☀️' : '🌙'}
      </button>

      {/* Card de login */}
      <div className="bg-white dark:bg-gray-900 dark:border dark:border-gray-700 rounded-2xl shadow-2xl w-full max-w-sm p-8 transition-colors duration-300">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">💰</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Família Fischer
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Controle Financeiro 2026
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email */}
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              autoComplete="email"
              autoFocus
              disabled={loading}
            />
          </div>

          {/* Senha */}
          <div>
            <label className="label">Senha</label>
            <div className="relative">
              <input
                type={showSenha ? 'text' : 'password'}
                className="input pr-10"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowSenha(v => !v)}
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                {showSenha ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Erro */}
          {erro && (
            <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg px-4 py-3 text-sm">
              ⚠️ {erro}
            </div>
          )}

          {/* Botão entrar */}
          <button
            type="submit"
            className="btn-primary w-full py-3 text-base mt-2"
            disabled={loading || !email || !senha}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span>
                Verificando...
              </span>
            ) : (
              'Entrar'
            )}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-6">
          Acesso restrito — Família Fischer 🔒
        </p>
      </div>
    </div>
  )
}
