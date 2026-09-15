import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';

export default function UserProfileHeader({ onSearchPress, onNotificationPress }) {
  return (
    <View style={styles.header}>
      <View style={styles.profileRow}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' }}
          style={styles.avatar}
        />
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.greeting}>Happy Watching!</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.username}>Stream-Hub</Text>
            <Feather name="chevron-down" size={14} color="#A0A0A8" style={{ marginLeft: 4 }} />
          </View>
        </View>
      </View>

      <View style={styles.iconGroup}>
        <TouchableOpacity style={styles.iconBtn} onPress={onSearchPress}>
          <Ionicons name="search" size={18} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.iconBtn, { marginLeft: 10 }]} onPress={onNotificationPress}>
          <Ionicons name="notifications-outline" size={18} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 14,
  },
  profileRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 1.5, borderColor: '#FF334B' },
  greeting: { color: '#82828F', fontSize: 11 },
  username: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  iconGroup: { flexDirection: 'row' },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1E1E26',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
