import React, { createContext, useContext, useState, ReactNode } from 'react';

type MesContextType = {
  mes: number;
  setMes: (mes: number) => void;
  ano: number;
  setAno: (ano: number) => void;
};

const MesContext = createContext<MesContextType>({
  mes: new Date().getMonth() + 1,
  setMes: () => {},
  ano: new Date().getFullYear(),
  setAno: () => {},
});

export function MesProvider({ children }: { children: ReactNode }) {
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [ano, setAno] = useState(new Date().getFullYear());

  return (
    <MesContext.Provider value={{ mes, setMes, ano, setAno }}>
      {children}
    </MesContext.Provider>
  );
}

export function useMes() {
  return useContext(MesContext);
}

export const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];
