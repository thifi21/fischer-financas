import { NextRequest, NextResponse } from 'next/server'
import { sendWhatsAppMessage, getConfiguredWhatsAppNumbers } from '@/lib/whatsapp'
import { enforceRateLimit, requireApiUser } from '@/lib/api-auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireApiUser(request)
    if (auth.error) return auth.error
    const numbers = getConfiguredWhatsAppNumbers()
    return NextResponse.json({ numbers })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao listar números' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireApiUser(request)
    if (auth.error) return auth.error
    const limited = enforceRateLimit(auth.user.id, 'whatsapp', 5, 60)
    if (limited) return limited

    const { message, targetIndex } = await request.json()

    if (typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'Mensagem é obrigatória' }, { status: 400 })
    }
    if (message.length > 4096) {
      return NextResponse.json({ error: 'Mensagem excede 4096 caracteres' }, { status: 413 })
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
