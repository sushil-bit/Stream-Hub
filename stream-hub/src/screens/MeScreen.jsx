import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function MeScreen({ navigation }) {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem("@user_session").then((data) => {
      if (data) setProfile(JSON.parse(data));
    });
  }, []);

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out of Stream-Hub?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("@user_session");
          Alert.alert("Logged out", "Reload the app to test fresh login.");
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Account</Text>

      <View style={styles.profileCard}>
        <Image
          source={{ uri: profile?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200" }}
          style={styles.avatar}
        />
        <View style={styles.profileDetails}>
          <Text style={styles.username}>{profile?.username || "Stream-Hub Member"}</Text>
          <Text style={styles.email}>{profile?.email || "Signed in"}</Text>
          <View style={styles.providerBadge}>
            <Text style={styles.providerText}>
              via {(profile?.provider || "Direct").toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.optionsList}>
        <TouchableOpacity
          style={styles.optionItem}
          onPress={() => navigation.navigate("Downloads")}
        >
          <Ionicons name="folder-outline" size={20} color="#DDDDE8" />
          <Text style={styles.optionLabel}>Offline Storage & Downloads</Text>
          <Ionicons name="chevron-forward" size={18} color="#7E7E8A" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionItem} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#FF334B" />
          <Text style={[styles.optionLabel, { color: "#FF334B" }]}>Log Out</Text>
          <Ionicons name="chevron-forward" size={18} color="#7E7E8A" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0C13",
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 20,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#16161F",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#252535",
    marginBottom: 24,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#22222E",
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
    backgroundColor: "rgba(255, 51, 75, 0.15)",
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  providerText: {
    color: "#FF334B",
    fontSize: 10,
    fontWeight: "700",
  },
  optionsList: {
    backgroundColor: "#16161F",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#252535",
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#22222E",
  },
  optionLabel: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
  },
});
