import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { criarLogger } from '@/lib/logger'
import { integrationAllowedUserIds } from './integration-access'

const log = criarLogger('api-auth')

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

// As integrações usam credenciais compartilhadas; valida permissão configurada
export function requireIntegrationUser(userId: string): NextResponse | null {
  const allowed = integrationAllowedUserIds()
  if (allowed.length === 0) {
    return NextResponse.json({ error: 'Integrações indisponíveis: acesso não configurado.' }, { status: 503 })
  }
  if (!allowed.includes(userId)) {
    return NextResponse.json({ error: 'Sem permissão para esta integração.' }, { status: 403 })
  }
  return null
}

// ── Rate Limit ──────────────────────────────────────────────────────────
// Camada principal: contador persistente no Supabase (função check_rate_limit,
// migration 007), compartilhado entre todas as instâncias serverless.
// Fallback: contador em memória (por instância) se o banco estiver indisponível.
// Chave: "rota:identificador" → array de timestamps (ms) dentro da janela
const rateLimitStore = new Map<string, number[]>()

function tooManyRequests(windowSeconds: number) {
  return NextResponse.json(
    { error: 'Muitas solicitações. Aguarde e tente novamente.' },
    { status: 429, headers: { 'Retry-After': String(windowSeconds) } }
  )
}

function enforceRateLimitMemory(
  key: string,
  limit: number,
  windowSeconds: number
): NextResponse | null {
  const now = Date.now()
  const windowMs = windowSeconds * 1000

  // Obtém timestamps e descarta os fora da janela deslizante
  const timestamps = (rateLimitStore.get(key) ?? []).filter(t => now - t < windowMs)

  if (timestamps.length >= limit) {
    return tooManyRequests(windowSeconds)
  }

  timestamps.push(now)
  rateLimitStore.set(key, timestamps)
  return null
}

let rateLimitDbClient: SupabaseClient | null = null

function getRateLimitDbClient(): SupabaseClient | null {
  if (rateLimitDbClient) return rateLimitDbClient
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) return null
  rateLimitDbClient = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return rateLimitDbClient
}

export async function enforceRateLimit(
  identifier: string,        // user_id ou IP
  route: string,
  limit: number,
  windowSeconds = 60
): Promise<NextResponse | null> {
  const key = `${route}:${identifier}`

  const db = getRateLimitDbClient()
  if (db) {
    try {
      const { data, error } = await db.rpc('check_rate_limit', {
        p_key: key,
        p_limit: limit,
        p_window_seconds: windowSeconds,
      })
      if (!error && typeof data === 'boolean') {
        return data ? null : tooManyRequests(windowSeconds)
      }
      log.warn('Rate limit no banco indisponível, usando memória', { motivo: error?.message })
    } catch (e) {
      log.warn('Falha ao consultar rate limit no banco, usando memória', {
        motivo: e instanceof Error ? e.message : String(e),
      })
    }
  }

  return enforceRateLimitMemory(key, limit, windowSeconds)
}
