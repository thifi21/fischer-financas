/**
 * Utilitários de data no fuso de Brasília (America/Sao_Paulo),
 * independentes do fuso do servidor (UTC na Vercel).
 */

export const FUSO_BRASIL = 'America/Sao_Paulo'

export type DataBrasil = {
  ano: number
  mes: number
  dia: number
  hora: number
  /** YYYY-MM-DD */
  iso: string
}

/** Retorna a data/hora de Brasília para o instante informado (padrão: agora). */
export function agoraBrasil(base: Date = new Date()): DataBrasil {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: FUSO_BRASIL,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(base)

  const get = (tipo: string) => Number(partes.find(p => p.type === tipo)?.value)
  const ano = get('year')
  const mes = get('month')
  const dia = get('day')
  const hora = get('hour')

  return {
    ano,
    mes,
    dia,
    hora,
    iso: `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`,
  }
}

/** Data (YYYY-MM-DD) de hoje + N dias em Brasília. */
export function dataBrasilMaisDias(dias: number, base: Date = new Date()): string {
  const hoje = agoraBrasil(base)
  // Meio-dia UTC evita problemas de virada de dia ao somar dias
  const ref = new Date(Date.UTC(hoje.ano, hoje.mes - 1, hoje.dia, 12) + dias * 86_400_000)
  return ref.toISOString().slice(0, 10)
}
