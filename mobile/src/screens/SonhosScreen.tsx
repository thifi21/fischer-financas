import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, Dimensions } from 'react-native';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Target as TargetIcon, Star, Clock, CheckCircle } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const formatBRL = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

interface Sonho {
  id: string;
  titulo: string;
  valor_alvo: number;
  valor_atual: number;
  icone: string;
  cor: string;
  prioridade: 1 | 2 | 3;
  status: 'em_andamento' | 'concluido' | 'pausado';
}

export function SonhosScreen({ session }: { session: Session }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sonhos, setSonhos] = useState<Sonho[]>([]);

  const fetchSonhos = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await supabase
        .from('sonhos')
        .select('*')
        .eq('user_id', session.user.id)
        .order('prioridade', { ascending: false });

      setSonhos(data || []);
    } catch (error) {
      console.error('Erro ao buscar sonhos:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [session.user.id]);

  useEffect(() => {
    fetchSonhos();
  }, [fetchSonhos]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSonhos();
  };

  const getPriorityLabel = (p: number) => {
    if (p === 3) return { label: 'Alta', color: '#ef4444' };
    if (p === 2) return { label: 'Média', color: '#f97316' };
    return { label: 'Baixa', color: '#10b981' };
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Meus Sonhos</Text>
        <Text style={styles.subtitle}>Sua jornada para o futuro</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#10b981']} />}
      >
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color="#10b981" style={{ marginTop: 40 }} />
        ) : (
          <View>
            {sonhos.map((sonho) => {
              const porcentagem = Math.min(Math.round((sonho.valor_atual / sonho.valor_alvo) * 100), 100);
              const prioridade = getPriorityLabel(sonho.prioridade);

              return (
                <View key={sonho.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={[styles.iconBox, { backgroundColor: sonho.cor + '20' }]}>
                      <Text style={{ fontSize: 24 }}>{sonho.icone || '🎯'}</Text>
                    </View>
                    <View style={styles.titleContainer}>
                      <Text style={styles.sonhoTitle}>{sonho.titulo}</Text>
                      <View style={styles.badgeRow}>
                        <View style={[styles.badge, { backgroundColor: prioridade.color + '15' }]}>
                          <Star size={10} color={prioridade.color} />
                          <Text style={[styles.badgeText, { color: prioridade.color }]}>{prioridade.label}</Text>
                        </View>
                        {sonho.status === 'concluido' && (
                          <View style={styles.badgeSuccess}>
                            <CheckCircle size={10} color="#059669" />
                            <Text style={styles.badgeSuccessText}>Concluído</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>

                  <View style={styles.progressContainer}>
                    <View style={styles.progressHeader}>
                      <Text style={styles.progressText}>{porcentagem}% concluído</Text>
                      <Text style={styles.valuesText}>
                        {formatBRL(sonho.valor_atual)} / {formatBRL(sonho.valor_alvo)}
                      </Text>
                    </View>
                    <View style={styles.progressBarBg}>
                      <View style={[styles.progressBarFill, { width: `${porcentagem}%`, backgroundColor: sonho.cor || '#10b981' }]} />
                    </View>
                  </View>

                  <View style={styles.cardFooter}>
                      <Clock size={14} color="#9ca3af" />
                      <Text style={styles.footerText}>
                          Restam {formatBRL(sonho.valor_alvo - sonho.valor_atual)} para o objetivo
                      </Text>
                  </View>
                </View>
              );
            })}

            {sonhos.length === 0 && (
              <View style={styles.placeholder}>
                <TargetIcon size={64} color="#d1d5db" />
                <Text style={styles.placeholderText}>Comece a planejar seus sonhos!</Text>
                <Text style={styles.placeholderSub}>Cadastre seus objetivos no sistema web para acompanhá-los aqui.</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
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
    marginBottom: 20,
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
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  titleContainer: {
    flex: 1,
  },
  sonhoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  badgeSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  badgeSuccessText: {
    fontSize: 10,
    color: '#059669',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  valuesText: {
    fontSize: 11,
    color: '#6b7280',
  },
  progressBarBg: {
    height: 10,
    backgroundColor: '#f3f4f6',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: '#f9fafb',
    paddingTop: 12,
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  placeholder: {
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 40,
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
    textAlign: 'center',
  },
  placeholderSub: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
  }
});
