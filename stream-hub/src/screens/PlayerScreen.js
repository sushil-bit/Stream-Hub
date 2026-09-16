import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  FlatList,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import * as ScreenOrientation from "expo-screen-orientation";
import LoadingPanel from "../components/Common/LoadingPanel";

// High-uptime embed mirrors with direct iframe support
const SERVERS = [
  {
    id: "vidsrc_net",
    name: "VidSrc VIP",
    getUrl: (id, season, episode, isTv) =>
      isTv
        ? `https://vidsrc.net/embed/tv/${id}/${season}/${episode}`
        : `https://vidsrc.net/embed/movie/${id}`,
  },
  {
    id: "vidlink",
    name: "VidLink",
    getUrl: (id, season, episode, isTv) =>
      isTv
        ? `https://vidlink.pro/tv/${id}/${season}/${episode}`
        : `https://vidlink.pro/movie/${id}`,
  },
  {
    id: "superembed",
    name: "SuperEmbed",
    getUrl: (id, season, episode, isTv) =>
      isTv
        ? `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${season}&e=${episode}`
        : `https://multiembed.mov/?video_id=${id}&tmdb=1`,
  },
  {
    id: "vidsrc_pm",
    name: "VidSrc PM",
    getUrl: (id, season, episode, isTv) =>
      isTv
        ? `https://vidsrc.pm/embed/tv/${id}/${season}/${episode}`
        : `https://vidsrc.pm/embed/movie/${id}`,
  },
];

export default function PlayerScreen({ route, navigation }) {
  const params = route?.params || {};
  const mediaObj = params.media || params.item || params;

  const resolvedMediaId =
    mediaObj.id ||
    params.mediaId ||
    params.id ||
    params.tmdbId;

  const isTv = Boolean(
    mediaObj.media_type === "tv" ||
    params.isTv ||
    params.mediaType === "tv" ||
    params.seasonNumber ||
    params.episodes?.length
  );

  const [activeServerIndex, setActiveServerIndex] = useState(0);
  const [currentSeason, setCurrentSeason] = useState(params.seasonNumber || 1);
  const [currentEpisode, setCurrentEpisode] = useState(params.episodeNumber || 1);
  const [showEpisodesDrawer, setShowEpisodesDrawer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const webViewRef = useRef(null);

  const episodesList = params.episodes?.length
    ? params.episodes
    : Array.from({ length: 24 }, (_, i) => ({
        episode_number: i + 1,
        name: `Episode ${i + 1}`,
      }));

  useEffect(() => {
    async function lockLandscape() {
      try {
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.LANDSCAPE
        );
      } catch (err) {
        console.warn("ScreenOrientation error:", err);
      }
    }
    lockLandscape();

    return () => {
      ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP
      ).catch(() => {});
    };
  }, []);

  const handleSwitchServer = (idx) => {
    setHasError(false);
    setIsLoading(true);
    setActiveServerIndex(idx);
  };

  const handleSelectEpisode = (epNum) => {
    setCurrentEpisode(epNum);
    setShowEpisodesDrawer(false);
    setIsLoading(true);
  };

  // Allow all subframe loads (m3u8, chunk CDNs, blob URIs) but block external intent popups
  const handleShouldStartLoad = (request) => {
    const { url } = request;
    if (
      url.startsWith("intent:") ||
      url.startsWith("market:") ||
      url.startsWith("android-app:") ||
      url.startsWith("snssdk") ||
      url.startsWith("vnd.youtube:")
    ) {
      return false;
    }
    return true;
  };

  if (!resolvedMediaId) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar hidden />
        <Ionicons name="alert-circle-outline" size={48} color="#FF334B" />
        <Text style={styles.errorText}>Missing Media Identifier</Text>
        <TouchableOpacity
          style={styles.errorButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.errorButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const embedUrl = SERVERS[activeServerIndex].getUrl(
    resolvedMediaId,
    currentSeason,
    currentEpisode,
    isTv
  );

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      <View style={styles.playerContainer}>
        {hasError ? (
          <View style={styles.fallbackOverlay}>
            <Ionicons name="cloud-offline-outline" size={46} color="#FF334B" />
            <Text style={styles.fallbackTitle}>Server Blocked or Offline</Text>
            <Text style={styles.fallbackSub}>
              {SERVERS[activeServerIndex].name} failed. Tap below to cycle providers.
            </Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => {
                const next = (activeServerIndex + 1) % SERVERS.length;
                handleSwitchServer(next);
              }}
            >
              <Text style={styles.retryBtnText}>Try Next Provider</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <WebView
              ref={webViewRef}
              key={`${embedUrl}-${activeServerIndex}`}
              source={{
                uri: embedUrl,
                headers: {
                  "Referer": "https://vidsrc.net/",
                  "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                },
              }}
              style={styles.webview}
              onShouldStartLoadWithRequest={handleShouldStartLoad}
              onLoadStart={() => setIsLoading(true)}
              onLoadEnd={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setHasError(true);
              }}
              // CRITICAL: Unblock video stream playback & storage
              javaScriptEnabled={true}
              domStorageEnabled={true}
              databaseEnabled={true}
              thirdPartyCookiesEnabled={true}
              sharedCookiesEnabled={true}
              allowsInlineMediaPlayback={true}
              mediaPlaybackRequiresUserAction={false}
              setSupportMultipleWindows={false}
              allowsFullscreenVideo={true}
              mixedContentMode="always"
              originWhitelist={["*"]}
              androidHardwareAccelerationDisabled={false}
              userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
            />
            {isLoading ? (
              <LoadingPanel
                message={`Connecting to ${SERVERS[activeServerIndex].name}...`}
                subMessage={isTv ? `Buffering S${currentSeason}:E${currentEpisode}` : "Fetching stream buffers..."}
              />
            ) : null}
          </>
        )}
      </View>

      {/* Floating Header Controls */}
      <SafeAreaView style={styles.topBarOverlay} pointerEvents="box-none">
        <View style={styles.leftGroup}>
          <TouchableOpacity
            style={styles.backCircle}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          {isTv && (
            <TouchableOpacity
              style={styles.episodesToggleBtn}
              onPress={() => setShowEpisodesDrawer(!showEpisodesDrawer)}
            >
              <Ionicons name="layers-outline" size={16} color="#FFFFFF" />
              <Text style={styles.episodesToggleText}>
                S{currentSeason}:E{currentEpisode}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Server Switcher */}
        <View style={styles.serverRow}>
          {SERVERS.map((server, idx) => {
            const isActive = activeServerIndex === idx;
            return (
              <TouchableOpacity
                key={server.id}
                style={[styles.serverChip, isActive && styles.serverChipActive]}
                onPress={() => handleSwitchServer(idx)}
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

      {/* Horizontal Episode Picker */}
      {isTv && showEpisodesDrawer && (
        <View style={styles.drawerContainer}>
          <View style={styles.drawerHeader}>
            <Text style={styles.drawerTitle}>Select Episode</Text>
            <TouchableOpacity onPress={() => setShowEpisodesDrawer(false)}>
              <Ionicons name="close" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={episodesList}
            keyExtractor={(item) => String(item.episode_number)}
            contentContainerStyle={styles.episodeListContainer}
            renderItem={({ item }) => {
              const epNum = item.episode_number;
              const isSelected = currentEpisode === epNum;
              return (
                <TouchableOpacity
                  style={[
                    styles.episodeCard,
                    isSelected && styles.episodeCardSelected,
                  ]}
                  onPress={() => handleSelectEpisode(epNum)}
                >
                  <Text
                    style={[
                      styles.episodeCardNumber,
                      isSelected && styles.episodeCardNumberSelected,
                    ]}
                  >
                    EP {epNum}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.episodeCardName,
                      isSelected && styles.episodeCardNameSelected,
                    ]}
                  >
                    {item.name || `Episode ${epNum}`}
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
  fallbackOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#0A0A0E",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
    gap: 10,
    zIndex: 60,
  },
  fallbackTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  fallbackSub: {
    color: "#8E8E93",
    fontSize: 13,
    textAlign: "center",
  },
  retryBtn: {
    marginTop: 10,
    backgroundColor: "#FF334B",
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
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
  leftGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
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
  episodesToggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(10, 10, 14, 0.75)",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  episodesToggleText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
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
    paddingHorizontal: 12,
    paddingVertical: 6,
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
  drawerContainer: {
    position: "absolute",
    bottom: 16,
    left: 20,
    right: 20,
    backgroundColor: "rgba(14, 14, 20, 0.95)",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    zIndex: 999,
  },
  drawerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  drawerTitle: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  episodeListContainer: {
    gap: 8,
  },
  episodeCard: {
    width: 90,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  episodeCardSelected: {
    backgroundColor: "#FF334B",
    borderColor: "#FF334B",
  },
  episodeCardNumber: {
    color: "#8E8E93",
    fontSize: 11,
    fontWeight: "700",
  },
  episodeCardNumberSelected: {
    color: "#FFFFFF",
  },
  episodeCardName: {
    color: "#AAAAAA",
    fontSize: 10,
    marginTop: 2,
  },
  episodeCardNameSelected: {
    color: "#FFFFFF",
  },
  errorContainer: {
    flex: 1,
    backgroundColor: "#0A0A0E",
    justifyContent: "center",
    alignItems: "center",
    gap: 14,
  },
  errorText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  errorButton: {
    backgroundColor: "#1C1C26",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  errorButtonText: {
    color: "#FF334B",
    fontWeight: "700",
  },
});
