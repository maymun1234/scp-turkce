import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { ScpListItem } from '../app/(tabs)/ScpListItem';
import { useScpData } from '../app/_layout'; // Veri kaynağın
import { ScpDataRow } from '../types/scp'; // Tip dosyan (varsa)

interface RecommendSectionProps {
  scpIndex: number;      // Şu an okunan SCP'nin indeksi (bunu önermeyelim)
  readStatus: boolean[]; // Okundu bilgisi dizisi
}

export default function RecommendSection({ scpIndex, readStatus }: RecommendSectionProps) {
  const allScpData = useScpData();
  const [recommendations, setRecommendations] = useState<ScpDataRow[]>([]);

  // Rastgele 3 tane seçen fonksiyon
  const pickRandomScps = () => {
    if (!allScpData || allScpData.length === 0) return;

    // 1. Adım: Okunmamış olanların indekslerini bul (Şu anki hariç)
    const unreadIndices: number[] = [];
    
    // Performans için sadece ilk 6000 veya veri uzunluğu kadar dönüyoruz
    for (let i = 0; i < allScpData.length; i++) {
      // Eğer okunmamışsa (false ise) VE şu anki scp değilse listeye ekle
      if (!readStatus[i] && i !== scpIndex) {
        unreadIndices.push(i);
      }
    }

    // Eğer okunmamış hiç kalmadıysa veya çok azsa
    if (unreadIndices.length === 0) {
      setRecommendations([]);
      return;
    }

    // 2. Adım: Bu havuzdan rastgele 3 tane seç
    const selectedItems: ScpDataRow[] = [];
    const usedIndices = new Set<number>();
    
    // En fazla 3 tane, ama elde 3'ten az varsa olan kadar seç
    const countToSelect = Math.min(3, unreadIndices.length);

    while (selectedItems.length < countToSelect) {
      const randomIndex = Math.floor(Math.random() * unreadIndices.length);
      const originalIndex = unreadIndices[randomIndex];

      if (!usedIndices.has(originalIndex)) {
        usedIndices.add(originalIndex);
        if (allScpData[originalIndex]) {
          selectedItems.push(allScpData[originalIndex]);
        }
      }
    }

    setRecommendations(selectedItems);
  };

  // Veri veya okuma durumu değiştiğinde çalışır (İlk açılışta çalışır)
  useEffect(() => {
    pickRandomScps();
  }, [allScpData, readStatus]); 
  // Not: scpIndex'i bilerek dependency'e eklemedim, 
  // kullanıcı sayfada gezerken öneriler sürekli değişmesin, sadece ilk açılışta veya yenile dendiğinde değişsin.

  if (recommendations.length === 0) return null;

  return (
    <View>
      {/* Başlık Alanı */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Feather name="compass" size={18} color="#c0392b" />
          <Text style={styles.headerTitle}>SIRADAKİ ÖNERİLER</Text>
        </View>
        
        {/* Yenileme Butonu */}
        <Pressable onPress={pickRandomScps} style={styles.refreshButton}>
         
          <Feather name="refresh-cw" size={18} color="#fbff05ff" />
        </Pressable>
      </View>

      <FlatList
        data={recommendations}
        keyExtractor={(item) => item.code}
        scrollEnabled={false} // Sayfanın kendi scroll'u var, bu kaymasın
        renderItem={({ item }) => (
          <ScpListItem 
            item={item} 
            isRead={false} // Zaten okunmamışları seçtik
            isSaved={false} // Kayıtlı olup olmadığını kontrol etmedik (gerekirse eklenebilir)
            from="recommendation" 
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
 
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#1c1c1e',
     borderRadius: 8,
    
    marginBottom: 4,
    marginTop: 20,
  },
  headerTitle: {
    color: '#e0e0e0',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 4,
  },
  refreshText: {
    color: '#aaa',
    fontSize: 12,
  }
});