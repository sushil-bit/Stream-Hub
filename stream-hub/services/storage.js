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
                                                                                                                                         