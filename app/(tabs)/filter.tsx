// ============================================
// app/(tabs)/explore.tsx - KEŞFET SAYFASI
// ============================================
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, ScrollView, TextInput, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useScpData } from '../_layout';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useTheme,  useFocusEffect} from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { ScpListItem } from './ScpListItem';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Feather from '@expo/vector-icons/build/Feather';
export default function ExploreScreen() {
  const router = useRouter();
  const scpData = useScpData();


  const params = useLocalSearchParams();
  const { colors } = useTheme();
  const [selectedClass, setSelectedClass] = useState<'Tümü' | 'Güvenli' | 'Euclid' | 'Keter'>('Tümü');
  const [readFilter, setReadFilter] = useState<'Tümü' | 'Okundu' | 'Okunmadı'>('Tümü');
  const [readStatus, setReadStatus] = useState<boolean[]>(new Array(6000).fill(false));
  const [savedStatus, setSavedStatus] = useState<boolean[]>(new Array(6000).fill(false));
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showClassDropdown, setShowClassDropdown] = useState(false);
const [showReadDropdown, setShowReadDropdown] = useState(false);

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

const [lastParams, setLastParams] = useState<string>('');

useEffect(() => {
  // Parametrelerin değişip değişmediğini kontrol et
  const currentParams = JSON.stringify(params);
  if (currentParams === lastParams) return; // Aynı parametreler, güncelleme
  
  setLastParams(currentParams);
  
  if (params.class) {
    const classParam = String(params.class).toLowerCase();
    if (classParam.includes('güvenli') || classParam.includes('safe')) {
      setSelectedClass('Güvenli');
    } else if (classParam.includes('euclid') || classParam.includes('öklid')) {
      setSelectedClass('Euclid');
    } else if (classParam.includes('keter') || classParam.includes('tehlikeli')) {
      setSelectedClass('Keter');
    } else {
      setSelectedClass('Tümü'); // 👈 Parametre yoksa sıfırla
    }
  } else {
    setSelectedClass('Tümü'); // 👈 Parametre yoksa sıfırla
  }
  
  if (params.readStatus) {
    const readParam = String(params.readStatus);
    if (readParam === 'Okundu') {
      setReadFilter('Okundu');
    } else if (readParam === 'Okunmadı') {
      setReadFilter('Okunmadı');
    } else {
      setReadFilter('Tümü');
    }
  } else {
    setReadFilter('Tümü');
  }
  
  if (params.search) {
    setSearchQuery(String(params.search));
  } else {
    setSearchQuery('');
  }
}, [params]);




  const getObjectClass = (text: string | undefined): string => {
    if (!text) return '';
    const lines = text.split('\n');
    for (let line of lines) {
      line = line.trim();
      const match = line.match(/Nesne\s*Sınıfı\s*:\s*(.+)/i);
      if (match) {
        const cls = match[1].toLowerCase();
        if (cls.includes('güvenli') || cls.includes('safe')) return 'güvenli';
        if (cls.includes('euclid')) return 'euclid';
        if (cls.includes('keter') || cls.includes('tehlikeli')) return 'keter';
        return cls;
      }
    }
    return '';
  };
   useEffect(() => {
      loadStatuses();
    }, []);
  
    // 🎯 SCP detay sayfasından geri dönüldüğünde otomatik yenile
    useFocusEffect(
      useCallback(() => {
        loadStatuses();
      }, [])
    );


  // --- Sınıf ve Okuma Durumu sayacı ---
const classCounts = useMemo(() => {
  const counts = { Tümü: scpData.length, Güvenli: 0, Euclid: 0, Keter: 0 };
  scpData.forEach(item => {
    const cls = getObjectClass(item.text);
    if (cls === 'güvenli') counts.Güvenli++;
    else if (cls === 'euclid') counts.Euclid++;
    else if (cls === 'keter') counts.Keter++;
  });
  return counts;
}, [scpData]);

const readCounts = useMemo(() => {
  let okundu = 0, okunmadi = 0;
  scpData.forEach(item => {
    const codeNumber = parseInt(item.code.replace('SCP-', ''), 10);
    const itemIndex = Number.isNaN(codeNumber) ? -1 : codeNumber - 1;
    if (itemIndex >= 0) {
      const isRead = readStatus[itemIndex] || false;
      if (isRead) okundu++; else okunmadi++;
    }
  });
  return { Tümü: scpData.length, Okundu: okundu, Okunmadı: okunmadi };
}, [scpData, readStatus]);

  const filteredData = useMemo(() => {
    let result = scpData;

    // Arama filtresi
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.code.toLowerCase().includes(query) ||
        item.title.toLowerCase().includes(query) ||
        (item.text && item.text.toLowerCase().includes(query))
      );
    }

    // Sınıf filtresi
    if (selectedClass !== 'Tümü') {
      result = result.filter(item => {
        const cls = getObjectClass(item.text);
        return (
          (selectedClass === 'Güvenli' && cls === 'güvenli') ||
          (selectedClass === 'Euclid' && cls === 'euclid') ||
          (selectedClass === 'Keter' && cls === 'keter')
        );
      });
    }

    // Okuma durumu filtresi
    if (readFilter !== 'Tümü') {
      result = result.filter(item => {
        const codeNumber = parseInt(item.code.replace('SCP-', ''), 10);
        const itemIndex = Number.isNaN(codeNumber) ? -1 : codeNumber - 1;
        if (itemIndex < 0) return false;
        const isRead = readStatus[itemIndex] || false;
        return readFilter === 'Okundu' ? isRead : !isRead;
      });
    }

    return result;
  }, [scpData, selectedClass, readFilter, readStatus, searchQuery]);

  if (!scpData || scpData.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle="light-content" />
        <Text style={[styles.emptyText, { color: colors.text, opacity: 0.8 }]}>
          SCP verisi yükleniyor veya bulunamadı...
        </Text>
      </View>
    );
  }

 return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />
      <Stack.Screen options={{ headerShown: false }} />

      {/* Arama ve Rastgele SCP */}
     <View style={[styles.searchContainer, { backgroundColor: colors.background }]}>
  <View style={styles.searchRow}>
    {/* Search Input */}
    <View style={styles.searchInputWrapper}>
      <TextInput
        style={[styles.searchInput, { color: colors.text, borderColor: '#48484a' }]}
        placeholder="SCP ara... (kod, başlık veya içerik)"
        placeholderTextColor="#8e8e93"
        value={searchQuery}
        onChangeText={setSearchQuery}
        autoCorrect={false}
        autoCapitalize="none"
      />
      {searchQuery.length > 0 && (
        <Pressable style={styles.clearButton} onPress={() => setSearchQuery('')}>
          <Text style={styles.clearButtonText}>✕</Text>
        </Pressable>
      )}
    </View>

    {/* Random Button */}
    <Pressable 
      style={styles.randomButton}
      onPress={() => {
        if (filteredData.length > 0) {
          const randomIndex = Math.floor(Math.random() * filteredData.length);
          const randomItem = filteredData[randomIndex];
          router.push({ 
            pathname: '/[code]',
            params: { 
              code: randomItem.code,
              scp: JSON.stringify(randomItem),
              from: 'filter'
            } 
          });
        }
      }}
    >
      <FontAwesome5 name="dice" size={24} color="white" />
    </Pressable>
  </View>
</View>

      {/* Filtreler - Dropdown */}
      <View style={styles.filterWrapper}>
        <View style={styles.dropdownContainer}>
          {/* Nesne Sınıfı Dropdown */}
          <View style={styles.dropdownItem}>
            <Pressable 
              style={[styles.dropdownButton, { borderColor: '#48484a' }]}
              onPress={() => setShowClassDropdown(!showClassDropdown)}
            >
              <Text style={[styles.dropdownButtonText, { color: colors.text }]}>
                {selectedClass === 'Tümü' ? '📋 Nesne Sınıfı' : ` ${selectedClass} (${classCounts[selectedClass as keyof typeof classCounts]})`}
              </Text>
              <Text style={[styles.dropdownArrow, { color: colors.text }]}>
                 {showClassDropdown ? <Feather name="chevron-up" size={24} /> : <Feather name="chevron-down" size={24} />}
              </Text>
            </Pressable>
            
            {showClassDropdown && (
              <View style={[styles.dropdownMenu, { backgroundColor: colors.card, borderColor: '#48484a' }]}>
                {['Tümü', 'Güvenli', 'Euclid', 'Keter'].map(cls => {
                  const isActive = selectedClass === cls;
                  let activeColor = '#e8e8f1ff';
                  if (cls === 'Güvenli') activeColor = '#34c759';
                  else if (cls === 'Euclid') activeColor = '#f1c40f';
                  else if (cls === 'Keter') activeColor = '#e74c3c';

                    return (
    <Pressable
      key={cls}
      style={[
        styles.dropdownMenuItem,
        isActive && { backgroundColor: activeColor + '22' }
      ]}
      onPress={() => {
        setSelectedClass(cls as any);
        setShowClassDropdown(false);
      }}
    >
     <Text style={[styles.dropdownMenuText, { color: isActive ? activeColor : colors.text }]}>
  {isActive && '✓ '}
  {cls} ({classCounts[cls as keyof typeof classCounts]})
</Text>
    </Pressable>
  );
})}
              </View>
            )}
          </View>

          {/* Okuma Durumu Dropdown */}
          <View style={styles.dropdownItem}>
            <Pressable 
              style={[styles.dropdownButton, { borderColor: '#48484a' }]}
              onPress={() => setShowReadDropdown(!showReadDropdown)}
            >
              <Text style={[styles.dropdownButtonText, { color: colors.text }]}>
                {readFilter === 'Tümü' ? '👁️ Okuma Durumu' : ` ${readFilter} (${readCounts[readFilter as keyof typeof readCounts]})`}
              </Text>
              <Text style={[styles.dropdownArrow, { color: colors.text }]}>
                {showReadDropdown ? <Feather name="chevron-up" size={24} /> : <Feather name="chevron-down" size={24} />}
              </Text>
            </Pressable>
            
            {showReadDropdown && (
              <View style={[styles.dropdownMenu, { backgroundColor: colors.card, borderColor: '#48484a' }]}>
                {['Tümü', 'Okundu', 'Okunmadı'].map(filter => {
                  const isActive = readFilter === filter;
                  const activeColor = '#007aff';
                  
                  return (
                    <Pressable
                      key={filter}
                      style={[
                        styles.dropdownMenuItem,
                        isActive && { backgroundColor: activeColor + '22' }
                      ]}
                      onPress={() => {
                        setReadFilter(filter as any);
                        setShowReadDropdown(false);
                      }}
                    >
                     <Text style={[styles.dropdownMenuText, { color: isActive ? activeColor : colors.text }]}>
  {isActive && '✓ '}
  {filter} ({readCounts[filter as keyof typeof readCounts]})
</Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>
        </View>
      </View>

      {/* SCP Listesi */}
      <FlatList
        data={filteredData}
        keyExtractor={item => item.code}
        renderItem={({ item }) => {
          const codeNumber = parseInt(item.code.replace('SCP-', ''), 10);
          const itemIndex = Number.isNaN(codeNumber) ? -1 : codeNumber - 1;
          const isRead = itemIndex >= 0 ? (readStatus[itemIndex] || false) : false;
          const isSaved = itemIndex >= 0 ? (savedStatus[itemIndex] || false) : false;
          return <ScpListItem item={item} isRead={isRead} isSaved={isSaved} from='filter' />;
        }}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchContainer: { 
  paddingTop: 50, 
  paddingHorizontal: 15, 
  paddingBottom: 15, 
  borderBottomWidth: 1, 
  borderBottomColor: '#3a3a3c', 
  backgroundColor: '#a6a6baff' 
},
searchRow: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10,
  marginBottom: 0,
},
searchInputWrapper: { 
  position: 'relative', 
  flex: 1, // Search input'un kalan alanı kaplaması için
  
},
searchInput: { 
  height: 44, 
  width: "100%", // auto yerine 100% 
  borderWidth: 1, 
  borderRadius: 10, 
  paddingHorizontal: 15, 
  paddingRight: 45, 
  textAlignVertical: 'center',
  paddingBottom: 0,
  paddingTop: 0,
  fontSize: 16, 
  backgroundColor: '#1c1c1e' 
},
clearButton: { 
  position: 'absolute', 
  right: 12, 
  top: 0, 
  bottom: 0, 
  justifyContent: 'center', 
  alignItems: 'center', 
  width: 30, 
  height: 44 
},
clearButtonText: { 
  fontSize: 20, 
  color: '#8e8e93', 
  fontWeight: '600' 
},
randomButton: { 
  backgroundColor: '#c0392b', 
  height: 44, // Search input ile aynı yükseklik
  width: 44, // Kare buton
  borderRadius: 8, 
  justifyContent: 'center', 
  alignItems: 'center' 
},
filterWrapper: {},
randomButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  
  filterToggle: {  paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', backgroundColor: '#5454a6ff' },
  filterToggleText: { fontSize: 16, fontWeight: '600' },
  filterContent: { paddingHorizontal: 15, paddingBottom: 15 },
  filterLabel: { fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 8, opacity: 0.7 },
  filterScrollContent: { gap: 8, alignItems: 'center', paddingVertical: 4 },
  filterButton: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8, borderWidth: 1 },
  filterText: { fontSize: 14, fontWeight: '600' },
  listContent: { paddingHorizontal: 15, paddingBottom: 30, paddingTop: 10 },
  emptyText: { textAlign: 'center', marginTop: 40, fontSize: 16 },
  dropdownContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    
  },
  dropdownItem: {
    flex: 1,
    // zIndex kaldırıldı
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,

    backgroundColor: '#1c1c1e',
  },
  dropdownButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dropdownArrow: {
    fontSize: 12,
    marginLeft: 8,
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 4,
    borderRadius: 10,
    borderWidth: 1,
    
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000,
  },
  dropdownMenuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    
  },
  dropdownMenuText: {
    fontSize: 14,
    fontWeight: '500',
  },
});