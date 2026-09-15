import React from 'react';
import { StyleSheet, TouchableOpacity, Image, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { IMAGE_BASE_URL } from '../../services/api';

export default function CarouselCard({
  item,
    index,
      scrollX,
        cardWidth,
          spacing,
            onPress,
              onPlay,
              }) {
                const inputRange = [
                    (index - 1) * (cardWidth + spacing),
                        index * (cardWidth + spacing),
                            (index + 1) * (cardWidth + spacing),
                              ];

                                const scale = scrollX.interpolate({
                                    inputRange,
                                        outputRange: [0.85, 1, 0.85],
                                            extrapolate: 'clamp',
                                              });

                                                const rotateY = scrollX.interpolate({
                                                    inputRange,
                                                        outputRange: ['18deg', '0deg', '-18deg'],
                                                            extrapolate: 'clamp',
                                                              });

                                                                const opacity = scrollX.interpolate({
                                                                    inputRange,
                                                                        outputRange: [0.6, 1, 0.6],
                                                                            extrapolate: 'clamp',
                                                                              });

                                                                                const posterUri = item.poster_path
                                                                                    ? `${IMAGE_BASE_URL}${item.poster_path}`
                                                                                        : 'https://via.placeholder.com/300x450';

                                                                                          return (
                                                                                              <Animated.View
                                                                                                    style={[
                                                                                                            styles.cardContainer,
                                                                                                                    {
                                                                                                                              width: cardWidth,
                                                                                                                                        height: cardWidth * 1.38,
                                                                                                                                                  marginRight: spacing,
                                                                                                                                                            transform: [{ perspective: 800 }, { scale }, { rotateY }],
                                                                                                                                                                      opacity,
                                                                                                                                                                              },
                                                                                                                                                                                    ]}
                                                                                                                                                                                        >
                                                                                                                                                                                              <TouchableOpacity activeOpacity={0.9} style={styles.touchable} onPress={onPress}>
                                                                                                                                                                                                      <Image source={{ uri: posterUri }} style={styles.poster} />
                                                                                                                                                                                                              <LinearGradient
                                                                                                                                                                                                                        colors={['transparent', 'rgba(10,10,14,0.85)']}
                                                                                                                                                                                                                                  style={StyleSheet.absoluteFillObject}
                                                                                                                                                                                                                                          />
                                                                                                                                                                                                                                                  <TouchableOpacity style={styles.playFab} onPress={onPlay}>
                                                                                                                                                                                                                                                            <Ionicons name="play" size={20} color="#FFF" style={{ marginLeft: 2 }} />
                                                                                                                                                                                                                                                                    </TouchableOpacity>
                                                                                                                                                                                                                                                                          </TouchableOpacity>
                                                                                                                                                                                                                                                                              </Animated.View>
                                                                                                                                                                                                                                                                                );
                                                                                                                                                                                                                                                                                }

                                                                                                                                                                                                                                                                                const styles = StyleSheet.create({
                                                                                                                                                                                                                                                                                  cardContainer: {
                                                                                                                                                                                                                                                                                      borderRadius: 24,
                                                                                                                                                                                                                                                                                          overflow: 'hidden',
                                                                                                                                                                                                                                                                                              backgroundColor: '#161620',
                                                                                                                                                                                                                                                                                                },
                                                                                                                                                                                                                                                                                                  touchable: {
                                                                                                                                                                                                                                                                                                      width: '100%',
                                                                                                                                                                                                                                                                                                          height: '100%',
                                                                                                                                                                                                                                                                                                            },
                                                                                                                                                                                                                                                                                                              poster: {
                                                                                                                                                                                                                                                                                                                  width: '100%',
                                                                                                                                                                                                                                                                                                                      height: '100%',
                                                                                                                                                                                                                                                                                                                          resizeMode: 'cover',
                                                                                                                                                                                                                                                                                                                            },
                                                                                                                                                                                                                                                                                                                              playFab: {
                                                                                                                                                                                                                                                                                                                                  position: 'absolute',
                                                                                                                                                                                                                                                                                                                                      bottom: 14,
                                                                                                                                                                                                                                                                                                                                          right: 14,
                                                                                                                                                                                                                                                                                                                                              width: 42,
                                                                                                                                                                                                                                                                                                                                                  height: 42,
                                                                                                                                                                                                                                                                                                                                                      borderRadius: 21,
                                                                                                                                                                                                                                                                                                                                                          backgroundColor: '#FF334B',
                                                                                                                                                                                                                                                                                                                                                              justifyContent: 'center',
                                                                                                                                                                                                                                                                                                                                                                  alignItems: 'center',
                                                                                                                                                                                                                                                                                                                                                                      elevation: 4,
                                                                                                                                                                                                                                                                                                                                                                          shadowColor: '#FF334B',
                                                                                                                                                                                                                                                                                                                                                                              shadowOpacity: 0.4,
                                                                                                                                                                                                                                                                                                                                                                                  shadowRadius: 6,
                                                                                                                                                                                                                                                                                                                                                                                    },
                                                                                                                                                                                                                                                                                                                                                                                    });
                                                                                                                                                                                                                                                                                                                                                                                    