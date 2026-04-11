import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { Lock, Mail, ChevronRight } from 'lucide-react-native';

export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) alert(error.message);
    setLoading(false);
  }

  return (
    <LinearGradient colors={['#10b981', '#059669']} style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.logoBox}>
               <Text style={styles.logoText}>F</Text>
            </View>
            <Text style={styles.title}>Fischer Finanças</Text>
            <Text style={styles.subtitle}>Sua gestão familiar premium</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Mail size={20} color="#9ca3af" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="E-mail"
                placeholderTextColor="#9ca3af"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Lock size={20} color="#9ca3af" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Senha"
                placeholderTextColor="#9ca3af"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity 
              style={styles.button} 
              onPress={handleLogin}
              disabled={loading}
            >
              <LinearGradient 
                colors={['#111827', '#1f2937']} 
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <>
                    <Text style={styles.buttonText}>Entrar</Text>
                    <ChevronRight size={20} color="#ffffff" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <Text style={styles.footerText}>© 2026 Thiago Fischer</Text>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 32,
    padding: 32,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoBox: {
    width: 64,
    height: 64,
    backgroundColor: '#10b981',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ffffff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 56,
    color: '#111827',
    fontSize: 16,
  },
  button: {
    marginTop: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footerText: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 40,
  }
});
