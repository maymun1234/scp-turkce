import Feather from '@expo/vector-icons/Feather';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useTheme } from '@react-navigation/native';
import { Stack } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import AdBanner from "../../components/AdBanner";
import SetupTerminal from '../../components/setup';
import { useReadCount } from '../../hooks/usereactcount';
import { useScpData } from '../_layout';
import { ScpListItem } from './ScpListItem';
// 👇 AdBanner'ı import etmeyi unutma (Yolunu projene göre düzenle)
import NetInfo from '@react-native-community/netinfo'; // 👈 1. EKLE
import OnlineSuggestionWidget from '../../components/mainpagerecommend'; // 👈 YENİ
import UserStatsWidget from '../../components/userstats'; // 👈 YENİ
import { CONFIG } from '../../constants/config';
// ✅ RENKLİ VE İKONLU TAG LİSTESİ
const TAG_FILTERS = [
  { id: 'all', label: 'Önerilenler', color: '#7f8c8d', icon: 'layer-group' },
 
  { id: 'insansı', label: 'İnsansı', color: '#3498db', icon: 'user-alt' },
  { id: 'canlı', label: 'Canlı', color: '#1abc9c', icon: 'leaf' },
  { id: 'zihin-etkileyen', label: 'Zihin Etkileyen', color: '#9b59b6', icon: 'brain' },
  { id: 'bilişsel-tehlike', label: 'Bilişsel Tehlike', color: '#e67e22', icon: 'eye-slash' },
  { id: 'otonom', label: 'Otonom', color: '#34495e', icon: 'robot' },
  { id: 'yapı', label: 'Yapı', color: '#95a5a6', icon: 'building' },
];

export default function HomeScreen() {

  const scpData = useScpData();
  const { colors } = useTheme();
  const readCount = useReadCount();
  const [activeTag, setActiveTag] = useState('all'); 
  const [readStatus, setReadStatus] = useState<boolean[]>(new Array(6000).fill(false));
  const [savedStatus, setSavedStatus] = useState<boolean[]>(new Array(6000).fill(false));
  const [modalVisible, setModalVisible] = useState(false);
  const loadStatuses = async () => {
    try {
      const [readJson, savedJson] = await Promise.all([
        AsyncStorage.getItem('@readStatus'),
        AsyncStorage.getItem('@savedStatus')
      ]);
      setReadStatus(readJson ? JSON.parse(readJson) : new Array(6000).fill(false));
      setSavedStatus(savedJson ? JSON.parse(savedJson) : new Array(6000).fill(false));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { loadStatuses(); }, []);
  useFocusEffect(useCallback(() => { loadStatuses(); }, []));


  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // İnternet durumunu dinle
    const unsubscribe = NetInfo.addEventListener(state => {
      // state.isConnected null olabilir, false fallback'i ekledik
      setIsConnected(!!state.isConnected);
    });

    return () => unsubscribe();
  }, []);
 
  // ✅ FİLTRELEME MANTIĞI
  const filteredData = scpData
    ? scpData.filter((item) => {
        const codeNumber = parseInt(item.code.replace('SCP-', ''), 10);
        const itemIndex = Number.isNaN(codeNumber) ? -1 : codeNumber - 1;
        if (itemIndex < 0) return false;

        const isRead = readStatus[itemIndex];

        // 1. KURAL: Okunmuşsa GÖSTERME
        if (isRead) return false;

        // 2. KURAL: Tag Filtresi
        if (activeTag === 'all') return true;
        return item.tags ? item.tags.toLowerCase().includes(activeTag.toLowerCase()) : false;
      })
    : [];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: 'SCP Türkçe ',
          headerStyle: { backgroundColor: colors.background,    },
          headerTitleStyle: {  fontSize: 20, fontFamily: 'Inter', },
          headerRight: () => (
  <UserStatsWidget 
     readCount={readCount} 
     totalCount={CONFIG.TOTAL_SCP_COUNT} 
  />
),
        }}
      />
      
      {/* ✅ CHIPS (Yatay Filtreler) */}
      <View style={styles.chipsWrapper}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.chipsContainer}
        >
          {TAG_FILTERS.map((tag) => {
            const isActive = activeTag === tag.id;
            const activeColor = tag.color || colors.text;
            const backgroundColor = isActive ? activeColor : 'transparent';
            const borderColor = isActive ? activeColor : '#48484a';
            const textColor = isActive ? '#fff' : colors.text;

            return (
              <Pressable
                key={tag.id}
                onPress={() => setActiveTag(tag.id)}
                style={[
                  styles.chip,
                  { 
                    backgroundColor: backgroundColor,
                    borderColor: borderColor,
                    opacity: isActive ? 1 : 0.7
                  }
                ]}
              >
                {tag.icon && (
                   <FontAwesome5 
                     name={tag.icon} 
                     size={12} 
                     color={textColor} 
                     style={{ marginRight: 6 }} 
                   />
                )}
                <Text style={[styles.chipText, { color: textColor }]}>
                  {tag.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
       
      </View>

      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.code}
        
        // 👇 REKLAM BANNER'I BURAYA EKLENDİ
        ListHeaderComponent={
        
          <View style={{ marginBottom: 10 }}> 
           
            {/* <AdBanner />  */}
      <AdBanner />
      
           {activeTag === 'all' && (
                <OnlineSuggestionWidget 
              isConnected={isConnected} 
              readStatus={readStatus}  // 👈 BUNU EKLEMEYİ UNUTMA
          />
             )}
             
          </View>
        }

        renderItem={({ item }) => {
          const codeNumber = parseInt(item.code.replace('SCP-', ''), 10);
          const itemIndex = Number.isNaN(codeNumber) ? -1 : codeNumber - 1;
          const isRead = itemIndex >= 0 ? (readStatus[itemIndex] || false) : false;
          const isSaved = itemIndex >= 0 ? (savedStatus[itemIndex] || false) : false;
          return <ScpListItem item={item} isRead={isRead} isSaved={isSaved} from='index'/>;
        }}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="check-circle" size={50} color={colors.text} style={{ opacity: 0.3, marginBottom: 15 }} />
            <Text style={[styles.emptyText, { color: colors.text }]}>
              {activeTag === 'all' 
                ? "Harika! Tüm SCP'leri okudun. 🎉" 
                : `"${TAG_FILTERS.find(t => t.id === activeTag)?.label}" etiketinde okunmamış SCP kalmadı.`}
            </Text>
            {activeTag !== 'all' && (
              <Pressable onPress={() => setActiveTag('all')} style={styles.resetButton}>
                <Text style={styles.resetButtonText}>Tümünü Göster</Text>
              </Pressable>
            )}
          </View>
        }
      />
      <SetupTerminal onComplete={() => {}} />
    </View>
   
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { paddingHorizontal: 15, paddingBottom: 30 },
  
  chipsWrapper: {
    paddingVertical: 12,
   
    marginBottom: 0, // AdBanner ile aradaki boşluğu ListHeaderComponent'e verdim
    borderBottomColor: '#b7b7bfff',
    borderWidth: 0,
  },
  chipsContainer: {
    paddingHorizontal: 15,
    gap: 10,
    
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  chipText: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  
  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    paddingHorizontal: 40,
  },
  emptyText: { 
    textAlign: 'center', 
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 20,
    lineHeight: 22,
  },
  resetButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#333',
    borderRadius: 8,
  },
  resetButtonText: {
    color: '#fff',
    fontWeight: '600',
  }
});