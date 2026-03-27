// OFX Parser — Fischer Finanças
// Faz parse de arquivos OFX (Open Financial Exchange) e CSV bancários

export interface LancamentoOFX {
  id: string
  data: string       // YYYY-MM-DD
  descricao: string
  valor: number
  tipo: 'debito' | 'credito'
  categoria: string
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

    lancamentos.push({
      id: fitid,
      data: parseDate(dtposted),
      descricao: memo,
      valor,
      tipo,
      categoria: categorizarDescricao(memo),
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

    lancamentos.push({
      id: `csv_${i}_${Date.now()}`,
      data: dataISO,
      descricao,
      valor,
      tipo,
      categoria: categorizarDescricao(descricao),
    })
  }

  return lancamentos
}

export function detectarBanco(content: string, nomeArquivo: string): string {
  const c = (content + nomeArquivo).toLowerCase()
  if (c.includes('bradesco'))   return 'Bradesco'
  if (c.includes('itau'))       return 'Itaú'
  if (c.includes('santander'))  return 'Santander'
  if (c.includes('nubank') || c.includes('nu bank')) return 'Nubank'
  if (c.includes('inter'))      return 'Banco Inter'
  if (c.includes('caixa'))      return 'Caixa Econômica'
  if (c.includes('bb') || c.includes('banco do brasil')) return 'Banco do Brasil'
  if (c.includes('sicoob'))     return 'Sicoob'
  if (c.includes('c6'))         return 'C6 Bank'
  return 'Banco não identificado'
}
