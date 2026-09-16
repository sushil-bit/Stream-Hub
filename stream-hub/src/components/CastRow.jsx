import React from 'react';
import { View, Text, FlatList, Image, StyleSheet } from 'react-native';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w185';

export const CastRow = ({ cast }) => {
  if (!cast || cast.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>Top Cast</Text>
      <FlatList
        data={cast}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image
              source={{
                uri: item.profile_path
                  ? `${TMDB_IMAGE_BASE}${item.profile_path}`
                  : 'https://via.placeholder.com/185x185.png?text=No+Photo',
              }}
              style={styles.avatar}
            />
            <Text style={styles.actorName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.characterName} numberOfLines={1}>{item.character}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginVertical: 14 },
  sectionHeader: { color: '#fff', fontSize: 18, fontWeight: '700', marginHorizontal: 16, marginBottom: 10 },
  listContent: { paddingHorizontal: 16, gap: 12 },
  card: { width: 80, alignItems: 'center' },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#222' },
  actorName: { color: '#fff', fontSize: 12, fontWeight: '600', marginTop: 6, textAlign: 'center' },
  characterName: { color: '#888', fontSize: 10, textAlign: 'center' },
});
