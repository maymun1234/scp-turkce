// app/(tabs)/_layout.tsx
import React, { useState } from 'react';
import { Tabs } from 'expo-router';
import { HapticTab } from '@/components/haptic-tab';
import Feather from '@expo/vector-icons/Feather';

export default function Layout() {
  const [activeTab, setActiveTab] = useState<'index' | 'filter' | 'favourites' | 'settings'>('index');

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerTitleAlign: 'left',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 24,
        },
        tabBarButton: HapticTab,
        tabBarShowLabel: false,
        tabBarStyle: {
          justifyContent: 'center',
        },
      }}
    >
      {/* Index Tab - Ana Sayfa */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'SCP Türkçe',
          tabBarIcon: ({ color }) => (
            <Feather 
              name="home" 
              size={28} 
              color={activeTab === 'index' ? '#c0392b' : color}
            />
          ),
        }}
        listeners={{
          focus: () => setActiveTab('index'),
        }}
      />

      {/* Filter Tab - Arama */}
      <Tabs.Screen
        name="filter"
        options={{
          title: 'Ara',
          tabBarIcon: ({ color }) => (
            <Feather 
              name="search" 
              size={28} 
              color={activeTab === 'filter' ? '#c0392b' : color}
            />
          ),
        }}
        listeners={{
          focus: () => setActiveTab('filter'),
        }}
      />

      {/* Favourites Tab - Favoriler */}
      <Tabs.Screen
        name="favourites"
        options={{
          title: 'Favoriler',
          tabBarIcon: ({ color }) => (
            <Feather 
              name="grid" 
              size={28} 
              color={activeTab === 'favourites' ? '#c0392b' : color}
            />
          ),
        }}
        listeners={{
          focus: () => setActiveTab('favourites'),
        }}
      />

      {/* Settings Tab - Ayarlar */}
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Ayarlar',
          tabBarIcon: ({ color }) => (
            <Feather 
              name="settings" 
              size={28} 
              color={activeTab === 'settings' ? '#c0392b' : color}
            />
          ),
        }}
        listeners={{
          focus: () => setActiveTab('settings'),
        }}
      />

      {/* Hidden Screens - Tab bar'da gösterilmez */}
      <Tabs.Screen
        name="[code]"
        options={{
          href: null, // Tab bar'da gösterme
          headerShown: true, // Kendi header'ını kullanacak
        }}
      />
      
      <Tabs.Screen
        name="scp_list"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="ScpListItem"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );}