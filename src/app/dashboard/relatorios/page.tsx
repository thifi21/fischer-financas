'use client'
import { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { useMes } from '@/context/MesContext'
import { formatBRL, formatDate } from '@/lib/utils'
import { MESES, type LancamentoCartao, type ContaFixa, type Combustivel } from '@/types'
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts'



const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

type Periodo = 'mes' | 'trimestre' | 'semestre' | 'ano' | 'personalizado'

export default function RelatoriosPage() {
  const supabase = useMemo(() => createClient(), [])
  const { mes, ano } = useMes()
  
  const [loading, setLoading] = useState(true)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [periodo, setPeriodo] = useState<Periodo>('mes')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [dados, setDados] = useState<any>({
    cartoes: [],
    fixas: [],
    combustivel: [],
    lancamentosCartao: [],
    totaisPorMes: [],
    porCategoria: [],
    porCartao: []
  })
  const userIdRef = useRef<string | null>(null)

  useEffect(() => {
    async function init() {
      if (!userIdRef.current) {
        const { data: { user } } = await supabase.auth.getUser()
        userIdRef.current = user?.id ?? null
      }
      carregarDados()
    }
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (userIdRef.current) carregarDados()
  }, [mes, ano, periodo, dataInicio, dataFim])

  function calcularPeriodo() {
    const hoje = new Date()
    let inicio = new Date(ano, mes - 1, 1)
    let fim = new Date(ano, mes, 0)

    switch (periodo) {
      case 'trimestre':
        const mesInicioTri = Math.floor((mes - 1) / 3) * 3
        inicio = new Date(ano, mesInicioTri, 1)
        fim = new Date(ano, mesInicioTri + 3, 0)
        break
      case 'semestre':
        const mesInicioSem = mes <= 6 ? 0 : 6
        inicio = new Date(ano, mesInicioSem, 1)
        fim = new Date(ano, mesInicioSem + 6, 0)
        break
      case 'ano':
        inicio = new Date(ano, 0, 1)
        fim = new Date(ano, 11, 31)
        break
      case 'personalizado':
        if (dataInicio && dataFim) {
          inicio = new Date(dataInicio)
          fim = new Date(dataFim)
        }
        break
    }

    return { inicio, fim }
  }

  async function carregarDados() {
    const uid = userIdRef.current
    if (!uid) return
    setLoading(true)

    const { inicio, fim } = calcularPeriodo()
    const mesInicio = inicio.getMonth() + 1
    const mesFim = fim.getMonth() + 1
    const anoInicio = inicio.getFullYear()
    const anoFim = fim.getFullYear()

    // Buscar dados do período
    const [
      { data: cartoes },
      { data: fixas },
      { data: combustivel },
      { data: lancamentosCartao }
    ] = await Promise.all([
      supabase.from('cartoes').select('*').eq('user_id', uid)
        .gte('mes', mesInicio).lte('mes', mesFim)
        .gte('ano', anoInicio).lte('ano', anoFim),
      supabase.from('contas_fixas').select('*').eq('user_id', uid)
        .gte('mes', mesInicio).lte('mes', mesFim)
        .gte('ano', anoInicio).lte('ano', anoFim),
      supabase.from('combustivel').select('*').eq('user_id', uid)
        .gte('mes', mesInicio).lte('mes', mesFim)
        .gte('ano', anoInicio).lte('ano', anoFim),
      supabase.from('lancamentos_cartao').select('*').eq('user_id', uid)
        .gte('mes', mesInicio).lte('mes', mesFim)
        .gte('ano', anoInicio).lte('ano', anoFim)
    ])

    // Processar totais por mês
    const mesesMap = new Map()
    for (let m = mesInicio; m <= mesFim; m++) {
      const label = MESES[m - 1].substring(0, 3)
      mesesMap.set(m, { mes: label, cartoes: 0, fixas: 0, combustivel: 0 })
    }

    cartoes?.forEach(c => {
      const item = mesesMap.get(c.mes)
      if (item) item.cartoes += Number(c.valor)
    })
    fixas?.forEach(f => {
      const item = mesesMap.get(f.mes)
      if (item) item.fixas += Number(f.valor)
    })
    combustivel?.forEach(cb => {
      const item = mesesMap.get(cb.mes)
      if (item) item.combustivel += Number(cb.valor)
    })

    const totaisPorMes = Array.from(mesesMap.values())

    // Por categoria (pie chart)
    const totalCartoes = cartoes?.reduce((s, c) => s + Number(c.valor), 0) || 0
    const totalFixas = fixas?.reduce((s, f) => s + Number(f.valor), 0) || 0
    const totalCombustivel = combustivel?.reduce((s, c) => s + Number(c.valor), 0) || 0

    const porCategoria = [
      { name: 'Cartões', value: totalCartoes },
      { name: 'Contas Fixas', value: totalFixas },
      { name: 'Combustível', value: totalCombustivel }
    ].filter(d => d.value > 0)

    // Por cartão
    const porCartaoMap = new Map()
    lancamentosCartao?.forEach(l => {
      const cartao = cartoes?.find(c => c.id === l.cartao_id)
      if (cartao) {
        const nome = cartao.nome
        porCartaoMap.set(nome, (porCartaoMap.get(nome) || 0) + Number(l.valor))
      }
    })

    const porCartao = Array.from(porCartaoMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)

    setDados({
      cartoes: cartoes || [],
      fixas: fixas || [],
      combustivel: combustivel || [],
      lancamentosCartao: lancamentosCartao || [],
      totaisPorMes,
      porCategoria,
      porCartao
    })

    setLoading(false)
  }

  function exportarCSV() {
    const { totaisPorMes } = dados
    let csv = 'Mês,Cartões,Contas Fixas,Combustível,Total\n'
    
    totaisPorMes.forEach((row: any) => {
      const total = row.cartoes + row.fixas + row.combustivel
      csv += `${row.mes},${row.cartoes},${row.fixas},${row.combustivel},${total}\n`
    })

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `relatorio-${periodo}-${ano}.csv`
    a.click()
  }

  function exportarCSVDetalhado() {
    let csv = 'Tipo,Data,Descrição,Categoria,Valor\n'
    
    dados.fixas.forEach((f: any) => {
      const dataStr = f.data_vencimento ? formatDate(f.data_vencimento) : ''
      csv += `Conta Fixa,${dataStr},"${f.descricao || ''}","${f.categoria || ''}",${f.valor}\n`
    })

    dados.combustivel.forEach((c: any) => {
      const dataStr = c.data_abastecimento ? formatDate(c.data_abastecimento) : ''
      csv += `Combustível,${dataStr},"${c.descricao || 'Abastecimento'}","",${c.valor}\n`
    })

    dados.lancamentosCartao.forEach((l: any) => {
      const dataStr = l.data_compra ? formatDate(l.data_compra) : ''
      const cartao = dados.cartoes.find((c: any) => c.id === l.cartao_id)
      const nomeCartao = cartao ? cartao.nome : 'Cartão'
      csv += `${nomeCartao},${dataStr},"${l.local || ''}","",${l.valor}\n`
    })

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `relatorio-detalhado-${periodo}-${ano}.csv`
    a.click()
  }

  function exportarJSON() {
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `relatorio-${periodo}-${ano}.json`
    a.click()
  }

  async function exportarPDF() {
    setPdfLoading(true)
    try {
      const { default: jsPDF } = await import('jspdf')
      const { default: html2canvas } = await import('html2canvas')

      const elemento = document.getElementById('relatorio-print')
      if (!elemento) throw new Error('Elemento relatorio-print não encontrado')

      const canvas = await html2canvas(elemento, {
        scale: 1.5,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()

      // Capa
      pdf.setFillColor(37, 99, 235)
      pdf.rect(0, 0, pageWidth, 45, 'F')
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(20)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Fischer Finanças 2026', pageWidth / 2, 20, { align: 'center' })
      pdf.setFontSize(11)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`Relatório ${periodo === 'mes' ? MESES[mes - 1] : periodo} — ${ano}`, pageWidth / 2, 32, { align: 'center' })
      pdf.setFontSize(9)
      pdf.text(`Gerado em ${new Date().toLocaleString('pt-BR')}`, pageWidth / 2, 40, { align: 'center' })

      // Conteúdo do relatório
      const imgWidth = pageWidth - 20
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let yPosition = 50
      let remainingHeight = imgHeight
      let sourceY = 0

      while (remainingHeight > 0) {
        const availableHeight = pageHeight - yPosition - 10
        const sliceHeight = Math.min(remainingHeight, availableHeight)
        const sliceCanvas = document.createElement('canvas')
        sliceCanvas.width = canvas.width
        sliceCanvas.height = (sliceHeight / imgWidth) * canvas.width
        const ctx = sliceCanvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(canvas, 0, sourceY * (canvas.width / imgWidth), canvas.width, sliceCanvas.height, 0, 0, sliceCanvas.width, sliceCanvas.height)
          const sliceData = sliceCanvas.toDataURL('image/png')
          pdf.addImage(sliceData, 'PNG', 10, yPosition, imgWidth, sliceHeight)
        }
        remainingHeight -= sliceHeight
        sourceY += sliceHeight
        if (remainingHeight > 0) {
          pdf.addPage()
          yPosition = 10
        }
      }

      // Rodapé na última página
      const totalPages = pdf.getNumberOfPages()
      for (let p = 1; p <= totalPages; p++) {
        pdf.setPage(p)
        pdf.setFontSize(8)
        pdf.setTextColor(150, 150, 150)
        pdf.text(`Fischer Finanças 2026 — Página ${p} de ${totalPages}`, pageWidth / 2, pageHeight - 5, { align: 'center' })
      }

      pdf.save(`relatorio-${periodo}-${MESES[mes - 1]}-${ano}.pdf`)
    } catch (e) {
      console.error('Erro ao gerar PDF:', e)
      alert('Erro ao gerar PDF. Tente novamente.')
    } finally {
      setPdfLoading(false)
    }
  }


  const totalGeral = dados.porCategoria.reduce((s: number, d: any) => s + d.value, 0)

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse card h-32" />
        <div className="grid grid-cols-2 gap-4">
          <div className="animate-pulse card h-64" />
          <div className="animate-pulse card h-64" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6" id="relatorio-print">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">📊 Relatórios</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{MESES[mes - 1]} {ano}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportarPDF}
            disabled={pdfLoading}
            className="btn-secondary flex items-center gap-2"
          >
            {pdfLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                Gerando PDF...
              </>
            ) : (
              '📄 Exportar PDF'
            )}
          </button>
          <button onClick={exportarCSV} className="btn-secondary">
            📊 CSV Resumo
          </button>
          <button onClick={exportarCSVDetalhado} className="btn-secondary">
            📄 CSV Detalhado
          </button>
          <button onClick={exportarJSON} className="btn-secondary">
            📋 Exportar JSON
          </button>
        </div>
      </div>

      {/* Filtros de Período */}
      <div className="card">
        <h3 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">⏱️ Período do Relatório</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {(['mes', 'trimestre', 'semestre', 'ano', 'personalizado'] as Periodo[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriodo(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                periodo === p
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {p === 'mes' ? 'Mês Atual' : 
               p === 'trimestre' ? 'Trimestre' : 
               p === 'semestre' ? 'Semestre' : 
               p === 'ano' ? 'Ano Completo' : 
               'Personalizado'}
            </button>
          ))}
        </div>

        {periodo === 'personalizado' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Data Início</label>
              <input
                type="date"
                className="input"
                value={dataInicio}
                onChange={e => setDataInicio(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Data Fim</label>
              <input
                type="date"
                className="input"
                value={dataFim}
                onChange={e => setDataFim(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Card de Resumo */}
      <div className="card bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
        <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">💰 Resumo do Período</h2>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Cartões</p>
            <p className="text-2xl font-bold text-blue-600">{formatBRL(dados.porCategoria.find((d: any) => d.name === 'Cartões')?.value || 0)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Contas Fixas</p>
            <p className="text-2xl font-bold text-green-600">{formatBRL(dados.porCategoria.find((d: any) => d.name === 'Contas Fixas')?.value || 0)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Combustível</p>
            <p className="text-2xl font-bold text-yellow-600">{formatBRL(dados.porCategoria.find((d: any) => d.name === 'Combustível')?.value || 0)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Geral</p>
            <p className="text-2xl font-bold text-purple-600">{formatBRL(totalGeral)}</p>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolução Mensal */}
        <div className="card">
          <h3 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">📈 Evolução por Mês</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dados.totaisPorMes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip formatter={(value: any) => formatBRL(value)} />
              <Legend />
              <Bar dataKey="cartoes" fill="#3b82f6" name="Cartões" />
              <Bar dataKey="fixas" fill="#10b981" name="Contas Fixas" />
              <Bar dataKey="combustivel" fill="#f59e0b" name="Combustível" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Distribuição por Categoria */}
        <div className="card">
          <h3 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">🥧 Distribuição por Categoria</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dados.porCategoria}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry: any) => `${entry.name}: ${((entry.value / totalGeral) * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {dados.porCategoria.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => formatBRL(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Ranking de Cartões */}
        {dados.porCartao.length > 0 && (
          <div className="card lg:col-span-2">
            <h3 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">💳 Gastos por Cartão</h3>
            <div className="space-y-3">
              {dados.porCartao.map((item: any, index: number) => {
                const percentual = (item.value / totalGeral) * 100
                return (
                  <div key={item.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 dark:text-gray-300">{item.name}</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{formatBRL(item.value)}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{ 
                          width: `${percentual}%`,
                          backgroundColor: COLORS[index % COLORS.length]
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Projeção dos próximos 3 meses */}
      {dados.totaisPorMes.length >= 2 && (
        <div className="card">
          <h3 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">🔮 Projeção dos Próximos 3 Meses</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Estimativa baseada na média dos últimos meses com crescimento de +2%/mês (inflação estimada)
          </p>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(offset => {
              const base = dados.totaisPorMes.slice(-3)
              const mediaCartoes = base.reduce((s: number, m: any) => s + m.cartoes, 0) / base.length
              const mediaFixas   = base.reduce((s: number, m: any) => s + m.fixas, 0) / base.length
              const mediaComb    = base.reduce((s: number, m: any) => s + m.combustivel, 0) / base.length
              const fator = Math.pow(1.02, offset)
              const proj = (mediaCartoes + mediaFixas + mediaComb) * fator
              const d = new Date(ano, mes - 1 + offset, 1)
              const nomeMes = MESES[d.getMonth()]
              return (
                <div key={offset} className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-4 text-center border border-purple-100 dark:border-purple-900">
                  <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold uppercase mb-1">{nomeMes}</p>
                  <p className="text-xl font-bold text-purple-700 dark:text-purple-300">{formatBRL(proj)}</p>
                  <p className="text-xs text-gray-500 mt-1">+{(offset * 2).toFixed(0)}% estimado</p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
