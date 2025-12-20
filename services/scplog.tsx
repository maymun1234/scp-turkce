// services/scpLogger.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- Yardımcı Fonksiyon: 5 Haneli Rastgele ID Oluşturucu ---
const generateShortID = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result; // Örn: 'XyBaZ'
};

// --- Yardımcı Fonksiyon: Cihaz ID'sini Getir veya Oluştur ---
const getOrCreateDeviceId = async (): Promise<string> => {
  try {
    let deviceId = await AsyncStorage.getItem('@device_short_id');

    // Eğer yoksa yeni oluştur ve kaydet
    if (!deviceId) {
      deviceId = generateShortID();
      await AsyncStorage.setItem('@device_short_id', deviceId);
      console.log('Yeni Gölge Kullanıcı ID oluşturuldu:', deviceId);
    }

    return deviceId;
  } catch (error) {
    // Hata durumunda rastgele geçici bir ID dön
    return generateShortID();
  }
};

/**
 * SCP görüntülemesini, tıklama türünü ve kısa cihaz ID'sini sunucuya bildirir.
 * @param scpCode - Loglanacak SCP kodu (örn: 'SCP-173')
 * @param clickType - Tıklama türü (örn: 'random', 'search')
 */
export const logSCPView = async (scpCode: string, clickType: string): Promise<void> => {
  try {
    const allowDataCollection = await AsyncStorage.getItem('@allowDataCollection');
  
    if (allowDataCollection === 'false') {
      return; 
    }

    // 1. Kısa ID'yi al
    const deviceId = await getOrCreateDeviceId();

    const formattedCode = encodeURIComponent(scpCode);
    const formattedType = encodeURIComponent(clickType);
    const formattedUid = encodeURIComponent(deviceId); 
    
    // URL
    const url = `http://bercan.blog/pages/scp/scplog.php?scp=${formattedCode}&clicktype=${formattedType}&uid=${formattedUid}`;

    // İstek gönderimi
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      console.log(`[LOG] ${scpCode} | Tür: ${clickType} | User: ${deviceId}`);
    }

  } catch (error) {
    console.error(`[AĞ HATASI]`, error);
  }
};