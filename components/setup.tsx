import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Modal,
    Platform,
    Pressable,
    StatusBar,
    StyleSheet,
    Text,
    View
} from 'react-native';

const { height } = Dimensions.get('window');

export default function WelcomeTerminal({ onComplete }: { onComplete: () => void }) {
    // Kendi görünürlük durumunu kontrol etmek için dahili state
    const [isVisible, setIsVisible] = useState<boolean | null>(null);
    const [text, setText] = useState('');
    const fullText = "SISTEM AKTIF EDILIYOR...\n\nHOŞ GELDIN ARAŞTIRMACI.\n\nSCP VAKFI ARŞIVINE ERIŞIM YETKISI TANIMLANDI. BURADA BINLERCE ANOMALI DOSYASINI INCELEYEBILIR, OKUMA DURUMUNU TAKIP EDEBILIR VE ÖZELLİKLERE GÖRE FILTRELEME YAPABILIRSIN.\n\nUNUTMA: SECURE. CONTAIN. PROTECT.";
    
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(10)).current;
    const stampOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Bileşen yüklendiğinde bir kez storage kontrolü yap
        const checkStatus = async () => {
            try {
                // Her iki değeri de paralel olarak çekiyoruz
                const [completed, deviceId] = await Promise.all([
                    AsyncStorage.getItem('@setup_completed'),
                    AsyncStorage.getItem('@device_short_id')
                ]);

                // Eğer setup tamamlanmışsa VEYA bir deviceId zaten atanmışsa modalı kapat
                if (completed === 'true' || deviceId !== null) {
                    setIsVisible(false);
                } else {
                    setIsVisible(true);
                    startTypingEffect();
                }
            } catch (e) {
                console.error("Storage check failed", e);
                setIsVisible(false); // Hata durumunda kullanıcıyı engellememek için kapatıyoruz
            }
        };
        checkStatus();
    }, []);

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
        }, 30);
    };

    const handleStart = async () => {
        try {
            await AsyncStorage.setItem('@setup_completed', 'true');
            setIsVisible(false); // Dahili olarak kapat
            onComplete(); // Üst bileşene haber ver
        } catch (e) {
            setIsVisible(false);
        }
    };

    // Eğer kontrol henüz bitmediyse veya zaten tamamlandıysa hiçbir şey render etme
    if (isVisible === null || isVisible === false) {
        return null;
    }

    return (
        <Modal
            visible={isVisible}
            transparent={false}
            animationType="fade"
            statusBarTranslucent={true}
        >
            <StatusBar barStyle="light-content" backgroundColor="#000" />
            
            <View style={styles.terminalContainer}>
                
                <Animated.View style={[styles.backgroundStamp, { opacity: stampOpacity }]}>
                    <MaterialCommunityIcons name="shield-outline" size={height * 0.4} color="#dc2626" />
                </Animated.View>

                <View style={styles.header}>
                    <View style={styles.headerRow}>
                        <Text style={styles.headerText}>SCP TÜRKÇE</Text>
                        <View style={styles.liveDot} />
                    </View>
                    <View style={styles.scanline} />
                </View>

                <View style={styles.body}>
                    <Text style={styles.terminalText}>
                        {text}
                        <Text style={styles.cursor}>_</Text>
                    </Text>
                </View>

                <Animated.View style={[styles.footer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    <View style={styles.settingsPreview}>
                        <View style={styles.settingsTitleRow}>
                            <MaterialCommunityIcons name="cog" size={12} color="#666" />
                            <Text style={styles.settingsHeader}>VARSAYILAN SİSTEM YAPILANDIRMASI:</Text>
                        </View>
                        
                        <View style={styles.settingItem}>
                            <MaterialCommunityIcons name="image-outline" size={16} color="#dc2626" />
                            <Text style={styles.settingLabel}>RESİM GÖSTERİMİ: <Text style={styles.activeValue}>ETKIN</Text></Text>
                        </View>
                        
                        <View style={styles.settingItem}>
                            <Feather name="message-circle" size={16} color="#dc2626" />
                            <Text style={styles.settingLabel}>PERSONEL YORUMLARI: <Text style={styles.activeValue}>GÖSTERILIYOR</Text></Text>
                        </View>
                        
                        <View style={styles.settingItem}>
                            <Feather name="eye" size={16} color="#dc2626" />
                            <Text style={styles.settingLabel}>OKUMA TAKIBI: <Text style={styles.activeValue}>OTOMATIK</Text></Text>
                        </View>
                        <View style={[styles.settingsTitleRow, { marginTop: 5 }]}>
                            <Feather name="info" size={14} color="#666" />
                            <Text style={[styles.settingsHeader, { textTransform: 'none' }]}>Tüm özelliklere ayarlardan ulaşabilirsiniz.</Text>
                        </View>
                    </View>

                    <Pressable 
                        style={({ pressed }) => [
                            styles.startButton,
                            pressed && styles.pressed
                        ]} 
                        onPress={handleStart}
                    >
                        <Text style={styles.startButtonText}>YETKIYI ONAYLA VE GIRIŞ YAP</Text>
                        <MaterialCommunityIcons name="fingerprint" size={24} color="#000" />
                    </Pressable>
                </Animated.View>
            </View>
        </Modal>
    );
}

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