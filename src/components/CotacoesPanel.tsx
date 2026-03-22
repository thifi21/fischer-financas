'use client'
/**
 * Fischer Finanças 2026 — Painel de Cotações
 * Desenvolvido por Thiago Fischer
 *
 * Busca direto no browser (client-side) para evitar
 * limitações de rede do serverless da Vercel.
 *
 * Fontes:
 *  - Dólar/Euro: economia.awesomeapi.com.br (gratuito, sem chave)
 *  - PETR4: brapi.dev (gratuito, sem chave)
 *  - CDI: api.bcb.gov.br (Banco Central, público)
 */
import { useState, useEffect, useCallback } from 'react'

type DadosCotacao = {
  dolar?:  { valor: string; variacao: string; positivo: boolean; alto: string; baixo: string }
  euro?:   { valor: string; variacao: string; positivo: boolean }
  petr4?:  { preco: string; variacao: string; positivo: boolean; minimo: string; maximo: string; volume?: string }
  cdi?:    { taxaAnual: string; taxaDiaria: string; data: string; fonte?: string }
  erro?:   boolean
}

function varStr(v: number) {
  return (v >= 0 ? '+' : '') + v.toFixed(2) + '%'
}

async function buscarCotacoes(): Promise<DadosCotacao> {
  const resultado: DadosCotacao = {}

  await Promise.allSettled([

    // ── DÓLAR + EURO (AwesomeAPI) ─────────────────────────────────
    // Busca as duas moedas numa única requisição para ser eficiente
    fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL', {
      cache: 'no-store',
    })
      .then(r => {
        if (!r.ok) throw new Error(`${r.status}`)
        return r.json()
      })
      .then(d => {
        const usd = d?.USDBRL
        if (usd?.bid) {
          const pct = parseFloat(usd.pctChange ?? '0')
          resultado.dolar = {
            valor:    parseFloat(usd.bid).toFixed(2),
            variacao: varStr(pct),
            positivo: pct >= 0,
            alto:     parseFloat(usd.high ?? usd.bid).toFixed(2),
            baixo:    parseFloat(usd.low  ?? usd.bid).toFixed(2),
          }
        }
        const eur = d?.EURBRL
        if (eur?.bid) {
          const pct = parseFloat(eur.pctChange ?? '0')
          resultado.euro = {
            valor:    parseFloat(eur.bid).toFixed(2),
            variacao: varStr(pct),
            positivo: pct >= 0,
          }
        }
      })
      .catch(async () => {
        // Fallback: open.er-api.com — completamente gratuito, sem chave
        try {
          const r = await fetch('https://open.er-api.com/v6/latest/USD', { cache: 'no-store' })
          const d = await r.json()
          if (d?.rates?.BRL) {
            resultado.dolar = {
              valor:    d.rates.BRL.toFixed(2),
              variacao: '+0.00%',
              positivo: true,
              alto:     d.rates.BRL.toFixed(2),
              baixo:    d.rates.BRL.toFixed(2),
            }
          }
          if (d?.rates?.EUR && d?.rates?.BRL) {
            const eurBrl = d.rates.BRL / d.rates.EUR
            resultado.euro = {
              valor:    eurBrl.toFixed(2),
              variacao: '+0.00%',
              positivo: true,
            }
          }
        } catch {
          resultado.erro = true
        }
      }),

    // ── PETR4 (brapi.dev — gratuito sem chave) ────────────────────
    fetch('https://brapi.dev/api/quote/PETR4?range=1d&interval=1d&fundamental=false', {
      cache: 'no-store',
    })
      .then(r => {
        if (!r.ok) throw new Error(`${r.status}`)
        return r.json()
      })
      .then(d => {
        const q = d?.results?.[0]
        if (!q?.regularMarketPrice) return
        const pct = Number(q.regularMarketChangePercent ?? 0)
        resultado.petr4 = {
          preco:    Number(q.regularMarketPrice).toFixed(2),
          variacao: varStr(pct),
          positivo: pct >= 0,
          minimo:   Number(q.regularMarketDayLow  ?? q.regularMarketPrice).toFixed(2),
          maximo:   Number(q.regularMarketDayHigh ?? q.regularMarketPrice).toFixed(2),
          volume:   q.regularMarketVolume
                      ? (Number(q.regularMarketVolume) / 1_000_000).toFixed(1) + 'M'
                      : undefined,
        }
      })
      .catch(() => { /* PETR4 indisponível */ }),

    // ── CDI (Banco Central do Brasil — série 4391) ────────────────
    fetch(
      'https://api.bcb.gov.br/dados/serie/bcdata.sgs.4391/dados/ultimos/1?formato=json',
      { cache: 'no-store' }
    )
      .then(r => {
        if (!r.ok) throw new Error(`${r.status}`)
        return r.json()
      })
      .then(d => {
        if (!Array.isArray(d) || !d[0]) return
        const taxa  = parseFloat(d[0].valor)
        const anual = (Math.pow(1 + taxa / 100, 252) - 1) * 100
        resultado.cdi = {
          taxaDiaria: taxa.toFixed(4) + '% a.d.',
          taxaAnual:  anual.toFixed(2) + '% a.a.',
          data:       d[0].data,
        }
      })
      .catch(async () => {
        // Fallback: Meta Selic (série 432)
        try {
          const r = await fetch(
            'https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/1?formato=json',
            { cache: 'no-store' }
          )
          const d = await r.json()
          if (Array.isArray(d) && d[0]) {
            resultado.cdi = {
              taxaAnual:  parseFloat(d[0].valor).toFixed(2) + '% a.a.',
              taxaDiaria: '—',
              data:       d[0].data,
              fonte:      'Meta SELIC',
            }
          }
        } catch { /* CDI indisponível */ }
      }),
  ])

  return resultado
}

export default function CotacoesPanel() {
  const [aberto, setAberto]       = useState(false)
  const [dados, setDados]         = useState<DadosCotacao>({})
  const [carregando, setCarregando] = useState(false)
  const [ultimaAtt, setUltimaAtt] = useState('')

  const atualizar = useCallback(async (silencioso = false) => {
    if (!silencioso) setCarregando(true)
    try {
      const d = await buscarCotacoes()
      setDados(d)
      setUltimaAtt(
        new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      )
    } finally {
      setCarregando(false)
    }
  }, [])

  // Busca ao abrir
  useEffect(() => {
    if (aberto && !ultimaAtt) atualizar()
  }, [aberto, ultimaAtt, atualizar])

  // Refresh automático a cada 5 minutos enquanto aberto
  useEffect(() => {
    if (!aberto) return
    const t = setInterval(() => atualizar(true), 5 * 60 * 1000)
    return () => clearInterval(t)
  }, [aberto, atualizar])

  const temDados = dados.dolar || dados.petr4 || dados.cdi

  return (
    <div className="rounded-lg overflow-hidden border border-blue-800 dark:border-gray-700">

      {/* Botão */}
      <button
        onClick={() => setAberto(v => !v)}
        className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium transition-colors ${
          aberto
            ? 'bg-blue-700 dark:bg-gray-800 text-white'
            : 'bg-blue-800/50 dark:bg-gray-800/50 hover:bg-blue-800 dark:hover:bg-gray-800 text-blue-100 dark:text-gray-300'
        }`}
      >
        <span className="text-base">📈</span>
        <span className="flex-1 text-left">Cotações</span>
        {aberto && temDados && (
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" title="Ao vivo" />
        )}
        <span className="text-blue-300 dark:text-gray-500 text-xs">{aberto ? '▲' : '▼'}</span>
      </button>

      {/* Painel */}
      {aberto && (
        <div className="bg-blue-950/60 dark:bg-gray-900/90">

          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-blue-800/50 dark:border-gray-800">
            <span className="text-xs text-blue-300 dark:text-gray-500">
              {ultimaAtt ? `Atualizado ${ultimaAtt}` : 'Mercado ao vivo'}
            </span>
            <button
              onClick={() => atualizar()}
              title="Atualizar cotações"
              disabled={carregando}
              className="w-6 h-6 flex items-center justify-center rounded text-blue-400 dark:text-gray-600 hover:text-white hover:bg-blue-800 dark:hover:bg-gray-800 transition-colors disabled:opacity-40"
            >
              {carregando
                ? <span className="animate-spin text-xs inline-block">⏳</span>
                : <span className="text-sm">↻</span>
              }
            </button>
          </div>

          <div className="px-3 py-2.5 space-y-2">

            {/* Loading */}
            {carregando && !temDados && (
              <div className="text-center py-4 text-blue-400/70 dark:text-gray-600 text-xs">
                <span className="animate-spin inline-block mr-1 text-sm">⏳</span>
                Buscando cotações...
              </div>
            )}

            {/* DÓLAR */}
            {dados.dolar && (
              <div className="rounded-lg bg-blue-900/40 dark:bg-gray-800/60 px-2.5 py-2">
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-1.5">
                    <span>🇺🇸</span>
                    <span className="text-xs font-semibold text-blue-100 dark:text-gray-300">Dólar (USD)</span>
                  </div>
                  <Badge variacao={dados.dolar.variacao} positivo={dados.dolar.positivo} />
                </div>
                <div className="text-base font-bold text-white">R$ {dados.dolar.valor}</div>
                <div className="text-xs text-blue-400/60 dark:text-gray-600">
                  Mín R${dados.dolar.baixo} · Máx R${dados.dolar.alto}
                </div>
              </div>
            )}

            {/* EURO */}
            {dados.euro && (
              <div className="rounded-lg bg-blue-900/40 dark:bg-gray-800/60 px-2.5 py-2">
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-1.5">
                    <span>🇪🇺</span>
                    <span className="text-xs font-semibold text-blue-100 dark:text-gray-300">Euro (EUR)</span>
                  </div>
                  <Badge variacao={dados.euro.variacao} positivo={dados.euro.positivo} />
                </div>
                <div className="text-base font-bold text-white">R$ {dados.euro.valor}</div>
              </div>
            )}

            {/* PETR4 */}
            {dados.petr4 && (
              <div className="rounded-lg bg-blue-900/40 dark:bg-gray-800/60 px-2.5 py-2">
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-1.5">
                    <span>🛢️</span>
                    <span className="text-xs font-semibold text-blue-100 dark:text-gray-300">PETR4</span>
                    {dados.petr4.volume && (
                      <span className="text-xs text-blue-400/50 dark:text-gray-600">Vol {dados.petr4.volume}</span>
                    )}
                  </div>
                  <Badge variacao={dados.petr4.variacao} positivo={dados.petr4.positivo} />
                </div>
                <div className="text-base font-bold text-white">R$ {dados.petr4.preco}</div>
                <div className="text-xs text-blue-400/60 dark:text-gray-600">
                  Mín R${dados.petr4.minimo} · Máx R${dados.petr4.maximo}
                </div>
              </div>
            )}

            {/* CDI */}
            {dados.cdi && (
              <div className="rounded-lg bg-blue-900/40 dark:bg-gray-800/60 px-2.5 py-2">
                <div className="flex items-center gap-1.5 mb-1">
                  <span>🏦</span>
                  <span className="text-xs font-semibold text-blue-100 dark:text-gray-300">
                    CDI{dados.cdi.fonte ? ` / ${dados.cdi.fonte}` : ''}
                  </span>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-base font-bold text-white">{dados.cdi.taxaAnual}</div>
                    {dados.cdi.taxaDiaria !== '—' && (
                      <div className="text-xs text-blue-300/70 dark:text-gray-500">{dados.cdi.taxaDiaria}</div>
                    )}
                  </div>
                  {dados.cdi.data && (
                    <div className="text-xs text-blue-400/50 dark:text-gray-600">{dados.cdi.data}</div>
                  )}
                </div>
              </div>
            )}

            {/* Erro ou vazio */}
            {!carregando && !temDados && (
              <div className="text-center py-3 text-blue-400/60 dark:text-gray-600 text-xs">
                Não foi possível carregar.
                <br />
                <button
                  onClick={() => atualizar()}
                  className="text-blue-300 hover:text-white underline mt-1"
                >
                  Tentar novamente
                </button>
              </div>
            )}
          </div>

          <div className="px-3 pb-2 text-center">
            <span className="text-xs text-blue-500/40 dark:text-gray-700">
              Atualiza a cada 5 min · B3 / BCB
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

function Badge({ variacao, positivo }: { variacao: string; positivo: boolean }) {
  return (
    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
      positivo
        ? 'text-green-400 bg-green-900/30'
        : 'text-red-400 bg-red-900/30'
    }`}>
      {variacao}
    </span>
  )
}
