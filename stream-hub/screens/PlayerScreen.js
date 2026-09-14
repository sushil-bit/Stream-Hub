import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  StatusBar,
  ActivityIndicator,
  FlatList,
  LogBox,
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as ScreenOrientation from 'expo-screen-orientation';

LogBox.ignoreLogs(["Can't open url: data:"]);

export default function PlayerScreen({ route, navigation }) {
  const { item } = route.params || {};

  const isSeries = item?.media_type === 'tv' || item?.first_air_date || item?.isAnime;

  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [showPicker, setShowPicker] = useState(false);
  const [serverIndex, setServerIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Generate episode numbers 1-24 for quick switching
  const episodeList = Array.from({ length: 24 }, (_, i) => i + 1);

  // Server endpoints supporting movies & episodic TV content
  const servers = [
    {
      name: 'VidLink Pro',
      getUrl: () =>
        isSeries
          ? `https://vidlink.pro/tv/${item?.id || '1399'}/${season}/${episode}`
          : `https://vidlink.pro/movie/${item?.id || '550'}`,
    },
    {
      name: 'AutoEmbed',
      getUrl: () =>
        isSeries
          ? `https://player.autoembed.cc/embed/tv/${item?.id || '1399'}/${season}/${episode}`
          : `https://player.autoembed.cc/embed/movie/${item?.id || '550'}`,
    },
    {
      name: 'SuperEmbed',
      getUrl: () =>
        isSeries
          ? `https://multiembed.mov/?video_id=${item?.id || '1399'}&tmdb=1&s=${season}&e=${episode}`
          : `https://multiembed.mov/?video_id=${item?.id || '550'}&tmdb=1`,
    },
    {
      name: 'YouTube Search',
      getUrl: () =>
        `https://www.youtube-nocookie.com/embed?listType=search&list=${encodeURIComponent(
          (item?.title || item?.name || 'media') + (isSeries ? ` S${season}E${episode}` : ' trailer')
        )}&autoplay=1`,
    },
  ];

  const currentStreamUrl = servers[serverIndex].getUrl();

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };
  }, []);

  const switchServer = () => {
    setLoading(true);
    setServerIndex((prev) => (prev + 1) % servers.length);
  };

  const handleSelectEpisode = (ep) => {
    setEpisode(ep);
    setShowPicker(false);
    setLoading(true);
  };

  const handleShouldStartLoad = (request) => {
    if (
      request.url.startsWith('data:') ||
      request.url.startsWith('blob:') ||
      request.url.startsWith('about:')
    ) {
      return true;
    }
    return true;
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      <WebView
        key={currentStreamUrl}
        source={{ uri: currentStreamUrl }}
        style={styles.player}
        allowsFullscreenVideo
        javaScriptEnabled
        domStorageEnabled
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        setSupportMultipleWindows={false}
        onShouldStartLoadWithRequest={handleShouldStartLoad}
        userAgent="Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36"
        onLoadEnd={() => setLoading(false)}
      />

      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#E50914" />
          <Text style={styles.loadingText}>
            {isSeries
              ? `Loading S${season}:E${episode} on ${servers[serverIndex].name}...`
              : `Connecting to ${servers[serverIndex].name}...`}
          </Text>
        </View>
      )}

      {/* Top Left: Exit */}
      <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.btnText}>✕</Text>
      </TouchableOpacity>

      {/* Top Right Controls */}
      <View style={styles.topRightBar}>
        {isSeries && (
          <TouchableOpacity
            style={styles.controlPill}
            onPress={() => setShowPicker(!showPicker)}
          >
            <Text style={styles.pillText}>S{season}:E{episode} ▾</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.controlPill} onPress={switchServer}>
          <Text style={styles.pillText}>{servers[serverIndex].name} ▾</Text>
        </TouchableOpacity>
      </View>

      {/* Episode Selection Overlay Drawer */}
      {showPicker && (
        <View style={styles.episodeDrawer}>
          <View style={styles.drawerHeader}>
            <Text style={styles.drawerTitle}>Select Episode (Season {season})</Text>
            <TouchableOpacity onPress={() => setShowPicker(false)}>
              <Text style={styles.drawerClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={episodeList}
            keyExtractor={(i) => i.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item: ep }) => (
              <TouchableOpacity
                style={[
                  styles.epButton,
                  ep === episode && styles.epButtonActive,
                ]}
                onPress={() => handleSelectEpisode(ep)}
              >
                <Text
                  style={[
                    styles.epText,
                    ep === episode && styles.epTextActive,
                  ]}
                >
                  EP {ep}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  player: { flex: 1, backgroundColor: '#000' },
  loader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    zIndex: 10,
  },
  loadingText: { color: '#bbb', marginTop: 10, fontSize: 13 },
  closeBtn: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 99,
    backgroundColor: 'rgba(0,0,0,0.7)',
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topRightBar: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 99,
    flexDirection: 'row',
    gap: 8,
  },
  controlPill: {
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#444',
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  pillText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  episodeDrawer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15,15,15,0.92)',
    padding: 16,
    zIndex: 999,
    borderTopWidth: 1,
    borderColor: '#333',
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  drawerTitle: { color: '#fff', fontSize: 14, fontWeight: '700' },
  drawerClose: { color: '#bbb', fontSize: 16, paddingHorizontal: 6 },
  epButton: {
    backgroundColor: '#222',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  epButtonActive: {
    backgroundColor: '#E50914',
    borderColor: '#E50914',
  },
  epText: { color: '#bbb', fontWeight: '600', fontSize: 13 },
  epTextActive: { color: '#fff' },
});
