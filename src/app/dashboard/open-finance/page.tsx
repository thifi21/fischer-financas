'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useMes } from '@/context/MesContext'
import { formatBRL, formatDate } from '@/lib/utils'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { motion, AnimatePresence } from 'framer-motion'

type Lancamento = {
  id: string
  data: string
  descricao: string
  valor: number
  tipo: 'debito' | 'credito'
  categoria: string
  destino: 'nao_sincronizado' | 'cartoes' | 'contas_fixas' | 'entradas' | 'combustivel' | 'ignorado'
}

type Importacao = {
  id: string
  banco: string
  arquivo_nome: string
  total_lancamentos: number
  sincronizados: number
  status: string
  created_at: string
}

const CATEGORIAS_LABEL: Record<string, string> = {
  alimentacao: '🍽️ Alimentação',
  transporte: '🚗 Transporte',
  saude: '🏥 Saúde',
  educacao: '📚 Educação',
  lazer: '🎭 Lazer',
  moradia: '🏠 Moradia',
  vestuario: '👕 Vestuário',
  cartao: '💳 Cartão',
  salario: '💵 Salário',
  transferencia: '↔️ Transferência',
  outros: '📦 Outros',
}

export default function OpenFinancePage() {
  const supabase = createClient()
  const { mes, ano } = useMes()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [tab, setTab] = useState<'importar' | 'historico'>('importar')
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<Lancamento[] | null>(null)
  const [importacaoId, setImportacaoId] = useState<string | null>(null)
  const [banco, setBanco] = useState('')
  const [historico, setHistorico] = useState<Importacao[]>([])
  const [loadingHist, setLoadingHist] = useState(false)
  const [msg, setMsg] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null)
  const [sincronizando, setSincronizando] = useState(false)

  useEffect(() => {
    carregarHistorico()
  }, [])

  async function carregarHistorico() {
    setLoadingHist(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    
    const { data } = await supabase
      .from('importacoes_ofx')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)
    setHistorico(data || [])
    setLoadingHist(false)
  }

  async function processarArquivo(file: File) {
    setUploading(true)
    setPreview(null)
    setMsg(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token || ''

      const formData = new FormData()
      formData.append('arquivo', file)

      const res = await fetch('/api/open-finance', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      const json = await res.json()

      if (!res.ok) {
        setMsg({ tipo: 'erro', texto: json.error || 'Erro ao processar arquivo' })
      } else {
        // Inicializa destinos baseados em heurística simples no front
        const lps = json.lancamentos.map((l: any) => ({
          ...l,
          destino: l.tipo === 'credito' ? 'entradas' : (l.categoria === 'cartao' ? 'cartoes' : 'contas_fixas')
        }))
        setPreview(lps)
        setImportacaoId(json.importacaoId)
        setBanco(json.banco)
        setMsg({ tipo: 'ok', texto: `✅ ${json.total} lançamentos encontrados de ${json.banco}` })
      }
    } catch (e: any) {
      setMsg({ tipo: 'erro', texto: e.message })
    }
    setUploading(false)
  }

  function handleDestinoChange(index: number, novoDestino: any) {
    if (!preview) return
    const novoPreview = [...preview]
    novoPreview[index].destino = novoDestino
    setPreview(novoPreview)
  }

  async function sincronizarSelecionados() {
    if (!preview || !importacaoId) return
    setSincronizando(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    let sincronizadosCount = 0

    for (const l of preview) {
      if (l.destino === 'ignorado') continue

      // Inserção na tabela destino adequada
      const payload = {
        user_id: user.id,
        mes,
        ano,
        descricao: l.descricao,
        valor: l.valor,
        categoria: l.categoria,
      }

      if (l.destino === 'entradas') {
        await supabase.from('entradas').insert(payload)
      } else if (l.destino === 'cartoes') {
        await supabase.from('cartoes').insert(payload)
      } else if (l.destino === 'combustivel') {
        await supabase.from('combustivel').insert(payload)
      } else if (l.destino === 'contas_fixas') {
        await supabase.from('contas_fixas').insert({
          ...payload,
          pago: false,
          data_vencimento: l.data
        })
      }
      
      sincronizadosCount++
    }

    // Atualiza status da importação
    await supabase.from('importacoes_ofx').update({ 
      sincronizados: sincronizadosCount, 
      status: 'sincronizado' 
    }).eq('id', importacaoId)

    setMsg({ tipo: 'ok', texto: `✅ ${sincronizadosCount} lançamentos sincronizados com sucesso!` })
    setPreview(null)
    setSincronizando(false)
    carregarHistorico()
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <span className="text-3xl">🏦</span> Open Finance
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Importe seu extrato bancário e sincronize com seu orçamento em segundos.
          </p>
        </div>
        
        <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-xl">
          <button 
            onClick={() => setTab('importar')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${tab === 'importar' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-500'}`}
          >
            Importar
          </button>
          <button 
            onClick={() => setTab('historico')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${tab === 'historico' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-500'}`}
          >
            Histórico
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {tab === 'importar' ? (
          <motion.div 
            key="importar" 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {msg && (
              <Card className={`p-4 border-none shadow-lg ${msg.tipo === 'ok' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                <p className="text-sm font-bold flex items-center gap-2">
                   <span>{msg.tipo === 'ok' ? '✅' : '❌'}</span> {msg.texto}
                </p>
              </Card>
            )}

            {!preview ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if(f) processarArquivo(f) }}
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <Card 
                  className={`p-16 border-dashed border-2 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${dragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10 scale-[1.01]' : 'bg-gray-50 dark:bg-slate-900 shadow-inner'}`}
                >
                  <input ref={fileInputRef} type="file" className="hidden" accept=".ofx,.csv" onChange={(e) => { const f = e.target.files?.[0]; if(f) processarArquivo(f) }} />
                  <div className="text-6xl mb-6">📂</div>
                  <h3 className="text-xl font-bold dark:text-gray-100 mb-2">Selecione seu Extrato</h3>
                  <p className="text-sm text-gray-500 max-w-sm mb-6">
                    Arraste aqui ou clique para buscar arquivos **.OFX** ou **.CSV**. Detectamos automaticamente Bradesco, Itaú, Nubank, Santander e outros.
                  </p>
                  <Button className="bg-blue-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-blue-500/20">
                    {uploading ? 'Processando...' : 'Carregar Extrato'}
                  </Button>
                </Card>
              </div>
            ) : (
              <Card className="p-0 overflow-hidden shadow-2xl border-none">
                <div className="p-6 bg-gray-50 dark:bg-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
                  <div>
                    <h3 className="font-bold text-lg dark:text-gray-100 flex items-center gap-2">
                       <span>🏷️</span> {banco} — {preview.length} Lançamentos
                    </h3>
                    <p className="text-xs text-gray-500">Revise e escolha o destino de cada transação antes de sincronizar.</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setPreview(null)} disabled={sincronizando}>Cancelar</Button>
                    <Button onClick={sincronizarSelecionados} isLoading={sincronizando} className="bg-blue-600 text-white font-bold">
                       Sincronizar Tudo
                    </Button>
                  </div>
                </div>

                <div className="max-h-[600px] overflow-y-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-white dark:bg-slate-900 border-b dark:border-slate-800 z-10">
                      <tr className="text-[10px] uppercase font-black text-gray-400 tracking-widest">
                        <th className="px-6 py-4">Data</th>
                        <th className="px-6 py-4">Descrição</th>
                        <th className="px-6 py-4">Valor</th>
                        <th className="px-6 py-4">Destino</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-slate-800">
                      {preview.map((l, i) => (
                        <tr key={i} className="group hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-6 py-4 text-xs font-bold text-gray-500 whitespace-nowrap">{formatDate(l.data)}</td>
                          <td className="px-6 py-4">
                            <div className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate max-w-[200px]" title={l.descricao}>
                              {l.descricao}
                            </div>
                            <div className="text-[10px] text-gray-400">{CATEGORIAS_LABEL[l.categoria] || l.categoria}</div>
                          </td>
                          <td className={`px-6 py-4 text-sm font-black whitespace-nowrap ${l.tipo === 'credito' ? 'text-green-600' : 'text-red-500'}`}>
                            {l.tipo === 'credito' ? '+' : '-'} {formatBRL(l.valor)}
                          </td>
                          <td className="px-6 py-4">
                            <select 
                              value={l.destino}
                              onChange={(e) => handleDestinoChange(i, e.target.value)}
                              className="bg-white dark:bg-slate-950 border dark:border-slate-700 rounded-lg text-[10px] font-bold py-1.5 px-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                              {l.tipo === 'credito' ? (
                                <>
                                  <option value="entradas">💵 Entradas / Salários</option>
                                  <option value="ignorado">🚫 Ignorar</option>
                                </>
                              ) : (
                                <>
                                  <option value="contas_fixas">🏠 Contas Fixas</option>
                                  <option value="cartoes">💳 Cartões</option>
                                  <option value="combustivel">⛽ Combustível</option>
                                  <option value="ignorado">🚫 Ignorar</option>
                                </>
                              )}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="historico" 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {loadingHist ? (
               <div className="space-y-3">
                 {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 dark:bg-slate-800 animate-pulse rounded-2xl" />)}
               </div>
            ) : historico.length === 0 ? (
              <Card className="p-12 text-center text-gray-400 flex flex-col items-center">
                 <span className="text-4xl mb-4">⌛</span>
                 <p className="text-sm font-bold">Nenhuma importação encontrada.</p>
              </Card>
            ) : (
              historico.map((imp) => (
                <Card key={imp.id} className="p-4 flex items-center justify-between border-none shadow-md hover:shadow-xl transition-all">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xl">
                         {imp.banco.charAt(0)}
                      </div>
                      <div>
                         <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100">{imp.banco}</h4>
                         <p className="text-xs text-gray-500">{imp.arquivo_nome}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <div className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-tighter">
                         {imp.sincronizados} Sincronizados
                      </div>
                      <p className="text-[10px] text-gray-400">{formatDate(imp.created_at)}</p>
                   </div>
                </Card>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
