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

// Logos dos cartões — CDN público (Clearbit)
export const LOGOS_CARTOES: Record<string, { src: string; bg: string }> = {
  'Hipercard':            { src: 'https://logo.clearbit.com/hipercard.com.br',      bg: '#C8102E' },
  'Cartão Crédito Caixa': { src: 'https://logo.clearbit.com/caixa.gov.br',          bg: '#005CA9' },
  'Nu Bank':              { src: 'https://logo.clearbit.com/nubank.com.br',          bg: '#820AD1' },
  'C6 Nara':              { src: 'https://logo.clearbit.com/c6bank.com.br',          bg: '#141414' },
  'Amazon Prime':         { src: 'https://logo.clearbit.com/amazon.com.br',          bg: '#FF9900' },
  'Tricard':              { src: 'https://logo.clearbit.com/tricard.com.br',         bg: '#E30613' },
  'Mercado Pago':         { src: 'https://logo.clearbit.com/mercadopago.com.br',     bg: '#009EE3' },
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
