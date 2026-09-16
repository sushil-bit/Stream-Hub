import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w185';

export default function CastRow({ cast = [], crew = [], onSelectActor }) {
  const directors = crew.filter(
    (member) => member.job === 'Director' || member.department === 'Directing'
  ).slice(0, 5);

  const producers = crew.filter(
    (member) => member.job === 'Producer' || member.job === 'Executive Producer'
  ).slice(0, 5);

  const renderPersonCard = (person, roleLabel) => {
    const profileUri = person.profile_path
      ? `${TMDB_IMAGE_BASE}${person.profile_path}`
      : 'https://via.placeholder.com/185x278.png?text=No+Photo';

    return (
      <TouchableOpacity
        key={`${person.id}-${roleLabel}-${person.credit_id || Math.random()}`}
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => onSelectActor && onSelectActor(person)}
      >
        <Image source={{ uri: profileUri }} style={styles.avatar} />
        <Text style={styles.personName} numberOfLines={1}>
          {person.name}
        </Text>
        <Text style={styles.roleText} numberOfLines={1}>
          {roleLabel}
        </Text>
      </TouchableOpacity>
    );
  };

  const hasCast = cast && cast.length > 0;
  const hasDirectors = directors.length > 0;
  const hasProducers = producers.length > 0;

  if (!hasCast && !hasDirectors && !hasProducers) {
    return null;
  }

  return (
    <View style={styles.wrapper}>
      {/* Top Cast Section */}
      {hasCast && (
        <View style={styles.section}>
          <Text style={styles.heading}>Top Cast</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.listContent}>
            {cast.slice(0, 16).map((actor) => renderPersonCard(actor, actor.character || 'Actor'))}
          </ScrollView>
        </View>
      )}

      {/* Directors Section */}
      {hasDirectors && (
        <View style={styles.section}>
          <Text style={styles.heading}>Director</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.listContent}>
            {directors.map((director) => renderPersonCard(director, director.job || 'Director'))}
          </ScrollView>
        </View>
      )}

      {/* Producers Section */}
      {hasProducers && (
        <View style={styles.section}>
          <Text style={styles.heading}>Producers</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.listContent}>
            {producers.map((producer) => renderPersonCard(producer, producer.job || 'Producer'))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 8,
  },
  section: {
    marginBottom: 14,
  },
  heading: {
    color: '#FFFFFF',
    fontSize: 16,
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
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#22222E',
    borderWidth: 1.5,
    borderColor: '#313142',
  },
  personName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
  },
  roleText: {
    color: '#8A8A9E',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 1,
  },
});
