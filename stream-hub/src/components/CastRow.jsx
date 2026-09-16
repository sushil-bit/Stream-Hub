import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w185';

export default function CastRow({ cast = [], crew = [], onSelectActor }) {
  const [activeCategory, setActiveCategory] = useState('cast'); // 'cast' | 'directors' | 'producers'
  const [layoutMode, setLayoutMode] = useState('slideable'); // 'slideable' | 'dropdown'
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const directors = crew.filter(
    (member) => member.job === 'Director' || member.department === 'Directing'
  );

  const producers = crew.filter(
    (member) => member.job === 'Producer' || member.job === 'Executive Producer'
  );

  const categories = [
    { id: 'cast', label: 'Top Cast', data: cast.slice(0, 20), defaultRole: 'Actor' },
    { id: 'directors', label: 'Directors', data: directors.slice(0, 10), defaultRole: 'Director' },
    { id: 'producers', label: 'Producers', data: producers.slice(0, 10), defaultRole: 'Producer' },
  ].filter((cat) => cat.data && cat.data.length > 0);

  if (!cast?.length && !crew?.length) return null;
  if (categories.length === 0) return null;

  const currentCategory = categories.find((c) => c.id === activeCategory) || categories[0];

  return (
    <View style={styles.wrapper}>
      {/* Top Header: Title & Layout Switcher */}
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>People</Text>
        <View style={styles.layoutToggleGroup}>
          <TouchableOpacity
            style={[styles.toggleBtn, layoutMode === 'slideable' && styles.toggleBtnActive]}
            onPress={() => setLayoutMode('slideable')}
          >
            <Ionicons
              name="swap-horizontal-outline"
              size={16}
              color={layoutMode === 'slideable' ? '#FFFFFF' : '#8A8A9E'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, layoutMode === 'dropdown' && styles.toggleBtnActive]}
            onPress={() => setLayoutMode('dropdown')}
          >
            <Ionicons
              name="chevron-down-circle-outline"
              size={16}
              color={layoutMode === 'dropdown' ? '#FFFFFF' : '#8A8A9E'}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Selector Area: Slideable Pills vs Downward Dropdown */}
      {layoutMode === 'slideable' ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsScroller}
        >
          {categories.map((cat) => {
            const isSelected = cat.id === currentCategory.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.pillItem, isSelected && styles.pillItemActive]}
                onPress={() => setActiveCategory(cat.id)}
                activeOpacity={0.7}
              >
                <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>
                  {cat.label} ({cat.data.length})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      ) : (
        <View style={styles.dropdownContainer}>
          <TouchableOpacity
            style={styles.dropdownTrigger}
            onPress={() => setIsDropdownOpen(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.dropdownTriggerText}>
              {currentCategory.label} ({currentCategory.data.length})
            </Text>
            <Ionicons name="chevron-down" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}

      {/* People Cards Horizontal List */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.peopleScroller}
      >
        {currentCategory.data.map((person) => {
          const profileUri = person.profile_path
            ? `${TMDB_IMAGE_BASE}${person.profile_path}`
            : 'https://via.placeholder.com/185x278.png?text=No+Photo';

          const role =
            currentCategory.id === 'cast'
              ? person.character || currentCategory.defaultRole
              : person.job || currentCategory.defaultRole;

          return (
            <TouchableOpacity
              key={`${currentCategory.id}-${person.id}-${person.credit_id || Math.random()}`}
              style={styles.personCard}
              activeOpacity={0.7}
              onPress={() => onSelectActor && onSelectActor(person)}
            >
              <Image source={{ uri: profileUri }} style={styles.avatar} />
              <Text style={styles.personName} numberOfLines={1}>
                {person.name}
              </Text>
              <Text style={styles.roleName} numberOfLines={1}>
                {role}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Dropdown Selection Modal */}
      <Modal
        visible={isDropdownOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsDropdownOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setIsDropdownOpen(false)}
        >
          <View style={styles.modalMenuCard}>
            <Text style={styles.modalMenuHeader}>Select Department</Text>
            {categories.map((cat) => {
              const isSelected = cat.id === currentCategory.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.modalMenuItem, isSelected && styles.modalMenuItemActive]}
                  onPress={() => {
                    setActiveCategory(cat.id);
                    setIsDropdownOpen(false);
                  }}
                >
                  <Text style={[styles.modalMenuItemText, isSelected && styles.modalMenuItemTextActive]}>
                    {cat.label}
                  </Text>
                  <Text style={styles.modalMenuItemCount}>({cat.data.length})</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  layoutToggleGroup: {
    flexDirection: 'row',
    backgroundColor: '#1B1B24',
    borderRadius: 8,
    padding: 3,
    borderWidth: 1,
    borderColor: '#292938',
  },
  toggleBtn: {
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  toggleBtnActive: {
    backgroundColor: '#2E2E40',
  },
  pillsScroller: {
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 10,
  },
  pillItem: {
    backgroundColor: '#1A1A24',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#2B2B3B',
  },
  pillItemActive: {
    backgroundColor: '#E50914',
    borderColor: '#E50914',
  },
  pillText: {
    color: '#8A8A9E',
    fontSize: 12,
    fontWeight: '600',
  },
  pillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  dropdownContainer: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#1E1E28',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2C2C3D',
    gap: 8,
  },
  dropdownTriggerText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  peopleScroller: {
    paddingHorizontal: 16,
    gap: 12,
    paddingTop: 4,
  },
  personCard: {
    width: 80,
    alignItems: 'center',
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#22222E',
    borderWidth: 1.5,
    borderColor: '#323244',
  },
  personName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
  },
  roleName: {
    color: '#8A8A9E',
    fontSize: 10,
    marginTop: 1,
    textAlign: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalMenuCard: {
    width: '80%',
    backgroundColor: '#181824',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2E2E40',
  },
  modalMenuHeader: {
    color: '#8A8A9E',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  modalMenuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  modalMenuItemActive: {
    backgroundColor: '#242436',
  },
  modalMenuItemText: {
    color: '#D2D2E0',
    fontSize: 14,
    fontWeight: '600',
  },
  modalMenuItemTextActive: {
    color: '#E50914',
    fontWeight: '700',
  },
  modalMenuItemCount: {
    color: '#6F6F85',
    fontSize: 12,
  },
});
