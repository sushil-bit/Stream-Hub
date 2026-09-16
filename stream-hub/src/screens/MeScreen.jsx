import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CoffeeSupportModal from "../components/CoffeeSupportModal";
import SettingsScreen from "./SettingsScreen";

export default function MeScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [showCoffeeModal, setShowCoffeeModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
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
        const likedData = await AsyncStorage.getItem("@streamhub_liked");
        const commentsData = await AsyncStorage.getItem("@streamhub_comments");

        setCounts({
          watchlist: watchlistData ? JSON.parse(watchlistData).length : 0,
          liked: likedData ? JSON.parse(likedData).length : 0,
          comments: commentsData ? JSON.parse(commentsData).length : 0,
        });
      } catch (e) {
        console.warn("User stats retrieval error:", e);
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
          Alert.alert("Logged out", "Reload app to authenticate again.");
        },
      },
    ]);
  };

  return (
    <View style={styles.root}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.headerTitle}>Account</Text>

        {/* User Card */}
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
            <View style={styles.badgeRow}>
              <View style={styles.providerBadge}>
                <Text style={styles.providerText}>
                  {(profile?.provider || "DIRECT").toUpperCase()}
                </Text>
              </View>
              <View style={styles.proBadge}>
                <Ionicons name="sparkles" size={10} color="#FFB800" />
                <Text style={styles.proText}>VIP MEMBER</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Metric Counters */}
        <View style={styles.statsRow}>
          <TouchableOpacity
            style={styles.statBox}
            onPress={() => navigation.navigate("Details")}
          >
            <Text style={styles.statCount}>{counts.watchlist}</Text>
            <Text style={styles.statLabel}>Watchlist</Text>
          </TouchableOpacity>
          <View style={styles.statDivider} />
          <TouchableOpacity
            style={styles.statBox}
            onPress={() => Alert.alert("Liked", `You have liked ${counts.liked} titles.`)}
          >
            <Text style={styles.statCount}>{counts.liked}</Text>
            <Text style={styles.statLabel}>Liked</Text>
          </TouchableOpacity>
          <View style={styles.statDivider} />
          <TouchableOpacity
            style={styles.statBox}
            onPress={() => Alert.alert("Comments", `You have posted ${counts.comments} comments.`)}
          >
            <Text style={styles.statCount}>{counts.comments}</Text>
            <Text style={styles.statLabel}>Comments</Text>
          </TouchableOpacity>
        </View>

        {/* Storage Meter */}
        <View style={styles.storageCard}>
          <View style={styles.storageHeader}>
            <Text style={styles.storageTitle}>Offline Storage</Text>
            <Text style={styles.storageValue}>1.4 GB / 64 GB</Text>
          </View>
          <View style={styles.storageTrack}>
            <View style={[styles.storageBar, { width: "12%" }]} />
          </View>
        </View>

        {/* Media Group */}
        <Text style={styles.sectionHeader}>LIBRARY</Text>
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
            style={[styles.menuItem, styles.lastItem]}
            onPress={() => navigation.navigate("Downloads")}
          >
            <View style={[styles.iconContainer, { backgroundColor: "#10B9811F" }]}>
              <Ionicons name="download" size={18} color="#10B981" />
            </View>
            <Text style={styles.menuLabel}>Downloads & Offline Media</Text>
            <Ionicons name="chevron-forward" size={16} color="#7E7E8A" />
          </TouchableOpacity>
        </View>

        {/* Settings & Support */}
        <Text style={styles.sectionHeader}>PREFERENCES & SUPPORT</Text>
        <View style={styles.menuGroup}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setShowSettingsModal(true)}
          >
            <View style={[styles.iconContainer, { backgroundColor: "#8B5CF61F" }]}>
              <Ionicons name="settings-sharp" size={18} color="#8B5CF6" />
            </View>
            <Text style={styles.menuLabel}>Settings</Text>
            <Ionicons name="chevron-forward" size={16} color="#7E7E8A" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, styles.lastItem]}
            onPress={() => setShowCoffeeModal(true)}
          >
            <View style={[styles.iconContainer, { backgroundColor: "#FFB8001F" }]}>
              <Ionicons name="cafe" size={18} color="#FFB800" />
            </View>
            <Text style={styles.menuLabel}>Buy Me a Coffee</Text>
            <Ionicons name="heart-outline" size={16} color="#FFB800" />
          </TouchableOpacity>
        </View>

        {/* Logout */}
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

      {/* Buy Me A Coffee Dialog */}
      <CoffeeSupportModal
        visible={showCoffeeModal}
        onClose={() => setShowCoffeeModal(false)}
      />

      {/* Settings Screen Full View */}
      <Modal
        visible={showSettingsModal}
        animationType="slide"
        onRequestClose={() => setShowSettingsModal(false)}
      >
        <SettingsScreen onClose={() => setShowSettingsModal(false)} />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0D0C13",
  },
  container: {
    flex: 1,
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
  badgeRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 6,
  },
  providerBadge: {
    backgroundColor: "rgba(255, 51, 75, 0.12)",
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: 4,
  },
  providerText: {
    color: "#FF334B",
    fontSize: 9,
    fontWeight: "700",
  },
  proBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 184, 0, 0.12)",
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: 4,
    gap: 3,
  },
  proText: {
    color: "#FFB800",
    fontSize: 9,
    fontWeight: "700",
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
  storageCard: {
    backgroundColor: "#16161F",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#22222E",
    marginTop: 14,
  },
  storageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  storageTitle: {
    fontSize: 12,
    color: "#DDDDE8",
    fontWeight: "600",
  },
  storageValue: {
    fontSize: 11,
    color: "#7E7E8A",
  },
  storageTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "#22222E",
    overflow: "hidden",
  },
  storageBar: {
    height: "100%",
    backgroundColor: "#10B981",
    borderRadius: 3,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: "700",
    color: "#7E7E8A",
    letterSpacing: 0.8,
    marginTop: 22,
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
