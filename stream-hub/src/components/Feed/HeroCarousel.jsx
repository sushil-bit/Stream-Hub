import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  Image,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { IMAGE_BASE_URL } from "../../services/api";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH * 0.72;
const CARD_HEIGHT = CARD_WIDTH * 1.45;
const SPACING = 14;
const SIDE_INSET = (SCREEN_WIDTH - CARD_WIDTH) / 2;
const IMAGE_URL = IMAGE_BASE_URL || "https://image.tmdb.org/t/p/w500";

export default function HeroCarousel({ items = [], onItemPress, onPlayPress }) {
  if (!items.length) return null;

  return (
    <View style={styles.wrapper}>
      <FlatList
        data={items}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + SPACING}
        decelerationRate="fast"
        contentContainerStyle={{
          paddingHorizontal: SIDE_INSET,
        }}
        keyExtractor={(item, index) => (item.id ? String(item.id) : String(index))}
        renderItem={({ item }) => {
          const poster = item.poster_path?.startsWith("http")
            ? item.poster_path
            : item.poster_path
            ? IMAGE_URL + item.poster_path
            : item.images?.jpg?.large_image_url || "https://via.placeholder.com/500x750";

          return (
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.card}
              onPress={() => onItemPress && onItemPress(item)}
            >
              <Image source={{ uri: poster }} style={styles.poster} />
              <LinearGradient
                colors={["transparent", "rgba(10,10,14,0.4)", "#0A0A0E"]}
                locations={[0.4, 0.75, 1]}
                style={StyleSheet.absoluteFillObject}
              />

              <View style={styles.metaContainer}>
                <Text style={styles.title} numberOfLines={1}>
                  {item.title || item.name}
                </Text>
                <View style={styles.tagRow}>
                  <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={11} color="#FFB800" />
                    <Text style={styles.ratingText}>
                      {Number(item.vote_average || 7.5).toFixed(1)}
                    </Text>
                  </View>
                  <Text style={styles.yearText}>
                    {item.release_date?.split("-")[0] || item.year || "2026"}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.playFab}
                onPress={() => onPlayPress && onPlayPress(item)}
              >
                <Ionicons name="play" size={18} color="#FFF" style={{ marginLeft: 2 }} />
              </TouchableOpacity>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginVertical: 10 },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    marginRight: SPACING,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#161622",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  poster: { width: "100%", height: "100%", resizeMode: "cover" },
  metaContainer: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 56,
  },
  title: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  tagRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,184,0,0.2)",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  ratingText: { color: "#FFB800", fontSize: 10, fontWeight: "700", marginLeft: 3 },
  yearText: { color: "#8E8E9E", fontSize: 11, fontWeight: "600" },
  playFab: {
    position: "absolute",
    bottom: 16,
    right: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FF334B",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
});
