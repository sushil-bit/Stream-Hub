import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ActivityIndicator,
  StatusBar,
  ScrollView,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { normalizeTmdbItem, normalizeJikanItem } from "../utils/mediaNormalizer";
import UnifiedMediaCard from "../components/UnifiedMediaCard";

const { width } = Dimensions.get("window");
const JIKAN_BASE_URL = "https://api.jikan.moe/v4";
const TMDB_API_KEY = "84143a2ecd5784ea50d9990edc20d7f9"; // Verified TMDb v3 public key

const HEADER_HEIGHT = 52;
const MAIN_TAB_HEIGHT = 44;
const SUB_TAB_HEIGHT = 38;

const MAIN_TABS = [
  { id: "trending", label: "Trending", icon: "flame" },
  { id: "movie", label: "Movie", icon: "film" },
  { id: "series", label: "Series", icon: "albums" },
  { id: "anime", label: "Anime", icon: "play-circle" },
  { id: "tv", label: "TV", icon: "tv" },
];

const SUB_CATEGORIES = {
  trending: [
    { id: "all_day", label: "Today" },
    { id: "all_week", label: "This Week" },
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

// Fallback items to guarantee artwork is never black screen
const FALLBACK_LIST = [
  {
    id: "fb_1",
    rawId: 101,
    source: "tmdb",
    mediaType: "movie",
    title: "Spider-Man: Across the Spider-Verse",
    poster: "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg",
    rating: "8.7",
    year: "2023",
  },
  {
    id: "fb_2",
    rawId: 102,
    source: "jikan",
    mediaType: "anime",
    title: "Demon Slayer: Kimetsu no Yaiba",
    poster: "https://cdn.myanimelist.net/images/anime/1286/99889l.jpg",
    backdrop: "https://cdn.myanimelist.net/images/anime/1286/99889l.jpg",
    rating: "8.9",
    year: "2019",
    episodes: "26 eps",
  },
  {
    id: "fb_3",
    rawId: 103,
    source: "tmdb",
    mediaType: "tv",
    title: "Stranger Things",
    poster: "https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
    rating: "8.6",
    year: "2016",
    episodes: "34 eps",
  },
  {
    id: "fb_4",
    rawId: 104,
    source: "jikan",
    mediaType: "anime",
    title: "Jujutsu Kaisen",
    poster: "https://cdn.myanimelist.net/images/anime/1171/109222l.jpg",
    backdrop: "https://cdn.myanimelist.net/images/anime/1171/109222l.jpg",
    rating: "8.8",
    year: "2020",
    episodes: "24 eps",
  },
  {
    id: "fb_5",
    rawId: 105,
    source: "tmdb",
    mediaType: "movie",
    title: "Oppenheimer",
    poster: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/rLb2cwF3Pazuxaj0sRXQ037tGI1.jpg",
    rating: "8.5",
    year: "2023",
  },
  {
    id: "fb_6",
    rawId: 106,
    source: "tmdb",
    mediaType: "tv",
    title: "The Last of Us",
    poster: "https://image.tmdb.org/t/p/w500/uKvVjK1qYXxNm2hg5g99hxNx0mg.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/uDgy6hyPd82kOHh6I95FLtLnj6p.jpg",
    rating: "8.6",
    year: "2023",
  },
];

export default function HomeScreen({ navigation }) {
  const [selectedMainTab, setSelectedMainTab] = useState("trending");
  const [selectedSubTab, setSelectedSubTab] = useState(SUB_CATEGORIES.trending[0].id);
  const [mediaList, setMediaList] = useState(FALLBACK_LIST);
  const [loading, setLoading] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;
  const cacheRef = useRef({});

  useEffect(() => {
    AsyncStorage.getItem("@streamhub_default_landing").then((landing) => {
      if (landing && MAIN_TABS.some((t) => t.id === landing)) {
        setSelectedMainTab(landing);
        setSelectedSubTab(SUB_CATEGORIES[landing][0].id);
      }
    });
  }, []);

  const fetchData = useCallback(async (mainTab, subTab) => {
    const cacheKey = `${mainTab}_${subTab}`;
    if (cacheRef.current[cacheKey]) {
      setMediaList(cacheRef.current[cacheKey]);
      return;
    }

    setLoading(true);
    try {
      let results = [];

      if (mainTab === "anime") {
        const filter = subTab === "airing" ? "airing" : subTab === "favorite" ? "favorite" : "bypopularity";
        const res = await fetch(`${JIKAN_BASE_URL}/top/anime?filter=${filter}&limit=21`);
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          results = json.data.map(normalizeJikanItem).filter(Boolean);
        }
      } else if (mainTab === "trending") {
        const timeWindow = subTab === "all_week" ? "week" : "day";
        const url = subTab === "now_playing"
          ? `https://api.themoviedb.org/3/movie/now_playing?api_key=${TMDB_API_KEY}&page=1`
          : `https://api.themoviedb.org/3/trending/all/${timeWindow}?api_key=${TMDB_API_KEY}`;
        const res = await fetch(url);
        const json = await res.json();
        if (json.results && json.results.length > 0) {
          results = json.results.map((i) => normalizeTmdbItem(i, i.media_type || "movie")).filter(Boolean);
        }
      } else if (mainTab === "movie") {
        const res = await fetch(
          `https://api.themoviedb.org/3/movie/${subTab || "popular"}?api_key=${TMDB_API_KEY}&page=1`
        );
        const json = await res.json();
        if (json.results && json.results.length > 0) {
          results = json.results.map((i) => normalizeTmdbItem(i, "movie")).filter(Boolean);
        }
      } else if (mainTab === "series" || mainTab === "tv") {
        const res = await fetch(
          `https://api.themoviedb.org/3/tv/${subTab || "popular"}?api_key=${TMDB_API_KEY}&page=1`
        );
        const json = await res.json();
        if (json.results && json.results.length > 0) {
          results = json.results.map((i) => normalizeTmdbItem(i, "tv")).filter(Boolean);
        }
      }

      if (results.length > 0) {
        cacheRef.current[cacheKey] = results;
        setMediaList(results);
      }
    } catch (e) {
      console.warn("Category load error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(selectedMainTab, selectedSubTab);
  }, [selectedMainTab, selectedSubTab, fetchData]);

  const handleSelectMainTab = (tabId) => {
    setSelectedMainTab(tabId);
    setSelectedSubTab(SUB_CATEGORIES[tabId][0].id);
  };

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT],
    outputRange: [0, -HEADER_HEIGHT],
    extrapolate: "clamp",
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT / 2, HEADER_HEIGHT],
    outputRange: [1, 0.2, 0],
    extrapolate: "clamp",
  });

  const featured = mediaList.length > 0 ? mediaList[0] : FALLBACK_LIST[0];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0C13" />

      {/* Top Collapsible Bar */}
      <Animated.View
        style={[
          styles.topContainer,
          { transform: [{ translateY: headerTranslateY }] },
        ]}
      >
        <Animated.View style={[styles.mainHeader, { opacity: headerOpacity }]}>
          <View style={styles.logoRow}>
            <View style={styles.logoIcon}>
              <Ionicons name="play" size={15} color="#FFFFFF" />
            </View>
            <Text style={styles.brandTitle}>Stream-Hub</Text>
          </View>
          <TouchableOpacity
            style={styles.searchBtn}
            onPress={() => navigation.navigate("Explore")}
          >
            <Ionicons name="search-outline" size={18} color="#DDDDE8" />
          </TouchableOpacity>
        </Animated.View>

        {/* Main Tabs */}
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

        {/* Sub-Category Chips */}
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
      </Animated.View>

      {/* Poster Grid */}
      <Animated.FlatList
        data={mediaList}
        keyExtractor={(item, index) => `${item.id}_${index}`}
        numColumns={3}
        columnWrapperStyle={styles.rowWrapper}
        contentContainerStyle={styles.listContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        ListHeaderComponent={
          <View style={styles.heroBanner}>
            <Image
              source={{ uri: featured.backdrop || featured.poster }}
              style={styles.heroImage}
              resizeMode="cover"
            />
            <View style={styles.heroOverlay}>
              <View style={styles.heroTagRow}>
                <View style={styles.heroTag}>
                  <Text style={styles.heroTagText}>
                    {selectedMainTab.toUpperCase()} SPOTLIGHT
                  </Text>
                </View>
                <View style={styles.heroScore}>
                  <Ionicons name="star" size={11} color="#FFB800" />
                  <Text style={styles.heroScoreText}>{featured.rating}</Text>
                </View>
              </View>

              <Text style={styles.heroTitle} numberOfLines={1}>
                {featured.title}
              </Text>

              <View style={styles.heroActions}>
                <TouchableOpacity
                  style={styles.playBtn}
                  activeOpacity={0.8}
                  onPress={() =>
                    navigation.navigate("Details", {
                      id: featured.rawId,
                      mediaType: featured.mediaType,
                      source: featured.source,
                      item: featured,
                    })
                  }
                >
                  <Ionicons name="play" size={15} color="#0D0C13" />
                  <Text style={styles.playBtnText}>Play Now</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.infoBtn}
                  activeOpacity={0.8}
                  onPress={() =>
                    navigation.navigate("Details", {
                      id: featured.rawId,
                      mediaType: featured.mediaType,
                      source: featured.source,
                      item: featured,
                    })
                  }
                >
                  <Ionicons name="information-circle-outline" size={17} color="#FFFFFF" />
                  <Text style={styles.infoBtnText}>Details</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <UnifiedMediaCard
            item={item}
            onPress={(media) =>
              navigation.navigate("Details", {
                id: media.rawId,
                mediaType: media.mediaType,
                source: media.source,
                item: media,
              })
            }
          />
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0C13",
  },
  topContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    backgroundColor: "#0D0C13",
    paddingTop: 44,
  },
  mainHeader: {
    height: HEADER_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#FF334B",
    alignItems: "center",
    justifyContent: "center",
  },
  brandTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  searchBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#16161F",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#22222E",
  },
  mainTabStrip: {
    height: MAIN_TAB_HEIGHT,
    backgroundColor: "#0D0C13",
    justifyContent: "center",
  },
  mainTabContent: {
    paddingHorizontal: 12,
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
    height: SUB_TAB_HEIGHT,
    backgroundColor: "#0D0C13",
    borderBottomWidth: 1,
    borderBottomColor: "#1B1A24",
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
  listContent: {
    paddingTop: HEADER_HEIGHT + MAIN_TAB_HEIGHT + SUB_TAB_HEIGHT + 46,
    paddingHorizontal: 12,
    paddingBottom: 95,
  },
  rowWrapper: {
    justifyContent: "space-between",
  },
  heroBanner: {
    width: "100%",
    height: 200,
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 16,
    backgroundColor: "#1B1A24",
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: "rgba(13, 12, 19, 0.5)",
    justifyContent: "flex-end",
    padding: 14,
  },
  heroTagRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  heroTag: {
    backgroundColor: "#FF334B",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  heroTagText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  heroScore: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(13, 12, 19, 0.75)",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  heroScoreText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  heroTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 10,
  },
  heroActions: {
    flexDirection: "row",
    gap: 8,
  },
  playBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    gap: 6,
  },
  playBtnText: {
    color: "#0D0C13",
    fontSize: 12,
    fontWeight: "800",
  },
  infoBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    gap: 6,
  },
  infoBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
});
