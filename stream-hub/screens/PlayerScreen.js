import React, { useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, Text, StatusBar } from "react-native";
import { WebView } from "react-native-webview";
import * as ScreenOrientation from "expo-screen-orientation";

export default function PlayerScreen({ route, navigation }) {
  const { item } = route.params || {};
  const videoUrl =
    item?.videoUrl ||
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };
  }, []);

  const html = `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/><style>*{margin:0;padding:0;background:#000}body,html{width:100%;height:100%;display:flex;align-items:center;justify-content:center}video{width:100vw;height:100vh;object-fit:contain}</style></head><body><video controls autoplay playsinline src="${videoUrl}"></video></body></html>`;

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <WebView
        originWhitelist={["*"]}
        source={{ html }}
        style={styles.player}
        allowsFullscreenVideo
        allowsInlineMediaPlayback
      />
      <TouchableOpacity style={styles.btn} onPress={() => navigation.goBack()}>
        <Text style={styles.btnText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  player: { flex: 1, backgroundColor: "#000" },
  btn: {
    position: "absolute",
    top: 20,
    left: 20,
    zIndex: 99,
    backgroundColor: "rgba(0,0,0,0.6)",
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
