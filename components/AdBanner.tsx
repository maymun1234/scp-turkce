import React, { useEffect, useState } from 'react';
import { View, Platform } from 'react-native';
import mobileAds, { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

// Global flag - sadece bir kez initialize olur
let isAdMobInitialized = false;

const adUnitId = __DEV__ 
  ? TestIds.BANNER
  : Platform.OS === 'android'
    ? 'ca-app-pub-7345089833984227/3208992589'
    : 'ca-app-pub-7345089833984227/3208992589';

export default function AdBanner() {
  const [isReady, setIsReady] = useState(isAdMobInitialized);

  useEffect(() => {
    if (!isAdMobInitialized) {
      mobileAds()
        .initialize()
        .then(() => {
          console.log('✅ Mobile Ads initialized');
          isAdMobInitialized = true;
          setIsReady(true);
        })
        .catch(error => console.error('❌ Mobile Ads init error:', error));
    } else {
      setIsReady(true);
    }
  }, []);

  if (!isReady) return null;

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