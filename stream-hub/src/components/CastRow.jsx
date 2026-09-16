import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w185';

export default function CastRow({ cast = [], onSelectActor }) {
  if (!cast || cast.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Top Cast</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.listContent}>
        {cast.slice(0, 15).map((actor) => {
          const profileUri = actor.profile_path
            ? `${TMDB_IMAGE_BASE}${actor.profile_path}`
            : 'https://via.placeholder.com/185x278.png?text=No+Photo';

          return (
            <TouchableOpacity
              key={actor.id}
              style={styles.card}
              activeOpacity={0.7}
              onPress={() => onSelectActor && onSelectActor(actor)}
            >
              <Image source={{ uri: profileUri }} style={styles.avatar} />
              <Text style={styles.actorName} numberOfLines={1}>
                {actor.name}
              </Text>
              <Text style={styles.characterName} numberOfLines={1}>
                {actor.character || 'Cast'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 14,
  },
  heading: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginHorizontal: 16,
    marginBottom: 10,
  },
  listContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  card: {
    width: 80,
    alignItems: 'center',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#22222E',
    borderWidth: 1.5,
    borderColor: '#333342',
  },
  actorName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
  },
  characterName: {
    color: '#8A8A9E',
    fontSize: 10,
    textAlign: 'center',
  },
});
