import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { logSCPView } from '../services/scplog';

interface UserStatsWidgetProps {
  readCount: number;
  totalCount?: number;
}

const defaultIdentity = {
  name: 'Bilinmeyen',
  surname: 'Personel',
  site: '??',
  role: 'TANIMLANMAMIŞ',
  clearance: '00'
};

export default function UserStatsWidget({ readCount, totalCount = 300 }: UserStatsWidgetProps) {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [identity, setIdentity] = useState(defaultIdentity);

  // --- Rütbe Mantığı (Kısa Versiyonlar) ---
  let rank = "D-Sınıfı";
  let color = "#7f8c8d";
  let fullRank = "D-Sınıfı Personel"; // Modalda gözükecek uzun isim
  let nextRank = "Seviye 1";
  let nextThreshold = 10;

  if (readCount > 10) { rank = "Seviye 1"; fullRank = "Seviye 1 Araştırmacı"; color = "#2ecc71"; nextRank = "Seviye 2"; nextThreshold = 50; }
  if (readCount > 50) { rank = "Seviye 2"; fullRank = "Seviye 2 Ajan"; color = "#3498db"; nextRank = "Seviye 3"; nextThreshold = 100; }
  if (readCount > 100) { rank = "Seviye 3"; fullRank = "Seviye 3 Yönetici"; color = "#f1c40f"; nextRank = "Seviye 4"; nextThreshold = 200; }
  if (readCount > 200) { rank = "Seviye 4"; fullRank = "Seviye 4 Direktör"; color = "#e67e22"; nextRank = "O5 Konseyi"; nextThreshold = 500; }
  if (readCount > 500) { rank = "O5 Konseyi"; fullRank = "O5 Konsey Üyesi"; color = "#e74c3c"; nextRank = "Maksimum"; nextThreshold = 6000; }

  // Yüzde ve İlerleme Hesaplamaları
  const prevThreshold = nextThreshold === 10 ? 0 : nextThreshold === 50 ? 10 : nextThreshold === 100 ? 50 : nextThreshold === 200 ? 100 : nextThreshold === 500 ? 200 : 500;
  const progressInLevel = readCount - prevThreshold;
  const levelSpan = nextThreshold - prevThreshold;
  const levelPercent = Math.min((progressInLevel / levelSpan) * 100, 100);

  useEffect(() => {
    if (modalVisible) {
      const fetchUserData = async () => {
        try {
          const savedData = await AsyncStorage.getItem('@scp_card_data');
          if (savedData !== null) {
            setIdentity(JSON.parse(savedData));
            logSCPView("SCP-0", "statview");
          }
        } catch (e) {
          console.error("Kimlik verisi alınamadı", e);
        }
      };
      fetchUserData();
    }
  }, [modalVisible]);

  return (
    <>
      {/* 1. Header Widget (Görseldeki gibi sadeleşmiş hali) */}
      <Pressable onPress={() => setModalVisible(true)}>
        <View style={[styles.pillContainer, { borderColor: color }]}>
          {/* İlerleme Dolgusu */}
          <View style={[styles.progressFillLayer, { width: `${levelPercent}%`, backgroundColor: color, opacity: 0.20 }]} />
          
          <View style={styles.contentLayer}>
             <Text style={[styles.pillRankText, { color: color }]}>{rank}</Text>
            <Text style={styles.pillCountText}>{readCount}/{totalCount}</Text>
          </View>
        </View>
      </Pressable>

      {/* 2. Tam Ekran Modal (Detaylar burada kalmaya devam ediyor) */}
      <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.overlay}>
          <View style={[styles.modalContainer, { borderColor: color }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTitle}>PERSONEL DOSYASI</Text>
              <Pressable onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <MaterialCommunityIcons name="close" size={24} color="#fff" />
              </Pressable>
            </View>

            <View style={styles.rankSection}>
                <View style={[styles.bigIconBox, { borderColor: color, backgroundColor: `${color}20` }]}>
                  <MaterialCommunityIcons name="shield-account" size={48} color={color} />
                </View>
                <Text style={[styles.rankName, { color: color }]}>{fullRank}</Text>
                <Text style={styles.realName}>{identity.name} {identity.surname}</Text>
                <View style={styles.badgeRow}>
                  <Text style={styles.badgeText}>BÖLGE-{identity.site}</Text>
                  <Text style={styles.badgeSeparator}>|</Text>
                  <Text style={styles.badgeText}>{identity.role}</Text>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.statsSection}>
              <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Arşiv Erişimi</Text>
                  <Text style={styles.statValue}>{readCount} / {totalCount}</Text>
              </View>

              {nextThreshold < 6000 && (
                <>
                  <View style={styles.barBackground}>
                     <View style={[styles.barFill, { width: `${levelPercent}%`, backgroundColor: color }]} />
                  </View>
                  <Text style={styles.nextRankText}>
                      <Text style={{color: color, fontWeight:'bold'}}>{nextRank}</Text> için <Text style={{color: color, fontWeight:'bold'}}>{nextThreshold - readCount}</Text> dosya kaldı.
                  </Text>
                </>
              )}
            </View>
            
            <Pressable 
              style={({ pressed }) => [styles.editButton, { borderColor: color, opacity: pressed ? 0.7 : 1 }]}
              onPress={() => { setModalVisible(false); router.push('/scpidcard'); }}
            >
                <MaterialCommunityIcons name="card-account-details-outline" size={18} color={color} />
                <Text style={[styles.editButtonText, { color: color }]}>PERSONEL KARTINA ERİŞ</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
 pillContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignSelf: 'flex-end', // Sadece içerik kadar genişlik almasını sağlar
    borderRadius: 100,
    borderWidth: 1.2,
    marginRight: 15,
    overflow: 'hidden',
    backgroundColor: '#121212',
    height: 28, // Biraz daha ince (opsiyonel)
  },
  progressFillLayer: {
    position: 'absolute',
    top: 0, left: 0, bottom: 0,
    zIndex: 1,
  },
  contentLayer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8, // Genişliği azaltmak için padding'i düşürdük
    zIndex: 2,
    gap: 4, // İkon ve metin arasındaki boşluğu daralttık
  },
  iconStyle: {
    marginTop: 1,
  },
  pillRankText: {
    fontSize: 12,
    fontWeight: '700',
  },
  pillCountText: {
    color: '#888',
    fontSize: 11,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#151515',
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalHeaderTitle: {
    color: '#666',
    fontWeight: '900',
    letterSpacing: 0,
    fontSize: 11,
  },
  closeBtn: { padding: 5 },
  rankSection: { alignItems: 'center', marginBottom: 20 },
  bigIconBox: {
    width: 70, height: 70,
    borderRadius: 35,
    borderWidth: 2,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 12,
  },
  rankName: {
    fontSize: 17, fontWeight: 'bold',
    textAlign: 'center', textTransform: 'uppercase',
    marginBottom: 4,
  },
  realName: { color: '#fff', fontSize: 15, fontWeight: '600', textTransform: 'uppercase' },
  badgeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  badgeText: { color: '#aaa', fontSize: 10, fontWeight: 'bold' },
  badgeSeparator: { color: '#333', marginHorizontal: 8 },
  divider: { height: 1, backgroundColor: '#222', marginBottom: 20 },
  statsSection: { gap: 10 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statLabel: { color: '#777', fontSize: 13 },
  statValue: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  barBackground: {
    height: 6, backgroundColor: '#1a1a1a',
    borderRadius: 3, overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 3 },
  nextRankText: { color: '#666', fontSize: 11, textAlign: 'center', marginTop: 4 },
  editButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginTop: 25, paddingVertical: 10,
    borderRadius: 8, borderWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    gap: 8,
  },
  editButtonText: { fontSize: 11, fontWeight: 'bold' },
});