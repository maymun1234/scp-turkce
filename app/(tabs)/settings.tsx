import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, StatusBar, Alert, Linking, Image, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import Feather from '@expo/vector-icons/build/Feather';

export default function SettingsScreen() {
  const { colors } = useTheme();
  const [isResetting, setIsResetting] = useState(false);





    const [autoMarkRead, setAutoMarkRead] = useState(false);

  // İlk açılışta kaydedilmiş değeri yükle
  React.useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem('@autoMarkRead');
        if (saved !== null) {
          setAutoMarkRead(saved === 'true');
        }
      } catch (e) {
        console.error('Auto mark load error:', e);
      }
    })();
  }, []);



      const toggleAutoMarkRead = async () => {
    try {
      const newValue = !autoMarkRead;
      setAutoMarkRead(newValue);
      await AsyncStorage.setItem('@autoMarkRead', newValue.toString());
    } catch (e) {
      console.error('Auto mark toggle error:', e);
    }
  };

  // Okuma kayıtlarını sıfırla
  const handleResetReadStatus = async () => {
    Alert.alert(
      'Okuma Kayıtlarını Sıfırla',
      'Tüm okuma kayıtlarınız silinecek. Bu işlem geri alınamaz. Devam etmek istiyor musunuz?',
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
              await AsyncStorage.removeItem('@readStatus');
              await AsyncStorage.removeItem('@savedStatus');
              Alert.alert('Başarılı', 'Tüm okuma kayıtları silindi.');
            } catch (e) {
              Alert.alert('Hata', 'Okuma kayıtları sıfırlanırken bir hata oluştu.');
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
      <StatusBar barStyle="light-content" />
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Ayarlar</Text>
          
        </View>

        {/* Veri Yönetimi */}
        <View style={styles.section}>
  <Text style={[styles.sectionTitle, { color: colors.text }]}>VERİ YÖNETİMİ</Text>

  <View style={styles.card}>
    {/* Okuma kayıtlarını sıfırla */}
    

    {/* Bölücü çizgi */}
    <View style={styles.divider} />

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
                <View style={[styles.iconContainer, { backgroundColor: '#007aff' }]}>
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

            <View style={styles.divider} />

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
                <View style={[styles.iconContainer, { backgroundColor: '#34c759' }]}>
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

            <View style={styles.divider} />

            <Pressable 
              style={({ pressed }) => [
                styles.settingItem,
                pressed && styles.settingItemPressed
              ]}
              onPress={() => openLink('https://github.com/yourusername/scp-app/issues', 'GitHub')}
            >
              <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: '#f1c40f' }]}>
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
                  <Text style={styles.settingSubtext}>
                    Hiçbir şekilde verilerinize dokunmuyoruz.
                  </Text>
                </View>
              </View>
              <Text style={styles.settingArrow}>›</Text>
            </Pressable>

            <View style={styles.divider} />

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

            <View style={styles.divider} />

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
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 25,
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
    paddingVertical: 8,
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
    borderRadius: 8,
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
    fontSize: 16,
    fontWeight: '500',
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
  divider: {
    height: 0.5,
    backgroundColor: '#48484a',
    marginLeft: 64,
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