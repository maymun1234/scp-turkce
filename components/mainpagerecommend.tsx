import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ScpListItem } from '../app/(tabs)/ScpListItem';
import { useScpData } from '../app/_layout';
import { ScpDataRow } from '../types/scp';

// PHP dosyanın tam adresi
const API_URL = 'http://bercan.blog/pages/scp/recomedit.php?api=1';

// 👇 Prop tipini güncelledik: readStatus'u da içeri alıyoruz
export default function OnlineSuggestionWidget({ 
  isConnected, 
  readStatus 
}: { 
  isConnected: boolean;
  readStatus: boolean[]; 
}) {
  const allScpData = useScpData(); 
  const [picks, setPicks] = useState<ScpDataRow[]>([]);

  useEffect(() => {
    if (!isConnected || allScpData.length === 0) return;

    const fetchPicks = async () => {
      try {
        const response = await fetch(API_URL);
        const json = await response.json();

        if (json.status === 'success' && Array.isArray(json.data)) {
          const codesToFind: string[] = json.data;

          const matchedScps = codesToFind
            .map(code => allScpData.find(item => item.code === code))
            // 1. Bulunamayanları temizle
            .filter((item): item is ScpDataRow => item !== undefined) 
            // 2. 👇 FİLTRELEME: Eğer okunmuşsa listeye alma
            .filter(item => {
                const codeNumber = parseInt(item.code.replace('SCP-', ''), 10);
                const itemIndex = Number.isNaN(codeNumber) ? -1 : codeNumber - 1;
                
                // Eğer index geçerliyse ve readStatus[index] true ise (okunmuşsa) false döndür (listeden at)
                if (itemIndex >= 0 && readStatus[itemIndex]) {
                    return false; 
                }
                return true; // Okunmamışsa tut
            });

          setPicks(matchedScps);
        }
      } catch (error) {
        console.error("Öneriler çekilemedi:", error);
      }
    };

    fetchPicks();
    // readStatus değişirse listeyi tekrar hesaplaması için dependency'e ekledik
  }, [isConnected, allScpData, readStatus]); 

  // Eğer tüm öneriler okunduğu için liste boşaldıysa widget gizlenir
  if (!isConnected || picks.length === 0) return null;

  return (
    <View style={styles.container}>
       {/* Başlık vs eklenebilir, şu an boş bıraktım senin kodundaki gibi */}
       

      <FlatList
        data={picks}
        keyExtractor={(item) => item.code}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <ScpListItem 
            item={item} 
            isRead={false} 
            isSaved={false} 
            from="suggestion" 
          />
        )}
      />
     
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 0, marginTop: 5 },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    color: '#ffffffaa', 
   
    fontSize: 15,
    fontFamily: 'Inter-Bold',
    
  },
});