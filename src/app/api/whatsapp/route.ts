import { NextResponse } from 'next/server'
import { sendWhatsAppMessage, getConfiguredWhatsAppNumbers } from '@/lib/whatsapp'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const numbers = getConfiguredWhatsAppNumbers()
    return NextResponse.json({ numbers })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao listar números' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { message, targetIndex } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Mensagem é obrigatória' }, { status: 400 })
    }

    const result = await sendWhatsAppMessage(message as string, targetIndex as number)

    if (result.success) {
      return NextResponse.json({ success: true, message: 'Enviado com sucesso' })
    } else {
      return NextResponse.json({ 
        error: result.error || 'Falha no envio para um ou mais números', 
        details: result.results 
      }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno ao processar notificação WhatsApp' }, { status: 500 })
  }
}
