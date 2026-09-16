import React, { memo } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 24 - 16) / 3;
const CARD_HEIGHT = CARD_WIDTH * 1.48;

const UnifiedMediaCard = memo(({ item, onPress }) => {
  if (!item) return null;

  return (
    <TouchableOpacity
      style={styles.cardContainer}
      activeOpacity={0.8}
      onPress={() => onPress && onPress(item)}
    >
      <View style={styles.posterWrapper}>
        <Image
          source={{
            uri:
              item.poster ||
              "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=500",
          }}
          style={styles.poster}
          resizeMode="cover"
        />

        {/* Source Badge */}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {item.source === "jikan"
              ? "ANIME"
              : item.mediaType === "movie"
              ? "MOVIE"
              : "SERIES"}
          </Text>
        </View>

        {/* Rating Overlay */}
        {item.rating && item.rating !== "N/A" && (
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={9} color="#FFB800" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        )}
      </View>

      <Text style={styles.title} numberOfLines={1}>
        {item.title}
      </Text>

      <View style={styles.metaRow}>
        <Text style={styles.metaText}>{item.year}</Text>
        {item.episodes && (
          <>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.metaText}>{item.episodes}</Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
});

export default UnifiedMediaCard;

const styles = StyleSheet.create({
  cardContainer: {
    width: CARD_WIDTH,
    marginBottom: 16,
  },
  posterWrapper: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 10,
    backgroundColor: "#1B1A24",
    overflow: "hidden",
    position: "relative",
  },
  poster: {
    width: "100%",
    height: "100%",
  },
  badge: {
    position: "absolute",
    top: 5,
    left: 5,
    backgroundColor: "rgba(13, 12, 19, 0.82)",
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  badgeText: {
    color: "#DDDDE8",
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  ratingBadge: {
    position: "absolute",
    bottom: 5,
    right: 5,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(13, 12, 19, 0.88)",
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: 4,
    gap: 3,
  },
  ratingText: {
    color: "#FFFFFF",
    fontSize: 9.5,
    fontWeight: "700",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 6,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  metaText: {
    color: "#7E7E8A",
    fontSize: 10,
    fontWeight: "500",
  },
  bullet: {
    color: "#7E7E8A",
    fontSize: 10,
    marginHorizontal: 3,
  },
});
