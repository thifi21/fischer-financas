import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { Session } from '@supabase/supabase-js';
import { useDados } from '../context/DadosContext';
import { MonthSelector } from '../components/MonthSelector';
import { Home, Lightbulb, Zap, Shield, BookOpen, Utensils, Heart, CheckCircle2, AlertCircle } from 'lucide-react-native';

const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const formatBRL = (value: number) => currencyFormatter.format(value);

const getIcon = (cat: string) => {
  const c = cat ? cat.toLowerCase() : '';
  if (c.includes('moradia') || c.includes('aluguel')) return <Home size={22} color="#6366f1" />;
  if (c.includes('energia') || c.includes('luz')) return <Zap size={22} color="#eab308" />;
  if (c.includes('água') || c.includes('serviços')) return <Lightbulb size={22} color="#06b6d4" />;
  if (c.includes('saúde')) return <Heart size={22} color="#ec4899" />;
  if (c.includes('educação')) return <BookOpen size={22} color="#8b5cf6" />;
  if (c.includes('alimentação')) return <Utensils size={22} color="#f97316" />;
  return <Shield size={22} color="#6b7280" />;
};

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return 'N/A';
  const parts = dateStr.split('-');
  if (parts.length < 3) return dateStr;
  return `${parts[2]}/${parts[1]}`;
};

export function ContasScreen({ session }: { session: Session }) {
  const { contas, loading, refreshDados } = useDados();

  const sortedContas = useMemo(() => {
    return [...contas].sort((a, b) => {
      if (!a.data_vencimento) return 1;
      if (!b.data_vencimento) return -1;
      return a.data_vencimento.localeCompare(b.data_vencimento);
    });
  }, [contas]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Contas Fixas</Text>
        <Text style={styles.subtitle}>Boletos e Despesas Mensais</Text>
      </View>

      <View style={styles.periodContainer}>
        <MonthSelector />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#10b981" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={sortedContas}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={refreshDados} colors={['#10b981']} />}
          renderItem={({ item }) => (
            <View style={styles.itemCard}>
              <View style={styles.itemHeader}>
                  <View style={styles.iconBox}>
                      {getIcon(item.categoria)}
                  </View>
                  <View style={styles.infoBox}>
                      <Text style={styles.itemDesc}>{item.descricao}</Text>
                      <View style={styles.metaRow}>
                          <Text style={styles.itemMeta}>Vence {formatDate(item.data_vencimento)}</Text>
                          {item.parcela && <Text style={styles.parcelaBadge}>{item.parcela}</Text>}
                      </View>
                  </View>
                  <View style={styles.valueBox}>
                      <Text style={styles.itemValue}>{formatBRL(item.valor)}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: item.pago ? '#ecfdf5' : '#fff7ed' }]}>
                          {item.pago ? <CheckCircle2 size={12} color="#10b981" /> : <AlertCircle size={12} color="#f97316" />}
                          <Text style={[styles.statusText, { color: item.pago ? '#059669' : '#c2410c' }]}>
                              {item.pago ? 'Pago' : 'Pendente'}
                          </Text>
                      </View>
                  </View>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.placeholder}>
              <Shield size={64} color="#d1d5db" />
              <Text style={styles.placeholderText}>Nenhuma conta fixa este mês.</Text>
            </View>
          }
        />
      )}
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
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  itemCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  infoBox: {
    flex: 1,
  },
  itemDesc: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  itemMeta: {
    fontSize: 12,
    color: '#6b7280',
  },
  parcelaBadge: {
    fontSize: 10,
    backgroundColor: '#f3f4f6',
    color: '#374151',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
    fontWeight: '600',
  },
  valueBox: {
    alignItems: 'flex-end',
    gap: 6,
  },
  itemValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1f2937',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  placeholder: {
    alignItems: 'center',
    marginTop: 100,
    opacity: 0.5,
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
  }
});
