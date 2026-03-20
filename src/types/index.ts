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

export type ResumoMes = {
  mes: number
  ano: number
  total_entradas: number
  total_cartoes: number
  total_fixas: number
  total_combustivel: number
  total_saidas: number
  saldo: number
}

export const MESES = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
]

export const CATEGORIAS_FIXAS = [
  'Condomínio/Água', 'Energia Elétrica', 'IPTU', 'Ambiental',
  'Internet/TV', 'Celular Thiago', 'Celular Nayara',
  'Escola e Faculdade', 'Alimentação Escolar', 'Material Escolar',
  'Vestuário', 'Dentista', 'Academia', 'Previdência Yan',
  'Juros Bancários', 'Outros'
]

export const NOMES_CARTOES = [
  'Hipercard', 'Cartão Crédito Caixa', 'Nu Bank',
  'C6 Nara', 'Amazon Prime', 'Tricard', 'Mercado Pago', 'DM Card Koch'
]
