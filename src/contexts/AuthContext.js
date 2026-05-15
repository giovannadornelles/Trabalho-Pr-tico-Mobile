import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../supabase';

// Cria o contexto vazio
export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Busca a sessão atual assim que o app abre
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Fica escutando mudanças (login, logout, etc)
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Funções de autenticação que vamos usar nas telas
  const signIn = async (email, password) => supabase.auth.signInWithPassword({ email, password });
  const signUp = async (email, password) => supabase.auth.signUp({ email, password });
  const signOut = async () => supabase.auth.signOut();

  return (
    <AuthContext.Provider value={{ session, user, signIn, signUp, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook customizado para facilitar o uso nas telas
export const useAuth = () => useContext(AuthContext);