import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Feather, Ionicons } from '@expo/vector-icons';

export default function IdCardWidget() {
  const router = useRouter();
  
  const [userData, setUserData] = useState({
    name: 'PERSONEL',
    surname: 'DOSYASI',
    role: 'Erişim Gerekli',
  });

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        try {
          const savedData = await AsyncStorage.getItem('@scp_card_data');
          if (savedData !== null) {
            setUserData(JSON.parse(savedData));
          }
        } catch (e) {
          console.error(e);
        }
      };
      loadData();
    }, [])
  );

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={() => router.push('/(tabs)/scpidcard')} 
      activeOpacity={0.7}
    >
      {/* Sol Accent Çizgisi */}
      <View style={styles.accentStrip} />

      {/* İçerik */}
      <View style={styles.contentRow}>
        <View style={styles.infoContainer}>
          <Text style={styles.label}>KİMLİK KARTI</Text>
          <Text style={styles.name} numberOfLines={1}>
            {userData.name} {userData.surname}
          </Text>
        </View>

        <View style={styles.iconBox}>
         
          <Feather name="arrow-right" size={20} color="#ffffffff"  />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56, // Daha "alçak" (compact)
    backgroundColor: '#0f0f0f', // Mat, derin siyah
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#262626', // Çok ince gri çerçeve
    borderRadius: 4, // Çok hafif yumuşatılmış köşeler (Endüstriyel his)
    overflow: 'hidden',
  },
  accentStrip: {
    width: 4,
    height: '100%',
    backgroundColor: '#c0392b', // SCP Kırmızısı
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
  },
  label: {
    color: '#c0392b', // Soluk gri etiket
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  name: {
    color: '#e0e0e0', // Kırık beyaz (göz yormaz)
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
   
  },
  iconBox: {
    flexDirection: 'row',
    alignItems: 'center',
    opacity: 0.8,
    backgroundColor: '#c0392b', // Çok hafif SCP kırmızısı arka plan
     borderWidth: 1,
    borderColor: '#262626', // Çok ince gri çerçeve
    borderRadius: 40, // Çok hafif yumuşatılmış köşeler (Endüstriyel his)
    padding: 6,
  },
});