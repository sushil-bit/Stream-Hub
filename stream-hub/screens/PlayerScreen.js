// screens/PlayerScreen.js
import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { WebView } from "react-native-webview";

export default function PlayerScreen({ route, navigation }) {
  const { title, youtubeKey, customUrl } = route.params;

    let streamUrl = "";
      if (youtubeKey) {
          streamUrl = `https://www.youtube-nocookie.com/embed/${youtubeKey}?autoplay=1&playsinline=1`;
            } else if (customUrl) {
                streamUrl = customUrl;
                  }

                    return (
                        <View style={styles.container}>
                              <View style={styles.topBar}>
                                      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
                                                <Text style={styles.closeText}>✕ Close</Text>
                                                        </TouchableOpacity>
                                                                <Text style={styles.titleText} numberOfLines={1}>{title}</Text>
                                                                      </View>

                                                                            {streamUrl ? (
                                                                                    <WebView
                                                                                              source={{ uri: streamUrl }}
                                                                                                        style={styles.video}
                                                                                                                  allowsFullscreenVideo
                                                                                                                            javaScriptEnabled
                                                                                                                                      domStorageEnabled
                                                                                                                                              />
                                                                                                                                                    ) : (
                                                                                                                                                            <View style={styles.center}>
                                                                                                                                                                      <Text style={styles.errorText}>No preview/trailer source available.</Text>
                                                                                                                                                                              </View>
                                                                                                                                                                                    )}
                                                                                                                                                                                        </View>
                                                                                                                                                                                          );
                                                                                                                                                                                          }

                                                                                                                                                                                          const styles = StyleSheet.create({
                                                                                                                                                                                            container: { flex: 1, backgroundColor: "#000" },
                                                                                                                                                                                              topBar: { flexDirection: "row", alignItems: "center", paddingTop: 40, paddingBottom: 10, paddingHorizontal: 16, backgroundColor: "#111" },
                                                                                                                                                                                                closeBtn: { paddingRight: 14 },
                                                                                                                                                                                                  closeText: { color: "#FFF", fontSize: 14, fontWeight: "bold" },
                                                                                                                                                                                                    titleText: { color: "#BBB", fontSize: 14, flex: 1 },
                                                                                                                                                                                                      video: { flex: 1, backgroundColor: "#000" },
                                                                                                                                                                                                        center: { flex: 1, justifyContent: "center", alignItems: "center" },
                                                                                                                                                                                                          errorText: { color: "#777", fontSize: 14 },
                                                                                                                                                                                                          });
                                                                                                                                                                                                          