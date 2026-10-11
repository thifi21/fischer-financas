import { describe, it, expect } from 'vitest'
import { agoraBrasil, dataBrasilMaisDias } from './datetime'

describe('agoraBrasil', () => {
  it('converte UTC para o horário de Brasília (UTC-3)', () => {
    const r = agoraBrasil(new Date('2026-06-15T15:30:00Z'))
    expect(r).toMatchObject({ ano: 2026, mes: 6, dia: 15, hora: 12, iso: '2026-06-15' })
  })

  it('volta para o dia anterior quando UTC já virou o dia', () => {
    // 02:00 UTC de 1º/jan = 23:00 de 31/dez em Brasília
    const r = agoraBrasil(new Date('2026-01-01T02:00:00Z'))
    expect(r).toMatchObject({ ano: 2025, mes: 12, dia: 31, hora: 23, iso: '2025-12-31' })
  })

  it('usa hora 0 (e não 24) à meia-noite', () => {
    const r = agoraBrasil(new Date('2026-06-15T03:00:00Z'))
    expect(r.hora).toBe(0)
    expect(r.iso).toBe('2026-06-15')
  })
})

describe('dataBrasilMaisDias', () => {
  it('soma dias a partir de hoje em Brasília', () => {
    expect(dataBrasilMaisDias(1, new Date('2026-06-15T15:00:00Z'))).toBe('2026-06-16')
  })

  it('"amanhã" considera a data de Brasília, não a do servidor UTC', () => {
    // No servidor (UTC) já é 1º/jan, mas em Brasília ainda é 31/dez → amanhã = 1º/jan
    expect(dataBrasilMaisDias(1, new Date('2026-01-01T02:00:00Z'))).toBe('2026-01-01')
  })

  it('atravessa virada de mês e de ano', () => {
    expect(dataBrasilMaisDias(1, new Date('2026-01-31T15:00:00Z'))).toBe('2026-02-01')
    expect(dataBrasilMaisDias(1, new Date('2026-12-31T15:00:00Z'))).toBe('2027-01-01')
  })

  it('respeita ano bissexto', () => {
    expect(dataBrasilMaisDias(1, new Date('2028-02-28T15:00:00Z'))).toBe('2028-02-29')
  })

  it('aceita dias negativos', () => {
    expect(dataBrasilMaisDias(-1, new Date('2026-03-01T15:00:00Z'))).toBe('2026-02-28')
  })
})
