import { Feather, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import ViewShot from 'react-native-view-shot';
import { logSCPView } from '../../services/scplog';
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.85;
const CARD_HEIGHT = CARD_WIDTH * 1.58;
export default function IdCardScreen() {
  const router = useRouter();
  const viewShotRef = useRef<ViewShot>(null);
  
  const defaultData = {
    name: 'İsim',
    surname: 'Soyisim',
    site: '45',
    classLevel: 'E',
    clearance: '01',
    role: 'ARAŞTIRMA',
    issueDate: '2019APR16',
    photoUrl: 'http://bercan.blog/pages/scp/res/unnamed.png',
  };

  const [cardData, setCardData] = useState(defaultData);
  const [isEditing, setIsEditing] = useState(false);
  const [tempData, setTempData] = useState(cardData);
const [showRoleDropdown, setShowRoleDropdown] = useState(false);

const ROLES = [
  'ARAŞTIRMACI',
  'SAHA AJANI',
  'GÜVENLİK ŞEFİ',
  'MOBİL GÖREV GÜCÜ',
  'TESİS YÖNETİCİSİ',
  'TIBBİ PERSONEL',
  'TEKNİK UZMAN',
  'D SINIFI PERSONEL',
  'O5 KONSEYİ'
];
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedData = await AsyncStorage.getItem('@scp_card_data');
        if (savedData !== null) {
          setCardData(JSON.parse(savedData));
        }
      } catch (e) {
        console.error("Veri yükleme hatası:", e);
      }
    };
    loadData();
    logSCPView("7000", "idcard"); 
  }, []);

  const rotateX = useSharedValue(0);
  const rotateY = useSharedValue(0);

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      rotateX.value = interpolate(event.y, [0, CARD_HEIGHT], [10, -10], Extrapolation.CLAMP);
      rotateY.value = interpolate(event.x, [0, CARD_WIDTH], [-10, 10], Extrapolation.CLAMP);
    })
    .onFinalize(() => {
      rotateX.value = withSpring(0);
      rotateY.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateX: `${rotateX.value}deg` },
      { rotateY: `${rotateY.value}deg` },
    ],
  }));

  const sheenStyle = useAnimatedStyle(() => ({
    opacity: interpolate(Math.abs(rotateY.value) + Math.abs(rotateX.value), [0, 50], [0, 5.0]),
  }));

  const handleEditOpen = () => {
    setTempData(cardData);
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      setCardData(tempData);
      setIsEditing(false);
      const jsonValue = JSON.stringify(tempData);
      await AsyncStorage.setItem('@scp_card_data', jsonValue);
    } catch (e) {
      console.error("Kaydetme hatası:", e);
      Alert.alert("Hata", "Veriler kaydedilemedi.");
    }
  };

  const handleShare = async () => {
    try {
      if (viewShotRef.current && viewShotRef.current.capture) {
        const uri = await viewShotRef.current.capture();
        
        if (!(await Sharing.isAvailableAsync())) {
          Alert.alert("Hata", "Cihazınızda paylaşım özelliği kullanılamıyor.");
          return;
        }

        await Sharing.shareAsync(uri, {
            mimeType: 'image/png',
            dialogTitle: 'SCP Kimlik Kartını Paylaş',
            UTI: 'public.png'
        });
      }
    } catch (error) {
      console.error("Snapshot hatası:", error);
      Alert.alert("Hata", "Kart oluşturulurken bir sorun oluştu.");
    }
  };

  const downloadImage = async () => {
    try {
      if (viewShotRef.current && viewShotRef.current.capture) {
        const uri = await viewShotRef.current.capture();
        Alert.alert("Başarılı", "Kart görüntüsü kaydedildi: " + uri);
      }
    } catch (error) {
      console.error("Snapshot hatası:", error);
      Alert.alert("Hata", "Kart oluşturulurken bir sorun oluştu.");
    }
  };

  // 📷 GALERİDEN FOTOĞRAF SEÇ
  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert("İzin Gerekli", "Galeriye erişim için izin vermeniz gerekiyor.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 1,
      });

      if (!result.canceled && result.assets[0].uri) {
        setTempData({...tempData, photoUrl: result.assets[0].uri});
      }
    } catch (error) {
      console.error("Resim seçme hatası:", error);
      Alert.alert("Hata", "Resim yüklenirken bir sorun oluştu.");
    }
  };

  return (
    
    <GestureHandlerRootView style={styles.container}>
        <LinearGradient
  // Koyu griden tam siyaha geçiş yaparak derinlik katar
  colors={['#1d1818ff', '#381414ff']} 
  style={styles.container}
>
      <StatusBar barStyle="light-content" />
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/favourites')}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.screenTitle}>KİMLİK KARTI</Text>

        <View style={{flexDirection:'row', gap: 10}}>
            <TouchableOpacity style={styles.iconButton} onPress={handleShare}>
                <Ionicons name="share-social-outline" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={downloadImage}>
                <Feather name="download" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={handleEditOpen}>
                <Feather name="edit-3" size={24} color="#fbd501" />
            </TouchableOpacity>
        </View>
      </View>

      <View style={styles.cardArea}>
        <GestureDetector gesture={gesture}>
          <Animated.View style={[styles.cardContainer, animatedStyle]}>
            <ViewShot 
                ref={viewShotRef} 
                options={{ format: "png", quality: 1.0, result: "tmpfile" }}
                style={{ flex: 1, width: '100%', height: '100%' }}
            >
                <View style={styles.innerCardContent}>
                    <View style={styles.watermarkContainer}>
                        <Text style={styles.watermarkText}>⚛</Text>
                    </View>

                    <View style={styles.headerRow}>
                    <View style={styles.photoContainer}>
                        <Image source={{ uri: cardData.photoUrl }} style={styles.profilePhoto} />
                    </View>
                    
                    <View style={styles.logoSection}>
                        <Text style={styles.scpHeader}>SCP{'\n'}FOUNDATION</Text>
                        <View style={styles.logoCircle}>
                            <Image  
                        source={require('../../assets/images/SCP_Foundation_(emblem).svg.png')} 
                        style={{ width: 50, height: 50, resizeMode: 'contain', tintColor: '#ffffffff'  }} />
                        </View>
                        <Text style={styles.siteText}>SITE: {cardData.site}</Text>
                    </View>
                    </View>

                    <View style={styles.nameSection}>
                        <Text style={styles.lastName}>{cardData.name}</Text>
                        <Text style={styles.firstName}>{cardData.surname}</Text>
                    </View>

                    <View style={styles.bodyRow}>
                    <View style={styles.barcodeContainer}>
                        {[...Array(17)].map((_, i) => (
                        <View key={i} style={[styles.barcodeLine, { height: Math.random() * 5 + 3 }]} />
                        ))}
                    </View>

                    <View style={styles.infoColumn}>
                        <View style={styles.classRow}>
                        <View>
                            <Text style={styles.label}>SINIF</Text>
                            <Text style={styles.valueHuge}>{cardData.classLevel}</Text>
                        </View>
                        <View style={{marginLeft: 20}}>
                            <Text style={styles.label}>SEVIYE</Text>
                            <Text style={styles.valueHuge}>{cardData.clearance}</Text>
                        </View>
                        </View>

                        <Text style={styles.roleText}>{cardData.role}</Text>

                        <View style={styles.chipRow}>
                        <View style={styles.chip}>
                            <View style={styles.chipLine} />
                            <View style={[styles.chipLine, {transform:[{rotate:'90deg'}]}]} />
                        </View>
                        <View style={styles.dateContainer}>
                            <Text style={styles.label}>Basım tarihi</Text>
                            <Text style={styles.dateValue}>{cardData.issueDate}</Text>
                        </View>
                        </View>
                    </View>
                    </View>
                    
                    <Text style={styles.footerText}>Secure, Contain, Protect</Text>
                </View>
            </ViewShot>

            <Animated.View style={[styles.sheen, sheenStyle]} />
          </Animated.View>
        </GestureDetector>
        <Text style={styles.instructionText}>Kartı incelemek için basılı tutup oynatın</Text>
      </View>
 </LinearGradient>
      <Modal visible={isEditing} animationType="slide" transparent={true}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>PERSONEL DOSYASI</Text>
              <TouchableOpacity onPress={() => setIsEditing(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.formScroll}>
              <Text style={styles.inputLabel}>FOTOĞRAF</Text>
              <TouchableOpacity style={styles.photoPickerButton} onPress={pickImage}>
                <Image 
                  source={{ uri: tempData.photoUrl }} 
                  style={styles.photoPreview} 
                />
                <View style={styles.photoOverlay}>
                  <Ionicons name="camera" size={32} color="#fff" />
                  <Text style={styles.photoOverlayText}>Galeriden Seç</Text>
                </View>
              </TouchableOpacity>

              <Text style={styles.inputLabel}>AD</Text>
              <TextInput style={styles.input} value={tempData.name} onChangeText={(t) => setTempData({...tempData, name: t})} />
              
              <Text style={styles.inputLabel}>SOYAD</Text>
              <TextInput style={styles.input} value={tempData.surname} onChangeText={(t) => setTempData({...tempData, surname: t})} />
              
              <View style={styles.rowInputs}>
                <View style={styles.halfInput}>
                  <Text style={styles.inputLabel}>SİTE NOSU</Text>
                  <TextInput style={styles.input} value={tempData.site} onChangeText={(t) => setTempData({...tempData, site: t})} />
                </View>
                
                <View style={styles.halfInput}>
                  <Text style={styles.inputLabel}>SINIF</Text>
                  <TextInput style={styles.input} value={tempData.classLevel} onChangeText={(t) => setTempData({...tempData, classLevel: t})} />
                </View>
              </View>
              
              <Text style={styles.inputLabel}>GÜVENLİK KODU</Text>
              <TextInput style={styles.input} value={tempData.clearance} onChangeText={(t) => setTempData({...tempData, clearance: t})} />
              
            <Text style={styles.inputLabel}>GÖREV</Text>

{/* Dropdown Tetikleyici Buton */}
<TouchableOpacity 
  style={styles.dropdownButton} 
  onPress={() => setShowRoleDropdown(!showRoleDropdown)}
  activeOpacity={0.8}
>
  <Text style={styles.dropdownButtonText}>{tempData.role || 'Rol Seçiniz'}</Text>
  <Ionicons 
    name={showRoleDropdown ? "chevron-up" : "chevron-down"} 
    size={20} 
    color="#fbd501" 
  />
</TouchableOpacity>

{/* Seçenekler Listesi (Sadece açıkken görünür) */}
{showRoleDropdown && (
  <View style={styles.dropdownList}>
    {ROLES.map((role, index) => (
      <TouchableOpacity 
        key={index} 
        style={styles.dropdownItem}
        onPress={() => {
          setTempData({ ...tempData, role: role });
          setShowRoleDropdown(false); // Seçince kapat
        }}
      >
        <View style={[
          styles.radioButton, 
          tempData.role === role && styles.radioButtonSelected
        ]} />
        <Text style={[
          styles.dropdownItemText,
          tempData.role === role && { color: '#fbd501', fontWeight: 'bold' }
        ]}>
          {role}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
)}
              <Text style={styles.inputLabel}>BASIM TARİHİ</Text>
              <TextInput style={styles.input} value={tempData.issueDate} onChangeText={(t) => setTempData({...tempData, issueDate: t})} />
            </ScrollView>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>VERİLERİ GÜNCELLE</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
     
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 60,
    paddingBottom: 20,
    zIndex: 50,
  },
  iconButton: {
    padding: 8,
    backgroundColor: 'rgba(159, 154, 154, 0.4)',
    borderRadius: 20,
  },
  screenTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 2,
    opacity: 0.8,
  },
  cardArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  instructionText: { color: '#ffffffff', marginTop: 30, fontSize: 12,  textTransform: 'uppercase', letterSpacing: 1 },
  
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: '#141416',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333',
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },

  innerCardContent: {
    flex: 1,
    padding: 20,
    backgroundColor: '#141416',
  },

  watermarkContainer: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', zIndex: -1, opacity: 0.05 },
  watermarkText: { fontSize: 200, color: '#fff' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  photoContainer: { borderRadius: 50, width: CARD_WIDTH * 0.4, height: CARD_WIDTH * 0.5, backgroundColor: '#ccc', borderWidth: 0, borderColor: '#ff0404ff' },
  profilePhoto: { width: '100%', height: '100%', resizeMode: 'cover' },
  logoSection: { flex: 1, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 5 },
  scpHeader: { color: '#fff', fontSize: 10, fontWeight: '900', textAlign: 'center', letterSpacing: 2, marginBottom: 10 },
  logoCircle: { width: 70, height: 70, borderRadius: 35, borderWidth: 3, borderColor: '#fff', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  siteText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  nameSection: { marginBottom: 20 },
  lastName: { color: '#fff', fontSize: 24, fontWeight: 'bold', lineHeight: 24 },
  firstName: { color: '#fff', fontSize: 22, fontWeight: '400' },
  bodyRow: { flex: 1, flexDirection: 'row' },
  barcodeContainer: { width: 60, marginRight: 15, justifyContent: 'center', alignItems: 'center', backgroundColor: '#c0392b', paddingVertical: 10, gap: 2 },
  barcodeLine: { width: '80%', backgroundColor: '#ffffffff', marginVertical: 1 },
  infoColumn: { flex: 1, justifyContent: 'space-between', paddingBottom: 10 },
  classRow: { flexDirection: 'row', justifyContent: 'flex-start' },
  label: { color: '#aaa', fontSize: 10, textTransform: 'uppercase' },
  valueHuge: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  roleText: { color: '#fff', fontSize: 24, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginVertical: 10 },
  chipRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  chip: { width: 45, height: 35, backgroundColor: '#d4af37', borderRadius: 6, marginRight: 15, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#b8860b' },
  chipLine: { position: 'absolute', width: '60%', height: 1, backgroundColor: '#b8860b' },
  dateContainer: { justifyContent: 'center' },
  dateValue: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  footerText: { textAlign: 'center', color: '#fff', fontSize: 12, textTransform: 'uppercase', letterSpacing: 3, fontFamily: 'monospace', marginTop: 10 },
  
  sheen: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(168, 19, 19, 0.85)', zIndex: 10, pointerEvents: 'none' },
  
  modalContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.8)' },
  modalContent: { backgroundColor: '#1a1a1a', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, height: '75%', borderTopWidth: 1, borderColor: '#fbd501' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#333', paddingBottom: 10 },
  modalTitle: { color: '#fbd501', fontSize: 18, fontWeight: 'bold', letterSpacing: 1 },
  formScroll: { flex: 1 },
  rowInputs: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between'
  },
  halfInput: {
    flex: 1
  },
  inputLabel: { color: '#888', fontSize: 12, marginTop: 15, marginBottom: 5, fontWeight: 'bold' },
  input: { backgroundColor: '#000', borderWidth: 1, borderColor: '#333', color: '#fff', padding: 12, borderRadius: 8, fontSize: 16 },
  photoPickerButton: { 
    backgroundColor: '#000', 
    borderWidth: 2, 
    borderColor: '#fbd501', 
    borderStyle: 'dashed',
    borderRadius: 8, 
    height: 200, 
    justifyContent: 'center', 
    alignItems: 'center',
    overflow: 'hidden',
    marginTop: 5
  },
  photoPreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoOverlayText: {
    color: '#fbd501',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8
  },
  saveButton: { backgroundColor: '#fbd501', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 20, marginBottom: 20 },
  saveButtonText: { color: '#000', fontWeight: 'bold', fontSize: 16 },


  dropdownButton: {
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#333',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  dropdownList: {
    marginTop: 5,
    backgroundColor: '#0a0a0a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    overflow: 'hidden',
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownItemText: {
    color: '#ccc',
    fontSize: 14,
    marginLeft: 10,
  },
  radioButton: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#555',
  },
  radioButtonSelected: {
    borderColor: '#fbd501',
    backgroundColor: '#fbd501',
  },
});