import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as QuickActions from 'expo-quick-actions';
import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import 'react-native-reanimated';
import { CONFIG } from '../constants/config';
import * as SCPs from './assets/scp_jsons';
// Uygulama başında bir kez çalıştır
//initializeApp();
import * as SplashScreen from 'expo-splash-screen';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { View } from 'react-native';
import { ScpDataRow } from '../types/scp';


// Splash screen'i hemen gizlemeyi engelle
SplashScreen.preventAutoHideAsync();

// Veri için Context
const ScpDataContext = createContext<ScpDataRow[]>([]);
export function useScpData(): ScpDataRow[] {
  return useContext(ScpDataContext);
}

export const unstable_settings = {
  anchor: '(tabs)',
};

// Özelleştirilmiş Dark Theme - kartların görünmesi için
const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#0a0a0a',  // Ana arka plan çok koyu gri
    card: '#1c1c1e',        // Kart arka planı koyu gri
    border: '#636366',      // Kenar rengi daha açık
  },
};






export default function RootLayout() {
const fonturl= '../assets/fonts/inter/Inter_18pt-';
const [loaded, error] = useFonts({
    'Inter-Regular': require('../assets/fonts/inter/Inter_18pt-Regular.ttf'),
    'Inter-Bold': require('../assets/fonts/inter/Inter_18pt-Bold.ttf'),
    'Inter-Black': require('../assets/fonts/inter/Inter_18pt-Black.ttf'),

   
  });

useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

 


  const [appIsReady, setAppIsReady] = useState(false);
  const [scpData, setScpData] = useState<ScpDataRow[]>([]); 
  useEffect(() => {
    // Sadece Android'de çalışsın
    if (Platform.OS !== 'android') return;

    // Kısayol tıklamalarını dinle
    const subscription = QuickActions.addListener((action) => {
      console.log('Quick Action:', action);
      
      switch (action.params?.action) {
        case 'random':
          // Rastgele SCP'ye git
          const randomNum = Math.floor(Math.random() * 6000) + 1;
          const randomCode = `SCP-${String(randomNum).padStart(3, '0')}`;
          router.push({
            pathname: '/(tabs)/[code]',
            params: { code: randomCode, from: 'shortcut' }
          });
          break;
          
        case 'favourites':
          router.push('/(tabs)/favourites');
          break;
          
        case 'filter':
          router.push('/(tabs)/filter');
          break;
      }
    });

    return () => subscription.remove();
  }, []);



  
  useEffect(() => {
    async function prepare() {
      try {
        console.log("Yerel SCP JSON dosyaları yükleniyor...");
        
        const rawData: ScpDataRow[] = Array.from({ length: CONFIG.TOTAL_SCP_COUNT }, (_, i) => {
  const key = `SCP${String(i + 1).padStart(3, '0')}`;
  return (SCPs as any)[key];
});
        
        const cleanedData = rawData.map(item => ({
            ...item,
            title: item.title ? item.title.replace(/^"|"$/g, '') : item.title
        }));
        
        setScpData(cleanedData); 
        console.log(`SCP verisi yüklendi (${cleanedData.length} kayıt).`);
        
      } catch (e: any) { 
        console.error("KRİTİK HATA: SCP JSON dosyaları yüklenemedi. 'catch' bloğu tetiklendi.");
        
        if (e.message && e.message.includes('Unable to resolve module')) {
            console.error("LÜTFEN KONTROL EDİN: 'assets/scp_jsons/' klasöründe SCP-001.json'dan SCP-010.json'a kadar tüm dosyaların bulunduğundan emin olun.");
        }

        if (e instanceof Error) {
          console.error("Hata Tipi:", e.name);
          console.error("Hata Mesajı:", e.message);
          console.error("Hata Stack:", e.stack);
        } else {
          console.error("Hata Objesi (JSON):", JSON.stringify(e, null, 2));
        }

      } finally {
        setAppIsReady(true);
        console.log("Uygulama hazır.");
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
     if (!loaded && !error) {
    return null;
  }
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null; 
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <ScpDataContext.Provider value={scpData}>
        <ThemeProvider value={CustomDarkTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <StatusBar style="dark" /> 
        </ThemeProvider>
      </ScpDataContext.Provider>
    </View>
  );
}