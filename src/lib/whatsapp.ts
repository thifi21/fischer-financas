/**
 * Envia mensagens para o WhatsApp usando a API gratuita do CallMeBot.
 * Requisito: O usuário deve primeiro autorizar o bot enviando uma mensagem 
 * "I allow callmebot to send me messages" para o número do bot.
 */
export async function sendWhatsAppMessage(text: string) {
  const phone = process.env.WHATSAPP_PHONE // Formato internacional: 5511999999999
  const apiKey = process.env.WHATSAPP_API_KEY
  
  if (!phone || !apiKey) {
    console.error('WhatsApp: WHATSAPP_PHONE ou WHATSAPP_API_KEY não configurados.')
    return { success: false, error: 'Configuração ausente' }
  }

  // Codifica a mensagem para URL
  const encodedText = encodeURIComponent(text)
  const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodedText}&apikey=${apiKey}`

  try {
    const response = await fetch(url)
    if (response.ok) {
      return { success: true }
    } else {
      const errorText = await response.text()
      console.error('Erro ao enviar mensagem para WhatsApp:', errorText)
      return { success: false, error: errorText }
    }
  } catch (error) {
    console.error('Erro de rede ao enviar WhatsApp:', error)
    return { success: false, error: 'Erro de conexão' }
  }
}
