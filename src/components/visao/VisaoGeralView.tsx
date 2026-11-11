'use client'
/**
 * Visão Geral (beta) — novo layout "bento" do dashboard.
 * Mistura os cards práticos (saldo previsto, contas a pagar, cartões, moradia)
 * com a análise detalhada já existente (DashboardClientView).
 */
import { useMemo, useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import { MESES, LOGOS_CARTOES, type Cartao, type ContaFixa } from '@/types'
import { formatBRL } from '@/lib/utils'
import { Money } from './Money'
import {
  Wallet, CalendarClock, CreditCard, Home, Check, ArrowUpRight, ArrowDownRight,
  ChevronLeft, ChevronRight, Fuel, AlertTriangle,
} from 'lucide-react'

export const CATEGORIA_MORADIA = 'Contas Fixas de Casa'
const REFERENCIA_MORADIA = 30 // % recomendado da renda

export type FaturaFutura = { mes: number; ano: number; total: number }

export type ParcelaEncerrando = {
  id: string
  descricao: string
  valor: number
  parcela: string
  origem: string
}

export type DadosVisao = {
  entradas: number
  entradasLista?: { id: string; descricao: string; valor: number; categoria: string }[]
  contas: ContaFixa[]
  cartoes: Cartao[]
  combustivel: number
  proximasFaturas: FaturaFutura[]
  parcelasEncerrando?: ParcelaEncerrando[]
  mesAnterior?: { entradas: number; despesas: number; saldo: number }
  resumoAnual?: { mes: number; entradas: number; saidas: number }[]
  aporteSugerido?: number
}

type ItemPagar = {
  id: string
  tipo: 'conta' | 'cartao'
  nome: string
  detalhe: string
  valor: number
  dia: number | null
  pago: boolean
}

const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0, transition: { ease: [0.22, 1, 0.36, 1] } },
}

// ── Helpers ─────────────────────────────────────────────────────
function diaDe(venc: string | null | undefined): number | null {
  if (!venc) return null
  const ddmm = venc.match(/^(\d{1,2})\/\d{1,2}/)
  if (ddmm) return Number(ddmm[1])
  const iso = venc.split('T')[0].split(' ')[0].split('-')
  if (iso.length === 3) return Number(iso[2])
  return null
}

function pct(parte: number, total: number) {
  return total > 0 ? (parte / total) * 100 : 0
}

function Tile({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return (
    <motion.section
      variants={item}
      className={`rounded-3xl bg-white dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800
                  shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.12)] p-5 sm:p-6 ${className}`}
    >
      {children}
    </motion.section>
  )
}

function TileHeader({ titulo, sub, icon: Icon, cor }: {
  titulo: string; sub?: React.ReactNode; icon: React.ElementType; cor: string
}) {
  return (
    <div className="flex items-start justify-between gap-3 mb-3">
      <div>
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{titulo}</h2>
        {sub && <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{sub}</div>}
      </div>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${cor}`}>
        <Icon size={26} strokeWidth={1.6} />
      </div>
    </div>
  )
}

// ── Saldo previsto ──────────────────────────────────────────────
function SaldoPrevisto({ d }: { d: DadosVisao }) {
  const moradia   = d.contas.filter(c => c.categoria === CATEGORIA_MORADIA).reduce((s, c) => s + Number(c.valor), 0)
  const outras    = d.contas.filter(c => c.categoria !== CATEGORIA_MORADIA).reduce((s, c) => s + Number(c.valor), 0)
  const cartoes   = d.cartoes.reduce((s, c) => s + Number(c.valor), 0)
  const comb      = d.combustivel
  const saidas    = moradia + outras + cartoes + comb
  const saldo     = d.entradas - saidas
  const base      = Math.max(d.entradas, saidas)
  const livrePct  = pct(saldo, d.entradas)

  const segmentos = [
    { label: 'Moradia',             valor: moradia, cor: 'bg-blue-900',    dot: 'bg-blue-900' },
    { label: 'Outras contas fixas', valor: outras,  cor: 'bg-blue-600',    dot: 'bg-blue-600' },
    { label: 'Cartões',             valor: cartoes, cor: 'bg-indigo-400',  dot: 'bg-indigo-400' },
    { label: 'Combustível',         valor: comb,    cor: 'bg-amber-400',   dot: 'bg-amber-400' },
    { label: saldo >= 0 ? 'Sobra' : 'Falta', valor: Math.abs(saldo), cor: saldo >= 0 ? 'bg-emerald-500' : 'bg-rose-500', dot: saldo >= 0 ? 'bg-emerald-500' : 'bg-rose-500' },
  ]

  return (
    <Tile className="lg:col-span-8">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Saldo previsto</h2>
          <div className="flex flex-wrap items-end gap-x-5 gap-y-2 mt-2">
            <Money value={saldo} size="xl" className={saldo >= 0 ? 'text-slate-900 dark:text-white' : 'text-rose-600 dark:text-rose-400'} />
            {d.entradas > 0 && (
              <div className="pb-1.5">
                <div className={`flex items-center gap-1 text-xs font-semibold ${saldo >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {saldo >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {Math.abs(livrePct).toFixed(0)}% da renda {saldo >= 0 ? 'livre' : 'acima do ganho'}
                </div>
                <div className="text-xs text-slate-400 dark:text-slate-500">valor estimado após pagar todas as contas</div>
              </div>
            )}
          </div>
        </div>
        <div className="hidden sm:flex w-20 h-20 rounded-3xl items-center justify-center bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-500/20 dark:to-emerald-500/5 text-emerald-600 shadow-inner">
          <Wallet size={38} strokeWidth={1.5} />
        </div>
      </div>

      {/* Barra empilhada */}
      <div className="flex h-3 w-full rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 mt-6 gap-0.5">
        {segmentos.filter(s => s.valor > 0).map(s => (
          <motion.div
            key={s.label}
            initial={{ width: 0 }}
            animate={{ width: `${pct(s.valor, base)}%` }}
            transition={{ duration: 1, ease: 'circOut' }}
            className={`h-full ${s.cor}`}
            title={`${s.label}: ${formatBRL(s.valor)}`}
          />
        ))}
      </div>

      {/* Legenda */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-4 gap-y-3 mt-4">
        <div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500">Entradas</div>
          <div className="text-sm font-semibold text-slate-800 dark:text-slate-100 tabular-nums">{formatBRL(d.entradas)}</div>
        </div>
        {segmentos.map(s => (
          <div key={s.label}>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
              <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />{s.label}
            </div>
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-100 tabular-nums">
              {s.label === 'Sobra' ? '= ' : '− '}{formatBRL(s.valor)}
              <span className="text-[10px] font-medium text-slate-400 ml-1">· {pct(s.valor, d.entradas).toFixed(0)}%</span>
            </div>
          </div>
        ))}
      </div>
    </Tile>
  )
}

// ── Contas a pagar ──────────────────────────────────────────────
function ContasAPagar({ d, mes, ano, onToggle }: {
  d: DadosVisao; mes: number; ano: number
  onToggle: (tipo: 'conta' | 'cartao', id: string, pago: boolean) => void
}) {
  const [diaSel, setDiaSel] = useState<number | 'todos'>('todos')

  const itens: ItemPagar[] = useMemo(() => {
    const lista: ItemPagar[] = [
      ...d.contas.map(c => ({
        id: c.id, tipo: 'conta' as const, nome: c.descricao, detalhe: c.categoria,
        valor: Number(c.valor), dia: diaDe(c.data_vencimento), pago: c.pago,
      })),
      ...d.cartoes.filter(c => Number(c.valor) > 0).map(c => ({
        id: c.id, tipo: 'cartao' as const, nome: `Fatura ${c.nome}`, detalhe: 'Cartão de crédito',
        valor: Number(c.valor), dia: diaDe(c.vencimento), pago: c.pago,
      })),
    ]
    return lista.sort((a, b) => (a.dia ?? 99) - (b.dia ?? 99))
  }, [d])

  const dias = useMemo(() => {
    const m = new Map<number, { total: number; pendentes: number }>()
    for (const i of itens) {
      if (i.dia == null) continue
      const cur = m.get(i.dia) || { total: 0, pendentes: 0 }
      cur.total++
      if (!i.pago) cur.pendentes++
      m.set(i.dia, cur)
    }
    return Array.from(m.entries()).sort((a, b) => a[0] - b[0])
  }, [itens])

  const pendentes   = itens.filter(i => !i.pago)
  const totalAberto = pendentes.reduce((s, i) => s + i.valor, 0)
  const pagas       = itens.length - pendentes.length

  // Próximo vencimento pendente (dias a partir de hoje)
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0)
  const proximo = pendentes.find(i => i.dia != null)
  const diasAte = proximo?.dia != null
    ? Math.round((new Date(ano, mes - 1, proximo.dia).getTime() - hoje.getTime()) / 86_400_000)
    : null

  const visiveis = diaSel === 'todos' ? itens : itens.filter(i => i.dia === diaSel)

  return (
    <Tile className="lg:col-span-4 lg:row-span-3 flex flex-col">
      <TileHeader
        titulo="Contas a pagar"
        sub={proximo?.dia ? `próximo vencimento · dia ${String(proximo.dia).padStart(2, '0')}` : 'nenhum vencimento pendente'}
        icon={CalendarClock}
        cor="bg-gradient-to-br from-sky-100 to-blue-50 text-blue-600 dark:from-blue-500/20 dark:to-blue-500/5"
      />
      <Money value={totalAberto} size="lg" className="text-slate-900 dark:text-white" />
      <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
        {diasAte != null && (diasAte < 0 ? <span className="text-rose-500 font-semibold">vencido há {Math.abs(diasAte)} dia(s) · </span>
          : diasAte === 0 ? <span className="text-amber-500 font-semibold">vence hoje · </span>
          : <>em {diasAte} dia(s) · </>)}
        {pagas} de {itens.length} pagas
      </div>

      {/* Chips de dias */}
      {dias.length > 0 && (
        <div className="flex gap-2 mt-4 overflow-x-auto pb-1 -mx-1 px-1">
          <button
            onClick={() => setDiaSel('todos')}
            className={`shrink-0 px-3 h-12 rounded-xl text-xs font-semibold border transition-all ${diaSel === 'todos'
              ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-600/25'
              : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-blue-300'}`}
          >Todos</button>
          {dias.map(([dia, info]) => (
            <button
              key={dia}
              onClick={() => setDiaSel(dia)}
              className={`shrink-0 w-12 h-12 rounded-xl border flex flex-col items-center justify-center transition-all ${diaSel === dia
                ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-600/25'
                : info.pendentes === 0
                  ? 'border-emerald-200 dark:border-emerald-800 text-emerald-600'
                  : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-blue-300'}`}
            >
              <span className="text-sm font-bold leading-none">{String(dia).padStart(2, '0')}</span>
              <span className="flex gap-0.5 mt-1">
                {Array.from({ length: Math.min(info.total, 5) }).map((_, k) => (
                  <span key={k} className={`w-1 h-1 rounded-full ${diaSel === dia ? 'bg-white/80' : k < info.total - info.pendentes ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                ))}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Checklist */}
      <ul className="mt-3 divide-y divide-slate-100 dark:divide-slate-800 overflow-y-auto max-h-[420px] -mx-1 px-1 flex-1">
        {visiveis.length === 0 && (
          <li className="py-8 text-center text-sm text-slate-400">Nenhuma conta para {MESES[mes - 1]}</li>
        )}
        {visiveis.map(i => (
          <li key={`${i.tipo}-${i.id}`} className="flex items-center gap-3 py-2.5">
            <button
              onClick={() => onToggle(i.tipo, i.id, !i.pago)}
              aria-label={i.pago ? `Desmarcar ${i.nome}` : `Marcar ${i.nome} como paga`}
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${i.pago
                ? 'bg-emerald-500 border-emerald-500 text-white'
                : 'border-slate-300 dark:border-slate-600 hover:border-emerald-400'}`}
            >
              {i.pago && <Check size={12} strokeWidth={3} />}
            </button>
            <div className="min-w-0 flex-1">
              <div className={`text-sm truncate ${i.pago ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>{i.nome}</div>
              <div className="text-[11px] text-slate-400 truncate">
                {i.dia ? `dia ${String(i.dia).padStart(2, '0')} · ` : ''}{i.detalhe}
              </div>
            </div>
            <div className={`text-sm font-semibold tabular-nums ${i.pago ? 'text-slate-400' : 'text-slate-800 dark:text-slate-100'}`}>{formatBRL(i.valor)}</div>
          </li>
        ))}
      </ul>
    </Tile>
  )
}

// ── Cartões ─────────────────────────────────────────────────────
function CartaoVisual({ c }: { c: Cartao }) {
  const logo = LOGOS_CARTOES[c.nome]
  const bg = logo?.bg ?? '#1e293b'
  return (
    <div
      className="relative shrink-0 w-[250px] h-[150px] rounded-2xl p-4 text-white overflow-hidden snap-start shadow-lg"
      style={{ background: `linear-gradient(135deg, ${bg} 0%, ${bg}cc 55%, #0f172a 140%)` }}
    >
      <div className="absolute -right-10 -top-10 w-36 h-36 rounded-full bg-white/10" />
      <div className="absolute -right-4 bottom-[-50px] w-36 h-36 rounded-full bg-white/5" />
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          {logo?.src && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo.src} alt="" className="w-6 h-6 rounded-md bg-white object-contain p-0.5" />
          )}
          <span className="text-sm font-semibold truncate">{c.nome}</span>
        </div>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${c.pago ? 'bg-emerald-400/90 text-emerald-950' : 'bg-white/20'}`}>
          {c.pago ? 'Paga' : 'Aberta'}
        </span>
      </div>
      <div className="relative mt-3 w-8 h-6 rounded-md bg-gradient-to-br from-amber-200 to-amber-400 opacity-90" />
      <div className="relative mt-3 flex items-end justify-between">
        <div>
          <div className="text-[9px] uppercase tracking-wider opacity-60">Vence</div>
          <div className="text-xs font-semibold">{diaDe(c.vencimento) ? `dia ${String(diaDe(c.vencimento)).padStart(2, '0')}` : '—'}</div>
        </div>
        {c.melhor_data_compra && (
          <div>
            <div className="text-[9px] uppercase tracking-wider opacity-60">Melhor compra</div>
            <div className="text-xs font-semibold">{c.melhor_data_compra}</div>
          </div>
        )}
        <div className="text-right">
          <div className="text-[9px] uppercase tracking-wider opacity-60">Fatura</div>
          <div className="text-sm font-bold tabular-nums">{formatBRL(Number(c.valor))}</div>
        </div>
      </div>
    </div>
  )
}

function Cartoes({ d, mes }: { d: DadosVisao; mes: number }) {
  const total = d.cartoes.reduce((s, c) => s + Number(c.valor), 0)
  const comValor = d.cartoes.filter(c => Number(c.valor) > 0)
  const max = Math.max(...d.proximasFaturas.map(f => f.total), 1)
  const [scrollEl, setScrollEl] = useState<HTMLDivElement | null>(null)
  const rolar = (dir: number) => scrollEl?.scrollBy({ left: dir * 266, behavior: 'smooth' })

  return (
    <Tile className="lg:col-span-5">
      <TileHeader
        titulo="Cartões"
        sub={`Faturas de ${MESES[mes - 1].toLowerCase()} · ${comValor.length} com valor`}
        icon={CreditCard}
        cor="bg-gradient-to-br from-indigo-100 to-sky-50 text-indigo-600 dark:from-indigo-500/20 dark:to-indigo-500/5"
      />
      <div className="flex items-center justify-between">
        <Money value={total} size="lg" className="text-slate-900 dark:text-white" />
        {comValor.length > 1 && (
          <div className="flex gap-1">
            <button onClick={() => rolar(-1)} aria-label="Cartão anterior" className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"><ChevronLeft size={15} /></button>
            <button onClick={() => rolar(1)}  aria-label="Próximo cartão"  className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"><ChevronRight size={15} /></button>
          </div>
        )}
      </div>

      <div ref={setScrollEl} className="flex gap-4 overflow-x-auto snap-x snap-mandatory mt-4 pb-2 -mx-1 px-1 scrollbar-none">
        {comValor.length === 0
          ? <div className="w-full py-10 text-center text-sm text-slate-400">Nenhuma fatura neste mês</div>
          : comValor.map(c => <CartaoVisual key={c.id} c={c} />)}
      </div>

      {/* Próximas faturas */}
      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-4 mb-2">Próximas faturas</div>
      <div className="grid grid-cols-3 gap-2">
        {d.proximasFaturas.map((f, idx) => (
          <div key={`${f.mes}-${f.ano}`} className={`rounded-xl border p-3 flex flex-col justify-end h-28 relative overflow-hidden ${idx === 0
            ? 'border-blue-400 bg-blue-50/60 dark:bg-blue-500/10'
            : 'border-slate-200 dark:border-slate-700'}`}>
            <div className="absolute top-2 inset-x-0 text-center text-xs font-semibold text-slate-600 dark:text-slate-300">
              {MESES[f.mes - 1].slice(0, 3)}{f.ano !== d.proximasFaturas[0].ano ? ` ${String(f.ano).slice(2)}` : ''}
            </div>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${Math.max(6, pct(f.total, max) * 0.45)}%` }}
              transition={{ duration: 0.8, ease: 'circOut' }}
              className={`absolute bottom-0 inset-x-0 ${idx === 0 ? 'bg-blue-200/70 dark:bg-blue-500/25' : 'bg-slate-100 dark:bg-slate-800'}`}
            />
            <div className={`relative text-center text-xs font-bold tabular-nums ${idx === 0 ? 'text-blue-700 dark:text-blue-300' : 'text-slate-500'}`}>
              {formatBRL(f.total)}
            </div>
          </div>
        ))}
      </div>
    </Tile>
  )
}

// ── Moradia ─────────────────────────────────────────────────────
function Moradia({ d }: { d: DadosVisao }) {
  const contas = d.contas.filter(c => c.categoria === CATEGORIA_MORADIA).sort((a, b) => Number(b.valor) - Number(a.valor))
  const total  = contas.reduce((s, c) => s + Number(c.valor), 0)
  const p      = pct(total, d.entradas)
  const ok     = p <= REFERENCIA_MORADIA

  return (
    <Tile className="lg:col-span-3">
      <TileHeader
        titulo="Moradia"
        sub="Quanto a casa custa por mês"
        icon={Home}
        cor="bg-gradient-to-br from-amber-100 to-orange-50 text-amber-600 dark:from-amber-500/20 dark:to-amber-500/5"
      />
      <Money value={total} size="lg" className="text-slate-900 dark:text-white" />
      {d.entradas > 0 && (
        <div className={`text-xs font-semibold mt-1 flex items-center gap-1 ${ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600'}`}>
          {ok ? <Check size={13} /> : <AlertTriangle size={13} />}
          {p.toFixed(0)}% da renda <span className="font-normal text-slate-400">· referência até {REFERENCIA_MORADIA}%</span>
        </div>
      )}

      <div className="relative mt-4">
        <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, p)}%` }}
            transition={{ duration: 1, ease: 'circOut' }}
            className={`h-full rounded-full ${ok ? 'bg-emerald-500' : 'bg-amber-500'}`}
          />
        </div>
        <div className="absolute -top-1 w-0.5 bg-slate-700 dark:bg-slate-300 rounded" style={{ left: `${REFERENCIA_MORADIA}%`, height: 18 }} />
        <div className="flex justify-between text-[10px] text-slate-400 mt-1">
          <span>0%</span><span style={{ marginLeft: `${REFERENCIA_MORADIA - 10}%` }}>{REFERENCIA_MORADIA}%</span><span>100%</span>
        </div>
      </div>

      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-4 mb-2">O que entra na conta</div>
      <ul className="space-y-2">
        {contas.length === 0 && <li className="text-sm text-slate-400">Sem contas em &quot;{CATEGORIA_MORADIA}&quot;</li>}
        {contas.slice(0, 7).map(c => (
          <li key={c.id} className="flex items-center justify-between gap-2 text-sm">
            <span className="truncate text-slate-600 dark:text-slate-300">{c.descricao}</span>
            <span className="font-semibold tabular-nums text-slate-800 dark:text-slate-100">{formatBRL(Number(c.valor))}</span>
          </li>
        ))}
        {contas.length > 7 && <li className="text-xs text-slate-400">+ {contas.length - 7} conta(s)</li>}
      </ul>
    </Tile>
  )
}

// ── Mini resumo (entradas / combustível) ────────────────────────
function MiniResumo({ d }: { d: DadosVisao }) {
  const outras = d.contas.filter(c => c.categoria !== CATEGORIA_MORADIA)
  const porCategoria = Object.entries(
    outras.reduce<Record<string, number>>((acc, c) => { acc[c.categoria] = (acc[c.categoria] || 0) + Number(c.valor); return acc }, {})
  ).sort((a, b) => b[1] - a[1])

  return (
    <Tile className="lg:col-span-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Outras contas fixas</h2>
          <ul className="mt-3 space-y-2">
            {porCategoria.length === 0 && <li className="text-sm text-slate-400">Nenhuma</li>}
            {porCategoria.slice(0, 6).map(([cat, v]) => (
              <li key={cat} className="flex justify-between gap-2 text-sm">
                <span className="truncate text-slate-600 dark:text-slate-300">{cat}</span>
                <span className="font-semibold tabular-nums text-slate-800 dark:text-slate-100">{formatBRL(v)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5"><Fuel size={14} className="text-amber-500" />Combustível</h2>
          <div className="mt-3"><Money value={d.combustivel} size="md" className="text-slate-900 dark:text-white" /></div>
          <div className="text-xs text-slate-400 mt-1">{pct(d.combustivel, d.entradas).toFixed(0)}% da renda</div>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5"><ArrowUpRight size={14} className="text-emerald-500" />Entradas do mês</h2>
          <div className="mt-3"><Money value={d.entradas} size="md" className="text-slate-900 dark:text-white" /></div>
          <div className="text-xs text-slate-400 mt-1">salários e outras receitas</div>
        </div>
      </div>
    </Tile>
  )
}

// ── View principal ──────────────────────────────────────────────
export default function VisaoGeralView({ dados, mes, ano, onToggle }: {
  dados: DadosVisao; mes: number; ano: number
  onToggle: (tipo: 'conta' | 'cartao', id: string, pago: boolean) => void
}) {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
      className="grid grid-cols-1 lg:grid-cols-12 gap-5 auto-rows-min"
    >
      <SaldoPrevisto d={dados} />
      <ContasAPagar d={dados} mes={mes} ano={ano} onToggle={onToggle} />
      <Cartoes d={dados} mes={mes} />
      <Moradia d={dados} />
      <MiniResumo d={dados} />
    </motion.div>
  )
}
