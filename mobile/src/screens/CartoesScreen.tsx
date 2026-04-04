import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Session } from '@supabase/supabase-js';

export function CartoesScreen({ session }: { session: Session }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>💳 Meus Cartões</Text>
      <Text style={styles.subtitle}>Gerenciamento de faturas (em desenvolvimento).</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6', 
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 8,
  }
});
