import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useMes } from './MesContext';

interface DadosContextType {
  entradas: any[];
  contas: any[];
  cartoes: any[];
  combustivel: any[];
  loading: boolean;
  refreshDados: () => Promise<void>;
}

const DadosContext = createContext<DadosContextType | undefined>(undefined);

export function DadosProvider({ children, userId }: { children: ReactNode, userId?: string }) {
  const { mes, ano } = useMes();
  const [entradas, setEntradas] = useState<any[]>([]);
  const [contas, setContas] = useState<any[]>([]);
  const [cartoes, setCartoes] = useState<any[]>([]);
  const [combustivel, setCombustivel] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDados = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      
      const [resEnt, resFix, resCar, resComb] = await Promise.all([
        supabase.from('entradas').select('*').eq('user_id', userId).eq('mes', mes).eq('ano', ano).eq('oculto_extrato', false),
        supabase.from('contas_fixas').select('*').eq('user_id', userId).eq('mes', mes).eq('ano', ano).eq('oculto_extrato', false),
        supabase.from('cartoes').select('*').eq('user_id', userId).eq('mes', mes).eq('ano', ano).eq('oculto_extrato', false),
        supabase.from('combustivel').select('*').eq('user_id', userId).eq('mes', mes).eq('ano', ano).eq('oculto_extrato', false)
      ]);

      setEntradas(resEnt.data || []);
      setContas(resFix.data || []);
      setCartoes(resCar.data || []);
      setCombustivel(resComb.data || []);
    } catch (error) {
      console.error('Erro ao buscar dados globais:', error);
    } finally {
      setLoading(false);
    }
  }, [mes, ano, userId]);

  useEffect(() => {
    fetchDados();
  }, [fetchDados]);

  return (
    <DadosContext.Provider value={{ 
      entradas, 
      contas, 
      cartoes, 
      combustivel, 
      loading, 
      refreshDados: fetchDados 
    }}>
      {children}
    </DadosContext.Provider>
  );
}

export function useDados() {
  const context = useContext(DadosContext);
  if (context === undefined) {
    throw new Error('useDados deve ser usado dentro de um DadosProvider');
  }
  return context;
}
