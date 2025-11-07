import React, { useRef, useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, Linking, Pressable, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack, router,useNavigation } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { IconSymbol } from '@/components/ui/icon-symbol';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Feather from '@expo/vector-icons/Feather';
import { useScpData } from '../_layout';
import {
  PanGestureHandler,
  State,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';

// ✔ Kaydetme (Read Status)
const saveReadStatus = async (list: boolean[]) => {
  try {
    const jsonValue = JSON.stringify(list);
    await AsyncStorage.setItem('@readStatus', jsonValue);
  } catch (e) {
    console.error('Kaydedilemedi', e);
  }
};

// ✔ Okuma (Read Status)
const loadReadStatus = async (): Promise<boolean[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem('@readStatus');
    return jsonValue != null ? JSON.parse(jsonValue) : new Array(6000).fill(false);
  } catch (e) {
    console.error('Yüklenemedi', e);
    return new Array(6000).fill(false);
  }
};




// ✔ Kaydetme (Saved Status)
const saveSavedStatus = async (list: boolean[]) => {
  try {
    const jsonValue = JSON.stringify(list);
    await AsyncStorage.setItem('@savedStatus', jsonValue);
  } catch (e) {
    console.error('Kaydedilemedi', e);
  }
};

// ✔ Okuma (Saved Status)
const loadSavedStatus = async (): Promise<boolean[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem('@savedStatus');
    return jsonValue != null ? JSON.parse(jsonValue) : new Array(6000).fill(false);
  } catch (e) {
    console.error('Yüklenemedi', e);
    return new Array(6000).fill(false);
  }
};

// ✔ SCP Verilerini Yükle - BU KISMI KENDİ VERİ KAYNAKINIZA GÖRE DEĞİŞTİRİN
const loadScpData = async (scpCode: string) => {
  try {
    // Seçenek 1: JSON dosyasından yükle
    // const allData = require('@/data/scp-list.json');
    // return allData.find((item: any) => item.code === scpCode);
    
    // Seçenek 2: AsyncStorage'dan yükle
    const storedData = await AsyncStorage.getItem('@scpData');
    if (storedData) {
      const allData = JSON.parse(storedData);
      return allData.find((item: any) => item.code === scpCode);
    }
    
    // Seçenek 3: API'den yükle
    // const response = await fetch(`https://your-api.com/scp/${scpCode}`);
    // return await response.json();
    
    return null;
  } catch (e) {
    console.error('SCP verisi yüklenemedi', e);
    return null;
  }
};

export default function ScpDetail() {
  const { scp, from } = useLocalSearchParams();
  const { colors } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  
    const scpData = useScpData(); // ← ANAHTAR SATIR!

  const [currentItem, setCurrentItem] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [readStatus, setReadStatus] = useState<boolean[]>([]);
  const [savedStatus, setSavedStatus] = useState<boolean[]>([]);
  const [isRead, setIsRead] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

const [autoMarkRead, setAutoMarkRead] = useState(false);


// Sayfa açıldığında otomatik okundu işaretle


  useEffect(() => {
  const loadAutoMarkRead = async () => {
    try {
      const value = await AsyncStorage.getItem('@autoMarkRead');
      if (value !== null) {
        setAutoMarkRead(value === 'true');
      }
    } catch (e) {
      console.error('Otomatik okundu ayarı yüklenemedi', e);
    }
  };
  loadAutoMarkRead();
}, []);
  // İlk yükleme - parametreden gelen veriyi kullan
  // İlk yükleme - parametreden gelen veriyi kullan



  
  useEffect(() => {
    let scpParam: string | null = null;

    // 1. Parametrenin string mi yoksa dizi mi olduğunu kontrol et
    if (Array.isArray(scp)) {
      scpParam = scp[0]; // Dizi ise ilk elemanı al
    } else if (typeof scp === 'string') {
      scpParam = scp; // String ise doğrudan al
    }

    if (scpParam) {
      try {
        // 2. Önce JSON olarak parse etmeyi dene (belki tüm veriyi yolladınız)
        const parsedItem = JSON.parse(scpParam);
        setCurrentItem(parsedItem);
      } catch (e) {
        // 3. Hata alınırsa, bunun bir JSON değil,
        //    'SCP-173' gibi bir KOD olduğunu varsay ve veriyi yükle.
        console.log("JSON parse hatası, 'loadNewScp' ile yükleniyor:", scpParam);
        loadNewScp(scpParam);
      }
    } else {
      console.error("SCP parametresi bulunamadı.");
      // Burada bir hata ekranı gösterebilirsiniz
    }
  }, [scp]); // 'scp' parametresi değiştiğinde bu blok çalışır

  // Find the SCP index
  const scpIndex = currentItem && currentItem.code 
    ? parseInt(currentItem.code.replace(/[^0-9]/g, ''), 10) - 1 
    : -1;
  const scpNumber = scpIndex + 1;

  // Load read and saved status on mount
  useEffect(() => {
    Promise.all([loadReadStatus(), loadSavedStatus()]).then(([read, saved]) => {
      setReadStatus(read);
      setSavedStatus(saved);
    });
  }, []);

  // Update isRead and isSaved when status or scpIndex changes
  useEffect(() => {
    if (scpIndex >= 0) {
      if (readStatus.length > scpIndex) {
        setIsRead(readStatus[scpIndex]);
      }
      if (savedStatus.length > scpIndex) {
        setIsSaved(savedStatus[scpIndex]);
      }
    }
  }, [readStatus, savedStatus, scpIndex]);




  useEffect(() => {
  if (autoMarkRead && scpIndex >= 0 && currentItem) {
    // Sayfayı en üste scroll yap
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    
    // Biraz gecikme ile işaretle (kullanıcı gerçekten sayfayı açtı mı diye)
    const timer = setTimeout(() => {
      markreadAsRead();
    }, 1000); // 1 saniye sonra işaretle

    return () => clearTimeout(timer);
  }
}, [currentItem, scpIndex, autoMarkRead]);

  // Toggle read status handler
  const toggleRead = async () => {
    if (scpIndex < 0) return;
    const newStatus = [...readStatus];
    newStatus[scpIndex] = !newStatus[scpIndex];
    setReadStatus(newStatus);
    await saveReadStatus(newStatus);
  };

  const markreadAsRead = async () => {
    if (scpIndex < 0) return;
    const newStatus = [...readStatus];
    newStatus[scpIndex] = true;
    setReadStatus(newStatus);
    await saveReadStatus(newStatus);
  };

  // Toggle saved status handler
  const toggleSaved = async () => {
    if (scpIndex < 0) return;
    const newStatus = [...savedStatus];
    newStatus[scpIndex] = !newStatus[scpIndex];
    setSavedStatus(newStatus);
    await saveSavedStatus(newStatus);
  };

const loadNewScp = async (newScpCode: string) => {
  if (!scpData || scpData.length === 0) {
    console.warn('scpData henüz yüklenmedi');
    return;
  }

  setIsLoading(true);
  scrollViewRef.current?.scrollTo({ y: 0, animated: false });

  try {
    // useScpData'dan direkt bul
    const found = scpData.find(item => item.code === newScpCode);

    if (found) {
      setCurrentItem(found);
    } else {
      setCurrentItem({
        code: newScpCode,
        title: 'Bulunamadı',
        text: `SCP "${newScpCode}" listede yok.\n\nToplam ${scpData.length} SCP yüklendi.`,
      });
    }
  } catch (error) {
    console.error('SCP bulunurken hata:', error);
    setCurrentItem({
      code: newScpCode,
      title: 'Hata',
      text: 'Bir hata oluştu.',
    });
  } finally {
    setIsLoading(false);
  }
};

  // Navigation handlers
  const goToPrevious = () => {
  
  if (scpNumber > 1) {
    const prevNumber = scpNumber - 1;
    const prevCode = `SCP-${String(prevNumber).padStart(3, '0')}`;
    loadNewScp(prevCode);
  }
};

const goToNext = () => {
 
  if (scpNumber < 6000) {
    const nextNumber = scpNumber + 1;
    const nextCode = `SCP-${String(nextNumber).padStart(3, '0')}`;
    loadNewScp(nextCode);
  }
};
  if (!currentItem) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#c0392b" />
        <Text style={[styles.errorText, { color: colors.text, marginTop: 16 }]}>
          Yükleniyor...
        </Text>
      </View>
    );
  }
  
  const rawText = currentItem.text || '';
  const match = rawText.match(/Nesne\s*Sınıfı:\s*([^\n]+)/i);
  const objectClass = match ? match[1].trim() : 'Bilinmiyor';

  let classColor = '#ffffff';
  if (/güvenli|safe/i.test(objectClass)) classColor = '#34c759';
  else if (/euclid|öklid/i.test(objectClass)) classColor = '#ffd60a';
  else if (/keter|tehlikeli/i.test(objectClass)) classColor = '#ff3b30';
const navigation = useNavigation();
  const cleanedText = rawText
    .replace(/^Öğe|Madde\s*#:\s*SCP-\d+\s*/i, '')
    .replace(/^Item\s*#:\s*SCP-\d+\s*/i, '')
    .replace(/Nesne\s*Sınıfı:\s*[^\n]+\n?/i, '')
    .replace(/#:\s*SCP-\d+/gi, '')
    .replace(/«\s*SCP-\d+\s*\|\s*SCP-\d+\s*\|\s*SCP-\d+\s*»/gi, '')
    .replace(/\n/g, '\n\n')
    .replace(/^\s+/g, '');

  return (
    <>
      <StatusBar style="light" />
      <Stack.Screen
        key={currentItem?.code}
        options={{
          title: currentItem.title || currentItem.code,
          headerStyle: { 
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          },
          

headerLeft: () => (
  <Pressable 
    onPress={() => {
      // Hangi sayfadan geldiğine göre geri dön
      if (from === 'filter') {
        router.push('/filter');
      } else if (from === 'favourites') {
        router.push('/favourites');
      } else {
        router.push('/');
      }
    }}
    style={{ paddingLeft: 12 }}
  >
    <MaterialIcons name="arrow-back-ios" size={24} color={colors.text} />
  </Pressable>
),
        }}
      />
      
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#c0392b" />
        </View>
      )}
      
      <ScrollView 
        ref={scrollViewRef}
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.contentContainer}
      >
        {currentItem.image && (
          <Image 
            source={{ uri: currentItem.image }} 
            style={styles.image}
            resizeMode="cover"
          />
        )}
        
        <View style={styles.headerCard}>
          <View style={styles.titleRow}>
            <Text style={[styles.code, { color: '#ffffffff' }]}>{currentItem.code}</Text>
            <Text style={[styles.title, { color: colors.text }]}>{currentItem.title}</Text>
          </View>
          
          <View style={styles.metaRow}>
            {currentItem.state && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  📋 {currentItem.state.toLowerCase() === 'active' ? 'Aktif' : currentItem.state}
                </Text>
              </View>
            )}
            {currentItem.rating && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>⭐ {currentItem.rating}</Text>
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.contentCard}>
          <View style={styles.contentHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
              <Text style={[styles.contentTitle, { color: colors.text }]}>Sınıfı: </Text>
              <Pressable
                onPress={() => {
                  router.push({
                    pathname: '/filter', 
                    params: { class: objectClass } 
                  });
                }}
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 6,
                  backgroundColor: classColor + '33',
                  marginLeft: 4,
                }}
              >
                <Text style={{ color: classColor, fontWeight: '600' }}>{objectClass}</Text>
              </Pressable>
            </View>

            <View style={styles.actionButtons}>
              <Pressable
                style={[styles.readButton, isRead && styles.readButtonActive]}
                onPress={toggleRead}
              >
                <Text style={styles.readButtonText}>
                  {isRead ? <Feather name="eye" size={25} color="#e0c00fff" /> : <Feather name="eye-off" size={25} color="#e0c00fff" />}
                </Text>
              </Pressable>
              <Pressable 
                style={[styles.saveButton, isSaved && styles.saveButtonActive]} 
                onPress={toggleSaved}
              >
                <MaterialIcons
                  name={isSaved ? "favorite" : "favorite-border"}
                  size={25} 
                  color="#c0392b"
                />
              </Pressable>
            </View>
          </View>

          <Text style={[styles.text, { color: colors.text, opacity: 0.9 }]}>
            {cleanedText}
          </Text>
        </View>
        
        {currentItem.link && (
          <Pressable 
            style={styles.linkButton}
            onPress={() => Linking.openURL(currentItem.link)}
          >
            <Text style={styles.linkButtonText}>🔗 Orijinal Kaynağı Görüntüle</Text>
          </Pressable>
        )}

        {/* Navigation Buttons */}
        <View style={styles.navigationContainer}>
          <Pressable 
            style={[styles.navButton, scpNumber <= 1 && styles.navButtonDisabled]}
            onPress={goToPrevious}
            disabled={scpNumber <= 1 || isLoading}
          >
            
            
            <Feather name="arrow-left" size={20} color="#c0392b" />
            <Text style={styles.navButtonText}>Önceki</Text>
          </Pressable>

          <Pressable 
            style={[styles.navButton, scpNumber >= 6000 && styles.navButtonDisabled]}
            onPress={goToNext}
            disabled={scpNumber >= 6000 || isLoading}
          >
            <Text style={styles.navButtonText}>Sonraki</Text>
            <Feather name="arrow-right" size={20} color="#c0392b" />
           
          </Pressable>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 999,
  },
  image: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    marginBottom: 16,
  },
  headerCard: {
    backgroundColor: '#c0392b',
    borderRadius: 12,
    padding: 16,
    paddingBottom: 5,
    marginBottom: 12,
    borderWidth: 0,
    borderColor: '#48484a',
  },
  titleRow: {
    marginBottom: 12,
  },
  code: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 38,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 0,
  },
  badge: {
    backgroundColor: '#3a3a3c',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  contentCard: {
    
    borderRadius: 12,
    padding: 16,
    paddingHorizontal: 0,
    marginBottom: 12,
    borderWidth: 1,
    
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
    gap: 8,
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  saveButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonActive: {
    backgroundColor: 'transparent',
  },
  readButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    
  },
  readButtonActive: {
    backgroundColor: 'transparent',
    
  },
  readButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    marginTop: 8,
  },
  linkButton: {
    backgroundColor: '#c0392b',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  linkButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
  },
  navButton: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#c0392b',
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  navButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
});