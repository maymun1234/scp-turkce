// hooks/useReadCount.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';

export function useReadCount(totalItems: number = 6000) {
  const [readCount, setReadCount] = useState(0);

  const loadReadCount = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('@readStatus');
      if (jsonValue != null) {
        const readArray: boolean[] = JSON.parse(jsonValue);
        // "true" olanların sayısını bul
        const count = readArray.filter(Boolean).length;
        setReadCount(count);
      } else {
        setReadCount(0);
      }
    } catch (e) {
      console.error("Okuma sayısı alınamadı", e);
    }
  };

  // Sayfaya her odaklanıldığında (geri gelindiğinde) sayıyı güncelle
  useFocusEffect(
    useCallback(() => {
      loadReadCount();
    }, [])
  );

  return readCount;
}