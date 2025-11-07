import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable } from 'react-native';
import { useScpData } from '../_layout';
import { Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme, useFocusEffect } from '@react-navigation/native';
import { ScpListItem } from './ScpListItem';
import Feather from '@expo/vector-icons/Feather';

export default function HomeScreen() {
  const scpData = useScpData();
  const { colors } = useTheme();
  const [readStatus, setReadStatus] = useState<boolean[]>(new Array(6000).fill(false));
  const [savedStatus, setSavedStatus] = useState<boolean[]>(new Array(6000).fill(false));
  const [showUnreadOnly, setShowUnreadOnly] = useState(true)  ; // ✅ Yeni state

  const loadStatuses = async () => {
    try {
      const [readJson, savedJson] = await Promise.all([
        AsyncStorage.getItem('@readStatus'),
        AsyncStorage.getItem('@savedStatus')
      ]);

      const read = readJson ? JSON.parse(readJson) : new Array(6000).fill(false);
      const saved = savedJson ? JSON.parse(savedJson) : new Array(6000).fill(false);

      setReadStatus(read);
      setSavedStatus(saved);
    } catch (e) {
      console.error('Durum yükleme hatası', e);
    }
  };

  useEffect(() => {
    loadStatuses();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadStatuses();
    }, [])
  );

  // ✅ Filtrelenmiş veri
  const filteredData = showUnreadOnly
    ? scpData.filter((item) => {
        const codeNumber = parseInt(item.code.replace('SCP-', ''), 10);
        const itemIndex = Number.isNaN(codeNumber) ? -1 : codeNumber - 1;
        return itemIndex >= 0 ? !readStatus[itemIndex] : true;
      })
    : scpData;

  if (!scpData || scpData.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen
          options={{
            title: 'SCP Türkçe',
            headerTitleAlign: 'left',
            headerTitleStyle: { fontWeight: 'bold', fontSize: 24 },
            headerStyle: { backgroundColor: colors.background },
          }}
        />
        <Text style={[styles.emptyText, { color: colors.text, opacity: 0.8 }]}>
          SCP verisi yükleniyor veya bulunamadı...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: 'SCP Türkçe',
          headerTitleAlign: 'left',
          headerTitleStyle: { fontWeight: 'bold', fontSize: 24 },
          headerStyle: { backgroundColor: colors.background },
        }}
      />
      
      {/* ✅ Başlık ve Filtre Butonu */}
      <View style={styles.headerRow}>
        <Text style={[styles.h3, { color: colors.text }]}>
          Önerilenler
        </Text>
        <Pressable
          style={[
            styles.filterButton,
            showUnreadOnly && styles.filterButtonActive
          ]}
          onPress={() => setShowUnreadOnly(!showUnreadOnly)}
        >
          <Feather 
            name={showUnreadOnly ? "eye-off" : "eye"} 
            size={18} 
            color={showUnreadOnly ? "#fff" : colors.text} 
          />
          <Text style={[
            styles.filterButtonText,
            { color: showUnreadOnly ? "#fff" : colors.text }
          ]}>
            {showUnreadOnly ? "Okunmamışlar" : "Tümü"}
          </Text>
        </Pressable>
      </View>
 <AdBanner /> {/* 👈 banner burada */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.code}
        renderItem={({ item }) => {
          const codeNumber = parseInt(item.code.replace('SCP-', ''), 10);
          const itemIndex = Number.isNaN(codeNumber) ? -1 : codeNumber - 1;
          const isRead = itemIndex >= 0 ? (readStatus[itemIndex] || false) : false;
          const isSaved = itemIndex >= 0 ? (savedStatus[itemIndex] || false) : false;
          return <ScpListItem item={item} isRead={isRead} isSaved={isSaved} from='index'/>;
        }}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.text }]}>
            Tüm SCP'leri okudunuz! 🎉
          </Text>
        }
      />
    </View>
  );
}
import AdBanner from '../../components/AdBanner';
const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { paddingHorizontal: 15, paddingBottom: 30, paddingTop: 15 },
  emptyText: { textAlign: 'center', marginTop: 40, fontSize: 16 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 10,
    marginTop: 0,
  },
  h3: { 
    fontSize: 20, 
    fontWeight: '600',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#48484a',
  },
  filterButtonActive: {
    backgroundColor: '#c0392b',
    borderColor: '#c0392b',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});