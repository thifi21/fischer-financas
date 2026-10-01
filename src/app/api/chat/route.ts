import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { enforceRateLimit, requireApiUser } from '@/lib/api-auth'

let genAI: GoogleGenerativeAI | null = null

function getModel() {
  const apiKey = process.env.GOOGLE_AI_KEY
  if (!apiKey) return null
  if (!genAI) genAI = new GoogleGenerativeAI(apiKey)
  return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
}

type ChatMessage = { role: 'user' | 'assistant'; content: string }

export async function POST(req: NextRequest) {
  try {
    const auth = await requireApiUser(req)
    if (auth.error) return auth.error
    const limited = await enforceRateLimit(auth.supabase, 'chat', 20, 60)
    if (limited) return limited

    const { messages } = await req.json()
    if (!Array.isArray(messages) || messages.length === 0 || messages.length > 20) {
      return NextResponse.json({ error: 'Mensagens inválidas ou ausentes.' }, { status: 400 })
    }
    const invalid = messages.some((msg: unknown) => {
      if (!msg || typeof msg !== 'object') return true
      const value = msg as Partial<ChatMessage>
      return !['user', 'assistant'].includes(String(value.role))
        || typeof value.content !== 'string'
        || value.content.length > 4000
    })
    if (invalid) {
      return NextResponse.json({ error: 'Formato ou tamanho de mensagem inválido.' }, { status: 400 })
    }

    const model = getModel()
    if (!model) {
      return NextResponse.json({ error: 'Assistente de IA não configurado.' }, { status: 503 })
    }

    const systemPrompt = `Você é o Fischer AI, um assistente financeiro da família Fischer.
Responda de forma amigável, clara, concisa e sempre em português brasileiro.
Use markdown para facilitar a leitura e mantenha o foco em finanças.`

    const typedMessages = messages as ChatMessage[]
    const lastMessage = typedMessages[typedMessages.length - 1]
    const history = typedMessages.slice(0, -1).map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }))
    const chat = model.startChat({ history: [
      { role: 'user', parts: [{ text: systemPrompt }] },
      { role: 'model', parts: [{ text: 'Entendido! Como posso ajudar com suas finanças hoje?' }] },
      ...history,
    ] })
    const result = await chat.sendMessage(lastMessage.content)
    return NextResponse.json({ resposta: result.response.text() })
  } catch (error) {
    console.error('Erro no Chat Gemini:', error)
    return NextResponse.json({ error: 'Erro interno ao processar o chat' }, { status: 500 })
  }
}
