import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization'; // Dil kontrolü için eklendi
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Linking, // Dış bağlantı için eklendi
    Modal,
    Platform,
    Pressable,
    StatusBar,
    StyleSheet,
    Text,
    View
} from 'react-native';

const { height } = Dimensions.get('window');

// SCP Ultra linki (Burayı gerçek link ile değiştirebilirsiniz)
const SCP_ULTRA_URL = "https://play.google.com/store/apps/details?id=com.bercanayd.scpultra"; 

export default function WelcomeTerminal({ onComplete }: { onComplete: () => void }) {
    const [isVisible, setIsVisible] = useState<boolean | null>(null);
    const [isWrongLanguage, setIsWrongLanguage] = useState(false); // Dil kontrolü state'i
    const [text, setText] = useState('');
    
    // Dil kontrolüne göre metin seçimi
    const fullText = isWrongLanguage 
        ? "SYSTEM ERROR: LANGUAGE MISMATCH DETECTED.\n\nACCESS DENIED FOR LOCAL DATABASE. PLEASE USE THE INTERNATIONAL TERMINAL (SCP ULTRA) FOR ENGLISH CONTENT.\n\nREDIRECTING TO GLOBAL ARCHIVE..."
        : "SISTEM AKTIF EDILIYOR...\n\nHOŞ GELDIN ARAŞTIRMACI.\n\nSCP VAKFI ARŞIVINE ERIŞIM YETKISI TANIMLANDI. BURADA BINLERCE ANOMALI DOSYASINI INCELEYEBILIR, OKUMA DURUMUNU TAKIP EDEBILIR VE ÖZELLİKLERE GÖRE FILTRELEME YAPABILIRSIN.\n\nUNUTMA: SECURE. CONTAIN. PROTECT.";
    
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(10)).current;
    const stampOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const checkStatus = async () => {
            try {
                // 1. Dil Kontrolü
                const locale = Localization.getLocales()[0].languageCode;
                if (locale !== 'tr') {
                    setIsWrongLanguage(true);
                    setIsVisible(true);
                    startTypingEffect();
                    return; // Türkçe değilse setup kontrolüne bakmadan direkt uyarıyı göster
                }

                // 2. Klasik Setup Kontrolü
                const [completed, deviceId] = await Promise.all([
                    AsyncStorage.getItem('@setup_completed'),
                    AsyncStorage.getItem('@device_short_id')
                ]);

                if (completed === 'true' || deviceId !== null) {
                    setIsVisible(false);
                } else {
                    setIsVisible(true);
                    startTypingEffect();
                }
            } catch (e) {
                console.error("Initialization failed", e);
                setIsVisible(false);
            }
        };
        checkStatus();
    }, [isWrongLanguage]); // isWrongLanguage değiştiğinde tetiklenmesi için

    const startTypingEffect = () => {
        let index = 0;
        const timer = setInterval(() => {
            setText(fullText.substring(0, index));
            index++;
            if (index > fullText.length) {
                clearInterval(timer);
                Animated.parallel([
                    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
                    Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
                    Animated.timing(stampOpacity, { toValue: 0.1, duration: 1000, useNativeDriver: true })
                ]).start();
            }
        }, 25);
    };

    const handleAction = async () => {
        if (isWrongLanguage) {
            // SCP Ultra'ya yönlendir
            Linking.openURL(SCP_ULTRA_URL);
        } else {
            // Normal giriş işlemi
            try {
                await AsyncStorage.setItem('@setup_completed', 'true');
                setIsVisible(false);
                onComplete();
            } catch (e) {
                setIsVisible(false);
            }
        }
    };

    if (isVisible === null || isVisible === false) return null;

    return (
        <Modal visible={isVisible} transparent={false} animationType="fade" statusBarTranslucent={true}>
            <StatusBar barStyle="light-content" backgroundColor="#000" />
            <View style={styles.terminalContainer}>
                
                <Animated.View style={[styles.backgroundStamp, { opacity: stampOpacity }]}>
                    <MaterialCommunityIcons 
                        name={isWrongLanguage ? "alert-octagon-outline" : "shield-outline"} 
                        size={height * 0.4} 
                        color="#dc2626" 
                    />
                </Animated.View>

                <View style={styles.header}>
                    <View style={styles.headerRow}>
                        <Text style={styles.headerText}>
                            {isWrongLanguage ? "SYSTEM TERMINAL" : "SCP TÜRKÇE"}
                        </Text>
                        <View style={[styles.liveDot, isWrongLanguage && { backgroundColor: '#dc2626' }]} />
                    </View>
                    <View style={styles.scanline} />
                </View>

                <View style={styles.body}>
                    <Text style={[styles.terminalText, isWrongLanguage && { color: '#dc2626' }]}>
                        {text}
                        <Text style={styles.cursor}>_</Text>
                    </Text>
                </View>

                <Animated.View style={[styles.footer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    <Pressable 
                        style={({ pressed }) => [
                            styles.startButton,
                            pressed && styles.pressed,
                            isWrongLanguage && { backgroundColor: '#dc2626' }
                        ]} 
                        onPress={handleAction}
                    >
                        <Text style={[styles.startButtonText, isWrongLanguage && { color: '#fff' }]}>
                            {isWrongLanguage ? "OPEN SCP ULTRA (GLOBAL)" : "YETKIYI ONAYLA VE GIRIŞ YAP"}
                        </Text>
                        <MaterialCommunityIcons 
                            name={isWrongLanguage ? "earth" : "fingerprint"} 
                            size={24} 
                            color={isWrongLanguage ? "#fff" : "#000"} 
                        />
                    </Pressable>
                </Animated.View>
            </View>
        </Modal>
    );
}

// ... styles aynı kalabilir, sadece isWrongLanguage durumunda buton rengini değiştirdik.
const styles = StyleSheet.create({
    terminalContainer: {
        flex: 1,
        padding: 30,
        justifyContent: 'space-between',
        backgroundColor: '#000',
    },
    backgroundStamp: {
        position: 'absolute',
        top: '20%',
        left: '-10%',
        zIndex: 0,
    },
    header: {
        marginTop: 50,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 10,
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#2ecc71',
        marginLeft: 'auto',
    },
    headerText: {
        color: '#dc2626',
        fontSize: 15,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    scanline: {
        height: 1,
        backgroundColor: '#dc2626',
        opacity: 0.3,
        width: '100%',
    },
    body: {
        flex: 1,
        justifyContent: 'center',
        zIndex: 1,
    },
    terminalText: {
        color: '#eee',
        fontSize: 16,
        lineHeight: 26,
        letterSpacing: 0.5,
        fontWeight: '500',
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    cursor: {
        color: '#dc2626',
        fontWeight: 'bold',
    },
    footer: {
        marginBottom: 40,
        zIndex: 1,
    },
    settingsPreview: {
        marginBottom: 25,
        gap: 12,
        backgroundColor: 'rgba(20,20,20,0.8)',
        padding: 20,
        borderWidth: 1,
        borderColor: '#222',
        borderRadius: 8,
    },
    settingsTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    settingsHeader: {
        color: '#666',
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 1,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    settingLabel: {
        color: '#888',
        fontSize: 11,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    activeValue: {
        color: '#dc2626',
    },
    startButton: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        borderRadius: 6,
        gap: 12,
    },
    startButtonText: {
        color: '#000',
        fontWeight: '900',
        fontSize: 13,
        letterSpacing: 1,
    },
    pressed: {
        opacity: 0.8,
        transform: [{ scale: 0.98 }],
    }
});