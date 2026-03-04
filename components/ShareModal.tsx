// components/ShareModal.tsx

import { Feather, MaterialIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  Text,
  ToastAndroid,
  View
} from 'react-native';

// --- YENİ IMPORT: Projenizin i18n yapısını dahil ediyoruz ---
import { t } from '../constants/i18n';

type ShareModalProps = {
  visible: boolean;
  onClose: () => void;
  scpData: {
    code: string;
    title: string;
    text: string;
    link?: string;
  };
};

export default function ShareModal({ visible, onClose, scpData }: ShareModalProps) {
  
  const [copiedType, setCopiedType] = useState<'link' | 'text' | null>(null);

  // Genel Bildirim Fonksiyonu
  const triggerFeedback = (type: 'link' | 'text', msg: string) => {
    // 1. Titreşim
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // 2. İkon değişimi
    setCopiedType(type);
    
    // 3. Toast Mesajı (Android)
    if (Platform.OS === 'android') {
      ToastAndroid.show(msg, ToastAndroid.SHORT);
    }

    // 4. İkonu eski haline getir
    setTimeout(() => {
      setCopiedType(null);
    }, 2000);
  };

  // 1. Native Paylaşım
  const handleShare = async () => {
    try {
      // Paylaşım metninde başlık ve kodu birleştiriyoruz
      const message = `${scpData.title} (${scpData.code})\n\n${scpData.text}\n\n${scpData.link || ''}`;
      await Share.share({
        message: message,
        title: scpData.title,
        url: scpData.link // iOS için
      });
    } catch (error) {
      console.log(error);
    }
    onClose(); 
  };

  // 2. Link Kopyala
  const handleCopyLink = async () => {
    if (scpData.link) {
      await Clipboard.setStringAsync(scpData.link);
      triggerFeedback('link', t('link_copied_msg')); // "Bağlantı kopyalandı"
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      if (Platform.OS === 'android') {
        ToastAndroid.show(t('no_link_msg'), ToastAndroid.SHORT); // "Link yok"
      }
    }
  };

  // 3. Metin Kopyala (Rapor Formatında)
  const handleCopyText = async () => {
    // Etiketleri seçilen dilden çekiyoruz
    const labelProject = t('label_project'); // "PROJE"
    const labelSource = t('label_source');   // "Kaynak"
    const labelNoLink = t('label_no_link');  // "Link yok"

    const fullText = `${labelProject}: ${scpData.title} [${scpData.code}]\n\n${scpData.text}\n\n${labelSource}: ${scpData.link || labelNoLink}`;
    
    await Clipboard.setStringAsync(fullText);
    triggerFeedback('text', t('text_copied_msg')); // "Tüm içerik kopyalandı"
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
          
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{t('share_modal_title')}</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <MaterialIcons name="close" size={24} color="#ccc" />
            </Pressable>
          </View>

          <View style={styles.optionsContainer}>
            
            {/* Paylaş Butonu */}
            <Pressable style={styles.optionButton} onPress={handleShare}>
              <View style={[styles.iconBox, { backgroundColor: '#c0392b' }]}>
                <Feather name="share-2" size={24} color="#fff" />
              </View>
              <Text style={styles.optionText}>{t('share_btn')}</Text>
            </Pressable>

            {/* Link Kopyala Butonu */}
            <Pressable 
              style={[styles.optionButton, !scpData.link && styles.disabledButton]} 
              onPress={handleCopyLink}
              disabled={!scpData.link}
            >
              <View style={[styles.iconBox, { backgroundColor: copiedType === 'link' ? '#27ae60' : '#2980b9' }]}>
                <Feather 
                  name={copiedType === 'link' ? "check" : "link"} 
                  size={24} 
                  color="#fff" 
                />
              </View>
              <Text style={styles.optionText}>
                {copiedType === 'link' ? t('copied_btn') : t('copy_link_btn')}
              </Text>
            </Pressable>

            {/* Metin Kopyala Butonu */}
            <Pressable style={styles.optionButton} onPress={handleCopyText}>
              <View style={[styles.iconBox, { backgroundColor: copiedType === 'text' ? '#27ae60' : '#8e44ad' }]}>
                <Feather 
                  name={copiedType === 'text' ? "check" : "file-text"} 
                  size={24} 
                  color="#fff" 
                />
              </View>
              <Text style={styles.optionText}>
                {copiedType === 'text' ? t('copied_btn') : t('copy_text_btn')}
              </Text>
            </Pressable>

          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#1e1e1e',
   borderRadius: 12,
   
    padding: 24,
    borderWidth: 1,
    borderColor: '#333',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    // fontFamily: 'Inter-Black',
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
  },
  optionButton: {
    alignItems: 'center',
    gap: 10,
    width: 80,
  },
  disabledButton: {
    opacity: 0.5,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  optionText: {
    color: '#ccc',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});