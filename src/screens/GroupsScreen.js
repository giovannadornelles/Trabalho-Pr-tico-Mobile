import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, ActivityIndicator, Modal, TextInput, Alert } from 'react-native';
import { supabase } from '../supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';

export default function GroupsScreen() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Estados para Modal de Criação
  const [modalVisible, setModalVisible] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [creating, setCreating] = useState(false);

  // Estados para Modal de Entrada por Código
  const [joinModalVisible, setJoinModalVisible] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [joining, setJoining] = useState(false);

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

    const { error: memberError } = await supabase
      .from('group_members')
      .insert([{ group_id: groupData.id, user_id: user.id }]);

    if (memberError) {
      Alert.alert('Erro ao adicionar membro', memberError.message);
    } else {
      setModalVisible(false);
      setNewGroupName('');
      fetchGroups(); 
    }
    setCreating(false);
  };

  const handleJoinGroup = async () => {
    if (!inviteCode.trim()) return Alert.alert('Erro', 'Cole o código do grupo.');
    setJoining(true);

    const { error } = await supabase
      .from('group_members')
      .insert([{ group_id: inviteCode.trim(), user_id: user.id }]);

    if (error) {
      Alert.alert('Erro', 'Código inválido ou você já está no grupo.');
    } else {
      setJoinModalVisible(false);
      setInviteCode('');
      fetchGroups();
    }
    setJoining(false);
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
          <TouchableOpacity style={[styles.primaryButton, styles.secondaryButton]} onPress={() => setJoinModalVisible(true)}>
            <Text style={styles.secondaryButtonText}>Entrar com um código</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={groups}
            keyExtractor={(item) => item.id}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.groupCard}
                onPress={() => navigation.navigate('GroupDetails', { groupId: item.id, groupName: item.name })}
              >
                <Text style={styles.groupName}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
          
          {/* Botões flutuantes inferiores divididos na tela */}
          <View style={styles.bottomButtonsContainer}>
            <TouchableOpacity style={styles.fabLeft} onPress={() => setJoinModalVisible(true)}>
              <Text style={styles.fabTextLeft}>Entrar c/ Código</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.fabRight} onPress={() => setModalVisible(true)}>
              <Text style={styles.fabTextRight}>+ Novo Grupo</Text>
            </TouchableOpacity>
          </View>
        </>
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

      {/* Modal de Entrar em Grupo */}
      <Modal visible={joinModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Entrar no Grupo</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Cole o código do grupo aqui" 
              value={inviteCode} 
              onChangeText={setInviteCode} 
            />
            {joining ? (
              <ActivityIndicator size="large" color="#0066cc" />
            ) : (
              <View style={styles.modalActions}>
                <TouchableOpacity onPress={() => setJoinModalVisible(false)} style={styles.cancelButton}>
                  <Text style={styles.cancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleJoinGroup} style={styles.saveButton}>
                  <Text style={styles.saveText}>Entrar</Text>
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
  primaryButton: { backgroundColor: '#0066cc', padding: 15, borderRadius: 8, width: '100%', alignItems: 'center', marginBottom: 10 },
  primaryButtonText: { color: '#fff', fontWeight: 'bold' },
  secondaryButton: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#0066cc' },
  secondaryButtonText: { color: '#0066cc', fontWeight: 'bold' },
  groupCard: { backgroundColor: '#fff', padding: 20, borderRadius: 10, marginBottom: 15, elevation: 2 },
  groupName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  bottomButtonsContainer: { position: 'absolute', bottom: 20, width: '100%', flexDirection: 'row', paddingHorizontal: 20, justifyContent: 'space-between' },
  fabLeft: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#0066cc', padding: 15, borderRadius: 30, elevation: 5, flex: 0.48, alignItems: 'center' },
  fabRight: { backgroundColor: '#0066cc', padding: 15, borderRadius: 30, elevation: 5, flex: 0.48, alignItems: 'center' },
  fabTextLeft: { color: '#0066cc', fontWeight: 'bold' },
  fabTextRight: { color: '#fff', fontWeight: 'bold' },
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