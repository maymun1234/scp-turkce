import Feather from '@expo/vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Network from 'expo-network';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

type CommentsProps = {
  scpCode: string;
};

type CommentData = {
  id: number;
  username: string;
  comment_text: string;
  created_at: string;
};

export default function Comments({ scpCode }: CommentsProps) {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [showCommentSection, setShowCommentSection] = useState(true);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [sending, setSending] = useState(false);

  const fetchComments = async () => {
    setLoading(true); // Yenilemeye basınca loading dönsün
    try {
      const url = `http://bercan.blog/pages/scp/commentcontroller.php?action=get_comments&scp_code=${scpCode}`;
      const response = await fetch(url);
      const json = await response.json();
      if (json.status === 'success') {
        setComments(json.data);
      }
    } catch (error) {
      console.error("Yorum çekme hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendComment = async () => {
    if (!newComment.trim()) {
      Alert.alert("Hata", "Lütfen boş yorum göndermeyin.");
      return;
    }
    if (!deviceId) {
      Alert.alert("Hata", "Cihaz kimliği oluşturulamadı.");
      return;
    }

    setSending(true);
    try {
      const encodedText = encodeURIComponent(newComment);
      const encodedUser = encodeURIComponent(deviceId);
      const url = `http://bercan.blog/pages/scp/commentcontroller.php?action=add_comment&scp_code=${scpCode}&username=${encodedUser}&text=${encodedText}`;

      const response = await fetch(url);
      const json = await response.json();

      if (json.status === 'success') {
        Alert.alert("Başarılı", "Yorumunuz gönderildi ve onay sırasına alındı.");
        setNewComment("");
        fetchComments();
      } else {
        Alert.alert("Hata", json.message || "Yorum gönderilemedi.");
      }

    } catch (error) {
      Alert.alert("Hata", "Bağlantı hatası oluştu.");
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
          console.error("Başlatma hatası", e);
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
    <View style={styles.contentCard}>
      <View style={styles.commentHeader}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.username}</Text>
        </View>
        <Text style={styles.dateText}>{item.created_at}</Text>
      </View>
      <Text style={styles.text}>{item.comment_text}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 80}
    >
      {/* 👇 GÜNCELLENEN BAŞLIK ALANI (RecommendSection ile Aynı Stil) */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {/* İkon: Mesaj balonu */}
          <Feather name="message-square" size={18} color="#c0392b" />
          <Text style={styles.headerTitle}>YORUMLAR ({comments.length})</Text>
        </View>
        
        {/* Manuel Yenileme Butonu */}
       
      </View>

      {/* Liste Alanı */}
      <View style={{ flex: 1 }}>
        {loading ? (
          <ActivityIndicator size="large" color="#c0392b" style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={comments}
            renderItem={renderComment}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={<Text style={styles.errorText}>Kayıt bulunamadı. İlk raporu sen oluştur.</Text>}
            contentContainerStyle={styles.listContent}
            inverted={false} 
          />
        )}
      </View>

      {/* Input Alanı (Sticky Footer) */}
      <View style={styles.inputCard}>
        <View style={styles.commentHeader}>
             
          
        </View>
        
        <View style={styles.inputRow}>
            <TextInput
            style={styles.input}
            placeholder="Gözlem raporunuzu buraya girin..."
            placeholderTextColor="#666"
            value={newComment}
            onChangeText={setNewComment}
            multiline
            />
            <TouchableOpacity
            style={[styles.sendButton, sending && { opacity: 0.5 }]}
            onPress={handleSendComment}
            disabled={sending}
            >
            {sending ? (
                <ActivityIndicator color="#fff" size="small" />
            ) : (
                <Feather name="arrow-up" size={24} color="#fff" />
            )}
            </TouchableOpacity>
        </View>
      </View>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505', // Tam siyah yerine çok çok koyu gri, gözü daha az yorar
  },
  listContent: {
   
    paddingTop: 10,
    paddingBottom: 20,
  },

  // --- HEADER KISMI (Aynı kalabilir, güzel duruyor) ---
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    backgroundColor: '#0a0a0a', 
    marginBottom: 0, // Header ile liste birleşsin
  },
  headerTitle: {
    color: '#ccc',
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  refreshButton: {
    padding: 6,
  },

  // --- SADELEŞTİRİLMİŞ YORUM (LOG) SATIRI ---
  contentCard: {
    backgroundColor: 'transparent', // Arka plan kutusunu kaldırdık
    borderLeftWidth: 0,             // Kalın sol çizgiyi kaldırdık
    borderWidth: 0,                 // Çerçeveyi kaldırdık
    borderBottomWidth: 1,           // Sadece alt çizgi
    borderBottomColor: '#222',      // Çok silik bir ayırıcı
    paddingVertical: 16,            // Dikey boşluğu artırdık, ferah olsun
    paddingHorizontal: 4,
    marginBottom: 0,                // Bloklar arası boşluğa gerek yok, çizgi ayırıyor
    borderRadius: 0,
  },
  
  // İsim ve Tarih Satırı
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    borderBottomWidth: 0, // Ara çizgiyi kaldırdık
    paddingBottom: 0,
  },

  // Kullanıcı Adı (Artık kutu değil, sadece metin)
  badge: {
    backgroundColor: 'transparent', // Kutu rengi gitti
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  badgeText: {
    color: '#c0392b', // SCP Kırmızısı veya #f1c40f (Sarı) yapabilirsin
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 0.5,
  },
  
  dateText: {
    color: '#555',
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },

  // Yorum Metni
  text: {
    color: '#e0e0e0', // Daha parlak beyaz
    fontSize: 15,
    lineHeight: 22, // Satır arası boşluk okumayı kolaylaştırır
    fontFamily: 'Inter',
    opacity: 0.9,
  },

  // --- INPUT ALANI (Hala ayrışması gerekiyor) ---
  inputCard: {
   
    paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 34 : 10, // iOS Home bar için boşluk
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center', // Buton ve inputu ortalar
    gap: 8,
  },
  input: {
    flex: 1,
    color: '#e0e0e0',
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    backgroundColor: '#161616', // Çok hafif bir gri ton, border yerine bunu kullandık
    paddingHorizontal: 16,      // Yazı kenarlara yapışmasın
    paddingTop: 12,             // Multiline için dikey ortalama ayarı
    paddingBottom: 12,
    minHeight: 46,              // Dokunmatik alanı genişlettik
    maxHeight: 100,
    borderRadius: 12,           // Tam yuvarlak (Pill shape)
    // Borderları kaldırdık
  },
  sendButton: {
    height: 46,     // Input ile aynı yükseklik
    width: 46,      // Tam kare -> yuvarlak olacak
    backgroundColor: '#c0392b', // SCP kırmızısı
    borderRadius: 23, // Tam yuvarlak (Height / 2)
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 40,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});