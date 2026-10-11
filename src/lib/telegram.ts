/**
 * Utilitário para envio de mensagens via Telegram Bot API.
 * Opcionalmente registra o resultado em historico_notificacoes.
 */

import { createClient as createSupabaseServer } from '@supabase/supabase-js'
import { criarLogger } from '@/lib/logger'

const log = criarLogger('telegram')

export async function sendTelegramMessage(text: string, options?: {
  userId?: string
  titulo?: string
  /** Chat de destino do usuário; se ausente usa TELEGRAM_CHAT_ID */
  chatId?: string | null
}) {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim()
  const chatId = (options?.chatId?.trim() || process.env.TELEGRAM_CHAT_ID?.trim() || '').replace(/^@(?=\d)/, '')

  if (!token || !chatId) {
    log.error('TELEGRAM_BOT_TOKEN ou chat de destino não configurados.')
    return { success: false, error: 'Configuração ausente no Vercel' }
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`

  let result: { success: boolean; error?: string }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML',
      }),
    })

    if (response.ok) {
      result = { success: true }
    } else {
      const errorData = await response.json()
      log.error('Erro ao enviar mensagem para Telegram', errorData)
      result = { success: false, error: errorData.description || 'Erro desconhecido' }
    }
  } catch (error) {
    log.error('Erro de rede ao enviar Telegram', error)
    result = { success: false, error: 'Erro de conexão' }
  }

  // Registrar no histórico se userId fornecido
  if (options?.userId) {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
      if (supabaseUrl && serviceKey) {
        const supabase = createSupabaseServer(supabaseUrl, serviceKey)
        await supabase.from('historico_notificacoes').insert({
          user_id: options.userId,
          canal: 'telegram',
          titulo: options.titulo || 'Mensagem Telegram',
          mensagem: text.replace(/<[^>]+>/g, '').substring(0, 500),
          status: result.success ? 'enviado' : 'falhou',
          erro: result.error ?? null,
        })
      }
    } catch (e) {
      console.error('Erro ao registrar histórico de notificação:', e)
    }
  }

  return result
}
