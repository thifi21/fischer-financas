export type Cartao = {
  id: string
  user_id: string
  mes: number
  ano: number
  nome: string
  vencimento: string | null
  valor: number
  pago: boolean
  created_at: string
  updated_at: string
}

export type LancamentoCartao = {
  id: string
  user_id: string
  cartao_id: string
  mes: number
  ano: number
  data_compra: string | null
  local: string
  parcela: string | null
  valor: number
  conferido: boolean
  created_at: string
}

export type ContaFixa = {
  id: string
  user_id: string
  mes: number
  ano: number
  categoria: string
  descricao: string
  data_vencimento: string | null
  valor: number
  pago: boolean
  parcela: string | null
  created_at: string
  updated_at: string
}

export type Entrada = {
  id: string
  user_id: string
  mes: number
  ano: number
  descricao: string
  valor: number
  categoria: string
  data_entrada?: string
  created_at: string
  updated_at: string
}

export type Combustivel = {
  id: string
  user_id: string
  mes: number
  ano: number
  data_abastecimento: string | null
  litros: number | null
  valor: number
  km: number | null
  preco_litro: number | null
  created_at: string
}

export type Meta = {
  id: string
  user_id: string
  categoria: 'cartoes' | 'fixas' | 'combustivel' | 'total'
  valor_limite: number
  mes: number
  ano: number
  notificar_em: number
  ativo: boolean
  created_at: string
  updated_at: string
}

export type Lembrete = {
  id: string
  user_id: string
  tipo: 'vencimento' | 'meta' | 'geral'
  titulo: string
  mensagem: string
  data_lembrete: string
  prioridade: 'baixa' | 'media' | 'alta'
  lido: boolean
  ativo: boolean
  created_at: string
  updated_at: string
}

export const MESES = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
]

export const NOMES_CARTOES = [
  'Hipercard',
  'Cartão Crédito Caixa',
  'Nu Bank',
  'C6 Nara',
  'Amazon Prime',
  'Tricard',
  'Mercado Pago',
  'DM Card Koch',
]

// Logos dos cartões — Locais (public/logos) e via CDN como fallback
export const LOGOS_CARTOES: Record<string, { src: string; bg: string }> = {
  'Hipercard':            { src: '/logos/Hipercard.png',      bg: '#C8102E' },
  'Cartão Crédito Caixa': { src: '/logos/Caixa.png',          bg: '#005CA9' },
  'Nu Bank':              { src: '/logos/Nubank.png',          bg: '#820AD1' },
  'C6 Nara':              { src: '/logos/C6.png',          bg: '#141414' },
  'Amazon Prime':         { src: 'https://logo.clearbit.com/amazon.com.br',          bg: '#FF9900' },
  'Tricard':              { src: '/logos/Tricard.jpg',         bg: '#E30613' },
  'Mercado Pago':         { src: '/logos/Mercado_Pago.png',     bg: '#009EE3' },
  'DM Card Koch':         { src: 'https://logo.clearbit.com/dmcard.com.br',          bg: '#E30613' },
}


export const ORDEM_CARTOES: Record<string, number> = {
  'Hipercard':            1,
  'Cartão Crédito Caixa': 2,
  'Nu Bank':              3,
  'C6 Nara':              4,
  'Amazon Prime':         5,
  'Tricard':              6,
  'Mercado Pago':         7,
  'DM Card Koch':         8,
}
