import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import GroupsStack from './GroupsStack';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function AppRoutes() {
  return (
    <Tab.Navigator screenOptions={{ headerTitleAlign: 'center', tabBarLabelPosition: 'beside-icon' }}>
      <Tab.Screen 
        name="Grupos" 
        component={GroupsStack} 
        options={{ headerShown: false, tabBarIconStyle: { display: 'none' } }} 
      />
      <Tab.Screen 
        name="Perfil" 
        component={ProfileScreen} 
        options={{ tabBarIconStyle: { display: 'none' } }} 
      />
    </Tab.Navigator>
  );
}