/**
 * SCRIPT DE IMPORTAÇÃO DOS DADOS DA PLANILHA
 * Família Fischer — Finanças 2026
 *
 * Como usar:
 * 1. Instale as dependências: npm install
 * 2. Configure o .env.local com as chaves do Supabase
 * 3. Rode: npx ts-node scripts/importar-dados.ts
 *    OU: npx tsx scripts/importar-dados.ts
 *
 * O script pedirá o email do usuário para vincular os dados.
 */

import { createClient } from '@supabase/supabase-js'
import * as readline from 'readline'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// ============================================================
// DADOS EXTRAÍDOS DA PLANILHA
// ============================================================

const CARTOES_DATA = [
  // HIPERCARD
  { nome: 'Hipercard', mes: 1, vencimento: '10/01', valor: 632.1 },
  { nome: 'Hipercard', mes: 2, vencimento: '10/02', valor: 438.04 },
  { nome: 'Hipercard', mes: 3, vencimento: '10/03', valor: 365.05 },
  { nome: 'Hipercard', mes: 4, vencimento: '10/04', valor: 248.55 },
  { nome: 'Hipercard', mes: 5, vencimento: '10/05', valor: 248.55 },
  { nome: 'Hipercard', mes: 6, vencimento: '10/06', valor: 248.55 },
  { nome: 'Hipercard', mes: 7, vencimento: '10/07', valor: 248.59 },
  { nome: 'Hipercard', mes: 8, vencimento: '10/08', valor: 163.1 },
  // CAIXA
  { nome: 'Cartão Crédito Caixa', mes: 1, vencimento: '09/01', valor: 916.1 },
  { nome: 'Cartão Crédito Caixa', mes: 2, vencimento: '09/02', valor: 791.37 },
  { nome: 'Cartão Crédito Caixa', mes: 3, vencimento: '09/03', valor: 1016.56 },
  { nome: 'Cartão Crédito Caixa', mes: 4, vencimento: '09/04', valor: 949.22 },
  { nome: 'Cartão Crédito Caixa', mes: 5, vencimento: '09/05', valor: 426.47 },
  { nome: 'Cartão Crédito Caixa', mes: 6, vencimento: '09/06', valor: 426.47 },
  { nome: 'Cartão Crédito Caixa', mes: 7, vencimento: '09/07', valor: 426.47 },
  { nome: 'Cartão Crédito Caixa', mes: 8, vencimento: '09/08', valor: 304.62 },
  { nome: 'Cartão Crédito Caixa', mes: 9, vencimento: '09/09', valor: 575.08 },
  // NUBANK
  { nome: 'Nu Bank', mes: 1, vencimento: '12/01', valor: 833.29 },
  { nome: 'Nu Bank', mes: 2, vencimento: '14/02', valor: 1047.81 },
  { nome: 'Nu Bank', mes: 3, vencimento: '12/03', valor: 957.61 },
  { nome: 'Nu Bank', mes: 4, vencimento: '12/04', valor: 1078.92 },
  { nome: 'Nu Bank', mes: 5, vencimento: '12/05', valor: 593.17 },
  { nome: 'Nu Bank', mes: 6, vencimento: '12/06', valor: 543.18 },
  { nome: 'Nu Bank', mes: 7, vencimento: '12/07', valor: 247.42 },
  { nome: 'Nu Bank', mes: 8, vencimento: '12/08', valor: 247.42 },
  { nome: 'Nu Bank', mes: 9, vencimento: '12/09', valor: 247.42 },
  { nome: 'Nu Bank', mes: 10, vencimento: '12/10', valor: 247.42 },
  { nome: 'Nu Bank', mes: 11, vencimento: '12/11', valor: 247.42 },
  { nome: 'Nu Bank', mes: 12, vencimento: '13/12', valor: 247.42 },
  // AMAZON PRIME
  { nome: 'Amazon Prime', mes: 1, vencimento: '15/01', valor: 788.09 },
  { nome: 'Amazon Prime', mes: 2, vencimento: '15/02', valor: 940.51 },
  { nome: 'Amazon Prime', mes: 3, vencimento: '15/03', valor: 821.28 },
  { nome: 'Amazon Prime', mes: 4, vencimento: '15/04', valor: 847.52 },
  { nome: 'Amazon Prime', mes: 5, vencimento: '15/05', valor: 418.82 },
  { nome: 'Amazon Prime', mes: 6, vencimento: '15/06', valor: 418.82 },
  { nome: 'Amazon Prime', mes: 7, vencimento: '15/07', valor: 148.48 },
  { nome: 'Amazon Prime', mes: 8, vencimento: '15/08', valor: 148.48 },
  { nome: 'Amazon Prime', mes: 9, vencimento: '15/09', valor: 148.48 },
  { nome: 'Amazon Prime', mes: 10, vencimento: '15/10', valor: 148.48 },
  { nome: 'Amazon Prime', mes: 11, vencimento: '15/11', valor: 148.48 },
  { nome: 'Amazon Prime', mes: 12, vencimento: '15/12', valor: 118.18 },
  // MERCADO PAGO
  { nome: 'Mercado Pago', mes: 1, vencimento: '20/01', valor: 909.56 },
  { nome: 'Mercado Pago', mes: 2, vencimento: '20/02', valor: 857.83 },
  { nome: 'Mercado Pago', mes: 3, vencimento: '20/03', valor: 770.87 },
  { nome: 'Mercado Pago', mes: 4, vencimento: '20/04', valor: 578.9 },
  { nome: 'Mercado Pago', mes: 5, vencimento: '20/05', valor: 439.0 },
  { nome: 'Mercado Pago', mes: 6, vencimento: '20/06', valor: 439.0 },
  { nome: 'Mercado Pago', mes: 7, vencimento: '20/07', valor: 150.67 },
  { nome: 'Mercado Pago', mes: 8, vencimento: '20/08', valor: 150.67 },
  { nome: 'Mercado Pago', mes: 9, vencimento: '20/09', valor: 150.67 },
  { nome: 'Mercado Pago', mes: 10, vencimento: '20/10', valor: 126.69 },
  { nome: 'Mercado Pago', mes: 11, vencimento: '20/11', valor: 94.2 },
  { nome: 'Mercado Pago', mes: 12, vencimento: '20/12', valor: 94.2 },
  // C6 NARA
  { nome: 'C6 Nara', mes: 1, vencimento: '20/01', valor: 331.97 },
  { nome: 'C6 Nara', mes: 2, vencimento: '20/02', valor: 554.08 },
  { nome: 'C6 Nara', mes: 3, vencimento: '20/03', valor: 146.52 },
  { nome: 'C6 Nara', mes: 4, vencimento: '20/04', valor: 0 },
]

const CONTAS_FIXAS_DATA = [
  // JANEIRO
  { mes: 1, categoria: 'Contas Fixas de Casa', descricao: 'Condomínio/Água', data_vencimento: '2026-01-15', valor: 450.97, pago: true },
  { mes: 1, categoria: 'Contas Fixas de Casa', descricao: 'Energia Elétrica', data_vencimento: '2026-01-24', valor: 396.99, pago: true },
  { mes: 1, categoria: 'Contas Fixas de Casa', descricao: 'IPTU 2026', data_vencimento: '2026-01-09', valor: 35.74, pago: true, parcela: '1 de 10' },
  { mes: 1, categoria: 'Contas Fixas de Casa', descricao: 'Ambiental 2026', data_vencimento: '2026-01-11', valor: 20.49, pago: true, parcela: '1 de 12' },
  { mes: 1, categoria: 'Contas Fixas de Casa', descricao: 'Ultra (Internet)', data_vencimento: '2026-01-11', valor: 149.9, pago: true },
  { mes: 1, categoria: 'Contas Fixas de Casa', descricao: 'Claro Thiago', data_vencimento: '2026-01-20', valor: 49.62, pago: true },
  { mes: 1, categoria: 'Contas Fixas de Casa', descricao: 'Claro Nayara', data_vencimento: '2026-01-20', valor: 55.34, pago: true },
  { mes: 1, categoria: 'Escola e Faculdade', descricao: 'Escola Legado', data_vencimento: null, valor: 2475.78, pago: true, parcela: '01 de 12' },
  { mes: 1, categoria: 'Vestuário', descricao: 'Renner', data_vencimento: '2026-01-13', valor: 61.94, pago: true, parcela: '01 de 05' },
  { mes: 1, categoria: 'Dentista', descricao: 'Dentista Thiago', data_vencimento: '2026-01-01', valor: 100, pago: true },
  { mes: 1, categoria: 'Gasolina Mensal', descricao: 'Gasolina', data_vencimento: '2026-01-01', valor: 640, pago: true },
  // FEVEREIRO
  { mes: 2, categoria: 'Contas Fixas de Casa', descricao: 'Condomínio/Água', data_vencimento: '2026-02-15', valor: 530.24, pago: true },
  { mes: 2, categoria: 'Contas Fixas de Casa', descricao: 'Energia Elétrica', data_vencimento: '2026-02-24', valor: 313.55, pago: true },
  { mes: 2, categoria: 'Contas Fixas de Casa', descricao: 'IPTU 2026', data_vencimento: '2026-02-07', valor: 35.74, pago: true, parcela: '02 de 10' },
  { mes: 2, categoria: 'Contas Fixas de Casa', descricao: 'Ambiental 2026', data_vencimento: '2026-02-11', valor: 21.54, pago: true, parcela: '02 de 12' },
  { mes: 2, categoria: 'Contas Fixas de Casa', descricao: 'Atêle (Internet)', data_vencimento: '2026-02-11', valor: 149.9, pago: true },
  { mes: 2, categoria: 'Contas Fixas de Casa', descricao: 'Claro Thiago', data_vencimento: '2026-02-20', valor: 54.91, pago: true },
  { mes: 2, categoria: 'Contas Fixas de Casa', descricao: 'Claro Nayara', data_vencimento: '2026-02-20', valor: 55.28, pago: true },
  { mes: 2, categoria: 'Escola e Faculdade', descricao: 'Escola Legado', data_vencimento: null, valor: 2321, pago: true, parcela: '02 de 12' },
  { mes: 2, categoria: 'Escola e Faculdade', descricao: 'Alimentação Yan', data_vencimento: null, valor: 194, pago: true, parcela: '02 de 12' },
  { mes: 2, categoria: 'Vestuário', descricao: 'Renner', data_vencimento: '2026-02-04', valor: 95.54, pago: true, parcela: '03 de 05' },
  { mes: 2, categoria: 'Vestuário', descricao: 'Renner (2)', data_vencimento: '2026-02-13', valor: 61.92, pago: true, parcela: '03 de 05' },
  { mes: 2, categoria: 'Dentista', descricao: 'Dentista Thiago', data_vencimento: '2026-02-01', valor: 100, pago: true },
  { mes: 2, categoria: 'Gasolina Mensal', descricao: 'Gasolina', data_vencimento: '2026-02-01', valor: 660, pago: true },
  { mes: 2, categoria: 'Juros Bancários Conta', descricao: 'Juros', data_vencimento: '2026-02-01', valor: 2.6, pago: true },
  { mes: 2, categoria: 'Juros Bancários Conta', descricao: 'IOF', data_vencimento: '2026-02-01', valor: 2.77, pago: true },
  // MARÇO
  { mes: 3, categoria: 'Contas Fixas de Casa', descricao: 'Condomínio/Água', data_vencimento: '2026-03-15', valor: 687.42, pago: true },
  { mes: 3, categoria: 'Contas Fixas de Casa', descricao: 'Energia Elétrica', data_vencimento: '2026-03-24', valor: 354.63, pago: false },
  { mes: 3, categoria: 'Contas Fixas de Casa', descricao: 'IPTU 2026', data_vencimento: '2026-03-07', valor: 35.74, pago: true, parcela: '03 de 10' },
  { mes: 3, categoria: 'Contas Fixas de Casa', descricao: 'Ambiental 2026', data_vencimento: '2026-03-11', valor: 20.49, pago: true, parcela: '03 de 12' },
  { mes: 3, categoria: 'Contas Fixas de Casa', descricao: 'Atêle (Internet)', data_vencimento: '2026-03-11', valor: 149.9, pago: true },
  { mes: 3, categoria: 'Contas Fixas de Casa', descricao: 'Claro Thiago', data_vencimento: '2026-03-20', valor: 54.9, pago: false },
  { mes: 3, categoria: 'Contas Fixas de Casa', descricao: 'Claro Nayara', data_vencimento: '2026-03-20', valor: 54.9, pago: false },
  { mes: 3, categoria: 'Escola e Faculdade', descricao: 'Escola Legado', data_vencimento: null, valor: 2321, pago: true, parcela: '03 de 12' },
  { mes: 3, categoria: 'Escola e Faculdade', descricao: 'Alimentação Yan', data_vencimento: null, valor: 194, pago: true, parcela: '03 de 12' },
  { mes: 3, categoria: 'Vestuário', descricao: 'Renner', data_vencimento: '2026-03-04', valor: 91.9, pago: true, parcela: '02 de 05' },
  { mes: 3, categoria: 'Vestuário', descricao: 'Renner (2)', data_vencimento: '2026-03-13', valor: 61.94, pago: true, parcela: '02 de 05' },
  { mes: 3, categoria: 'Dentista', descricao: 'Dentista Thiago', data_vencimento: '2026-03-01', valor: 100, pago: false },
  { mes: 3, categoria: 'Gasolina Mensal', descricao: 'Gasolina', data_vencimento: '2026-03-01', valor: 650, pago: false },
  { mes: 3, categoria: 'Juros Bancários Conta', descricao: 'Juros', data_vencimento: '2026-03-01', valor: 1.37, pago: true },
  { mes: 3, categoria: 'Juros Bancários Conta', descricao: 'IOF', data_vencimento: '2026-03-01', valor: 0.43, pago: true },
  // ABRIL
  { mes: 4, categoria: 'Contas Fixas de Casa', descricao: 'Condomínio/Água', data_vencimento: '2026-04-15', valor: 544.73, pago: false },
  { mes: 4, categoria: 'Contas Fixas de Casa', descricao: 'Energia Elétrica', data_vencimento: '2026-04-24', valor: 254.26, pago: false },
  { mes: 4, categoria: 'Contas Fixas de Casa', descricao: 'IPTU 2026', data_vencimento: '2026-04-07', valor: 35.74, pago: false, parcela: '04 de 10' },
  { mes: 4, categoria: 'Contas Fixas de Casa', descricao: 'Ambiental 2026', data_vencimento: '2026-04-11', valor: 20.49, pago: false, parcela: '04 de 12' },
  { mes: 4, categoria: 'Contas Fixas de Casa', descricao: 'Atêle (Internet)', data_vencimento: '2026-04-11', valor: 149.9, pago: false },
  { mes: 4, categoria: 'Contas Fixas de Casa', descricao: 'Claro Thiago', data_vencimento: '2026-04-20', valor: 54.9, pago: false },
  { mes: 4, categoria: 'Contas Fixas de Casa', descricao: 'Claro Nayara', data_vencimento: '2026-04-20', valor: 49.9, pago: false },
  { mes: 4, categoria: 'Escola e Faculdade', descricao: 'Escola Legado', data_vencimento: null, valor: 2321, pago: false, parcela: '04 de 12' },
  { mes: 4, categoria: 'Escola e Faculdade', descricao: 'Alimentação Yan', data_vencimento: null, valor: 194, pago: false, parcela: '04 de 12' },
  { mes: 4, categoria: 'Vestuário', descricao: 'Renner', data_vencimento: '2026-04-04', valor: 92.1, pago: false, parcela: '03 de 05' },
  { mes: 4, categoria: 'Vestuário', descricao: 'Renner (2)', data_vencimento: '2026-04-13', valor: 61.94, pago: false, parcela: '03 de 05' },
  { mes: 4, categoria: 'Dentista', descricao: 'Dentista Thiago', data_vencimento: '2026-04-01', valor: 100, pago: false },
  { mes: 4, categoria: 'Gasolina Mensal', descricao: 'Gasolina', data_vencimento: '2026-04-01', valor: 650, pago: false },
  // MAIO
  { mes: 5, categoria: 'Contas Fixas de Casa', descricao: 'Condomínio/Água', data_vencimento: '2026-05-15', valor: 544.73, pago: false },
  { mes: 5, categoria: 'Contas Fixas de Casa', descricao: 'Energia Elétrica', data_vencimento: '2026-05-24', valor: 254.26, pago: false },
  { mes: 5, categoria: 'Contas Fixas de Casa', descricao: 'IPTU 2026', data_vencimento: '2026-05-07', valor: 35.74, pago: false, parcela: '05 de 10' },
  { mes: 5, categoria: 'Contas Fixas de Casa', descricao: 'Ambiental 2026', data_vencimento: '2026-05-11', valor: 20.49, pago: false, parcela: '05 de 12' },
  { mes: 5, categoria: 'Contas Fixas de Casa', descricao: 'Atêle (Internet)', data_vencimento: '2026-05-11', valor: 149.9, pago: false },
  { mes: 5, categoria: 'Contas Fixas de Casa', descricao: 'Claro Thiago', data_vencimento: '2026-05-20', valor: 54.9, pago: false },
  { mes: 5, categoria: 'Contas Fixas de Casa', descricao: 'Claro Nayara', data_vencimento: '2026-05-20', valor: 54.9, pago: false },
  { mes: 5, categoria: 'Escola e Faculdade', descricao: 'Escola Legado', data_vencimento: null, valor: 2321, pago: false, parcela: '05 de 12' },
  { mes: 5, categoria: 'Escola e Faculdade', descricao: 'Alimentação Yan', data_vencimento: null, valor: 194, pago: false, parcela: '05 de 12' },
  { mes: 5, categoria: 'Vestuário', descricao: 'Renner', data_vencimento: '2026-05-04', valor: 91.9, pago: false, parcela: '04 de 05' },
  { mes: 5, categoria: 'Vestuário', descricao: 'Renner (2)', data_vencimento: '2026-05-13', valor: 61.94, pago: false, parcela: '04 de 05' },
  { mes: 5, categoria: 'Dentista', descricao: 'Dentista Thiago', data_vencimento: '2026-05-01', valor: 100, pago: false },
  { mes: 5, categoria: 'Gasolina Mensal', descricao: 'Gasolina', data_vencimento: '2026-05-01', valor: 650, pago: false },
  // JUNHO
  { mes: 6, categoria: 'Contas Fixas de Casa', descricao: 'Condomínio/Água', data_vencimento: '2026-06-15', valor: 544.73, pago: false },
  { mes: 6, categoria: 'Contas Fixas de Casa', descricao: 'Energia Elétrica', data_vencimento: '2026-06-24', valor: 254.26, pago: false },
  { mes: 6, categoria: 'Contas Fixas de Casa', descricao: 'IPTU 2026', data_vencimento: '2026-06-07', valor: 35.74, pago: false, parcela: '06 de 10' },
  { mes: 6, categoria: 'Contas Fixas de Casa', descricao: 'Ambiental 2026', data_vencimento: '2026-06-11', valor: 20.49, pago: false, parcela: '06 de 12' },
  { mes: 6, categoria: 'Contas Fixas de Casa', descricao: 'Atêle (Internet)', data_vencimento: '2026-06-11', valor: 149.9, pago: false },
  { mes: 6, categoria: 'Contas Fixas de Casa', descricao: 'Claro Thiago', data_vencimento: '2026-06-20', valor: 54.9, pago: false },
  { mes: 6, categoria: 'Contas Fixas de Casa', descricao: 'Claro Nayara', data_vencimento: '2026-06-20', valor: 54.9, pago: false },
  { mes: 6, categoria: 'Escola e Faculdade', descricao: 'Escola Legado', data_vencimento: null, valor: 2321, pago: false, parcela: '06 de 12' },
  { mes: 6, categoria: 'Escola e Faculdade', descricao: 'Alimentação Yan', data_vencimento: null, valor: 194, pago: false, parcela: '06 de 12' },
  { mes: 6, categoria: 'Vestuário', descricao: 'Renner', data_vencimento: '2026-06-04', valor: 91.9, pago: false, parcela: '05 de 05' },
  { mes: 6, categoria: 'Vestuário', descricao: 'Renner (2)', data_vencimento: '2026-06-13', valor: 61.94, pago: false, parcela: '05 de 05' },
  { mes: 6, categoria: 'Dentista', descricao: 'Dentista Thiago', data_vencimento: '2026-06-01', valor: 100, pago: false },
  { mes: 6, categoria: 'Gasolina Mensal', descricao: 'Gasolina', data_vencimento: '2026-06-01', valor: 650, pago: false },
]

const COMBUSTIVEL_DATA = [
  { mes: 1, data_abastecimento: '2026-01-01', litros: 25.197, valor: 160, km: 230749, preco_litro: 6.35 },
  { mes: 1, data_abastecimento: '2026-01-11', litros: 25.954, valor: 170, km: 231080, preco_litro: 6.55 },
  { mes: 1, data_abastecimento: '2026-01-23', litros: null, valor: 150, km: null, preco_litro: 6.55 },
  { mes: 1, data_abastecimento: '2026-01-31', litros: 25.954, valor: 170, km: 231703, preco_litro: 6.55 },
  { mes: 2, data_abastecimento: '2026-02-06', litros: 25.954, valor: 170, km: 231952, preco_litro: 6.55 },
  { mes: 2, data_abastecimento: '2026-02-12', litros: 24.427, valor: 160, km: 232289, preco_litro: 6.55 },
  { mes: 2, data_abastecimento: '2026-02-19', litros: 24.427, valor: 160, km: 232632, preco_litro: 6.55 },
  { mes: 2, data_abastecimento: '2026-02-24', litros: 25.954, valor: 170, km: 232876, preco_litro: 6.55 },
  { mes: 3, data_abastecimento: '2026-03-03', litros: 25.169, valor: 170, km: 233169, preco_litro: 6.59 },
  { mes: 3, data_abastecimento: '2026-03-09', litros: 25.955, valor: 170, km: 233470, preco_litro: 6.55 },
  { mes: 3, data_abastecimento: '2026-03-16', litros: 22.901, valor: 150, km: 233988, preco_litro: 6.59 },
]

const ENTRADAS_DATA = [
  { mes: 3, descricao: 'Salário Thiago', categoria: 'salario', valor: 4155.67 },
  { mes: 3, descricao: 'Salário Nayara', categoria: 'salario', valor: 2403.44 },
]

// ============================================================
// FUNÇÃO DE IMPORTAÇÃO
// ============================================================

async function importar(userId: string) {
  console.log(`\n🚀 Iniciando importação para usuário: ${userId}`)
  let erros = 0

  // 1. Cartões
  console.log(`\n💳 Importando ${CARTOES_DATA.length} cartões...`)
  for (const c of CARTOES_DATA) {
    const { error } = await supabase.from('cartoes').insert({
      user_id: userId, ano: 2026, nome: c.nome, mes: c.mes,
      vencimento: c.vencimento, valor: c.valor, pago: false
    })
    if (error) { console.error(`  ❌ Cartão ${c.nome} mes ${c.mes}:`, error.message); erros++ }
  }
  console.log(`  ✅ Cartões inseridos`)

  // 2. Contas Fixas
  console.log(`\n🏠 Importando ${CONTAS_FIXAS_DATA.length} contas fixas...`)
  const chunks = []
  for (let i = 0; i < CONTAS_FIXAS_DATA.length; i += 20) {
    chunks.push(CONTAS_FIXAS_DATA.slice(i, i + 20))
  }
  for (const chunk of chunks) {
    const { error } = await supabase.from('contas_fixas').insert(
      chunk.map(c => ({ user_id: userId, ano: 2026, ...c, parcela: c.parcela || null }))
    )
    if (error) { console.error('  ❌ Lote contas fixas:', error.message); erros++ }
  }
  console.log(`  ✅ Contas fixas inseridas`)

  // 3. Combustível
  console.log(`\n⛽ Importando ${COMBUSTIVEL_DATA.length} abastecimentos...`)
  const { error: errComb } = await supabase.from('combustivel').insert(
    COMBUSTIVEL_DATA.map(c => ({ user_id: userId, ano: 2026, ...c }))
  )
  if (errComb) { console.error('  ❌ Combustível:', errComb.message); erros++ }
  else console.log(`  ✅ Combustível inserido`)

  // 4. Entradas
  console.log(`\n💵 Importando ${ENTRADAS_DATA.length} entradas...`)
  const { error: errEnt } = await supabase.from('entradas').insert(
    ENTRADAS_DATA.map(e => ({ user_id: userId, ano: 2026, ...e }))
  )
  if (errEnt) { console.error('  ❌ Entradas:', errEnt.message); erros++ }
  else console.log(`  ✅ Entradas inseridas`)

  console.log(`\n${ erros === 0 ? '🎉 Importação concluída com sucesso!' : `⚠️ Concluído com ${erros} erro(s).` }`)
  console.log('Acesse o site e selecione os meses para ver os dados importados.')
}

async function main() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  rl.question('\n📧 Digite o email do usuário cadastrado no Supabase: ', async (email) => {
    rl.question('🔑 Digite a senha: ', async (senha) => {
      rl.close()
      console.log('\n🔐 Autenticando...')
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha })
      if (error || !data.user) {
        console.error('❌ Erro de autenticação:', error?.message)
        process.exit(1)
      }
      await importar(data.user.id)
      process.exit(0)
    })
  })
}

main()
