import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, StatusBar } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import * as ScreenOrientation from 'expo-screen-orientation';

export default function PlayerScreen({ route, navigation }) {
  const videoRef = useRef(null);
    const { item } = route.params || {};

      // Direct video URL or fallback sample stream
        const videoSource = item?.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

          useEffect(() => {
              // Lock to landscape for cinematic viewing
                  ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);

                      return () => {
                            // Revert to portrait when exiting the player
                                  ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
                                      };
                                        }, []);

                                          return (
                                              <View style={styles.container}>
                                                    <StatusBar hidden />

                                                          <Video
                                                                  ref={videoRef}
                                                                          source={{ uri: videoSource }}
                                                                                  style={styles.video}
                                                                                          useNativeControls
                                                                                                  resizeMode={ResizeMode.CONTAIN}
                                                                                                          shouldPlay
                                                                                                                />

                                                                                                                      <TouchableOpacity 
                                                                                                                              style={styles.closeButton} 
                                                                                                                                      onPress={() => navigation.goBack()}
                                                                                                                                            >
                                                                                                                                                    <Text style={styles.closeText}>✕</Text>
                                                                                                                                                          </TouchableOpacity>
                                                                                                                                                              </View>
                                                                                                                                                                );
                                                                                                                                                                }

                                                                                                                                                                const styles = StyleSheet.create({
                                                                                                                                                                  container: { flex: 1, backgroundColor: '#000', justifyContent: 'center' },
                                                                                                                                                                    video: { width: '100%', height: '100%' },
                                                                                                                                                                      closeButton: {
                                                                                                                                                                          position: 'absolute',
                                                                                                                                                                              top: 20,
                                                                                                                                                                                  left: 20,
                                                                                                                                                                                      zIndex: 10,
                                                                                                                                                                                          backgroundColor: 'rgba(0,0,0,0.6)',
                                                                                                                                                                                              width: 36,
                                                                                                                                                                                                  height: 36,
                                                                                                                                                                                                      borderRadius: 18,
                                                                                                                                                                                                          alignItems: 'center',
                                                                                                                                                                                                              justifyContent: 'center',
                                                                                                                                                                                                                },
                                                                                                                                                                                                                  closeText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
                                                                                                                                                                                                                  });
                                                                                                                                                                                                                  