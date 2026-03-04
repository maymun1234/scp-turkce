import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useTheme } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, StatusBar, StyleSheet, Text, View } from 'react-native';

import IdCardWidget from '../../components/IdCardWidget';
import OtherUsersWidget from "../../components/Links/statsWidget";
import { t } from '../../constants/i18n'; // Çeviri fonksiyonu
import { useScpData } from '../_layout';
import { ScpListItem } from './ScpListItem';

export default function FavouritesScreen() {
  const scpData = useScpData();
  const { colors } = useTheme();
  const router = useRouter();
  const [readStatus, setReadStatus] = useState<boolean[]>(new Array(6000).fill(false));
  const [savedStatus, setSavedStatus] = useState<boolean[]>(new Array(6000).fill(false));

  const loadStatuses = async () => {
    try {
      const [readJson, savedJson] = await Promise.all([
        AsyncStorage.getItem('@readStatus'),
        AsyncStorage.getItem('@savedStatus')
      ]);
      setReadStatus(readJson ? JSON.parse(readJson) : new Array(6000).fill(false));
      setSavedStatus(savedJson ? JSON.parse(savedJson) : new Array(6000).fill(false));
    } catch (e) {
      console.error('Durum yükleme hatası', e);
    }
  };

  useEffect(() => { loadStatuses(); }, []);
  useFocusEffect(useCallback(() => { loadStatuses(); }, []));

  const filteredData = scpData.filter((item) => {
    const codeNumber = parseInt(item.code.replace('SCP-', ''), 10);
    const index = Number.isNaN(codeNumber) ? -1 : codeNumber - 1;
    return index >= 0 && savedStatus[index];
  });

  // Ortak Header Bileşeni (Kod tekrarını önlemek için)
  const renderHeader = () => (
    <>
      <Stack.Screen
        options={{
          title: t('favourites_title'),
          headerTitleAlign: 'left',
          headerTitleStyle: { fontWeight: 'bold', fontSize: 24, color: "white" },
          headerStyle: { backgroundColor: '#202022' },
          headerRight: () => <OtherUsersWidget />,
        }}
      />
      <View style={styles.headerContainer}>
        <IdCardWidget />
        
        {/* Satırı kaplayan profil butonu */}
        
      </View>
    </>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />
      
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.code}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: '#fbd501ff' }]}>
            {t('no_favourites_msg')}
          </Text>
        }
        renderItem={({ item }) => {
          const codeNumber = parseInt(item.code.replace('SCP-', ''), 10);
          const itemIndex = Number.isNaN(codeNumber) ? -1 : codeNumber - 1;
          return (
            <ScpListItem 
              item={item} 
              isRead={itemIndex >= 0 ? readStatus[itemIndex] : false} 
              isSaved={itemIndex >= 0 ? savedStatus[itemIndex] : false} 
              from='favourites' 
            />
          );
        }}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerContainer: {
    marginBottom: 10,
  },
  listContent: { paddingHorizontal: 15, paddingBottom: 30, paddingTop: 15 },
  emptyText: { 
    textAlign: 'center', 
    marginTop: 100, 
    fontSize: 16, 
    opacity: 0.7,
    paddingHorizontal: 20
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    marginBottom: 5,
    // Hafif gölge
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  profileButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5
  }
});