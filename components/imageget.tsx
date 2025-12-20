import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { useTheme } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Network from 'expo-network';

interface ImageCaptionProps {
  imageUrl: string;
  caption?: string;
}

const ImageCaption: React.FC<ImageCaptionProps> = ({ imageUrl, caption }) => {
  const { colors } = useTheme();
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [imageHeight, setImageHeight] = useState(250);
  const [autoDownloadImages, setAutoDownloadImages] = useState(false);
  const [isConnected, setIsConnected] = useState(true);

  // Ayarları yükle
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [autoDownload, networkState] = await Promise.all([
          AsyncStorage.getItem('@autoDownloadImages'),
          Network.getNetworkStateAsync()
        ]);
        
        if (autoDownload !== null) {
          setAutoDownloadImages(autoDownload === 'true');
        }

        setIsConnected(networkState.isConnected ?? true);
      } catch (e) {
        return null;
      }
    };
    loadSettings();
  }, []);

  // Eğer internet yoksa veya geçersiz URL ise null döndür
  // autoDownloadImages kapalıysa da resim gösterme
  if (!autoDownloadImages || !isConnected || !imageUrl || !imageUrl.startsWith('https://')) {
    return null;
  }

  const handleImageLoad = (event: any) => {
    const { width, height } = event.nativeEvent.source;
    if (width && height) {
      const screenWidth = 400;
      const aspectRatio = height / width;
      const calculatedHeight = screenWidth * aspectRatio;
      setImageHeight(Math.min(calculatedHeight, 500));
    }
    setImageLoading(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.imageContainer}>
        {imageLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#c0392b" />
          </View>
        )}
        
        {imageError ? (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: colors.text }]}>
              🖼️ Resim yüklenemedi
            </Text>
          </View>
        ) : (
          <Image
            source={{ uri: imageUrl }}
            style={[styles.image, { height: imageHeight }]}
            resizeMode="cover"
            onLoadStart={() => setImageLoading(true)}
            onLoad={handleImageLoad}
            onError={() => {
              setImageLoading(false);
              setImageError(true);
            }}
          />
        )}
      </View>

      {caption && (
        <Pressable 
          onPress={() => setIsExpanded(!isExpanded)}
          style={styles.captionContainer}
        >
          <Text 
            style={[
              styles.caption, 
              { color: colors.text },
              !isExpanded && styles.captionCollapsed
            ]}
            numberOfLines={isExpanded ? undefined : 2}
          >
            {caption}
          </Text>
          {caption.length > 80 && (
            <Text style={[styles.expandText, { color: '#c0392b' }]}>
              {isExpanded ? 'Daha az göster' : 'Daha fazla göster'}
            </Text>
          )}
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 0,
  },
  imageContainer: {
    width: '100%',
    backgroundColor: '#1c1c1e',
  },
  image: {
    width: '100%',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1c1c1e',
  },
  errorContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2c2c2e',
  },
  errorText: {
    fontSize: 14,
    opacity: 0.6,
  },
  captionContainer: {
    paddingTop: 8,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.7,
    fontStyle: 'italic',
  },
  captionCollapsed: {
    // numberOfLines prop ile zaten kontrol ediliyor
  },
  expandText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
});

export default ImageCaption;