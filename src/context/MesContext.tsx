'use client'
/**
 * Fischer Finanças 2026 — Contexto do Mês Ativo
 * Desenvolvido por Thiago Fischer
 *
 * Fonte única de verdade para o mês selecionado.
 * O layout é o único que define o mês — as páginas só leem.
 */
import { createContext, useContext, useState, type ReactNode } from 'react'

type MesContextType = {
  mes: number
  setMes: (mes: number) => void
}

export const MesContext = createContext<MesContextType>({
  mes: new Date().getMonth() + 1,
  setMes: () => {},
})

export function MesProvider({
  children,
  mesInicial,
}: {
  children: ReactNode
  mesInicial: number
}) {
  const [mes, setMes] = useState(mesInicial)

  return (
    <MesContext.Provider value={{ mes, setMes }}>
      {children}
    </MesContext.Provider>
  )
}

export function useMes() {
  return useContext(MesContext)
}
