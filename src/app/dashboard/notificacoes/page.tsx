'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { useMes } from '@/context/MesContext'
import { formatBRL, formatDate } from '@/lib/utils'
import { MESES } from '@/types'
import { toast } from 'sonner'

let cachedUserId: string | null = null

type TipoLembrete = 'vencimento' | 'meta' | 'geral'
type Prioridade = 'baixa' | 'media' | 'alta'

type Lembrete = {
  id: string
  user_id: string
  tipo: TipoLembrete
  titulo: string
  mensagem: string
  data_lembrete: string
  prioridade: Prioridade
  lido: boolean
  ativo: boolean
  created_at: string
}

type Notificacao = {
  id: string
  tipo: 'info' | 'alerta' | 'sucesso' | 'erro'
  titulo: string
  mensagem: string
  data: Date
  lida: boolean
}

const ICONES_TIPO = {
  vencimento: '📅',
  meta: '🎯',
  geral: '📌'
}

const CORES_PRIORIDADE = {
  baixa: 'blue',
  media: 'yellow',
  alta: 'red'
}

export default function NotificacoesPage() {
  const supabase = createClient()
  const { mes, ano } = useMes()
  
  const [lembretes, setLembretes] = useState<Lembrete[]>([])
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState<Partial<Lembrete>>({})
  const [saving, setSaving] = useState(false)
  const [abaAtiva, setAbaAtiva] = useState<'lembretes' | 'notificacoes'>('notificacoes')
  const [whatsappNumbers, setWhatsappNumbers] = useState<{ label: string; index: number }[]>([])
  const userIdRef = useRef<string | null>(cachedUserId)

  useEffect(() => {
    async function init() {
      if (!userIdRef.current) {
        const { data: { user } } = await supabase.auth.getUser()
        userIdRef.current = user?.id ?? null
        cachedUserId = user?.id ?? null
      }
      carregarTudo()
      buscarNumerosWhatsApp()
    }
    init()
  }, [])

  async function buscarNumerosWhatsApp() {
    try {
      const res = await fetch('/api/whatsapp')
      const data = await res.json()
      if (data.numbers) setWhatsappNumbers(data.numbers)
    } catch (e) {
      console.error('Erro ao buscar números de WhatsApp')
    }
  }

  useEffect(() => {
    if (userIdRef.current) carregarTudo()
  }, [mes, ano])

  async function carregarTudo() {
    const uid = userIdRef.current
    if (!uid) return
    setLoading(true)

    // Carregar lembretes
    const { data: lembretesData } = await supabase
      .from('lembretes')
      .select('*')
      .eq('user_id', uid)
      .order('data_lembrete', { ascending: true })

    setLembretes(lembretesData || [])

    // Gerar notificações automáticas
    await gerarNotificacoes(uid)

    setLoading(false)
  }

  async function gerarNotificacoes(uid: string) {
    const notifs: Notificacao[] = []
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    // Buscar dados para notificações
    const [
      { data: cartoes },
      { data: fixas },
      { data: metas },
      { data: lembretes }
    ] = await Promise.all([
      supabase.from('cartoes').select('*').eq('user_id', uid).eq('mes', mes).eq('ano', ano).eq('pago', false),
      supabase.from('contas_fixas').select('*').eq('user_id', uid).eq('mes', mes).eq('ano', ano).eq('pago', false),
      supabase.from('metas').select('*').eq('user_id', uid).eq('mes', mes).eq('ano', ano).eq('ativo', true),
      supabase.from('lembretes').select('*').eq('user_id', uid).eq('ativo', true).eq('lido', false)
    ])

    // Notificações de vencimento de cartões
    cartoes?.forEach(cartao => {
      if (cartao.vencimento) {
        const [dia] = cartao.vencimento.split('/')
        const dataVenc = new Date(ano, mes - 1, parseInt(dia))
        const diasRestantes = Math.ceil((dataVenc.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
        
        if (diasRestantes >= 0 && diasRestantes <= 5) {
          notifs.push({
            id: `cartao-${cartao.id}`,
            tipo: diasRestantes <= 2 ? 'alerta' : 'info',
            titulo: `Vencimento: ${cartao.nome}`,
            mensagem: diasRestantes === 0 
              ? `Vence HOJE! Fatura de ${formatBRL(cartao.valor)}`
              : `Vence em ${diasRestantes} dia(s) - ${formatBRL(cartao.valor)}`,
            data: new Date(),
            lida: false
          })
        }
      }
    })

    // Notificações de contas fixas
    fixas?.forEach(conta => {
      if (conta.data_vencimento) {
        const dataVenc = new Date(conta.data_vencimento)
        const diasRestantes = Math.ceil((dataVenc.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
        
        if (diasRestantes >= 0 && diasRestantes <= 5) {
          notifs.push({
            id: `conta-${conta.id}`,
            tipo: diasRestantes <= 2 ? 'alerta' : 'info',
            titulo: `Vencimento: ${conta.descricao}`,
            mensagem: diasRestantes === 0
              ? `Vence HOJE! Valor: ${formatBRL(conta.valor)}`
              : `Vence em ${diasRestantes} dia(s) - ${formatBRL(conta.valor)}`,
            data: new Date(),
            lida: false
          })
        }
      }
    })

    // Notificações de metas
    const [{ data: gastosCartoes }, { data: gastosFixas }, { data: gastosCombustivel }] = await Promise.all([
      supabase.from('cartoes').select('valor').eq('user_id', uid).eq('mes', mes).eq('ano', ano),
      supabase.from('contas_fixas').select('valor').eq('user_id', uid).eq('mes', mes).eq('ano', ano),
      supabase.from('combustivel').select('valor').eq('user_id', uid).eq('mes', mes).eq('ano', ano)
    ])

    const soma = (arr: any[]) => arr.reduce((s, r) => s + Number(r.valor), 0)
    const gastos = {
      cartoes: soma(gastosCartoes || []),
      fixas: soma(gastosFixas || []),
      combustivel: soma(gastosCombustivel || []),
      total: 0
    }
    gastos.total = gastos.cartoes + gastos.fixas + gastos.combustivel

    metas?.forEach(meta => {
      const gasto = gastos[meta.categoria as keyof typeof gastos] || 0
      const percentual = (gasto / meta.valor_limite) * 100
      
      if (percentual >= meta.notificar_em && percentual < 100) {
        notifs.push({
          id: `meta-${meta.id}`,
          tipo: 'alerta',
          titulo: `Meta atingida: ${meta.categoria}`,
          mensagem: `Você atingiu ${percentual.toFixed(0)}% da meta (${formatBRL(gasto)} de ${formatBRL(meta.valor_limite)})`,
          data: new Date(),
          lida: false
        })
      } else if (percentual >= 100) {
        notifs.push({
          id: `meta-excedida-${meta.id}`,
          tipo: 'erro',
          titulo: `Meta excedida: ${meta.categoria}`,
          mensagem: `Você ultrapassou a meta em ${formatBRL(gasto - meta.valor_limite)}!`,
          data: new Date(),
          lida: false
        })
      }
    })

    // Notificações de lembretes
    lembretes?.forEach(lembrete => {
      const dataLembrete = new Date(lembrete.data_lembrete)
      const diasRestantes = Math.ceil((dataLembrete.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
      
      if (diasRestantes >= 0 && diasRestantes <= 3) {
        notifs.push({
          id: `lembrete-${lembrete.id}`,
          tipo: lembrete.prioridade === 'alta' ? 'alerta' : 'info',
          titulo: lembrete.titulo,
          mensagem: diasRestantes === 0
            ? `HOJE: ${lembrete.mensagem}`
            : `Em ${diasRestantes} dia(s): ${lembrete.mensagem}`,
          data: new Date(),
          lida: false
        })
      }
    })

    // Ordenar por tipo (erro > alerta > info > sucesso)
    notifs.sort((a, b) => {
      const ordem = { erro: 0, alerta: 1, info: 2, sucesso: 3 }
      return ordem[a.tipo] - ordem[b.tipo]
    })

    setNotificacoes(notifs)
  }

  function abrirModal(lembrete?: Lembrete) {
    if (lembrete) {
      setForm({ ...lembrete })
    } else {
      const amanha = new Date()
      amanha.setDate(amanha.getDate() + 1)
      setForm({
        tipo: 'geral',
        prioridade: 'media',
        ativo: true,
        lido: false,
        data_lembrete: amanha.toISOString().split('T')[0]
      })
    }
    setModal(true)
  }

  function fecharModal() {
    setModal(false)
    setForm({})
  }

  async function salvarLembrete() {
    const uid = userIdRef.current
    if (!uid || !form.titulo || !form.data_lembrete) return

    setSaving(true)

    const payload = {
      user_id: uid,
      tipo: form.tipo || 'geral',
      titulo: form.titulo,
      mensagem: form.mensagem || '',
      data_lembrete: form.data_lembrete,
      prioridade: form.prioridade || 'media',
      lido: form.lido || false,
      ativo: form.ativo !== false,
    }

    if (form.id) {
      await supabase.from('lembretes').update(payload).eq('id', form.id)
    } else {
      await supabase.from('lembretes').insert(payload)
    }

    setSaving(false)
    fecharModal()
    carregarTudo()
  }

  async function excluirLembrete(lembrete: Lembrete) {
    if (!confirm(`Excluir lembrete "${lembrete.titulo}"?`)) return
    await supabase.from('lembretes').delete().eq('id', lembrete.id)
    carregarTudo()
  }

  async function marcarComoLido(lembrete: Lembrete) {
    await supabase.from('lembretes').update({ lido: true }).eq('id', lembrete.id)
    setLembretes(prev => prev.map(l => l.id === lembrete.id ? { ...l, lido: true } : l))
  }

  async function toggleAtivo(lembrete: Lembrete) {
    const novoAtivo = !lembrete.ativo
    await supabase.from('lembretes').update({ ativo: novoAtivo }).eq('id', lembrete.id)
    setLembretes(prev => prev.map(l => l.id === lembrete.id ? { ...l, ativo: novoAtivo } : l))
  }

  async function enviarParaTelegram() {
    if (notificacoes.length === 0) {
      toast.info('Nenhuma notificação para enviar')
      return
    }

    const texto = `<b>🛎️ Resumo Fischer Finanças - ${MESES[mes - 1]}/${ano}</b>\n\n` + 
      notificacoes.filter(n => !n.lida).map(n => `• <b>${n.titulo}</b>: ${n.mensagem}`).join('\n\n')

    setSaving(true)
    try {
      const res = await fetch('/api/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: texto })
      })
      
      if (res.ok) {
        toast.success('Resumo enviado para o Telegram!')
      } else {
        const data = await res.json().catch(() => ({ error: 'Resposta inválida do servidor' }))
        toast.error(`Erro: ${data.error || 'Verifique se você deu /start no seu bot'}`)
      }
    } catch (e) {
      toast.error('Erro de conexão ao enviar Telegram')
    } finally {
      setSaving(false)
    }
  }

  async function enviarParaWhatsApp(targetIndex?: number) {
    if (notificacoes.length === 0) {
      toast.info('Nenhuma notificação para enviar')
      return
    }

    // Configurando texto com negritos do WhatsApp (*)
    const texto = `*🛎️ Resumo Fischer Finanças - ${MESES[mes - 1]}/${ano}*\n\n` + 
      notificacoes.filter(n => !n.lida).map(n => `• *${n.titulo}*: ${n.mensagem}`).join('\n\n')

    setSaving(true)
    try {
      const res = await fetch('/api/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: texto, targetIndex })
      })
      
      const data = await res.json().catch(() => ({ error: 'Resposta inválida' }))

      if (res.ok) {
        toast.success(targetIndex !== undefined ? 'Resumo enviado!' : 'Resumo enviado para todos!')
      } else {
        // Se houver detalhes de falha por número
        if (data.details && Array.isArray(data.details)) {
          const falhas = data.details.filter((r: any) => !r.success)
          if (falhas.length > 0) {
            const numFalhas = falhas.map((f: any) => f.phone.slice(-4)).join(', ')
            toast.error(`Falha no(s) número(s) final ${numFalhas}. Verifique a API Key ou Ativação.`)
          } else {
            toast.error(data.error || 'Erro desconhecido no envio')
          }
        } else {
          toast.error(data.error || 'Falha ao enviar')
        }
      }
    } catch (e) {
      toast.error('Erro de conexão ao enviar WhatsApp')
    } finally {
      setSaving(false)
    }
  }

  function marcarNotificacaoLida(id: string) {
    setNotificacoes(prev => prev.map(n => n.id === id ? { ...n, lida: true } : n))
  }

  const notificacoesNaoLidas = notificacoes.filter(n => !n.lida).length
  const lembretesAtivos = lembretes.filter(l => l.ativo && !l.lido).length

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse card h-32" />
        <div className="animate-pulse card h-96" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">🔔 Notificações e Lembretes</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{MESES[mes - 1]} {ano}</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={enviarParaTelegram} 
            disabled={saving || notificacoesNaoLidas === 0}
            className="btn-secondary flex items-center gap-2 bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-800"
          >
            {saving ? '⏳...' : '✈️ Telegram'}
          </button>
          {whatsappNumbers.length > 0 && (
            <div className="flex gap-2">
              {whatsappNumbers.map((num) => (
                <button
                  key={num.index}
                  onClick={() => enviarParaWhatsApp(num.index)}
                  disabled={saving || notificacoesNaoLidas === 0}
                  className="btn-secondary flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                  title={`Enviar para ${num.label}`}
                >
                  {saving ? '⏳' : `💬 WhatsApp ${num.label}`}
                </button>
              ))}
              {whatsappNumbers.length > 1 && (
                <button
                  onClick={() => enviarParaWhatsApp()}
                  disabled={saving || notificacoesNaoLidas === 0}
                  className="btn-secondary flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700"
                >
                  {saving ? '⏳' : '💬 Todos'}
                </button>
              )}
            </div>
          )}
          {whatsappNumbers.length === 0 && (
            <button 
              onClick={() => enviarParaWhatsApp()} 
              disabled={saving || notificacoesNaoLidas === 0}
              className="btn-secondary flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
            >
              {saving ? '⏳...' : '💬 WhatsApp'}
            </button>
          )}
          <button onClick={() => abrirModal()} className="btn-primary">
            + Novo Lembrete
          </button>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🔔</div>
            <div>
              <p className="text-2xl font-bold text-red-600">{notificacoesNaoLidas}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Notificações não lidas</p>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <div className="flex items-center gap-3">
            <div className="text-3xl">📌</div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{lembretesAtivos}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Lembretes ativos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Abas */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setAbaAtiva('notificacoes')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            abaAtiva === 'notificacoes'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          🔔 Notificações ({notificacoes.length})
        </button>
        <button
          onClick={() => setAbaAtiva('lembretes')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            abaAtiva === 'lembretes'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          📌 Lembretes ({lembretes.length})
        </button>
      </div>

      {/* Conteúdo das Abas */}
      {abaAtiva === 'notificacoes' ? (
        <div className="space-y-3">
          {notificacoes.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-6xl mb-4">🎉</div>
              <p className="text-gray-500 dark:text-gray-400">Nenhuma notificação no momento!</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Está tudo em dia!</p>
            </div>
          ) : (
            notificacoes.map(notif => (
              <div
                key={notif.id}
                className={`card hover:shadow-md transition-shadow ${
                  notif.lida ? 'opacity-60' : ''
                } ${
                  notif.tipo === 'erro' ? 'border-l-4 border-red-500' :
                  notif.tipo === 'alerta' ? 'border-l-4 border-yellow-500' :
                  notif.tipo === 'sucesso' ? 'border-l-4 border-green-500' :
                  'border-l-4 border-blue-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="text-2xl">
                      {notif.tipo === 'erro' ? '🚨' :
                       notif.tipo === 'alerta' ? '⚠️' :
                       notif.tipo === 'sucesso' ? '✅' : 'ℹ️'}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">{notif.titulo}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{notif.mensagem}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                        {notif.data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  {!notif.lida && (
                    <button
                      onClick={() => marcarNotificacaoLida(notif.id)}
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm px-3 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                    >
                      Marcar como lida
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {lembretes.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-6xl mb-4">📌</div>
              <p className="text-gray-500 dark:text-gray-400">Nenhum lembrete cadastrado</p>
              <button onClick={() => abrirModal()} className="btn-primary mt-4">
                Criar Primeiro Lembrete
              </button>
            </div>
          ) : (
            lembretes.map(lembrete => {
              const cor = CORES_PRIORIDADE[lembrete.prioridade]
              const hoje = new Date()
              hoje.setHours(0, 0, 0, 0)
              const dataLembrete = new Date(lembrete.data_lembrete)
              const diasRestantes = Math.ceil((dataLembrete.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
              const atrasado = diasRestantes < 0
              
              return (
                <div
                  key={lembrete.id}
                  className={`card hover:shadow-md transition-shadow ${
                    lembrete.lido ? 'opacity-60' : ''
                  } ${
                    !lembrete.ativo ? 'bg-gray-50 dark:bg-gray-800/50' : ''
                  } border-l-4 ${
                    cor === 'red' ? 'border-red-500' :
                    cor === 'yellow' ? 'border-yellow-500' :
                    'border-blue-500'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="text-2xl">{ICONES_TIPO[lembrete.tipo]}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">{lembrete.titulo}</h3>
                          {atrasado && <span className="text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded">Atrasado</span>}
                          {!lembrete.ativo && <span className="text-xs bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400 px-2 py-0.5 rounded">Inativo</span>}
                        </div>
                        {lembrete.mensagem && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{lembrete.mensagem}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>📅 {formatDate(lembrete.data_lembrete)}</span>
                          {!atrasado && diasRestantes >= 0 && (
                            <span className={diasRestantes <= 1 ? 'text-red-600 dark:text-red-400 font-semibold' : ''}>
                              {diasRestantes === 0 ? 'HOJE' : `Em ${diasRestantes} dia(s)`}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {!lembrete.lido && lembrete.ativo && (
                        <button
                          onClick={() => marcarComoLido(lembrete)}
                          className="text-green-600 hover:text-green-700 p-1 rounded hover:bg-green-50 dark:hover:bg-green-900/30"
                          title="Marcar como lido"
                        >
                          ✓
                        </button>
                      )}
                      <button
                        onClick={() => toggleAtivo(lembrete)}
                        className="text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                        title={lembrete.ativo ? 'Desativar' : 'Ativar'}
                      >
                        {lembrete.ativo ? '👁️' : '👁️‍🗨️'}
                      </button>
                      <button
                        onClick={() => abrirModal(lembrete)}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30"
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => excluirLembrete(lembrete)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30"
                        title="Excluir"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Modal de Criar/Editar Lembrete */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={e => e.target === e.currentTarget && fecharModal()}>
          <div className="bg-white dark:bg-gray-900 dark:border dark:border-gray-700 rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                {form.id ? '✏️ Editar Lembrete' : '📌 Novo Lembrete'}
              </h2>
              <button onClick={fecharModal} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label">Tipo</label>
                <select 
                  className="input" 
                  value={form.tipo || 'geral'} 
                  onChange={e => setForm({ ...form, tipo: e.target.value as TipoLembrete })}
                >
                  <option value="geral">📌 Geral</option>
                  <option value="vencimento">📅 Vencimento</option>
                  <option value="meta">🎯 Meta</option>
                </select>
              </div>

              <div>
                <label className="label">Título *</label>
                <input 
                  type="text"
                  className="input" 
                  value={form.titulo || ''} 
                  onChange={e => setForm({ ...form, titulo: e.target.value })}
                  placeholder="Ex: Pagar conta de luz"
                  autoFocus
                />
              </div>

              <div>
                <label className="label">Mensagem</label>
                <textarea
                  className="input"
                  rows={3}
                  value={form.mensagem || ''}
                  onChange={e => setForm({ ...form, mensagem: e.target.value })}
                  placeholder="Detalhes adicionais (opcional)"
                />
              </div>

              <div>
                <label className="label">Data do Lembrete *</label>
                <input 
                  type="date"
                  className="input" 
                  value={form.data_lembrete || ''} 
                  onChange={e => setForm({ ...form, data_lembrete: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Prioridade</label>
                <div className="flex gap-2">
                  {(['baixa', 'media', 'alta'] as Prioridade[]).map(p => (
                    <button
                      key={p}
                      onClick={() => setForm({ ...form, prioridade: p })}
                      className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        form.prioridade === p
                          ? p === 'alta' ? 'bg-red-500 text-white' :
                            p === 'media' ? 'bg-yellow-500 text-white' :
                            'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {p === 'alta' ? '🔴 Alta' : p === 'media' ? '🟡 Média' : '🔵 Baixa'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="ativo" 
                  checked={form.ativo !== false} 
                  onChange={e => setForm({ ...form, ativo: e.target.checked })}
                  className="w-4 h-4 accent-blue-500"
                />
                <label htmlFor="ativo" className="text-sm text-gray-700 dark:text-gray-300">
                  Lembrete ativo (será exibido nas notificações)
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button className="btn-secondary flex-1" onClick={fecharModal}>
                Cancelar
              </button>
              <button 
                className="btn-primary flex-1" 
                onClick={salvarLembrete}
                disabled={saving || !form.titulo || !form.data_lembrete}
              >
                {saving ? 'Salvando...' : form.id ? 'Salvar' : 'Criar Lembrete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
