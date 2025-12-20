// components/ScpListItem.tsx
import Entypo from '@expo/vector-icons/Entypo';
import Feather from '@expo/vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { logSCPView } from '../../services/scplog';
import { ScpDataRow } from '../../types/scp';
interface ScpListItemProps {
  item: ScpDataRow;
  isRead: boolean;
  isSaved?: boolean;
  from?: string; // 👈 Hangi sayfadan geldiğini belirtmek için
}

// 🧩 Okundu bilgisini güncelle
export const updateReadStatus = async (code: string, value: boolean) => {
  try {
    const json = await AsyncStorage.getItem('@readStatus');
    const list = json ? JSON.parse(json) : new Array(6000).fill(false);

    const index = parseInt(code.replace(/[^0-9]/g, ''), 10) - 1;
    if (index >= 0 && index < list.length) {
      list[index] = value;
      await AsyncStorage.setItem('@readStatus', JSON.stringify(list));
    }
  } catch (e) {
    console.error('Okundu durumu güncellenemedi:', e);
  }
};

// ❤️ Kaydedilen (favori) bilgisini güncelle
export const updateSavedStatus = async (code: string, value: boolean) => {
  try {
    const json = await AsyncStorage.getItem('@savedStatus');
    const list = json ? JSON.parse(json) : new Array(6000).fill(false);

    const index = parseInt(code.replace(/[^0-9]/g, ''), 10) - 1;
    if (index >= 0 && index < list.length) {
      list[index] = value;
      await AsyncStorage.setItem('@savedStatus', JSON.stringify(list));
    }
  } catch (e) {
    console.error('Favori durumu güncellenemedi:', e);
  }
};

// 🔍 Nesne sınıfını metinden çıkar
const getObjectClass = (text: string | undefined): string => {
  if (!text) return '';
  const lines = text.split('\n');
  for (let line of lines) {
    line = line.trim();
    const match = line.match(/Nesne\s*Sınıfı\s*:\s*(.+)/i);
    if (match) {
      const cls = match[1].toLowerCase();
      if (cls.includes('güvenli') || cls.includes('safe')) return 'güvenli';
      if (cls.includes('euclid') || cls.includes('öklid')) return 'euclid';
      if (cls.includes('keter') || cls.includes('tehlikeli')) return 'keter';
      
      return cls;
    }
  }
  return '';
};

// 📝 Metinden önizleme oluştur
const getPreviewText = (text: string | undefined): string => {
  if (!text) return 'Açıklama yok.';

  let processed = text;

  // ADIM 1: "Açıklama" (Description) kısmını bulmaya çalış.
  // Kullanıcılar "Karanlık odada saklayın" yazısını değil, hikayeyi merak eder.
  const descriptionMatch = processed.match(/(?:Açıklama|Description)\s*:\s*([\s\S]*)/i);

  if (descriptionMatch && descriptionMatch[1]) {
    // Açıklama başlığını bulduk, öncesindeki her şeyi (Prosedürler, Sınıf vb.) atıyoruz.
    processed = descriptionMatch[1];
  } else {
    // Açıklama başlığı yoksa, klasik yöntemle baştaki teknik terimleri siliyoruz.
    processed = processed
      .replace(/(Madde|Öğe|Item|Madde No)\s*(#|No)?\s*:?\s*SCP-\d+\s*/gi, '')
      .replace(/(Nesne|Object)\s*(Sınıfı|Class)\s*:?\s*[\w-]+\s*/gi, '')
      .replace(/(Özel|Special)\s*(Saklama|Containment)\s*(Prosedürleri|Procedures)\s*:?/gi, '');
  }

  // ADIM 2: Altbilgileri, Linkleri ve Navigasyonu Temizle
  processed = processed
    // Navigasyon oklarını sil (« SCP-011 | SCP-012 ... »)
    .replace(/«[\s\S]*?»/g, '') 
    // Alt kısımdaki Lisans, Kaynak ve Alıntı metinlerini, oradan başlayarak sonuna kadar sil
    .replace(/(Bu sayfayı|Lisans|Wiki içeriği|Kaynak|Daha fazla bilgi için).*$/si, '')
    // URL'leri temizle
    .replace(/https?:\/\/[^\s]+/g, '')
    // Fazla boşlukları ve satır başlarını tek boşluğa indir
    .replace(/\s+/g, ' ')
    .trim();

  // ADIM 3: Kısaltma (Truncate)
  if (processed.length > 150) {
    return processed.substring(0, 150).trim() + '...';
  }

  return processed || 'Açıklama yok.';
};

// 🎨 Sınıfa göre renk
const getClassColor = (objectClass: string): string => {
  if (objectClass === 'güvenli') return '#34c759';
  if (objectClass === 'euclid') return '#f1c40f';
  if (objectClass === 'keter') return '#e74c3c';
  if (objectClass === 'anormal insan') return '#2b1cafff';
  
  return '#9b59b6';
};

export const ScpListItem = ({ item, isRead, isSaved, from = 'index' }: ScpListItemProps) => {
  const { colors } = useTheme();
  const router = useRouter();
  
  const objectClass = getObjectClass(item.text);
  const previewText = item.displayText || getPreviewText(item.text);
  const codeColor = getClassColor(objectClass);

  const handlePress = () => {
    logSCPView(item.code, from);
    router.push({
      pathname: "/[code]",
      params: {
        code: item.code,
        scp: JSON.stringify(item),
        from: from
      }
    });
  };

  return (
    <Pressable 
      style={styles.itemContainer}
      onPress={handlePress}
    >
      <View style={styles.cardTopRow}>
        <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={1}>
          {item.title}
        </Text>
        <View style={styles.codeWithBadge}>
          <Text style={[styles.itemCode, { color: codeColor }]}>{item.code}</Text>
        </View>
      </View>
      
      <Text
        style={[styles.itemPreview, { color: colors.text, opacity: 0.75 }]}
        numberOfLines={2}
      >
        {previewText}
      </Text>
      
      {(objectClass || isRead || isSaved) && (
        <View style={styles.bottomRow}>
          {objectClass ? (
            <View
              style={[
                styles.classBadge,
                { backgroundColor: codeColor + '33' }
              ]}
            >
              <Text style={[styles.classBadgeText, { color: codeColor }]}>
                {objectClass}
              </Text>
            </View>
          ) : <View />}

          <View style={styles.statusIcons}>
            {isRead && (
              <View style={styles.readBadge}>
                <Feather name="eye" size={18} color="#f1c40f" />
              </View>
            )}
            {isSaved && (
              <View style={styles.savedBadge}>
                <Entypo name="heart" size={18} color="#e74c3c" />
              </View>
            )}
          </View>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    padding: 16,
    marginBottom: 10,

    marginTop: 8,
    borderRadius: 0,
    borderWidth: 0,
     backgroundColor: '#1c1c1e',
    borderColor: '#343435ff',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 4,
    borderLeftColor: '#c0392b',
    borderLeftWidth: 0
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  codeWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
    // 👇 EKLENEN: Kod alanı için minimum bir genişlik veriyoruz ki sıkışmasın.
    minWidth: 70, 
    justifyContent: 'flex-end', // Kısa kodlar (SCP-173) sağa yaslı dursun
  },
  itemCode: {
    fontSize: 15,
       // 👇 EKLENEN: Android'de dikey hizalama ve kesilmeyi önlemek için
    includeFontPadding: false, 
    textAlignVertical: 'center',
    // 👇 EKLENEN: Sağ taraftan çok hafif bir boşluk bırakıyoruz ki son harf kesilmesin
    paddingRight: 2, 
  },
  itemPreview: {
    fontSize: 14,
    marginTop: 8,
    lineHeight: 20,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  readBadge: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  savedBadge: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  readBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  savedBadgeText: {
    fontSize: 10,
  },
  classBadge: {
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  classBadgeText: {
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});