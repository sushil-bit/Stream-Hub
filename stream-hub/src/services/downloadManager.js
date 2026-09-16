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
