import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ActivityIndicator 
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);
  
  // Pegamos as funções que criamos lá no AuthContext
  const { signIn, signUp } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Atenção', 'Preencha todos os campos.');
    setLoadingAction(true);
    const { error } = await signIn(email, password);
    if (error) Alert.alert('Erro', error.message);
    setLoadingAction(false);
  };

  const handleSignUp = async () => {
    if (!email || !password) return Alert.alert('Atenção', 'Preencha todos os campos.');
    setLoadingAction(true);
    const { error } = await signUp(email, password);
    if (error) Alert.alert('Erro', error.message);
    else Alert.alert('Sucesso!', 'Conta criada. Você já pode entrar.');
    setLoadingAction(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Divisão de Despesas</Text>
      
      <TextInput 
        style={styles.input} 
        placeholder="E-mail" 
        value={email} 
        onChangeText={setEmail} 
        autoCapitalize="none" 
        keyboardType="email-address" 
      />
      
      <TextInput 
        style={styles.input} 
        placeholder="Senha" 
        value={password} 
        onChangeText={setPassword} 
        secureTextEntry 
      />
      
      {loadingAction ? (
        <ActivityIndicator size="large" color="#0066cc" style={{ marginTop: 20 }} />
      ) : (
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Entrar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.button, styles.buttonOutline]} onPress={handleSignUp}>
            <Text style={styles.buttonOutlineText}>Cadastrar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonContainer: {
    marginTop: 10,
  },
  button: {
    backgroundColor: '#0066cc',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#0066cc',
  },
  buttonOutlineText: {
    color: '#0066cc',
    fontWeight: 'bold',
    fontSize: 16,
  },
});