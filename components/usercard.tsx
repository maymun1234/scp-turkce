import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React from 'react';
import { Pressable, StyleSheet, Text, View, } from 'react-native';

interface HeaderWidgetProps {
  readCount: number;
  totalCount?: number;
  onPress?: () => void; // 👈 Yeni özellik eklendi
}

export default function HeaderWidgetV2({ readCount, totalCount = 300, onPress }: HeaderWidgetProps) {
  
  // --- Rütbe ve Renk Mantığı (Aynı) ---
  let clearanceLevel = "D Sınıfı";
  let levelColor = "#7f8c8d"; 
  if (readCount > 10) { clearanceLevel = "Seviye 1"; levelColor = "#2ecc71"; }
  if (readCount > 30) { clearanceLevel = "Seviye 2"; levelColor = "#3498db"; }
  if (readCount > 100) { clearanceLevel = "Seviye 3"; levelColor = "#f1c40f"; }
  if (readCount > 200) { clearanceLevel = "Seviye 4"; levelColor = "#e67e22"; }
  if (readCount > 500) { clearanceLevel = "O5 Konseyi"; levelColor = "#e74c3c"; }

  // 1. İlerleme yüzdesini tekrar hesaplıyoruz
  const progressPercent = Math.min((readCount / totalCount) * 100, 100);

  return (
    <Pressable onPress={onPress}> 
        {/* Senin V2 Tasarım Kodların buraya gelecek */}
        {/* Örnek olarak V2 yapısı: */}
        <View style={[styles.pillContainer, { borderColor: levelColor }]}>
            <View style={[styles.progressFillLayer, { width: `${progressPercent}%`, backgroundColor: levelColor, opacity: 0.4 }]} />
            <View style={styles.contentLayer}>
          {/* İkon */}
          <MaterialCommunityIcons name="shield-account" size={18} color={levelColor} style={styles.iconStyle} />

          {/* Ayırıcı çizgi */}
          

          {/* Yazılar */}
          <View style={styles.textGroup}>
            <Text style={[styles.rankText, { color: levelColor }]}>{clearanceLevel}</Text>
            {/* Okunan sayı artık beyazımsı olsun ki renkli zeminde okunsun */}
            <Text style={styles.countText}>{readCount}/{totalCount}</Text>
          </View>
            </View>
        </View>
    </Pressable>
  );

}

const styles = StyleSheet.create({
  pillContainer: {
    // İçerik düzeni
    position: 'relative', // İçindeki absolute elemanlar buna göre konumlanır
    justifyContent: 'center',
    
    // Görünüm
    borderRadius: 20,
    borderWidth: 1.5,
    marginRight: 10,
    overflow: 'hidden', // KÖŞELERDEN TAŞMAYI ENGELLER
    backgroundColor: '#1c1c1e', // Dolmamış kısmın rengi (koyu gri/siyah)
    
    // Boyutlandırma (İçerik katmanındaki padding ile belirlenecek)
    minHeight: 32,
  },

  // Yeni Eklenen Stil: Arka plan dolgusu
  progressFillLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    // width: inline style olarak veriliyor
    // backgroundColor: inline style olarak veriliyor
    // opacity: inline style olarak veriliyor
    zIndex: 1, // En altta
  },

  // Yeni Eklenen Stil: İçerik tutucu
  contentLayer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    zIndex: 2, // Dolgunun üstünde
  },

  iconStyle: {
    marginRight: 6,
  },
  divider: {
    width: 1,
    height: 16, // Yüzde yerine sabit yükseklik daha stabil durur
    opacity: 0.5,
    marginRight: 6,
  },
  textGroup: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  rankText: {
    fontSize: 12,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)', // Renkli zemin üzerinde daha iyi okunması için hafif gölge
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  countText: {
    color: '#e1e1e6', // Rengi biraz açtım (açık gri/beyaz)
    fontSize: 11,
    fontVariant: ['tabular-nums'],
    opacity: 0.9,
  },
});