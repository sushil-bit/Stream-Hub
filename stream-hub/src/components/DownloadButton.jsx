import React, { useState } from 'react';
import { TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { saveDownloadRecord, removeDownloadRecord } from '../services/downloadManager';

export default function DownloadButton({ 
  itemKey, 
  title, 
  mediaType = 'movie', 
  season = null, 
  episode = null, 
  isDownloaded = false,
  onStatusChange,
  size = 20,
  style
}) {
  const [downloading, setDownloading] = useState(false);

  const handleToggle = async () => {
    if (downloading) return;

    if (isDownloaded) {
      Alert.alert(
        'Delete Download',
        `Remove "${title}" from offline downloads?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              await removeDownloadRecord(itemKey);
              if (onStatusChange) onStatusChange(itemKey, false);
            },
          },
        ]
      );
      return;
    }

    setDownloading(true);
    setTimeout(async () => {
      await saveDownloadRecord(itemKey, {
        title,
        mediaType,
        season,
        episode,
        size: '420 MB',
        savedAt: new Date().toISOString(),
      });
      setDownloading(false);
      if (onStatusChange) onStatusChange(itemKey, true);
    }, 1500);
  };

  return (
    <TouchableOpacity
      style={[styles.btn, style]}
      onPress={handleToggle}
      activeOpacity={0.7}
    >
      {downloading ? (
        <ActivityIndicator size="small" color="#E50914" />
      ) : isDownloaded ? (
        <Ionicons name="checkmark-circle" size={size} color="#46D369" />
      ) : (
        <Ionicons name="download-outline" size={size} color="#8A8A9E" />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
