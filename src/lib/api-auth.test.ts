import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// Mock do cliente Supabase para controlar a resposta do RPC check_rate_limit
const rpc = vi.fn()
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({ rpc })),
}))

describe('enforceRateLimit (fallback em memória)', () => {
  const env = { ...process.env }

  beforeEach(() => {
    vi.resetModules()
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    delete process.env.SUPABASE_SERVICE_ROLE_KEY
    rpc.mockReset()
  })

  afterEach(() => {
    process.env = { ...env }
    vi.restoreAllMocks()
  })

  it('permite até o limite e bloqueia (429) depois', async () => {
    const { enforceRateLimit } = await import('./api-auth')
    expect(await enforceRateLimit('u1', 'rota-a', 2, 60)).toBeNull()
    expect(await enforceRateLimit('u1', 'rota-a', 2, 60)).toBeNull()

    const bloqueado = await enforceRateLimit('u1', 'rota-a', 2, 60)
    expect(bloqueado?.status).toBe(429)
    expect(bloqueado?.headers.get('Retry-After')).toBe('60')
  })

  it('isola os contadores por usuário e por rota', async () => {
    const { enforceRateLimit } = await import('./api-auth')
    await enforceRateLimit('u1', 'rota-a', 1, 60)

    expect(await enforceRateLimit('u2', 'rota-a', 1, 60)).toBeNull()
    expect(await enforceRateLimit('u1', 'rota-b', 1, 60)).toBeNull()
    expect((await enforceRateLimit('u1', 'rota-a', 1, 60))?.status).toBe(429)
  })

  it('libera de novo depois que a janela expira', async () => {
    vi.useFakeTimers()
    try {
      const { enforceRateLimit } = await import('./api-auth')
      await enforceRateLimit('u1', 'rota-a', 1, 10)
      expect((await enforceRateLimit('u1', 'rota-a', 1, 10))?.status).toBe(429)

      vi.advanceTimersByTime(11_000)
      expect(await enforceRateLimit('u1', 'rota-a', 1, 10)).toBeNull()
    } finally {
      vi.useRealTimers()
    }
  })
})

describe('enforceRateLimit (persistente via Supabase)', () => {
  const env = { ...process.env }

  beforeEach(() => {
    vi.resetModules()
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://supabase.test'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-key'
    rpc.mockReset()
  })

  afterEach(() => {
    process.env = { ...env }
    vi.restoreAllMocks()
  })

  it('usa a resposta do banco: true = permitido', async () => {
    rpc.mockResolvedValue({ data: true, error: null })
    const { enforceRateLimit } = await import('./api-auth')

    expect(await enforceRateLimit('u1', 'ia', 10, 60)).toBeNull()
    expect(rpc).toHaveBeenCalledWith('check_rate_limit', {
      p_key: 'ia:u1',
      p_limit: 10,
      p_window_seconds: 60,
    })
  })

  it('usa a resposta do banco: false = 429', async () => {
    rpc.mockResolvedValue({ data: false, error: null })
    const { enforceRateLimit } = await import('./api-auth')

    expect((await enforceRateLimit('u1', 'ia', 10, 60))?.status).toBe(429)
  })

  it('cai para a memória se o RPC falhar (ex.: migration ainda não aplicada)', async () => {
    rpc.mockResolvedValue({ data: null, error: { message: 'function not found' } })
    const { enforceRateLimit } = await import('./api-auth')

    expect(await enforceRateLimit('u1', 'ia', 1, 60)).toBeNull()
    expect((await enforceRateLimit('u1', 'ia', 1, 60))?.status).toBe(429)
  })

  it('cai para a memória se o RPC lançar exceção', async () => {
    rpc.mockRejectedValue(new Error('rede'))
    const { enforceRateLimit } = await import('./api-auth')

    expect(await enforceRateLimit('u1', 'ia', 1, 60)).toBeNull()
    expect((await enforceRateLimit('u1', 'ia', 1, 60))?.status).toBe(429)
  })
})
