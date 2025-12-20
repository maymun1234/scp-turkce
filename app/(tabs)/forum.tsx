import Feather from '@expo/vector-icons/Feather';
import React from 'react';
import { FlatList, Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
// SafeAreaView yerine normal View yeterli çünkü Stack Header var
import { Stack } from 'expo-router';

// --- TEMA RENKLERİ ---
const THEME = {
  bg: '#0f0f0f',
  cardBg: '#141414',
  border: '#333333',
  text: '#e5e5e5',
  textMuted: '#737373',
  accent: '#e5e5e5',
  red: '#dc2626',
  green: '#22c55e',
  yellow: '#fbbf24',
  blue: '#3b82f6',
};

// --- TİP TANIMLARI ---
type Thread = {
  id: string;
  title: string;
  author: string;
  clearance: number;
  department: string;
  timestamp: string;
  replies: number;
  views: number;
  isPinned?: boolean;
  isLocked?: boolean;
  tag: 'BREACH' | 'THEORY' | 'PROTOCOLS' | 'OFF-TOPIC';
};

// --- MOCK VERİ ---
const THREADS: Thread[] = [
  {
    id: '1',
    title: 'ACİL DURUM: Sektör-4\'te Keter Sınıfı İhlal',
    author: 'Dr. Clef',
    clearance: 4,
    department: 'Mobile Task Force',
    timestamp: '2 DK ÖNCE',
    replies: 42,
    views: 1205,
    isPinned: true,
    tag: 'BREACH',
  },
  {
    id: '2',
    title: 'SCP-173 Temizlik Prosedürlerinde Revizyon Önerisi',
    author: 'Researcher James',
    clearance: 2,
    department: 'Containment',
    timestamp: '1 SAAT ÖNCE',
    replies: 15,
    views: 340,
    tag: 'PROTOCOLS',
  },
  {
    id: '3',
    title: 'Kantin otomatından çıkan kahvenin tadı hakkında (SCP-294 mü kullanılıyor?)',
    author: 'Agent Smith',
    clearance: 1,
    department: 'Security',
    timestamp: '3 SAAT ÖNCE',
    replies: 8,
    views: 112,
    tag: 'OFF-TOPIC',
  },
  {
    id: '4',
    title: '[GİZLİ] O5 Konseyi Toplantı Notları - Sadece Gözler',
    author: 'O5-1',
    clearance: 5,
    department: 'Administration',
    timestamp: 'DÜN',
    replies: 0,
    views: 4,
    isLocked: true,
    tag: 'THEORY',
  },
];

// --- BİLEŞENLER ---

const UserBadge = ({ level }: { level: number }) => {
  const getColor = () => {
    if (level >= 5) return THEME.red;
    if (level >= 4) return THEME.yellow;
    if (level >= 3) return THEME.blue;
    return THEME.green;
  };

  return (
    <View style={[styles.badgeContainer, { borderColor: getColor() }]}>
      <Text style={[styles.badgeText, { color: getColor() }]}>LVL {level}</Text>
    </View>
  );
};

const TagChip = ({ tag }: { tag: string }) => {
  let bg = '#262626';
  let text = '#a3a3a3';

  if (tag === 'BREACH') { bg = '#450a0a'; text = '#fca5a5'; }
  if (tag === 'THEORY') { bg = '#172554'; text = '#93c5fd'; }

  return (
    <View style={[styles.tagContainer, { backgroundColor: bg }]}>
      <Text style={[styles.tagText, { color: text }]}>#{tag}</Text>
    </View>
  );
};

const ThreadCard = ({ item }: { item: Thread }) => {
  return (
    <Pressable style={({ pressed }) => [
      styles.card,
      pressed && { backgroundColor: '#1a1a1a' }
    ]}>
      {/* Sol Çizgi Göstergesi */}
      <View style={[
        styles.statusStrip, 
        { backgroundColor: item.tag === 'BREACH' ? THEME.red : THEME.border }
      ]} />

      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <UserBadge level={item.clearance} />
            <Text style={styles.authorText}>
              {item.author.toUpperCase()} <Text style={styles.deptText}>//{item.department}</Text>
            </Text>
          </View>
          <Text style={styles.timeText}>{item.timestamp}</Text>
        </View>

        <View style={styles.titleRow}>
          {item.isPinned && <Feather name="anchor" size={14} color={THEME.yellow} style={{ marginRight: 6 }} />}
          {item.isLocked && <Feather name="lock" size={14} color={THEME.red} style={{ marginRight: 6 }} />}
          <Text style={styles.titleText} numberOfLines={2}>{item.title}</Text>
        </View>

        <View style={styles.cardFooter}>
          <TagChip tag={item.tag} />
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Feather name="message-square" size={12} color={THEME.textMuted} />
              <Text style={styles.statText}>{item.replies}</Text>
            </View>
            <View style={styles.statItem}>
              <Feather name="eye" size={12} color={THEME.textMuted} />
              <Text style={styles.statText}>{item.views}</Text>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

const TickerHeader = () => (
  <View style={styles.tickerContainer}>
    <Text style={styles.tickerText}>
      /// AĞ DURUMU: GÜVENLİ /// <Text style={{color: THEME.yellow}}>UYARI: SEKTÖR-4 KARANTİNA</Text> /// SON GİRİŞ: SITE-19
    </Text>
  </View>
);

// --- ANA EKRAN ---

export default function ScpForumScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f0f" />
      
      {/* ✅ NAVİGASYON HEADER AYARLARI BURADA */}
      <Stack.Screen
        options={{
          headerShown: true,
          title: '', // Varsayılan başlığı boşaltıyoruz, aşağıda özel başlık yapıyoruz
          headerStyle: { 
            backgroundColor: THEME.bg,
          },
          headerShadowVisible: false, // Header altındaki varsayılan gölgeyi kaldır
          // Özel Başlık Bileşeni (Solda)
          headerLeft: () => (
            <View style={{ marginLeft: 0 }}>
              <Text style={styles.headerTitle}>SCP_NET <Text style={{color: THEME.green, fontSize: 12}}>v9.1</Text></Text>
              <Text style={styles.headerSubtitle}>SECURE COMMUNICATION PROTOCOL</Text>
            </View>
          ),
          // Sağdaki İkonlar
          headerRight: () => (
            <View style={styles.headerIcons}>
              <Pressable style={styles.iconButton}>
                <Feather name="search" size={20} color={THEME.text} />
              </Pressable>
              <Pressable style={styles.iconButton}>
                <View style={styles.notificationDot} />
                <Feather name="bell" size={20} color={THEME.text} />
              </Pressable>
            </View>
          ),
        }}
      />

      {/* Ticker hemen header'ın altına gelir */}
      <TickerHeader />

      <FlatList
        data={THREADS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ThreadCard item={item} />}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>// AKTİF TARTIŞMALAR</Text>
                <Feather name="filter" size={14} color={THEME.textMuted} />
            </View>
        }
      />

      {/* FAB */}
      <Pressable style={styles.fab}>
        <Feather name="plus-square" size={20} color="#000" />
        <Text style={styles.fabText}>YENİ GİRİŞ</Text>
      </Pressable>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
  // Header Stilleri (Artık Stack.Screen içinde kullanılıyor)
  headerTitle: {
    fontFamily: 'Inter-Black',
    fontSize: 18,
    color: THEME.text,
    letterSpacing: -1,
  },
  headerSubtitle: {
    fontFamily: 'RobotoMono-Regular',
    fontSize: 9,
    color: THEME.textMuted,
    letterSpacing: 1,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 16,
    marginRight: 4
  },
  iconButton: {
    padding: 4,
  },
  notificationDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.red,
    zIndex: 1,
  },
  // Ticker
  tickerContainer: {
    backgroundColor: '#1a0505',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#450a0a',
    borderTopWidth: 1, // Header ile ayrım için
    borderTopColor: THEME.border
  },
  tickerText: {
    fontFamily: 'RobotoMono-Regular',
    fontSize: 10,
    color: THEME.red,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  // List Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
    marginTop: 10,
  },
  sectionTitle: {
    fontFamily: 'RobotoMono-Regular',
    color: THEME.textMuted,
    fontSize: 12,
  },
  // List
  listContent: {
    padding: 16,
    paddingBottom: 80, 
  },
  // Card
  card: {
    backgroundColor: THEME.cardBg,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: THEME.border,
    flexDirection: 'row',
    borderRadius: 0, 
  },
  statusStrip: {
    width: 4,
    height: '100%',
  },
  cardContent: {
    flex: 1,
    padding: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  authorText: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    color: THEME.text,
  },
  deptText: {
    fontFamily: 'RobotoMono-Regular',
    color: THEME.textMuted,
    fontSize: 10,
  },
  timeText: {
    fontFamily: 'RobotoMono-Regular',
    fontSize: 10,
    color: THEME.textMuted,
  },
  // Badge
  badgeContainer: {
    borderWidth: 1,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
  },
  badgeText: {
    fontSize: 9,
    fontFamily: 'Inter-Black',
    fontWeight: 'bold',
  },
  // Title
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: THEME.text,
    lineHeight: 22,
    flex: 1,
  },
  // Footer
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tagContainer: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 2,
  },
  tagText: {
    fontSize: 10,
    fontFamily: 'RobotoMono-Regular',
    fontWeight: '700',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontFamily: 'RobotoMono-Regular',
    fontSize: 11,
    color: THEME.textMuted,
  },
  // FAB
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: THEME.accent,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#fff',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 0, 
    elevation: 0,
    borderWidth: 1,
    borderColor: '#000',
  },
  fabText: {
    fontFamily: 'Inter-Black',
    color: '#000',
    fontSize: 14,
    letterSpacing: 1,
  }
});