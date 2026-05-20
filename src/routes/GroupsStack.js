import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import GroupsScreen from '../screens/GroupsScreen';
import GroupDetailsScreen from '../screens/GroupDetailsScreen';

const Stack = createNativeStackNavigator();

export default function GroupsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="GroupsList" 
        component={GroupsScreen} 
        options={{ title: 'Meus Grupos' }} 
      />
      <Stack.Screen 
        name="GroupDetails" 
        component={GroupDetailsScreen} 
        options={({ route }) => ({ title: route.params?.groupName || 'Detalhes do Grupo' })} 
      />
    </Stack.Navigator>
  );
}