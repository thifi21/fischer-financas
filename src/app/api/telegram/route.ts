import { NextResponse } from 'next/server'
import { sendTelegramMessage } from '@/lib/telegram'

export async function POST(request: Request) {
  try {
    const { message } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Mensagem é obrigatória' }, { status: 400 })
    }

    const result = await sendTelegramMessage(message)

    if (result.success) {
      return NextResponse.json({ success: true, message: 'Enviado com sucesso' })
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
  } catch (error) {
    console.error('Crash na API de Telegram:', error)
    return NextResponse.json({ 
      error: 'Erro interno', 
      details: (error as Error).message 
    }, { status: 500 })
  }
}
