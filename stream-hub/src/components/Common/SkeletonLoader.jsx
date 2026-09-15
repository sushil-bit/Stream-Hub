import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function SkeletonLoader({ width = "100%", height = 20, borderRadius = 8, style }) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.75],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: "#1C1C26",
          opacity,
        },
        style,
      ]}
    />
  );
}

export function HomeSkeleton() {
  return (
    <View style={styles.container}>
      {/* Hero Carousel Skeleton */}
      <View style={styles.heroSkeleton}>
        <SkeletonLoader width="75%" height={340} borderRadius={20} />
      </View>

      {/* Row 1: Continue Watching */}
      <View style={styles.shelfSkeleton}>
        <SkeletonLoader width={160} height={20} borderRadius={6} style={{ marginBottom: 12 }} />
        <View style={styles.horizontalRow}>
          <SkeletonLoader width={140} height={95} borderRadius={12} />
          <SkeletonLoader width={140} height={95} borderRadius={12} />
          <SkeletonLoader width={140} height={95} borderRadius={12} />
        </View>
      </View>

      {/* Row 2: Trending Movies */}
      <View style={styles.shelfSkeleton}>
        <SkeletonLoader width={140} height={20} borderRadius={6} style={{ marginBottom: 12 }} />
        <View style={styles.horizontalRow}>
          <SkeletonLoader width={120} height={170} borderRadius={12} />
          <SkeletonLoader width={120} height={170} borderRadius={12} />
          <SkeletonLoader width={120} height={170} borderRadius={12} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0E", paddingVertical: 20 },
  heroSkeleton: { alignItems: "center", marginVertical: 15 },
  shelfSkeleton: { marginTop: 24, paddingHorizontal: 20 },
  horizontalRow: { flexDirection: "row", gap: 12 },
});
