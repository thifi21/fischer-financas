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
  // Coletar todas as configurações disponíveis
  const configs: { phone: string; apiKey: string; index: number }[] = []

  const defaultPhone = process.env.WHATSAPP_PHONE?.trim()
  const defaultKey = process.env.WHATSAPP_API_KEY?.trim()
  if (defaultPhone && defaultKey) configs.push({ phone: defaultPhone, apiKey: defaultKey, index: 0 })

  for (let i = 1; i <= 5; i++) {
    const p = process.env[`WHATSAPP_PHONE_${i}`]?.trim()
    const k = process.env[`WHATSAPP_API_KEY_${i}`]?.trim()
    if (p && k) {
      configs.push({ phone: p, apiKey: k, index: i })
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

  const encodedText = encodeURIComponent(text)
  const results = []

  for (const { phone, apiKey } of targets) {
    const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`
    const url = `https://api.callmebot.com/whatsapp.php?phone=${formattedPhone}&text=${encodedText}&apikey=${apiKey}`

    try {
      const response = await fetch(url)
      const responseText = await response.text()
      
      const isOk = response.ok && (responseText.toLowerCase().includes('queue') || responseText.toLowerCase().includes('sent'))
      results.push({ phone, success: isOk })
    } catch (error) {
      results.push({ phone, success: false, error: 'Erro de conexão' })
    }
  }

  const allSuccess = results.every(r => r.success)
  return { success: allSuccess, results }
}
