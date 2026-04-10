'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase'
import { useMes } from '@/context/MesContext'
import { formatBRL } from '@/lib/utils'
import { MESES } from '@/types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { motion, AnimatePresence } from 'framer-motion'
import SankeyFlow from '@/components/SankeyFlow'

export default function IAAnalisePage() {
  const supabase = createClient()
  const { mes, ano } = useMes()
  
  const [pergunta, setPergunta] = useState('')
  const [analisando, setAnalisando] = useState(false)
  const [resultado, setResultado] = useState<{ resposta: string, insights: any[], fonte: string } | null>(null)

  // 1. Buscar dados consolidados do Dashboard para a análise
  const { data: summary, isLoading: loadingDash } = useQuery({
    queryKey: ['dashboard-summary', ano],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Não autenticado')
      const { data, error } = await supabase.rpc('get_annual_summary', { p_user_id: user.id, p_year: ano })
      if (error) throw error
      return data
    },
    staleTime: 1000 * 60 * 5,
  })

  // 1.1 Buscar contas fixas pendentes do mês atual
  const { data: pendentes } = useQuery({
    queryKey: ['contas-pendentes', mes, ano],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contas_fixas')
        .select('descricao, valor, data_vencimento')
        .eq('mes', mes)
        .eq('ano', ano)
        .eq('pago', false)
      if (error) throw error
      return data
    }
  })

  // 2. Preparar os dados para a IA
  const dadosAnalise = useMemo(() => {
    if (!summary) return null
    const atual = summary[mes] || { entradas: 0, cartoes: 0, fixas: 0, combustivel: 0 }
    
    // Histórico dos últimos meses com dados
    const historico = Object.entries(summary)
      .map(([m, d]: any) => ({
        mes: parseInt(m),
        entradas: Number(d.entradas),
        saidas: Number(d.cartoes) + Number(d.fixas) + Number(d.combustivel)
      }))
      .filter(h => h.entradas > 0 || h.saidas > 0)
      .sort((a, b) => a.mes - b.mes)

    return {
      mes,
      ano,
      entradas: Number(atual.entradas),
      cartoes: Number(atual.cartoes),
      fixas: Number(atual.fixas),
      combustivel: Number(atual.combustivel),
      pendentes: pendentes || [],
      historico
    }
  }, [summary, mes, ano, pendentes])

  // 3. Chamar API de IA
  const executarAnalise = async (customPrompt?: string) => {
    if (!dadosAnalise) return
    setAnalisando(true)
    try {
      const res = await fetch('/api/ia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dados: dadosAnalise, pergunta: customPrompt }),
      })
      const json = await res.json()
      setResultado(json)
    } catch (e) {
      console.error('Erro na análise:', e)
    }
    setAnalisando(false)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <span className="text-3xl">🤖</span> Fischer AI Analysis
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Diagnóstico inteligente das suas finanças em {MESES[mes - 1]} de {ano}
          </p>
        </div>
        <Button 
          onClick={() => executarAnalise()} 
          disabled={analisando || loadingDash || !dadosAnalise}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-6 rounded-2xl shadow-lg shadow-blue-500/20"
        >
          {analisando ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
              Processando Diagnóstico...
            </span>
          ) : (
            <span className="flex items-center gap-2">✨ Gerar Diagnóstico do Mês</span>
          )}
        </Button>
      </div>

      {!resultado && !analisando ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <Card className="p-8 border-dashed border-2 flex flex-col items-center text-center justify-center bg-gray-50 dark:bg-slate-900/50">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Pronto para Analisar</h3>
            <p className="text-sm text-gray-500 mt-2 max-w-xs">
              Clique no botão acima para que a Fischer AI processe seus gastos e forneça insights sobre economia e metas.
            </p>
          </Card>
          <Card className="p-8 border-dashed border-2 flex flex-col items-center text-center justify-center bg-gray-50 dark:bg-slate-900/50">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Visão Geral Detalhada</h3>
            <p className="text-sm text-gray-500 mt-2 max-w-xs">
              Nossa engine utiliza análise heurística local para garantir sua privacidade enquanto gera alertas de gastos.
            </p>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Principal: Resposta da IA */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence mode="wait">
              {analisando ? (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="h-64 bg-gray-100 dark:bg-slate-800 animate-pulse rounded-3xl" />
                  <div className="h-32 bg-gray-100 dark:bg-slate-800 animate-pulse rounded-3xl" />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Resposta principal */}
                  <Card className="p-8 bg-white dark:bg-slate-900 border-none shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl select-none">🤖</div>
                    <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                      {resultado?.resposta}
                    </div>
                  </Card>

                  {/* Gráfico de Fluxo de Caixa (Sankey) */}
                  {dadosAnalise && (
                    <Card className="p-8 bg-white dark:bg-slate-900 border-none shadow-xl border-t-4 border-t-blue-500">
                      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
                        <span>🌊</span> Fluxo de Caixa do Período
                      </h3>
                      <SankeyFlow data={{
                        receitas: dadosAnalise.entradas,
                        cartoes: dadosAnalise.cartoes,
                        fixas: dadosAnalise.fixas,
                        combustivel: dadosAnalise.combustivel,
                        sobra: Math.max(0, dadosAnalise.entradas - (dadosAnalise.cartoes + dadosAnalise.fixas + dadosAnalise.combustivel))
                      }} />
                      <p className="text-[10px] text-center text-gray-400 mt-4 italic">
                         Visualização da jornada do seu dinheiro das Entradas para as Saídas e Reservas.
                      </p>
                    </Card>
                  )}

                  {/* Chat Interativo */}
                  <Card className="p-6 bg-blue-50 dark:bg-slate-800/50 border-blue-100 dark:border-slate-700">
                    <h3 className="text-sm font-bold text-blue-800 dark:text-blue-400 mb-3 flex items-center gap-2">
                       <span>💬</span> Perguntar algo específico
                    </h3>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={pergunta}
                        onChange={(e) => setPergunta(e.target.value)}
                        placeholder="Ex: Como posso economizar mais este mês?"
                        className="flex-1 bg-white dark:bg-slate-950 border border-blue-200 dark:border-slate-700 rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onKeyDown={(e) => e.key === 'Enter' && executarAnalise(pergunta)}
                      />
                      <Button 
                        onClick={() => executarAnalise(pergunta)}
                        disabled={analisando || !pergunta.trim()}
                        className="bg-blue-600 text-white rounded-xl"
                      >
                        Enviar
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Coluna Lateral: Insights Rápidos */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 px-2">Insights Automáticos</h3>
            <AnimatePresence>
              {resultado?.insights.map((insight: any, idx: number) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className={`p-4 border-l-4 shadow-sm ${
                    insight.cor === 'red' ? 'border-l-red-500 bg-red-50/50 dark:bg-red-950/20' :
                    insight.cor === 'green' ? 'border-l-green-500 bg-green-50/50 dark:bg-green-950/20' :
                    insight.cor === 'orange' ? 'border-l-orange-500 bg-orange-50/50 dark:bg-orange-950/20' :
                    'border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
                  }`}>
                    <div className="flex items-start gap-3">
                      <span className="text-xl">{insight.icone}</span>
                      <div className="space-y-1">
                        <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 leading-tight">
                          {insight.titulo}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                          {insight.descricao}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {resultado?.fonte === 'heuristico' && (
              <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900 rounded-xl">
                <p className="text-[10px] text-amber-800 dark:text-amber-400 font-medium leading-tight">
                   💡 Nota: Você está usando a engine heurística local. Para usar o modelo Gemini AI, configure sua chave no arquivo .env.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
