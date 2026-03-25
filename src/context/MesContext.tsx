'use client'
/**
 * Fischer Finanças — Contexto do Mês/Ano Ativo
 * Desenvolvido por Thiago Fischer
 *
 * Fonte única de verdade para o mês e ano selecionados.
 * O layout é o único que define — as páginas só leem.
 */
import { createContext, useContext, useState, type ReactNode } from 'react'

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

export function MesProvider({
  children,
  mesInicial,
  anoInicial,
}: {
  children: ReactNode
  mesInicial: number
  anoInicial: number
}) {
  const [mes, setMes] = useState(mesInicial)
  const [ano, setAno] = useState(anoInicial)

  return (
    <MesContext.Provider value={{ mes, setMes, ano, setAno }}>
      {children}
    </MesContext.Provider>
  )
}

export function useMes() {
  return useContext(MesContext)
}
