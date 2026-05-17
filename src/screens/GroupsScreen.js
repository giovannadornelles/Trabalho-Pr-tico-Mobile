import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { supabase } from '../supabase';

export default function GroupsScreen() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchGroups = async () => {
    // Graças ao RLS, essa query só retorna os grupos do usuário logado
    const { data, error } = await supabase
      .from('groups')
      .select('id, name, created_at')
      .order('created_at', { ascending: false });
      
    if (!error && data) {
      setGroups(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchGroups().then(() => setRefreshing(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  // Tratamento de Empty State exigido pelo professor
  if (groups.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>Você ainda não faz parte de nenhum grupo.</Text>
        <TouchableOpacity style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Criar meu primeiro grupo</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.groupCard}>
            <Text style={styles.groupName}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity style={styles.fab}>
        <Text style={styles.fabText}>+ Novo Grupo</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { fontSize: 18, color: '#666', textAlign: 'center', marginBottom: 20 },
  primaryButton: { backgroundColor: '#0066cc', padding: 15, borderRadius: 8 },
  primaryButtonText: { color: '#fff', fontWeight: 'bold' },
  groupCard: { backgroundColor: '#fff', padding: 20, borderRadius: 10, marginBottom: 15, elevation: 2 },
  groupName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  fab: { position: 'absolute', bottom: 20, right: 20, backgroundColor: '#0066cc', padding: 15, borderRadius: 30, elevation: 5 },
  fabText: { color: '#fff', fontWeight: 'bold' }
});