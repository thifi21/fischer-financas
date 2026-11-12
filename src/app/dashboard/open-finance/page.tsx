'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useMes } from '@/context/MesContext'
import { formatBRL, formatDate } from '@/lib/utils'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { motion, AnimatePresence } from 'framer-motion'
import { authFetch } from '@/lib/auth-fetch'
import { MESES } from '@/types'

type DestinoLancamento =
  | 'nao_sincronizado'
  | 'apenas_extrato'
  | 'cartoes'
  | 'contas_fixas'
  | 'entradas'
  | 'combustivel'
  | 'quitar_conta'
  | 'quitar_cartao'
  | 'ignorado'

type Lancamento = {
  id: string
  data: string
  descricao: string
  valor: number
  tipo: 'debito' | 'credito'
  categoria: string
  parcela?: string | null
  destino: DestinoLancamento
  cartaoId?: string
  contaId?: string
  sugestaoMotivo?: string
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

type ContaMes = {
  id: string
  descricao: string
  categoria: string
  valor: number
  pago: boolean
}

type CartaoMes = {
  id: string
  nome: string
  valor: number
  pago: boolean
}

type LancamentoCartaoExistente = {
  id: string
  cartao_id: string
  local: string
  valor: number
  data_compra: string | null
  parcela: string | null
}

type PluggyAccount = {
  id: string
  name: string
  type: string
  subtype: string
  number: string
  balance: number
  institution: string
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
  salario: '💵 Salário (OBR / Implatec)',
  extrato_entrada: '📄 Crédito no Extrato',
  extrato_saida: '📄 Débito no Extrato',
  transferencia: '↔️ Transferência',
  outros: '📦 Outros',
}

function normalizarTexto(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function mesmaDescricao(a: string, b: string): boolean {
  const na = normalizarTexto(a)
  const nb = normalizarTexto(b)
  if (!na || !nb) return false
  if (na === nb || na.includes(nb) || nb.includes(na)) return true
  const tokensA = na.split(' ').filter(t => t.length >= 4)
  const tokensB = nb.split(' ').filter(t => t.length >= 4)
  if (tokensA.length === 0 || tokensB.length === 0) return false
  return tokensA.some(t => tokensB.includes(t))
}

function encontrarDuplicadoNoCartao(
  l: { data?: string; descricao: string; valor: number; parcela?: string | null },
  cartaoId: string | undefined,
  existentes: LancamentoCartaoExistente[]
): LancamentoCartaoExistente | undefined {
  return existentes.find(ex => {
    if (cartaoId && ex.cartao_id !== cartaoId) return false
    const mesmoValor = Math.abs(Number(ex.valor) - Math.abs(Number(l.valor))) <= 0.05
    if (!mesmoValor) return false
    const mesmaData = ex.data_compra && l.data && ex.data_compra.slice(0, 10) === l.data.slice(0, 10)
    const mesmaParc = l.parcela && ex.parcela && ex.parcela.trim() === l.parcela.trim()
    return mesmaDescricao(ex.local, l.descricao) || Boolean(mesmaData && mesmaDescricao(ex.local, l.descricao)) || Boolean(mesmaParc && mesmaDescricao(ex.local, l.descricao))
  })
}

// Sugere automaticamente o destino cruzando com contas fixas, cartões e lançamentos já existentes no mês
function sugerirDestinoInteligente(
  l: { data?: string; descricao: string; valor: number; tipo: 'debito' | 'credito'; categoria: string; parcela?: string | null },
  bancoDetectado: string,
  modoImportacao: 'extrato' | 'fatura_cartao',
  cartaoFaturaId: string,
  contasMes: ContaMes[],
  cartoesMes: CartaoMes[],
  lancsCartaoMes: LancamentoCartaoExistente[]
): { destino: DestinoLancamento; cartaoId?: string; contaId?: string; sugestaoMotivo?: string } {
  // 1) Se o usuário escolheu "Fatura de Cartão", verifica primeiro se a compra JÁ EXISTE no cartão
  if (modoImportacao === 'fatura_cartao') {
    if (l.tipo === 'credito') {
      return { destino: 'ignorado', sugestaoMotivo: 'Pagamento/estorno da fatura' }
    }
    const dup = encontrarDuplicadoNoCartao(l, cartaoFaturaId || undefined, lancsCartaoMes)
    if (dup) {
      return {
        destino: 'ignorado',
        cartaoId: dup.cartao_id,
        sugestaoMotivo: `Já lançado no cartão ("${dup.local}") — não será alterado`,
      }
    }
    return {
      destino: 'cartoes',
      cartaoId: cartaoFaturaId || undefined,
      sugestaoMotivo: l.parcela ? `Nova compra · Parcela ${l.parcela}` : 'Nova compra da fatura',
    }
  }

  // 2) Modo Extrato de Conta Corrente (ex: Caixa Econômica)
  // Alimenta apenas a aba Salários (somente OBR e Implatec) e o Extrato da Conta,
  // mantendo as marcações de Contas Fixas, Cartões e Combustível nos botões manuais de cada aba.
  if (l.tipo === 'credito') {
    const ehSalarioObrOuImplatec =
      l.categoria === 'salario' ||
      /\bobr\b|implatec|nayara|ted\s*salario|cred\s*salario/i.test(l.descricao)
    if (ehSalarioObrOuImplatec) {
      return { destino: 'entradas', sugestaoMotivo: 'Salário OBR / Implatec (Salários + Extrato)' }
    }
    return { destino: 'apenas_extrato', sugestaoMotivo: 'Crédito avulso (vai apenas para o Extrato da Conta)' }
  }

  // Se o arquivo inteiro for fatura de um cartão específico (ex.: PDF/OFX de cartão aberto por engano no modo extrato)
  const cartaoDoArquivo = cartoesMes.find(c => normalizarTexto(c.nome) === normalizarTexto(bancoDetectado))
  if (cartaoDoArquivo && !bancoDetectado.toLowerCase().includes('caixa')) {
    const dup = encontrarDuplicadoNoCartao(l, cartaoDoArquivo.id, lancsCartaoMes)
    if (dup) {
      return {
        destino: 'ignorado',
        cartaoId: cartaoDoArquivo.id,
        sugestaoMotivo: `Já lançado em ${cartaoDoArquivo.nome} — não será alterado`,
      }
    }
    return {
      destino: 'cartoes',
      cartaoId: cartaoDoArquivo.id,
      sugestaoMotivo: l.parcela ? `Parcela ${l.parcela}` : `Cartão ${cartaoDoArquivo.nome}`,
    }
  }

  return { destino: 'apenas_extrato', sugestaoMotivo: 'Movimentação do Extrato da Conta' }
}

export default function OpenFinancePage() {
  const supabase = useMemo(() => createClient(), [])
  const { mes, ano } = useMes()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [tab, setTab] = useState<'importar' | 'pluggy' | 'historico'>('importar')
  const [modoImportacao, setModoImportacao] = useState<'extrato' | 'fatura_cartao'>('extrato')
  const [cartaoFaturaPadrao, setCartaoFaturaPadrao] = useState<string>('')
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<Lancamento[] | null>(null)
  const [importacaoId, setImportacaoId] = useState<string | null>(null)
  const [banco, setBanco] = useState('')
  const [historico, setHistorico] = useState<Importacao[]>([])
  const [loadingHist, setLoadingHist] = useState(false)
  const [msg, setMsg] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null)
  const [sincronizando, setSincronizando] = useState(false)
  const [cancelandoId, setCancelandoId] = useState<string | null>(null)
  const [cartoesMes, setCartoesMes] = useState<CartaoMes[]>([])
  const [contasMes, setContasMes] = useState<ContaMes[]>([])
  const [lancsCartaoMes, setLancsCartaoMes] = useState<LancamentoCartaoExistente[]>([])

  // Estado Pluggy (Meu Pluggy gratuito)
  const [pluggyConfigurado, setPluggyConfigurado] = useState<boolean | null>(null)
  const [pluggyAccounts, setPluggyAccounts] = useState<PluggyAccount[]>([])
  const [pluggyItemInput, setPluggyItemInput] = useState('')
  const [buscandoPluggy, setBuscandoPluggy] = useState(false)

  useEffect(() => {
    carregarHistorico()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    let ativo = true
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const [{ data: cData }, { data: cfData }, { data: lcData }] = await Promise.all([
        supabase.from('cartoes').select('id,nome,valor,pago').eq('user_id', user.id).eq('mes', mes).eq('ano', ano).order('nome'),
        supabase.from('contas_fixas').select('id,descricao,categoria,valor,pago').eq('user_id', user.id).eq('mes', mes).eq('ano', ano).order('descricao'),
        supabase.from('lancamentos_cartao').select('id,cartao_id,local,valor,data_compra,parcela').eq('user_id', user.id).eq('mes', mes).eq('ano', ano),
      ])
      if (ativo) {
        setCartoesMes((cData || []) as CartaoMes[])
        setContasMes((cfData || []) as ContaMes[])
        setLancsCartaoMes((lcData || []) as LancamentoCartaoExistente[])
      }
    })
    return () => { ativo = false }
  }, [mes, ano, supabase])

  useEffect(() => {
    if (tab === 'pluggy' && pluggyConfigurado === null) {
      consultarContasPluggy()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])

  async function consultarContasPluggy(itemIdManual?: string) {
    setBuscandoPluggy(true)
    setMsg(null)
    try {
      const savedItem = typeof window !== 'undefined' ? localStorage.getItem('fischer-pluggy-item-id') || '' : ''
      const itemFinal = (itemIdManual ?? pluggyItemInput) || savedItem
      const url = itemFinal
        ? `/api/open-finance/pluggy?itemId=${encodeURIComponent(itemFinal.trim())}`
        : '/api/open-finance/pluggy'
      const res = await authFetch(url)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Erro ao consultar Pluggy')
      setPluggyConfigurado(Boolean(json.configured))
      setPluggyAccounts(json.accounts || [])
    } catch (e: any) {
      setMsg({ tipo: 'erro', texto: e.message || 'Erro ao conectar com Pluggy' })
    } finally {
      setBuscandoPluggy(false)
    }
  }

  async function abrirWidgetMeuPluggy() {
    setBuscandoPluggy(true)
    setMsg(null)
    try {
      const res = await authFetch('/api/open-finance/pluggy?connectToken=1')
      const json = await res.json()
      if (!res.ok || !json.connectToken) throw new Error(json.error || 'Não foi possível gerar o Connect Token')

      // Carrega o SDK do Pluggy Connect sob demanda
      await new Promise<void>((resolve, reject) => {
        if ((window as any).PluggyConnect) return resolve()
        const script = document.createElement('script')
        script.src = 'https://cdn.pluggy.ai/pluggy-connect/v2.8.2/pluggy-connect.js'
        script.async = true
        script.onload = () => resolve()
        script.onerror = () => reject(new Error('Falha ao carregar o widget da Pluggy'))
        document.body.appendChild(script)
      })

      const PluggyConnect = (window as any).PluggyConnect
      const instance = new PluggyConnect({
        connectToken: json.connectToken,
        connectorIds: [200], // Força abrir diretamente o conector MeuPluggy (ID 200), evitando erro de trial
        includeSandbox: false,
        onSuccess: async (itemData: any) => {
          const novoItemId = itemData?.item?.id
          if (novoItemId) {
            const anteriores = (localStorage.getItem('fischer-pluggy-item-id') || '')
              .split(',')
              .map(s => s.trim())
              .filter(Boolean)
            const listaFinal = Array.from(new Set([novoItemId, ...anteriores])).join(',')
            localStorage.setItem('fischer-pluggy-item-id', listaFinal)
            setPluggyItemInput(listaFinal)
            setMsg({
              tipo: 'ok',
              texto: `Conexão vinculada com sucesso! (Item ID: ${novoItemId}). Carregando suas contas...`,
            })
            await consultarContasPluggy(listaFinal)
          }
        },
        onError: (err: any) => {
          console.error('Pluggy Connect erro:', err)
          const msgErro = String(err?.message || err?.error || err || '')
          if (msgErro.includes('TRIAL_CLIENT_ITEM_CREATE_NOT_ALLOWED')) {
            setMsg({
              tipo: 'erro',
              texto: 'No plano gratuito da Pluggy, novos bancos/cartões devem ser adicionados no portal meu.pluggy.ai. Adicione por lá e depois clique em "Atualizar Contas" aqui!',
            })
          } else {
            setMsg({ tipo: 'erro', texto: msgErro || 'Erro ao autorizar no Pluggy Connect' })
          }
        },
      })
      instance.init()
    } catch (e: any) {
      setMsg({ tipo: 'erro', texto: e.message || 'Erro ao abrir o Pluggy Connect' })
    } finally {
      setBuscandoPluggy(false)
    }
  }

  async function puxarTransacoesPluggy(acc: PluggyAccount) {
    setBuscandoPluggy(true)
    setMsg(null)
    try {
      const isCard = acc.type === 'CREDIT'
      const modo: 'extrato' | 'fatura_cartao' = isCard ? 'fatura_cartao' : 'extrato'
      setModoImportacao(modo)

      // Tenta achar cartão correspondente pelo nome
      const cartaoMatch = cartoesMes.find(c => normalizarTexto(acc.name).includes(normalizarTexto(c.nome)) || normalizarTexto(c.nome).includes(normalizarTexto(acc.name)))
      const cartaoPadrao = cartaoMatch?.id || cartaoFaturaPadrao

      const res = await authFetch('/api/open-finance/pluggy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: acc.id,
          accountName: acc.name,
          accountType: acc.type,
          mes,
          ano,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Falha ao buscar transações')

      const lps: Lancamento[] = json.lancamentos.map((l: any) => {
        const sug = sugerirDestinoInteligente(l, json.banco, modo, cartaoPadrao, contasMes, cartoesMes, lancsCartaoMes)
        return { ...l, ...sug }
      })

      setPreview(lps)
      setImportacaoId(json.importacaoId)
      setBanco(json.banco)
      setTab('importar')
      const msgSaldo =
        typeof json.saldoDia01 === 'number'
          ? ` · Saldo em 01/${String(mes).padStart(2, '0')}/${ano} atualizado para ${formatBRL(json.saldoDia01)}`
          : ''
      setMsg({ tipo: 'ok', texto: `${json.total} lançamentos importados via Open Finance (${acc.name})${msgSaldo}` })
    } catch (e: any) {
      setMsg({ tipo: 'erro', texto: e.message || 'Falha ao puxar transações' })
    } finally {
      setBuscandoPluggy(false)
    }
  }

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
        // Se estiver em modo fatura e nenhum cartão foi escolhido ainda, tenta detectar pelo nome do arquivo/banco
        let cartaoIdPadrao = cartaoFaturaPadrao
        if (!cartaoIdPadrao) {
          const match = cartoesMes.find(c =>
            normalizarTexto(c.nome).includes(normalizarTexto(json.banco)) ||
            normalizarTexto(json.banco).includes(normalizarTexto(c.nome))
          )
          if (match) {
            cartaoIdPadrao = match.id
            setCartaoFaturaPadrao(match.id)
          }
        }

        const lps: Lancamento[] = json.lancamentos.map((l: any) => {
          const sug = sugerirDestinoInteligente(l, json.banco, modoImportacao, cartaoIdPadrao, contasMes, cartoesMes, lancsCartaoMes)
          return { ...l, ...sug }
        })
        setPreview(lps)
        setImportacaoId(json.importacaoId)
        setBanco(json.banco)
        setMsg({ tipo: 'ok', texto: `${json.total} lançamentos encontrados (${json.banco})` })
      }
    } catch (e: any) {
      setMsg({ tipo: 'erro', texto: e.message })
    }
    setUploading(false)
  }

  function handleDestinoChange(index: number, novoDestino: DestinoLancamento) {
    if (!preview) return
    setPreview(preview.map((item, i) =>
      i === index
        ? {
            ...item,
            destino: novoDestino,
            cartaoId: novoDestino === 'cartoes' ? (cartaoFaturaPadrao || item.cartaoId) : undefined,
            contaId: undefined,
          }
        : item
    ))
  }

  function aplicarCartaoEmTodos(cartaoId: string) {
    setCartaoFaturaPadrao(cartaoId)
    if (!preview) return
    setPreview(preview.map(item => {
      if (item.tipo === 'credito') return item
      const dup = encontrarDuplicadoNoCartao(item, cartaoId || undefined, lancsCartaoMes)
      if (dup) {
        return {
          ...item,
          destino: 'ignorado',
          cartaoId,
          sugestaoMotivo: `Já lançado no cartão ("${dup.local}") — não será alterado`,
        }
      }
      if (item.destino === 'cartoes' || item.sugestaoMotivo?.includes('Já lançado')) {
        return {
          ...item,
          destino: 'cartoes',
          cartaoId,
          sugestaoMotivo: item.parcela ? `Nova compra · Parcela ${item.parcela}` : 'Nova compra da fatura',
        }
      }
      return item
    }))
  }

  async function sincronizarSelecionados() {
    if (!preview || !importacaoId) return
    const ignorados = preview.filter(l => l.destino === 'ignorado').length
    if (ignorados > 0 && !confirm(`${ignorados} transação(ões) serão ignoradas. Continuar?`)) return
    if (preview.some(l => (l.destino === 'cartoes' || l.destino === 'quitar_cartao') && !l.cartaoId)) {
      setMsg({ tipo: 'erro', texto: 'Selecione o cartão correspondente antes de sincronizar.' })
      return
    }
    if (preview.some(l => l.destino === 'quitar_conta' && !l.contaId)) {
      setMsg({ tipo: 'erro', texto: 'Selecione a conta fixa que será dada como paga.' })
      return
    }
    setSincronizando(true)
    try {
      const res = await authFetch('/api/open-finance/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          importacaoId,
          mes,
          ano,
          modoImportacao,
          itens: preview.map(l => ({
            id: l.id,
            destino: l.destino,
            cartao_id: l.cartaoId,
            conta_id: l.contaId,
            parcela: l.parcela || null,
          })),
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Falha ao sincronizar')
      const extras = [
        json.baixasRealizadas ? `${json.baixasRealizadas} conta(s)/fatura(s) marcadas como pagas` : '',
        json.parcelasFuturasCriadas ? `${json.parcelasFuturasCriadas} parcela(s) futura(s) geradas` : '',
        json.duplicadosIgnorados ? `${json.duplicadosIgnorados} já existente(s) mantida(s) sem alteração` : '',
      ].filter(Boolean).join(' · ')
      setMsg({
        tipo: 'ok',
        texto: `${json.sincronizados} lançamentos sincronizados com sucesso!${extras ? ` (${extras})` : ''}`,
      })
      setPreview(null)
      await carregarHistorico()
    } catch (error) {
      setMsg({ tipo: 'erro', texto: error instanceof Error ? error.message : 'Falha ao sincronizar' })
    } finally {
      setSincronizando(false)
    }
  }

  async function cancelarImportacao(id: string) {
    setCancelandoId(id)
    try {
      const res = await authFetch(`/api/open-finance?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Falha ao cancelar')
      if (importacaoId === id) { setPreview(null); setImportacaoId(null) }
      await carregarHistorico()
      setMsg(null)
    } catch (error) {
      setMsg({ tipo: 'erro', texto: error instanceof Error ? error.message : 'Falha ao cancelar' })
    } finally {
      setCancelandoId(null)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <span className="text-3xl">🏦</span> Open Finance &amp; Importação ({MESES[mes - 1]} {ano})
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Alimente o extrato da Caixa, dê baixa automática nas contas pagas e lance faturas de cartão com parcelas.
          </p>
        </div>

        <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setTab('importar')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${tab === 'importar' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-500'}`}
          >
            📄 Arquivo (OFX / PDF / CSV)
          </button>
          <button
            onClick={() => setTab('pluggy')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${tab === 'pluggy' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-500'}`}
          >
            ⚡ Open Finance (Pluggy)
          </button>
          <button
            onClick={() => setTab('historico')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${tab === 'historico' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-500'}`}
          >
            Histórico
          </button>
        </div>
      </div>

      {msg && (
        <Card className={`p-4 border-none shadow-lg ${msg.tipo === 'ok' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
          <p className="text-sm font-bold flex items-center gap-2">
            <span>{msg.tipo === 'ok' ? '✅' : '❌'}</span> {msg.texto}
          </p>
        </Card>
      )}

      <AnimatePresence mode="wait">
        {tab === 'importar' ? (
          <motion.div
            key="importar"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {!preview ? (
              <div className="space-y-4">
                {/* Seletor do tipo de documento antes do upload */}
                <Card className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400">O que você vai importar?</div>
                    <div className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">
                      Escolha para o sistema já configurar as baixas ou parcelas automaticamente.
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setModoImportacao('extrato')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                        modoImportacao === 'extrato'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      🏦 Extrato Conta (Caixa / Bancos)
                    </button>
                    <button
                      type="button"
                      onClick={() => setModoImportacao('fatura_cartao')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                        modoImportacao === 'fatura_cartao'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      💳 Fatura de Cartão de Crédito
                    </button>
                    {modoImportacao === 'fatura_cartao' && (
                      <select
                        value={cartaoFaturaPadrao}
                        onChange={e => setCartaoFaturaPadrao(e.target.value)}
                        className="px-3 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                      >
                        <option value="">Detectar cartão automaticamente</option>
                        {cartoesMes.map(c => (
                          <option key={c.id} value={c.id}>{c.nome}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </Card>

                <div
                  onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) processarArquivo(f) }}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <Card
                    className={`p-14 border-dashed border-2 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${dragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10 scale-[1.01]' : 'bg-gray-50 dark:bg-slate-900 shadow-inner'}`}
                  >
                    <input ref={fileInputRef} type="file" className="hidden" accept=".ofx,.csv,.pdf,application/pdf" onChange={(e) => { const f = e.target.files?.[0]; if (f) processarArquivo(f) }} />
                    <div className="text-6xl mb-4">{modoImportacao === 'extrato' ? '🏦' : '💳'}</div>
                    <h3 className="text-xl font-bold dark:text-gray-100 mb-2">
                      {modoImportacao === 'extrato' ? 'Solte aqui o Extrato da Caixa (.OFX, .PDF ou .CSV)' : 'Solte aqui o PDF/CSV da Fatura do Cartão'}
                    </h3>
                    <p className="text-sm text-gray-500 max-w-md mb-6">
                      {modoImportacao === 'extrato'
                        ? 'Reconhecemos salários/entradas, abastecimentos e já sugerimos dar baixa nas contas fixas e faturas pagas no mês.'
                        : 'Extraímos todas as compras da fatura, identificamos parcelas (ex: 02/10) e criamos as parcelas futuras automaticamente.'}
                    </p>
                    <Button className="bg-blue-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-blue-500/20">
                      {uploading ? 'Processando arquivo...' : 'Selecionar Arquivo'}
                    </Button>
                  </Card>
                </div>
              </div>
            ) : (
              <Card className="p-0 overflow-hidden shadow-2xl border-none">
                <div className="p-6 bg-gray-50 dark:bg-slate-800 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                  <div>
                    <h3 className="font-bold text-lg dark:text-gray-100 flex items-center gap-2">
                      <span>🏷️</span> {banco} — {preview.length} Lançamentos
                    </h3>
                    <p className="text-xs text-gray-500">
                      Revise os destinos sugeridos. Você pode ajustar qualquer linha ou alterar a parcela antes de confirmar.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={cartaoFaturaPadrao}
                      onChange={e => aplicarCartaoEmTodos(e.target.value)}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold px-3 py-2"
                    >
                      <option value="">Aplicar cartão a todas as compras...</option>
                      {cartoesMes.map(c => (
                        <option key={c.id} value={c.id}>💳 {c.nome}</option>
                      ))}
                    </select>
                    <Button variant="outline" onClick={() => { if (importacaoId) cancelarImportacao(importacaoId) }} disabled={sincronizando || cancelandoId === importacaoId}>
                      Cancelar
                    </Button>
                    <Button onClick={sincronizarSelecionados} isLoading={sincronizando} className="bg-blue-600 text-white font-bold">
                      Confirmar e Sincronizar
                    </Button>
                  </div>
                </div>

                <div className="max-h-[600px] overflow-auto">
                  <table className="w-full min-w-[760px] text-left border-collapse">
                    <thead className="sticky top-0 bg-white dark:bg-slate-900 border-b dark:border-slate-800 z-10">
                      <tr className="text-[10px] uppercase font-black text-gray-400 tracking-widest">
                        <th className="px-5 py-4">Data</th>
                        <th className="px-5 py-4">Descrição</th>
                        <th className="px-5 py-4">Parcela</th>
                        <th className="px-5 py-4">Valor</th>
                        <th className="px-5 py-4">Ação / Destino</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-slate-800">
                      {preview.map((l, i) => (
                        <tr key={i} className="group hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-5 py-3.5 text-xs font-bold text-gray-500 whitespace-nowrap">{formatDate(l.data)}</td>
                          <td className="px-5 py-3.5">
                            <div className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate max-w-[240px]" title={l.descricao}>
                              {l.descricao}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-gray-400">{CATEGORIAS_LABEL[l.categoria] || l.categoria}</span>
                              {l.sugestaoMotivo && (
                                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                  ✨ {l.sugestaoMotivo}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            {l.destino === 'cartoes' ? (
                              <input
                                type="text"
                                placeholder="À vista (ou 01/06)"
                                value={l.parcela || ''}
                                onChange={e => setPreview(prev => prev?.map((item, idx) => idx === i ? { ...item, parcela: e.target.value || null } : item) || null)}
                                className="w-28 bg-white dark:bg-slate-950 border dark:border-slate-700 rounded-lg text-xs font-semibold px-2 py-1"
                              />
                            ) : (
                              <span className="text-xs text-slate-400">—</span>
                            )}
                          </td>
                          <td className={`px-5 py-3.5 text-sm font-black whitespace-nowrap ${l.tipo === 'credito' ? 'text-green-600' : 'text-red-500'}`}>
                            {l.tipo === 'credito' ? '+' : '-'} {formatBRL(l.valor)}
                          </td>
                          <td className="px-5 py-3.5 space-y-1.5">
                            <select
                              value={l.destino}
                              onChange={(e) => handleDestinoChange(i, e.target.value as DestinoLancamento)}
                              className="w-full bg-white dark:bg-slate-950 border dark:border-slate-700 rounded-lg text-xs font-bold py-1.5 px-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                              {l.tipo === 'credito' ? (
                                <>
                                  <option value="entradas">💼 Salário (OBR / Implatec) + Extrato</option>
                                  <option value="apenas_extrato">📄 Apenas no Extrato da Conta</option>
                                  <option value="ignorado">🚫 Ignorar</option>
                                </>
                              ) : (
                                <>
                                  <option value="apenas_extrato">📄 Apenas no Extrato da Conta</option>
                                  <option value="quitar_conta">✅ Dar baixa em Conta Fixa + Extrato</option>
                                  <option value="quitar_cartao">✅ Dar baixa em Fatura de Cartão + Extrato</option>
                                  <option value="combustivel">⛽ Lançar em Combustível + Extrato</option>
                                  <option value="contas_fixas">🏠 Criar nova Conta Fixa + Extrato</option>
                                  <option value="cartoes">💳 Lançar compra em Cartão (com parcelas)</option>
                                  <option value="ignorado">🚫 Ignorar</option>
                                </>
                              )}
                            </select>

                            {(l.destino === 'cartoes' || l.destino === 'quitar_cartao') && (
                              <select
                                aria-label={`Cartão para ${l.descricao}`}
                                value={l.cartaoId || ''}
                                onChange={e => setPreview(prev => prev?.map((item, idx) => idx === i ? { ...item, cartaoId: e.target.value } : item) || null)}
                                className="w-full bg-white dark:bg-slate-950 border dark:border-slate-700 rounded-lg text-xs p-1.5"
                              >
                                <option value="">Selecione o cartão...</option>
                                {cartoesMes.map(cartao => (
                                  <option key={cartao.id} value={cartao.id}>
                                    {cartao.nome} ({formatBRL(Number(cartao.valor))})
                                  </option>
                                ))}
                              </select>
                            )}

                            {l.destino === 'quitar_conta' && (
                              <select
                                aria-label={`Conta fixa para ${l.descricao}`}
                                value={l.contaId || ''}
                                onChange={e => setPreview(prev => prev?.map((item, idx) => idx === i ? { ...item, contaId: e.target.value } : item) || null)}
                                className="w-full bg-white dark:bg-slate-950 border dark:border-slate-700 rounded-lg text-xs p-1.5"
                              >
                                <option value="">Selecione a conta fixa...</option>
                                {contasMes.map(cf => (
                                  <option key={cf.id} value={cf.id}>
                                    {cf. pago ? '✓ ' : ''}{cf.descricao} — {formatBRL(Number(cf.valor))}
                                  </option>
                                ))}
                              </select>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </motion.div>
        ) : tab === 'pluggy' ? (
          <motion.div
            key="pluggy"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <Card className="p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    ⚡ Conexão Direta Open Finance (Meu Pluggy · Gratuito)
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Conecte gratuitamente sua conta da Caixa Econômica e seus cartões principais (Nubank, C6, Mercado Pago, Itaú/Hipercard).
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={abrirWidgetMeuPluggy} isLoading={buscandoPluggy} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs">
                    🔗 Autorizar MeuPluggy no App
                  </Button>
                  <Button variant="outline" onClick={() => consultarContasPluggy(pluggyItemInput)} isLoading={buscandoPluggy}>
                    🔄 Atualizar Contas
                  </Button>
                  <a
                    href="https://meu.pluggy.ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all"
                  >
                    <span>Abrir meu.pluggy.ai</span>
                    <span className="text-[10px] opacity-75">↗</span>
                  </a>
                </div>
              </div>

              {pluggyConfigurado === false ? (
                <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 p-5 space-y-3 text-xs text-slate-600 dark:text-slate-300">
                  <div className="font-bold text-sm text-slate-800 dark:text-white">Como ativar em 2 minutos (100% gratuito para uso pessoal):</div>
                  <ol className="list-decimal list-inside space-y-1.5">
                    <li>Acesse <strong>https://meu.pluggy.ai</strong>, crie sua conta pessoal gratuita e conecte a <strong>Caixa Econômica</strong> e seus cartões via Open Finance.</li>
                    <li>Acesse <strong>https://dashboard.pluggy.ai</strong> com o mesmo e-mail, crie um App e copie o <code>CLIENT_ID</code>, o <code>CLIENT_SECRET</code> e os IDs das conexões (Items).</li>
                    <li>Cole no seu arquivo <code>.env.local</code>:
                      <pre className="mt-2 p-3 rounded-xl bg-slate-900 text-slate-100 overflow-x-auto text-[11px]">
{`PLUGGY_CLIENT_ID=seu_client_id
PLUGGY_CLIENT_SECRET=seu_client_secret
PLUGGY_ITEM_IDS=id_item_caixa,id_item_nubank`}
                      </pre>
                    </li>
                  </ol>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ou informe um Item ID da Pluggy manualmente..."
                      value={pluggyItemInput}
                      onChange={e => setPluggyItemInput(e.target.value)}
                      className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
                    />
                    <Button variant="outline" onClick={() => consultarContasPluggy(pluggyItemInput)} disabled={buscandoPluggy || !pluggyItemInput.trim()}>
                      Buscar Item
                    </Button>
                  </div>

                  <div className="rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="text-slate-700 dark:text-slate-300">
                      💡 <strong>Como conectar seus outros cartões (Nubank, C6, Mercado Pago, Itaú, etc.):</strong> No plano gratuito do Meu Pluggy, conecte-os diretamente em seu portal pessoal em <strong>meu.pluggy.ai</strong>. Após conectar lá, clique em <strong>Atualizar Contas</strong> aqui!
                    </div>
                    <a
                      href="https://meu.pluggy.ai"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400 hover:underline flex-shrink-0"
                    >
                      Abrir meu.pluggy.ai ↗
                    </a>
                  </div>

                  {pluggyAccounts.length === 0 ? (
                    <div className="py-8 px-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-800/50 text-center space-y-2">
                      <div className="text-sm font-bold text-slate-800 dark:text-white">
                        Falta apenas autorizar o conector &quot;MeuPluggy&quot; para este App!
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
                        Seus bancos já estão conectados no seu Data Passport (Meu Pluggy). Agora clique no botão verde{' '}
                        <strong>&quot;🔗 Vincular MeuPluggy (1 clique)&quot;</strong> acima, escolha o conector <strong>MeuPluggy</strong> na janela que abrir e faça login com seu e-mail do Meu Pluggy para liberar todas as suas contas e cartões!
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {pluggyAccounts.map(acc => (
                        <div key={acc.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                          <div>
                            <div className="text-xs font-bold uppercase text-blue-600 dark:text-blue-400">
                              {acc.type === 'CREDIT' ? '💳 Cartão de Crédito' : '🏦 Conta Bancária'}
                            </div>
                            <div className="font-bold text-slate-900 dark:text-white mt-0.5">{acc.name}</div>
                            <div className="text-xs text-slate-400 mt-0.5">Saldo/Fatura: {formatBRL(acc.balance)}</div>
                          </div>
                          <Button
                            onClick={() => puxarTransacoesPluggy(acc)}
                            isLoading={buscandoPluggy}
                            className="bg-blue-600 text-white text-xs font-bold"
                          >
                            Puxar {MESES[mes - 1]}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="historico"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {loadingHist ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-100 dark:bg-slate-800 animate-pulse rounded-2xl" />)}
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
                    {imp.status === 'pendente' && (
                      <button type="button" onClick={() => cancelarImportacao(imp.id)}
                        disabled={cancelandoId === imp.id}
                        className="mt-2 text-xs font-semibold text-red-600 hover:underline disabled:opacity-50">
                        Descartar importação pendente
                      </button>
                    )}
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
