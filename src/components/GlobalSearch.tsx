'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { formatBRL } from '@/lib/utils'
import { MESES } from '@/types'
import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'

type ResultadoBusca = {
  id: string
  tipo: 'cartao' | 'conta_fixa' | 'combustivel' | 'entrada'
  descricao: string
  valor: number
  mes: number
  ano: number
  extra?: string
}

const ICONE_TIPO: Record<string, string> = {
  cartao: '💳',
  conta_fixa: '🏠',
  combustivel: '⛽',
  entrada: '💵',
}

const LABEL_TIPO: Record<string, string> = {
  cartao: 'Cartão de Crédito',
  conta_fixa: 'Conta Fixa',
  combustivel: 'Combustível',
  entrada: 'Entrada / Salário',
}

const HREF_TIPO: Record<string, string> = {
  cartao: '/dashboard/cartoes',
  conta_fixa: '/dashboard/contas-fixas',
  combustivel: '/dashboard/combustivel',
  entrada: '/dashboard/entradas',
}

interface GlobalSearchProps {
  isOpen: boolean
  onClose: () => void
}

export default function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const supabase = createClient()
  const [query, setQuery] = useState('')
  const [resultados, setResultados] = useState<ResultadoBusca[]>([])
  const [carregando, setCarregando] = useState(false)
  const [selecionado, setSelecionado] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const userIdRef = useRef<string | null>(null)

  // Focar ao abrir
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setResultados([])
      setSelecionado(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  // Fechar com Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  // Busca debounced
  const buscar = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResultados([])
      return
    }
    setCarregando(true)

    if (!userIdRef.current) {
      const { data: { user } } = await supabase.auth.getUser()
      userIdRef.current = user?.id ?? null
    }
    const uid = userIdRef.current
    if (!uid) { setCarregando(false); return }

    const termo = q.trim()

    const [
      { data: lancamentos },
      { data: fixas },
      { data: combustivel },
      { data: entradas },
    ] = await Promise.all([
      supabase
        .from('lancamentos_cartao')
        .select('id, local, valor, mes, ano, cartao_id')
        .eq('user_id', uid)
        .ilike('local', `%${termo}%`)
        .order('ano', { ascending: false })
        .order('mes', { ascending: false })
        .limit(5),
      supabase
        .from('contas_fixas')
        .select('id, descricao, valor, mes, ano, categoria')
        .eq('user_id', uid)
        .ilike('descricao', `%${termo}%`)
        .order('ano', { ascending: false })
        .order('mes', { ascending: false })
        .limit(5),
      supabase
        .from('combustivel')
        .select('id, descricao, valor, mes, ano, data_abastecimento')
        .eq('user_id', uid)
        .or(`descricao.ilike.%${termo}%`)
        .order('ano', { ascending: false })
        .order('mes', { ascending: false })
        .limit(5),
      supabase
        .from('entradas')
        .select('id, descricao, valor, mes, ano, categoria')
        .eq('user_id', uid)
        .ilike('descricao', `%${termo}%`)
        .order('ano', { ascending: false })
        .order('mes', { ascending: false })
        .limit(5),
    ])

    const res: ResultadoBusca[] = [
      ...(lancamentos || []).map((l: any) => ({
        id: l.id,
        tipo: 'cartao' as const,
        descricao: l.local,
        valor: l.valor,
        mes: l.mes,
        ano: l.ano,
      })),
      ...(fixas || []).map((f: any) => ({
        id: f.id,
        tipo: 'conta_fixa' as const,
        descricao: f.descricao,
        valor: f.valor,
        mes: f.mes,
        ano: f.ano,
        extra: f.categoria,
      })),
      ...(combustivel || []).filter((c: any) => c.descricao).map((c: any) => ({
        id: c.id,
        tipo: 'combustivel' as const,
        descricao: c.descricao || `Abastecimento ${c.data_abastecimento || ''}`,
        valor: c.valor,
        mes: c.mes,
        ano: c.ano,
      })),
      ...(entradas || []).map((e: any) => ({
        id: e.id,
        tipo: 'entrada' as const,
        descricao: e.descricao,
        valor: e.valor,
        mes: e.mes,
        ano: e.ano,
        extra: e.categoria,
      })),
    ]

    setResultados(res)
    setSelecionado(0)
    setCarregando(false)
  }, [supabase])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => buscar(query), 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, buscar])

  // Navegação por teclado
  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelecionado(prev => Math.min(prev + 1, resultados.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelecionado(prev => Math.max(prev - 1, 0))
    }
  }

  // Destacar termo na descrição
  function highlight(texto: string, termo: string) {
    if (!termo.trim()) return texto
    const regex = new RegExp(`(${termo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const partes = texto.split(regex)
    return partes.map((parte, i) =>
      regex.test(parte)
        ? <mark key={i} className="bg-yellow-200 dark:bg-yellow-800/60 text-yellow-900 dark:text-yellow-200 rounded px-0.5">{parte}</mark>
        : parte
    )
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
        >
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-slate-700/50 overflow-hidden"
          >
            {/* Input de busca */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-slate-800">
              <span className="text-xl text-gray-400 shrink-0">🔍</span>
              <input
                ref={inputRef}
                id="global-search-input"
                type="text"
                placeholder="Buscar lançamentos, contas, entradas..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                className="flex-1 text-base bg-transparent outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600"
                autoComplete="off"
              />
              {carregando && (
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin shrink-0" />
              )}
              <kbd
                onClick={onClose}
                className="hidden sm:flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-gray-400 bg-gray-100 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
              >
                ESC
              </kbd>
            </div>

            {/* Resultados */}
            <div className="max-h-[60vh] overflow-y-auto">
              {query.trim().length >= 2 && !carregando && resultados.length === 0 && (
                <div className="py-12 text-center text-gray-400 dark:text-gray-600">
                  <p className="text-3xl mb-3">🔍</p>
                  <p className="font-medium">Nenhum resultado para <strong className="text-gray-600 dark:text-gray-400">&quot;{query}&quot;</strong></p>
                </div>
              )}

              {query.trim().length < 2 && (
                <div className="py-10 text-center text-gray-400 dark:text-gray-600">
                  <p className="text-2xl mb-2">💡</p>
                  <p className="text-sm font-medium">Digite ao menos 2 caracteres para buscar</p>
                  <p className="text-xs mt-1 opacity-70">Busca em lançamentos de cartão, contas fixas, combustível e entradas</p>
                </div>
              )}

              {resultados.length > 0 && (
                <div className="p-2">
                  {resultados.map((r, idx) => (
                    <Link
                      key={r.id}
                      href={`${HREF_TIPO[r.tipo]}?mes=${r.mes}&ano=${r.ano}`}
                      onClick={onClose}
                    >
                      <div
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors ${
                          idx === selecionado
                            ? 'bg-blue-50 dark:bg-blue-900/30'
                            : 'hover:bg-gray-50 dark:hover:bg-slate-800/50'
                        }`}
                        onMouseEnter={() => setSelecionado(idx)}
                      >
                        <span className="text-xl shrink-0">{ICONE_TIPO[r.tipo]}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {highlight(r.descricao, query)}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-600">
                              {LABEL_TIPO[r.tipo]}
                            </span>
                            <span className="text-[10px] text-gray-300 dark:text-gray-700">•</span>
                            <span className="text-[10px] text-gray-400 dark:text-gray-600">
                              {MESES[r.mes - 1]}/{r.ano}
                            </span>
                            {r.extra && (
                              <>
                                <span className="text-[10px] text-gray-300 dark:text-gray-700">•</span>
                                <span className="text-[10px] text-gray-400 dark:text-gray-600">{r.extra}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300 shrink-0">
                          {formatBRL(r.valor)}
                        </span>
                        <span className="text-gray-300 dark:text-gray-700 shrink-0 text-xs">→</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Rodapé */}
              {resultados.length > 0 && (
                <div className="px-5 py-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-gray-400 dark:text-gray-600">
                  <span>{resultados.length} resultado(s) encontrado(s)</span>
                  <span>↑↓ navegar • Enter abrir • Esc fechar</span>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
