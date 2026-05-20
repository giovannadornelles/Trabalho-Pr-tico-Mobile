import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import { supabase } from '../supabase';
import { useAuth } from '../contexts/AuthContext';

export default function GroupDetailsScreen({ route }) {
  const { groupId, groupName } = route.params;
  const { user } = useAuth();
  
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados do Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [image, setImage] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchExpenses = async () => {
    const { data, error } = await supabase
      .from('expenses')
      .select('*, users(name)')
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });
      
    if (!error && data) setExpenses(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchExpenses();
  }, [groupId]);

  // Integração Nativa 1: Câmera/Galeria
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
      base64: true, // Precisamos do base64 para facilitar o upload
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const handleSaveExpense = async () => {
    if (!description || !amount) return Alert.alert('Erro', 'Preencha a descrição e o valor.');
    setSaving(true);

    let receipt_url = null;

    // Se o usuário escolheu uma imagem, fazemos o upload pro Supabase Storage
    if (image && image.base64) {
      const filePath = `${user.id}/${Date.now()}.jpg`;
      const { data, error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(filePath, decode(image.base64), { contentType: 'image/jpeg' });

      if (uploadError) {
        Alert.alert('Erro no upload', uploadError.message);
        setSaving(false);
        return;
      }
      
      // Pega a URL pública da imagem recém salva
      const { data: publicUrlData } = supabase.storage.from('receipts').getPublicUrl(filePath);
      receipt_url = publicUrlData.publicUrl;
    }

    // Salva a despesa no banco de dados
    const { error: insertError } = await supabase
      .from('expenses')
      .insert([{
        group_id: groupId,
        paid_by: user.id,
        amount: parseFloat(amount.replace(',', '.')),
        description,
        receipt_url
      }]);

    if (insertError) {
      Alert.alert('Erro', insertError.message);
    } else {
      setModalVisible(false);
      setDescription('');
      setAmount('');
      setImage(null);
      fetchExpenses(); // Recarrega a lista
    }
    setSaving(false);
  };

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color="#0066cc" /></View>;

  return (
    <View style={styles.container}>
      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20 }}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma despesa registrada ainda.</Text>}
        renderItem={({ item }) => (
          <View style={styles.expenseCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.expenseDesc}>{item.description}</Text>
              <Text style={styles.expenseUser}>Pago por: {item.users?.name || 'Usuário'}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.expenseAmount}>R$ {item.amount.toFixed(2)}</Text>
              {item.receipt_url && <Text style={styles.receiptBadge}>Com Recibo</Text>}
            </View>
          </View>
        )}
      />

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>+ Despesa</Text>
      </TouchableOpacity>

      {/* Modal Obrigatório de Nova Despesa */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Adicionar Despesa</Text>
            
            <TextInput style={styles.input} placeholder="Descrição (ex: Mercado)" value={description} onChangeText={setDescription} />
            <TextInput style={styles.input} placeholder="Valor (R$)" value={amount} onChangeText={setAmount} keyboardType="numeric" />
            
            <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
              <Text style={styles.imageButtonText}>{image ? 'Imagem selecionada! Trocar?' : '📸 Anexar Recibo'}</Text>
            </TouchableOpacity>

            {saving ? (
              <ActivityIndicator size="large" color="#0066cc" style={{ marginTop: 20 }}/>
            ) : (
              <View style={styles.modalActions}>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelButton}>
                  <Text style={styles.cancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSaveExpense} style={styles.saveButton}>
                  <Text style={styles.saveText}>Salvar Despesa</Text>
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
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { textAlign: 'center', color: '#666', marginTop: 50, fontSize: 16 },
  expenseCard: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 1 },
  expenseDesc: { fontSize: 16, fontWeight: 'bold' },
  expenseUser: { fontSize: 12, color: '#666', marginTop: 4 },
  expenseAmount: { fontSize: 16, fontWeight: 'bold', color: '#cc0000' },
  receiptBadge: { fontSize: 10, color: '#fff', backgroundColor: '#0066cc', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 4 },
  fab: { position: 'absolute', bottom: 20, right: 20, backgroundColor: '#cc0000', padding: 15, borderRadius: 30, elevation: 5 },
  fabText: { color: '#fff', fontWeight: 'bold' },
  modalOverlay: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 10 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 15, borderRadius: 8, marginBottom: 15 },
  imageButton: { backgroundColor: '#e0e0e0', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 20 },
  imageButtonText: { color: '#333', fontWeight: 'bold' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end' },
  cancelButton: { padding: 10, marginRight: 10 },
  cancelText: { color: '#cc0000', fontWeight: 'bold' },
  saveButton: { backgroundColor: '#0066cc', padding: 10, borderRadius: 8, paddingHorizontal: 20 },
  saveText: { color: '#fff', fontWeight: 'bold' }
});