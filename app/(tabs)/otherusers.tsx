import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { logSCPView } from '../../services/scplog';
// ✅ i18n Importu
import { t } from '../../constants/i18n';

interface ActivityItem {
  id: string;
  username: string;
  scp_code: string;
  comment_text?: string;
  created_at: string;
  action: 'commented' | 'liked';
}

type FilterType = 'all' | 'commented' | 'liked';

export default function OtherUsers() {
  const { colors } = useTheme();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');

  const COMMENTS_API = 'http://bercan.blog/pages/scp/commentcontroller.php?action=get_latest_activity';
  const LIKES_API = 'http://bercan.blog/pages/scp/scplogcontroller.php?action=get_latest_likes';

  const fetchAllActivity = async () => {
    try {
      const [commRes, likeRes] = await Promise.all([
        fetch(COMMENTS_API),
        fetch(LIKES_API)
      ]);

      const commJson = await commRes.json();
      const likeJson = await likeRes.json();

      let combinedData: ActivityItem[] = [];

      if (commJson.status === 'success') {
        const comments = commJson.data.map((i: any) => ({ ...i, action: 'commented' }));
        combinedData = [...combinedData, ...comments];
      }

      if (likeJson.status === 'success') {
        const likes = likeJson.data.map((i: any) => ({ ...i, action: 'liked' }));
        combinedData = [...combinedData, ...likes];
      }

      combinedData.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setActivities(combinedData);
    } catch (error) {
      console.error("Aktiviteler birleştirilemedi:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
     logSCPView("7000", "otherusers"); 
  };

  useEffect(() => {
    fetchAllActivity();
  }, []);

  const filteredActivities = useMemo(() => {
    if (filter === 'all') return activities;
    return activities.filter(item => item.action === filter);
  }, [activities, filter]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAllActivity();
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const ActivityCard = ({ item }: { item: ActivityItem }) => (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: '#222120' }]}
      onPress={() => {
        // ✅ Navigasyon Düzeltmesi
        router.push({
          pathname: "/[code]", 
          params: { 
            code: item.scp_code, 
            scp: item.scp_code, 
            from: "otherusers" // Burası "favorites" değil "otherusers" olmalı ki geri dönebilsin
          }
        });
      }}
    >
      <View style={styles.iconContainer}>
        {item.action === 'commented' ? (
          <MaterialIcons name="chat-bubble" size={32} color="#ffd60a" />
        ) : (
          <MaterialIcons name="favorite" size={32} color="#ff3b30" />
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={[styles.userName, { color: colors.text }]}>{item.username}</Text>
          <Text style={[styles.time, { color: colors.text, opacity: 0.5 }]}>{formatTime(item.created_at)}</Text>
        </View>

        <Text style={[styles.actionText, { color: colors.text, opacity: 0.8 }]}>
          {item.action === 'commented' ? t('left_comment') : t('liked_file')}
          <Text style={{ color: '#c0392b', fontWeight: '700' }}> {item.scp_code}</Text>
        </Text>

        {/* ✅ Güzelleştirilmiş Yorum Kutusu */}
        {item.action === 'commented' && item.comment_text && (
          <View style={styles.commentContainer}>
           
            <Text style={styles.commentText}>
              {item.comment_text}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const FilterButton = ({ type, label, icon }: { type: FilterType, label: string, icon: any }) => (
    <TouchableOpacity 
      onPress={() => setFilter(type)}
      style={[
        styles.filterButton, 
        { backgroundColor: filter === type ? '#c0392b' : '#222120' }
      ]}
    >
      <MaterialIcons name={icon} size={16} color={filter === type ? '#fff' : '#888'} />
      <Text style={[styles.filterButtonText, { color: filter === type ? '#fff' : '#888' }]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />
      <Stack.Screen
        options={{
          // ✅ Başlık yerelleştirildi
          title: t('latest_activities'),
          headerTitleStyle: { fontWeight: 'bold', fontSize: 20, color: '#fff' },
          headerStyle: { backgroundColor: "#222120" },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
              <Ionicons name="chevron-back" size={28} color="#fff" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={handleRefresh} style={{ padding: 8 }}>
               <Ionicons name="refresh" size={24} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.filterContainer}>
        {/* ✅ Filtre buton etiketleri yerelleştirildi */}
        <FilterButton type="all" label={t('filter_all')} icon="dashboard" />
        <FilterButton type="commented" label={t('filter_comments')} icon="chat-bubble" />
        <FilterButton type="liked" label={t('filter_likes')} icon="favorite" />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#c0392b" />
        </View>
      ) : (
        <FlatList
          data={filteredActivities}
          keyExtractor={(item, index) => item.id + index}
          renderItem={({ item }) => <ActivityCard item={item} />}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#c0392b" />
          }
          ListEmptyComponent={
            // ✅ Boş liste mesajı yerelleştirildi
            <Text style={styles.emptyText}>{t('no_activity_msg')}</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  filterContainer: { 
    flexDirection: 'row', 
    paddingHorizontal: 12, 
    paddingVertical: 10, 
    gap: 8,
    backgroundColor: '#161618' 
  },
  filterButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 20, 
    gap: 6,
    borderWidth: 1,
    borderColor: '#333'
  },
  filterButtonText: { fontSize: 13, fontWeight: '600' },
  list: { padding: 12 },
  card: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  
  // ✅ Yorum Kutusu Stilleri
  commentContainer: {
    marginTop: 10,
    backgroundColor: '#1a1a1c', // Koyu, ciddi arka plan
    borderRadius: 8,
    
  
    overflow: 'hidden',
  },
  commentHeader: {
    backgroundColor: 'rgba(255, 214, 10, 0.1)', // Başlık için çok hafif sarı ton
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 214, 10, 0.05)',
  },
  commentLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#ffd60a',
    letterSpacing: 1,
  },
  commentText: { 
    fontSize: 13, 
    fontStyle: 'italic', 
    color: "#ccc", // Beyaz yerine hafif gri, daha okunabilir
    lineHeight: 18, 
    padding: 10,
    opacity: 0.9 
  },
  iconContainer: {
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 40,
  },
  content: { flex: 1 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  userName: { fontSize: 16, fontWeight: 'bold' },
  time: { fontSize: 11 },
  actionText: { fontSize: 14, marginBottom: 2, lineHeight: 20 },
 
  emptyText: { textAlign: 'center', marginTop: 50, color: '#666', fontSize: 14 }
});