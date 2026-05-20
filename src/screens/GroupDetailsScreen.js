import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function GroupDetailsScreen({ route }) {
  const { groupId, groupName } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Despesas de {groupName}</Text>
      <Text>Em breve: Lista de contas e cálculo de balanço aqui.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
});