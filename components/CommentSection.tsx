import Feather from '@expo/vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Network from 'expo-network';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import { langCode, t } from '../constants/i18n';

type CommentsProps = {
  scpCode: string;
};

type CommentData = {
  id: number;
  username: string;
  comment_text: string;
  created_at: string;
  language?: string;
};

export default function Comments({ scpCode }: CommentsProps) {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [showCommentSection, setShowCommentSection] = useState(true);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Yorum yazma modalı için state
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [sending, setSending] = useState(false);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const url = `http://bercan.blog/pages/scp/commentcontroller.php?action=get_comments&scp_code=${scpCode}&language=${langCode}`;
      const response = await fetch(url);
      const json = await response.json();
      if (json.status === 'success') {
        setComments(json.data);
      }
    } catch (error) {
      console.error(t('fetch_error'), error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendComment = async () => {
    if (!newComment.trim()) {
      Alert.alert(t('error_title'), t('empty_comment_warning'));
      return;
    }
    if (!deviceId) {
      Alert.alert(t('error_title'), t('device_id_error'));
      return;
    }

    setSending(true);
    try {
      const encodedText = encodeURIComponent(newComment);
      const encodedUser = encodeURIComponent(deviceId);
      
      const url = `http://bercan.blog/pages/scp/commentcontroller.php?action=add_comment&scp_code=${scpCode}&username=${encodedUser}&text=${encodedText}&language=${langCode}`;

      const response = await fetch(url);
      const json = await response.json();

      if (json.status === 'success') {
        Alert.alert(t('success_title'), t('send_success'));
        setNewComment("");
        setIsModalVisible(false); // Başarılı olunca modalı kapat
        fetchComments();
      } else {
        Alert.alert(t('error_title'), json.message || t('send_fail'));
      }

    } catch (error) {
      Alert.alert(t('error_title'), t('connection_error'));
      console.error(error);
    } finally {
      setSending(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const initialize = async () => {
        try {
          const [storedId, showVal] = await Promise.all([
            AsyncStorage.getItem('@device_short_id'),
            AsyncStorage.getItem('@showCommentSection'),
            Network.getNetworkStateAsync()
          ]);

          if (isActive) {
            setDeviceId(storedId);
            if (showVal !== null) setShowCommentSection(showVal === 'true');
            else setShowCommentSection(true);
            setSettingsLoaded(true);
          }
        } catch (e) {
          console.error(t('init_error'), e);
        }
      };
      initialize();
      return () => { isActive = false; };
    }, [])
  );

  React.useEffect(() => {
    if (settingsLoaded && showCommentSection) {
      fetchComments();
    }
  }, [scpCode, settingsLoaded, showCommentSection]);

  if (!settingsLoaded) return null;
  if (!showCommentSection) return null;

  const renderComment = ({ item }: { item: CommentData }) => (
    <View style={styles.commentCard}>
      <View style={styles.commentHeader}>
        <Text style={styles.badgeText}>{item.username}</Text>
        <Text style={styles.dateText}>{item.created_at}</Text>
      </View>
      <Text style={styles.text}>{item.comment_text}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* BAŞLIK VE YORUM EKLE BUTONU */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Feather name="message-square" size={18} color="#c0392b" />
          <Text style={styles.headerTitle}>
            {t('comments_title')} ({comments.length})
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.addCommentButton}
          onPress={() => setIsModalVisible(true)}
        >
          <Feather name="plus" size={18} color="#fff" />
          <Text style={styles.addCommentText}>Yaz</Text>
        </TouchableOpacity>
      </View>

      {/* YORUMLAR LİSTESİ */}
      {loading ? (
        <ActivityIndicator size="large" color="#c0392b" style={{ marginVertical: 30 }} />
      ) : (
        <View style={{ paddingBottom: 20 }}>
          {comments.length === 0 ? (
             <Text style={styles.errorText}>{t('no_comments_msg')}</Text>
          ) : (
             comments.map((item) => <React.Fragment key={item.id.toString()}>{renderComment({item})}</React.Fragment>)
          )}
        </View>
      )}

      {/* YORUM YAZMA MODALI */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <KeyboardAvoidingView 
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Yorum Bırak</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)} style={styles.closeButton}>
                <Feather name="x" size={24} color="#ccc" />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.modalInput}
              placeholder={t('input_placeholder')}
              placeholderTextColor="#666"
              value={newComment}
              onChangeText={setNewComment}
              multiline
              autoFocus={true}
              textAlignVertical="top" // Android'de metnin üstten başlaması için
            />

            <TouchableOpacity 
              style={[styles.modalSendButton, sending && { opacity: 0.5 }]}
              onPress={handleSendComment}
              disabled={sending}
            >
              {sending ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Text style={styles.modalSendText}>{t('send')}</Text>
                  
                </>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#050505',
    marginTop: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#222',
    overflow: 'hidden', // İçeriğin köşelerden taşmaması için
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#0a0a0a', 
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  headerTitle: {
    color: '#ccc',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  addCommentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#c0392b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  addCommentText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  commentCard: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
    borderLeftWidth: 3,
    borderLeftColor: '#c0392b', // Her yoruma ince kırmızı bir çizgi
    marginHorizontal: 10,
    marginTop: 10,
    backgroundColor: '#0d0d0d',
    borderRadius: 4,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeText: {
    color: '#c0392b',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 0.5,
  },
  dateText: {
    color: '#666',
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  text: {
    color: '#d4d4d4',
    fontSize: 15,
    lineHeight: 22,
    fontFamily: 'Inter',
  },
  errorText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  
  // --- MODAL STİLLERİ ---
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Arka planı hafif karartır
  },
  modalContent: {
    backgroundColor: '#111',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    minHeight: '50%', // Ekranın yarısını kaplar
    borderTopWidth: 1,
    borderColor: '#333',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  closeButton: {
    padding: 4,
  },
  modalInput: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    color: '#e0e0e0',
    fontSize: 16,
    fontFamily: 'Inter',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 16,
  },
  modalSendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#c0392b',
    paddingVertical: 14,
    borderRadius: 28,
    gap: 8,
  },
  modalSendText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    
    textTransform: 'uppercase',
  }
});