import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, Feather } from "@expo/vector-icons";
import { IMAGE_BASE_URL } from "../services/api";
import { getWatchlist, toggleWatchlist } from "../services/storage";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const BACKDROP_HEIGHT = SCREEN_WIDTH * 1.15;
const IMAGE_URL = IMAGE_BASE_URL || "https://image.tmdb.org/t/p/w500";

export default function DetailsScreen({ route, navigation }) {
  const media = route?.params?.media || {};
  const [isBookmarked, setIsBookmarked] = useState(false);

  const title = media.title || media.name || "Untitled Media";
  const releaseYear =
    media.release_date?.split("-")[0] ||
    media.first_air_date?.split("-")[0] ||
    media.year ||
    "2026";
  const rating = Number(media.vote_average || media.score || 7.5).toFixed(1);
  const overview =
    media.overview ||
    media.synopsis ||
    "No storyline available for this title yet. Tap Play to start streaming.";

  const posterUri = media.poster_path?.startsWith("http")
    ? media.poster_path
    : media.poster_path
    ? IMAGE_URL + media.poster_path
    : media.images?.jpg?.large_image_url || "https://via.placeholder.com/500x750";

  const backdropUri = media.backdrop_path
    ? IMAGE_URL + media.backdrop_path
    : posterUri;

  useEffect(() => {
    checkBookmark();
  }, [media.id, media.mal_id]);

  const checkBookmark = async () => {
    try {
      if (typeof getWatchlist === "function") {
        const list = await getWatchlist();
        const id = media.id || media.mal_id;
        setIsBookmarked(list.some((item) => (item.id || item.mal_id) === id));
      }
    } catch (e) {
      console.warn("Bookmark check error:", e);
    }
  };

  const handleBookmarkToggle = async () => {
    try {
      if (typeof toggleWatchlist === "function") {
        const added = await toggleWatchlist(media);
        setIsBookmarked(added);
      } else {
        setIsBookmarked(!isBookmarked);
      }
    } catch (e) {
      console.warn("Bookmark toggle error:", e);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Backdrop Image & Gradient */}
        <View style={styles.heroWrapper}>
          <Image source={{ uri: backdropUri }} style={styles.backdropImage} />
          <LinearGradient
            colors={["rgba(10,10,14,0.3)", "rgba(10,10,14,0.7)", "#0A0A0E"]}
            locations={[0.2, 0.7, 1]}
            style={StyleSheet.absoluteFillObject}
          />

          {/* Top Bar Controls */}
          <SafeAreaView style={styles.headerBar}>
            <TouchableOpacity style={styles.iconCircle} onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={22} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconCircle} onPress={handleBookmarkToggle}>
              <Ionicons
                name={isBookmarked ? "bookmark" : "bookmark-outline"}
                size={20}
                color={isBookmarked ? "#FF334B" : "#FFF"}
              />
            </TouchableOpacity>
          </SafeAreaView>
        </View>

        {/* Content Section */}
        <View style={styles.contentContainer}>
          <Text style={styles.mediaTitle}>{title}</Text>

          <View style={styles.tagsRow}>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={13} color="#FFB800" />
              <Text style={styles.ratingText}>{rating}</Text>
            </View>
            <View style={styles.pillBadge}>
              <Text style={styles.pillText}>{releaseYear}</Text>
            </View>
            <View style={styles.pillBadge}>
              <Text style={styles.pillText}>4K ULTRA HD</Text>
            </View>
            <View style={styles.pillBadge}>
              <Text style={styles.pillText}>
                {media.isAnime ? "ANIME" : media.media_type === "tv" ? "TV SHOW" : "MOVIE"}
              </Text>
            </View>
          </View>

          {/* Action Row */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.playButton}
              activeOpacity={0.85}
              onPress={() => navigation.navigate("PlayerScreen", { media })}
            >
              <LinearGradient
                colors={["#FF4D64", "#D81B34"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.playGradient}
              >
                <Ionicons name="play" size={22} color="#FFF" style={{ marginRight: 6 }} />
                <Text style={styles.playText}>Play Now</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.bookmarkBtn} onPress={handleBookmarkToggle}>
              <Feather
                name={isBookmarked ? "check" : "plus"}
                size={22}
                color={isBookmarked ? "#FF334B" : "#FFF"}
              />
            </TouchableOpacity>
          </View>

          {/* Storyline */}
          <View style={styles.synopsisSection}>
            <Text style={styles.sectionHeader}>Storyline</Text>
            <Text style={styles.overviewText}>{overview}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0E" },
  heroWrapper: { width: SCREEN_WIDTH, height: BACKDROP_HEIGHT },
  backdropImage: { width: "100%", height: "100%", resizeMode: "cover" },
  headerBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(22,22,32,0.75)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  contentContainer: { paddingHorizontal: 20, marginTop: -32 },
  mediaTitle: { color: "#FFFFFF", fontSize: 26, fontWeight: "800", letterSpacing: 0.3 },
  tagsRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12, flexWrap: "wrap" },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,184,0,0.15)",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,184,0,0.3)",
  },
  ratingText: { color: "#FFB800", fontSize: 12, fontWeight: "700", marginLeft: 4 },
  pillBadge: {
    backgroundColor: "#161622",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#232332",
  },
  pillText: { color: "#8E8E9E", fontSize: 11, fontWeight: "700" },
  actionRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 22 },
  playButton: { flex: 1, height: 52, borderRadius: 26, overflow: "hidden" },
  playGradient: { flex: 1, flexDirection: "row", justifyContent: "center", alignItems: "center" },
  playText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  bookmarkBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#161622",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#242434",
  },
  synopsisSection: { marginTop: 26 },
  sectionHeader: { color: "#FFF", fontSize: 17, fontWeight: "700", marginBottom: 10 },
  overviewText: { color: "#9E9EB0", fontSize: 14, lineHeight: 22 },
});
