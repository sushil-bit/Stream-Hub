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

export default function SettingsScreen({ onClose, navigation }) {
  const [defaultTab, setDefaultTab] = useState("all"); // 'all' (Home), 'movie', 'tv'
  const [wifiOnly, setWifiOnly] = useState(true);
  const [autoPlayNext, setAutoPlayNext] = useState(true);
  const [hardwareAccel, setHardwareAccel] = useState(true);
  const [cacheSize, setCacheSize] = useState("38.4 MB");

  useEffect(() => {
    AsyncStorage.getItem("@streamhub_default_landing").then((val) => {
      if (val) setDefaultTab(val);
    });
  }, []);

  const handleSelectDefaultLanding = async (type) => {
    setDefaultTab(type);
    await AsyncStorage.setItem("@streamhub_default_landing", type);
  };

  const handleBack = () => {
    if (onClose) {
      onClose();
      return;
    }
    if (navigation?.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const clearAppCache = () => {
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
        <TouchableOpacity onPress={handleBack} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      {/* Default App Start Content */}
      <Text style={styles.sectionHeader}>STARTUP PREFERENCE</Text>
      <View style={styles.group}>
        <Text style={styles.selectorSubtitle}>Open automatically on app launch:</Text>
        <View style={styles.selectorRow}>
          {[
            { id: "all", label: "Home (All)", icon: "sparkles" },
            { id: "movie", label: "Movies", icon: "film" },
            { id: "tv", label: "Series", icon: "tv" },
          ].map((item) => {
            const isSelected = defaultTab === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.segmentBtn, isSelected && styles.segmentBtnActive]}
                onPress={() => handleSelectDefaultLanding(item.id)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={item.icon}
                  size={16}
                  color={isSelected ? "#FFFFFF" : "#7E7E8A"}
                />
                <Text style={[styles.segmentText, isSelected && styles.segmentTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
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
            <Text style={styles.rowSubtitle}>Saves mobile data on large video files</Text>
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
        <TouchableOpacity style={styles.clickableRow} onPress={clearAppCache} activeOpacity={0.7}>
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
    paddingTop: 52,
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
    padding: 14,
    overflow: "hidden",
  },
  selectorSubtitle: {
    fontSize: 12,
    color: "#7E7E8A",
    marginBottom: 12,
  },
  selectorRow: {
    flexDirection: "row",
    gap: 8,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0D0C13",
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#252535",
    gap: 6,
  },
  segmentBtnActive: {
    backgroundColor: "#FF334B",
    borderColor: "#FF334B",
  },
  segmentText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#7E7E8A",
  },
  segmentTextActive: {
    color: "#FFFFFF",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#1F1F2C",
  },
  clickableRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
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
