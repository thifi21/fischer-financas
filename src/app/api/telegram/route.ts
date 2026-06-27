import { NextRequest, NextResponse } from 'next/server'
import { sendTelegramMessage } from '@/lib/telegram'
import { enforceRateLimit, requireApiUser } from '@/lib/api-auth'

export async function POST(request: NextRequest) {
  try {
    const auth = await requireApiUser(request)
    if (auth.error) return auth.error
    const limited = await enforceRateLimit(auth.supabase, 'telegram', 5, 60)
    if (limited) return limited

    const { message } = await request.json()

    if (typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'Mensagem é obrigatória' }, { status: 400 })
    }
    if (message.length > 4096) {
      return NextResponse.json({ error: 'Mensagem excede 4096 caracteres' }, { status: 413 })
    }

    const result = await sendTelegramMessage(message)

    if (result.success) {
      return NextResponse.json({ success: true, message: 'Enviado com sucesso' })
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno ao processar notificação' }, { status: 500 })
  }
}
