// ============================================
// app/(tabs)/favourites.tsx - ARŞİV (Favoriler)
// ============================================
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useTheme } from '@react-navigation/native';
import { Stack } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, StatusBar, StyleSheet, Text, View } from 'react-native';
import IdCardWidget from '../../components/IdCardWidget';
import { useScpData } from '../_layout';
import { ScpListItem } from './ScpListItem';
export default function FavouritesScreen() {
  const scpData = useScpData();
  const { colors } = useTheme();
  const [readStatus, setReadStatus] = useState<boolean[]>(new Array(6000).fill(false));
  const [savedStatus, setSavedStatus] = useState<boolean[]>(new Array(6000).fill(false));

  // 🔁 AsyncStorage'dan durumları yükle
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

  // 📲 İlk açılışta verileri yükle
  useEffect(() => {
    loadStatuses();
  }, []);

  // 🎯 Sayfa her focus olduğunda (geri dönüldüğünde) güncelle
  useFocusEffect(
    useCallback(() => {
      loadStatuses();
    }, [])
  );
 const readCount = readStatus.filter(Boolean).length;
  // 🔍 Sadece kaydedilenleri filtrele
  const filteredData = scpData.filter((item) => {
    const codeNumber = parseInt(item.code.replace('SCP-', ''), 10);
    const index = Number.isNaN(codeNumber) ? -1 : codeNumber - 1;
    return index >= 0 && savedStatus[index];
  });

  // 🔸 Eğer hiç favori yoksa mesaj göster
  if (!scpData || filteredData.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen
          options={{
            title: 'Beğendiklerin',
            headerTitleAlign: 'left',
            headerTitleStyle: { fontWeight: 'bold', fontSize: 24 },
            headerStyle: { backgroundColor: colors.background },
          }}
        />
       {<IdCardWidget />}
      
        <Text style={[styles.emptyText, { color: '#fbd501ff', marginTop: "50%", opacity: 0.7, marginVertical: "auto" }]}>
          Favorilere eklediğiniz SCP'ler burada görünür.
        </Text>
      </View>
    );
  }

  // 🔹 Liste görünümü
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />
      <Stack.Screen
        options={{
          title: 'Beğendiklerin',
          headerTitleAlign: 'left',
          headerTitleStyle: { fontWeight: 'bold', fontSize: 24,  },
          headerStyle: { backgroundColor: colors.background },
        }}
      />
// satırı kaplayan bir buton ekle scpidcard.tsx' gidecek
  

      <FlatList
      
        // Header bileşeni buraya prop olarak verilir
        ListHeaderComponent={<IdCardWidget /> }
        
        // Veri seti
        data={filteredData}
        
        // Her öğe için benzersiz anahtar
        keyExtractor={(item) => item.code}
        
        // Her öğenin nasıl görüneceği
        renderItem={({ item }) => {
          const codeNumber = parseInt(item.code.replace('SCP-', ''), 10);
          const itemIndex = Number.isNaN(codeNumber) ? -1 : codeNumber - 1;
          const isRead = itemIndex >= 0 ? (readStatus[itemIndex] || false) : false;
          const isSaved = itemIndex >= 0 ? (savedStatus[itemIndex] || false) : false;
          
          return (
            <ScpListItem 
              item={item} 
              isRead={isRead} 
              isSaved={isSaved} 
              from='favourites' 
            />
          );
        }}
        
        // Liste stilleri
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { paddingHorizontal: 15, paddingBottom: 30, paddingTop: 15 },
  emptyText: { textAlign: 'center', marginTop: 60, fontSize: 16, lineHeight: 22 },
});
