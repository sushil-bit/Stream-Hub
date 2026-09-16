import AsyncStorage from "@react-native-async-storage/async-storage";
import LoadingPanel from "../components/Common/LoadingPanel";
import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import {
  fetchTrendingMovies,
  fetchTopAnime,
  IMAGE_BASE_URL,
} from "../services/api";
import { getContinueWatching, removeContinueWatching, clearContinueWatching } from "../services/storage";
import HeroCarousel from "../components/Feed/HeroCarousel";
import { HomeSkeleton } from "../components/Common/SkeletonLoader";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const IMAGE_URL = IMAGE_BASE_URL || "https://image.tmdb.org/t/p/w500";

export default function HomeScreen({ navigation }) {
  useEffect(() => {
    AsyncStorage.getItem("@streamhub_default_landing").then((landing) => {
      if (landing === "movie" || landing === "tv") {
        if (typeof setSelectedCategory === "function") {
          setSelectedCategory(landing);
        } else if (typeof setActiveTab === "function") {
          setActiveTab(landing);
        }
      }
    });
  }, []);

  const [trending, setTrending] = useState([]);
  const [anime, setAnime] = useState([]);
  const [continueWatching, setContinueWatching] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadContinueWatching();
    }, [])
  );

  const loadContent = async () => {
    try {
      setLoading(true);
      const [trendingData, animeData] = await Promise.all([
        fetchTrendingMovies ? fetchTrendingMovies() : [],
        fetchTopAnime ? fetchTopAnime() : [],
      ]);

      setTrending(Array.isArray(trendingData) ? trendingData : []);
      const formattedAnime = (Array.isArray(animeData) ? animeData : []).map((a) => ({
        ...a,
        isAnime: true,
        poster_path: a.images?.jpg?.large_image_url || a.images?.jpg?.image_url,
      }));
      setAnime(formattedAnime);
    } catch (e) {
      console.warn("Content fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  
  const handleRemoveItem = async (id) => {
    const updated = await removeContinueWatching(id);
    setContinueWatching(updated);
  };

  const handleClearAll = async () => {
    await clearContinueWatching();
    setContinueWatching([]);
  };

  const loadContinueWatching = async () => {
    try {
      if (typeof getContinueWatching === "function") {
        const history = await getContinueWatching();
        setContinueWatching(Array.isArray(history) ? history : []);
      }
    } catch (e) {
      console.warn("Load continue watching error:", e);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0A0A0E" }}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <SafeAreaView style={{ flex: 1 }}>
          <HomeSkeleton />
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient
        colors={["#2A0912", "#140E14", "#0A0A0E"]}
        locations={[0, 0.3, 0.7]}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
          {/* Header */}
          <View style={styles.topBar}>
            <View style={styles.brandGroup}>
              <Text style={styles.brandTitle}>STREAM</Text>
              <Text style={styles.brandSub}>HUB</Text>
            </View>
            <TouchableOpacity style={styles.searchIconBtn} onPress={() => navigation.navigate("Explore")}>
              <Ionicons name="search" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* Hero 3D Carousel */}
          {trending.length > 0 && (
            <HeroCarousel
              items={trending.slice(0, 7)}
              onItemPress={(item) => navigation.navigate("DetailsScreen", { media: item })}
              onPlayPress={(item) => navigation.navigate("PlayerScreen", { media: item })}
            />
          )}

          {/* Continue Watching Row */}
          {continueWatching.length > 0 && (
            <View style={styles.shelfSection}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, marginBottom: 12 }}>
    <Text style={[styles.shelfTitle, { marginHorizontal: 0, marginBottom: 0 }]}>Continue Watching</Text>
    <TouchableOpacity onPress={handleClearAll}>
      <Text style={{ color: "#FF334B", fontSize: 12, fontWeight: "700" }}>Clear All</Text>
    </TouchableOpacity>
  </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.shelfList}>
                {continueWatching.map((item, idx) => {
                  const poster = item.poster_path?.startsWith("http")
                    ? item.poster_path
                    : item.poster_path
                    ? IMAGE_URL + item.poster_path
                    : "https://via.placeholder.com/300x450";

                  return (
                    <View key={"cw-" + (item.id || idx)} style={styles.cwCard}>
    <TouchableOpacity
      style={{ position: "absolute", top: 4, right: 4, zIndex: 10, padding: 2 }}
      onPress={() => handleRemoveItem(item.id || item.mal_id)}
    >
      <Ionicons name="close-circle" size={18} color="#FFF" />
    </TouchableOpacity>
    <TouchableOpacity
      style={{ flex: 1 }}
      activeOpacity={0.85}
      onPress={() => navigation.navigate("PlayerScreen", { media: item })}
    >
                      <Image source={{ uri: poster }} style={styles.cwPoster} />
                      <View style={styles.cwOverlay}>
                        <View style={styles.cwPlayCircle}>
                          <Ionicons name="play" size={16} color="#FFF" />
                        </View>
                      </View>
                      <Text style={styles.cardTitle} numberOfLines={1}>
                        {item.title || item.name}
                      </Text>
                      {item.lastEpisode ? (
                        <Text style={styles.cardSub}>EP {item.lastEpisode}</Text>
                      ) : null}
                    </TouchableOpacity>
</View>
);})}
</ScrollView>
            </View>
          )}

          {/* Trending Movies Shelf */}
          <View style={styles.shelfSection}>
            <Text style={styles.shelfTitle}>Trending Movies</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.shelfList}>
              {trending.map((item, idx) => {
                const poster = item.poster_path ? IMAGE_URL + item.poster_path : "https://via.placeholder.com/300x450";
                return (
                  <TouchableOpacity
                    key={"trend-" + (item.id || idx)}
                    style={styles.mediaCard}
                    activeOpacity={0.85}
                    onPress={() => navigation.navigate("DetailsScreen", { media: item })}
                  >
                    <Image source={{ uri: poster }} style={styles.cardPoster} />
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {item.title || item.name}
                    </Text>
                    <Text style={styles.cardSub}>{item.release_date?.split("-")[0] || "Movie"}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Top Airing Anime Shelf */}
          <View style={styles.shelfSection}>
            <Text style={styles.shelfTitle}>Top Airing Anime</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.shelfList}>
              {anime.map((item, idx) => {
                const poster = item.poster_path || "https://via.placeholder.com/300x450";
                return (
                  <TouchableOpacity
                    key={"anime-" + (item.mal_id || idx)}
                    style={styles.mediaCard}
                    activeOpacity={0.85}
                    onPress={() => navigation.navigate("DetailsScreen", { media: item })}
                  >
                    <Image source={{ uri: poster }} style={styles.cardPoster} />
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {item.title || item.name}
                    </Text>
                    <Text style={styles.cardSub}>Anime</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0E" },
  loaderContainer: { flex: 1, backgroundColor: "#0A0A0E", justifyContent: "center", alignItems: "center" },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  brandGroup: { flexDirection: "row", alignItems: "center" },
  brandTitle: { color: "#FFF", fontSize: 20, fontWeight: "900", letterSpacing: 1 },
  brandSub: { color: "#FF334B", fontSize: 20, fontWeight: "900", letterSpacing: 1, marginLeft: 2 },
  searchIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#161622",
    justifyContent: "center",
    alignItems: "center",
  },
  shelfSection: { marginTop: 24 },
  shelfTitle: { color: "#FFF", fontSize: 17, fontWeight: "800", marginHorizontal: 20, marginBottom: 12 },
  shelfList: { paddingHorizontal: 20, gap: 12 },
  mediaCard: { width: 120 },
  cardPoster: { width: 120, height: 170, borderRadius: 12, backgroundColor: "#161622" },
  cardTitle: { color: "#FFF", fontSize: 13, fontWeight: "600", marginTop: 6 },
  cardSub: { color: "#7E7E8E", fontSize: 11, marginTop: 2 },
  cwCard: { width: 140 },
  cwPoster: { width: 140, height: 95, borderRadius: 12, backgroundColor: "#161622" },
  cwOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 140,
    height: 95,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  cwPlayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,51,75,0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
});
