'use client'
import { useState, useEffect, useCallback } from 'react'
export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Sun, Moon, Wallet, AlertTriangle } from 'lucide-react'

function useDarkMode() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
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

    router.replace('/dashboard')
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 overflow-hidden">

      {/* ── Fundo dinâmico ──────────────────────────────── */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-indigo-950 to-slate-950 dark:from-[#020817] dark:via-[#050d1a] dark:to-[#0a0f1e]" />
        {/* Orbes animados */}
        <div
          className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)',
            animation: 'float1 12s ease-in-out infinite',
          }}
        />
        <div
          className="absolute bottom-[-15%] right-[-10%] w-[50vw] h-[50vw] rounded-full opacity-15"
          style={{
            background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)',
            animation: 'float2 15s ease-in-out infinite',
          }}
        />
        <div
          className="absolute top-[40%] right-[20%] w-[25vw] h-[25vw] rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, #10b981 0%, transparent 70%)',
            animation: 'float3 10s ease-in-out infinite',
          }}
        />
        {/* Grade sutil */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <style>{`
        @keyframes float1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(4%,3%) scale(1.05)} }
        @keyframes float2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-3%,-4%) scale(1.08)} }
        @keyframes float3 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(5%,-5%) scale(0.95)} }
      `}</style>

      {/* ── Toggle dark mode ────────────────────────────── */}
      <motion.button
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        onClick={toggleDark}
        title={dark ? 'Modo claro' : 'Modo escuro'}
        className="fixed top-5 right-5 w-10 h-10 flex items-center justify-center rounded-full
                   bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white
                   transition-all border border-white/15 shadow-lg"
      >
        {dark
          ? <Sun size={17} className="text-amber-300" />
          : <Moon size={17} className="text-blue-200" />
        }
      </motion.button>

      {/* ── Card de login ────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 36, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm"
      >
        <div
          className="rounded-3xl p-8 shadow-2xl"
          style={{
            background: 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 220, damping: 20 }}
            className="flex flex-col items-center mb-8"
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-xl"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
            >
              <Wallet size={30} className="text-white" strokeWidth={1.8} />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Família Fischer</h1>
            <p className="text-blue-300/70 text-sm mt-1 font-medium">Controle Financeiro 2026</p>
          </motion.div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-[11px] font-bold text-blue-200/60 uppercase tracking-[0.1em] mb-1.5 ml-0.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                autoComplete="email"
                autoFocus
                disabled={loading}
                className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-white/30
                           bg-white/8 border border-white/12 outline-none
                           focus:border-blue-400/60 focus:bg-white/12
                           disabled:opacity-50 transition-all"
                style={{ background: 'rgba(255,255,255,0.07)' }}
              />
            </div>

            {/* Senha */}
            <div>
              <label className="block text-[11px] font-bold text-blue-200/60 uppercase tracking-[0.1em] mb-1.5 ml-0.5">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showSenha ? 'text' : 'password'}
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  disabled={loading}
                  className="w-full px-4 py-2.5 pr-11 rounded-xl text-sm text-white placeholder-white/30
                             border border-white/12 outline-none
                             focus:border-blue-400/60 focus:bg-white/12
                             disabled:opacity-50 transition-all"
                  style={{ background: 'rgba(255,255,255,0.07)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowSenha(v => !v)}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-200/40 hover:text-blue-200/80 transition-colors"
                >
                  {showSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Erro */}
            {erro && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 bg-rose-500/15 border border-rose-400/20
                           text-rose-300 rounded-xl px-4 py-3 text-sm"
              >
                <AlertTriangle size={15} className="shrink-0" />
                {erro}
              </motion.div>
            )}

            {/* Botão */}
            <button
              type="submit"
              disabled={loading || !email || !senha}
              className="w-full py-3 rounded-xl text-sm font-bold text-white
                         disabled:opacity-40 disabled:cursor-not-allowed
                         transition-all active:scale-[0.97] mt-2 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)', boxShadow: '0 4px 20px rgba(99,102,241,0.4)' }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Verificando...
                </>
              ) : 'Entrar'}
            </button>
          </form>

          <p className="text-center text-[11px] text-white/20 mt-6 font-medium">
            Acesso restrito — Família Fischer 🔒
          </p>
        </div>
      </motion.div>
    </div>
  )
}
