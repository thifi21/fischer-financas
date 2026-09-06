import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

type AuthResult =
  | { user: User; supabase: SupabaseClient; token: string; error?: never }
  | { user?: never; supabase?: never; token?: never; error: NextResponse }

export async function requireApiUser(req: NextRequest): Promise<AuthResult> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    return {
      error: NextResponse.json(
        { error: 'Serviço temporariamente indisponível: Supabase não configurado.' },
        { status: 503 }
      ),
    }
  }

  const authorization = req.headers.get('authorization') || ''
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7).trim() : ''
  if (!token) {
    return { error: NextResponse.json({ error: 'Não autenticado' }, { status: 401 }) }
  }

  const supabase = createClient(url, key, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) {
    return { error: NextResponse.json({ error: 'Sessão inválida ou expirada' }, { status: 401 }) }
  }

  return { user, supabase, token }
}

// ── Rate Limit em memória (sem roundtrip ao banco) ──────────────────────
// Chave: "rota:identificador" → array de timestamps (ms) dentro da janela
const rateLimitStore = new Map<string, number[]>()

export function enforceRateLimit(
  identifier: string,        // user_id ou IP
  route: string,
  limit: number,
  windowSeconds = 60
): NextResponse | null {
  const key = `${route}:${identifier}`
  const now = Date.now()
  const windowMs = windowSeconds * 1000

  // Obtém timestamps e descarta os fora da janela deslizante
  const timestamps = (rateLimitStore.get(key) ?? []).filter(t => now - t < windowMs)

  if (timestamps.length >= limit) {
    return NextResponse.json(
      { error: 'Muitas solicitações. Aguarde e tente novamente.' },
      { status: 429, headers: { 'Retry-After': String(windowSeconds) } }
    )
  }

  timestamps.push(now)
  rateLimitStore.set(key, timestamps)
  return null
}
