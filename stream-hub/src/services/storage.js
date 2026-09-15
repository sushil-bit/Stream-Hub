// services/storage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const CONTINUE_WATCHING_KEY = '@streamhub_continue_watching';
const MAX_HISTORY_ITEMS = 20;

export const getContinueWatching = async () => {
  try {
      const data = await AsyncStorage.getItem(CONTINUE_WATCHING_KEY);
          return data ? JSON.parse(data) : [];
            } catch (error) {
                console.error('Failed to load continue watching:', error);
                    return [];
                      }
                      };

                      /**
                       * Upserts a media item to the top of the history list.
                        * @param {Object} item - { id, type ('movie'|'tv'|'anime'), title, posterPath, season, episode, lastWatched }
                         */
                         export const saveWatchProgress = async (item) => {
                           try {
                               const existing = await getContinueWatching();

                                   // Deduplicate by item ID and media type
                                       const filtered = existing.filter(
                                             (entry) => !(entry.id === item.id && entry.type === item.type)
                                                 );

                                                     const updatedItem = {
                                                           ...item,
                                                                 lastWatched: Date.now(),
                                                                       season: item.season || 1,
                                                                             episode: item.episode || 1,
                                                                                 };

                                                                                     const newHistory = [updatedItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);
                                                                                         await AsyncStorage.setItem(CONTINUE_WATCHING_KEY, JSON.stringify(newHistory));
                                                                                             return newHistory;
                                                                                               } catch (error) {
                                                                                                   console.error('Failed to save watch progress:', error);
                                                                                                     }
                                                                                                     };

                                                                                                     export const removeFromContinueWatching = async (id, type) => {
                                                                                                       try {
                                                                                                           const existing = await getContinueWatching();
                                                                                                               const filtered = existing.filter(
                                                                                                                     (entry) => !(entry.id === id && entry.type === type)
                                                                                                                         );
                                                                                                                             await AsyncStorage.setItem(CONTINUE_WATCHING_KEY, JSON.stringify(filtered));
                                                                                                                                 return filtered;
                                                                                                                                   } catch (error) {
                                                                                                                                       console.error('Failed to remove history item:', error);
                                                                                                                                         }
                                                                                                                                         };
                                                                                                                                         
const WATCHLIST_KEY = "@stream_hub_watchlist";

export const getWatchlist = async () => {
  try {
    const raw = await AsyncStorage.getItem(WATCHLIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to load watchlist:", e);
    return [];
  }
};

export const toggleWatchlist = async (media) => {
  try {
    const list = await getWatchlist();
    const id = media.id || media.mal_id;
    const exists = list.some((item) => (item.id || item.mal_id) === id);

    let updated;
    if (exists) {
      updated = list.filter((item) => (item.id || item.mal_id) !== id);
    } else {
      updated = [media, ...list];
    }

    await AsyncStorage.setItem(WATCHLIST_KEY, JSON.stringify(updated));
    return !exists;
  } catch (e) {
    console.error("Failed to toggle watchlist:", e);
    return false;
  }
};

export const removeContinueWatching = async (id) => {
  try {
    const list = await getContinueWatching();
    const updated = list.filter((item) => (item.id || item.mal_id) !== id);
    await AsyncStorage.setItem("streamhub_continue_watching", JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error("Error removing item from continue watching:", e);
    return [];
  }
};

export const clearContinueWatching = async () => {
  try {
    await AsyncStorage.removeItem("streamhub_continue_watching");
    return [];
  } catch (e) {
    console.error("Error clearing continue watching:", e);
    return [];
  }
};
