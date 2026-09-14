import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, StatusBar } from 'react-native';
import { WebView } from 'react-native-webview';
import * as ScreenOrientation from 'expo-screen-orientation';

export default function PlayerScreen({ route, navigation }) {
  const { item } = route.params || {};

  // 1. Direct stream URL (using a fast, mobile-friendly CDN video)
  const videoUrl =
    item?.videoUrl ||
    'https://cdn.jsdelivr.net/gh/mediaelement/mediaelement-files@master/big_buck_bunny.mp4';

  // 2. Or embed player if you provide an embed URL
  const embedUrl = item?.embedUrl;

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };
  }, []);

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; background-color: #000; }
          html, body { width: 100%; height: 100%; overflow: hidden; display: flex; align-items: center; justify-content: center; }
          video { width: 100vw; height: 100vh; object-fit: contain; }
        </style>
      </head>
      <body>
        <video controls autoplay playsinline preload="auto">
          <source src="${videoUrl}" type="video/mp4">
          Your browser does not support HTML5 video.
        </video>
      </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <WebView
        originWhitelist={['*']}
        source={embedUrl ? { uri: embedUrl } : { html }}
        style={styles.player}
        allowsFullscreenVideo
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled
        domStorageEnabled
        mixedContentMode="always"
      />
      <TouchableOpacity style={styles.btn} onPress={() => navigation.goBack()}>
        <Text style={styles.btnText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  player: { flex: 1, backgroundColor: '#000' },
  btn: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 999,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
