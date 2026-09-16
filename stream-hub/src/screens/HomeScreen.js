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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { normalizeTmdbItem, normalizeJikanItem } from "../utils/mediaNormalizer";
import UnifiedMediaCard from "../components/UnifiedMediaCard";

const TMDB_API_KEY = "e2c349924558593414bcbfca414b2d1d";
const JIKAN_BASE_URL = "https://api.jikan.moe/v4";

const HEADER_HEIGHT = 52;
const MAIN_TAB_HEIGHT = 44;
const SUB_TAB_HEIGHT = 38;
const TOTAL_COLLAPSIBLE_HEADER = HEADER_HEIGHT; // Only hide the main brand header on scroll

// Main navigation tabs in exact required order
const MAIN_TABS = [
  { id: "trending", label: "Trending", icon: "flame" },
  { id: "movie", label: "Movie", icon: "film" },
  { id: "series", label: "Series", icon: "albums" },
  { id: "anime", label: "Anime", icon: "play-circle" },
  { id: "tv", label: "TV", icon: "tv" },
];

// Sub-categories mapped cleanly to each main category
const SUB_CATEGORIES = {
  trending: [
    { id: "all_day", label: "Today" },
    { id: "all_week", label: "This Week" },
    { id: "now_playing", label: "Now Playing" },
  ],
  movie: [
    { id: "popular", label: "Popular" },
    { id: "top_rated", label: "Top Rated" },
    { id: "action", label: "Action", genreId: 28 },
    { id: "sci_fi", label: "Sci-Fi", genreId: 878 },
    { id: "horror", label: "Horror", genreId: 27 },
  ],
  series: [
    { id: "popular", label: "Popular" },
    { id: "top_rated", label: "Top Rated" },
    { id: "drama", label: "Drama", genreId: 18 },
    { id: "comedy", label: "Comedy", genreId: 35 },
    { id: "mystery", label: "Mystery", genreId: 9648 },
  ],
  anime: [
    { id: "airing", label: "Top Airing" },
    { id: "bypopularity", label: "Most Popular" },
    { id: "favorite", label: "Fan Favorites" },
    { id: "upcoming", label: "Upcoming" },
  ],
  tv: [
    { id: "on_the_air", label: "On The Air" },
    { id: "airing_today", label: "Airing Today" },
    { id: "reality", label: "Reality", genreId: 10764 },
    { id: "documentary", label: "Documentary", genreId: 99 },
  ],
};

export default function HomeScreen({ navigation }) {
  const [selectedMainTab, setSelectedMainTab] = useState("trending");
  const [selectedSubTab, setSelectedSubTab] = useState(SUB_CATEGORIES.trending[0].id);
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;
  const cacheRef = useRef({});

  // Startup default preference hook
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
      const subConfig = SUB_CATEGORIES[mainTab]?.find((s) => s.id === subTab);

      if (mainTab === "anime") {
        const filterParam = subTab === "airing" ? "airing" : subTab === "favorite" ? "favorite" : subTab === "upcoming" ? "upcoming" : "bypopularity";
        const res = await fetch(`${JIKAN_BASE_URL}/top/anime?filter=${filterParam}&limit=24`);
        const json = await res.json();
        results = (json.data || []).map(normalizeJikanItem).filter(Boolean);
      } else if (mainTab === "trending") {
        const timeWindow = subTab === "all_week" ? "week" : "day";
        const endpoint = subTab === "now_playing"
          ? `https://api.themoviedb.org/3/movie/now_playing?api_key=${TMDB_API_KEY}&page=1`
          : `https://api.themoviedb.org/3/trending/all/${timeWindow}?api_key=${TMDB_API_KEY}`;
        const res = await fetch(endpoint);
        const json = await res.json();
        results = (json.results || []).map((i) => normalizeTmdbItem(i, i.media_type || "movie")).filter(Boolean);
      } else if (mainTab === "movie") {
        let endpoint = `https://api.themoviedb.org/3/movie/${subTab}?api_key=${TMDB_API_KEY}&page=1`;
        if (subConfig?.genreId) {
          endpoint = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${subConfig.genreId}&sort_by=popularity.desc&page=1`;
        }
        const res = await fetch(endpoint);
        const json = await res.json();
        results = (json.results || []).map((i) => normalizeTmdbItem(i, "movie")).filter(Boolean);
      } else if (mainTab === "series" || mainTab === "tv") {
        let endpoint = `https://api.themoviedb.org/3/tv/${subTab}?api_key=${TMDB_API_KEY}&page=1`;
        if (subConfig?.genreId) {
          endpoint = `https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_API_KEY}&with_genres=${subConfig.genreId}&sort_by=popularity.desc&page=1`;
        }
        const res = await fetch(endpoint);
        const json = await res.json();
        results = (json.results || []).map((i) => normalizeTmdbItem(i, "tv")).filter(Boolean);
      }

      cacheRef.current[cacheKey] = results;
      setMediaList(results);
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

  // Header translates up on downward scroll
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0C13" />

      {/* Collapsible Top Header */}
      <Animated.View
        style={[
          styles.topContainer,
          { transform: [{ translateY: headerTranslateY }] },
        ]}
      >
        {/* Brand Header (Hides away on scroll) */}
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

        {/* Primary Categories (Trending, Movie, Series, Anime, TV) */}
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

        {/* Dynamic Sub-Category Filter Chips */}
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

      {/* Grid Content */}
      {loading && mediaList.length === 0 ? (
        <View style={styles.centerLoader}>
          <ActivityIndicator size="large" color="#FF334B" />
        </View>
      ) : (
        <Animated.FlatList
          data={mediaList}
          keyExtractor={(item) => item.id}
          numColumns={3}
          columnWrapperStyle={styles.rowWrapper}
          contentContainerStyle={styles.listContent}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
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
      )}
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
    zIndex: 10,
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
    paddingTop: HEADER_HEIGHT + MAIN_TAB_HEIGHT + SUB_TAB_HEIGHT + 44,
    paddingHorizontal: 12,
    paddingBottom: 95,
  },
  rowWrapper: {
    justifyContent: "space-between",
  },
  centerLoader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
