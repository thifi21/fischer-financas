'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail]   = useState('')
  const [senha, setSenha]   = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro]     = useState('')
  const [showSenha, setShowSenha] = useState(false)
  const router   = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErro('')
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error) {
      setErro('Email ou senha incorretos. Verifique e tente novamente.')
    } else {
      router.push('/dashboard')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <div className="bg-white dark:bg-gray-900 dark:border dark:border-gray-700 rounded-2xl shadow-2xl w-full max-w-sm p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">💰</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Família Fischer</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Controle Financeiro 2026</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
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
            />
          </div>

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
              />
              <button
                type="button"
                onClick={() => setShowSenha(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-sm"
                tabIndex={-1}
              >
                {showSenha ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {erro && (
            <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg px-4 py-3 text-sm">
              {erro}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary w-full py-3 text-base"
            disabled={loading || !email || !senha}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span> Entrando...
              </span>
            ) : 'Entrar'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-6">
          Acesso restrito — Família Fischer 🔒
        </p>
      </div>
    </div>
  )
}
