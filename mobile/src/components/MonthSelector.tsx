import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useMes, MESES } from '../context/MesContext';

export function MonthSelector() {
  const { mes, setMes, ano, setAno } = useMes();

  const nextMonth = () => {
    if (mes === 12) {
      setMes(1);
      setAno(ano + 1);
    } else {
      setMes(mes + 1);
    }
  };

  const prevMonth = () => {
    if (mes === 1) {
      setMes(12);
      setAno(ano - 1);
    } else {
      setMes(mes - 1);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={prevMonth} style={styles.button}>
        <ChevronLeft size={24} color="#374151" />
      </TouchableOpacity>
      
      <View style={styles.labelContainer}>
        <Text style={styles.mesText}>{MESES[mes - 1]}</Text>
        <Text style={styles.anoText}>{ano}</Text>
      </View>
      
      <TouchableOpacity onPress={nextMonth} style={styles.button}>
        <ChevronRight size={24} color="#374151" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  button: {
    padding: 8,
  },
  labelContainer: {
    flex: 1,
    alignItems: 'center',
  },
  mesText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  anoText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: -2,
  }
});
