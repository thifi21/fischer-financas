'use client'
/**
 * UserContext — Contexto centralizado do usuário autenticado.
 *
 * Resolve o userId UMA única vez por sessão de navegação no dashboard,
 * eliminando chamadas redundantes ao Supabase Auth em cada página.
 *
 * Uso:
 *   const { userId, loading } = useUser()
 */
import { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase'

interface UserContextType {
  userId: string | null
  loading: boolean
}

const UserContext = createContext<UserContextType>({ userId: null, loading: true })

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? null)
      setLoading(false)
    })
  }, [supabase])

  return (
    <UserContext.Provider value={{ userId, loading }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser(): UserContextType {
  return useContext(UserContext)
}
