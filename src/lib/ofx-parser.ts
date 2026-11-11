// OFX Parser — Fischer Finanças
// Faz parse de arquivos OFX (Open Financial Exchange) e CSV bancários

export interface LancamentoOFX {
  id: string
  data: string       // YYYY-MM-DD
  descricao: string
  valor: number
  tipo: 'debito' | 'credito'
  categoria: string
  parcela?: string | null // ex: "02/10" quando extraído de fatura de cartão
}

// Extrai parcela no formato "01/12" a partir de uma descrição (ex: "MERCADO LIVRE 2/10", "LOJA PARC 03/06")
export function extrairParcelaDaDescricao(raw: string): { descricaoLimpa: string; parcela: string | null } {
  const m = raw.match(/(?:\bparc(?:ela)?\.?\s*|\b)(\d{1,2})\s*(?:\/|de)\s*(\d{1,2})\b/i)
  if (!m) return { descricaoLimpa: raw.trim(), parcela: null }
  const atual = Number(m[1])
  const total = Number(m[2])
  // Evita confundir datas curtas como 10/11 se total > 36 ou atual > total ou total < 2
  if (isNaN(atual) || isNaN(total) || atual < 1 || total < 2 || atual > total || total > 36) {
    return { descricaoLimpa: raw.trim(), parcela: null }
  }
  const parcela = `${String(atual).padStart(2, '0')}/${String(total).padStart(2, '0')}`
  const limpa = raw.replace(m[0], '').replace(/\s{2,}/g, ' ').replace(/[-–—]\s*$/, '').trim()
  return { descricaoLimpa: limpa || raw.trim(), parcela }
}

// Mapa de palavras-chave para categorização automática (PT-BR)
const CATEGORIAS_KEYWORDS: Record<string, string[]> = {
  alimentacao:   ['mercado', 'supermercado', 'padaria', 'restaurante', 'lanche', 'pizza', 'ifood', 'rappi', 'deliveroo', 'burger', 'mcdonald', 'subway', 'hortifruti', 'acougue', 'sushi'],
  transporte:    ['uber', '99', 'taxi', 'estacionamento', 'pedagio', 'combustivel', 'gasolina', 'etanol', 'diesel', 'posto', 'shell', 'petrobras', 'ipiranga', 'br distribuidora'],
  saude:         ['farmacia', 'drogaria', 'clinica', 'hospital', 'consulta', 'medico', 'dentista', 'laboratorio', 'exame', 'plano de saude', 'unimed', 'sulamerica', 'hapvida'],
  educacao:      ['escola', 'faculdade', 'universidade', 'curso', 'livros', 'livraria', 'mensalidade', 'material escolar'],
  lazer:         ['cinema', 'teatro', 'show', 'netflix', 'spotify', 'amazon prime', 'disney', 'steam', 'shopping', 'parque'],
  moradia:       ['aluguel', 'condominio', 'energia', 'agua', 'gas', 'internet', 'celular', 'telefone', 'tv a cabo', 'sky', 'claro', 'tim', 'vivo', 'oi'],
  vestuario:     ['roupa', 'calcado', 'tenis', 'camisa', 'calcas', 'moda', 'renner', 'riachuelo', 'c&a', 'zara', 'hering'],
  cartao:        ['pagamento cartao', 'fatura', 'mastercard', 'visa', 'amex', 'hipercard', 'elo'],
  salario:       ['salario', 'vencimento', 'remuneracao', 'pagamento', 'pro-labore', 'honorarios'],
  transferencia: ['transferencia', 'ted', 'pix', 'doc', 'deposito'],
}

function categorizarDescricao(descricao: string): string {
  const lower = descricao.toLowerCase()
  for (const [categoria, palavras] of Object.entries(CATEGORIAS_KEYWORDS)) {
    if (palavras.some(p => lower.includes(p))) return categoria
  }
  return 'outros'
}

// ── Parser OFX ────────────────────────────────────────────────
function parseDate(ofxDate: string): string {
  // OFX date: YYYYMMDD ou YYYYMMDDHHMMSS
  const clean = ofxDate.substring(0, 8)
  if (clean.length === 8) {
    return `${clean.slice(0, 4)}-${clean.slice(4, 6)}-${clean.slice(6, 8)}`
  }
  return new Date().toISOString().split('T')[0]
}

export function parseOFX(content: string): LancamentoOFX[] {
  const lancamentos: LancamentoOFX[] = []
  // Busca todos os blocos <STMTTRN>
  const transRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi
  let match: RegExpExecArray | null

  while ((match = transRegex.exec(content)) !== null) {
    const bloco = match[1]

    const getTag = (tag: string) => {
      const m = bloco.match(new RegExp(`<${tag}>([^<\r\n]+)`, 'i'))
      return m ? m[1].trim() : ''
    }

    const trntype = getTag('TRNTYPE')
    const dtposted = getTag('DTPOSTED')
    const trnamt = getTag('TRNAMT')
    const memo = getTag('MEMO') || getTag('NAME') || 'Sem descrição'
    const fitid = getTag('FITID') || String(Math.random())

    const valor = Math.abs(parseFloat(trnamt.replace(',', '.')) || 0)
    const tipo: 'debito' | 'credito' =
      trntype === 'CREDIT' || parseFloat(trnamt) > 0 ? 'credito' : 'debito'

    if (valor === 0) continue

    const { descricaoLimpa, parcela } = extrairParcelaDaDescricao(memo)

    lancamentos.push({
      id: fitid,
      data: parseDate(dtposted),
      descricao: descricaoLimpa,
      valor,
      tipo,
      categoria: categorizarDescricao(descricaoLimpa),
      parcela,
    })
  }

  return lancamentos
}

// ── Parser CSV ────────────────────────────────────────────────
export function parseCSV(content: string): LancamentoOFX[] {
  const linhas = content.split(/\r?\n/).filter(l => l.trim())
  if (linhas.length < 2) return []

  // Detectar separador
  const sep = linhas[0].includes(';') ? ';' : ','

  // Detectar colunas pelo cabeçalho
  const headers = linhas[0].split(sep).map(h => h.trim().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, ''))

  const findCol = (...names: string[]) => {
    for (const name of names) {
      const idx = headers.findIndex(h => h.includes(name))
      if (idx >= 0) return idx
    }
    return -1
  }

  const colData  = findCol('data', 'date', 'dt lancamento', 'data lancamento')
  const colDesc  = findCol('descricao', 'historico', 'memo', 'description', 'estabelecimento', 'titulo')
  const colValor = findCol('valor', 'value', 'amount', 'debito', 'credito', 'montante')
  const colTipo  = findCol('tipo', 'type', 'natureza', 'modalidade')

  const lancamentos: LancamentoOFX[] = []

  for (let i = 1; i < linhas.length; i++) {
    const cols = linhas[i].split(sep).map(c => c.trim().replace(/^"|"$/g, ''))
    if (cols.length < 2) continue

    // Data
    let dataStr = colData >= 0 ? cols[colData] : ''
    let dataISO = ''
    if (dataStr) {
      // Tentar DD/MM/YYYY ou YYYY-MM-DD
      if (/\d{2}\/\d{2}\/\d{4}/.test(dataStr)) {
        const [d, m, y] = dataStr.split('/')
        dataISO = `${y}-${m}-${d}`
      } else if (/\d{4}-\d{2}-\d{2}/.test(dataStr)) {
        dataISO = dataStr.slice(0, 10)
      } else {
        dataISO = new Date().toISOString().split('T')[0]
      }
    } else {
      dataISO = new Date().toISOString().split('T')[0]
    }

    // Descrição
    const descricao = colDesc >= 0 ? cols[colDesc] : cols[1] || 'Lançamento importado'

    // Valor
    const valorRaw = colValor >= 0 ? cols[colValor] : cols[cols.length - 1]
    const valor = Math.abs(parseFloat(valorRaw?.replace(/\./g, '').replace(',', '.') || '0'))
    if (valor === 0) continue

    // Tipo
    let tipo: 'debito' | 'credito' = 'debito'
    if (colTipo >= 0) {
      const t = cols[colTipo].toLowerCase()
      tipo = t.includes('cred') || t.includes('entrada') || t.includes('dep') ? 'credito' : 'debito'
    } else if (colValor >= 0) {
      const valorOriginal = parseFloat(cols[colValor]?.replace(/\./g, '').replace(',', '.') || '0')
      tipo = valorOriginal > 0 ? 'credito' : 'debito'
    }

    const { descricaoLimpa, parcela } = extrairParcelaDaDescricao(descricao)

    lancamentos.push({
      id: `csv_${i}_${Date.now()}`,
      data: dataISO,
      descricao: descricaoLimpa,
      valor,
      tipo,
      categoria: categorizarDescricao(descricaoLimpa),
      parcela,
    })
  }

  return lancamentos
}

// ── Parser PDF (texto já extraído) ────────────────────────────
export function parsePDFText(texto: string): LancamentoOFX[] {
  const linhas = texto.split(/\r?\n/).map(l => l.replace(/\s+/g, ' ').trim()).filter(Boolean)
  const anoAtual = new Date().getFullYear()
  const lancamentos: LancamentoOFX[] = []
  // data (DD/MM[/AAAA]) no início, valor monetário brasileiro (com sinal, R$, C/D) no fim
  const re = /^(\d{2})\/(\d{2})(?:\/(\d{2,4}))?\s+(.+?)\s+(-?\s?(?:R\$\s?)?-?\d{1,3}(?:\.\d{3})*,\d{2})\s*([CD])?(?:\s+-?\d{1,3}(?:\.\d{3})*,\d{2}\s*[CD]?)?$/i

  linhas.forEach((linha, i) => {
    const m = linha.match(re)
    if (!m) return
    const [, dd, mm, aa, descRaw, valRaw, cd] = m
    const ano = !aa ? anoAtual : aa.length === 2 ? 2000 + Number(aa) : Number(aa)
    const numero = parseFloat(valRaw.replace(/[R$\s.]/g, '').replace(',', '.'))
    const valor = Math.abs(numero)
    if (!valor || Number(mm) > 12 || Number(dd) > 31) return
    const descricaoBruta = descRaw.trim()
    if (/saldo|total da fatura|pagamento minimo|limite/i.test(descricaoBruta)) return
    const { descricaoLimpa, parcela } = extrairParcelaDaDescricao(descricaoBruta)
    const tipo: 'debito' | 'credito' = cd
      ? (cd.toUpperCase() === 'C' ? 'credito' : 'debito')
      : (numero > 0 && !/^-/.test(valRaw.trim()) && /receb|cr[eé]dit|dep[oó]sito|sal[aá]rio|estorno/i.test(descricaoBruta) ? 'credito' : numero < 0 ? 'debito' : 'debito')
    lancamentos.push({
      id: `pdf_${i}_${Date.now()}`,
      data: `${ano}-${mm}-${dd}`,
      descricao: descricaoLimpa,
      valor,
      tipo,
      categoria: categorizarDescricao(descricaoLimpa),
      parcela,
    })
  })
  return lancamentos
}

export function detectarBanco(content: string, nomeArquivo: string): string {
  const c = (content + ' ' + nomeArquivo).toLowerCase()
  if (c.includes('hipercard'))     return 'Hipercard'
  if (c.includes('tricard'))       return 'Tricard'
  if (c.includes('dmcard') || c.includes('dm card') || c.includes('koch')) return 'DM Card Koch'
  if (c.includes('havan'))         return 'Havan'
  if (c.includes('pernambucanas')) return 'Pernambucanas'
  if (c.includes('mercado pago') || c.includes('mercadopago')) return 'Mercado Pago'
  if (c.includes('amazon'))        return 'Amazon Prime'
  if (c.includes('bradesco'))      return 'Bradesco'
  if (c.includes('itau') || c.includes('itaú')) return 'Itaú'
  if (c.includes('santander'))     return 'Santander'
  if (c.includes('nubank') || c.includes('nu pagamentos')) return 'Nubank'
  if (c.includes('nu bank'))       return 'Nu Bank'
  if (c.includes('inter'))         return 'Banco Inter'
  if (c.includes('caixa'))         return 'Caixa Econômica'
  if (c.includes('bb') || c.includes('banco do brasil')) return 'Banco do Brasil'
  if (c.includes('sicoob'))        return 'Sicoob'
  if (c.includes('c6'))            return 'C6 Bank'
  return 'Banco não identificado'
}
