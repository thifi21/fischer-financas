import { NextResponse } from 'next/server'

/**
 * Fischer Finanças 2026 — API de Cotações
 * Desenvolvido por Thiago Fischer
 *
 * Busca em paralelo:
 *  - Dólar (USD/BRL) via AwesomeAPI
 *  - PETR4 via brapi.dev
 *  - CDI via API do Banco Central
 */

export const revalidate = 300 // cache de 5 minutos no edge

// Retorna variação formatada
function varStr(val: number): string {
  return (val >= 0 ? '+' : '') + val.toFixed(2) + '%'
}

export async function GET() {
  const resultado: Record<string, any> = {}

  await Promise.allSettled([

    // ── Dólar (USD-BRL) ─────────────────────────────────────────
    fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL', {
      next: { revalidate: 300 },
    })
      .then(r => r.json())
      .then(d => {
        const c = d['USDBRL']
        if (!c) return
        resultado.dolar = {
          valor: parseFloat(c.bid).toFixed(4),
          variacao: varStr(parseFloat(c.pctChange)),
          positivo: parseFloat(c.pctChange) >= 0,
          hora: new Date(Number(c.timestamp) * 1000).toLocaleTimeString('pt-BR', {
            hour: '2-digit', minute: '2-digit',
          }),
        }
      })
      .catch(() => {
        resultado.dolar = { erro: true }
      }),

    // ── Euro (EUR-BRL) ───────────────────────────────────────────
    fetch('https://economia.awesomeapi.com.br/json/last/EUR-BRL', {
      next: { revalidate: 300 },
    })
      .then(r => r.json())
      .then(d => {
        const c = d['EURBRL']
        if (!c) return
        resultado.euro = {
          valor: parseFloat(c.bid).toFixed(4),
          variacao: varStr(parseFloat(c.pctChange)),
          positivo: parseFloat(c.pctChange) >= 0,
        }
      })
      .catch(() => {}),

    // ── PETR4 via brapi.dev (gratuito, sem autenticação) ─────────
    fetch('https://brapi.dev/api/quote/PETR4?interval=1d&range=2d', {
      next: { revalidate: 300 },
    })
      .then(r => r.json())
      .then(d => {
        const q = d?.results?.[0]
        if (!q) return
        resultado.petr4 = {
          preco: q.regularMarketPrice?.toFixed(2),
          variacao: varStr(q.regularMarketChangePercent ?? 0),
          positivo: (q.regularMarketChangePercent ?? 0) >= 0,
          abertura: q.regularMarketOpen?.toFixed(2),
          minimo: q.regularMarketDayLow?.toFixed(2),
          maximo: q.regularMarketDayHigh?.toFixed(2),
        }
      })
      .catch(() => {
        resultado.petr4 = { erro: true }
      }),

    // ── CDI via Banco Central do Brasil ─────────────────────────
    // SELIC/CDI: série 4389 = Meta da taxa SELIC
    // CDI Over: série 4391
    fetch(
      'https://api.bcb.gov.br/dados/serie/bcdata.sgs.4391/dados/ultimos/5?formato=json',
      { next: { revalidate: 3600 } } // CDI muda menos, cache 1h
    )
      .then(r => r.json())
      .then(d => {
        if (!Array.isArray(d) || d.length === 0) return
        const ultimo = d[d.length - 1]
        const taxa = parseFloat(ultimo.valor)
        // Taxa diária → anual aproximada
        const anual = (Math.pow(1 + taxa / 100, 252) - 1) * 100
        resultado.cdi = {
          taxaDiaria: taxa.toFixed(4) + '% a.d.',
          taxaAnual: anual.toFixed(2) + '% a.a.',
          data: ultimo.data,
        }
      })
      .catch(() => {
        // Fallback: Selic Meta
        fetch(
          'https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/1?formato=json',
          { next: { revalidate: 3600 } }
        )
          .then(r => r.json())
          .then(d => {
            if (!Array.isArray(d) || d.length === 0) return
            resultado.cdi = {
              taxaAnual: parseFloat(d[0].valor).toFixed(2) + '% a.a.',
              taxaDiaria: '—',
              data: d[0].data,
              fonte: 'Meta SELIC',
            }
          })
          .catch(() => { resultado.cdi = { erro: true } })
      }),

  ])

  return NextResponse.json(resultado)
}
