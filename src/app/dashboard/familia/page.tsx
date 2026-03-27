'use client'
import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useMes } from '@/context/MesContext'
import { formatBRL } from '@/lib/utils'
import { MESES } from '@/types'

let cachedUserId: string | null = null

type Grupo = {
  id: string
  nome: string
  dono_id: string
  codigo_convite: string
  created_at: string
}

type Membro = {
  grupo_id: string
  user_id: string
  email_membro: string
  nome_membro: string
  papel: 'admin' | 'membro'
  joined_at: string
}

type ResumoMembro = {
  user_id: string
  nome: string
  email: string
  papel: string
  entradas: number
  saidas: number
  saldo: number
}

export default function FamiliaPage() {
  const supabase = createClient()
  const { mes, ano } = useMes()
  const userIdRef = useRef<string | null>(cachedUserId)

  const [loading, setLoading] = useState(true)
  const [grupo, setGrupo] = useState<Grupo | null>(null)
  const [membros, setMembros] = useState<Membro[]>([])
  const [resumos, setResumos] = useState<ResumoMembro[]>([])
  const [tab, setTab] = useState<'dashboard' | 'gerenciar'>('dashboard')

  // Formulários
  const [nomeGrupo, setNomeGrupo] = useState('')
  const [codigoEntrada, setCodigoEntrada] = useState('')
  const [criando, setCriando] = useState(false)
  const [entrando, setEntrando] = useState(false)
  const [copiado, setCopiado] = useState(false)
  const [msg, setMsg] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null)

  useEffect(() => {
    async function init() {
      if (!userIdRef.current) {
        const { data: { user } } = await supabase.auth.getUser()
        userIdRef.current = user?.id ?? null
        cachedUserId = user?.id ?? null
      }
      await carregarGrupo()
    }
    init()
  }, [])

  useEffect(() => {
    if (grupo && membros.length > 0) carregarResumos()
  }, [grupo, membros, mes, ano])

  async function getToken() {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token || ''
  }

  async function carregarGrupo() {
    setLoading(true)
    const token = await getToken()
    const res = await fetch('/api/familia', { headers: { Authorization: `Bearer ${token}` } })
    const json = await res.json()
    setGrupo(json.grupo)
    setMembros(json.membros || [])
    setLoading(false)
  }

  async function carregarResumos() {
    const uid = userIdRef.current
    if (!uid || !membros.length) return

    const novosResumos: ResumoMembro[] = []

    for (const membro of membros) {
      const mid = membro.user_id
      const [
        { data: entradas },
        { data: cartoes },
        { data: fixas },
        { data: combustivel },
      ] = await Promise.all([
        supabase.from('entradas').select('valor').eq('user_id', mid).eq('mes', mes).eq('ano', ano),
        supabase.from('cartoes').select('valor').eq('user_id', mid).eq('mes', mes).eq('ano', ano),
        supabase.from('contas_fixas').select('valor').eq('user_id', mid).eq('mes', mes).eq('ano', ano),
        supabase.from('combustivel').select('valor').eq('user_id', mid).eq('mes', mes).eq('ano', ano),
      ])

      const soma = (rows: any[] | null) => (rows || []).reduce((s, r) => s + Number(r.valor), 0)
      const totalEntradas = soma(entradas)
      const totalSaidas = soma(cartoes) + soma(fixas) + soma(combustivel)

      novosResumos.push({
        user_id: mid,
        nome: membro.nome_membro || membro.email_membro?.split('@')[0] || 'Membro',
        email: membro.email_membro || '',
        papel: membro.papel,
        entradas: totalEntradas,
        saidas: totalSaidas,
        saldo: totalEntradas - totalSaidas,
      })
    }

    setResumos(novosResumos)
  }

  async function criarGrupo() {
    if (!nomeGrupo.trim()) return
    setCriando(true)
    setMsg(null)
    const token = await getToken()
    const res = await fetch('/api/familia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ acao: 'criar', nome: nomeGrupo }),
    })
    const json = await res.json()
    if (!res.ok) {
      setMsg({ tipo: 'erro', texto: json.error })
    } else {
      setMsg({ tipo: 'ok', texto: '✅ Grupo criado com sucesso!' })
      await carregarGrupo()
    }
    setCriando(false)
  }

  async function entrarGrupo() {
    if (!codigoEntrada.trim()) return
    setEntrando(true)
    setMsg(null)
    const token = await getToken()
    const res = await fetch('/api/familia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ acao: 'entrar', codigo: codigoEntrada }),
    })
    const json = await res.json()
    if (!res.ok) {
      setMsg({ tipo: 'erro', texto: json.error })
    } else {
      setMsg({ tipo: 'ok', texto: '✅ Você entrou no grupo!' })
      await carregarGrupo()
    }
    setEntrando(false)
  }

  async function sairGrupo() {
    if (!grupo) return
    if (!confirm('Tem certeza que deseja sair do grupo?')) return
    const token = await getToken()
    await fetch('/api/familia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ acao: 'sair', grupoId: grupo.id }),
    })
    setGrupo(null)
    setMembros([])
    setResumos([])
  }

  async function removerMembro(membroId: string) {
    if (!grupo) return
    if (!confirm('Remover este membro do grupo?')) return
    const token = await getToken()
    await fetch('/api/familia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ acao: 'remover_membro', grupoId: grupo.id, membroId }),
    })
    await carregarGrupo()
  }

  function copiarCodigo() {
    if (!grupo) return
    navigator.clipboard.writeText(grupo.codigo_convite)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  const totalFamiliaEntradas = resumos.reduce((s, r) => s + r.entradas, 0)
  const totalFamiliaSaidas   = resumos.reduce((s, r) => s + r.saidas, 0)
  const saldoFamilia         = totalFamiliaEntradas - totalFamiliaSaidas

  const isDono = grupo?.dono_id === userIdRef.current

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse card h-32" />
        <div className="grid grid-cols-2 gap-4">
          <div className="animate-pulse card h-48" />
          <div className="animate-pulse card h-48" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">👨‍👩‍👧‍👦 Modo Família</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Orçamento compartilhado — {MESES[mes - 1]} {ano}
        </p>
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

      {/* Sem grupo: formulário para criar ou entrar */}
      {!grupo ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Criar grupo */}
          <div className="card">
            <h2 className="font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <span>➕</span> Criar Grupo Familiar
            </h2>
            <div className="space-y-3">
              <div>
                <label className="label">Nome do Grupo</label>
                <input
                  type="text"
                  value={nomeGrupo}
                  onChange={e => setNomeGrupo(e.target.value)}
                  placeholder="Ex: Família Fischer"
                  className="input"
                  onKeyDown={e => e.key === 'Enter' && criarGrupo()}
                />
              </div>
              <button
                onClick={criarGrupo}
                disabled={criando || !nomeGrupo.trim()}
                className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {criando ? '⏳ Criando...' : '✨ Criar Grupo'}
              </button>
            </div>
          </div>

          {/* Entrar em grupo */}
          <div className="card">
            <h2 className="font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <span>🔗</span> Entrar em Grupo Existente
            </h2>
            <div className="space-y-3">
              <div>
                <label className="label">Código de Convite</label>
                <input
                  type="text"
                  value={codigoEntrada}
                  onChange={e => setCodigoEntrada(e.target.value.toUpperCase())}
                  placeholder="Ex: A1B2C3D4"
                  className="input font-mono tracking-widest"
                  maxLength={8}
                  onKeyDown={e => e.key === 'Enter' && entrarGrupo()}
                />
              </div>
              <button
                onClick={entrarGrupo}
                disabled={entrando || !codigoEntrada.trim()}
                className="w-full py-2.5 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {entrando ? '⏳ Entrando...' : '🔗 Entrar no Grupo'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-800">
            {(['dashboard', 'gerenciar'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  tab === t
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {t === 'dashboard' ? '📊 Dashboard Familiar' : '⚙️ Gerenciar Grupo'}
              </button>
            ))}
          </div>

          {tab === 'dashboard' && (
            <div className="space-y-6">
              {/* Totais do grupo */}
              <div className="card bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                <h2 className="font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <span>🏠</span>
                  <span>{grupo.nome} — {MESES[mes - 1]} {ano}</span>
                </h2>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase mb-1">Total Entradas</p>
                    <p className="text-2xl font-bold text-green-600">{formatBRL(totalFamiliaEntradas)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase mb-1">Total Saídas</p>
                    <p className="text-2xl font-bold text-red-600">{formatBRL(totalFamiliaSaidas)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase mb-1">Saldo Familiar</p>
                    <p className={`text-2xl font-bold ${saldoFamilia >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatBRL(saldoFamilia)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Cards por membro */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {resumos.map(r => (
                  <div key={r.user_id} className="card hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                        {r.nome.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{r.nome}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{r.email}</p>
                      </div>
                      <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-semibold ${
                        r.papel === 'admin'
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                      }`}>
                        {r.papel === 'admin' ? '👑 Admin' : '👤 Membro'}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2">
                        <p className="text-xs text-green-600 dark:text-green-400">Entradas</p>
                        <p className="text-sm font-bold text-green-700 dark:text-green-300">{formatBRL(r.entradas)}</p>
                      </div>
                      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-2">
                        <p className="text-xs text-red-600 dark:text-red-400">Saídas</p>
                        <p className="text-sm font-bold text-red-700 dark:text-red-300">{formatBRL(r.saidas)}</p>
                      </div>
                      <div className={`${r.saldo >= 0 ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-orange-50 dark:bg-orange-900/20'} rounded-lg p-2`}>
                        <p className={`text-xs ${r.saldo >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>Saldo</p>
                        <p className={`text-sm font-bold ${r.saldo >= 0 ? 'text-blue-700 dark:text-blue-300' : 'text-orange-700 dark:text-orange-300'}`}>
                          {formatBRL(r.saldo)}
                        </p>
                      </div>
                    </div>

                    {/* Barra de progresso */}
                    {r.entradas > 0 && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Gastos</span>
                          <span>{((r.saidas / r.entradas) * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full transition-all ${r.saidas / r.entradas > 0.9 ? 'bg-red-500' : r.saidas / r.entradas > 0.7 ? 'bg-orange-500' : 'bg-green-500'}`}
                            style={{ width: `${Math.min(100, (r.saidas / r.entradas) * 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'gerenciar' && (
            <div className="space-y-4">
              {/* Info do grupo */}
              <div className="card">
                <h2 className="font-bold text-gray-900 dark:text-gray-100 mb-4">⚙️ Informações do Grupo</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{grupo.nome}</p>
                      <p className="text-xs text-gray-500">{membros.length} membro(s)</p>
                    </div>
                    {isDono && (
                      <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full font-semibold">
                        👑 Você é o dono
                      </span>
                    )}
                  </div>

                  {/* Código de convite */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-semibold uppercase tracking-wide">
                      Código de Convite
                    </p>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-mono font-bold text-blue-600 dark:text-blue-400 tracking-widest">
                        {grupo.codigo_convite}
                      </span>
                      <button
                        onClick={copiarCodigo}
                        className="ml-auto text-sm px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg font-semibold hover:bg-blue-200 transition-colors"
                      >
                        {copiado ? '✅ Copiado!' : '📋 Copiar'}
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Compartilhe este código com outros membros da família</p>
                  </div>
                </div>
              </div>

              {/* Lista de membros */}
              <div className="card">
                <h2 className="font-bold text-gray-900 dark:text-gray-100 mb-4">👥 Membros</h2>
                <div className="space-y-2">
                  {membros.map(m => (
                    <div key={m.user_id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                        {(m.nome_membro || m.email_membro || 'M').charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {m.nome_membro || m.email_membro?.split('@')[0]}
                        </p>
                        <p className="text-xs text-gray-500">{m.email_membro}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        m.papel === 'admin'
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}>
                        {m.papel}
                      </span>
                      {isDono && m.user_id !== userIdRef.current && (
                        <button
                          onClick={() => removerMembro(m.user_id)}
                          className="ml-2 text-xs text-red-500 hover:text-red-700 transition-colors p-1"
                          title="Remover membro"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Sair do grupo */}
              {!isDono && (
                <button
                  onClick={sairGrupo}
                  className="w-full py-2.5 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  🚪 Sair do Grupo
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
