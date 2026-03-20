export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-'
  // Normaliza qualquer formato para DD/MM/AAAA
  const clean = dateStr.split('T')[0].split(' ')[0] // remove hora se existir
  const parts = clean.split('-')
  if (parts.length === 3) {
    return `${parts[2].padStart(2,'0')}/${parts[1].padStart(2,'0')}/${parts[0]}`
  }
  return dateStr
}

// Formata vencimento para exibição curta: "10/01", "14/02" etc.
// Aceita tanto "10/01" (já formatado) quanto "2026-01-10" ou "2025-03-12 00:00:00"
export function formatVencimento(venc: string | null): string {
  if (!venc) return ''
  // Já está no formato DD/MM
  if (/^\d{2}\/\d{2}$/.test(venc)) return venc
  // Está no formato AAAA-MM-DD (possivelmente com hora)
  const clean = venc.split('T')[0].split(' ')[0]
  const parts = clean.split('-')
  if (parts.length === 3) {
    return `${parts[2].padStart(2,'0')}/${parts[1].padStart(2,'0')}`
  }
  return venc
}

export function getMesAtual(): number {
  return new Date().getMonth() + 1
}

export function getAnoAtual(): number {
  return new Date().getFullYear()
}
