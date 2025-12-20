import Feather from '@expo/vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { CONFIG } from '../constants/config';
import { logSCPView } from '../services/scplog';

interface ScpNavigationProps {
  scpIndex: number;
  loadNewScp: (code: string) => Promise<void>;
  setIsLoading: (loading: boolean) => void;
}

// ---------------------------------------------------------
// ✅ ORTAK MANTIK (Helper Functions)
// ---------------------------------------------------------

// Sonraki SCP'yi hesaplar (Okunmuşları atlama ayarına bakar)
const findNextScpIndex = async (currentIndex: number): Promise<{ index: number, skipped: boolean } | null> => {
  if (currentIndex >= CONFIG.TOTAL_SCP_COUNT) return null;

  const skipSetting = await AsyncStorage.getItem('@skipreadeditems');
  const shouldSkip = skipSetting !== 'false';
  let nextIndex = currentIndex + 1;

  if (shouldSkip) {
    const rawData = await AsyncStorage.getItem('@readStatus');
    const savedList = rawData ? JSON.parse(rawData) : [];
    while (nextIndex < CONFIG.TOTAL_SCP_COUNT && savedList[nextIndex] === true) {
      nextIndex++;
    }
  }

  return nextIndex < CONFIG.TOTAL_SCP_COUNT ? { index: nextIndex, skipped: shouldSkip } : null;
};

// Önceki SCP'yi hesaplar
const findPrevScpIndex = async (currentIndex: number): Promise<{ index: number, skipped: boolean } | null> => {
  if (currentIndex <= 0) return null;

  const skipSetting = await AsyncStorage.getItem('@skipreadeditems');
  const shouldSkip = skipSetting !== 'false';
  let prevIndex = currentIndex - 1;

  if (shouldSkip) {
    const rawData = await AsyncStorage.getItem('@readStatus');
    const savedList = rawData ? JSON.parse(rawData) : [];
    while (prevIndex >= 0 && savedList[prevIndex] === true) {
      prevIndex--;
    }
  }

  return prevIndex >= 0 ? { index: prevIndex, skipped: shouldSkip } : null;
};

// ---------------------------------------------------------
// 1. ANA NAVİGASYON (Sayfa Altı - Büyük)
// ---------------------------------------------------------
export function ScpNavigation({ scpIndex, loadNewScp, setIsLoading }: ScpNavigationProps) {

  const handleNext = async () => {
    setIsLoading(true);
    try {
      const result = await findNextScpIndex(scpIndex);
      if (result) {
        const c = `SCP-${String(result.index + 1).padStart(3, '0')}`;
        logSCPView(c, result.skipped ? "next_unread" : "next");
        await loadNewScp(c);
      } else {
        Alert.alert("Bilgi", "Sonraki SCP bulunamadı.");
      }
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  };

  const handlePrevious = async () => {
    setIsLoading(true);
    try {
      const result = await findPrevScpIndex(scpIndex);
      if (result) {
        const c = `SCP-${String(result.index + 1).padStart(3, '0')}`;
        logSCPView(c, result.skipped ? "prev_unread" : "prev");
        await loadNewScp(c);
      } else {
        Alert.alert("Bilgi", "Geriye doğru gidilecek SCP kalmadı! (okunanların pas geçilme ayarını kontrol edin.)");
      }
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  };

  return (
    <View style={styles.navigationContainer}>
      <Pressable 
        style={[styles.navButton, (scpIndex <= 0) && styles.navButtonDisabled]} 
        onPress={handlePrevious} 
        disabled={scpIndex <= 0}
      >
        <Feather name="arrow-left" size={20} color="#c0392b" />
        <Text style={styles.navButtonText}>Önceki</Text>
      </Pressable>

      <Pressable 
        style={[styles.navButton, (scpIndex >= CONFIG.TOTAL_SCP_COUNT) && styles.navButtonDisabled]} 
        onPress={handleNext} 
        disabled={scpIndex >= CONFIG.TOTAL_SCP_COUNT}
      >
        <Text style={styles.navButtonText}>Sonraki</Text>
        <Feather name="arrow-right" size={20} color="#c0392b" />
      </Pressable>
    </View>
  );
}

// ---------------------------------------------------------
// 2. HEADER NAVİGASYON (Sağ Üst - Küçük)
// ---------------------------------------------------------
export const HeaderScpNavigation = ({ scpIndex, loadNewScp, setIsLoading }: ScpNavigationProps) => {

  const handleNext = async () => {
    setIsLoading(true);
    try {
      const result = await findNextScpIndex(scpIndex);
      if (result) {
        const c = `SCP-${String(result.index + 1).padStart(3, '0')}`;
        // Loglama prefixi farklı: "header_"
        logSCPView(c, result.skipped ? "header_next_unread" : "header_next");
        await loadNewScp(c);
      } else {
        Alert.alert("Bilgi", "Sonraki SCP bulunamadı.");
      }
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  };

  const handlePrevious = async () => {
    setIsLoading(true);
    try {
      const result = await findPrevScpIndex(scpIndex);
      if (result) {
        const c = `SCP-${String(result.index + 1).padStart(3, '0')}`;
        logSCPView(c, result.skipped ? "header_prev_unread" : "header_prev");
        await loadNewScp(c);
      } else {
        Alert.alert("Bilgi", "Geriye doğru gidilecek SCP kalmadı!");
      }
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  };

  return (
    <View style={headerStyles.container}>
      {/* ÖNCEKİ */}
      <Pressable 
        style={({ pressed }) => [
          headerStyles.button, 
          scpIndex <= 0 && headerStyles.disabled,
          pressed && { opacity: 0.5 }
        ]}
        onPress={handlePrevious}
        disabled={scpIndex <= 0}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Feather name="chevron-left" size={24} color="#c0392b" />
      </Pressable>

      {/* AYIRAÇ */}
      <View style={headerStyles.divider} />

      {/* SONRAKİ */}
      <Pressable 
        style={({ pressed }) => [
          headerStyles.button, 
          scpIndex >= CONFIG.TOTAL_SCP_COUNT && headerStyles.disabled,
          pressed && { opacity: 0.5 }
        ]}
        onPress={handleNext}
        disabled={scpIndex >= CONFIG.TOTAL_SCP_COUNT}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Feather name="chevron-right" size={24} color="#c0392b" />
      </Pressable>
    </View>
  );
};

// ---------------------------------------------------------
// STİLLER
// ---------------------------------------------------------
const styles = StyleSheet.create({
  navigationContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    gap: 12, 
    marginTop: 20,
    marginBottom: 20 
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
    borderColor: '#c0392b' 
  },
  navButtonDisabled: { 
    opacity: 0.4,
    borderColor: '#555' 
  },
  navButtonText: { 
    color: '#ffffff', 
    fontSize: 15, 
    fontWeight: '600' 
  },
});

const headerStyles = StyleSheet.create({
  container: {
    // ✅ DÜZELTME: flexDirection 'row' olmalı yoksa elemanlar alt alta dizilir ve görünmez.
    flexDirection: 'row', 
    alignItems: 'center',
    backgroundColor: 'rgba(233, 28, 28, 0.1)',
    borderRadius: 4,
    paddingHorizontal: 0,
    paddingVertical: 0,
    marginRight: 0,
    height: 30, // Yükseklik biraz daha kompakt
    // width: 100, // ❌ BU KALDIRILDI, içerik kadar yer kaplasın.
  },
  button: {
    paddingHorizontal: 2, 
    paddingVertical: 0,
    margin: 0,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    minWidth: 28, // Tıklama alanı için minimum genişlik
  },
  divider: {
    width: 1,
    height: 14,
    backgroundColor: 'rgba(192, 57, 43, 0.4)',
    marginHorizontal: 0,
  },
  disabled: {
    opacity: 0.2,
  },
});