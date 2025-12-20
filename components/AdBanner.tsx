import * as Network from 'expo-network';
import React, { useEffect, useState } from 'react';
import { Platform, View } from 'react-native';
import mobileAds, { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

// Global flag - sadece bir kez initialize olur
let isAdMobInitialized = false;

export default function AdBanner() {
  // 1. State tanımları fonksiyonun İÇİNE alındı
  const [isReady, setIsReady] = useState(isAdMobInitialized);
  const [isConnected, setIsConnected] = useState(true);

  const adUnitId = __DEV__
    ? TestIds.BANNER
    : Platform.OS === 'android'
      ? 'ca-app-pub-7345089833984227/3208992589'
      : 'ca-app-pub-7345089833984227/3208992589';

  useEffect(() => {
    // 2. useEffect içinde async fonksiyon oluşturuldu
    const initAdsAndCheckNetwork = async () => {
      try {
        // Ağ durumunu kontrol et
        const networkState = await Network.getNetworkStateAsync();
        
        // Hem ağa bağlı mı hem de internete erişim var mı diye bakıyoruz
        const hasInternet = (networkState.isConnected ?? false) && (networkState.isInternetReachable ?? false);
        setIsConnected(hasInternet);

        // Eğer internet yoksa reklamı başlatmaya çalışmaya gerek yok
        if (!hasInternet) return;

        if (!isAdMobInitialized) {
          await mobileAds().initialize();
          console.log('✅ Mobile Ads initialized');
          isAdMobInitialized = true;
          setIsReady(true);
        } else {
          setIsReady(true);
        }
      } catch (error) {
        console.error('❌ Error in AdBanner init:', error);
        // Hata durumunda güvenli tarafı seçip reklam göstermeyebiliriz
        setIsReady(false);
      }
    };

    initAdsAndCheckNetwork();
  }, []);

  // 3. İstenilen koşul: Hazır değilse VEYA internet yoksa null döndür
  if (!isReady || !isConnected) {
    return null;
  }

  return (
    <View style={{ alignItems: 'center', marginVertical: 10 }}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: false,
        }}
        onAdLoaded={() => console.log('✅ Banner yüklendi')}
        onAdFailedToLoad={(error) => console.log('❌ Reklam hatası:', error)}
      />
    </View>
  );
}