
export const estimateSizeInBytes = (resolution = "720p", durationMinutes = 45) => {
  const bitrateMap = {
    "1080p": 3500 * 1024, // ~3.5 Mbps
    "720p": 1800 * 1024,  // ~1.8 Mbps
    "480p": 800 * 1024,   // ~800 Kbps
    "360p": 450 * 1024,   // ~450 Kbps
  };
  const bps = bitrateMap[resolution] || bitrateMap["720p"];
  return Math.round((bps / 8) * (durationMinutes * 60));
};

export const formatBytes = (bytes, decimals = 1) => {
  if (!bytes || bytes === 0) return "0 MB";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

import AsyncStorage from '@react-native-async-storage/async-storage';

const DOWNLOADS_KEY = '@streamhub_offline_downloads';

export const getDownloads = async () => {
  try {
    const raw = await AsyncStorage.getItem(DOWNLOADS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const saveDownloadRecord = async (item) => {
  try {
    const current = await getDownloads();
    // Use folderKey based on title slug to group same series or movie folders
    const folderKey = (item.title || 'Untitled').trim().toLowerCase().replace(/[^a-z0-9]/gi, '_');

    if (!current[folderKey]) {
      current[folderKey] = {
        folderKey,
        title: item.title,
        mediaType: item.mediaType || 'movie',
        posterPath: item.posterPath,
        mediaId: item.mediaId,
        files: [],
      };
    }

    // Filter out if duplicate file entry exists
    current[folderKey].files = current[folderKey].files.filter((f) => f.id !== item.id);
    current[folderKey].files.push({
      ...item,
      downloadedAt: new Date().toISOString(),
    });

    await AsyncStorage.setItem(DOWNLOADS_KEY, JSON.stringify(current));
    return current;
  } catch (err) {
    console.error('Error saving download record:', err);
    return null;
  }
};

export const removeDownloadRecord = async (folderKey, fileId = null) => {
  try {
    const current = await getDownloads();
    if (!current[folderKey]) return current;

    if (!fileId) {
      // Delete whole folder
      delete current[folderKey];
    } else {
      // Delete single episode/file from folder
      current[folderKey].files = current[folderKey].files.filter((f) => f.id !== fileId);
      if (current[folderKey].files.length === 0) {
        delete current[folderKey];
      }
    }

    await AsyncStorage.setItem(DOWNLOADS_KEY, JSON.stringify(current));
    return current;
  } catch (err) {
    console.error('Error deleting download record:', err);
    return null;
  }
};
