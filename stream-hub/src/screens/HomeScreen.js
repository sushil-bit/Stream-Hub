import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  StatusBar,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { normalizeTmdbItem, normalizeJikanItem } from "../utils/mediaNormalizer";

const { width } = Dimensions.get("window");
const HERO_CARD_WIDTH = width * 0.76;
const HERO_CARD_HEIGHT = HERO_CARD_WIDTH * 1.45;

const TMDB_API_KEY = "84143a2ecd5784ea50d9990edc20d7f9";
const JIKAN_BASE_URL = "https://api.jikan.moe/v4";

const MAIN_TABS = [
  { id: "trending", label: "Trending", icon: "flame" },
  { id: "movie", label: "Movie", icon: "film" },
  { id: "series", label: "Series", icon: "albums" },
  { id: "anime", label: "Anime", icon: "play-circle" },
  { id: "tv", label: "TV", icon: "tv" },
];

const SUB_CATEGORIES = {
  trending: [
    { id: "today", label: "Today" },
    { id: "this_week", label: "This Week" },
    { id: "now_playing", label: "Now Playing" },
  ],
  movie: [
    { id: "popular", label: "Popular" },
    { id: "top_rated", label: "Top Rated" },
    { id: "upcoming", label: "Upcoming" },
  ],
  series: [
    { id: "popular", label: "Popular" },
    { id: "top_rated", label: "Top Rated" },
    { id: "on_the_air", label: "On The Air" },
  ],
  anime: [
    { id: "bypopularity", label: "Most Popular" },
    { id: "airing", label: "Top Airing" },
    { id: "favorite", label: "Fan Favorites" },
  ],
  tv: [
    { id: "airing_today", label: "Airing Today" },
    { id: "on_the_air", label: "On The Air" },
    { id: "top_rated", label: "Top Rated" },
  ],
};

const INITIAL_CONTINUE = [
  {
    id: "cw_1",
    title: "The End of Oak Street",
    episode: "EP 1",
    progress: 0.65,
    backdrop: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500",
  },
  {
    id: "cw_2",
    title: "The Odyssey",
    episode: "EP 1",
    progress: 0.4,
    backdrop: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=500",
  },
  {
    id: "cw_3",
    title: "Stranger Things",
    episode: "EP 1",
    progress: 0.85,
    backdrop: "https://image.tmdb.org/t/p/w500/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
  },
];

export default function HomeScreen({ navigation }) {
  const [selectedMainTab, setSelectedMainTab] = useState("trending");
  const [selectedSubTab, setSelectedSubTab] = useState(SUB_CATEGORIES.trending[0].id);
  const [heroItems, setHeroItems] = useState([]);
  const [shelfItems, setShelfItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [continueWatching, setContinueWatching] = useState(INITIAL_CONTINUE);

  const cacheRef = useRef({});

  useEffect(() => {
    AsyncStorage.getItem("@streamhub_default_landing").then((landing) => {
      if (landing && MAIN_TABS.some((t) => t.id === landing)) {
        setSelectedMainTab(landing);
        setSelectedSubTab(SUB_CATEGORIES[landing][0].id);
      }
    });
  }, []);

  const fetchTabFeed = useCallback(async (mainTab, subTab) => {
    const cacheKey = `${mainTab}_${subTab}`;
    if (cacheRef.current[cacheKey]) {
      const cached = cacheRef.current[cacheKey];
      setHeroItems(cached.hero);
      setShelfItems(cached.shelf);
      return;
    }

    setLoading(true);
    try {
      let normalized = [];

      if (mainTab === "anime") {
        const filter = subTab === "airing" ? "airing" : subTab === "favorite" ? "favorite" : "bypopularity";
        const res = await fetch(`${JIKAN_BASE_URL}/top/anime?filter=${filter}&limit=20`);
        const json = await res.json();
        normalized = (json.data || []).map(normalizeJikanItem).filter(Boolean);
      } else if (mainTab === "trending") {
        let endpoint = `https://api.themoviedb.org/3/trending/all/day?api_key=${TMDB_API_KEY}`;
        if (subTab === "this_week") {
          endpoint = `https://api.themoviedb.org/3/trending/all/week?api_key=${TMDB_API_KEY}`;
        } else if (subTab === "now_playing") {
          endpoint = `https://api.themoviedb.org/3/movie/now_playing?api_key=${TMDB_API_KEY}&page=1`;
        }
        const res = await fetch(endpoint);
        const json = await res.json();
        normalized = (json.results || []).map((i) => normalizeTmdbItem(i, i.media_type || "movie")).filter(Boolean);
      } else if (mainTab === "movie") {
        const res = await fetch(
          `https://api.themoviedb.org/3/movie/${subTab || "popular"}?api_key=${TMDB_API_KEY}&page=1`
        );
        const json = await res.json();
        normalized = (json.results || []).map((i) => normalizeTmdbItem(i, "movie")).filter(Boolean);
      } else if (mainTab === "series" || mainTab === "tv") {
        const targetType = subTab || "popular";
        const res = await fetch(
          `https://api.themoviedb.org/3/tv/${targetType}?api_key=${TMDB_API_KEY}&page=1`
        );
        const json = await res.json();
        normalized = (json.results || []).map((i) => normalizeTmdbItem(i, "tv")).filter(Boolean);
      }

      if (normalized.length > 0) {
        const hero = normalized.slice(0, 5);
        const shelf = normalized.slice(5);
        cacheRef.current[cacheKey] = { hero, shelf };
        setHeroItems(hero);
        setShelfItems(shelf);
      }
    } catch (e) {
      console.warn("Feed loading error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTabFeed(selectedMainTab, selectedSubTab);
  }, [selectedMainTab, selectedSubTab, fetchTabFeed]);

  const handleSelectMainTab = (tabId) => {
    setSelectedMainTab(tabId);
    setSelectedSubTab(SUB_CATEGORIES[tabId][0].id);
  };

  const handleClearAllContinue = () => {
    Alert.alert("Clear Continue Watching", "Remove all in-progress titles?", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear", style: "destructive", onPress: () => setContinueWatching([]) },
    ]);
  };

  const removeContinueItem = (id) => {
    setContinueWatching((prev) => prev.filter((i) => i.id !== id));
  };

  const activeMainLabel = MAIN_TABS.find((t) => t.id === selectedMainTab)?.label || "Trending";
  const activeSubLabel = SUB_CATEGORIES[selectedMainTab]?.find((s) => s.id === selectedSubTab)?.label || "";

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0C13" />

      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <Text style={styles.brandStream}>STREAM</Text>
          <Text style={styles.brandHub}>HUB</Text>
        </View>
        <TouchableOpacity
          style={styles.searchBtn}
          onPress={() => navigation.navigate("Explore")}
          activeOpacity={0.8}
        >
          <Ionicons name="search" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Main Categories Bar (Trending, Movie, Series, Anime, TV) */}
      <View style={styles.mainTabStrip}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.mainTabContent}
        >
          {MAIN_TABS.map((cat) => {
            const isActive = selectedMainTab === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.tabItem, isActive && styles.tabItemActive]}
                onPress={() => handleSelectMainTab(cat.id)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={cat.icon}
                  size={13}
                  color={isActive ? "#FF334B" : "#7E7E8A"}
                />
                <Text
                  style={[
                    styles.tabItemText,
                    isActive && styles.tabItemTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Dynamic Sub-Category Chips */}
      <View style={styles.subCategoryStrip}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.subTabContent}
        >
          {(SUB_CATEGORIES[selectedMainTab] || []).map((sub) => {
            const isSubActive = selectedSubTab === sub.id;
            return (
              <TouchableOpacity
                key={sub.id}
                style={[styles.subChip, isSubActive && styles.subChipActive]}
                onPress={() => setSelectedSubTab(sub.id)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.subChipText,
                    isSubActive && styles.subChipTextActive,
                  ]}
                >
                  {sub.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Content Feed */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {loading && heroItems.length === 0 ? (
          <View style={styles.loaderArea}>
            <ActivityIndicator size="large" color="#FF334B" />
          </View>
        ) : (
          <>
            {/* Giant Hero Carousel */}
            <FlatList
              horizontal
              data={heroItems}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              snapToInterval={HERO_CARD_WIDTH + 14}
              decelerationRate="fast"
              contentContainerStyle={styles.heroCarouselContent}
              renderItem={({ item }) => (
                <View style={styles.heroCard}>
                  <Image source={{ uri: item.poster }} style={styles.heroImage} resizeMode="cover" />
                  <View style={styles.heroOverlay}>
                    <View style={styles.heroTextContent}>
                      <Text style={styles.heroTitle} numberOfLines={2}>
                        {item.title}
                      </Text>
                      <View style={styles.heroMetaRow}>
                        <View style={styles.ratingBadge}>
                          <Ionicons name="star" size={11} color="#FFB800" />
                          <Text style={styles.ratingText}>{item.rating}</Text>
                        </View>
                        <Text style={styles.heroYear}>{item.year}</Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={styles.floatingPlayBtn}
                      activeOpacity={0.85}
                      onPress={() =>
                        navigation.navigate("Details", {
                          id: item.rawId,
                          mediaType: item.mediaType,
                          source: item.source,
                          item,
                        })
                      }
                    >
                      <Ionicons name="play" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />

            {/* Continue Watching Section */}
            {continueWatching.length > 0 && (
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Continue Watching</Text>
                  <TouchableOpacity onPress={handleClearAllContinue}>
                    <Text style={styles.clearAllText}>Clear All</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.continueRow}
                >
                  {continueWatching.map((item) => (
                    <View key={item.id} style={styles.continueCard}>
                      <View style={styles.continueThumbWrapper}>
                        <Image source={{ uri: item.backdrop }} style={styles.continueThumb} />
                        <View style={styles.continueOverlay}>
                          <TouchableOpacity
                            style={styles.continuePlayBtn}
                            activeOpacity={0.85}
                            onPress={() => navigation.navigate("Details", { item })}
                          >
                            <Ionicons name="play" size={14} color="#FFFFFF" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.closeBtn}
                            onPress={() => removeContinueItem(item.id)}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          >
                            <Ionicons name="close-circle" size={18} color="#FFFFFF" />
                          </TouchableOpacity>
                        </View>
                        <View style={styles.progressTrack}>
                          <View style={[styles.progressBar, { width: `${item.progress * 100}%` }]} />
                        </View>
                      </View>
                      <Text style={styles.continueTitle} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text style={styles.continueEp}>{item.episode}</Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Dynamic Media Shelf */}
            {shelfItems.length > 0 && (
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>
                    {activeMainLabel} • {activeSubLabel}
                  </Text>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.shelfRow}
                >
                  {shelfItems.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.shelfCard}
                      activeOpacity={0.8}
                      onPress={() =>
                        navigation.navigate("Details", {
                          id: item.rawId,
                          mediaType: item.mediaType,
                          source: item.source,
                          item,
                        })
                      }
                    >
                      <Image source={{ uri: item.poster }} style={styles.shelfPoster} />
                      <Text style={styles.shelfTitle} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <View style={styles.shelfMeta}>
                        <Ionicons name="star" size={10} color="#FFB800" />
                        <Text style={styles.shelfRating}>{item.rating}</Text>
                        <Text style={styles.shelfYear}>• {item.year}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0C13",
  },
  header: {
    paddingTop: 48,
    paddingHorizontal: 18,
    paddingBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  brandStream: {
    fontSize: 20,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  brandHub: {
    fontSize: 20,
    fontWeight: "900",
    color: "#FF334B",
    marginLeft: 3,
    letterSpacing: 0.5,
  },
  searchBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  mainTabStrip: {
    height: 42,
    backgroundColor: "#0D0C13",
    justifyContent: "center",
  },
  mainTabContent: {
    paddingHorizontal: 14,
    alignItems: "center",
    gap: 8,
  },
  tabItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#16161F",
    gap: 5,
    borderWidth: 1,
    borderColor: "#22222E",
  },
  tabItemActive: {
    backgroundColor: "rgba(255, 51, 75, 0.12)",
    borderColor: "#FF334B",
  },
  tabItemText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#7E7E8A",
  },
  tabItemTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  subCategoryStrip: {
    height: 34,
    backgroundColor: "#0D0C13",
    justifyContent: "center",
  },
  subTabContent: {
    paddingHorizontal: 14,
    alignItems: "center",
    gap: 6,
  },
  subChip: {
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: "transparent",
  },
  subChipActive: {
    backgroundColor: "#20202E",
  },
  subChipText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#6E6E7A",
  },
  subChipTextActive: {
    color: "#FF334B",
    fontWeight: "700",
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 110,
  },
  loaderArea: {
    height: 240,
    alignItems: "center",
    justifyContent: "center",
  },
  heroCarouselContent: {
    paddingHorizontal: 16,
    gap: 14,
    paddingVertical: 8,
  },
  heroCard: {
    width: HERO_CARD_WIDTH,
    height: HERO_CARD_HEIGHT,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#1B1A24",
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "45%",
    backgroundColor: "rgba(13, 12, 19, 0.75)",
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  heroTextContent: {
    flex: 1,
    marginRight: 10,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
    lineHeight: 22,
  },
  heroMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  ratingText: {
    color: "#FFB800",
    fontSize: 12,
    fontWeight: "700",
  },
  heroYear: {
    color: "#8E8E9A",
    fontSize: 12,
    fontWeight: "600",
  },
  floatingPlayBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FF334B",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FF334B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
  },
  sectionContainer: {
    marginTop: 22,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  clearAllText: {
    color: "#FF334B",
    fontSize: 12,
    fontWeight: "700",
  },
  continueRow: {
    paddingHorizontal: 16,
    gap: 12,
  },
  continueCard: {
    width: 140,
  },
  continueThumbWrapper: {
    width: 140,
    height: 82,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#16161F",
    position: "relative",
  },
  continueThumb: {
    width: "100%",
    height: "100%",
  },
  continueOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  continuePlayBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FF334B",
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtn: {
    position: "absolute",
    top: 5,
    right: 5,
  },
  progressTrack: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#FF334B",
  },
  continueTitle: {
    color: "#DDDDE8",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 6,
  },
  continueEp: {
    color: "#7E7E8A",
    fontSize: 10.5,
    fontWeight: "500",
    marginTop: 2,
  },
  shelfRow: {
    paddingHorizontal: 16,
    gap: 12,
  },
  shelfCard: {
    width: 110,
  },
  shelfPoster: {
    width: 110,
    height: 160,
    borderRadius: 12,
    backgroundColor: "#16161F",
  },
  shelfTitle: {
    color: "#DDDDE8",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 6,
  },
  shelfMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 2,
  },
  shelfRating: {
    color: "#FFB800",
    fontSize: 10.5,
    fontWeight: "700",
  },
  shelfYear: {
    color: "#7E7E8A",
    fontSize: 10,
  },
});
