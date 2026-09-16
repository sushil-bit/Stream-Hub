import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SettingsScreen({ navigation }) {
  const [wifiOnly, setWifiOnly] = useState(true);
  const [autoPlayNext, setAutoPlayNext] = useState(true);
  const [hardwareAccel, setHardwareAccel] = useState(true);
  const [cacheSize, setCacheSize] = useState("38.4 MB");

  const clearAppCache = async () => {
    Alert.alert("Clear Cache", "This will free up cached posters and preview files.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: () => {
          setCacheSize("0.0 MB");
          Alert.alert("Success", "Cache cleared successfully.");
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      {/* Playback Settings */}
      <Text style={styles.sectionHeader}>PLAYBACK & SERVERS</Text>
      <View style={styles.group}>
        <View style={styles.row}>
          <View style={styles.rowLabelGroup}>
            <Text style={styles.rowTitle}>Auto-play Next Episode</Text>
            <Text style={styles.rowSubtitle}>Starts upcoming episode automatically</Text>
          </View>
          <Switch
            value={autoPlayNext}
            onValueChange={setAutoPlayNext}
            thumbColor={autoPlayNext ? "#FF334B" : "#4A4A5A"}
            trackColor={{ false: "#252535", true: "#FF334B44" }}
          />
        </View>

        <View style={styles.row}>
          <View style={styles.rowLabelGroup}>
            <Text style={styles.rowTitle}>Hardware Acceleration</Text>
            <Text style={styles.rowSubtitle}>Optimizes smooth WebView video rendering</Text>
          </View>
          <Switch
            value={hardwareAccel}
            onValueChange={setHardwareAccel}
            thumbColor={hardwareAccel ? "#FF334B" : "#4A4A5A"}
            trackColor={{ false: "#252535", true: "#FF334B44" }}
          />
        </View>
      </View>

      {/* Downloads Settings */}
      <Text style={styles.sectionHeader}>DOWNLOAD PREFERENCES</Text>
      <View style={styles.group}>
        <View style={styles.row}>
          <View style={styles.rowLabelGroup}>
            <Text style={styles.rowTitle}>Download via Wi-Fi Only</Text>
            <Text style={styles.rowSubtitle}>Saves cellular data on large downloads</Text>
          </View>
          <Switch
            value={wifiOnly}
            onValueChange={setWifiOnly}
            thumbColor={wifiOnly ? "#FF334B" : "#4A4A5A"}
            trackColor={{ false: "#252535", true: "#FF334B44" }}
          />
        </View>
      </View>

      {/* Storage Management */}
      <Text style={styles.sectionHeader}>STORAGE & DATA</Text>
      <View style={styles.group}>
        <TouchableOpacity style={styles.clickableRow} onPress={clearAppCache}>
          <View style={styles.rowLabelGroup}>
            <Text style={styles.rowTitle}>Clear Image Cache</Text>
            <Text style={styles.rowSubtitle}>{cacheSize} cached posters and metadata</Text>
          </View>
          <Ionicons name="trash-outline" size={18} color="#FF334B" />
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
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 12,
  },
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: "700",
    color: "#7E7E8A",
    letterSpacing: 0.8,
    marginTop: 20,
    marginBottom: 8,
    marginLeft: 4,
  },
  group: {
    backgroundColor: "#16161F",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#22222E",
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1F1F2C",
  },
  clickableRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowLabelGroup: {
    flex: 1,
    paddingRight: 12,
  },
  rowTitle: {
    fontSize: 14,
    color: "#DDDDE8",
    fontWeight: "600",
  },
  rowSubtitle: {
    fontSize: 12,
    color: "#7E7E8A",
    marginTop: 2,
  },
});
