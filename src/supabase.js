import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Suas chaves de conexão
const supabaseUrl = 'https://zvghmyltvkxxyhybpwqf.supabase.co';
const supabaseAnonKey = 'sb_publishable_OiS2clxA9noyvHiDQCgH6A_X3OR4YO4';

// Criando o cliente do Supabase adaptado para o React Native
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});