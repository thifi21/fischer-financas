import { formatBRL } from './utils'

/**
 * Envia uma notificação de pagamento confirmado para o Telegram.
 */
export async function notificarPagamento(descricao: string, valor: number, icone: string = '✅') {
  const mensagem = `${icone} <b>Pagamento Confirmado!</b>\n\n📌 <b>Descrição:</b> ${descricao}\n💰 <b>Valor:</b> ${formatBRL(valor)}`

  try {
    const res = await fetch('/api/telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: mensagem })
    })
    
    if (!res.ok) {
      console.error('Falha ao enviar notificação automática de pagamento')
    }
  } catch (error) {
    console.error('Erro de rede ao tentar notificar pagamento:', error)
  }
}
