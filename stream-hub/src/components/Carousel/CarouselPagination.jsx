import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function CarouselPagination({ total, activeIndex }) {
  return (
      <View style={styles.container}>
            {Array.from({ length: total }).map((_, i) => (
                    <View
                              key={i}
                                        style={[
                                                    styles.dot,
                                                                activeIndex === i ? styles.dotActive : styles.dotInactive,
                                                                          ]}
                                                                                  />
                                                                                        ))}
                                                                                            </View>
                                                                                              );
                                                                                              }

                                                                                              const styles = StyleSheet.create({
                                                                                                container: {
                                                                                                    flexDirection: 'row',
                                                                                                        alignItems: 'center',
                                                                                                            justifyContent: 'center',
                                                                                                                marginTop: 14,
                                                                                                                    gap: 6,
                                                                                                                      },
                                                                                                                        dot: {
                                                                                                                            height: 5,
                                                                                                                                borderRadius: 3,
                                                                                                                                  },
                                                                                                                                    dotActive: {
                                                                                                                                        width: 18,
                                                                                                                                            backgroundColor: '#FF334B',
                                                                                                                                              },
                                                                                                                                                dotInactive: {
                                                                                                                                                    width: 6,
                                                                                                                                                        backgroundColor: '#2D2D3A',
                                                                                                                                                          },
                                                                                                                                                          });
                                                                                                                                                          