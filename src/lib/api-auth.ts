import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { integrationAllowedUserIds } from './integration-access'

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

// As integrações abaixo usam credenciais e destinos compartilhados. A lista é configurada
// no servidor e nunca é enviada ao navegador.
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

export async function enforceRateLimit(
  supabase: SupabaseClient,
  route: string,
  limit: number,
  windowSeconds = 60
): Promise<NextResponse | null> {
  const { data: permitted, error } = await supabase.rpc('check_api_rate_limit', {
    p_route: route, p_limit: limit, p_window_seconds: windowSeconds,
  })
  if (error) {
    console.error('Rate limit indisponível:', error)
    return NextResponse.json({ error: 'Serviço temporariamente indisponível.' }, { status: 503 })
  }
  if (!permitted) {
    return NextResponse.json(
      { error: 'Muitas solicitações. Aguarde e tente novamente.' },
      { status: 429, headers: { 'Retry-After': String(windowSeconds) } }
    )
  }

  return null
}
