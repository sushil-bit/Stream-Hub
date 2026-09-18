
const formatBytes = (bytes) => {
  if (!bytes || bytes === 0) return "0 MB";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function DownloadsScreen({ navigation }) {
  const [folders, setFolders] = useState([]);
  const [expandedFolders, setExpandedFolders] = useState({});

  const loadDownloads = async () => {
    try {
      const stored = await AsyncStorage.getItem("@streamhub_offline_downloads");

      let downloadMap = stored ? JSON.parse(stored) : {};
      
      // If empty, insert realistic sample downloads to view sizes and progress
      if (!downloadMap || Object.keys(downloadMap).length === 0) {
        downloadMap = {
          "mock_1": {
            id: "mock_1",
            mediaId: 1399,
            mediaTitle: "House of the Dragon",
            title: "House of the Dragon",
            name: "The Heirs of the Dragon (S1E1)",
            type: "tv",
            resolution: "1080p",
            sizeBytes: 1450000000,
            totalEpisodes: 10,
            status: "completed",
            poster: "https://image.tmdb.org/t/p/w500/1X4h40fcB4WWUmIBK0auT4zRBAV.jpg"
          },
          "mock_2": {
            id: "mock_2",
            mediaId: 1399,
            mediaTitle: "House of the Dragon",
            title: "House of the Dragon",
            name: "The Rogue Prince (S1E2)",
            type: "tv",
            resolution: "720p",
            sizeBytes: 780000000,
            totalEpisodes: 10,
            status: "downloading",
            progress: 0.65,
            poster: "https://image.tmdb.org/t/p/w500/1X4h40fcB4WWUmIBK0auT4zRBAV.jpg"
          },
          "mock_3": {
            id: "mock_3",
            mediaId: 299534,
            mediaTitle: "Avengers: Endgame",
            title: "Avengers: Endgame",
            name: "Avengers: Endgame",
            type: "movie",
            resolution: "1080p",
            sizeBytes: 2400000000,
            totalEpisodes: 1,
            status: "completed",
            poster: "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg"
          }
        };
      }


      
      const grouped = {};
      Object.values(downloadMap).forEach((item) => {
        const key = item.mediaTitle || item.title || "Uncategorized";
        const itemBytes = item.sizeBytes || (item.resolution === "1080p" ? 1400000000 : item.resolution === "480p" ? 350000000 : 750000000);
        
        if (!grouped[key]) {
          grouped[key] = {
            folderKey: key,
            title: key,
            poster: item.poster || null,
            type: item.type || "movie",
            mediaId: item.mediaId || item.id,
            totalCount: item.totalEpisodes || null,
            totalSizeBytes: 0,
            items: [],
          };
        }
        grouped[key].totalSizeBytes += itemBytes;
        grouped[key].items.push({ ...item, sizeBytes: itemBytes });
      });

      setFolders(Object.values(grouped));
    } catch (e) {
      console.warn("Failed to load downloads:", e);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", loadDownloads);
    loadDownloads();
    return unsubscribe;
  }, [navigation]);

  const toggleFolder = (key) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const deleteItem = async (folderKey, itemId) => {
    try {
      const stored = await AsyncStorage.getItem("@streamhub_offline_downloads");
      const downloadMap = stored ? JSON.parse(stored) : {};
      delete downloadMap[itemId];
      await AsyncStorage.setItem("@streamhub_offline_downloads", JSON.stringify(downloadMap));
      loadDownloads();
    } catch (e) {
      console.warn("Failed to delete item:", e);
    }
  };

  const handleDownloadRemaining = (folder) => {
    navigation.navigate("DetailsScreen", {
      media: { id: folder.mediaId, title: folder.title, name: folder.title },
      autoOpenDownloads: true,
    });
  };

  const renderFolderItem = ({ item }) => {
    const isExpanded = !!expandedFolders[item.folderKey];
    const downloadedCount = item.items.length;
    const hasRemaining = item.totalCount && downloadedCount < item.totalCount;

    return (
      <View style={styles.folderCard}>
        <TouchableOpacity
          style={styles.folderHeader}
          onPress={() => toggleFolder(item.folderKey)}
          activeOpacity={0.7}
        >
          {item.poster ? (
            <Image source={{ uri: item.poster }} style={styles.posterThumb} />
          ) : (
            <View style={styles.posterFallback}>
              <Ionicons name="film-outline" size={24} color="#7E7E8A" />
            </View>
          )}

          <View style={styles.folderInfo}>
            <Text style={styles.folderTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.folderSubtitle}>
              {downloadedCount} {downloadedCount === 1 ? "file" : "files"}
              {item.totalCount ? ` / ${item.totalCount} total` : ""} • {formatBytes(item.totalSizeBytes)}
            </Text>
          </View>

          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={20}
            color="#7E7E8A"
          />
        </TouchableOpacity>

        <View style={styles.folderStatusContainer}>
          {hasRemaining ? (
            <TouchableOpacity
              style={styles.downloadRemainingBtn}
              onPress={() => handleDownloadRemaining(item)}
              activeOpacity={0.7}
            >
              <Ionicons name="cloud-download-outline" size={14} color="#FF334B" />
              <Text style={styles.downloadRemainingText}>
                Download Remaining ({item.totalCount - downloadedCount} left)
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.downloadCompleteBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#46D369" />
              <Text style={styles.downloadCompleteText}>All Downloaded</Text>
            </View>
          )}
        </View>

        {isExpanded && (
          <View style={styles.filesList}>
            {item.items.map((file, idx) => (
              <View key={String(file.id || idx)} style={styles.fileRow}>
                <View style={styles.fileDetails}>
                  <Text style={styles.fileName} numberOfLines={1}>
                    {file.name || `Episode ${file.episodeNumber || idx + 1}`}
                  </Text>
                  
                  <Text style={styles.fileMeta}>
                    {file.resolution || "720p"} • {formatBytes(file.sizeBytes)}
                    {file.status === "downloading" ? ` • Downloading (${Math.round((file.progress || 0) * 100)}%)` : " • Completed"}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() =>
                    Alert.alert("Delete Download", "Remove this file?", [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Delete",
                        style: "destructive",
                        onPress: () => deleteItem(item.folderKey, file.id),
                      },
                    ])
                  }
                  style={styles.deleteBtn}
                >
                  <Ionicons name="trash-outline" size={18} color="#FF334B" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.screenHeader}>Offline Downloads</Text>
      {folders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cloud-offline-outline" size={60} color="#37374D" />
          <Text style={styles.emptyText}>No downloaded content yet</Text>
        </View>
      ) : (
        <FlatList
          data={folders}
          keyExtractor={(item, index) => String(item?.folderKey || index)}
          renderItem={renderFolderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0C13",
    paddingTop: 50,
  },
  screenHeader: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    marginHorizontal: 16,
    marginBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -50,
  },
  emptyText: {
    color: "#7E7E8A",
    fontSize: 15,
    marginTop: 12,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  folderCard: {
    backgroundColor: "#16161F",
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#252535",
  },
  folderHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  posterThumb: {
    width: 48,
    height: 64,
    borderRadius: 6,
    backgroundColor: "#20202E",
  },
  posterFallback: {
    width: 48,
    height: 64,
    borderRadius: 6,
    backgroundColor: "#20202E",
    alignItems: "center",
    justifyContent: "center",
  },
  folderInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  folderTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  folderSubtitle: {
    color: "#7E7E8A",
    fontSize: 13,
    marginTop: 4,
  },
  folderStatusContainer: {
    paddingHorizontal: 12,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  downloadRemainingBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 51, 75, 0.12)",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 51, 75, 0.3)",
    gap: 6,
  },
  downloadRemainingText: {
    color: "#FF334B",
    fontSize: 12,
    fontWeight: "600",
  },
  downloadCompleteBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(70, 211, 105, 0.12)",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    gap: 5,
  },
  downloadCompleteText: {
    color: "#46D369",
    fontSize: 12,
    fontWeight: "600",
  },
  filesList: {
    backgroundColor: "#111118",
    borderTopWidth: 1,
    borderTopColor: "#22222E",
    paddingHorizontal: 12,
  },
  fileRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1B1A24",
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    color: "#DDDDE8",
    fontSize: 14,
    fontWeight: "500",
  },
  fileMeta: {
    color: "#7E7E8A",
    fontSize: 12,
    marginTop: 2,
  },
  deleteBtn: {
    padding: 6,
    marginLeft: 10,
  },
});
