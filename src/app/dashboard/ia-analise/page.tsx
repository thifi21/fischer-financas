'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useMes } from '@/context/MesContext'
import { formatBRL } from '@/lib/utils'
import { MESES } from '@/types'
import type { InsightFinanceiro } from '@/lib/ai-analise'

let cachedUserId: string | null = null

const COR_MAP: Record<string, string> = {
  red:    'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300',
  green:  'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300',
  orange: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300',
  blue:   'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',
  purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300',
  indigo: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300',
}

export default function IAAnalisePage() {
  const supabase = createClient()
  const { mes, ano } = useMes()
  const userIdRef = useRef<string | null>(cachedUserId)

  const [loading, setLoading] = useState(false)
  const [insights, setInsights] = useState<InsightFinanceiro[]>([])
  const [resposta, setResposta] = useState('')
  const [fonte, setFonte] = useState<'gemini' | 'heuristico' | ''>('')
  const [pergunta, setPergunta] = useState('')
  const [historico, setHistorico] = useState<{ pergunta: string; resposta: string }[]>([])
  const [dadosCarregados, setDadosCarregados] = useState<any>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function init() {
      if (!userIdRef.current) {
        const { data: { user } } = await supabase.auth.getUser()
        userIdRef.current = user?.id ?? null
        cachedUserId = user?.id ?? null
      }
    }
    init()
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [historico])

  async function carregarDados() {
    const uid = userIdRef.current
    if (!uid) return null

    const [
      { data: entradas },
      { data: cartoes },
      { data: fixas },
      { data: combustivel },
      { data: lancamentos },
    ] = await Promise.all([
      supabase.from('entradas').select('valor').eq('user_id', uid).eq('mes', mes).eq('ano', ano),
      supabase.from('cartoes').select('valor').eq('user_id', uid).eq('mes', mes).eq('ano', ano),
      supabase.from('contas_fixas').select('valor').eq('user_id', uid).eq('mes', mes).eq('ano', ano),
      supabase.from('combustivel').select('valor').eq('user_id', uid).eq('mes', mes).eq('ano', ano),
      supabase.from('lancamentos_cartao').select('local, valor').eq('user_id', uid).eq('mes', mes).eq('ano', ano),
    ])

    const soma = (rows: any[] | null) => (rows || []).reduce((s, r) => s + Number(r.valor), 0)

    // Histórico últimos 3 meses
    const historico3M = await Promise.all(
      [-3, -2, -1].map(async offset => {
        const d = new Date(ano, mes - 1 + offset, 1)
        const m = d.getMonth() + 1
        const a = d.getFullYear()
        const [{ data: e }, { data: c }, { data: f }, { data: cb }] = await Promise.all([
          supabase.from('entradas').select('valor').eq('user_id', uid).eq('mes', m).eq('ano', a),
          supabase.from('cartoes').select('valor').eq('user_id', uid).eq('mes', m).eq('ano', a),
          supabase.from('contas_fixas').select('valor').eq('user_id', uid).eq('mes', m).eq('ano', a),
          supabase.from('combustivel').select('valor').eq('user_id', uid).eq('mes', m).eq('ano', a),
        ])
        return { mes: m, entradas: soma(e), saidas: soma(c) + soma(f) + soma(cb) }
      })
    )

    const lancamentosCartao = (lancamentos || [])
      .map(l => ({ local: l.local, valor: Number(l.valor) }))
      .sort((a, b) => b.valor - a.valor)

    return {
      mes,
      ano,
      entradas: soma(entradas),
      cartoes: soma(cartoes),
      fixas: soma(fixas),
      combustivel: soma(combustivel),
      historico: historico3M.filter(h => h.entradas > 0 || h.saidas > 0),
      lancamentosCartao: lancamentosCartao.slice(0, 10),
    }
  }

  async function analisar(perguntaCustom?: string) {
    setLoading(true)
    try {
      const dados = dadosCarregados || await carregarDados()
      if (!dados) return
      setDadosCarregados(dados)

      const res = await fetch('/api/ia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dados, pergunta: perguntaCustom }),
      })
      const json = await res.json()

      if (perguntaCustom) {
        setHistorico(h => [...h, { pergunta: perguntaCustom, resposta: json.resposta || json.error || 'Erro' }])
      } else {
        setResposta(json.resposta || '')
        setInsights(json.insights || [])
        setFonte(json.fonte || '')
      }
    } catch (e: any) {
      if (perguntaCustom) {
        setHistorico(h => [...h, { pergunta: perguntaCustom, resposta: 'Erro ao processar: ' + e.message }])
      }
    }
    setLoading(false)
  }

  async function enviarPergunta() {
    const q = pergunta.trim()
    if (!q || loading) return
    setPergunta('')
    await analisar(q)
  }

  const formatarResposta = (texto: string) =>
    texto.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
         .replace(/\n/g, '<br/>')

  const MESES_PT = MESES

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">🤖 IA Financeira</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Análise inteligente dos seus gastos — {MESES_PT[mes - 1]} {ano}
          </p>
        </div>
        <button
          onClick={() => analisar()}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-sm hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <span className="animate-spin">⚙️</span>
              Analisando...
            </>
          ) : (
            <>✨ Gerar Análise</>
          )}
        </button>
      </div>

      {/* Banner Gemini status */}
      <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3">
        <span className="text-xl">🧠</span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">
            {fonte === 'gemini' ? 'Análise via Google Gemini AI' : fonte === 'heuristico' ? 'Análise Heurística Local Ativa' : 'Fischer AI — Inteligência Financeira'}
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400">
            {fonte === 'gemini'
              ? 'Respondendo com Gemini 1.5 Flash'
              : 'Configure GOOGLE_AI_KEY no .env.local para usar o Gemini AI'}
          </p>
        </div>
        {fonte && (
          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
            fonte === 'gemini'
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
          }`}>
            {fonte === 'gemini' ? '🟢 Gemini' : '🟡 Local'}
          </span>
        )}
      </div>

      {/* Sem dados ainda */}
      {!resposta && insights.length === 0 && !loading && (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">🤖</div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            Pronto para Analisar!
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto mb-6">
            Clique em "Gerar Análise" para receber insights personalizados sobre seus gastos de {MESES_PT[mes - 1]}.
          </p>
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
            {[
              { icon: '📊', label: 'Padrões de Gasto' },
              { icon: '⚠️', label: 'Alertas Inteligentes' },
              { icon: '🔮', label: 'Projeções Futuras' },
            ].map(item => (
              <div key={item.label} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
                <div className="text-2xl mb-1">{item.icon}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insights cards */}
      {insights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((insight, i) => (
            <div
              key={i}
              className={`rounded-xl p-4 border ${COR_MAP[insight.cor] || COR_MAP.blue}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">{insight.icone}</span>
                <div className="flex-1">
                  <h3 className="font-bold text-sm mb-1">{insight.titulo}</h3>
                  <p className="text-xs leading-relaxed opacity-90">{insight.descricao}</p>
                  {insight.valor !== undefined && (
                    <p className="text-sm font-bold mt-2">{formatBRL(insight.valor)}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resposta da IA */}
      {resposta && (
        <div className="card">
          <h2 className="font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
            <span>🧠</span>
            <span>Análise Detalhada</span>
          </h2>
          <div
            className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: formatarResposta(resposta) }}
          />
        </div>
      )}

      {/* Chat com seus gastos */}
      {dadosCarregados && (
        <div className="card">
          <h2 className="font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <span>💬</span>
            <span>Pergunte sobre seus Gastos</span>
          </h2>

          {/* Histórico de chat */}
          <div className="space-y-4 mb-4 max-h-72 overflow-y-auto">
            {historico.length === 0 ? (
              <div className="text-center py-6 text-gray-400 text-sm">
                <p>Exemplos de perguntas:</p>
                <div className="flex flex-wrap gap-2 justify-center mt-2">
                  {[
                    'Onde estou gastando mais?',
                    'Posso economizar este mês?',
                    'Como está meu saldo?',
                    'Devo preocupar com algum gasto?',
                  ].map(q => (
                    <button
                      key={q}
                      onClick={() => { setPergunta(q); }}
                      className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              historico.map((h, i) => (
                <div key={i} className="space-y-2">
                  {/* Pergunta */}
                  <div className="flex justify-end">
                    <div className="bg-blue-600 text-white text-sm px-4 py-2.5 rounded-2xl rounded-tr-sm max-w-xs">
                      {h.pergunta}
                    </div>
                  </div>
                  {/* Resposta */}
                  <div className="flex justify-start">
                    <div className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm px-4 py-2.5 rounded-2xl rounded-tl-sm max-w-sm leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: formatarResposta(h.resposta) }}
                    />
                  </div>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={pergunta}
              onChange={e => setPergunta(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && enviarPergunta()}
              placeholder="Pergunte sobre seus gastos..."
              className="input flex-1"
              disabled={loading}
            />
            <button
              onClick={enviarPergunta}
              disabled={loading || !pergunta.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? '⏳' : '➤'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
