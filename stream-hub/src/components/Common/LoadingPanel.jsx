import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function LoadingPanel({ message = "Connecting to stream...", subMessage = "Optimizing media buffers..." }) {
  const pulseAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.6,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.card, { opacity: pulseAnim }]}>
        <View style={styles.iconCircle}>
          <Ionicons name="film" size={28} color="#FF334B" />
        </View>
        <ActivityIndicator size="large" color="#FF334B" style={styles.spinner} />
        <Text style={styles.title}>{message}</Text>
        {subMessage ? <Text style={styles.subtitle}>{subMessage}</Text> : null}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#06060A",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 50,
  },
  card: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderRadius: 16,
    backgroundColor: "rgba(22, 22, 30, 0.7)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "rgba(255, 51, 75, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  spinner: {
    marginBottom: 14,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  subtitle: {
    color: "#8E8E93",
    fontSize: 12,
    marginTop: 4,
  },
});
