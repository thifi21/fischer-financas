'use client'
import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useMes } from '@/context/MesContext'
import { formatBRL, formatDate } from '@/lib/utils'

type Lancamento = {
  id: string
  data: string
  descricao: string
  valor: number
  tipo: 'debito' | 'credito'
  categoria: string
  destino?: string
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

let cachedUserId: string | null = null

export default function OpenFinancePage() {
  const supabase = createClient()
  const { mes, ano } = useMes()
  const userIdRef = useRef<string | null>(cachedUserId)
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
    async function init() {
      if (!userIdRef.current) {
        const { data: { user } } = await supabase.auth.getUser()
        userIdRef.current = user?.id ?? null
        cachedUserId = user?.id ?? null
      }
      carregarHistorico()
    }
    init()
  }, [])

  async function carregarHistorico() {
    const uid = userIdRef.current
    if (!uid) return
    setLoadingHist(true)
    const { data } = await supabase
      .from('importacoes_ofx')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
      .limit(20)
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
        setPreview(json.lancamentos)
        setImportacaoId(json.importacaoId)
        setBanco(json.banco)
        setMsg({ tipo: 'ok', texto: `✅ ${json.total} lançamentos encontrados de ${json.banco}` })
      }
    } catch (e: any) {
      setMsg({ tipo: 'erro', texto: e.message })
    }
    setUploading(false)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processarArquivo(file)
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) processarArquivo(file)
  }

  async function sincronizarSelecionados() {
    if (!preview || !importacaoId) return
    setSincronizando(true)

    const uid = userIdRef.current
    if (!uid) return

    const debitos = preview.filter(l => l.tipo === 'debito')
    const creditos = preview.filter(l => l.tipo === 'credito')
    let sincronizados = 0

    // Débitos → contas_fixas
    for (const l of debitos) {
      await supabase.from('contas_fixas').insert({
        user_id: uid,
        mes,
        ano,
        categoria: l.categoria,
        descricao: l.descricao,
        valor: l.valor,
        pago: false,
        data_vencimento: l.data,
      })
      sincronizados++
    }

    // Créditos → entradas
    for (const l of creditos) {
      await supabase.from('entradas').insert({
        user_id: uid,
        mes,
        ano,
        descricao: l.descricao,
        valor: l.valor,
        categoria: l.categoria,
      })
      sincronizados++
    }

    // Atualiza status da importação
    await supabase
      .from('importacoes_ofx')
      .update({ sincronizados, status: 'sincronizado' })
      .eq('id', importacaoId)

    // Atualiza lançamentos importados
    await supabase
      .from('lancamentos_importados')
      .update({ sincronizado: true, destino: 'sincronizado' })
      .eq('importacao_id', importacaoId)

    setMsg({ tipo: 'ok', texto: `✅ ${sincronizados} lançamentos sincronizados com sucesso!` })
    setPreview(null)
    setSincronizando(false)
    carregarHistorico()
  }

  function cancelar() {
    setPreview(null)
    setImportacaoId(null)
    setBanco('')
    setMsg(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">🏦 Open Finance</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Importe extratos bancários (OFX/CSV) e sincronize automaticamente com seu orçamento
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800">
        {(['importar', 'historico'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === t
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {t === 'importar' ? '📤 Importar Extrato' : '📋 Histórico de Importações'}
          </button>
        ))}
      </div>

      {/* Mensagem */}
      {msg && (
        <div className={`rounded-xl p-4 text-sm font-medium ${
          msg.tipo === 'ok'
            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
        }`}>
          {msg.texto}
        </div>
      )}

      {/* Tab Importar */}
      {tab === 'importar' && (
        <div className="space-y-6">
          {/* Drop zone */}
          {!preview && (
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
                dragging
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 bg-white dark:bg-gray-900'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".ofx,.csv,.txt"
                className="hidden"
                onChange={onFileChange}
              />
              {uploading ? (
                <div className="space-y-3">
                  <div className="text-4xl animate-spin">⚙️</div>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">Processando arquivo...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-5xl">🏦</div>
                  <div>
                    <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                      Arraste seu extrato aqui
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                      Suporte a OFX (Open Financial Exchange) e CSV
                    </p>
                    <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                      Bradesco, Itaú, Nubank, Caixa, BB, Santander e mais
                    </p>
                  </div>
                  <button className="mt-2 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
                    Selecionar Arquivo
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Preview dos lançamentos */}
          {preview && (
            <div className="card space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-gray-900 dark:text-gray-100">
                  🗂️ Extrato: {banco} ({preview.length} lançamentos)
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={cancelar}
                    className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-red-500 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={sincronizarSelecionados}
                    disabled={sincronizando}
                    className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {sincronizando ? '⏳ Sincronizando...' : '🔄 Sincronizar Tudo'}
                  </button>
                </div>
              </div>

              {/* Resumo */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 text-center">
                  <div className="text-xs text-green-600 dark:text-green-400 font-semibold uppercase mb-1">Créditos</div>
                  <div className="text-lg font-bold text-green-700 dark:text-green-300">
                    {formatBRL(preview.filter(l => l.tipo === 'credito').reduce((s, l) => s + l.valor, 0))}
                  </div>
                  <div className="text-xs text-green-500">{preview.filter(l => l.tipo === 'credito').length} lançamentos</div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3 text-center">
                  <div className="text-xs text-red-600 dark:text-red-400 font-semibold uppercase mb-1">Débitos</div>
                  <div className="text-lg font-bold text-red-700 dark:text-red-300">
                    {formatBRL(preview.filter(l => l.tipo === 'debito').reduce((s, l) => s + l.valor, 0))}
                  </div>
                  <div className="text-xs text-red-500">{preview.filter(l => l.tipo === 'debito').length} lançamentos</div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-center">
                  <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold uppercase mb-1">Total</div>
                  <div className="text-lg font-bold text-blue-700 dark:text-blue-300">{preview.length}</div>
                  <div className="text-xs text-blue-500">lançamentos</div>
                </div>
              </div>

              {/* Lista */}
              <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Data</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Descrição</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Categoria</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {preview.map((l, i) => (
                      <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">{formatDate(l.data)}</td>
                        <td className="px-4 py-3 text-gray-900 dark:text-gray-100 max-w-xs truncate">{l.descricao}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
                            {CATEGORIAS_LABEL[l.categoria] || l.categoria}
                          </span>
                        </td>
                        <td className={`px-4 py-3 text-right font-semibold whitespace-nowrap ${
                          l.tipo === 'credito' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {l.tipo === 'credito' ? '+' : '-'}{formatBRL(l.valor)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Info */}
          {!preview && !uploading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: '🔒', titulo: 'Dados Seguros', desc: 'Processamento local — seus dados não saem do Supabase' },
                { icon: '🤖', titulo: 'Categorização IA', desc: 'Lançamentos categorizados automaticamente por palavras-chave' },
                { icon: '🔄', titulo: 'Sincronização', desc: 'Débitos vão para Contas Fixas, Créditos para Entradas' },
              ].map(item => (
                <div key={item.titulo} className="card text-center">
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-1">{item.titulo}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Histórico */}
      {tab === 'historico' && (
        <div className="card">
          <h2 className="font-bold text-gray-900 dark:text-gray-100 mb-4">📋 Histórico de Importações</h2>
          {loadingHist ? (
            <div className="space-y-2">
              {[1,2,3].map(i => <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />)}
            </div>
          ) : historico.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-3xl mb-2">📂</div>
              <p>Nenhuma importação realizada ainda</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Data</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Banco</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Arquivo</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Lançamentos</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {historico.map(imp => (
                    <tr key={imp.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{formatDate(imp.created_at)}</td>
                      <td className="px-4 py-3 text-gray-900 dark:text-gray-100 font-medium">{imp.banco}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs max-w-[200px] truncate">{imp.arquivo_nome}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-gray-700 dark:text-gray-300">{imp.sincronizados}/{imp.total_lancamentos}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                          imp.status === 'sincronizado'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            : imp.status === 'pendente'
                            ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                        }`}>
                          {imp.status === 'sincronizado' ? '✅ Sincronizado' : imp.status === 'pendente' ? '⏳ Pendente' : imp.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
