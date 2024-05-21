import { Tabs } from 'expo-router';
import React from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function Layout() {
  return (
    <Tabs>
      <Tabs.Screen name='profile' options={{ headerTitle: 'Profile', tabBarIcon: () => <Ionicons name="person" size={25} /> }} />
      <Tabs.Screen name='checkin' options={{ headerTitle: 'Check In', tabBarIcon: () => <Ionicons name="checkmark-circle" size={25} /> }} />
    </Tabs>
  );
}
