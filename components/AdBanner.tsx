import React from 'react';
import { Platform, View } from 'react-native';
import mobileAds, { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

// ⚡️ SDK Başlatma: Component dışında olduğu için uygulama açılırken bir kez başlar.
// Hiçbir await veya .then() beklememize gerek yok, arka planda başlasın yeter.
mobileAds().initialize();

const adUnitId = __DEV__
  ? TestIds.BANNER
  : Platform.OS === 'android'
    ? 'ca-app-pub-7345089833984227/3208992589'
    : 'ca-app-pub-7345089833984227/3208992589';

export default function AdBanner() {


  return (
    <View style={{ alignItems: 'center', marginVertical: 10 }}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: false,
        }}
        onAdLoaded={() => console.log('✅ Gösterim alındı!')}
        onAdFailedToLoad={(error) => console.log('❌ Hata:', error)}
      />
    </View>
  );
}