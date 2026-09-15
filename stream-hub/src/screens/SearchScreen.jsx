cat << 'EOF' > src/screens/SearchScreen.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { searchMulti, fetchTrending, IMAGE_BASE_URL } from '../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLUMN_WIDTH = (SCREEN_WIDTH - 52) / 2;

const FILTER_TABS = ['All', 'Movies', 'TV Shows', 'Anime'];

export default function SearchScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceTimer = useRef(null);

  // Load trending as initial suggested content
  useEffect(() => {
    loadSuggested();
  }, []);

  const loadSuggested = async () => {
    try {
      setLoading(true);
      const data = await fetchTrending();
      setResults(data || []);
    } catch (e) {
      console.warn('Suggested load error:', e);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search lookup
  const handleQueryChange = (text) => {
    setQuery(text);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (!text.trim()) {
      loadSuggested();
      return;
    }

    debounceTimer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const searchData = await searchMulti(text);
        setResults(searchData);
      } catch (err) {
        console.warn('Search lookup failed:', err);
      } finally {
        setLoading(false);
      }
    }, 400);
  };

  // Filter based on active tab
  const filteredResults = results.filter((item) => {
    if (activeTab === 'Movies') return item.media_type === 'movie' || !item.media_type;
    if (activeTab === 'TV Shows') return item.media_type === 'tv';
    if (activeTab === 'Anime') {
      const title = (item.title || item.name || '').toLowerCase();
      return item.genre_ids?.includes(16) || title.includes('anime');
    }
    return true;
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Subtle Crimson Glow */}
      <LinearGradient
        colors={['#2A0912', '#140E14', '#0A0A0E']}
        locations={[0, 0.35, 0.7]}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={{ flex: 1 }}>
        {/* Search Bar Header */}
        <View style={styles.searchHeader}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#8E8E9A" />
            <TextInput
              value={query}
              onChangeText={handleQueryChange}
              placeholder="Search movies, TV shows, anime..."
              placeholderTextColor="#6F6F7B"
              style={styles.input}
              returnKeyType="search"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => handleQueryChange('')}>
                <Ionicons name="close-circle" size={18} color="#8E8E9A" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterRow}>
          {FILTER_TABS.map((tab) => {
            const isSelected = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[styles.filterChip, isSelected && styles.filterChipActive]}
              >
                <Text style={[styles.filterText, isSelected && styles.filterTextActive]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Content Heading */}
        <View style={styles.resultsMeta}>
          <Text style={styles.resultsTitle}>
            {query.trim() ? `Results for "${query}"` : '🔥 Popular Searches'}
          </Text>
          <Text style={styles.resultsCount}>
            {filteredResults.length} titles
          </Text>
        </View>

        {/* Results 2-Column Grid */}
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#FF334B" />
          </View>
        ) : (
          <FlatList
            data={filteredResults}
            keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.gridContainer}
            columnWrapperStyle={styles.columnWrapper}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="film-outline" size={48} color="#2F2F3D" />
                <Text style={styles.emptyText}>No titles found</Text>
                <Text style={styles.emptySubtext}>Try searching with another title or keyword</Text>
              </View>
            }
            renderItem={({ item }) => {
              const poster = item.poster_path
                ? `${IMAGE_BASE_URL}${item.poster_path}`
                : 'https://via.placeholder.com/300x450';

              const releaseYear =
                item.release_date?.split('-')[0] || item.first_air_date?.split('-')[0] || '2026';

              return (
                <TouchableOpacity
                  style={styles.gridCard}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate('DetailsScreen', { media: item })}
                >
                  <View style={styles.posterWrapper}>
                    <Image source={{ uri: poster }} style={styles.gridPoster} />
                    <LinearGradient
                      colors={['transparent', 'rgba(10,10,14,0.7)']}
                      style={StyleSheet.absoluteFillObject}
                    />
                    {item.vote_average ? (
                      <View style={styles.ratingBadge}>
                        <Ionicons name="star" size={11} color="#FFB800" />
                        <Text style={styles.ratingText}>{item.vote_average.toFixed(1)}</Text>
                      </View>
                    ) : null}
                  </View>

                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {item.title || item.name}
                  </Text>
                  <Text style={styles.cardSubtext}>
                    {releaseYear} • {item.media_type === 'tv' ? 'TV' : 'Movie'}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0E' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  searchHeader: {
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161620',
    borderRadius: 24,
    height: 48,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#242432',
  },
  input: {
    flex: 1,
    color: '#FFF',
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '500',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 14,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: '#171720',
    borderWidth: 1,
    borderColor: '#22222E',
  },
  filterChipActive: {
    backgroundColor: '#FF334B',
    borderColor: '#FF334B',
  },
  filterText: {
    color: '#8D8D99',
    fontSize: 12,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  resultsMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  resultsTitle: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  resultsCount: {
    color: '#7E7E8A',
    fontSize: 12,
  },
  gridContainer: {
    paddingHorizontal: 20,
    paddingBottom: 110,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  gridCard: {
    width: COLUMN_WIDTH,
    marginBottom: 16,
  },
  posterWrapper: {
    width: '100%',
    height: COLUMN_WIDTH * 1.45,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#161620',
  },
  gridPoster: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  ratingText: {
    color: '#FFB800',
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 3,
  },
  cardTitle: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 6,
  },
  cardSubtext: {
    color: '#7E7E8A',
    fontSize: 11,
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
  },
  emptyText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
  },
  emptySubtext: {
    color: '#7E7E8A',
    fontSize: 12,
    marginTop: 4,
  },
});
EOF
