import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * useReadAndSaveStatus hook
 * - itemCode: string like "SCP-123"
 * Returns: { isRead, toggleRead, isSaved, toggleSaved, readStatus, savedStatus }
 */
export function useReadAndSaveStatus(itemCode: string) {
  const [readStatus, setReadStatus] = useState<boolean[]>(new Array(6000).fill(false));
  const [savedStatus, setSavedStatus] = useState<boolean[]>(new Array(6000).fill(false));
  const [isRead, setIsRead] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const codeNumber = parseInt(itemCode.replace('SCP-', ''), 10);
  const itemIndex = Number.isNaN(codeNumber) ? -1 : codeNumber - 1; // index 0 bazlı

  // AsyncStorage'dan yükle
  useEffect(() => {
    let mounted = true;
    const loadStatus = async () => {
      try {
        // Read status
        const readJsonValue = await AsyncStorage.getItem('@readStatus');
        const readStatusData = readJsonValue ? JSON.parse(readJsonValue) : new Array(6000).fill(false);
        
        // Saved status
        const savedJsonValue = await AsyncStorage.getItem('@savedStatus');
        const savedStatusData = savedJsonValue ? JSON.parse(savedJsonValue) : new Array(6000).fill(false);
        
        if (!mounted) return;
        
        setReadStatus(readStatusData);
        setSavedStatus(savedStatusData);
        
        if (itemIndex >= 0) {
          setIsRead(readStatusData[itemIndex] || false);
          setIsSaved(savedStatusData[itemIndex] || false);
        }
      } catch (e) {
        console.error('Okuma hatası', e);
      }
    };
    if (itemIndex >= 0) loadStatus();
    return () => {
      mounted = false;
    };
  }, [itemIndex]);

  // Read toggle
  const toggleRead = async () => {
    if (itemIndex < 0) return;
    try {
      const updated = [...readStatus];
      updated[itemIndex] = !updated[itemIndex];
      setReadStatus(updated);
      setIsRead(updated[itemIndex]);
      await AsyncStorage.setItem('@readStatus', JSON.stringify(updated));
    } catch (e) {
      console.error('Kaydetme hatası', e);
    }
  };

  // Save toggle
  const toggleSaved = async () => {
    if (itemIndex < 0) return;
    try {
      const updated = [...savedStatus];
      updated[itemIndex] = !updated[itemIndex];
      setSavedStatus(updated);
      setIsSaved(updated[itemIndex]);
      await AsyncStorage.setItem('@savedStatus', JSON.stringify(updated));
    } catch (e) {
      console.error('Kaydetme hatası', e);
    }
  };

  return { isRead, toggleRead, isSaved, toggleSaved, readStatus, savedStatus,  };
}