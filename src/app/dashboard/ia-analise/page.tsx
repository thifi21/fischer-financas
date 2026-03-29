'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useMes } from '@/context/MesContext'
import { parseOFX, parseCSV, detectarBanco, LancamentoOFX } from '@/lib/ofx-parser'
import { formatBRL } from '@/lib/utils'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default function IAAnalisePage() {
  const [lancamentos, setLancamentos] = useState<LancamentoOFX[]>([])
  const [banco, setBanco] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const { mes, ano } = useMes()

  // Handler de leitura do extrato
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    
    setBanco(detectarBanco(text, file.name))
    
    if (file.name.toLowerCase().endsWith('.ofx')) {
      setLancamentos(parseOFX(text))
    } else {
      setLancamentos(parseCSV(text))
    }
  }

  // Função para salvar batch no Supabase
  const salvarNoSupabase = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    
    // Tratamos débitos como despesas em Cartões (por conveniência inicial de extrato)
    const cartoes = lancamentos.filter(l => l.tipo === 'debito').map(l => ({
      user_id: user.id,
      descricao: l.descricao,
      valor: l.valor,
      categoria: l.categoria,
      mes: mes,
      ano: ano
    }))

    // Créditos entram em Entradas
    const entradas = lancamentos.filter(l => l.tipo === 'credito').map(l => ({
      user_id: user.id,
      descricao: l.descricao,
      valor: l.valor,
      categoria: l.categoria,
      mes: mes,
      ano: ano
    }))
    
    if (cartoes.length > 0) {
      await supabase.from('cartoes').insert(cartoes)
    }
    if (entradas.length > 0) {
      await supabase.from('entradas').insert(entradas)
    }

    setLancamentos([])
    setLoading(false)
    alert(`Importação concluída! ${cartoes.length + entradas.length} registros inseridos no Supabase em ${mes}/${ano}.`)
  }

  const limpar = () => {
    if (window.confirm('Limpar e cancelar importação atual?')) {
      setLancamentos([])
      setBanco('')
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">🤖 Extratos & IA Financeira</h1>
        <p className="text-gray-500 text-sm mt-1">Carregue arquivos .OFX ou .CSV de seu banco. O sistema detectará as palavras chave e fará as categorizações de forma automática graças à IA interna e regras de heurística.</p>
      </div>
      
      {!lancamentos.length ? (
        <Card className="flex flex-col items-center justify-center p-16 border-dashed border-2 bg-gray-50 dark:bg-gray-950">
          <div className="text-5xl mb-4">📂</div>
          <p className="font-semibold text-lg dark:text-gray-200">Arraste seu documento aqui</p>
          <p className="text-gray-500 mb-6 font-medium text-sm text-center">Extratos .OFX da Nubank, Itaú, Bradesco, Santander ou planilhas CSV genéricas.</p>
          
          <label className="cursor-pointer">
            <span className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-2.5 rounded-lg font-medium shadow-sm transition-colors block">
              Procurar Arquivo
            </span>
            <input 
              type="file" 
              accept=".ofx,.csv"
              onChange={handleFileUpload} 
              className="hidden" 
            />
          </label>
        </Card>
      ) : (
        <Card>
          <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 border-b dark:border-gray-800 pb-4">
            <div>
              <h2 className="font-bold text-lg dark:text-gray-100">Lançamentos Identificados</h2>
              <p className="text-sm text-blue-600 font-medium">{banco} — {lancamentos.length} transações detectadas</p>
            </div>
            <div className="flex gap-2 mt-4 md:mt-0">
              <Button variant="outline" onClick={limpar} disabled={loading}>Cancelar</Button>
              <Button onClick={salvarNoSupabase} isLoading={loading}>
                💾 Salvar Importação
              </Button>
            </div>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
            {lancamentos.map((l, i) => (
              <div key={i} className="flex flex-col sm:flex-row justify-between sm:items-center p-3.5 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                <div className="mb-2 sm:mb-0">
                  <div className="font-medium text-sm dark:text-gray-200 uppercase">{l.descricao}</div>
                  <div className="flex gap-2 text-xs mt-1.5 font-medium items-center">
                    <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded">{l.data.split('-').reverse().join('/')}</span>
                    <span className={`px-2 py-0.5 rounded-full capitalize ${
                      l.categoria === 'outros' ? 'bg-gray-200 dark:bg-gray-700 text-gray-500' : 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                    }`}>
                      {l.categoria}
                    </span>
                  </div>
                </div>
                <div className={`font-bold text-base whitespace-nowrap ${l.tipo === 'credito' ? 'text-green-600' : 'text-red-500'}`}>
                  {l.tipo === 'credito' ? '+ ' : '- '}{formatBRL(l.valor)}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
