import { describe, it, expect } from 'vitest'
import { formatBRL, formatDate, formatVencimento } from './utils'

// Intl usa espaço não separável entre "R$" e o número
const norm = (s: string) => s.replace(/\u00a0/g, ' ')

describe('formatBRL', () => {
  it('formata valores em reais', () => {
    expect(norm(formatBRL(1234.5))).toBe('R$ 1.234,50')
    expect(norm(formatBRL(0))).toBe('R$ 0,00')
  })

  it('formata valores negativos', () => {
    expect(norm(formatBRL(-10))).toContain('10,00')
    expect(norm(formatBRL(-10))).toContain('-')
  })
})

describe('formatDate', () => {
  it('converte AAAA-MM-DD para DD/MM/AAAA', () => {
    expect(formatDate('2026-03-05')).toBe('05/03/2026')
  })

  it('ignora a parte de hora', () => {
    expect(formatDate('2026-03-05T10:20:30Z')).toBe('05/03/2026')
    expect(formatDate('2026-03-05 00:00:00')).toBe('05/03/2026')
  })

  it('retorna "-" para vazio/nulo', () => {
    expect(formatDate(null)).toBe('-')
    expect(formatDate('')).toBe('-')
  })

  it('devolve o texto original quando o formato é desconhecido', () => {
    expect(formatDate('abc')).toBe('abc')
  })
})

describe('formatVencimento', () => {
  it('converte para DD/MM', () => {
    expect(formatVencimento('2026-01-10')).toBe('10/01')
    expect(formatVencimento('2025-03-12 00:00:00')).toBe('12/03')
  })

  it('mantém valores já em DD/MM', () => {
    expect(formatVencimento('10/01')).toBe('10/01')
  })

  it('retorna vazio para nulo', () => {
    expect(formatVencimento(null)).toBe('')
  })
})
