import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { verifyCronRequest } from './cron-auth'

const req = (authorization?: string) =>
  new Request('http://localhost/api/cron/x', {
    headers: authorization ? { authorization } : {},
  })

describe('verifyCronRequest', () => {
  const original = process.env.CRON_SECRET

  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    if (original === undefined) delete process.env.CRON_SECRET
    else process.env.CRON_SECRET = original
    vi.restoreAllMocks()
  })

  it('recusa TUDO (503) quando CRON_SECRET não está configurada', () => {
    delete process.env.CRON_SECRET
    // Regressão: antes, "Bearer undefined" passava na validação
    const res = verifyCronRequest(req('Bearer undefined'))
    expect(res?.status).toBe(503)
  })

  it('recusa quando CRON_SECRET está vazia', () => {
    process.env.CRON_SECRET = '   '
    expect(verifyCronRequest(req('Bearer '))?.status).toBe(503)
  })

  it('recusa (401) sem cabeçalho de autorização', () => {
    process.env.CRON_SECRET = 'segredo'
    expect(verifyCronRequest(req())?.status).toBe(401)
  })

  it('recusa (401) com segredo incorreto', () => {
    process.env.CRON_SECRET = 'segredo'
    expect(verifyCronRequest(req('Bearer errado!'))?.status).toBe(401)
    expect(verifyCronRequest(req('Bearer segred'))?.status).toBe(401)
  })

  it('autoriza (null) com o segredo correto', () => {
    process.env.CRON_SECRET = 'segredo'
    expect(verifyCronRequest(req('Bearer segredo'))).toBeNull()
  })
})
