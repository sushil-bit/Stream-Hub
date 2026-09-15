import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { getWatchlist } from "../services/storage";
import { IMAGE_BASE_URL } from "../services/api";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const COLUMN_WIDTH = (SCREEN_WIDTH - 52) / 2;
const IMAGE_URL = IMAGE_BASE_URL || "https://image.tmdb.org/t/p/w500";

export default function WatchlistScreen({ navigation }) {
  const [watchlist, setWatchlist] = useState([]);

  useFocusEffect(
    useCallback(() => {
      loadWatchlist();
    }, [])
  );

  const loadWatchlist = async () => {
    try {
      if (typeof getWatchlist === "function") {
        const list = await getWatchlist();
        setWatchlist(Array.isArray(list) ? list : []);
      }
    } catch (e) {
      console.warn("Watchlist fetch error:", e);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient
        colors={["#2A0912", "#140E14", "#0A0A0E"]}
        locations={[0, 0.35, 0.7]}
        style={StyleSheet.absoluteFillObject}
      />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Watchlist</Text>
          <Text style={styles.headerCount}>{watchlist.length} saved</Text>
        </View>

        <FlatList
          data={watchlist}
          keyExtractor={(item, index) =>
            item.mal_id ? "anime-" + item.mal_id : item.id ? String(item.id) : String(index)
          }
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.gridContainer}
          columnWrapperStyle={styles.columnWrapper}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="bookmark-outline" size={54} color="#30303E" />
              <Text style={styles.emptyTitle}>Your watchlist is empty</Text>
              <Text style={styles.emptySub}>
                Explore movies & anime, then tap the + or bookmark button to save them here.
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const poster = item.poster_path?.startsWith("http")
              ? item.poster_path
              : item.poster_path
              ? IMAGE_URL + item.poster_path
              : item.images?.jpg?.image_url || "https://via.placeholder.com/300x450";

            return (
              <TouchableOpacity
                style={styles.gridCard}
                activeOpacity={0.85}
                onPress={() => navigation.navigate("DetailsScreen", { media: item })}
              >
                <View style={styles.posterWrapper}>
                  <Image source={{ uri: poster }} style={styles.gridPoster} />
                  <LinearGradient
                    colors={["transparent", "rgba(10,10,14,0.7)"]}
                    style={StyleSheet.absoluteFillObject}
                  />
                  {item.vote_average ? (
                    <View style={styles.ratingBadge}>
                      <Ionicons name="star" size={11} color="#FFB800" />
                      <Text style={styles.ratingText}>{Number(item.vote_average).toFixed(1)}</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {item.title || item.name}
                </Text>
                <Text style={styles.cardSubtext}>
                  {item.isAnime ? "Anime" : item.media_type === "tv" ? "TV Show" : "Movie"}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0E" },
  header: {
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: { color: "#FFF", fontSize: 22, fontWeight: "800" },
  headerCount: { color: "#FF334B", fontSize: 13, fontWeight: "600" },
  gridContainer: { paddingHorizontal: 20, paddingBottom: 110 },
  columnWrapper: { justifyContent: "space-between" },
  gridCard: { width: COLUMN_WIDTH, marginBottom: 16 },
  posterWrapper: {
    width: "100%",
    height: COLUMN_WIDTH * 1.45,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#161620",
  },
  gridPoster: { width: "100%", height: "100%", resizeMode: "cover" },
  ratingBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  ratingText: { color: "#FFB800", fontSize: 10, fontWeight: "700", marginLeft: 3 },
  cardTitle: { color: "#FFF", fontSize: 13, fontWeight: "700", marginTop: 6 },
  cardSubtext: { color: "#7E7E8A", fontSize: 11, marginTop: 2 },
  emptyContainer: { alignItems: "center", justifyContent: "center", marginTop: 100, paddingHorizontal: 30 },
  emptyTitle: { color: "#FFF", fontSize: 17, fontWeight: "700", marginTop: 14 },
  emptySub: { color: "#7E7E8A", fontSize: 13, textAlign: "center", marginTop: 6, lineHeight: 20 },
});
