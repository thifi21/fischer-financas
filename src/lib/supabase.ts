import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    // Retorna cliente dummy apenas para não quebrar o build estático se necessário,
    // mas o force-dynamic deve prevenir que isso seja chamado em build time.
    return createBrowserClient(
      url || 'https://placeholder.supabase.co',
      key || 'placeholder'
    )
  }

  return createBrowserClient(url, key)
}
