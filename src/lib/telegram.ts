/**
 * Utilitário para envio de mensagens via Telegram Bot API.
 */
export async function sendTelegramMessage(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim()
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim().replace(/^@/, '')

  if (!token || !chatId) {
    console.error('Telegram: TELEGRAM_BOT_TOKEN ou TELEGRAM_CHAT_ID não configurados.')
    return { success: false, error: 'Configuração ausente no Vercel' }
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`

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
      return { success: true }
    } else {
      const errorData = await response.json()
      console.error('Erro ao enviar mensagem para Telegram:', errorData)
      return { success: false, error: errorData.description || 'Erro desconhecido' }
    }
  } catch (error) {
    console.error('Erro de rede ao enviar Telegram:', error)
    return { success: false, error: 'Erro de conexão' }
  }
}
