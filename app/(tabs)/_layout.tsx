import { Tabs } from 'expo-router';
import React from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function Layout() {
  return (
    <Tabs>
      <Tabs.Screen name='profile' options={{ title: 'Профиль', headerTitle: 'Профиль', tabBarIcon: () => <Ionicons name="person" size={25} /> }} />
      <Tabs.Screen name='checkin' options={{ title: 'Отметиться', headerTitle: 'Отметиться', tabBarIcon: () => <Ionicons name="checkmark-circle" size={25} /> }} />
    </Tabs>
  );
}
