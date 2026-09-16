import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import * as ScreenOrientation from "expo-screen-orientation";

const SERVERS = [
  {
    id: "vidlink",
    name: "VidLink",
    getUrl: (id, season, episode, isTv) =>
      isTv
        ? "https://vidlink.pro/tv/" + id + "/" + season + "/" + episode
        : "https://vidlink.pro/movie/" + id,
  },
  {
    id: "vidsrc_cc",
    name: "VidSrc CC",
    getUrl: (id, season, episode, isTv) =>
      isTv
        ? "https://vidsrc.cc/v2/embed/tv/" + id + "/" + season + "/" + episode
        : "https://vidsrc.cc/v2/embed/movie/" + id,
  },
  {
    id: "embedsu",
    name: "EmbedSu",
    getUrl: (id, season, episode, isTv) =>
      isTv
        ? "https://embed.su/embed/tv/" + id + "/" + season + "/" + episode
        : "https://embed.su/embed/movie/" + id,
  },
];

export default function PlayerScreen({ route, navigation }) {
  const {
    mediaId,
    title,
    isTv = false,
    seasonNumber = 1,
    episodeNumber = 1,
  } = route?.params || {};

  const [activeServerIndex, setActiveServerIndex] = useState(0);

  useEffect(() => {
    async function lockLandscape() {
      try {
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.LANDSCAPE
        );
      } catch (err) {
        console.warn("Orientation lock error:", err);
      }
    }
    lockLandscape();

    return () => {
      ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP
      ).catch(() => {});
    };
  }, []);

  const handleShouldStartLoad = (request) => {
    const { url } = request;
    if (
      url.startsWith("data:") ||
      url.startsWith("about:") ||
      url.startsWith("blob:")
    ) {
      return true;
    }
    if (
      url.startsWith("intent:") ||
      url.startsWith("market:") ||
      url.startsWith("android-app:")
    ) {
      return false;
    }
    return true;
  };

  const currentUrl = SERVERS[activeServerIndex].getUrl(
    mediaId,
    seasonNumber,
    episodeNumber,
    isTv
  );

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      <View style={styles.playerContainer}>
        <WebView
          source={{ uri: currentUrl }}
          style={styles.webview}
          onShouldStartLoadWithRequest={handleShouldStartLoad}
          setSupportMultipleWindows={false}
          allowsFullscreenVideo={true}
          originWhitelist={["*"]}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      </View>

      <SafeAreaView style={styles.topBarOverlay} pointerEvents="box-none">
        <TouchableOpacity
          style={styles.backCircle}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.serverRow}>
          {SERVERS.map((server, idx) => {
            const isActive = activeServerIndex === idx;
            return (
              <TouchableOpacity
                key={server.id}
                style={[styles.serverChip, isActive && styles.serverChipActive]}
                onPress={() => setActiveServerIndex(idx)}
              >
                <Text
                  style={[
                    styles.serverChipText,
                    isActive && styles.serverChipTextActive,
                  ]}
                >
                  {server.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  playerContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000000",
  },
  webview: {
    flex: 1,
    backgroundColor: "#000000",
  },
  topBarOverlay: {
    position: "absolute",
    top: 14,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 999,
  },
  backCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(10, 10, 14, 0.75)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  serverRow: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: "rgba(10, 10, 14, 0.75)",
    padding: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  serverChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
  },
  serverChipActive: {
    backgroundColor: "#FF334B",
  },
  serverChipText: {
    color: "#8E8E93",
    fontSize: 12,
    fontWeight: "700",
  },
  serverChipTextActive: {
    color: "#FFFFFF",
  },
});
