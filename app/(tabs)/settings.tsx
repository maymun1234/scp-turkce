import Feather from '@expo/vector-icons/build/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@react-navigation/native';
import { Stack, router } from 'expo-router';
import React, { useCallback, useState, } from 'react';
import { Alert, Image, Linking, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { loadInitialSettings, resetReadAndSavedStatus, saveSetting, } from '../../contexts/SettingsContext'; // Yeni dosyanızı import edin
export default function SettingsScreen() {
  const { colors } = useTheme();
  const [isResetting, setIsResetting] = useState(false);





    const [autoMarkRead, setAutoMarkRead] = useState(true);
    const [autoDownloadImages, setAutoDownloadImages] = useState(true);
    const [showCommentSection, setShowCommentSection] = useState(true);

    const [skipReadedItems, setSkipReadedItems] = useState(true); // ✅ Yeni ayar

    const [allowDataCollection, setAllowDataCollection] = useState(true);
  // İlk açılışta kaydedilmiş değeri yükle

// İlk açılışta kaydedilmiş değeri yükle - autoMarkRead için
React.useEffect(() => {
    const fetchSettings = async () => {
      const initialSettings = await loadInitialSettings();
      setAutoMarkRead(initialSettings.autoMarkRead);
      setAutoDownloadImages(initialSettings.autoDownloadImages);
      setSkipReadedItems(initialSettings.skipReadedItems);
      setShowCommentSection(initialSettings.showCommentSection);
    };


    
    fetchSettings();
  }, []);

// İlk açılışta kaydedilmiş değeri yükle - autoDownloadImages için
React.useEffect(() => {
  (async () => {
    try {
      const savedAutoDownload = await AsyncStorage.getItem('@autoDownloadImages');
      if (savedAutoDownload !== null) {
        // Daha önce kaydedilmiş bir değer varsa onu kullan
        setAutoDownloadImages(savedAutoDownload === 'true');
      } else {
        // İlk açılışta varsayılan olarak true yap
        setAutoDownloadImages(true);
        await AsyncStorage.setItem('@autoDownloadImages', 'true');
      }



      const savedDataCollection = await AsyncStorage.getItem('@allowDataCollection');
        if (savedDataCollection !== null) {
            setAllowDataCollection(savedDataCollection === 'true');
        } else {
            // İlk kez açılıyorsa varsayılan olarak açık olsun ve kaydedelim
            setAllowDataCollection(true);
            await AsyncStorage.setItem('@allowDataCollection', 'true');
        }



         const showCommentSectionValue = await AsyncStorage.getItem('@showCommentSection');
        if (showCommentSectionValue !== null) {
            setShowCommentSection(showCommentSectionValue === 'true');
        } else {
            // İlk kez açılıyorsa varsayılan olarak açık olsun ve kaydedelim
            setShowCommentSection(true);
            await AsyncStorage.setItem('@showCommentSection', 'true');


        }
        const skipReadedItemsValue = await AsyncStorage.getItem('@skipReadedItems');
        if (skipReadedItemsValue !== null) {
            setSkipReadedItems(skipReadedItemsValue === 'true');
        } else {
            // İlk kez açılıyorsa varsayılan olarak açık olsun ve kaydedelim
            setSkipReadedItems(true);
            await AsyncStorage.setItem('@skipReadedItems', 'true');
        }


       
    } catch (e) {
      console.error('Settings load error:', e);
    }
  })();
}, []);



  const toggleAutoMarkRead = useCallback(async () => {
    const newValue = !autoMarkRead;
    setAutoMarkRead(newValue);
    await saveSetting('@autoMarkRead', newValue);
  }, [autoMarkRead]);

  // Otomatik resim indir ayarını değiştirme
  const toggleAutoDownloadImages = useCallback(async () => {
    const newValue = !autoDownloadImages;
    setAutoDownloadImages(newValue);
    await saveSetting('@autoDownloadImages', newValue);
  }, [autoDownloadImages]);



  const toggleshowCommentSection = useCallback(async () => {
    const newValue = !showCommentSection;
    setShowCommentSection(newValue);
    await saveSetting('@showCommentSection', newValue);
  }, [showCommentSection]);
  const toggleAllowDataCollection = useCallback(async () => {
    const newValue = !allowDataCollection;
    setAllowDataCollection(newValue);
    // Hem AsyncStorage'a hem de varsa context'e kaydedelim
    await AsyncStorage.setItem('@allowDataCollection', String(newValue));
    // Eğer saveSetting global bir fonksiyon ise onu da kullanabilirsin:
    // await saveSetting('@allowDataCollection', newValue); 
  }, [allowDataCollection]);


  const toggleSkipReadedItems = async () => {
    const newValue = !skipReadedItems;
    setSkipReadedItems(newValue);
    await AsyncStorage.setItem('@skipreadeditems', String(newValue));
  };



  // Okuma kayıtlarını sıfırla
  const handleResetReadStatus = async () => {
    Alert.alert(
      'Okuma Kayıtlarını Sıfırla',
      'Okunanlar listesi ve favorileriniz silinecek. Ayarlarınız (tema vb.) korunacaktır. Devam etmek istiyor musunuz?',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Sıfırla',
          style: 'destructive',
          onPress: async () => {
            setIsResetting(true);
            try {
              // ✅ DOĞRUSU: Manager'daki merkezi fonksiyonu çağırıyoruz.
              // Bu fonksiyon @readStatus ve @savedStatus anahtarlarını güvenle siler.
              await resetReadAndSavedStatus();
              
              Alert.alert('Başarılı', 'Okuma geçmişi ve favoriler temizlendi.',
                [
                  {
                    text: 'Tamam',
                    onPress: () => {
                      // ✅ SİHİRLİ KISIM BURASI:
                      // router.back() yerine router.dismissAll() ve replace('/') kullanıyoruz.
                      // Bu, arkadaki tüm açık sayfaları (ScpDetail dahil) öldürür.
                      if (router.canDismiss()) {
                        router.dismissAll();
                      }
                      router.replace('/'); 
                    }
                  }
                ]
              );
            } catch (e) {
              Alert.alert('Hata', 'Sıfırlama sırasında bir sorun oluştu.');
              console.error('Reset error:', e);
            } finally {
              setIsResetting(false);
            }
          },
        },
      ]
    );
  };

  // Link açma fonksiyonu
    const openLink = async (url: string, title: string): Promise<void> => {
  
      try {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
        } else {
          Alert.alert('Hata', `${title} açılamadı.`);
        }
      } catch (error) {
        Alert.alert('Hata', 'Bağlantı açılırken bir hata oluştu.');
        console.error('Link error:', error);
      }
    };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      
      
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: colors.background },
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        

        {/* Veri Yönetimi */}
        <View style={styles.section}>
  <Text style={[styles.sectionTitle, { color: colors.text }]}>VERİ YÖNETİMİ</Text>

  <View style={styles.card}>
    {/* Okuma kayıtlarını sıfırla */}
    

    {/* Bölücü çizgi */}
    

    {/* Otomatik okundu işaretle */}
    <Pressable
      style={({ pressed }) => [
        styles.settingItem,
        pressed && styles.settingItemPressed,
      ]}
      onPress={toggleAutoMarkRead}
    >
      <View style={styles.settingItemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: '#27ae60' }]}>
          <Feather name="eye" size={18} color="#ffffffff" />
        </View>
        <View style={styles.settingTextContainer}>
          <Text style={[styles.settingText, { color: colors.text }]}>
            Otomatik Okundu İşaretle
          </Text>
         
        </View>
      </View>
      <Switch
  trackColor={{ false: '#767577', true: '#27ae60' }}
  thumbColor={autoMarkRead ? '#ffffff' : '#f4f3f4'}
  ios_backgroundColor="#3e3e3e"
  onValueChange={toggleAutoMarkRead}
  value={autoMarkRead}
/>
    </Pressable>
    {/* Bölücü çizgi */}


{/* Otomatik resim indir */}
<Pressable
  style={({ pressed }) => [
    styles.settingItem,
    pressed && styles.settingItemPressed,
  ]}
  onPress={toggleAutoDownloadImages}
>
  <View style={styles.settingItemLeft}>
    <View style={[styles.iconContainer, { backgroundColor: '#27ae60' }]}>
      <Feather name="download" size={18} color="#ffffffff" />
    </View>
    <View style={styles.settingTextContainer}>
      <Text style={[styles.settingText, { color: colors.text }]}>
        Resimleri Otomatik İndir
      </Text>
    
    </View>
  </View>
  <Switch
    trackColor={{ false: '#767577', true: '#27ae60' }}
    thumbColor={autoDownloadImages ? '#ffffff' : '#f4f3f4'}
    ios_backgroundColor="#3e3e3e"
    onValueChange={toggleAutoDownloadImages}
    value={autoDownloadImages}
  />
</Pressable>





<Pressable
  style={({ pressed }) => [
    styles.settingItem,
    pressed && styles.settingItemPressed,
  ]}
  onPress={toggleshowCommentSection}
>
  <View style={styles.settingItemLeft}>
    <View style={[styles.iconContainer, { backgroundColor: '#27ae60' }]}>
      <Feather name="message-circle" size={18} color="#ffffffff" />
    </View>
    <View style={styles.settingTextContainer}>
      <Text style={[styles.settingText, { color: colors.text }]}>
        Yorumları göster
      </Text>
    
    </View>
  </View>
  <Switch
    trackColor={{ false: '#767577', true: '#27ae60' }}
    thumbColor={showCommentSection ? '#ffffff' : '#f4f3f4'}
    ios_backgroundColor="#3e3e3e"
    onValueChange={toggleshowCommentSection}
    value={showCommentSection}
  />
</Pressable>
<Pressable
              style={({ pressed }) => [styles.settingItem, pressed && styles.settingItemPressed]}
              onPress={toggleAllowDataCollection}
            >
              <View style={styles.settingItemLeft}>
                {/* Mavi renkli bir Activity ikonu kullandık */}
                <View style={[styles.iconContainer, { backgroundColor: '#27ae60' }]}>
                  <Feather name="activity" size={18} color="#ffffff" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingText, { color: colors.text }]}>
                    Kullanım Verilerini Paylaş
                  </Text>
                  <Text style={styles.settingSubtext}>
                    Geliştirme için anonim log kaydı
                  </Text>
                </View>
              </View>
              <Switch
                trackColor={{ false: '#767577', true: '#27ae60' }}
                thumbColor={allowDataCollection ? '#ffffff' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={toggleAllowDataCollection}
                value={allowDataCollection}
              />
            </Pressable>

    <Pressable style={({ pressed }) => [styles.settingItem, pressed && styles.settingItemPressed]} onPress={toggleSkipReadedItems}>
              <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: '#27ae60' }]}>
                  <Feather name="fast-forward" size={18} color="#ffffff" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingText, { color: colors.text }]}>Okunmuşları Atla</Text>
   
                </View>
              </View>
              <Switch trackColor={{ false: '#767577', true: '#27ae60' }} thumbColor={skipReadedItems ? '#ffffff' : '#f4f3f4'} onValueChange={toggleSkipReadedItems} value={skipReadedItems} />
            </Pressable>



    <Pressable
      style={({ pressed }) => [
        styles.settingItem,
        pressed && styles.settingItemPressed,
      ]}
      onPress={handleResetReadStatus}
      disabled={isResetting}
    >
      <View style={styles.settingItemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: '#e74c3c' }]}>
         <Feather name="trash" size={18} color="#ffffffff" />
        </View>
        <View style={styles.settingTextContainer}>
          <Text style={[styles.settingText, { color: colors.text }]}>
            Okuma Kayıtlarını Sıfırla
          </Text>
         
        </View>
      </View>
      <Text style={styles.settingArrow}>›</Text>
    </Pressable>
  </View>
</View>

              
        {/* Hakkında */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>HAKKINDA</Text>
          
          <View style={styles.card}>
            <Pressable 
              style={({ pressed }) => [
                styles.settingItem,
                pressed && styles.settingItemPressed
              ]}
              onPress={() => openLink('https://scp-wiki.wikidot.com/', 'SCP Wiki')}
            >
              <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: '#e74c3c' }]}>
                  <Feather name="globe" size={18} color="#ffffffff" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingText, { color: colors.text }]}>
                    SCP Foundation Wiki
                  </Text>
                 
                </View>
              </View>
              <Text style={styles.settingArrow}>›</Text>
            </Pressable>


            <Pressable 
              style={({ pressed }) => [
                styles.settingItem,
                pressed && styles.settingItemPressed
              ]}
              onPress={() => openLink('https://bercan.blog/ben', 'Bercan blog')}
            >
              <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: '#e74c3c' }]}>
                  <Feather name="code" size={18} color="#ffffffff" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingText, { color: colors.text }]}>
                    Bercan Aydın hakkında
                  </Text>
                
                </View>
              </View>
              <Text style={styles.settingArrow}>›</Text>
            </Pressable>
          </View>
        </View>

        {/* Destek */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>DESTEK</Text>
          
          <View style={styles.card}>
            <Pressable 
              style={({ pressed }) => [
                styles.settingItem,
                pressed && styles.settingItemPressed
              ]}
              onPress={() => openLink('mailto:bercan12345@yahoo.com', 'E-posta')}
            >
              <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: '#e74c3c' }]}>
                  <Feather name="mail" size={18} color="#ffffffff" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingText, { color: colors.text }]}>
                    Geri Bildirim Gönder
                  </Text>
                
                </View>
              </View>
              <Text style={styles.settingArrow}>›</Text>
            </Pressable>

          

            <Pressable 
              style={({ pressed }) => [
                styles.settingItem,
                pressed && styles.settingItemPressed
              ]}
              onPress={() => openLink('https://github.com/yourusername/scp-app/issues', 'GitHub')}
            >
              <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: '#e74c3c' }]}>
                   <Feather name="type" size={18} color="#ffffffff" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingText, { color: colors.text }]}>
                    Çeviri Hatası Bildir
                  </Text>
                 
                </View>
              </View>
              <Text style={styles.settingArrow}>›</Text>
            </Pressable>
          </View>
        </View>

        {/* Yasal */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>YASAL</Text>
          
          <View style={styles.card}>
            <Pressable 
              style={({ pressed }) => [
                styles.settingItem,
                pressed && styles.settingItemPressed
              ]}
              onPress={() => openLink('https://bercan.blog/blog/9', 'Gizlilik Sözleşmesi')}
            >
              <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: '#6a6a70ff' }]}>
                  <Feather name="lock" size={18} color="#ffffffff" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingText, { color: colors.text }]}>
                    Gizlilik Sözleşmesi
                  </Text>
                 
                </View>
              </View>
              <Text style={styles.settingArrow}>›</Text>
            </Pressable>

           


            <Pressable 
              style={({ pressed }) => [
                styles.settingItem,
                pressed && styles.settingItemPressed
              ]}
              onPress={() => openLink('https://bercan.blog/blog/9', 'Kullanım Koşulları')}
            >
              <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: '#6a6a70ff' }]}>
                  <Feather name="file-text" size={18} color="#ffffffff" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingText, { color: colors.text }]}>
                    Kullanım Koşulları
                  </Text>
                  <Text style={styles.settingSubtext}>
                    Hizmet kullanım şartları
                  </Text>
                </View>
              </View>
              <Text style={styles.settingArrow}>›</Text>
            </Pressable>

        

            <Pressable 
              style={({ pressed }) => [
                styles.settingItem,
                pressed && styles.settingItemPressed
              ]}
              onPress={() => openLink('https://creativecommons.org/licenses/by-sa/3.0/', 'Creative Commons')}
            >
              <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: '#6a6a70ff' }]}>
                  <Feather name="book-open" size={18} color="#ffffffff" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingText, { color: colors.text }]}>
                    SCP Lisansı
                  </Text>
                  <Text style={styles.settingSubtext}>
                    Creative Commons BY-SA 3.0
                  </Text>
                </View>
              </View>
              <Text style={styles.settingArrow}>›</Text>
            </Pressable>
          </View>
        </View>

        {/* Uygulama Bilgisi */}
        <View style={styles.appInfoCard}>
          <View style={styles.appIconContainer}>
            <Image source={require('../../assets/images/android-icon-foreground.png')} style={styles.appIcon} />
          </View>
          <Text style={[styles.appInfoText, { color: colors.text }]}>
            SCP Türkçe
          </Text>
          <Text style={[styles.appInfoVersion, { color: colors.text }]}>
            Versiyon 1.0.0
          </Text>
          <Text style={[styles.appInfoCopyright, { color: colors.text }]}>
            © 2025 Bercan Aydın
          </Text>
          <Text style={[styles.appInfoCopyright, { color: colors.text }]}>
          Büşra Deler'e bol teşekkürler
          </Text>
          <Text style={[styles.appInfoLicense, { color: colors.text }]}>
            Tüm çeviriler Gemini Pro ve ekibimiz tarafından çevrilmiştir.
          </Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    fontFamily: 'Inter-Regular',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 25,
    position: 'fixed',
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    opacity: 0.6,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    marginBottom: 10,
    opacity: 0.5,

    color: "#d92121",
  },
  card: {
    marginHorizontal: 15,
    backgroundColor: '#2c2c2e',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  settingItemPressed: {
    backgroundColor: '#3a3a3c',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingIcon: {
    fontSize: 18,
    
  },
  settingTextContainer: {
    flex: 1,
  },
  settingText: {
    fontSize: 14,
   fontFamily: 'Inter-Medium',
    marginBottom: 2,
  },
  settingSubtext: {
    fontSize: 13,
    color: '#8e8e93',
  },
  settingArrow: {
    fontSize: 22,
    color: '#8e8e93',
    marginLeft: 8,
    fontWeight: '300',
  },
 
  appInfoCard: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    marginTop: 30,
    marginHorizontal: 15,
    backgroundColor: '#2c2c2e',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  appIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#1c1c1e',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#48484a',
  },
  appIcon: {
  width: '100%',
  height: '100%',
  resizeMode: 'contain',
},

  appInfoText: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  appInfoVersion: {
    fontSize: 15,
    opacity: 0.6,
    marginBottom: 4,
  },
  appInfoCopyright: {
    fontSize: 13,
    opacity: 0.5,
    marginBottom: 8,
  },
  appInfoLicense: {
    fontSize: 12,
    opacity: 0.4,
    fontStyle: 'italic',
  },
  bottomSpacer: {
    height: 40,
  },
});