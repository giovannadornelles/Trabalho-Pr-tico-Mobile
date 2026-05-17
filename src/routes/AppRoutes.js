import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import GroupsScreen from '../screens/GroupsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function AppRoutes() {
  return (
    <Tab.Navigator screenOptions={{ headerTitleAlign: 'center', tabBarLabelPosition: 'beside-icon' }}>
      <Tab.Screen 
        name="Meus Grupos" 
        component={GroupsScreen} 
        options={{ tabBarIconStyle: { display: 'none' } }} 
      />
      <Tab.Screen 
        name="Perfil" 
        component={ProfileScreen} 
        options={{ tabBarIconStyle: { display: 'none' } }} 
      />
    </Tab.Navigator>
  );
}