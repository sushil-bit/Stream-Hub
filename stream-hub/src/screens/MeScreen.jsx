import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function MeScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [counts, setCounts] = useState({
    watchlist: 0,
    liked: 0,
    comments: 0,
  });

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const session = await AsyncStorage.getItem("@user_session");
        if (session) setProfile(JSON.parse(session));

        const watchlistData = await AsyncStorage.getItem("@streamhub_watchlist");
        const parsedWatchlist = watchlistData ? JSON.parse(watchlistData) : [];

        const likedData = await AsyncStorage.getItem("@streamhub_liked");
        const parsedLiked = likedData ? JSON.parse(likedData) : [];

        const commentsData = await AsyncStorage.getItem("@streamhub_comments");
        const parsedComments = commentsData ? JSON.parse(commentsData) : [];

        setCounts({
          watchlist: Array.isArray(parsedWatchlist) ? parsedWatchlist.length : 0,
          liked: Array.isArray(parsedLiked) ? parsedLiked.length : 0,
          comments: Array.isArray(parsedComments) ? parsedComments.length : 0,
        });
      } catch (e) {
        console.warn("Error loading user counts:", e);
      }
    };

    loadUserData();
  }, []);

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("@user_session");
          Alert.alert("Logged out", "Restart or reload the app to switch accounts.");
        },
      },
    ]);
  };

  const handleSupportCreator = () => {
    Alert.alert(
      "Support the Creator",
      "Enjoying Stream-Hub? Star the repository on GitHub or contribute to the project!",
      [
        { text: "Later", style: "cancel" },
        {
          text: "Open GitHub",
          onPress: () => {
            Linking.openURL("https://github.com").catch(() => {});
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>Account</Text>

      {/* User Profile Card */}
      <View style={styles.profileCard}>
        <Image
          source={{
            uri:
              profile?.avatar ||
              "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200",
          }}
          style={styles.avatar}
        />
        <View style={styles.profileDetails}>
          <Text style={styles.username}>{profile?.username || "Stream-Hub Member"}</Text>
          <Text style={styles.email}>{profile?.email || "streamer@streamhub.io"}</Text>
          <View style={styles.providerBadge}>
            <Text style={styles.providerText}>
              {(profile?.provider || "Direct").toUpperCase()} ACCOUNT
            </Text>
          </View>
        </View>
      </View>

      {/* Quick Activity Metrics */}
      <View style={styles.statsRow}>
        <TouchableOpacity
          style={styles.statBox}
          onPress={() => navigation.navigate("Details")}
        >
          <Text style={styles.statCount}>{counts.watchlist}</Text>
          <Text style={styles.statLabel}>My List</Text>
        </TouchableOpacity>

        <View style={styles.statDivider} />

        <TouchableOpacity
          style={styles.statBox}
          onPress={() => Alert.alert("My Liked", `You have liked ${counts.liked} titles.`)}
        >
          <Text style={styles.statCount}>{counts.liked}</Text>
          <Text style={styles.statLabel}>Liked</Text>
        </TouchableOpacity>

        <View style={styles.statDivider} />

        <TouchableOpacity
          style={styles.statBox}
          onPress={() => Alert.alert("My Comments", `You have posted ${counts.comments} comments.`)}
        >
          <Text style={styles.statCount}>{counts.comments}</Text>
          <Text style={styles.statLabel}>Comments</Text>
        </TouchableOpacity>
      </View>

      {/* Content & Library Section */}
      <Text style={styles.sectionHeader}>MY MEDIA</Text>
      <View style={styles.menuGroup}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("Details")}
        >
          <View style={[styles.iconContainer, { backgroundColor: "#FFB8001F" }]}>
            <Ionicons name="bookmark" size={18} color="#FFB800" />
          </View>
          <Text style={styles.menuLabel}>My Watchlist</Text>
          <Ionicons name="chevron-forward" size={16} color="#7E7E8A" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => Alert.alert("My Liked", "Your liked movies and episodes will appear here.")}
        >
          <View style={[styles.iconContainer, { backgroundColor: "#FF334B1F" }]}>
            <Ionicons name="heart" size={18} color="#FF334B" />
          </View>
          <Text style={styles.menuLabel}>Liked Titles</Text>
          <Ionicons name="chevron-forward" size={16} color="#7E7E8A" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => Alert.alert("My Comments", "Your discussion history and episode notes will appear here.")}
        >
          <View style={[styles.iconContainer, { backgroundColor: "#3B82F61F" }]}>
            <Ionicons name="chatbubble-ellipses" size={18} color="#3B82F6" />
          </View>
          <Text style={styles.menuLabel}>My Comments & Reviews</Text>
          <Ionicons name="chevron-forward" size={16} color="#7E7E8A" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, styles.lastItem]}
          onPress={() => navigation.navigate("Downloads")}
        >
          <View style={[styles.iconContainer, { backgroundColor: "#10B9811F" }]}>
            <Ionicons name="download" size={18} color="#10B981" />
          </View>
          <Text style={styles.menuLabel}>Downloads & Offline Library</Text>
          <Ionicons name="chevron-forward" size={16} color="#7E7E8A" />
        </TouchableOpacity>
      </View>

      {/* Preferences & Creator Support */}
      <Text style={styles.sectionHeader}>PREFERENCES & SUPPORT</Text>
      <View style={styles.menuGroup}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() =>
            Alert.alert("Settings", "Playback quality, subtitle styling, and stream server options.")
          }
        >
          <View style={[styles.iconContainer, { backgroundColor: "#8B5CF61F" }]}>
            <Ionicons name="settings-sharp" size={18} color="#8B5CF6" />
          </View>
          <Text style={styles.menuLabel}>App Settings</Text>
          <Ionicons name="chevron-forward" size={16} color="#7E7E8A" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, styles.lastItem]}
          onPress={handleSupportCreator}
        >
          <View style={[styles.iconContainer, { backgroundColor: "#EC48991F" }]}>
            <Ionicons name="sparkles" size={18} color="#EC4899" />
          </View>
          <Text style={styles.menuLabel}>Support the Creator</Text>
          <Ionicons name="open-outline" size={16} color="#7E7E8A" />
        </TouchableOpacity>
      </View>

      {/* Session Management */}
      <View style={[styles.menuGroup, { marginTop: 18 }]}>
        <TouchableOpacity
          style={[styles.menuItem, styles.lastItem]}
          onPress={handleLogout}
        >
          <View style={[styles.iconContainer, { backgroundColor: "#FF334B1F" }]}>
            <Ionicons name="log-out-outline" size={18} color="#FF334B" />
          </View>
          <Text style={[styles.menuLabel, { color: "#FF334B", fontWeight: "600" }]}>
            Log Out
          </Text>
          <Ionicons name="chevron-forward" size={16} color="#7E7E8A" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0C13",
  },
  content: {
    paddingTop: 54,
    paddingHorizontal: 16,
    paddingBottom: 110,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 18,
    letterSpacing: 0.3,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#16161F",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#22222E",
  },
  avatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#262635",
  },
  profileDetails: {
    marginLeft: 14,
    flex: 1,
  },
  username: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  email: {
    fontSize: 13,
    color: "#7E7E8A",
    marginTop: 2,
  },
  providerBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 51, 75, 0.12)",
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 5,
    marginTop: 6,
  },
  providerText: {
    color: "#FF334B",
    fontSize: 9.5,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "#16161F",
    borderRadius: 14,
    marginTop: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#22222E",
    alignItems: "center",
  },
  statBox: {
    flex: 1,
    alignItems: "center",
  },
  statCount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  statLabel: {
    fontSize: 11,
    color: "#7E7E8A",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: "#22222E",
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: "700",
    color: "#7E7E8A",
    letterSpacing: 0.8,
    marginTop: 24,
    marginBottom: 10,
    marginLeft: 4,
  },
  menuGroup: {
    backgroundColor: "#16161F",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#22222E",
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#1F1F2C",
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: "#DDDDE8",
    fontWeight: "500",
  },
});
