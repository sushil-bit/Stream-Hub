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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { normalizeTmdbItem, normalizeJikanItem } from "../utils/mediaNormalizer";
import UnifiedMediaCard from "../components/UnifiedMediaCard";

const { width } = Dimensions.get("window");
const TMDB_API_KEY = "e2c349924558593414bcbfca414b2d1d";
const JIKAN_BASE_URL = "https://api.jikan.moe/v4";

const HEADER_HEIGHT = 56;
const TAB_BAR_HEIGHT = 46;
const TOTAL_TOP_HEIGHT = HEADER_HEIGHT + TAB_BAR_HEIGHT;

const CATEGORIES = [
  { id: "all", label: "Featured", icon: "sparkles" },
  { id: "movie", label: "Movies", icon: "film" },
  { id: "tv", label: "Series", icon: "tv" },
  { id: "anime", label: "Anime", icon: "play-circle" },
];

export default function HomeScreen({ navigation }) {
  const [selectedTab, setSelectedTab] = useState("all");
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;
  const cacheRef = useRef({});

  // Startup default preference hook
  useEffect(() => {
    AsyncStorage.getItem("@streamhub_default_landing").then((landing) => {
      if (landing && ["all", "movie", "tv", "anime"].includes(landing)) {
        setSelectedTab(landing);
      }
    });
  }, []);

  const fetchData = useCallback(async (tabId) => {
    if (cacheRef.current[tabId]) {
      setMediaList(cacheRef.current[tabId]);
      return;
    }

    setLoading(true);
    try {
      let results = [];
      if (tabId === "anime") {
        const res = await fetch(`${JIKAN_BASE_URL}/top/anime?filter=airing&limit=24`);
        const json = await res.json();
        results = (json.data || []).map(normalizeJikanItem).filter(Boolean);
      } else if (tabId === "movie") {
        const res = await fetch(
          `https://api.themoviedb.org/3/movie/now_playing?api_key=${TMDB_API_KEY}&page=1`
        );
        const json = await res.json();
        results = (json.results || []).map((i) => normalizeTmdbItem(i, "movie")).filter(Boolean);
      } else if (tabId === "tv") {
        const res = await fetch(
          `https://api.themoviedb.org/3/tv/on_the_air?api_key=${TMDB_API_KEY}&page=1`
        );
        const json = await res.json();
        results = (json.results || []).map((i) => normalizeTmdbItem(i, "tv")).filter(Boolean);
      } else {
        const res = await fetch(
          `https://api.themoviedb.org/3/trending/all/day?api_key=${TMDB_API_KEY}`
        );
        const json = await res.json();
        results = (json.results || []).map((i) => normalizeTmdbItem(i, i.media_type)).filter(Boolean);
      }

      cacheRef.current[tabId] = results;
      setMediaList(results);
    } catch (e) {
      console.warn("Failed loading category:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(selectedTab);
  }, [selectedTab, fetchData]);

  // Smooth translateY clamp: hides the brand title but keeps sub-tabs docked at the top
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT],
    outputRange: [0, -HEADER_HEIGHT],
    extrapolate: "clamp",
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT / 2, HEADER_HEIGHT],
    outputRange: [1, 0.4, 0],
    extrapolate: "clamp",
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0C13" />

      {/* Collapsible Header + Sticky Sub-Tabs Container */}
      <Animated.View
        style={[
          styles.topContainer,
          { transform: [{ translateY: headerTranslateY }] },
        ]}
      >
        {/* Top Branding (Hides away on scroll) */}
        <Animated.View style={[styles.mainHeader, { opacity: headerOpacity }]}>
          <View style={styles.logoRow}>
            <View style={styles.logoIcon}>
              <Ionicons name="play" size={16} color="#FFFFFF" />
            </View>
            <Text style={styles.brandTitle}>Stream-Hub</Text>
          </View>
          <TouchableOpacity
            style={styles.searchBtn}
            onPress={() => navigation.navigate("Explore")}
          >
            <Ionicons name="search-outline" size={20} color="#DDDDE8" />
          </TouchableOpacity>
        </Animated.View>

        {/* Categories Tab Strip (Movie / Series / Anime / TV) */}
        <View style={styles.tabStrip}>
          {CATEGORIES.map((cat) => {
            const isActive = selectedTab === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.tabItem, isActive && styles.tabItemActive]}
                onPress={() => setSelectedTab(cat.id)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={cat.icon}
                  size={14}
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
        </View>
      </Animated.View>

      {/* Main Feed Content */}
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
    paddingTop: 44, // Safe status bar padding
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
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FF334B",
    alignItems: "center",
    justifyContent: "center",
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  searchBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#16161F",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#22222E",
  },
  tabStrip: {
    height: TAB_BAR_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#1B1A24",
    backgroundColor: "#0D0C13",
  },
  tabItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 7,
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
  listContent: {
    paddingTop: TOTAL_TOP_HEIGHT + 48,
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
