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

export const saveDownloadRecord = async (id, data) => {
  try {
    const current = await getDownloads();
    current[id] = { ...data, updatedAt: Date.now() };
    await AsyncStorage.setItem(DOWNLOADS_KEY, JSON.stringify(current));
    return current;
  } catch (err) {
    console.error('Error saving download record:', err);
    return null;
  }
};

export const removeDownloadRecord = async (id) => {
  try {
    const current = await getDownloads();
    delete current[id];
    await AsyncStorage.setItem(DOWNLOADS_KEY, JSON.stringify(current));
    return current;
  } catch (err) {
    console.error('Error removing download record:', err);
    return null;
  }
};
