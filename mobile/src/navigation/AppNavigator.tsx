import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Session } from '@supabase/supabase-js';
import { Text } from 'react-native';
import { DashboardScreen } from '../screens/DashboardScreen';
import { CartoesScreen } from '../screens/CartoesScreen';
import { ContasScreen } from '../screens/ContasScreen';

const Tab = createBottomTabNavigator();

export function AppNavigator({ session }: { session: Session }) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#10b981',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        }
      }}
    >
      <Tab.Screen 
        name="Resumo" 
        options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>📊</Text> }}
      >
        {props => <DashboardScreen {...props} session={session} />}
      </Tab.Screen>
      
      <Tab.Screen 
        name="Cartões" 
        options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>💳</Text> }}
      >
        {props => <CartoesScreen {...props} session={session} />}
      </Tab.Screen>

      <Tab.Screen 
        name="Contas" 
        options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🏠</Text> }}
      >
        {props => <ContasScreen {...props} session={session} />}
      </Tab.Screen>
      
      {/* Botão de Câmera/Scanner poderia ser adicionado aqui com expo-camera */}
      
    </Tab.Navigator>
  );
}
