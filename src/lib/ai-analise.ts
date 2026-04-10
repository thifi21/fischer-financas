// IA Análise — Fischer Finanças
// Engine de análise de gastos com integração Gemini AI + fallback heurístico

import { GoogleGenerativeAI } from '@google/generative-ai'

export interface InsightFinanceiro {
  tipo: 'alerta' | 'dica' | 'parabens' | 'tendencia' | 'projecao'
  titulo: string
  descricao: string
  valor?: number
  cor: string
  icone: string
}

export interface DadosParaAnalise {
  mes: number
  ano: number
  entradas: number
  cartoes: number
  fixas: number
  combustivel: number
  pendentes?: { descricao: string; valor: number; data_vencimento: string | null }[]
  historico?: { mes: number; entradas: number; saidas: number }[]
  lancamentosCartao?: { local: string; valor: number }[]
}

const MESES_PT = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

// ── Análise Heurística Local (fallback sem API) ─────────────────
function analiseHeuristica(dados: DadosParaAnalise): InsightFinanceiro[] {
  const insights: InsightFinanceiro[] = []
  const totalSaidas = dados.cartoes + dados.fixas + dados.combustivel
  const saldo = dados.entradas - totalSaidas
  const taxaGasto = dados.entradas > 0 ? (totalSaidas / dados.entradas) * 100 : 0

  // Saldo positivo/negativo
  if (saldo < 0) {
    insights.push({
      tipo: 'alerta',
      titulo: '⚠️ Saldo Negativo',
      descricao: `Você gastou ${(taxaGasto - 100).toFixed(1)}% a mais do que ganhou em ${MESES_PT[dados.mes - 1]}. Considere revisar os gastos com cartões e contas fixas.`,
      valor: Math.abs(saldo),
      cor: 'red',
      icone: '🚨',
    })
  } else if (taxaGasto < 70) {
    insights.push({
      tipo: 'parabens',
      titulo: '🎉 Excelente Controle!',
      descricao: `Você gastou apenas ${taxaGasto.toFixed(1)}% da sua renda em ${MESES_PT[dados.mes - 1]}. Ótima oportunidade para investir ou ampliar sua reserva de emergência.`,
      valor: saldo,
      cor: 'green',
      icone: '✅',
    })
  }

  // Alerta de cartões altos
  if (dados.entradas > 0 && dados.cartoes / dados.entradas > 0.4) {
    insights.push({
      tipo: 'alerta',
      titulo: '💳 Cartões em Alta',
      descricao: `Seus cartões representam ${((dados.cartoes / dados.entradas) * 100).toFixed(1)}% da sua renda. O ideal é manter abaixo de 30%.`,
      valor: dados.cartoes,
      cor: 'orange',
      icone: '💳',
    })
  }

  // Dica de reserva
  if (saldo > dados.entradas * 0.2) {
    insights.push({
      tipo: 'dica',
      titulo: '💰 Reserve para Emergências',
      descricao: `Você tem ${((saldo / dados.entradas) * 100).toFixed(0)}% de sobra. Considere destinar ao menos metade para uma reserva de emergência ou investimentos.`,
      valor: saldo * 0.5,
      cor: 'blue',
      icone: '🏦',
    })
  }

  // Tendência histórica
  if (dados.historico && dados.historico.length >= 2) {
    const ultimos = dados.historico.slice(-3)
    const mediaSaidas = ultimos.reduce((s, h) => s + h.saidas, 0) / ultimos.length
    const variacao = ((totalSaidas - mediaSaidas) / mediaSaidas) * 100

    if (variacao > 15) {
      insights.push({
        tipo: 'tendencia',
        titulo: '📈 Gastos Acima da Média',
        descricao: `Seus gastos estão ${variacao.toFixed(1)}% acima da média dos últimos meses (${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(mediaSaidas)}). Verifique o que mudou.`,
        cor: 'orange',
        icone: '📈',
      })
    } else if (variacao < -10) {
      insights.push({
        tipo: 'parabens',
        titulo: '📉 Gastos Abaixo da Média',
        descricao: `Ótimo! Seus gastos caíram ${Math.abs(variacao).toFixed(1)}% em relação à média dos últimos meses.`,
        cor: 'green',
        icone: '📉',
      })
    }

    // Projeção próximo mês
    const projecao = mediaSaidas * 1.02 // +2% inflação estimada
    insights.push({
      tipo: 'projecao',
      titulo: '🔮 Projeção Próximo Mês',
      descricao: `Com base nos seus gastos históricos, estima-se que seus gastos no próximo mês serão de aproximadamente ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(projecao)}.`,
      valor: projecao,
      cor: 'purple',
      icone: '🔮',
    })
  }

  // Top gasto (cartão)
  if (dados.lancamentosCartao && dados.lancamentosCartao.length > 0) {
    const sorted = [...dados.lancamentosCartao].sort((a, b) => b.valor - a.valor)
    const top = sorted[0]
    insights.push({
      tipo: 'dica',
      titulo: '🏆 Maior Gasto no Cartão',
      descricao: `Seu maior lançamento no cartão foi "${top.local}" com ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(top.valor)}. Vale avaliar se é recorrente ou necessário.`,
      valor: top.valor,
      cor: 'indigo',
      icone: '🏆',
    })
  }

  return insights
}

// ── Análise via Gemini AI ──────────────────────────────────────
async function analiseGemini(dados: DadosParaAnalise, pergunta?: string): Promise<string> {
  const apiKey = process.env.GOOGLE_AI_KEY
  if (!apiKey) throw new Error('GOOGLE_AI_KEY não configurada')

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const totalSaidas = dados.cartoes + dados.fixas + dados.combustivel
  const saldo = dados.entradas - totalSaidas

  const contexto = `
Você é um assistente financeiro pessoal chamado "Fischer AI" para a família Fischer.
Dados financeiros de ${MESES_PT[dados.mes - 1]} ${dados.ano}:
- Entradas (salários): R$ ${dados.entradas.toFixed(2)}
- Gastos com Cartões: R$ ${dados.cartoes.toFixed(2)}
- Contas Fixas: R$ ${dados.fixas.toFixed(2)}
- Combustível: R$ ${dados.combustivel.toFixed(2)}
- Total de Saídas (Pagas): R$ ${totalSaidas.toFixed(2)}
- Saldo do Mês (Realizado): R$ ${saldo.toFixed(2)} (${saldo >= 0 ? 'POSITIVO' : 'NEGATIVO'})
${dados.pendentes && dados.pendentes.length > 0 ? `
Contas PENDENTES (A vencer este mês):
${dados.pendentes.map(p => `- ${p.descricao}: R$ ${p.valor.toFixed(2)} (Vence: ${p.data_vencimento || 'N/A'})`).join('\n')}
Total Pendente: R$ ${dados.pendentes.reduce((s, p) => s + p.valor, 0).toFixed(2)}
Projeção de Saldo Final: R$ ${(saldo - dados.pendentes.reduce((s, p) => s + p.valor, 0)).toFixed(2)}
` : ''}
${dados.historico && dados.historico.length > 0 ? `
Histórico dos últimos meses (Entrada / Saída):
${dados.historico.map(h => `- ${MESES_PT[h.mes - 1]}: Entradas R$ ${h.entradas.toFixed(2)} | Saídas R$ ${h.saidas.toFixed(2)}`).join('\n')}
` : ''}
${dados.lancamentosCartao && dados.lancamentosCartao.length > 0 ? `
Top 5 maiores lançamentos no cartão:
${dados.lancamentosCartao.slice(0, 5).map(l => `- ${l.local}: R$ ${l.valor.toFixed(2)}`).join('\n')}
` : ''}

Responda em português brasileiro de forma clara, direta e amigável. Use no máximo 3 parágrafos.
${pergunta ? `Pergunta do usuário: ${pergunta}` : 'Forneça uma análise financeira completa com insights, alertas e recomendações práticas.'}
`

  const result = await model.generateContent(contexto)
  return result.response.text()
}

// ── Categorização Inteligente via Gemini AI ─────────────────────
export async function categorizarTransacoesAI(transacoes: { descricao: string; valor: number }[]): Promise<Record<string, string>> {
  const apiKey = process.env.GOOGLE_AI_KEY
  if (!apiKey) return {}

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const prompt = `
Categorize os seguintes lançamentos financeiros nas categorias: alimentacao, transporte, saude, educacao, lazer, moradia, vestuario, outros.
Retorne APENAS um objeto JSON onde a chave é a descrição exata e o valor é a categoria.

Lançamentos:
${transacoes.map(t => `- ${t.descricao} (R$ ${t.valor})`).join('\n')}
`

  try {
    const result = await model.generateContent(prompt)
    const text = result.response.text()
    // Limpa possível formatação markdown do Gemini
    const cleanJson = text.replace(/```json|```/gi, '').trim()
    return JSON.parse(cleanJson)
  } catch (e) {
    console.error('Erro ao categorizar com IA:', e)
    return {}
  }
}

// ── Exportações públicas ──────────────────────────────────────
export { analiseHeuristica, analiseGemini }
