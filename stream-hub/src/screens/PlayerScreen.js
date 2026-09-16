import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
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
        ? `https://vidlink.pro/tv/${id}/${season}/${episode}`
        : `https://vidlink.pro/movie/${id}`,
  },
  {
    id: "vidsrc_cc",
    name: "VidSrc CC",
    getUrl: (id, season, episode, isTv) =>
      isTv
        ? `https://vidsrc.cc/v2/embed/tv/${id}/${season}/${episode}`
        : `https://vidsrc.cc/v2/embed/movie/${id}`,
  },
  {
    id: "vidsrc_xyz",
    name: "VidSrc XYZ",
    getUrl: (id, season, episode, isTv) =>
      isTv
        ? `https://vidsrc.xyz/embed/tv?tmdb=${id}&season=${season}&episode=${episode}`
        : `https://vidsrc.xyz/embed/movie?tmdb=${id}`,
  },
];

export default function PlayerScreen({ route, navigation }) {
  const params = route?.params || {};
  
  // Safe resolution across various naming formats (id, mediaId, item.id)
  const resolvedId = params.mediaId || params.id || params.item?.id;
  const isTv = Boolean(params.isTv || params.mediaType === "tv" || params.item?.name);
  
  const [activeServerIndex, setActiveServerIndex] = useState(0);
  const [currentSeason, setCurrentSeason] = useState(params.seasonNumber || 1);
  const [currentEpisode, setCurrentEpisode] = useState(params.episodeNumber || 1);
  const [showEpisodesDrawer, setShowEpisodesDrawer] = useState(false);

  // Default array of fallback episode numbers if dynamic array is omitted
  const episodesList = params.episodes?.length 
    ? params.episodes 
    : Array.from({ length: 24 }, (_, i) => ({ episode_number: i + 1, name: `Episode ${i + 1}` }));

  useEffect(() => {
    async function lockLandscape() {
      try {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      } catch (err) {
        console.warn("ScreenOrientation lock error:", err);
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
    if (url.startsWith("intent:") || url.startsWith("market:") || url.startsWith("android-app:")) {
      return false;
    }
    return true;
  };

  const currentUrl = resolvedId 
    ? SERVERS[activeServerIndex].getUrl(resolvedId, currentSeason, currentEpisode, isTv)
    : "about:blank";

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* Video Stream Runtime */}
      <View style={styles.playerContainer}>
        {resolvedId ? (
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
        ) : (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Invalid Media ID</Text>
          </View>
        )}
      </View>

      {/* Floating Top Controls */}
      <SafeAreaView style={styles.topBarOverlay} pointerEvents="box-none">
        <TouchableOpacity
          style={styles.backCircle}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.rightControlGroup}>
          {/* Episodes Drawer Toggle Button (Only for TV series) */}
          {isTv && (
            <TouchableOpacity
              style={[styles.episodesToggleBtn, showEpisodesDrawer && styles.episodesToggleBtnActive]}
              onPress={() => setShowEpisodesDrawer((prev) => !prev)}
            >
              <Ionicons name="list" size={16} color="#FFFFFF" />
              <Text style={styles.episodesToggleText}>
                S{currentSeason}:E{currentEpisode}
              </Text>
            </TouchableOpacity>
          )}

          {/* Server Selectors */}
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
        </View>
      </SafeAreaView>

      {/* Slide-over Episode Drawer for Landscape */}
      {showEpisodesDrawer && isTv && (
        <View style={styles.episodeDrawer}>
          <View style={styles.drawerHeader}>
            <Text style={styles.drawerTitle}>Season {currentSeason} Episodes</Text>
            <TouchableOpacity onPress={() => setShowEpisodesDrawer(false)}>
              <Ionicons name="close" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.drawerScrollList} showsVerticalScrollIndicator={false}>
            {episodesList.map((ep) => {
              const epNum = ep.episode_number || ep;
              const isSelected = currentEpisode === epNum;
              return (
                <TouchableOpacity
                  key={epNum}
                  style={[styles.drawerEpCard, isSelected && styles.drawerEpCardActive]}
                  onPress={() => {
                    setCurrentEpisode(epNum);
                    setShowEpisodesDrawer(false);
                  }}
                >
                  <Text style={[styles.drawerEpNumber, isSelected && styles.drawerEpNumberActive]}>
                    EP {epNum}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={[styles.drawerEpTitle, isSelected && styles.drawerEpTitleActive]}
                  >
                    {ep.name || `Episode ${epNum}`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}
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
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    color: "#FF334B",
    fontSize: 16,
    fontWeight: "700",
  },
  topBarOverlay: {
    position: "absolute",
    top: 14,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 100,
  },
  backCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(10, 10, 14, 0.8)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  rightControlGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  episodesToggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(20, 20, 28, 0.85)",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  episodesToggleBtnActive: {
    backgroundColor: "#FF334B",
    borderColor: "#FF334B",
  },
  episodesToggleText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  serverRow: {
    flexDirection: "row",
    gap: 6,
    backgroundColor: "rgba(10, 10, 14, 0.8)",
    padding: 3,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  serverChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  serverChipActive: {
    backgroundColor: "#FF334B",
  },
  serverChipText: {
    color: "#8E8E93",
    fontSize: 11,
    fontWeight: "700",
  },
  serverChipTextActive: {
    color: "#FFFFFF",
  },
  episodeDrawer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    width: 280,
    backgroundColor: "rgba(10, 10, 14, 0.95)",
    zIndex: 200,
    padding: 16,
    borderLeftWidth: 1,
    borderLeftColor: "rgba(255, 255, 255, 0.1)",
  },
  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
  },
  drawerTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  drawerScrollList: {
    paddingVertical: 10,
    gap: 8,
  },
  drawerEpCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#161620",
    gap: 10,
  },
  drawerEpCardActive: {
    backgroundColor: "#FF334B",
  },
  drawerEpNumber: {
    color: "#8E8E93",
    fontSize: 11,
    fontWeight: "800",
  },
  drawerEpNumberActive: {
    color: "#FFFFFF",
  },
  drawerEpTitle: {
    color: "#E5E5EA",
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
  drawerEpTitleActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
