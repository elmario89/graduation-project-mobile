import { Tabs } from 'expo-router';
import React from 'react';

export default function Layout() {
  return (
    <Tabs>
      <Tabs.Screen name='profile' options={{ headerTitle: 'Profile' }} />
      <Tabs.Screen name='checkin' options={{ headerTitle: 'Check In' }} />
    </Tabs>
  );
}
