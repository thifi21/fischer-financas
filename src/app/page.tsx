'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErro('')
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error) {
      setErro('Email ou senha incorretos.')
    } else {
      router.push('/dashboard')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">💰</div>
          <h1 className="text-2xl font-bold text-gray-900">Família Fischer</h1>
          <p className="text-gray-500 text-sm mt-1">Controle Financeiro 2026</p>
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
            <input
              type="password"
              className="input"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>
          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2 text-sm">
              {erro}
            </div>
          )}
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
