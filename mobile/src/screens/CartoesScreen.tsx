import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { Session } from '@supabase/supabase-js';
import { useDados } from '../context/DadosContext';
import { MonthSelector } from '../components/MonthSelector';
import { CreditCard, CheckCircle2, AlertCircle } from 'lucide-react-native';

const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const formatBRL = (value: number) => currencyFormatter.format(value);

export function CartoesScreen({ session }: { session: Session }) {
  const { cartoes, loading, refreshDados } = useDados();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Cartões</Text>
        <Text style={styles.subtitle}>Faturas de Crédito</Text>
      </View>

      <View style={styles.periodContainer}>
        <MonthSelector />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#10b981" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={cartoes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={refreshDados} colors={['#10b981']} />}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardInfo}>
                <View style={styles.iconBox}>
                  <CreditCard size={24} color="#3b82f6" />
                </View>
                <View>
                  <Text style={styles.cardName}>{item.nome}</Text>
                  <Text style={styles.cardDueDate}>Vence em {item.vencimento || 'N/A'}</Text>
                </View>
              </View>
              <View style={styles.cardAction}>
                <Text style={styles.cardValue}>{formatBRL(item.valor)}</Text>
                <View style={[styles.statusBadge, { backgroundColor: item.pago ? '#ecfdf5' : '#fef2f2' }]}>
                  {item.pago ? <CheckCircle2 size={12} color="#10b981" /> : <AlertCircle size={12} color="#ef4444" />}
                  <Text style={[styles.statusText, { color: item.pago ? '#059669' : '#dc2626' }]}>
                    {item.pago ? 'Pago' : 'Pendente'}
                  </Text>
                </View>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.placeholder}>
              <CreditCard size={64} color="#d1d5db" />
              <Text style={styles.placeholderText}>Nenhuma fatura encontrada.</Text>
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
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  cardDueDate: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  cardAction: {
    alignItems: 'flex-end',
    gap: 8,
  },
  cardValue: {
    fontSize: 18,
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
