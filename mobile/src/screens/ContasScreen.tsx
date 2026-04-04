import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Session } from '@supabase/supabase-js';

export function ContasScreen({ session }: { session: Session }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏠 Contas Fixas</Text>
      <Text style={styles.subtitle}>Gerenciamento de boletos mensais.</Text>
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
