'use client'

import { createClient } from './supabase'

export async function authFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) throw new Error('Sessão expirada. Entre novamente.')

  const headers = new Headers(init.headers)
  headers.set('Authorization', `Bearer ${session.access_token}`)
  return fetch(input, { ...init, headers })
}
