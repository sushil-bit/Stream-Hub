import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, StatusBar, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import * as ScreenOrientation from 'expo-screen-orientation';

export default function PlayerScreen({ route, navigation }) {
  const { item } = route.params || {};
  const [serverIndex, setServerIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Reliable, high-availability video stream sources
  const servers = [
    {
      name: 'Trailer Stream',
      url: `https://www.youtube-nocookie.com/embed?listType=search&list=${encodeURIComponent((item?.title || item?.name || 'movie') + ' full trailer official')}&autoplay=1`
    },
    {
      name: 'VidLink CDN',
      url: `https://vidlink.pro/movie/${item?.id || '550'}`
    },
    {
      name: 'SmashyStream',
      url: `https://embed.smashystream.com/playere.php?tmdb=${item?.id || '550'}`
    },
    {
      name: 'Sample High-Res Stream',
      url: 'https://cdn.jsdelivr.net/gh/mediaelement/mediaelement-files@master/big_buck_bunny.mp4'
    }
  ];

  const currentServer = servers[serverIndex];
  const isDirectMp4 = currentServer.url.endsWith('.mp4');

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

  const htmlDirectVideo = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
        <style>
          * { margin:0; padding:0; background:#000; }
          body, html { width:100%; height:100%; display:flex; align-items:center; justify-content:center; }
          video { width:100vw; height:100vh; object-fit:contain; }
        </style>
      </head>
      <body>
        <video controls autoplay playsinline src="${currentServer.url}"></video>
      </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      <WebView
        key={currentServer.url}
        source={isDirectMp4 ? { html: htmlDirectVideo } : { uri: currentServer.url }}
        style={styles.player}
        allowsFullscreenVideo
        javaScriptEnabled
        domStorageEnabled
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
        onLoadEnd={() => setLoading(false)}
      />

      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#E50914" />
          <Text style={styles.loadingText}>Connecting to {currentServer.name}...</Text>
        </View>
      )}

      <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.btnText}>✕</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.serverBtn} onPress={switchServer}>
        <Text style={styles.serverBtnText}>{currentServer.name} ▾ (Switch)</Text>
      </TouchableOpacity>
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
  serverBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 99,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#444',
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  serverBtnText: { color: '#fff', fontSize: 12, fontWeight: '600' },
});
