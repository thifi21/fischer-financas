import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Mensagens inválidas ou ausentes.' }, { status: 400 })
    }

    const apiKey = process.env.GOOGLE_AI_KEY

    if (!apiKey) {
      return NextResponse.json({ error: 'A chave GOOGLE_AI_KEY não está configurada no .env.local.' }, { status: 500 })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    // O prompt de sistema instrui a IA sobre como ela deve se comportar
    const systemPrompt = `Você é o "Fischer AI", um assistente virtual financeiro projetado para ajudar a família Fischer a organizar e entender suas finanças no aplicativo Fischer Finanças.
Responda de forma amigável, clara, concisa e sempre em português brasileiro.
Use formatação markdown (como **negrito**, listas) para tornar as respostas fáceis de ler.
Mantenha as respostas curtas (no máximo 2-3 parágrafos curtos) a menos que o usuário peça uma explicação detalhada.
Se o usuário perguntar algo não relacionado a finanças, responda educadamente, mas lembre-o de que o seu foco principal é ajudá-lo com suas finanças.`

    // A biblioteca do Gemini espera o histórico em um formato específico:
    // [{ role: 'user' | 'model', parts: [{ text: '...' }] }]
    // Mas a mensagem atual é passada para sendMessage.
    
    // Separando a última mensagem (atual) do restante do histórico
    const lastMessage = messages[messages.length - 1]
    const history = messages.slice(0, messages.length - 1).map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }))

    // Inicia um chat com o histórico
    const chat = model.startChat({
      history: [
        // Enviando o prompt de sistema na primeira iteração (como se fosse o usuário pedindo para ele agir assim, e ele concordando)
        {
          role: 'user',
          parts: [{ text: systemPrompt }]
        },
        {
          role: 'model',
          parts: [{ text: 'Entendido! Sou o Fischer AI, seu assistente financeiro pessoal. Como posso ajudar com suas finanças hoje?' }]
        },
        ...history
      ]
    })

    // Envia a nova mensagem do usuário
    const result = await chat.sendMessage(lastMessage.content)
    const response = await result.response

    return NextResponse.json({ resposta: response.text() })
  } catch (error: any) {
    console.error('Erro no Chat Gemini:', error)
    return NextResponse.json({ error: error.message || 'Erro interno no servidor' }, { status: 500 })
  }
}
