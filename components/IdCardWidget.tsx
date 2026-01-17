import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function IdCardWidget() {
  const router = useRouter();
  
  const [userData, setUserData] = useState({
    name: 'PERSONEL',
    surname: 'DOSYASI',
    role: 'Erişim Gerekli',
  });

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const loadData = async () => {
        try {
          const savedData = await AsyncStorage.getItem('@scp_card_data');
          if (savedData !== null && isActive) {
            setUserData(JSON.parse(savedData));
          }
        } catch (e) {
          console.error("Veri yükleme hatası:", e);
        }
      };
      loadData();
      return () => { isActive = false; };
    }, [])
  );

  return (
    <TouchableOpacity 
      style={styles.wrapper}
      onPress={() => router.push('/(tabs)/scpidcard')} 
      activeOpacity={0.85}
    >
      <LinearGradient
        // Ana renk olan #c0392b'den biraz daha koyu bir tona geçiş
        colors={['#c0392b', '#8e271c']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        {/* Desensel doku: Arkaplanda hafif karartı geçişi */}
        <View style={styles.textureOverlay} />

        {/* Sol Vurgu Çizgisi: Kırmızı zemin üzerinde beyaz/gümüş daha şık durur */}
        <View style={styles.accentStrip} />

        <View style={styles.contentRow}>
          <View style={styles.infoContainer}>
            <Text style={styles.label}>PERSONEL KİMLİĞİ</Text>
            <Text style={styles.name} numberOfLines={1}>
              {userData.name} {userData.surname}
            </Text>
          </View>

          <View style={styles.iconBox}>
            <Feather name="arrow-right" size={30} color="#ffffff" />
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
   
    marginBottom: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.5,
    elevation: 8,
  },
  container: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'c0392b', // Zeminden biraz daha koyu kırmızı border
    overflow: 'hidden',
    position: 'relative',
  },
  textureOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.05)', // Çok hafif bir karartma dokusu
  },
  accentStrip: {
    width: 4,
    height: '60%',
    backgroundColor: '#272727ff', // Kırmızı zemin üzerinde beyaz vurgu daha "premium" durur
    borderRadius: 2,
    marginLeft: 6,
    opacity: 0.8,
  },
  contentRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  infoContainer: {
    justifyContent: 'center',
    flex: 1,
    marginLeft: -4,
  },
  label: {
    color: 'rgba(255, 255, 255, 0.7)', // Kırmızı üzerinde okunabilir beyaz tonu
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 1,
    textTransform: 'uppercase',
  },
  name: {
    color: '#ffffff', 
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    // Hafif metin gölgesi okunabilirliği artırır
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  iconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "transparent", // Beyaz transparan
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
});