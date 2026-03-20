export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-'
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('pt-BR')
}

export function getMesAtual(): number {
  return new Date().getMonth() + 1
}

export function getAnoAtual(): number {
  return new Date().getFullYear()
}
