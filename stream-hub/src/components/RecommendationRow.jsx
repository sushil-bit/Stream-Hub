import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';

const TMDB_POSTER_BASE = 'https://image.tmdb.org/t/p/w342';

export const RecommendationRow = ({ items, type, navigation }) => {
  if (!items || items.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>More Like This</Text>
      <FlatList
        data={items}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => {
              navigation.push('DetailsScreen', { media: item, id: item.id, type: item.media_type || type });
            }}
          >
            <Image
              source={{
                uri: item.poster_path
                  ? `${TMDB_POSTER_BASE}${item.poster_path}`
                  : 'https://via.placeholder.com/150x225.png?text=No+Poster',
              }}
              style={styles.poster}
            />
            <Text style={styles.title} numberOfLines={1}>
              {item.title || item.name}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginVertical: 16 },
  heading: { color: '#fff', fontSize: 18, fontWeight: '700', marginHorizontal: 16, marginBottom: 12 },
  listContent: { paddingHorizontal: 16, gap: 12 },
  card: { width: 110 },
  poster: { width: 110, height: 165, borderRadius: 6, backgroundColor: '#222' },
  title: { color: '#ddd', fontSize: 12, marginTop: 6 },
});

export default RecommendationRow;
