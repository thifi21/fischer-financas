import { describe, it, expect } from 'vitest'
import { parseOFX, parseCSV, detectarBanco } from './ofx-parser'

const OFX = `
<OFX><BANKMSGSRSV1><STMTTRNRS><STMTRS><BANKTRANLIST>
<STMTTRN>
<TRNTYPE>DEBIT
<DTPOSTED>20260310120000
<TRNAMT>-45.90
<FITID>abc1
<MEMO>Supermercado Central
</STMTTRN>
<STMTTRN>
<TRNTYPE>CREDIT
<DTPOSTED>20260311
<TRNAMT>3500.00
<FITID>abc2
<MEMO>Salario Empresa
</STMTTRN>
<STMTTRN>
<TRNTYPE>DEBIT
<DTPOSTED>20260312
<TRNAMT>0.00
<FITID>abc3
<MEMO>Ignorado (valor zero)
</STMTTRN>
</BANKTRANLIST></STMTRS></STMTTRNRS></BANKMSGSRSV1></OFX>
`

describe('parseOFX', () => {
  const itens = parseOFX(OFX)

  it('extrai as transações e ignora as de valor zero', () => {
    expect(itens).toHaveLength(2)
  })

  it('interpreta débito, data e valor absoluto', () => {
    expect(itens[0]).toMatchObject({
      id: 'abc1',
      data: '2026-03-10',
      valor: 45.9,
      tipo: 'debito',
      descricao: 'Supermercado Central',
    })
  })

  it('interpreta crédito', () => {
    expect(itens[1]).toMatchObject({ tipo: 'credito', valor: 3500, data: '2026-03-11' })
  })

  it('categoriza automaticamente pela descrição', () => {
    expect(itens[0].categoria).toBe('alimentacao')
    expect(itens[1].categoria).toBe('salario')
  })

  it('retorna lista vazia para conteúdo sem transações', () => {
    expect(parseOFX('conteúdo qualquer')).toEqual([])
  })
})

describe('parseCSV', () => {
  it('lê CSV com ";" e números no formato brasileiro', () => {
    const csv = ['Data;Descricao;Valor', '10/03/2026;Farmacia Popular;-1.234,50', '11/03/2026;Salario;5.000,00'].join('\n')
    const itens = parseCSV(csv)

    expect(itens).toHaveLength(2)
    expect(itens[0]).toMatchObject({ data: '2026-03-10', valor: 1234.5, tipo: 'debito', categoria: 'saude' })
    expect(itens[1]).toMatchObject({ data: '2026-03-11', valor: 5000, tipo: 'credito' })
  })

  it('usa a coluna de tipo quando existe', () => {
    const csv = ['data,descricao,valor,tipo', '2026-03-10,Deposito,100,credito'].join('\n')
    expect(parseCSV(csv)[0].tipo).toBe('credito')
  })

  it('retorna vazio quando só há cabeçalho', () => {
    expect(parseCSV('data;descricao;valor')).toEqual([])
  })

  it('ignora linhas com valor zero', () => {
    const csv = ['data;descricao;valor', '10/03/2026;Nada;0,00'].join('\n')
    expect(parseCSV(csv)).toEqual([])
  })
})

describe('detectarBanco', () => {
  it('identifica o banco pelo conteúdo ou nome do arquivo', () => {
    expect(detectarBanco('', 'extrato_nubank.ofx')).toBe('Nubank')
    expect(detectarBanco('<ORG>Bradesco</ORG>', 'x.ofx')).toBe('Bradesco')
  })

  it('devolve mensagem padrão quando não reconhece', () => {
    expect(detectarBanco('xyz', 'arquivo.ofx')).toBe('Banco não identificado')
  })
})
