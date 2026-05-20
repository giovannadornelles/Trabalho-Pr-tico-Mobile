import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, ActivityIndicator, Modal, TextInput, Alert } from 'react-native';
import { supabase } from '../supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';

export default function GroupsScreen() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Estados para o Modal de criação
  const [modalVisible, setModalVisible] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [creating, setCreating] = useState(false);

  const { user } = useAuth();
  const navigation = useNavigation();

  const fetchGroups = async () => {
    const { data, error } = await supabase
      .from('groups')
      .select('id, name, created_at')
      .order('created_at', { ascending: false });
      
    if (!error && data) setGroups(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchGroups().then(() => setRefreshing(false));
  }, []);

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return Alert.alert('Erro', 'Digite um nome para o grupo.');
    setCreating(true);

    // 1. Cria o grupo
    const { data: groupData, error: groupError } = await supabase
      .from('groups')
      .insert([{ name: newGroupName }])
      .select()
      .single();

    if (groupError) {
      Alert.alert('Erro ao criar grupo', groupError.message);
      setCreating(false);
      return;
    }

    // 2. Adiciona o usuário atual como membro do grupo
    const { error: memberError } = await supabase
      .from('group_members')
      .insert([{ group_id: groupData.id, user_id: user.id }]);

    if (memberError) {
      Alert.alert('Erro ao adicionar membro', memberError.message);
    } else {
      setModalVisible(false);
      setNewGroupName('');
      fetchGroups(); // Atualiza a lista na tela
    }
    setCreating(false);
  };

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color="#0066cc" /></View>;

  return (
    <View style={styles.container}>
      {groups.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>Você ainda não faz parte de nenhum grupo.</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => setModalVisible(true)}>
            <Text style={styles.primaryButtonText}>Criar meu primeiro grupo</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{ padding: 20 }}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.groupCard}
              onPress={() => navigation.navigate('GroupDetails', { groupId: item.id, groupName: item.name })}
            >
              <Text style={styles.groupName}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {groups.length > 0 && (
        <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
          <Text style={styles.fabText}>+ Novo Grupo</Text>
        </TouchableOpacity>
      )}

      {/* Modal de Criação de Grupo */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Novo Grupo</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Ex: Churrasco, Viagem..." 
              value={newGroupName} 
              onChangeText={setNewGroupName} 
            />
            {creating ? (
              <ActivityIndicator size="large" color="#0066cc" />
            ) : (
              <View style={styles.modalActions}>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelButton}>
                  <Text style={styles.cancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleCreateGroup} style={styles.saveButton}>
                  <Text style={styles.saveText}>Criar</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
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
  fabText: { color: '#fff', fontWeight: 'bold' },
  modalOverlay: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 10 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 15, borderRadius: 8, marginBottom: 20 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end' },
  cancelButton: { padding: 10, marginRight: 10 },
  cancelText: { color: '#cc0000', fontWeight: 'bold' },
  saveButton: { backgroundColor: '#0066cc', padding: 10, borderRadius: 8, paddingHorizontal: 20 },
  saveText: { color: '#fff', fontWeight: 'bold' }
});