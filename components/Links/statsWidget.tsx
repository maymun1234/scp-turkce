import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// --- YENİ IMPORT: Yerelleştirme ---
import { t } from '../../constants/i18n';

export default function OtherUsersWidget() {
  const router = useRouter();

  // Bu sayı API'den geldiğinde otomatik güncellenir
  const activeUserCount = 12; 

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity 
        style={styles.pillContainer}
        onPress={() => {
          router.push({
            pathname: '/otherusers',
            params: { from: 'favourites' } // Hangi sayfadan gidildiği bilgisini buraya ekledik
          });
        }} 
        activeOpacity={0.8}
      >
        {/* Aktiflik Noktası */}
        <View style={styles.statusDot} />
        
        <Text style={styles.pillText}>
          <Text style={styles.countText}>{activeUserCount}</Text> {t('active_label')}
        </Text>

        <Feather 
          name="chevron-right" 
          size={16} 
          color="rgba(255,255,255,0.6)" 
          style={{ marginLeft: 6 }} 
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    // Header içinde biraz boşluk bırakmak için
    paddingRight: 16, 
  },
  pillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.35)', // Daha belirgin bir cam efekti
    paddingHorizontal: 12,
    paddingVertical: 8, // Yükseklik buradan artırıldı (5'ten 8'e)
    borderRadius: 25,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#34c759',
    marginRight: 8,
  },
  pillText: {
    color: '#ffffff',
    fontSize: 12, // Font boyutu artırıldı (10'dan 12'ye)
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  countText: {
    color: '#34c759',
    fontWeight: '900',
  },
});