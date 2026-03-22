'use client'
/**
 * Fischer Finanças 2026 — Painel de Cotações
 * Desenvolvido por Thiago Fischer
 *
 * Exibe em tempo real na sidebar:
 *  - Dólar (USD/BRL)
 *  - PETR4
 *  - CDI (taxa anual)
 */
import { useState, useEffect, useCallback } from 'react'

type Cotacao = {
  dolar?: {
    valor: string
    variacao: string
    positivo: boolean
    hora?: string
    erro?: boolean
  }
  euro?: {
    valor: string
    variacao: string
    positivo: boolean
    erro?: boolean
  }
  petr4?: {
    preco: string
    variacao: string
    positivo: boolean
    abertura?: string
    minimo?: string
    maximo?: string
    erro?: boolean
  }
  cdi?: {
    taxaDiaria: string
    taxaAnual: string
    data: string
    fonte?: string
    erro?: boolean
  }
}

export default function CotacoesPanel() {
  const [aberto, setAberto]       = useState(false)
  const [dados, setDados]         = useState<Cotacao>({})
  const [loading, setLoading]     = useState(false)
  const [ultimaAtt, setUltimaAtt] = useState<string>('')

  const buscar = useCallback(async (silencioso = false) => {
    if (!silencioso) setLoading(true)
    try {
      const res  = await fetch('/api/cotacoes')
      const json = await res.json()
      setDados(json)
      setUltimaAtt(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }))
    } catch {
      // silencioso em falha
    } finally {
      setLoading(false)
    }
  }, [])

  // Carrega ao abrir
  useEffect(() => {
    if (aberto && Object.keys(dados).length === 0) buscar()
  }, [aberto])

  // Atualiza automaticamente a cada 5 minutos quando aberto
  useEffect(() => {
    if (!aberto) return
    const t = setInterval(() => buscar(true), 5 * 60 * 1000)
    return () => clearInterval(t)
  }, [aberto, buscar])

  return (
    <div className="rounded-lg overflow-hidden border border-blue-800 dark:border-gray-700">

      {/* Botão principal */}
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
        {/* Ponto verde piscando = dados ao vivo */}
        {!loading && Object.keys(dados).length > 0 && aberto && (
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" title="Ao vivo" />
        )}
        <span className="text-blue-300 dark:text-gray-500 text-xs">{aberto ? '▲' : '▼'}</span>
      </button>

      {/* Painel expandível */}
      {aberto && (
        <div className="bg-blue-950/60 dark:bg-gray-900/90">

          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-blue-800/50 dark:border-gray-800">
            <span className="text-xs text-blue-300 dark:text-gray-500">
              {ultimaAtt ? `Atualizado ${ultimaAtt}` : 'Mercado'}
            </span>
            <button
              onClick={() => buscar()}
              title="Atualizar cotações"
              disabled={loading}
              className="text-blue-400 dark:text-gray-600 hover:text-white transition-colors text-sm w-6 h-6 flex items-center justify-center rounded hover:bg-blue-800 dark:hover:bg-gray-800 disabled:opacity-40"
            >
              {loading ? <span className="animate-spin text-xs">⏳</span> : '↻'}
            </button>
          </div>

          {/* Cotações */}
          <div className="px-3 py-2 space-y-2">

            {loading && Object.keys(dados).length === 0 ? (
              <div className="text-center py-4 text-blue-400/70 dark:text-gray-600 text-xs">
                <span className="animate-spin inline-block mr-1">⏳</span>
                Buscando cotações...
              </div>
            ) : (
              <>
                {/* ── DÓLAR ─────────────────────────────────── */}
                {dados.dolar && !dados.dolar.erro && (
                  <CotacaoItem
                    icone="🇺🇸"
                    titulo="Dólar (USD)"
                    valor={`R$ ${dados.dolar.valor}`}
                    variacao={dados.dolar.variacao}
                    positivo={dados.dolar.positivo}
                    detalhe={dados.dolar.hora ? `Atualizado ${dados.dolar.hora}` : undefined}
                  />
                )}

                {/* ── EURO ──────────────────────────────────── */}
                {dados.euro && !dados.euro.erro && (
                  <CotacaoItem
                    icone="🇪🇺"
                    titulo="Euro (EUR)"
                    valor={`R$ ${dados.euro.valor}`}
                    variacao={dados.euro.variacao}
                    positivo={dados.euro.positivo}
                  />
                )}

                {/* ── PETR4 ─────────────────────────────────── */}
                {dados.petr4 && !dados.petr4.erro && (
                  <CotacaoItem
                    icone="🛢️"
                    titulo="PETR4"
                    valor={`R$ ${dados.petr4.preco}`}
                    variacao={dados.petr4.variacao}
                    positivo={dados.petr4.positivo}
                    detalhe={
                      dados.petr4.minimo && dados.petr4.maximo
                        ? `Mín R$${dados.petr4.minimo} · Máx R$${dados.petr4.maximo}`
                        : undefined
                    }
                  />
                )}
                {dados.petr4?.erro && (
                  <div className="text-xs text-blue-400/60 dark:text-gray-600 px-1">PETR4 — indisponível</div>
                )}

                {/* ── CDI ──────────────────────────────────── */}
                {dados.cdi && !dados.cdi.erro && (
                  <div className="rounded-lg bg-blue-900/40 dark:bg-gray-800/60 px-2.5 py-2">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-sm">🏦</span>
                      <span className="text-xs font-semibold text-blue-100 dark:text-gray-300">
                        CDI {dados.cdi.fonte ? `/ ${dados.cdi.fonte}` : ''}
                      </span>
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <div className="text-sm font-bold text-white">{dados.cdi.taxaAnual}</div>
                        {dados.cdi.taxaDiaria !== '—' && (
                          <div className="text-xs text-blue-300 dark:text-gray-500">{dados.cdi.taxaDiaria}</div>
                        )}
                      </div>
                      {dados.cdi.data && (
                        <div className="text-xs text-blue-400/60 dark:text-gray-600">{dados.cdi.data}</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Mensagem se nenhum dado carregou */}
                {Object.keys(dados).length === 0 && (
                  <div className="text-center py-3 text-blue-400/60 dark:text-gray-600 text-xs">
                    Não foi possível carregar as cotações.
                    <br />
                    <button onClick={() => buscar()} className="text-blue-400 hover:text-white mt-1 underline">
                      Tentar novamente
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Rodapé */}
          <div className="px-3 pb-2">
            <div className="text-xs text-blue-500/50 dark:text-gray-700 text-center">
              Atualiza a cada 5 min · B3 / BCB
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Sub-componente de item de cotação ────────────────────────────
function CotacaoItem({
  icone, titulo, valor, variacao, positivo, detalhe,
}: {
  icone: string
  titulo: string
  valor: string
  variacao: string
  positivo: boolean
  detalhe?: string
}) {
  return (
    <div className="rounded-lg bg-blue-900/40 dark:bg-gray-800/60 px-2.5 py-2">
      <div className="flex items-center justify-between mb-0.5">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">{icone}</span>
          <span className="text-xs font-semibold text-blue-100 dark:text-gray-300">{titulo}</span>
        </div>
        <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
          positivo
            ? 'text-green-400 bg-green-900/30'
            : 'text-red-400 bg-red-900/30'
        }`}>
          {variacao}
        </span>
      </div>
      <div className="text-base font-bold text-white">{valor}</div>
      {detalhe && (
        <div className="text-xs text-blue-400/60 dark:text-gray-600 mt-0.5">{detalhe}</div>
      )}
    </div>
  )
}
