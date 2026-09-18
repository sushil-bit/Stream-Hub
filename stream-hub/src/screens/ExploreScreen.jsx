import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { normalizeTmdbItem, normalizeJikanItem } from "../utils/mediaNormalizer";
import UnifiedMediaCard from "../components/UnifiedMediaCard";

// Fallback TMDB Bearer/Key or API endpoint references
const TMDB_API_KEY = "e2c349924558593414bcbfca414b2d1d"; // standard TMDb demo v3 key
const JIKAN_BASE_URL = "https://api.jikan.moe/v4";

const TABS = [
  { id: "all", label: "Trending", icon: "flame" },
  { id: "movie", label: "Movies", icon: "film" },
  { id: "tv", label: "Series", icon: "tv" },
  { id: "anime", label: "Anime", icon: "sparkles" },
];

export default function ExploreScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(false);

  // In-memory cache to prevent layout jump / refetch flickers
  const cacheRef = useRef({
    all: null,
    movie: null,
    tv: null,
    anime: null,
  });

  const [mediaList, setMediaList] = useState([]);

  const fetchCategoryData = useCallback(async (tabId) => {
    // If cached, swap immediately with 0ms loading layout shift
    if (cacheRef.current[tabId]) {
      setMediaList(cacheRef.current[tabId]);
      return;
    }

    setLoading(true);
    try {
      let normalized = [];

      if (tabId === "anime") {
        const res = await fetch(`${JIKAN_BASE_URL}/top/anime?filter=bypopularity&limit=24`);
        const json = await res.json();
        normalized = (json.data || []).map(normalizeJikanItem).filter(Boolean);
      } else if (tabId === "movie") {
        const res = await fetch(
          `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&page=1`
        );
        const json = await res.json();
        normalized = (json.results || [])
          .map((item) => normalizeTmdbItem(item, "movie"))
          .filter(Boolean);
      } else if (tabId === "tv") {
        const res = await fetch(
          `https://api.themoviedb.org/3/tv/popular?api_key=${TMDB_API_KEY}&page=1`
        );
        const json = await res.json();
        normalized = (json.results || [])
          .map((item) => normalizeTmdbItem(item, "tv"))
          .filter(Boolean);
      } else {
        // Trending: Combination of trending TMDB content
        const res = await fetch(
          `https://api.themoviedb.org/3/trending/all/day?api_key=${TMDB_API_KEY}`
        );
        const json = await res.json();
        normalized = (json.results || [])
          .map((item) => normalizeTmdbItem(item, item.media_type || "movie"))
          .filter(Boolean);
      }

      cacheRef.current[tabId] = normalized;
      setMediaList(normalized);
    } catch (err) {
      console.warn("Failed to fetch explore feed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategoryData(activeTab);
  }, [activeTab, fetchCategoryData]);

  const handleCardPress = (item) => {
    // Route to media details
    if (navigation?.navigate) {
      navigation.navigate("DetailsScreen", {
        id: item.rawId,
        mediaType: item.mediaType,
        source: item.source,
        item,
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore</Text>
      </View>

      {/* Synchronized Filter Strip */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tabChip, isActive && styles.tabChipActive]}
              onPress={() => setActiveTab(tab.id)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={tab.icon}
                size={14}
                color={isActive ? "#FFFFFF" : "#7E7E8A"}
              />
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Stable 3-Column Media Grid */}
      {loading && mediaList.length === 0 ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#FF334B" />
        </View>
      ) : (
        <FlatList
          data={mediaList}
          keyExtractor={(item) => item.id}
          numColumns={3}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <UnifiedMediaCard item={item} onPress={handleCardPress} />
          )}
          showsVerticalScrollIndicator={false}
          initialNumToRender={9}
          maxToRenderPerBatch={9}
          windowSize={5}
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
  header: {
    paddingTop: 52,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  tabBar: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 8,
  },
  tabChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: "#16161F",
    borderWidth: 1,
    borderColor: "#22222E",
    gap: 6,
  },
  tabChipActive: {
    backgroundColor: "#FF334B",
    borderColor: "#FF334B",
  },
  tabText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#7E7E8A",
  },
  tabTextActive: {
    color: "#FFFFFF",
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 100, // accommodate FloatingTabBar
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  loaderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
