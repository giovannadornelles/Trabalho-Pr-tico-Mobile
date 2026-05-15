import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import LoginScreen from './src/screens/LoginScreen';

// Componente que decide qual tela mostrar baseado no status de login
const RootNavigator = () => {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  // Se tem sessão, mostraria o app. Por enquanto, só um placeholder.
  // Se não tem, força a ficar na tela de Login.
  return session ? (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Você está logado! A tela Home vem aqui.</Text>
    </View>
  ) : (
    <LoginScreen />
  );
};

export default function App() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}