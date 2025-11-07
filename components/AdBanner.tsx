import React, { useEffect, useState } from 'react';
import { View, Platform } from 'react-native';
import mobileAds, { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

const adUnitId = __DEV__ 
  ? TestIds.BANNER // Test modunda Google'ın test ID'si
  : Platform.OS === 'android'
    ? 'ca-app-pub-3940256099942544/6300978111' // AdMob Console'dan alacağınız gerçek Android Banner ID
    : 'ca-app-pub-3940256099942544/6300978111'; // Gerçek iOS Banner ID

export default function AdBanner() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Google Mobile Ads'i başlat
    mobileAds()
      .initialize()
      .then(adapterStatuses => {
        console.log('✅ Mobile Ads initialized:', adapterStatuses);
        setIsInitialized(true);
      })
      .catch(error => {
        console.error('❌ Mobile Ads init error:', error);
      });
  }, []);

  if (!isInitialized) {
    return null; // Başlatılana kadar hiçbir şey gösterme
  }

  return (
    <View style={{ alignItems: 'center', marginVertical: 10 }}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: false, // Kişiselleştirilmiş reklamlar
        }}
        onAdLoaded={() => {
          console.log('✅ Banner reklam yüklendi');
        }}
        onAdFailedToLoad={(error) => {
          console.log('❌ Reklam hatası:', error);
        }}
      />
    </View>
  );
}
