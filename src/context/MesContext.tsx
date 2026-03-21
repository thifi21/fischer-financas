'use client'
/**
 * Fischer Finanças 2026 — Contexto do Mês Ativo
 * Desenvolvido por Thiago Fischer
 *
 * Compartilha o mês selecionado na sidebar com todas as páginas.
 * Elimina o problema de cada página inicializar com o mês atual
 * ao ser acessada, ignorando a seleção do usuário.
 */
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

type MesContextType = {
  mes: number
  setMes: (mes: number) => void
}

const MesContext = createContext<MesContextType>({
  mes: new Date().getMonth() + 1,
  setMes: () => {},
})

export function MesProvider({ children }: { children: ReactNode }) {
  const [mes, setMesState] = useState(new Date().getMonth() + 1)

  // Escuta evento global disparado pela sidebar
  useEffect(() => {
    function handler(e: Event) {
      setMesState((e as CustomEvent<number>).detail)
    }
    window.addEventListener('mesChange', handler)
    return () => window.removeEventListener('mesChange', handler)
  }, [])

  function setMes(novoMes: number) {
    setMesState(novoMes)
    window.dispatchEvent(new CustomEvent('mesChange', { detail: novoMes }))
  }

  return (
    <MesContext.Provider value={{ mes, setMes }}>
      {children}
    </MesContext.Provider>
  )
}

// Hook para usar o mês em qualquer página
export function useMes() {
  return useContext(MesContext)
}
