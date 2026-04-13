/**
 * Utilitário para envio de mensagens via WhatsApp usando a API do CallMeBot.
 * Serviço gratuito para uso pessoal.
 */
/**
 * Retorna a lista de números de WhatsApp configurados (mascarados ou rotulados).
 */
export function getConfiguredWhatsAppNumbers() {
  const configs: { label: string; index: number }[] = []
  
  const defaultPhone = process.env.WHATSAPP_PHONE?.trim()
  const defaultLabel = process.env.WHATSAPP_LABEL?.trim()
  if (defaultPhone) configs.push({ label: defaultLabel || defaultPhone.slice(-4), index: 0 })

  for (let i = 1; i <= 5; i++) {
    const p = process.env[`WHATSAPP_PHONE_${i}`]?.trim()
    const l = process.env[`WHATSAPP_LABEL_${i}`]?.trim()
    if (p) configs.push({ label: l || p.slice(-4), index: i })
  }
  
  return configs
}

export async function sendWhatsAppMessage(text: string, targetIndex?: number) {
  const idInstance = process.env.GREEN_API_ID_INSTANCE?.trim()
  const apiTokenInstance = process.env.GREEN_API_TOKEN_INSTANCE?.trim()

  if (!idInstance || !apiTokenInstance) {
    console.error('WhatsApp (GreenAPI): Configurações ausentes.')
    return { success: false, error: 'Configuração da API incompleta' }
  }

  // Coletar todos os números disponíveis
  const configs: { phone: string; index: number }[] = []

  const defaultPhone = process.env.WHATSAPP_PHONE?.trim()
  if (defaultPhone) configs.push({ phone: defaultPhone, index: 0 })

  for (let i = 1; i <= 5; i++) {
    const p = process.env[`WHATSAPP_PHONE_${i}`]?.trim()
    if (p) {
      configs.push({ phone: p, index: i })
    }
  }

  // Filtrar se houver um alvo específico
  const targets = targetIndex !== undefined 
    ? configs.filter(c => c.index === targetIndex)
    : configs

  if (targets.length === 0) {
    console.error('WhatsApp: Nenhuma configuração correspondente encontrada.')
    return { success: false, error: 'Destinatário não encontrado' }
  }

  const results = []

  for (const { phone } of targets) {
    // Formatar o número para o padrão Green API: ddd + número + @c.us (sem o + e sem espaços)
    const cleanPhone = phone.replace(/\D/g, '') // Mantém apenas números
    const chatId = `${cleanPhone}@c.us`
    
    const url = `https://api.green-api.com/waInstance${idInstance}/sendMessage/${apiTokenInstance}`
    console.log(`WhatsApp: Enviando para ${chatId} via ${url}`)

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: chatId,
          message: text
        }),
        cache: 'no-store'
      })
      
      const data = await response.json()
      console.log(`WhatsApp: Resposta de ${phone}:`, data)
      
      // No Green API, se o envio for bem sucedido ele retorna um idMessage
      const isOk = response.ok && data.idMessage
      
      results.push({ 
        phone, 
        success: isOk, 
        errorText: isOk ? 'Enviado' : (data.message || data.error || 'Erro no envio'), 
        status: response.status 
      })
    } catch (error: any) {
      console.error(`WhatsApp: Erro ao enviar para ${phone}:`, error)
      results.push({ phone, success: false, error: 'Erro de conexão', errorText: error.message })
    }
  }

  const allSuccess = results.every(r => r.success)
  return { success: allSuccess, results }
}
