'use client'

import { useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase'
import DashboardClientView from '@/components/DashboardClientView'
import { MESES } from '@/types'

export default function DashboardPage() {
  const searchParams = useSearchParams()
  const supabase = createClient()

  // Sincroniza parâmetros da URL ou usa defaults
  const mesAtual = new Date().getMonth() + 1
  const anoAtual = new Date().getFullYear()

  const mesParam = searchParams.get('mes')
  const anoParam = searchParams.get('ano')

  const mes = mesParam ? parseInt(mesParam, 10) : mesAtual
  const ano = anoParam ? parseInt(anoParam, 10) : anoAtual

  // Busca dados via RPC (Otimizado: 1 chamada em vez de 48)
  const { data: summary, isLoading, error } = useQuery({
    queryKey: ['dashboard-summary', ano],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Não autenticado')
      
      const { data, error } = await supabase.rpc('get_annual_summary', {
        p_user_id: user.id,
        p_year: ano
      })
      
      if (error) throw error
      return data
    },
    staleTime: 1000 * 60 * 5, // 5 minutos de cache
  })

  // Processamento dos dados para o formato do Dashboard
  const dashboardData = useMemo(() => {
    if (!summary) return null

    let resumo = { entradas: 0, cartoes: 0, fixas: 0, combustivel: 0 }
    let pieData: any[] = []
    const mesesData: any[] = []

    // O RPC retorna um objeto onde chaves são meses (1-12)
    for (let m = 1; m <= 12; m++) {
      const dadosMes = summary[m] || { entradas: 0, cartoes: 0, fixas: 0, combustivel: 0 }
      
      const ent = Number(dadosMes.entradas)
      const sai = Number(dadosMes.cartoes) + Number(dadosMes.fixas) + Number(dadosMes.combustivel)
      
      if (ent > 0 || sai > 0) {
        mesesData.push({ 
          mes: MESES[m - 1].substring(0, 3), 
          entradas: ent, 
          saidas: sai 
        })
      }

      if (m === mes) {
        const cart = Number(dadosMes.cartoes)
        const fix = Number(dadosMes.fixas)
        const comb = Number(dadosMes.combustivel)
        
        resumo = { entradas: ent, cartoes: cart, fixas: fix, combustivel: comb }
        pieData = [
          { name: 'Cartões', value: cart },
          { name: 'Contas Fixas', value: fix },
          { name: 'Combustível', value: comb },
        ].filter(d => d.value > 0)
      }
    }

    const totalSaidas = resumo.cartoes + resumo.fixas + resumo.combustivel
    const saldo = resumo.entradas - totalSaidas

    return { resumo, pieData, mesesData, totalSaidas, saldo }
  }, [summary, mes])

  if (isLoading) return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 font-medium animate-pulse">Otimizando Dashboard...</p>
      </div>
    </div>
  )

  if (error || !dashboardData) return (
    <div className="card bg-rose-50 border-rose-100 p-8 text-center text-rose-600">
      <p className="font-bold">Erro ao carregar dados do Dashboard.</p>
      <p className="text-sm opacity-80 mt-2">Certifique-se de que a função RPC foi criada no Supabase.</p>
    </div>
  )

  return (
    <DashboardClientView 
      mes={mes} 
      ano={ano} 
      resumo={dashboardData.resumo} 
      pieData={dashboardData.pieData} 
      dadosMensais={dashboardData.mesesData} 
      totalSaidas={dashboardData.totalSaidas} 
      saldo={dashboardData.saldo} 
    />
  )
}
