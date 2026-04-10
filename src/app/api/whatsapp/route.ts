import { NextResponse } from 'next/server'
import { sendWhatsAppMessage } from '@/lib/whatsapp'

export async function POST(request: Request) {
  try {
    const { message } = await request.json()
    
    if (!message) {
      return NextResponse.json({ error: 'Mensagem é obrigatória' }, { status: 400 })
    }

    const result = await sendWhatsAppMessage(message)
    
    if (result.success) {
      return NextResponse.json({ success: true, message: 'Enviado com sucesso' })
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno ao processar notificação' }, { status: 500 })
  }
}
