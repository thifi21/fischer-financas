import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Session } from '@supabase/supabase-js';
import { LayoutDashboard as DashboardIcon, Receipt as ReceiptIcon, CreditCard as CardIcon, Home as HomeIcon, Target as TargetIcon } from 'lucide-react-native';
import { DashboardScreen } from '../screens/DashboardScreen';
import { CartoesScreen } from '../screens/CartoesScreen';
import { ContasScreen } from '../screens/ContasScreen';
import { ExtratoScreen } from '../screens/ExtratoScreen';
import { SonhosScreen } from '../screens/SonhosScreen';

const Tab = createBottomTabNavigator();

export function AppNavigator({ session }: { session: Session }) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#10b981',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginBottom: 5 },
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          height: 65,
          paddingBottom: 5,
          paddingTop: 8,
          elevation: 5,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        }
      }}
    >
      <Tab.Screen 
        name="Resumo" 
        options={{ tabBarIcon: ({ color, size }) => <DashboardIcon color={color} size={size} /> }}
      >
        {props => <DashboardScreen {...props} session={session} />}
      </Tab.Screen>

      <Tab.Screen 
        name="Extrato" 
        options={{ tabBarIcon: ({ color, size }) => <ReceiptIcon color={color} size={size} /> }}
      >
        {props => <ExtratoScreen {...props} session={session} />}
      </Tab.Screen>
      
      <Tab.Screen 
        name="Cartões" 
        options={{ tabBarIcon: ({ color, size }) => <CardIcon color={color} size={size} /> }}
      >
        {props => <CartoesScreen {...props} session={session} />}
      </Tab.Screen>

      <Tab.Screen 
        name="Contas" 
        options={{ tabBarIcon: ({ color, size }) => <HomeIcon color={color} size={size} /> }}
      >
        {props => <ContasScreen {...props} session={session} />}
      </Tab.Screen>

      <Tab.Screen 
        name="Sonhos" 
        options={{ tabBarIcon: ({ color, size }) => <TargetIcon color={color} size={size} /> }}
      >
        {props => <SonhosScreen {...props} session={session} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
