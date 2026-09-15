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
import { fetchTrending, IMAGE_BASE_URL } from '../services/api';
import { getWatchHistory } from '../services/storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.58;
const SPACING = 16;
const SIDE_SPACER = (SCREEN_WIDTH - CARD_WIDTH) / 2;

export default function HomeScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [trending, setTrending] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Trending');
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    try {
      setLoading(true);
      const movies = await fetchTrending();
      setTrending(movies.slice(0, 10));

      if (getWatchHistory) {
        const storedHistory = await getWatchHistory();
        setHistory(storedHistory || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const activeItem = trending[activeIndex];

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#FF334B" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Top Ambient Crimson Glow */}
      <LinearGradient
        colors={['#380A14', '#150E14', '#0A0A0E']}
        locations={[0, 0.4, 0.8]}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {/* Top User Profile Header */}
          <UserProfileHeader
            onSearchPress={() => navigation.navigate('SearchScreen')}
            onNotificationPress={() => {}}
          />

          {/* Category Filter Pills */}
          <CategoryTabRow
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />

          {/* 3D Fan Carousel Section */}
          <View style={styles.carouselContainer}>
            <Animated.FlatList
              data={trending}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={CARD_WIDTH + SPACING}
              decelerationRate="fast"
              bounces={false}
              contentContainerStyle={{ paddingHorizontal: SIDE_SPACER }}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                { useNativeDriver: true }
              )}
              onMomentumScrollEnd={(e) => {
                const idx = Math.round(e.nativeEvent.contentOffset.x / (CARD_WIDTH + SPACING));
                setActiveIndex(idx);
              }}
              renderItem={({ item, index }) => {
                const inputRange = [
                  (index - 1) * (CARD_WIDTH + SPACING),
                  index * (CARD_WIDTH + SPACING),
                  (index + 1) * (CARD_WIDTH + SPACING),
                ];

                const scale = scrollX.interpolate({
                  inputRange,
                  outputRange: [0.84, 1, 0.84],
                  extrapolate: 'clamp',
                });

                const rotateY = scrollX.interpolate({
                  inputRange,
                  outputRange: ['18deg', '0deg', '-18deg'],
                  extrapolate: 'clamp',
                });

                const opacity = scrollX.interpolate({
                  inputRange,
                  outputRange: [0.55, 1, 0.55],
                  extrapolate: 'clamp',
                });

                const posterUri = item.poster_path
                  ? `${IMAGE_BASE_URL}${item.poster_path}`
                  : 'https://via.placeholder.com/300x450';

                return (
                  <Animated.View
                    style={[
                      styles.heroCard,
                      {
                        transform: [{ perspective: 800 }, { scale }, { rotateY }],
                        opacity,
                      },
                    ]}
                  >
                    <TouchableOpacity
                      activeOpacity={0.9}
                      style={styles.cardTouch}
                      onPress={() => navigation.navigate('DetailsScreen', { media: item })}
                    >
                      <Image source={{ uri: posterUri }} style={styles.heroPoster} />
                      <LinearGradient
                        colors={['transparent', 'rgba(10,10,14,0.9)']}
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

            {/* Active Item Metadata & Badges */}
            {activeItem && (
              <View style={styles.activeMeta}>
                <Text style={styles.metaYear}>
                  {activeItem.release_date?.split('-')[0] || activeItem.first_air_date?.split('-')[0] || '2025'}
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
                      {activeItem.vote_average ? activeItem.vote_average.toFixed(1) : '7.9'}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Dynamic Pagination Dots */}
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

          {/* Continue Watching Section */}
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
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.shelfRow}
              >
                {history.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.historyCard}
                    onPress={() => navigation.navigate('PlayerScreen', { media: item })}
                  >
                    <Image
                      source={{ uri: `${IMAGE_BASE_URL}${item.backdrop_path || item.poster_path}` }}
                      style={styles.historyThumb}
                    />
                    <View style={styles.historyOverlay}>
                      <View style={styles.epTag}>
                        <Text style={styles.epTagText}>{item.lastEpisode || 'EP 1'}</Text>
                      </View>
                      <View style={styles.progressTrack}>
                        <View style={[styles.progressFill, { width: item.progress || '50%' }]} />
                      </View>
                    </View>
                    <Text style={styles.historyTitle} numberOfLines={1}>
                      {item.title || item.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Trending Movies Shelf */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                <Ionicons name="flame" size={18} color="#FF334B" /> Trending Now
              </Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See all</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.shelfRow}
            >
              {trending.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.posterCard}
                  onPress={() => navigation.navigate('DetailsScreen', { media: item })}
                >
                  <Image
                    source={{ uri: `${IMAGE_BASE_URL}${item.poster_path}` }}
                    style={styles.posterThumb}
                  />
                  <Text style={styles.posterTitle} numberOfLines={1}>
                    {item.title || item.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0E' },
  centered: { justifyContent: 'center', alignItems: 'center' },
  carouselContainer: { marginTop: 4, alignItems: 'center' },
  heroCard: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.38,
    borderRadius: 24,
    marginRight: SPACING,
    overflow: 'hidden',
    backgroundColor: '#161620',
    elevation: 8,
    shadowColor: '#FF334B',
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  cardTouch: { width: '100%', height: '100%' },
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
  historyOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 148,
    height: 92,
    justifyContent: 'space-between',
    padding: 8,
  },
  epTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  epTagText: { color: '#FFF', fontSize: 10, fontWeight: '700' },
  progressTrack: { height: 3, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#FF334B' },
  historyTitle: { color: '#FFF', fontSize: 12, fontWeight: '600', marginTop: 6 },
  posterCard: { width: 115 },
  posterThumb: { width: 115, height: 165, borderRadius: 14, backgroundColor: '#161620' },
  posterTitle: { color: '#C8C8D2', fontSize: 12, fontWeight: '600', marginTop: 6 },
});
  
