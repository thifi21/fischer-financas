import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { useMes } from '../context/MesContext';
import { useDados } from '../context/DadosContext';
import { MonthSelector } from '../components/MonthSelector';
import { LogOut, TrendingUp, TrendingDown, Wallet } from 'lucide-react-native';

const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const formatBRL = (value: number) => currencyFormatter.format(value);

export function DashboardScreen({ session }: { session: Session }) {
  const { entradas, contas, cartoes, combustivel, loading } = useDados();

  const resumo = useMemo(() => {
    const soma = (rows: any[]) => (rows || []).reduce((acc, r) => acc + Number(r.valor), 0);
    const totalEntradas = soma(entradas);
    const totalSaidas = soma(contas) + soma(cartoes) + soma(combustivel);
    return { entradas: totalEntradas, saidas: totalSaidas, saldo: totalEntradas - totalSaidas };
  }, [entradas, contas, cartoes, combustivel]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <LinearGradient colors={['#10b981', '#059669']} style={styles.topBar}>
        <View style={styles.header}>
            <View>
                <Text style={styles.greeting}>Olá, {session.user.email?.split('@')[0]}</Text>
                <Text style={styles.subtitle}>Seu controle de hoje</Text>
            </View>
            <TouchableOpacity onPress={() => supabase.auth.signOut()} style={styles.logoutButton}>
                <LogOut size={20} color="#ffffff" />
            </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <MonthSelector />

        {loading ? (
          <ActivityIndicator size="large" color="#10b981" style={{ marginTop: 40 }} />
        ) : (
          <View>
            <View style={styles.mainCard}>
                <Text style={styles.cardLabel}>Saldo Disponível</Text>
                <Text style={styles.mainBalance}>{formatBRL(resumo.saldo)}</Text>
                <View style={styles.divider} />
                <View style={styles.row}>
                    <View style={styles.stat}>
                        <View style={[styles.iconBox, { backgroundColor: '#ecfdf5' }]}>
                            <TrendingUp size={20} color="#10b981" />
                        </View>
                        <View>
                            <Text style={styles.statLabel}>Entradas</Text>
                            <Text style={[styles.statValue, { color: '#059669' }]}>{formatBRL(resumo.entradas)}</Text>
                        </View>
                    </View>
                    <View style={styles.stat}>
                        <View style={[styles.iconBox, { backgroundColor: '#fef2f2' }]}>
                            <TrendingDown size={20} color="#ef4444" />
                        </View>
                        <View>
                            <Text style={styles.statLabel}>Saídas</Text>
                            <Text style={[styles.statValue, { color: '#dc2626' }]}>{formatBRL(resumo.saidas)}</Text>
                        </View>
                    </View>
                </View>
            </View>

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Acesso Rápido</Text>
            </View>

            <View style={styles.cardRow}>
                <TouchableOpacity style={styles.miniCard}>
                    <Wallet size={24} color="#3b82f6" />
                    <Text style={styles.miniCardText}>Pagar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.miniCard}>
                    <TrendingUp size={24} color="#10b981" />
                    <Text style={styles.miniCardText}>Receber</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.miniCard}>
                    <TrendingDown size={24} color="#f97316" />
                    <Text style={styles.miniCardText}>Abastecer</Text>
                </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  topBar: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 14,
    color: '#d1fae5',
    marginTop: 2,
  },
  logoutButton: {
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
  },
  content: {
    paddingHorizontal: 24,
    marginTop: -30,
  },
  mainCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  cardLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  mainBalance: {
    fontSize: 36,
    fontWeight: '900',
    color: '#111827',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginVertical: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  miniCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  miniCardText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginTop: 8,
  }
});
