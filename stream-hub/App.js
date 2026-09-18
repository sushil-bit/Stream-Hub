import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, Image, TextInput, TouchableOpacity } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import HomeScreen from "./src/screens/HomeScreen";

function ExploreScreen() {
  const exploreCards = [
    { id: "e1", title: "Top Bollywood Blockbusters", subtitle: "Trending across India", img: "https://image.tmdb.org/t/p/w780/1E5baAaEse26fej7uHcjOgEE2t2.jpg" },
    { id: "e2", title: "South Indian Action Extravaganza", subtitle: "Telugu, Tamil & Kannada", img: "https://image.tmdb.org/t/p/w780/xOMo8BRK7PfcJv9JCnx7s5hj0x2.jpg" },
    { id: "e3", title: "Hindi Dubbed Anime Hits", subtitle: "Demon Slayer, JJK & more", img: "https://image.tmdb.org/t/p/w780/nTvM4mhqZlHI09GmnWuaEknYueL.jpg" },
  ];

  return (
    <View style={styles.subScreenContainer}>
      <Text style={styles.subScreenHeading}>Explore Collections</Text>
      <FlatList
        data={exploreCards}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.collectionCard} activeOpacity={0.85}>
            <Image source={{ uri: item.img }} style={styles.collectionImage} />
            <View style={styles.collectionOverlay}>
              <Text style={styles.collectionTitle}>{item.title}</Text>
              <Text style={styles.collectionSub}>{item.subtitle}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

function SearchScreen() {
  const [query, setQuery] = useState("");
  const hotTags = ["Haiwaan", "Dune 2", "Kalki 2898", "Bleach", "Bigg Boss", "Asur", "Mirzapur"];

  return (
    <View style={styles.subScreenContainer}>
      <Text style={styles.subScreenHeading}>Search Everything</Text>
      <View style={styles.searchBarBox}>
        <Ionicons name="search" size={18} color="#8E8E9A" style={{ marginRight: 8 }} />
        <TextInput
          placeholder="Type movie, actor, or genre..."
          placeholderTextColor="#7E7E8A"
          style={styles.fullSearchInput}
          value={query}
          onChangeText={setQuery}
        />
      </View>
      <Text style={[styles.subSectionTitle, { marginTop: 20 }]}>Trending Searches</Text>
      <View style={styles.tagsContainer}>
        {hotTags.map((t) => (
          <TouchableOpacity key={t} style={styles.tagPill} onPress={() => setQuery(t)}>
            <Text style={styles.tagPillText}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function DownloadsScreen() {
  return (
    <View style={[styles.subScreenContainer, { justifyContent: "center", alignItems: "center" }]}>
      <Ionicons name="cloud-done-outline" size={60} color="#22C55E" />
      <Text style={[styles.subScreenHeading, { marginTop: 14 }]}>Offline Downloads</Text>
      <Text style={styles.emptyDesc}>2 episodes ready to watch offline</Text>
    </View>
  );
}

function MeScreen() {
  return (
    <View style={styles.subScreenContainer}>
      <View style={styles.meProfileRow}>
        <View style={styles.avatar}>
          <Text style={{ fontSize: 24 }}>👤</Text>
        </View>
        <View style={{ marginLeft: 14 }}>
          <Text style={styles.profileName}>Guest User</Text>
          <Text style={styles.profileSub}>Free Account • India Region</Text>
        </View>
      </View>

      <View style={styles.meMenuContainer}>
        <TouchableOpacity style={styles.meMenuItem}>
          <Ionicons name="diamond-outline" size={20} color="#F59E0B" />
          <Text style={styles.meMenuText}>Upgrade to VIP</Text>
          <Ionicons name="chevron-forward" size={16} color="#7E7E8A" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.meMenuItem}>
          <Ionicons name="settings-outline" size={20} color="#8E8E9A" />
          <Text style={styles.meMenuText}>Playback Settings</Text>
          <Ionicons name="chevron-forward" size={16} color="#7E7E8A" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: "#22C55E",
          tabBarInactiveTintColor: "#6E6E7C",
          tabBarLabelStyle: { fontSize: 10, fontWeight: "600", paddingBottom: 4 },
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ color }) => <Ionicons name="home" size={20} color={color} />,
          }}
        />
        <Tab.Screen
          name="Explore"
          component={ExploreScreen}
          options={{
            tabBarIcon: ({ color }) => <Ionicons name="compass-outline" size={21} color={color} />,
          }}
        />
        <Tab.Screen
          name="SearchCenter"
          component={SearchScreen}
          options={{
            tabBarLabel: "",
            tabBarIcon: () => (
              <View style={styles.centerSearchGlow}>
                <Ionicons name="search" size={22} color="#FFFFFF" />
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="Downloads"
          component={DownloadsScreen}
          options={{
            tabBarBadge: 2,
            tabBarBadgeStyle: { backgroundColor: "#22C55E", fontSize: 8, height: 14, minWidth: 14 },
            tabBarIcon: ({ color }) => <Ionicons name="download-outline" size={20} color={color} />,
          }}
        />
        <Tab.Screen
          name="Me"
          component={MeScreen}
          options={{
            tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={20} color={color} />,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#121217",
    borderTopColor: "#1A1A22",
    height: 58,
    paddingTop: 6,
  },
  centerSearchGlow: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#22C55E",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#22C55E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 2,
    borderColor: "#4ADE80",
  },
  subScreenContainer: {
    flex: 1,
    backgroundColor: "#101014",
    paddingTop: 54,
    paddingHorizontal: 16,
  },
  subScreenHeading: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  subSectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 10,
  },
  collectionCard: {
    width: "100%",
    height: 140,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 14,
    position: "relative",
  },
  collectionImage: {
    width: "100%",
    height: "100%",
  },
  collectionOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    padding: 14,
    justifyContent: "flex-end",
  },
  collectionTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  collectionSub: {
    color: "#D1D5DB",
    fontSize: 12,
    marginTop: 2,
  },
  searchBarBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E1E26",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  fullSearchInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tagPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#1B1B24",
    borderWidth: 1,
    borderColor: "#282836",
  },
  tagPillText: {
    color: "#9CA3AF",
    fontSize: 12,
  },
  emptyDesc: {
    color: "#6B7280",
    fontSize: 13,
    marginTop: 4,
  },
  meProfileRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#181822",
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#222230",
    alignItems: "center",
    justifyContent: "center",
  },
  profileName: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  profileSub: {
    color: "#6B7280",
    fontSize: 12,
    marginTop: 2,
  },
  meMenuContainer: {
    backgroundColor: "#181822",
    borderRadius: 12,
    overflow: "hidden",
  },
  meMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#22222E",
  },
  meMenuText: {
    flex: 1,
    color: "#E5E7EB",
    fontSize: 13.5,
    marginLeft: 10,
    fontWeight: "600",
  },
});
