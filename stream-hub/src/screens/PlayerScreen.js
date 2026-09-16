import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import * as ScreenOrientation from "expo-screen-orientation";

const SERVERS = [
  {
    id: "vidlink",
    name: "VidLink",
    getUrl: (id, season, episode, isTv) =>
      isTv
        ? \`https://vidlink.pro/tv/\${id}/\${season}/\${episode}\`
        : \`https://vidlink.pro/movie/\${id}\`,
  },
  {
    id: "vidsrc_cc",
    name: "VidSrc CC",
    getUrl: (id, season, episode, isTv) =>
      isTv
        ? \`https://vidsrc.cc/v2/embed/tv/\${id}/\${season}/\${episode}\`
        : \`https://vidsrc.cc/v2/embed/movie/\${id}\`,
  },
  {
    id: "vidsrc_icu",
    name: "VidSrc ICU",
    getUrl: (id, season, episode, isTv) =>
      isTv
        ? \`https://vidsrc.icu/embed/tv/\${id}/\${season}/\${episode}\`
        : \`https://vidsrc.icu/embed/movie/\${id}\`,
  },
  {
    id: "autoembed",
    name: "AutoEmbed",
    getUrl: (id, season, episode, isTv) =>
      isTv
        ? \`https://player.autoembed.cc/embed/tv/\${id}/\${season}/\${episode}\`
        : \`https://player.autoembed.cc/embed/movie/\${id}\`,
  },
];

const DESKTOP_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

export default function PlayerScreen({ route, navigation }) {
  const params = route?.params || {};
  const mediaId = params.mediaId || params.id;
  const isTv = Boolean(params.isTv || params.media_type === "tv" || params.seasonNumber);
  
  const [currentSeason, setCurrentSeason] = useState(params.seasonNumber || 1);
  const [currentEpisode, setCurrentEpisode] = useState(params.episodeNumber || 1);
  const [activeServerIndex, setActiveServerIndex] = useState(0);
  const [showEpisodes, setShowEpisodes] = useState(false);
  const [loading, setLoading] = useState(true);

  const episodesList = params.episodes && params.episodes.length > 0 
    ? params.episodes 
    : Array.from({ length: 24 }, (_, i) => ({ episode_number: i + 1, name: \`Episode \${i + 1}\` }));

  useEffect(() => {
    async function lockLandscape() {
      try {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      } catch (err) {
        console.warn(err);
      }
    }
    lockLandscape();

    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => {});
    };
  }, []);

  const handleShouldStartLoad = (request) => {
    const { url } = request;
    if (url.startsWith("data:") || url.startsWith("about:") || url.startsWith("blob:")) {
      return true;
    }
    if (
      url.startsWith("intent:") ||
      url.startsWith("market:") ||
      url.startsWith("android-app:") ||
      url.includes("whomevergooseberry.com")
    ) {
      return false;
    }
    return true;
  };

  const targetUrl = SERVERS[activeServerIndex].getUrl(
    mediaId,
    currentSeason,
    currentEpisode,
    isTv
  );

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      <View style={styles.playerContainer}>
        <WebView
          key={targetUrl}
          source={{
            uri: targetUrl,
            headers: {
              Referer: "https://vidlink.pro/",
            },
          }}
          userAgent={DESKTOP_UA}
          style={styles.webview}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onShouldStartLoadWithRequest={handleShouldStartLoad}
          setSupportMultipleWindows={false}
          allowsFullscreenVideo={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
        {loading && (
          <View style={styles.loaderOverlay}>
            <ActivityIndicator size="large" color="#FF334B" />
          </View>
        )}
      </View>

      {/* Floating Top Controls */}
      <SafeAreaView style={styles.topBarOverlay} pointerEvents="box-none">
        <View style={styles.leftRow}>
          <TouchableOpacity
            style={styles.circleBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={20} color="#FFF" />
          </TouchableOpacity>

          {isTv && (
            <TouchableOpacity
              style={styles.episodeToggleBtn}
              onPress={() => setShowEpisodes(!showEpisodes)}
            >
              <Ionicons name="list" size={16} color="#FFF" />
              <Text style={styles.episodeToggleText}>
                S{currentSeason}:E{currentEpisode}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Server Selectors */}
        <View style={styles.serverRow}>
          {SERVERS.map((server, idx) => (
            <TouchableOpacity
              key={server.id}
              style={[
                styles.serverChip,
                activeServerIndex === idx && styles.serverChipActive,
              ]}
              onPress={() => setActiveServerIndex(idx)}
            >
              <Text
                style={[
                  styles.serverChipText,
                  activeServerIndex === idx && styles.serverChipTextActive,
                ]}
              >
                {server.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>

      {/* Episode Drawer */}
      {showEpisodes && isTv && (
        <View style={styles.episodeDrawer}>
          <View style={styles.drawerHeader}>
            <Text style={styles.drawerTitle}>Season {currentSeason} Episodes</Text>
            <TouchableOpacity onPress={() => setShowEpisodes(false)}>
              <Ionicons name="close" size={22} color="#FFF" />
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            data={episodesList}
            keyExtractor={(item) => String(item.episode_number)}
            contentContainerStyle={{ paddingHorizontal: 12, gap: 10 }}
            renderItem={({ item }) => {
              const isSelected = item.episode_number === currentEpisode;
              return (
                <TouchableOpacity
                  style={[
                    styles.episodeCard,
                    isSelected && styles.episodeCardSelected,
                  ]}
                  onPress={() => {
                    setCurrentEpisode(item.episode_number);
                    setShowEpisodes(false);
                  }}
                >
                  <Text
                    style={[
                      styles.episodeCardText,
                      isSelected && styles.episodeCardTextSelected,
                    ]}
                  >
                    EP {item.episode_number}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  playerContainer: { ...StyleSheet.absoluteFillObject, backgroundColor: "#000" },
  webview: { flex: 1, backgroundColor: "#000" },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  topBarOverlay: {
    position: "absolute",
    top: 10,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 999,
  },
  leftRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  circleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(10, 10, 14, 0.8)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  episodeToggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(10, 10, 14, 0.8)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  episodeToggleText: { color: "#FFF", fontSize: 13, fontWeight: "700" },
  serverRow: {
    flexDirection: "row",
    gap: 6,
    backgroundColor: "rgba(10, 10, 14, 0.8)",
    padding: 4,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  serverChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14 },
  serverChipActive: { backgroundColor: "#FF334B" },
  serverChipText: { color: "#8E8E93", fontSize: 12, fontWeight: "700" },
  serverChipTextActive: { color: "#FFF" },
  episodeDrawer: {
    position: "absolute",
    bottom: 12,
    left: 16,
    right: 16,
    backgroundColor: "rgba(15, 15, 20, 0.95)",
    paddingVertical: 12,
    borderRadius: 16,
    zIndex: 999,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  drawerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  drawerTitle: { color: "#FFF", fontSize: 13, fontWeight: "700" },
  episodeCard: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#202028",
  },
  episodeCardSelected: { backgroundColor: "#FF334B" },
  episodeCardText: { color: "#AAA", fontSize: 12, fontWeight: "700" },
  episodeCardTextSelected: { color: "#FFF" },
});
