'use client'
/**
 * Fischer Finanças — Contexto do Mês/Ano Ativo
 * Atualizado para sincronizar via URL (Search Params)
 * para suportar Server Components.
 */
import { createContext, useContext, type ReactNode, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'

type MesContextType = {
  mes: number
  setMes: (mes: number) => void
  ano: number
  setAno: (ano: number) => void
}

export const MesContext = createContext<MesContextType>({
  mes: new Date().getMonth() + 1,
  setMes: () => {},
  ano: new Date().getFullYear(),
  setAno: () => {},
})

function MesProviderInner({ children, fallbackMes, fallbackAno }: { children: ReactNode, fallbackMes: number, fallbackAno: number }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const queryMes = searchParams.get('mes')
  const queryAno = searchParams.get('ano')

  const mes = queryMes ? parseInt(queryMes, 10) : fallbackMes
  const ano = queryAno ? parseInt(queryAno, 10) : fallbackAno

  const setMes = useCallback((novoMes: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('mes', String(novoMes))
    params.set('ano', String(ano))
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }, [router, pathname, searchParams, ano])

  const setAno = useCallback((novoAno: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('ano', String(novoAno))
    params.set('mes', String(mes))
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }, [router, pathname, searchParams, mes])

  return (
    <MesContext.Provider value={{ mes, setMes, ano, setAno }}>
      {children}
    </MesContext.Provider>
  )
}

export function MesProvider({
  children,
  mesInicial,
  anoInicial,
}: {
  children: ReactNode
  mesInicial: number
  anoInicial: number
}) {
  return (
    <Suspense fallback={<div className="h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-950 text-gray-400">Carregando painel...</div>}>
      <MesProviderInner fallbackMes={mesInicial} fallbackAno={anoInicial}>
        {children}
      </MesProviderInner>
    </Suspense>
  )
}

export function useMes() {
  return useContext(MesContext)
}
