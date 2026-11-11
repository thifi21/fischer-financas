'use client'
/**
 * Visão Geral (Opção 1 · Bento & Dias + Análise detalhada)
 * Usa os mesmos dados reais do Supabase; sem alterações estruturais no banco.
 */
import { useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useMes } from '@/context/MesContext'
import { useUser } from '@/context/UserContext'
import { MESES, ORDEM_CARTOES, type Cartao, type ContaFixa } from '@/types'
import VisaoGeralView, { type DadosVisao } from '@/components/visao/VisaoGeralView'
import DashboardAnalise from '@/components/DashboardAnalise'
import { Plus, Calendar } from 'lucide-react'

function somarMes(mes: number, ano: number, n: number) {
  const idx = (ano * 12 + (mes - 1)) + n
  return { mes: (idx % 12) + 1, ano: Math.floor(idx / 12) }
}

export default function VisaoGeralPage() {
  const supabase = useMemo(() => createClient(), [])
  const queryClient = useQueryClient()
  const { mes, ano } = useMes()
  const { userId, loading: userLoading } = useUser()
  const queryKey = ['visao-geral', userId, mes, ano]
  const [menuLancar, setMenuLancar] = useState(false)

  const { data, isLoading, error } = useQuery({
    queryKey,
    enabled: !userLoading && !!userId,
    staleTime: 1000 * 60,
    queryFn: async (): Promise<DadosVisao> => {
      const uid = userId!
      const periodos = [0, 1, 2].map(n => somarMes(mes, ano, n))
      const filtroPeriodos = periodos.map(p => `and(mes.eq.${p.mes},ano.eq.${p.ano})`).join(',')

      const [contasR, cartoesR, lancsR, entradasR, combR] = await Promise.all([
        supabase.from('contas_fixas').select('*').eq('user_id', uid).eq('mes', mes).eq('ano', ano),
        supabase.from('cartoes').select('*').eq('user_id', uid).or(filtroPeriodos),
        supabase.from('lancamentos_cartao').select('cartao_id, valor').eq('user_id', uid).or(filtroPeriodos),
        supabase.from('entradas').select('valor').eq('user_id', uid).eq('mes', mes).eq('ano', ano)
          .not('categoria', 'in', '(saldo_inicial,extrato_entrada,extrato_saida)'),
        supabase.from('combustivel').select('valor').eq('user_id', uid).eq('mes', mes).eq('ano', ano),
      ])
      const erro = contasR.error || cartoesR.error || entradasR.error || combR.error
      if (erro) throw erro

      // Total real de cada cartão = soma dos lançamentos
      const totais = new Map<string, number>()
      for (const l of lancsR.data || []) {
        totais.set(l.cartao_id, (totais.get(l.cartao_id) || 0) + Math.round(Number(l.valor || 0) * 100))
      }
      const cartoesTodos = ((cartoesR.data || []) as Cartao[]).map(c =>
        totais.has(c.id) ? { ...c, valor: totais.get(c.id)! / 100 } : c
      )

      const cartoesMes = cartoesTodos
        .filter(c => c.mes === mes && c.ano === ano)
        .sort((a, b) => (ORDEM_CARTOES[a.nome] ?? 99) - (ORDEM_CARTOES[b.nome] ?? 99))

      return {
        entradas: (entradasR.data || []).reduce((s, e) => s + Number(e.valor), 0),
        contas: (contasR.data || []) as ContaFixa[],
        cartoes: cartoesMes,
        combustivel: (combR.data || []).reduce((s, c) => s + Number(c.valor), 0),
        proximasFaturas: periodos.map(p => ({
          ...p,
          total: cartoesTodos.filter(c => c.mes === p.mes && c.ano === p.ano).reduce((s, c) => s + Number(c.valor), 0),
        })),
      }
    },
  })

  async function onToggle(tipo: 'conta' | 'cartao', id: string, pago: boolean) {
    const anterior = queryClient.getQueryData<DadosVisao>(queryKey)
    queryClient.setQueryData<DadosVisao>(queryKey, old => old && ({
      ...old,
      contas:  tipo === 'conta'  ? old.contas.map(c => c.id === id ? { ...c, pago } : c) : old.contas,
      cartoes: tipo === 'cartao' ? old.cartoes.map(c => c.id === id ? { ...c, pago } : c) : old.cartoes,
    }))
    const tabela = tipo === 'conta' ? 'contas_fixas' : 'cartoes'
    const { error: err } = await supabase.from(tabela).update({ pago }).eq('id', id)
    if (err) {
      queryClient.setQueryData(queryKey, anterior)
      toast.error('Não foi possível atualizar o pagamento.')
    } else {
      toast.success(pago ? 'Marcado como pago' : 'Pagamento desmarcado')
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {MESES[mes - 1]} <span className="text-slate-400 font-medium">{ano}</span>
          </h1>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-0.5">
            Visão geral e vencimentos da família Fischer
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200">
            <Calendar size={13} className="text-slate-400" />
            {MESES[mes - 1]}, {ano}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuLancar(v => !v)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider shadow-md shadow-blue-600/25 transition-all"
            >
              <Plus size={14} strokeWidth={2.5} />
              Adicionar
            </button>
            {menuLancar && (
              <div
                onMouseLeave={() => setMenuLancar(false)}
                className="absolute right-0 mt-2 w-52 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 z-30 text-xs font-semibold"
              >
                <Link href={`/dashboard/cartoes?mes=${mes}&ano=${ano}`} className="block px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200">
                  💳 Compra no Cartão
                </Link>
                <Link href={`/dashboard/contas-fixas?mes=${mes}&ano=${ano}`} className="block px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200">
                  🏠 Conta Fixa
                </Link>
                <Link href={`/dashboard/entradas?mes=${mes}&ano=${ano}`} className="block px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200">
                  💵 Entrada / Salário
                </Link>
                <Link href={`/dashboard/combustivel?mes=${mes}&ano=${ano}`} className="block px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200">
                  ⛽ Abastecimento
                </Link>
                <Link href={`/dashboard/open-finance?mes=${mes}&ano=${ano}`} className="block px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-blue-600 dark:text-blue-400 border-t border-slate-100 dark:border-slate-800 mt-1 pt-2">
                  📄 Importar Extrato / Fatura
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {isLoading || userLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {['lg:col-span-8 h-56', 'lg:col-span-4 h-56', 'lg:col-span-5 h-80', 'lg:col-span-3 h-80'].map(c => (
            <div key={c} className={`rounded-3xl bg-slate-100 dark:bg-slate-800/50 animate-pulse ${c}`} />
          ))}
        </div>
      ) : error || !data ? (
        <div className="rounded-3xl bg-rose-50 border border-rose-100 p-8 text-center text-rose-600">
          Erro ao carregar a visão geral.
        </div>
      ) : (
        <VisaoGeralView dados={data} mes={mes} ano={ano} onToggle={onToggle} />
      )}

      <div className="pt-2 border-t border-slate-200/70 dark:border-slate-800">
        <div className="pt-6">
          <DashboardAnalise embedded />
        </div>
      </div>
    </div>
  )
}
