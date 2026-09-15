import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const PLAYER_HEIGHT = (SCREEN_WIDTH * 9) / 16;

const SERVERS = [
  { id: "vidsrc_sbs", name: "Server 1 (VidSrc Pro)" },
  { id: "vidsrc_me", name: "Server 2 (VidSrc Stream)" },
  { id: "superembed", name: "Server 3 (MultiEmbed)" },
  { id: "twoembed", name: "Server 4 (2Embed Direct)" },
];

export default function PlayerScreen({ route, navigation }) {
  const media = route?.params?.media || {};
  const isTv = media.media_type === "tv" || media.isAnime || !!media.first_air_date;

  const [activeServer, setActiveServer] = useState("vidsrc_sbs");
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [playerLoading, setPlayerLoading] = useState(true);

  const tmdbId = media.id || media.mal_id || "550";

  const getEmbedUrl = () => {
    switch (activeServer) {
      case "vidsrc_sbs":
        return isTv
          ? "https://vidsrc.sbs/embed/tv/" + tmdbId + "/" + season + "/" + episode
          : "https://vidsrc.sbs/embed/movie/" + tmdbId;
      case "vidsrc_me":
        return isTv
          ? "https://vidsrc.me/embed/tv?tmdb=" + tmdbId + "&season=" + season + "&episode=" + episode
          : "https://vidsrc.me/embed/movie?tmdb=" + tmdbId;
      case "superembed":
        return isTv
          ? "https://multiembed.mov/?video_id=" + tmdbId + "&tmdb=1&s=" + season + "&e=" + episode
          : "https://multiembed.mov/?video_id=" + tmdbId + "&tmdb=1";
      case "twoembed":
        return isTv
          ? "https://www.2embed.cc/embedtv/" + tmdbId + "&s=" + season + "&e=" + episode
          : "https://www.2embed.cc/embed/" + tmdbId;
      default:
        return "https://vidsrc.sbs/embed/movie/" + tmdbId;
    }
  };

  // Embed inside clean HTML iframe WITHOUT the sandbox attribute
  const getHtmlContent = () => {
    const streamUrl = getEmbedUrl();
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body, html { width: 100%; height: 100%; background: #000; overflow: hidden; }
            iframe { width: 100%; height: 100%; border: none; }
          </style>
        </head>
        <body>
          <iframe 
            src="${streamUrl}" 
            allowfullscreen="true" 
            webkitallowfullscreen="true" 
            mozallowfullscreen="true" 
            scrolling="no"
          ></iframe>
        </body>
      </html>
    `;
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      <View style={styles.playerContainer}>
        <WebView
          key={activeServer + "-" + season + "-" + episode}
          originWhitelist={["*"]}
          source={{ html: getHtmlContent() }}
          userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
          allowsFullscreenVideo
          javaScriptEnabled
          domStorageEnabled
          thirdPartyCookiesEnabled
          sharedCookiesEnabled
          mixedContentMode="always"
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          setSupportMultipleWindows={false}
          onShouldStartLoadWithRequest={(req) => {
            const url = req.url.toLowerCase();
            // Block external ad popups and non-video redirects
            if (
              url.startsWith("data:") ||
              url.startsWith("about:") ||
              url.includes("vidsrc") ||
              url.includes("multiembed") ||
              url.includes("2embed") ||
              url.includes("stream") ||
              url.includes("m3u8")
            ) {
              return true;
            }
            return false;
          }}
          onLoadStart={() => setPlayerLoading(true)}
          onLoadEnd={() => setPlayerLoading(false)}
          style={styles.webview}
        />

        {playerLoading && (
          <View style={styles.playerLoader}>
            <ActivityIndicator size="large" color="#FF334B" />
          </View>
        )}
      </View>

      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.title} numberOfLines={1}>
                {media.title || media.name || "Now Streaming"}
              </Text>
              <Text style={styles.subtitle}>
                {isTv ? "Season " + season + " • Episode " + episode : "Full Movie (1080p)"}
              </Text>
            </View>
          </View>

          <Text style={styles.sectionHeading}>Streaming Server</Text>
          <View style={styles.serverRow}>
            {SERVERS.map((srv) => {
              const active = activeServer === srv.id;
              return (
                <TouchableOpacity
                  key={srv.id}
                  style={[styles.serverChip, active && styles.serverChipActive]}
                  onPress={() => {
                    setPlayerLoading(true);
                    setActiveServer(srv.id);
                  }}
                >
                  <Text style={[styles.serverText, active && styles.serverTextActive]}>
                    {srv.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {isTv && (
            <View style={styles.episodeSection}>
              <Text style={styles.sectionHeading}>Episodes</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((ep) => {
                  const isCurrent = episode === ep;
                  return (
                    <TouchableOpacity
                      key={ep}
                      style={[styles.epCard, isCurrent && styles.epCardActive]}
                      onPress={() => {
                        setEpisode(ep);
                        setPlayerLoading(true);
                      }}
                    >
                      <Ionicons
                        name={isCurrent ? "play" : "play-outline"}
                        size={16}
                        color={isCurrent ? "#FFF" : "#7A7A88"}
                      />
                      <Text style={[styles.epText, isCurrent && styles.epTextActive]}>
                        EP {ep}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0E" },
  playerContainer: { width: SCREEN_WIDTH, height: PLAYER_HEIGHT, backgroundColor: "#000" },
  webview: { flex: 1, backgroundColor: "#000" },
  playerLoader: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#0A0A0E",
    justifyContent: "center",
    alignItems: "center",
  },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#161622",
    justifyContent: "center",
    alignItems: "center",
  },
  title: { color: "#FFF", fontSize: 18, fontWeight: "700" },
  subtitle: { color: "#7E7E8E", fontSize: 12, marginTop: 2 },
  sectionHeading: { color: "#FFF", fontSize: 15, fontWeight: "700", marginTop: 16 },
  serverRow: { flexDirection: "row", gap: 10, marginTop: 10, flexWrap: "wrap" },
  serverChip: {
    backgroundColor: "#161622",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#242434",
  },
  serverChipActive: { backgroundColor: "#FF334B", borderColor: "#FF334B" },
  serverText: { color: "#8E8E9E", fontSize: 12, fontWeight: "600" },
  serverTextActive: { color: "#FFF" },
  episodeSection: { marginTop: 20 },
  epCard: {
    backgroundColor: "#161622",
    width: 78,
    height: 58,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#242434",
  },
  epCardActive: { backgroundColor: "#FF334B", borderColor: "#FF334B" },
  epText: { color: "#8E8E9E", fontSize: 12, fontWeight: "700", marginTop: 4 },
  epTextActive: { color: "#FFF" },
});
