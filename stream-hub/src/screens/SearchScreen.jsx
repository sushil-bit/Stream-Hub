// src/screens/SearchScreen.jsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SearchScreen() {
  return (
    <View style={styles.container}>
      <Text style={{ color: '#FFF' }}>Search Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0E', justifyContent: 'center', alignItems: 'center' },
});
