import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

// Helper de moeda (bruto para simular o que existe no next.js)
const formatBRL = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export function DashboardScreen({ session }: { session: Session }) {
  const [resumo, setResumo] = useState({ entradas: 0, saidas: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDados();
  }, []);

  async function fetchDados() {
    try {
      setLoading(true);
      const user = session.user;
      const mesAtual = new Date().getMonth() + 1;
      const anoAtual = new Date().getFullYear();

      // Buscando entradas
      const { data: entradas } = await supabase
        .from('entradas')
        .select('valor')
        .eq('user_id', user.id)
        .eq('mes', mesAtual)
        .eq('ano', anoAtual);

      // Buscando saídas (cartões, fixas, combustivel)
      const { data: cartoes } = await supabase.from('cartoes').select('valor').eq('user_id', user.id).eq('mes', mesAtual).eq('ano', anoAtual);
      const { data: fixas } = await supabase.from('contas_fixas').select('valor').eq('user_id', user.id).eq('mes', mesAtual).eq('ano', anoAtual);
      const { data: comb } = await supabase.from('combustivel').select('valor').eq('user_id', user.id).eq('mes', mesAtual).eq('ano', anoAtual);

      const soma = (rows: any[]) => (rows || []).reduce((acc, r) => acc + Number(r.valor), 0);
      
      const totalEntradas = soma(entradas || []);
      const totalSaidas = soma(cartoes || []) + soma(fixas || []) + soma(comb || []);

      setResumo({ entradas: totalEntradas, saidas: totalSaidas });
    } catch (error) {
      console.log('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  }

  const saldo = resumo.entradas - resumo.saidas;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Olá, {session.user.email}</Text>
        <TouchableOpacity onPress={() => supabase.auth.signOut()} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Painel Principal</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#10b981" style={{ marginTop: 40 }} />
      ) : (
        <View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Entradas do Mês</Text>
            <Text style={[styles.cardValue, { color: '#10b981' }]}>{formatBRL(resumo.entradas)}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>Saídas do Mês</Text>
            <Text style={[styles.cardValue, { color: '#ef4444' }]}>{formatBRL(resumo.saidas)}</Text>
          </View>

          <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: saldo >= 0 ? '#10b981' : '#ef4444' }]}>
            <Text style={styles.cardLabel}>Saldo Atual</Text>
            <Text style={[styles.cardValue, { color: saldo >= 0 ? '#10b981' : '#ef4444' }]}>
              {formatBRL(saldo)}
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6', // gray-100
    padding: 24,
    paddingTop: 60, // Safe area manual
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: '#374151',
  },
  logoutButton: {
    padding: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
  },
  logoutText: {
    color: '#ef4444',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardLabel: {
    fontSize: 14,
    color: '#6b7280',
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
});
