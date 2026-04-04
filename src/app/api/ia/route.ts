import { NextRequest, NextResponse } from 'next/server'
import { analiseGemini, analiseHeuristica, type DadosParaAnalise } from '@/lib/ai-analise'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { dados, pergunta }: { dados: DadosParaAnalise; pergunta?: string } = body

    if (!dados) {
      return NextResponse.json({ error: 'Dados financeiros não fornecidos' }, { status: 400 })
    }

    const apiKey = process.env.GOOGLE_AI_KEY

    // Se a API Key estiver configurada, usa Gemini
    if (apiKey) {
      try {
        const resposta = await analiseGemini(dados, pergunta)
        const insights = analiseHeuristica(dados) // Sempre inclui insights heurísticos
        return NextResponse.json({ resposta, insights, fonte: 'gemini' })
      } catch (geminiErr: any) {
        console.error('Erro Gemini:', geminiErr.message)
        // Fallback para heurística
      }
    }

    // Fallback: análise heurística local
    const insights = analiseHeuristica(dados)
    const totalSaidas = dados.cartoes + dados.fixas + dados.combustivel
    const saldo = dados.entradas - totalSaidas
    const taxaGasto = dados.entradas > 0 ? (totalSaidas / dados.entradas * 100).toFixed(1) : '0'

    const resposta = `📊 **Análise Local de ${dados.mes}/${dados.ano}**

Você teve **R$ ${dados.entradas.toFixed(2)}** de entradas e **R$ ${totalSaidas.toFixed(2)}** de saídas, resultando em um saldo de **R$ ${saldo.toFixed(2)}** (${taxaGasto}% da renda comprometida).

${insights.map(i => `• **${i.titulo}**: ${i.descricao}`).join('\n')}

💡 *Para análises mais detalhadas com IA, configure a variável GOOGLE_AI_KEY no arquivo .env.local*`

    return NextResponse.json({ resposta, insights, fonte: 'heuristico' })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Erro interno' }, { status: 500 })
  }
}
