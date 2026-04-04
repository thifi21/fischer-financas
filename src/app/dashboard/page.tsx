import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase-server'
import DashboardClientView from '@/components/DashboardClientView'
import { MESES } from '@/types'

// React Server Component (RSC) puro — roda no backend
export default async function DashboardPage({ searchParams }: { searchParams: { mes?: string, ano?: string } }) {
  const supabase = createServerSupabase()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const mesAtual = new Date().getMonth() + 1
  const anoAtual = new Date().getFullYear()

  // Se for array (parâmetro repetido), pega o primeiro. Se estiver vazio ou for string incorreta, pega o fallback.
  const mesStr = Array.isArray(searchParams.mes) ? searchParams.mes[0] : searchParams.mes
  const anoStr = Array.isArray(searchParams.ano) ? searchParams.ano[0] : searchParams.ano

  const mes = mesStr ? parseInt(mesStr, 10) : mesAtual
  const ano = anoStr ? parseInt(anoStr, 10) : anoAtual

  const uid = user.id

  // Consulta otimizada rodando inteira no servidor (livrando o cliente do processamento/loading)
  const mesQueries = Array.from({ length: 12 }, (_, i) => i + 1).map(m =>
    Promise.all([
      supabase.from('entradas')    .select('valor').eq('user_id', uid).eq('mes', m).eq('ano', ano),
      supabase.from('cartoes')     .select('valor').eq('user_id', uid).eq('mes', m).eq('ano', ano),
      supabase.from('contas_fixas').select('valor').eq('user_id', uid).eq('mes', m).eq('ano', ano),
      supabase.from('combustivel') .select('valor').eq('user_id', uid).eq('mes', m).eq('ano', ano),
    ])
  )

  const resultados = await Promise.all(mesQueries)

  const soma = (rows: any[] | null) => (rows || []).reduce((s, r) => s + Number(r.valor), 0)

  let resumo = { entradas: 0, cartoes: 0, fixas: 0, combustivel: 0 }
  let pieData: any[] = []
  const mesesData: any[] = []

  resultados.forEach(([{ data: e }, { data: c }, { data: f }, { data: cb }], idx) => {
    const m = idx + 1
    const ent = soma(e)
    const sai = soma(c) + soma(f) + soma(cb)
    if (ent > 0 || sai > 0) {
      mesesData.push({ mes: MESES[idx].substring(0, 3), entradas: ent, saidas: sai })
    }
    if (m === mes) {
      const cart = soma(c)
      const fix  = soma(f)
      const comb = soma(cb)
      resumo = { entradas: ent, cartoes: cart, fixas: fix, combustivel: comb }
      pieData = [
        { name: 'Cartões',      value: cart },
        { name: 'Contas Fixas', value: fix  },
        { name: 'Combustível',  value: comb },
      ].filter(d => d.value > 0)
    }
  })

  const totalSaidas = resumo.cartoes + resumo.fixas + resumo.combustivel
  const saldo = resumo.entradas - totalSaidas

  // Passando os dados pré-carregados e formatados para o Client View que suporta Recharts
  return (
    <DashboardClientView 
      mes={mes} 
      ano={ano} 
      resumo={resumo} 
      pieData={pieData} 
      dadosMensais={mesesData} 
      totalSaidas={totalSaidas} 
      saldo={saldo} 
    />
  )
}
