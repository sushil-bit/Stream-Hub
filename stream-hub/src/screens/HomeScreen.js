import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import UserProfileHeader from '../components/Header/UserProfileHeader';
import CategoryTabRow from '../components/Lists/CategoryTabRow';
import * as API from '../services/api';
import * as Storage from '../services/storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.62;
const SPACING = 14;
const SNAP_INTERVAL = CARD_WIDTH + SPACING;
const SIDE_SPACER = (SCREEN_WIDTH - CARD_WIDTH) / 2;
const IMAGE_URL = API.IMAGE_BASE_URL || 'https://image.tmdb.org/t/p/w500';

export default function HomeScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [trending, setTrending] = useState([]);
  const [animeList, setAnimeList] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Trending');
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    setLoading(true);

    // 1. Fetch Trending independently
    try {
      const fetchTrend = API.fetchTrending || API.fetchTrendingMovies || API.getTrending;
      if (typeof fetchTrend === 'function') {
        const trendData = await fetchTrend();
        if (Array.isArray(trendData) && trendData.length > 0) {
          setTrending(trendData.slice(0, 10));
        }
      }
    } catch (e) {
      console.warn('Trending error:', e);
    }

    // 2. Fetch Anime independently
    try {
      const fetchAnime = API.fetchTopAnime || API.fetchTopAiringAnime || API.fetchAnime;
      if (typeof fetchAnime === 'function') {
        const aData = await fetchAnime();
        if (Array.isArray(aData) && aData.length > 0) {
          setAnimeList(aData.slice(0, 10));
        }
      }
    } catch (e) {
      console.warn('Anime error:', e);
    }

    // 3. Fetch History
    try {
      const histFn = Storage.getWatchHistory || Storage.getHistory;
      if (typeof histFn === 'function') {
        const hData = await histFn();
        if (Array.isArray(hData)) setHistory(hData);
      }
    } catch (e) {
      console.warn('History error:', e);
    }

    setLoading(false);
  };

  const activeItem = trending[activeIndex];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <LinearGradient
        colors={['#3B0D18', '#140E14', '#0A0A0E']}
        locations={[0, 0.4, 0.8]}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 130 }}
        >
          {/* Header */}
          <UserProfileHeader
            onSearchPress={() => navigation.navigate('SearchScreen')}
            onNotificationPress={() => {}}
          />

          {/* Category Chips */}
          <CategoryTabRow
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />

          {/* Hero 3D Fan Carousel */}
          {loading && trending.length === 0 ? (
            <View style={{ height: 260, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="small" color="#FF334B" />
            </View>
          ) : trending.length > 0 ? (
            <View style={styles.carouselWrapper}>
              <Animated.FlatList
                data={trending}
                keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={SNAP_INTERVAL}
                snapToAlignment="start"
                decelerationRate="fast"
                bounces={false}
                initialNumToRender={3}
                maxToRenderPerBatch={3}
                windowSize={5}
                removeClippedSubviews={false}
                contentContainerStyle={{ paddingHorizontal: SIDE_SPACER }}
                onScroll={Animated.event(
                  [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                  { useNativeDriver: true }
                )}
                onMomentumScrollEnd={(e) => {
                  const idx = Math.round(e.nativeEvent.contentOffset.x / SNAP_INTERVAL);
                  setActiveIndex(Math.max(0, Math.min(idx, trending.length - 1)));
                }}
                renderItem={({ item, index }) => {
                  const inputRange = [
                    (index - 1) * SNAP_INTERVAL,
                    index * SNAP_INTERVAL,
                    (index + 1) * SNAP_INTERVAL,
                  ];

                  const scale = scrollX.interpolate({
                    inputRange,
                    outputRange: [0.86, 1, 0.86],
                    extrapolate: 'clamp',
                  });

                  const opacity = scrollX.interpolate({
                    inputRange,
                    outputRange: [0.55, 1, 0.55],
                    extrapolate: 'clamp',
                  });

                  const poster = item.poster_path
                    ? `${IMAGE_URL}${item.poster_path}`
                    : 'https://via.placeholder.com/300x450';

                  return (
                    <Animated.View
                      style={[
                        styles.heroCard,
                        {
                          transform: [{ scale }],
                          opacity,
                        },
                      ]}
                    >
                      <TouchableOpacity
                        activeOpacity={0.9}
                        style={{ width: '100%', height: '100%' }}
                        onPress={() => navigation.navigate('DetailsScreen', { media: item })}
                      >
                        <Image source={{ uri: poster }} style={styles.heroPoster} />
                        <LinearGradient
                          colors={['transparent', 'rgba(10,10,14,0.85)']}
                          style={StyleSheet.absoluteFillObject}
                        />
                        <TouchableOpacity
                          style={styles.playFab}
                          onPress={() => navigation.navigate('PlayerScreen', { media: item })}
                        >
                          <Ionicons name="play" size={20} color="#FFF" style={{ marginLeft: 2 }} />
                        </TouchableOpacity>
                      </TouchableOpacity>
                    </Animated.View>
                  );
                }}
              />

              {/* Active Movie Info */}
              {activeItem && (
                <View style={styles.activeMeta}>
                  <Text style={styles.metaYear}>
                    {activeItem.release_date?.split('-')[0] ||
                      activeItem.first_air_date?.split('-')[0] ||
                      '2026'}
                  </Text>
                  <Text style={styles.metaTitle} numberOfLines={1}>
                    {activeItem.title || activeItem.name}
                  </Text>
                  <View style={styles.badgeRow}>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>
                        {activeItem.media_type ? activeItem.media_type.toUpperCase() : 'MOVIE'}
                      </Text>
                    </View>
                    <View style={[styles.badge, styles.ratingBadge]}>
                      <Ionicons name="star" size={12} color="#FFB800" />
                      <Text style={[styles.badgeText, { color: '#FFB800', marginLeft: 4 }]}>
                        {activeItem.vote_average ? activeItem.vote_average.toFixed(1) : '7.8'}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Pagination Dots */}
              <View style={styles.dotRow}>
                {trending.slice(0, 5).map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.dot,
                      activeIndex === i ? styles.dotActive : styles.dotInactive,
                    ]}
                  />
                ))}
              </View>
            </View>
          ) : null}

          {/* Continue Watching */}
          {history.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  <Text style={{ color: '#FF334B' }}>▸▸ </Text>Continue Watching
                </Text>
                <TouchableOpacity>
                  <Text style={styles.seeAllText}>See all</Text>
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.shelfRow}>
                {history.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.historyCard}
                    onPress={() => navigation.navigate('PlayerScreen', { media: item })}
                  >
                    <Image
                      source={{ uri: `${IMAGE_URL}${item.backdrop_path || item.poster_path}` }}
                      style={styles.historyThumb}
                    />
                    <Text style={styles.historyTitle} numberOfLines={1}>
                      {item.title || item.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Top Airing Anime Shelf */}
          {animeList.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  <Ionicons name="sparkles" size={17} color="#FF334B" /> Top Airing Anime
                </Text>
                <TouchableOpacity>
                  <Text style={styles.seeAllText}>See all</Text>
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.shelfRow}>
                {animeList.map((anime, idx) => {
                  const poster =
                    anime.images?.jpg?.large_image_url ||
                    anime.images?.jpg?.image_url ||
                    (anime.poster_path ? `${IMAGE_URL}${anime.poster_path}` : '');

                  return (
                    <TouchableOpacity
                      key={anime.mal_id || anime.id || idx}
                      style={styles.posterCard}
                      onPress={() => navigation.navigate('DetailsScreen', { media: anime })}
                    >
                      <Image source={{ uri: poster }} style={styles.posterThumb} />
                      <Text style={styles.posterTitle} numberOfLines={1}>
                        {anime.title || anime.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Trending Movies Shelf */}
          {trending.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  <Ionicons name="flame" size={18} color="#FF334B" /> Trending Movies
                </Text>
                <TouchableOpacity>
                  <Text style={styles.seeAllText}>See all</Text>
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.shelfRow}>
                {trending.map((item, idx) => (
                  <TouchableOpacity
                    key={item.id || idx}
                    style={styles.posterCard}
                    onPress={() => navigation.navigate('DetailsScreen', { media: item })}
                  >
                    <Image
                      source={{ uri: `${IMAGE_URL}${item.poster_path}` }}
                      style={styles.posterThumb}
                    />
                    <Text style={styles.posterTitle} numberOfLines={1}>
                      {item.title || item.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0E' },
  carouselWrapper: { marginTop: 4, alignItems: 'center' },
  heroCard: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.38,
    borderRadius: 24,
    marginRight: SPACING,
    overflow: 'hidden',
    backgroundColor: '#161620',
  },
  heroPoster: { width: '100%', height: '100%', resizeMode: 'cover' },
  playFab: {
    position: 'absolute',
    bottom: 14,
    right: 14,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FF334B',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#FF334B',
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  activeMeta: { alignItems: 'center', marginTop: 14, paddingHorizontal: 20 },
  metaYear: { color: '#7E7E8A', fontSize: 12, letterSpacing: 1 },
  metaTitle: { color: '#FFF', fontSize: 20, fontWeight: '800', marginTop: 2, textAlign: 'center' },
  badgeRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  badge: {
    backgroundColor: '#171720',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#242432',
  },
  ratingBadge: { flexDirection: 'row', alignItems: 'center' },
  badgeText: { color: '#C0C0CB', fontSize: 11, fontWeight: '700' },
  dotRow: { flexDirection: 'row', marginTop: 14, gap: 6 },
  dot: { height: 5, borderRadius: 3 },
  dotActive: { width: 18, backgroundColor: '#FF334B' },
  dotInactive: { width: 6, backgroundColor: '#262632' },
  section: { marginTop: 26 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: { color: '#FFF', fontSize: 17, fontWeight: '700' },
  seeAllText: { color: '#FF334B', fontSize: 13, fontWeight: '600' },
  shelfRow: { paddingHorizontal: 20, gap: 14 },
  historyCard: { width: 148 },
  historyThumb: { width: 148, height: 92, borderRadius: 14, backgroundColor: '#1A1A24' },
  historyTitle: { color: '#FFF', fontSize: 12, fontWeight: '600', marginTop: 6 },
  posterCard: { width: 115 },
  posterThumb: { width: 115, height: 165, borderRadius: 14, backgroundColor: '#161620' },
  posterTitle: { color: '#C8C8D2', fontSize: 12, fontWeight: '600', marginTop: 6 },
});
