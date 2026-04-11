import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { useMes } from '../context/MesContext';
import { MonthSelector } from '../components/MonthSelector';
import { CheckCircle2, Circle, TrendingUp, TrendingDown, CreditCard, Fuel, Home } from 'lucide-react-native';

const formatBRL = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

interface ExtratoItem {
  id: string;
  data: string;
  descricao: string;
  categoria: string;
  valor: number;
  tipo: 'entrada' | 'saida';
  tabelaOrigem: string;
  conferido: boolean;
}

export function ExtratoScreen({ session }: { session: Session }) {
  const { mes, ano } = useMes();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [extrato, setExtrato] = useState<ExtratoItem[]>([]);
  const [saldoTotal, setSaldoTotal] = useState(0);

  const fetchExtrato = useCallback(async () => {
    try {
      setLoading(true);
      const uid = session.user.id;

      const [resEntradas, resFixas, resCartoes, resComb] = await Promise.all([
        supabase.from('entradas').select('*').eq('user_id', uid).eq('mes', mes).eq('ano', ano),
        supabase.from('contas_fixas').select('*').eq('user_id', uid).eq('mes', mes).eq('ano', ano).eq('pago', true),
        supabase.from('cartoes').select('*').eq('user_id', uid).eq('mes', mes).eq('ano', ano).eq('pago', true),
        supabase.from('combustivel').select('*').eq('user_id', uid).eq('mes', mes).eq('ano', ano)
      ]);

      let items: ExtratoItem[] = [];

      // 1. Entradas
      resEntradas.data?.filter(e => e.categoria !== 'saldo_inicial').forEach(e => {
        items.push({
          id: e.id,
          data: e.data_entrada || e.created_at.split('T')[0],
          descricao: e.descricao,
          categoria: e.categoria,
          valor: e.valor,
          tipo: e.categoria === 'extrato_saida' ? 'saida' : 'entrada',
          tabelaOrigem: 'entradas',
          conferido: !!e.conferido
        });
      });

      // 2. Fixas
      resFixas.data?.forEach(e => {
        items.push({
          id: e.id,
          data: e.data_vencimento || e.created_at.split('T')[0],
          descricao: e.descricao,
          categoria: e.categoria,
          valor: e.valor,
          tipo: 'saida',
          tabelaOrigem: 'contas_fixas',
          conferido: !!e.conferido
        });
      });

      // 3. Cartões
      resCartoes.data?.forEach(e => {
        const diaVenc = e.vencimento ? e.vencimento.split('/')[0] : '01';
        items.push({
          id: e.id,
          data: `${ano}-${String(mes).padStart(2,'0')}-${diaVenc.padStart(2,'0')}`,
          descricao: `Cartão: ${e.nome}`,
          categoria: 'cartao',
          valor: e.valor,
          tipo: 'saida',
          tabelaOrigem: 'cartoes',
          conferido: !!e.conferido
        });
      });

      // 4. Combustível
      resComb.data?.forEach(e => {
        items.push({
          id: e.id,
          data: e.data_abastecimento || e.created_at.split('T')[0],
          descricao: 'Abastecimento',
          categoria: 'combustivel',
          valor: e.valor,
          tipo: 'saida',
          tabelaOrigem: 'combustivel',
          conferido: !!e.conferido
        });
      });

      items.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
      
      const total = items.reduce((acc, item) => acc + (item.tipo === 'entrada' ? item.valor : -item.valor), 0);
      
      setExtrato(items);
      setSaldoTotal(total);
    } catch (error) {
      console.error('Erro ao buscar extrato:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [mes, ano, session.user.id]);

  useEffect(() => {
    fetchExtrato();
  }, [fetchExtrato]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchExtrato();
  };

  const toggleConferido = async (item: ExtratoItem) => {
    const novoStatus = !item.conferido;
    setExtrato(prev => prev.map(x => (x.id === item.id && x.tabelaOrigem === item.tabelaOrigem) ? { ...x, conferido: novoStatus } : x));
    
    await supabase.from(item.tabelaOrigem).update({ conferido: novoStatus }).eq('id', item.id);
  };

  const renderIcon = (item: ExtratoItem) => {
    if (item.tipo === 'entrada') return <TrendingUp size={20} color="#10b981" />;
    if (item.categoria === 'cartao') return <CreditCard size={20} color="#3b82f6" />;
    if (item.categoria === 'combustivel') return <Fuel size={20} color="#f97316" />;
    return <Home size={20} color="#6b7280" />;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length < 3) return dateStr;
    return `${parts[2]}/${parts[1]}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Extrato</Text>
        <Text style={styles.subtitle}>Conciliação de conta</Text>
      </View>

      <View style={styles.periodContainer}>
        <MonthSelector />
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#10b981" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={extrato}
          keyExtractor={(item, index) => `${item.tabelaOrigem}-${item.id}-${index}`}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#10b981']} />}
          renderItem={({ item }) => (
            <View style={[styles.itemCard, item.conferido && styles.itemConferido]}>
                <View style={styles.iconContainer}>
                    {renderIcon(item)}
                </View>
                <View style={styles.infoContainer}>
                    <Text style={styles.itemDesc} numberOfLines={1}>{item.descricao}</Text>
                    <Text style={styles.itemDate}>{formatDate(item.data)}</Text>
                </View>
                <View style={styles.actionContainer}>
                    <Text style={[styles.itemValue, { color: item.tipo === 'entrada' ? '#10b981' : '#ef4444' }]}>
                        {item.tipo === 'entrada' ? '+' : '-'} {formatBRL(item.valor)}
                    </Text>
                    <TouchableOpacity onPress={() => toggleConferido(item)} style={styles.checkBtn}>
                        {item.conferido ? (
                            <CheckCircle2 size={22} color="#10b981" />
                        ) : (
                            <Circle size={22} color="#d1d5db" />
                        )}
                    </TouchableOpacity>
                </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.placeholder}>
              <ReceiptIcon size={48} color="#9ca3af" />
              <Text style={styles.placeholderText}>Nenhuma movimentação este mês.</Text>
            </View>
          }
        />
      )}

      <View style={styles.footer}>
          <View style={styles.saldoCard}>
              <Text style={styles.saldoLabel}>Saldo do Período</Text>
              <Text style={[styles.saldoValue, { color: saldoTotal >= 0 ? '#10b981' : '#ef4444' }]}>
                  {formatBRL(saldoTotal)}
              </Text>
          </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  periodContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  itemConferido: {
    opacity: 0.6,
    backgroundColor: '#f3f4f6',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
  },
  itemDesc: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  itemDate: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  actionContainer: {
    alignItems: 'flex-end',
    gap: 6,
  },
  itemValue: {
    fontSize: 15,
    fontWeight: '800',
  },
  checkBtn: {
    padding: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(249, 250, 251, 0.9)',
  },
  saldoCard: {
    backgroundColor: '#111827',
    padding: 20,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
  },
  saldoLabel: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '600',
  },
  saldoValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    alignItems: 'center',
    marginTop: 100,
    opacity: 0.5,
  },
  placeholderText: {
    marginTop: 16,
    color: '#374151',
    fontWeight: '500',
  }
});
