'use client'
import { useMemo } from 'react'
import Link from 'next/link'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { CalendarClock, CheckCircle2, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useUser } from '@/context/UserContext'
import { useMes } from '@/context/MesContext'
import { formatBRL } from '@/lib/utils'
import { Card } from '@/components/ui/Card'

type Venc = { id: string; descricao: string; valor: number; data_vencimento: string }

const DIAS_JANELA = 7

function isoLocal(d: Date) {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

/** Widget aditivo: contas fixas não pagas vencidas ou a vencer nos próximos 7 dias. */
export default function ProximosVencimentos() {
  const supabase = useMemo(() => createClient(), [])
  const queryClient = useQueryClient()
  const { userId } = useUser()
  const { mes, ano } = useMes()

  const hoje = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d }, [])
  const limite = useMemo(() => { const d = new Date(hoje); d.setDate(d.getDate() + DIAS_JANELA); return isoLocal(d) }, [hoje])
  const hojeIso = isoLocal(hoje)

  const { data: itens = [] } = useQuery({
    queryKey: ['proximos-vencimentos', userId, hojeIso],
    enabled: !!userId,
    staleTime: 1000 * 60,
    queryFn: async (): Promise<Venc[]> => {
      const { data, error } = await supabase
        .from('contas_fixas')
        .select('id, descricao, valor, data_vencimento')
        .eq('user_id', userId!)
        .eq('pago', false)
        .not('data_vencimento', 'is', null)
        .lte('data_vencimento', limite)
        .order('data_vencimento')
        .limit(8)
      if (error) throw error
      return (data ?? []) as Venc[]
    },
  })

  async function marcarPago(item: Venc) {
    const { error } = await supabase.from('contas_fixas').update({ pago: true }).eq('id', item.id)
    if (error) { toast.error('Não foi possível marcar como paga.'); return }
    toast.success(`"${item.descricao}" marcada como paga`, {
      action: {
        label: 'Desfazer',
        onClick: async () => {
          await supabase.from('contas_fixas').update({ pago: false }).eq('id', item.id)
          queryClient.invalidateQueries({ queryKey: ['proximos-vencimentos'] })
        },
      },
    })
    queryClient.invalidateQueries({ queryKey: ['proximos-vencimentos'] })
    queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
  }

  if (itens.length === 0) return null

  return (
    <Card className="mb-7">
      <h2 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-l-4 border-rose-500 pl-3">
        <CalendarClock size={14} aria-hidden /> Próximos vencimentos ({DIAS_JANELA} dias)
      </h2>
      <ul className="divide-y divide-slate-100 dark:divide-slate-800">
        {itens.map(item => {
          const venc = new Date(item.data_vencimento + 'T00:00:00')
          const dias = Math.round((venc.getTime() - hoje.getTime()) / 86400000)
          const atrasada = dias < 0
          const rotulo = atrasada ? `Venceu há ${-dias}d` : dias === 0 ? 'Vence hoje' : dias === 1 ? 'Vence amanhã' : `Em ${dias} dias`
          return (
            <li key={item.id} className="flex items-center justify-between gap-3 py-2.5">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{item.descricao}</div>
                <div className={`text-xs font-bold flex items-center gap-1 ${atrasada ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  {atrasada && <AlertTriangle size={11} aria-hidden />}
                  {rotulo} · {venc.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-sm font-black text-slate-900 dark:text-slate-100">{formatBRL(Number(item.valor))}</span>
                <button
                  type="button"
                  onClick={() => marcarPago(item)}
                  aria-label={`Marcar ${item.descricao} como paga`}
                  title="Marcar como paga"
                  className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors"
                >
                  <CheckCircle2 size={18} />
                </button>
              </div>
            </li>
          )
        })}
      </ul>
      <Link
        href={`/dashboard/contas-fixas?mes=${mes}&ano=${ano}`}
        className="block mt-3 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
      >
        Ver todas as contas fixas →
      </Link>
    </Card>
  )
}
