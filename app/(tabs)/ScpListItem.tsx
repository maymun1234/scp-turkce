// components/ScpListItem.tsx
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { ScpDataRow } from '../../types/scp';
import Feather from '@expo/vector-icons/Feather';
import Entypo from '@expo/vector-icons/Entypo';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
      if (cls.includes('euclid')) return 'euclid';
      if (cls.includes('keter') || cls.includes('tehlikeli')) return 'keter';
      return cls;
    }
  }
  return '';
};

// 📝 Metinden önizleme oluştur
const getPreviewText = (text: string | undefined): string => {
  if (!text) return 'Açıklama yok.';
  
  let cleaned = text
    .replace(/^Öğe|Madde|Madde No|No:\s*#:\s*SCP-\d+\s*/i, '')
    .replace(/^Item\s*#:\s*SCP-\d+\s*/i, '')
    .replace(/Nesne\s*Sınıfı:\s*[^\n]+\n?/i, '')
    .replace(/#:\s*SCP-\d+/gi, '')
    .replace(/«\s*SCP-\d+\s*\|\s*SCP-\d+\s*\|\s*SCP-\d+\s*»/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (cleaned.length > 150) {
    cleaned = cleaned.substring(0, 150) + '...';
  }
  
  return cleaned || 'Açıklama yok.';
};

// 🎨 Sınıfa göre renk
const getClassColor = (objectClass: string): string => {
  if (objectClass === 'güvenli') return '#34c759';
  if (objectClass === 'euclid') return '#f1c40f';
  if (objectClass === 'keter') return '#e74c3c';
  if (objectClass === 'anormal insan') return '#2b1cafff';
  return '#ffffffff';
};

export const ScpListItem = ({ item, isRead, isSaved, from = 'index' }: ScpListItemProps) => {
  const { colors } = useTheme();
  const router = useRouter();
  
  const objectClass = getObjectClass(item.text);
  const previewText = item.displayText || getPreviewText(item.text);
  const codeColor = getClassColor(objectClass);

  const handlePress = () => {
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
    marginBottom: 14,
    marginTop: 8,
    borderRadius: 0,
    borderWidth: 0,
    backgroundColor: '#2c2c2e',
    borderColor: '#48484a',
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
  },
  itemCode: {
    fontSize: 16,
    fontWeight: 'bold',
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