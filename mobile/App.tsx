import { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, StatusBar } from 'react-native';
import { Session } from '@supabase/supabase-js';
import { supabase } from './src/lib/supabase';
import { LoginScreen } from './src/screens/LoginScreen';
import { AppNavigator } from './src/navigation/AppNavigator';
import { NavigationContainer } from '@react-navigation/native';

import { MesProvider } from './src/context/MesContext';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <MesProvider>
        <NavigationContainer>
          {session && session.user ? <AppNavigator session={session} /> : <LoginScreen />}
        </NavigationContainer>
      </MesProvider>
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  }
});
