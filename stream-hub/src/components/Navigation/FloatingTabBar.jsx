import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function FloatingTabBar({ state, descriptors, navigation }) {
  const tabs = [
    { name: 'Home', label: 'Home', icon: 'home-outline', activeIcon: 'home' },
    { name: 'Explore', label: 'Explore', icon: 'search-outline', activeIcon: 'search' },
    { name: 'Details', label: 'List', icon: 'bookmark-outline', activeIcon: 'bookmark' },
    { name: 'Downloads', label: 'Downloads', icon: 'download-outline', activeIcon: 'download' },
    { name: 'Me', label: 'Me', icon: 'person-outline', activeIcon: 'person' },
  ];

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {tabs.map((tab, index) => {
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: state.routes[index]?.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(tab.name);
            }
          };

          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.tabItem}
              onPress={onPress}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isFocused ? tab.activeIcon : tab.icon}
                size={20}
                color={isFocused ? '#FF334B' : '#7E7E8A'}
              />
              <Text
                style={[
                  styles.tabLabel,
                  isFocused && styles.activeLabel,
                ]}
                numberOfLines={1}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 16,
    left: 12,
    right: 12,
    alignItems: 'center',
  },
  container: {
    flexDirection: 'row',
    width: '100%',
    height: 58,
    backgroundColor: '#16161F',
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: '#22222E',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  tabLabel: {
    fontSize: 9.5,
    color: '#7E7E8A',
    marginTop: 2,
    fontWeight: '500',
  },
  activeLabel: {
    color: '#FF334B',
    fontWeight: '700',
  },
});
