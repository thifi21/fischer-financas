import { formatBRL } from './utils'

/**
 * Envia uma notificação de pagamento confirmado para o Telegram.
 */
export async function notificarPagamento(descricao: string, valor: number, icone: string = '✅') {
  const mensagem = `${icone} *Pagamento Confirmado!*\n\n📌 *Descrição:* ${descricao}\n💰 *Valor:* ${formatBRL(valor)}`
  
  // Note: O WhatsApp (CallMeBot) usa asteriscos para negrito em vez de <b>
  // Vamos enviar mensagens separadas formatadas para cada um, ou uma genérica.
  const mensagemTelegram = `${icone} <b>Pagamento Confirmado!</b>\n\n📌 <b>Descrição:</b> ${descricao}\n💰 <b>Valor:</b> ${formatBRL(valor)}`

  // Disparar em paralelo
  try {
    const promises = [
      fetch('/api/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: mensagemTelegram })
      }),
      fetch('/api/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: mensagem })
      })
    ]
    
    await Promise.allSettled(promises)
  } catch (error) {
    console.error('Erro ao processar notificações automáticas:', error)
  }
}
