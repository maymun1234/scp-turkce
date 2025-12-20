// SettingsManager.js
import AsyncStorage from '@react-native-async-storage/async-storage';

// Varsayılan ayarlar
export const DEFAULT_SETTINGS = {
  autoMarkRead: true,
  autoDownloadImages: true,
  skipReadedItems: true,
  ShowCommentSection: false,
  // Diğer ayarlar buraya eklenebilir
};

/**
 * Belirtilen ayar anahtarının değerini yükler.
 * Kaydedilmiş bir değer yoksa varsayılan değeri kaydeder ve döndürür.
 * @param {string} key - Ayar anahtarı (örn: '@autoMarkRead')
 * @param {*} defaultValue - Kaydedilmiş değer yoksa kullanılacak varsayılan değer
 * @returns {Promise<boolean>} - Ayarın boolean değeri
 */




export const loadSetting = async (key: string, defaultValue: boolean): Promise<boolean> => {
  try {
    const saved = await AsyncStorage.getItem(key);
    if (saved !== null) {
      // Kaydedilmiş değeri döndür
      return saved === 'true';
    } else {
      // Varsayılan değeri kaydet ve döndür
      await AsyncStorage.setItem(key, defaultValue.toString());
      return defaultValue;
    }
  } catch (e) {
    console.error(`Error loading setting for ${key}:`, e);
    // Hata durumunda varsayılan değeri döndür
    return defaultValue;
  }
};

/**
 * Belirtilen ayar anahtarının yeni değerini kaydeder.
 * @param {string} key - Ayar anahtarı (örn: '@autoMarkRead')
 * @param {boolean} value - Kaydedilecek boolean değer
 * @returns {Promise<void>}
 */
export const saveSetting = async (key: string, value: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, value.toString());
  } catch (e) {
    console.error(`Error saving setting for ${key}:`, e);
  }
};

/**
 * Uygulamanın ilk açılışında tüm ayarları yükler.
 * @returns {Promise<{autoMarkRead: boolean, autoDownloadImages: boolean, skipReadedItems: boolean, showCommentSection: boolean}>}
 */
export const loadInitialSettings = async () => {
  const [autoMarkRead, autoDownloadImages, skipReadedItems, showCommentSection] = await Promise.all([
    loadSetting('@autoMarkRead', DEFAULT_SETTINGS.autoMarkRead),
    loadSetting('@autoDownloadImages', DEFAULT_SETTINGS.autoDownloadImages),
    loadSetting('@skipReadedItems', DEFAULT_SETTINGS.skipReadedItems),
    loadSetting('@showCommentSection', DEFAULT_SETTINGS.ShowCommentSection),
  ]);
  return { autoMarkRead, autoDownloadImages, skipReadedItems, showCommentSection };
};

/**
 * Okuma ve Kayıtlı durumlarını sıfırlar.
 * @returns {Promise<void>}
 */
export const resetReadAndSavedStatus = async () => {
  await AsyncStorage.removeItem('@readStatus');
  await AsyncStorage.removeItem('@savedStatus');
  await AsyncStorage.removeItem('@skipReadedItems');
  
};