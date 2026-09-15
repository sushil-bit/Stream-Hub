import React from 'react';
import { StyleSheet, Text, ScrollView, TouchableOpacity } from 'react-native';

const DEFAULT_CATEGORIES = ['All', 'Movies', 'Series', 'Anime', 'Romance', 'Sci-Fi'];

export default function CategoryTabRow({
  categories = DEFAULT_CATEGORIES,
    selected,
      onSelect,
      }) {
        return (
            <ScrollView
                  horizontal
                        showsHorizontalScrollIndicator={false}
                              contentContainerStyle={styles.container}
                                  >
                                        {categories.map((cat) => {
                                                const isSelected = selected === cat;
                                                        return (
                                                                  <TouchableOpacity
                                                                              key={cat}
                                                                                          onPress={() => onSelect(cat)}
                                                                                                      style={[styles.chip, isSelected && styles.chipActive]}
                                                                                                                >
                                                                                                                            <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                                                                                                                                          {cat}
                                                                                                                                                      </Text>
                                                                                                                                                                </TouchableOpacity>
                                                                                                                                                                        );
                                                                                                                                                                              })}
                                                                                                                                                                                  </ScrollView>
                                                                                                                                                                                    );
                                                                                                                                                                                    }

                                                                                                                                                                                    const styles = StyleSheet.create({
                                                                                                                                                                                      container: {
                                                                                                                                                                                          paddingHorizontal: 20,
                                                                                                                                                                                              paddingBottom: 14,
                                                                                                                                                                                                  gap: 10,
                                                                                                                                                                                                    },
                                                                                                                                                                                                      chip: {
                                                                                                                                                                                                          paddingVertical: 7,
                                                                                                                                                                                                              paddingHorizontal: 16,
                                                                                                                                                                                                                  borderRadius: 20,
                                                                                                                                                                                                                      backgroundColor: '#17171F',
                                                                                                                                                                                                                          borderWidth: 1,
                                                                                                                                                                                                                              borderColor: '#242430',
                                                                                                                                                                                                                                },
                                                                                                                                                                                                                                  chipActive: {
                                                                                                                                                                                                                                      backgroundColor: '#FF334B',
                                                                                                                                                                                                                                          borderColor: '#FF334B',
                                                                                                                                                                                                                                            },
                                                                                                                                                                                                                                              chipText: {
                                                                                                                                                                                                                                                  color: '#8D8D99',
                                                                                                                                                                                                                                                      fontSize: 13,
                                                                                                                                                                                                                                                          fontWeight: '600',
                                                                                                                                                                                                                                                            },
                                                                                                                                                                                                                                                              chipTextActive: {
                                                                                                                                                                                                                                                                  color: '#FFFFFF',
                                                                                                                                                                                                                                                                    },
                                                                                                                                                                                                                                                                    });
                                                                                                                                                                                                                                                                    