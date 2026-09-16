import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import * as ScreenOrientation from "expo-screen-orientation";
import LoadingPanel from "../components/Common/LoadingPanel";

const SERVERS = [
  {
    id: "vidsrc_pm",
    name: "VidSrc (Primary)",
    getUrl: (id, season, episode, isTv) =>
      isTv
        ? "https://vidsrc.pm/embed/tv/" + id + "/" + season + "/" + episode
        : "https://vidsrc.pm/embed/movie/" + id,
  },
  {
    id: "vidlink",
    name: "VidLink",
    getUrl: (id, season, episode, isTv) =>
      isTv
        ? "https://vidlink.pro/tv/" + id + "/" + season + "/" + episode + "?primaryColor=ff334b"
        : "https://vidlink.pro/movie/" + id + "?primaryColor=ff334b",
  },
  {
    id: "vidsrc_xyz",
    name: "VidSrc XYZ",
    getUrl: (id, season, episode, isTv) =>
      isTv
        ? "https://vidsrc.xyz/embed/tv?tmdb=" + id + "&season=" + season + "&episode=" + episode
        : "https://vidsrc.xyz/embed/movie?tmdb=" + id,
  },
  {
    id: "twoembed",
    name: "2Embed",
    getUrl: (id, season, episode, isTv) =>
      isTv
        ? "https://www.2embed.cc/embedtv/" + id + "&s=" + season + "&e=" + episode
        : "https://www.2embed.cc/embed/" + id,
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
    params.seasonNumber
  );

  const seasonNumber = params.seasonNumber || 1;
  const episodeNumber = params.episodeNumber || 1;

  const [activeServerIndex, setActiveServerIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const webViewRef = useRef(null);

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

  const handleShouldStartLoad = (request) => {
    const { url } = request;
    // Allow internal payloads and active stream mirrors
    if (
      url.startsWith("data:") ||
      url.startsWith("about:") ||
      url.startsWith("blob:") ||
      url.includes("vidlink") ||
      url.includes("vidsrc") ||
      url.includes("2embed")
    ) {
      return true;
    }
    // Block intent redirects, app store redirects, and aggressive popunder tabs
    if (
      url.startsWith("intent:") ||
      url.startsWith("market:") ||
      url.startsWith("android-app:") ||
      (!url.startsWith("http://") && !url.startsWith("https://"))
    ) {
      return false;
    }
    return true;
  };

  const handleSwitchServer = (idx) => {
    setHasError(false);
    setIsLoading(true);
    setActiveServerIndex(idx);
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

  const currentUrl = SERVERS[activeServerIndex].getUrl(
    resolvedMediaId,
    seasonNumber,
    episodeNumber,
    isTv
  );

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      <View style={styles.playerContainer}>
        {hasError ? (
          <View style={styles.fallbackOverlay}>
            <Ionicons name="cloud-offline-outline" size={46} color="#FF334B" />
            <Text style={styles.fallbackTitle}>Playback Blocked or Offline</Text>
            <Text style={styles.fallbackSub}>
              {SERVERS[activeServerIndex].name} failed to stream. Choose another provider above.
            </Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => {
                const next = (activeServerIndex + 1) % SERVERS.length;
                handleSwitchServer(next);
              }}
            >
              <Text style={styles.retryBtnText}>Switch to Next Server</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <WebView
              ref={webViewRef}
              key={currentUrl}
              source={{
                uri: currentUrl,
                headers: {
                  Referer: "https://vidsrc.pm/",
                  Origin: "https://vidsrc.pm",
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
              allowsInlineMediaPlayback={true}
              mediaPlaybackRequiresUserAction={false}
              setSupportMultipleWindows={false}
              allowsFullscreenVideo={true}
              mixedContentMode="always"
              originWhitelist={["*"]}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
            />
            {isLoading ? (
              <LoadingPanel
                message={"Buffering " + SERVERS[activeServerIndex].name}
                subMessage="Bypassing ads & fetching media stream..."
              />
            ) : null}
          </>
        )}
      </View>

      {/* Floating Header Controls */}
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
