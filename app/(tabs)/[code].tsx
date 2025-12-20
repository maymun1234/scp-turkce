import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@react-navigation/native';
import { Stack, router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, BackHandler, Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import AdBanner from '../../components/AdBanner';
import Comments from '../../components/CommentSection';
import ImageCaption from '../../components/imageget';
import RecommendSection from '../../components/recommendsection';
import { HeaderScpNavigation, ScpNavigation } from '../../components/ScpNavigation';
import { logSCPView } from '../../services/scplog';
import { useScpData } from '../_layout';
// ... (Buradaki saveReadStatus, loadReadStatus fonksiyonları aynı kalacak) ...
const saveReadStatus = async (list: boolean[]) => { try { await AsyncStorage.setItem('@readStatus', JSON.stringify(list)); } catch (e) { console.error(e); } };
const loadReadStatus = async (): Promise<boolean[]> => {
  try {
    const v = await AsyncStorage.getItem('@readStatus');
    // Eğer kayıt varsa parse et, yoksa boş dizi
    const savedList = v ? JSON.parse(v) : [];
    
    // 6000 elemanlı, hepsi 'false' olan tertemiz bir dizi oluştur
    const fullList = new Array(6000).fill(false);

    // Kaydedilmiş verileri bu temiz dizinin üzerine yaz
    // Bu sayede dizi her zaman 6000 elemanlı olur ve 'undefined' hatası almazsın
    if (Array.isArray(savedList)) {
        savedList.forEach((val, index) => {
            if (index < 6000) fullList[index] = val;
        });
    }
    return fullList;
  } catch {
    return new Array(6000).fill(false);
  }
};
const saveSavedStatus = async (list: boolean[]) => { try { await AsyncStorage.setItem('@savedStatus', JSON.stringify(list)); } catch (e) { console.error(e); } };
const loadSavedStatus = async (): Promise<boolean[]> => { try { const v = await AsyncStorage.getItem('@savedStatus'); return v ? JSON.parse(v) : new Array(6000).fill(false); } catch { return new Array(6000).fill(false); } };
export default function ScpDetail() {
  const { scp, from } = useLocalSearchParams();
  const { colors } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  
  const scpData = useScpData();

  const [currentItem, setCurrentItem] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
 const [readStatus, setReadStatus] = useState<boolean[]>(new Array(6000).fill(false));
  const [savedStatus, setSavedStatus] = useState<boolean[]>([]);
  const [isRead, setIsRead] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [autoMarkRead, setAutoMarkRead] = useState(false);
  
  const imageCaptionUrl = currentItem?.['image captions'] || '';
    
  // ... (useFocusEffect, useEffect'ler, loadStatuses vb. burası aynı kalıyor) ...
  // ... (Kod tekrarı olmaması için ara kısımları atlıyorum, seninkilerle aynı) ...
  
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (from === 'filter') router.push('/filter');
        else if (from === 'favourites') router.push('/favourites');
        else router.push('/');
        return true;
      };
      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => backHandler.remove();
    }, [from])
  );

  useEffect(() => {
     // ... (loadAutoMarkRead ve scp parametre işleme kodları aynı) ...
     const loadAutoMarkRead = async () => {
        try {
          const value = await AsyncStorage.getItem('@autoMarkRead');
          if (value !== null) setAutoMarkRead(value === 'true');
          else { setAutoMarkRead(true); await AsyncStorage.setItem('@autoMarkRead', 'true'); }
        } catch (e) { setAutoMarkRead(true); }
      };
      loadAutoMarkRead();
  }, []);

  useEffect(() => {
    let scpParam: string | null = null;
    if (Array.isArray(scp)) scpParam = scp[0];
    else if (typeof scp === 'string') scpParam = scp;

    if (scpParam) {
      try { setCurrentItem(JSON.parse(scpParam)); } 
      catch (e) { loadNewScp(scpParam); }
    }
  }, [scp]);

  useEffect(() => {
    if (currentItem) setTimeout(() => { scrollViewRef.current?.scrollTo({ y: 0, animated: false }); }, 100);
  }, [currentItem]);

  const scpIndex = currentItem && currentItem.code ? parseInt(currentItem.code.replace(/[^0-9]/g, ''), 10) - 1 : -1;
  const scpNumber = scpIndex + 1;

  useEffect(() => {
    Promise.all([loadReadStatus(), loadSavedStatus()]).then(([read, saved]) => {
      setReadStatus(read); setSavedStatus(saved);
    });
  }, []);

  useEffect(() => {
    if (scpIndex >= 0) {
      if (readStatus.length > scpIndex) setIsRead(readStatus[scpIndex]);
      if (savedStatus.length > scpIndex) setIsSaved(savedStatus[scpIndex]);
    }
  }, [readStatus, savedStatus, scpIndex]);

  useEffect(() => {
    if (autoMarkRead && scpIndex >= 0 && currentItem) {
      const timer = setTimeout(() => { markreadAsRead(); }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentItem, scpIndex, autoMarkRead]);

  const toggleRead = async () => { /* ... aynı ... */ if(scpIndex < 0) return; const n = [...readStatus]; n[scpIndex] = !n[scpIndex]; setReadStatus(n); await saveReadStatus(n); };
  const markreadAsRead = async () => { /* ... aynı ... */ if(scpIndex < 0) return; const n = [...readStatus]; n[scpIndex] = true; setReadStatus(n); await saveReadStatus(n); };
  const toggleSaved = async () => { /* ... aynı ... */ if(scpIndex < 0) return; const n = [...savedStatus]; n[scpIndex] = !n[scpIndex]; setSavedStatus(n); await saveSavedStatus(n); if (currentItem?.code) logSCPView(currentItem.code, "love_toggle"); };

  const loadNewScp = async (newScpCode: string) => {
    if (!scpData || scpData.length === 0) return;
    setIsLoading(true);
    
    try {
      const found = scpData.find(item => item.code === newScpCode);
      
      if (found) {
        // ESKİ KOD (Hatalı olan):
        // setCurrentItem(found); 

        // YENİ KOD (Doğrusu):
        // State'i elle değiştirmek yerine Router parametrelerini güncelliyoruz.
        // Bu sayede URL değişiyor, router geçmişi senkronize oluyor
        // ve yukarıdaki useEffect([scp]) otomatik tetiklenip currentItem'ı güncelliyor.
        router.setParams({
           code: found.code,
           scp: JSON.stringify(found)
        });
      } else {
        // Eğer listede yoksa manuel state set edilebilir (fallback)
        setCurrentItem({ 
           code: newScpCode, 
           title: 'Bulunamadı', 
           text: `SCP "${newScpCode}" listede yok.` 
        });
      }
    } catch (error) { 
      console.error(error); 
    } finally { 
      setIsLoading(false); 
    }
  };

  
  if (!currentItem) return <View style={[styles.container, { backgroundColor: colors.background, justifyContent:'center', alignItems:'center' }]}><ActivityIndicator size="large" color="#c0392b" /><Text style={{color:colors.text, marginTop:16}}>Yükleniyor...</Text></View>;
  
  const rawText = currentItem.text || '';
  const match = rawText.match(/Nesne\s*Sınıfı:\s*([^\n]+)/i);
  const objectClass = match ? match[1].trim() : 'Bilinmiyor';

  let classColor = '#ffffff';
  if (/güvenli|safe/i.test(objectClass)) classColor = '#34c759';
  else if (/euclid|öklid/i.test(objectClass)) classColor = '#ffd60a';
  else if (/keter|tehlikeli/i.test(objectClass)) classColor = '#ff3b30';

  const cleanedText = rawText
    .replace(/^Öğe|Madde\s*#:\s*SCP-\d+\s*/i, '').replace(/^Item\s*#:\s*SCP-\d+\s*/i, '').replace(/Nesne\s*Sınıfı:\s*[^\n]+\n?/i, '').replace(/"Nesne\s*Sınıfı:\s*[^\n]+\n?/i, '').replace(/#:\s*SCP-\d+/gi, '').replace(/«\s*SCP-\d+\s*\|\s*SCP-\d+\s*\|\s*SCP-\d+\s*»/gi, '').replace(/\n/g, '\n\n').replace(/^\s+/g, '');

  // ✅ TAGLERİ PARÇALA VE HAZIRLA
  // String olarak gelen "euclid canlı ..." yapısını diziye çeviriyoruz.
  // "_" ile başlayanlar (örn: _cc) sistem etiketidir, onları göstermiyoruz.
  const tagsList = currentItem.tags 
    ? currentItem.tags.split(' ').filter((t: string) => !t.startsWith('_') && t.trim() !== '') 
    : [];

  return (
    <>
      <StatusBar style="light" />
      <Stack.Screen
        key={currentItem?.code}
        options={{
          title: currentItem.title || currentItem.code,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: 'bold', fontSize: 18 },
          headerLeft: () => (
             <Pressable onPress={() => { if(from==='filter') router.push('/filter'); else if(from==='favourites') router.push('/favourites'); else router.push('/'); }} style={{ paddingLeft: 12 }}>
                <MaterialIcons name="arrow-back-ios" size={24} color={colors.text} />
             </Pressable>
          ),
          headerRight: () => (
             <View style={styles.headerRightContainer}>
        <HeaderScpNavigation 
           scpIndex={scpIndex} 
           loadNewScp={loadNewScp} 
           setIsLoading={setIsLoading} 
        />
      </View>
          ),
        }}
      />
      
      {isLoading && <View style={styles.loadingOverlay}><ActivityIndicator size="large" color="#c0392b" /></View>}
      
      <ScrollView 
        ref={scrollViewRef}
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.contentContainer}
      >
        {currentItem.image && <Image source={{ uri: currentItem.image }} style={styles.image} resizeMode="cover" />}
        
        <View style={styles.headerCard}>
          <View style={styles.titleRow}>
            <Text style={[styles.code, { color: '#ffffffff' }]}>{currentItem.code}</Text>
            <Text style={[styles.title, { color: colors.text }]}>{currentItem.title}</Text>
          </View>
          <View style={styles.metaRow}>
            {currentItem.state && <View style={styles.badge}><Text style={styles.badgeText}>📋 {currentItem.state}</Text></View>}
            {currentItem.rating && <View style={styles.badge}><Text style={styles.badgeText}>⭐ {currentItem.rating}</Text></View>}
          </View>
        </View>
          {/* {shouldShowAd && <AdBanner />} */}
           <AdBanner />
      
          
         
            
         
         
         
        {imageCaptionUrl && <ImageCaption imageUrl={imageCaptionUrl} caption="" />}
        
        <View style={styles.contentCard}>
          <View style={styles.contentHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
              <Text style={[styles.contentTitle, { color: colors.text }]}>Sınıfı: </Text>
              <Pressable
                onPress={() => router.push({ pathname: '/filter', params: { class: objectClass } })}
                style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, backgroundColor: classColor + '33', marginLeft: 4 }}
              >
                <Text style={{ color: classColor, fontWeight: '600' }}>{objectClass}</Text>
              </Pressable>
            </View>

            <View style={styles.actionButtons}>
              <Pressable style={[styles.readButton, isRead && styles.readButtonActive]} onPress={toggleRead}>
                <Text style={styles.readButtonText}>{isRead ? <Feather name="eye" size={25} color="#e0c00fff" /> : <Feather name="eye-off" size={25} color="#e0c00fff" />}</Text>
              </Pressable>
              <Pressable style={[styles.saveButton, isSaved && styles.saveButtonActive]} onPress={toggleSaved}>
                <MaterialIcons name={isSaved ? "favorite" : "favorite-border"} size={25} color="#c0392b" />
              </Pressable>
            </View>
          </View>

          <Text style={[styles.text, { color: colors.text, opacity: 0.9 }]}>{cleanedText}</Text>
        </View>
        {currentItem.link && (
          <Pressable style={styles.linkButton} onPress={() => Linking.openURL(currentItem.link)}>
            <Text style={styles.linkButtonText}>🔗 Orijinal Kaynağı Görüntüle</Text>
          </Pressable>
        )}
        {/* ✅ ETİKETLER (CHIPS) BÖLÜMÜ */}
        {tagsList.length > 0 && (
          <View style={styles.tagsContainer}>
           
            <View style={styles.tagsWrapper}>
              {tagsList.map((tag: string, index: number) => (
                <Pressable
                  key={index}
                  style={[styles.tagChip, { borderColor: "#c0392b" }]}
                  // Filtre sayfasına parametre olarak gönderiyoruz
                  onPress={() => router.push({ pathname: '/filter', params: { filterTag: tag } })} 
                  // NOT: Eğer HomeScreen filtrelenecekse '/' ye, özel bir filtre ekranı varsa '/filter' a yönlendir.
                  // Ben burada HomeScreen'deki filtre yapısına göre varsayımda bulundum. 
                  // Eğer ayrı bir '/filter' sayfan varsa pathname: '/filter' yapmalısın.
                >
                 
                  <Text style={[styles.tagText, { color: colors.text }]}>{tag}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}
<ScpNavigation 
           scpIndex={scpIndex}
           loadNewScp={loadNewScp}
           setIsLoading={setIsLoading}
         />
        <RecommendSection 
         scpIndex={scpIndex}
         readStatus={readStatus}  // 👈 BUNU EKLEMEYİ UNUTMA
         />

        
         <Comments scpCode={currentItem.code} />
     
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  // ... (Eski stillerin aynı kalıyor) ...
  headerRightContainer: {
   paddingRight: 16,
  },
  container: { flex: 1 },
  contentContainer: { padding: 16, paddingBottom: 30,},
  loadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 999 },
  image: { width: '100%', height: 220, borderRadius: 12, marginBottom: 16 },
  headerCard: { backgroundColor: '#c0392b', borderRadius: 12, padding: 16, paddingBottom: 5, marginBottom: 12, borderWidth: 0, borderColor: '#48484a' },
  titleRow: { marginBottom: 12 },
  code: { fontSize: 16,  marginBottom: 4, fontFamily: 'Inter-Black', color: '#8b2c21ff' },
  title: { fontSize: 32,fontFamily: 'Inter-Black', lineHeight: 38 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 0 },
  badge: { backgroundColor: '#8b2c21ff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15 },
  badgeText: { color: '#ffffff', fontSize: 13, fontWeight: '600' },
  contentCard: { borderRadius: 12, padding: 16, paddingHorizontal: 0, marginBottom: 12, borderWidth: 1, fontFamily:"Inter-Regular" }, // contentCard'ın borderWidth'i 1 olduğundan emin ol, tema rengi gelecek.
  contentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 },
  contentTitle: { fontSize: 18, fontWeight: 'bold',  },
  actionButtons: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  saveButton: { paddingHorizontal: 12, paddingVertical: 6, justifyContent: 'center', alignItems: 'center' },
  saveButtonActive: { backgroundColor: 'transparent' },
  readButton: { backgroundColor: 'transparent', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  readButtonActive: { backgroundColor: 'transparent' },
  readButtonText: { color: '#ffffff', fontSize: 12, fontWeight: '600' },
  text: { fontSize: 16, lineHeight: 25, marginTop: 8, },
  linkButton: { backgroundColor: '#c0392b', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 16 },
  linkButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  
  errorTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  errorText: { fontSize: 16, textAlign: 'center' },

  // ✅ YENİ EKLENEN STİLLER
  tagsContainer: {
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  tagsHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    opacity: 0.8,
  },
  tagsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: 'transparent', 
  },
  tagText: {
    fontSize: 15,
    fontWeight: '500',
  }
});