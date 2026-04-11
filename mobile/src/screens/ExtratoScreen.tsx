import React, { useMemo, memo } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { useMes } from '../context/MesContext';
import { useDados } from '../context/DadosContext';
import { MonthSelector } from '../components/MonthSelector';
import { CheckCircle2, Circle, TrendingUp, TrendingDown, CreditCard, Fuel, Home, Trash2, Receipt as ReceiptIcon } from 'lucide-react-native';

const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const formatBRL = (value: number) => currencyFormatter.format(value);

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length < 3) return dateStr;
  return `${parts[2]}/${parts[1]}`;
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

const ExtratoItemRow = memo(({ item, onToggle, onHide }: { 
  item: ExtratoItem, 
  onToggle: (item: ExtratoItem) => void,
  onHide: (item: ExtratoItem) => void 
}) => {
  const renderIcon = () => {
    if (item.tipo === 'entrada') return <TrendingUp size={20} color="#10b981" />;
    if (item.categoria === 'cartao') return <CreditCard size={20} color="#3b82f6" />;
    if (item.categoria === 'combustivel') return <Fuel size={20} color="#f97316" />;
    return <Home size={20} color="#6b7280" />;
  };

  return (
    <View style={[styles.itemCard, item.conferido && styles.itemConferido]}>
      <View style={styles.iconContainer}>
        {renderIcon()}
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.itemDesc} numberOfLines={1}>{item.descricao}</Text>
        <Text style={styles.itemDate}>{formatDate(item.data)}</Text>
      </View>
      <View style={styles.actionContainer}>
        <Text style={[styles.itemValue, { color: item.tipo === 'entrada' ? '#10b981' : '#ef4444' }]}>
          {item.tipo === 'entrada' ? '+' : '-'} {formatBRL(item.valor)}
        </Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity onPress={() => onHide(item)} style={styles.actionBtn}>
            <Trash2 size={20} color="#9ca3af" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onToggle(item)} style={styles.actionBtn}>
            {item.conferido ? (
              <CheckCircle2 size={22} color="#10b981" />
            ) : (
              <Circle size={22} color="#d1d5db" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});

export function ExtratoScreen({ session }: { session: Session }) {
  const { ano, mes } = useMes();
  const { entradas, contas, cartoes, combustivel, loading, refreshDados } = useDados();

  const items = useMemo(() => {
    let list: ExtratoItem[] = [];

    // 1. Entradas
    entradas.filter(e => e.categoria !== 'saldo_inicial').forEach(e => {
      list.push({
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
    contas.forEach(e => {
        // No mobile mostramos apenas o que está pago no extrato para ser Premium (conciliado)
        // Mas o DadosContext já filtra isso? Vamos confiar no que vem de lá.
        // Na verdade o DadosContext busca TUDO. Vamos filtrar aqui se necessário.
        if (!e.pago) return; 
        list.push({
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
    cartoes.forEach(e => {
      if (!e.pago) return;
      const diaVenc = e.vencimento ? e.vencimento.split('/')[0] : '01';
      list.push({
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
    combustivel.forEach(e => {
      list.push({
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

    return list.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
  }, [entradas, contas, cartoes, combustivel, ano, mes]);

  const saldoTotal = useMemo(() => {
    return items.reduce((acc, item) => acc + (item.tipo === 'entrada' ? item.valor : -item.valor), 0);
  }, [items]);

  const toggleConferido = async (item: ExtratoItem) => {
    const novoStatus = !item.conferido;
    // Update no banco via context provider ou direto? Context provider é mais limpo.
    // Mas para performance imediata, fazemos update local no context se possível.
    // Por simplicidade agora, fazemos o update e pedimos refresh ou confiamos na re-renderização do context se ele for reativo.
    await supabase.from(item.tabelaOrigem).update({ conferido: novoStatus }).eq('id', item.id);
    refreshDados(); // Força atualização global
  };

  const ocultarDoExtrato = async (item: ExtratoItem) => {
    await supabase.from(item.tabelaOrigem).update({ oculto_extrato: true }).eq('id', item.id);
    refreshDados();
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

      {loading ? (
        <ActivityIndicator size="large" color="#10b981" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => `${item.tabelaOrigem}-${item.id}`}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={refreshDados} colors={['#10b981']} />}
          renderItem={({ item }) => (
            <ExtratoItemRow 
              item={item} 
              onToggle={toggleConferido} 
              onHide={ocultarDoExtrato} 
            />
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
    gap: 4,
  },
  itemValue: {
    fontSize: 15,
    fontWeight: '800',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionBtn: {
    padding: 4,
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
