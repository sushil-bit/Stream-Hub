import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getDownloads, removeDownloadRecord } from '../services/downloadManager';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w185';

export default function DownloadsScreen({ navigation }) {

  const handleDownloadRemaining = (folder) => {
    if (!folder) return;
    if (folder.type === "movie") {
      // Re-trigger download config modal or single download for movie
      navigation.navigate("DetailsScreen", { media: folder.media || { id: folder.id, title: folder.title } });
      return;
    }
    // Navigate back to details screen with targeted season
    navigation.navigate("DetailsScreen", { 
      media: folder.media || { id: folder.id, name: folder.title, media_type: "tv" },
      autoOpenDownloads: true,
      targetSeason: folder.seasonNumber || 1
    });
  };
 navigation }) {
  const [folders, setFolders] = useState([]);
  const [expandedFolders, setExpandedFolders] = useState({});

  const loadData = async () => {
    const raw = await getDownloads();
    setFolders(Object.values(raw || {}));
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const toggleFolder = (key) => {
    setExpandedFolders((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDeleteFolder = (folderKey, title) => {
    Alert.alert('Delete Folder', `Remove all downloads for "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete All',
        style: 'destructive',
        onPress: async () => {
          await removeDownloadRecord(folderKey);
          loadData();
        },
      },
    ]);
  };

  const handleDeleteFile = (folderKey, fileId, name) => {
    Alert.alert('Delete File', `Remove "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await removeDownloadRecord(folderKey, fileId);
          loadData();
        },
      },
    ]);
  };

  const renderFolderItem = ({ item }) => {
    const isExpanded = !!expandedFolders[item.folderKey];
    const totalFiles = item.files?.length || 0;
    const poster = item.posterPath
      ? `${TMDB_IMAGE_BASE}${item.posterPath}`
      : 'https://via.placeholder.com/185x278.png?text=No+Cover';

    return (
      <View style={styles.folderCard}>
        {/* Folder Summary Row */}
        <TouchableOpacity
          style={styles.folderHeader}
          onPress={() => toggleFolder(item.folderKey)}
          activeOpacity={0.7}
        >
          <Image source={{ uri: poster }} style={styles.poster} />
          <View style={styles.folderMeta}>
            <Text style={styles.folderTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.folderSub}>
              {item.mediaType.toUpperCase()} • {totalFiles} {totalFiles === 1 ? 'file' : 'files'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.deleteFolderBtn}
            onPress={() => handleDeleteFolder(item.folderKey, item.title)}
          >
            <Ionicons name="trash-outline" size={18} color="#FF4D4D" />
          </TouchableOpacity>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={18}
            color="#8A8A9E"
            style={{ marginLeft: 8 }}
          />
        </TouchableOpacity>

        {/* Expanded Files / Episodes List */}
        {isExpanded && (
          <View style={styles.fileListContainer}>
            {item.files?.map((file) => (
              <View key={file.id} style={styles.fileRow}>
                <View style={styles.fileInfo}>
                  <Text style={styles.fileName} numberOfLines={1}>
                    {file.season
                      ? `S${file.season}:E${file.episode} - ${file.episodeName || 'Episode'}`
                      : file.title}
                  </Text>
                  <Text style={styles.fileBadges}>
                    {file.resolution} • {file.language?.split(' ')[0]} • Sub: {file.subtitle?.split(' ')[0]} • {file.size}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() =>
                    handleDeleteFile(
                      item.folderKey,
                      file.id,
                      file.episodeName || file.title
                    )
                  }
                  style={styles.deleteFileBtn}
                >
                  <Ionicons name="close-circle-outline" size={18} color="#8A8A9E" />
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
      <Text style={styles.screenHeader}>Downloaded Content</Text>
      {folders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="folder-open-outline" size={54} color="#454559" />
          <Text style={styles.emptyText}>No offline media downloaded yet.</Text>
        </View>
      ) : (
        <FlatList
          data={folders}
          keyExtractor={(item, index) => String(item?.folderKey || item?.id || item?.title || index)}
          renderItem={renderFolderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  folderStatusContainer: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  downloadRemainingBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 51, 75, 0.12)",
    paddingVertical: 6,
    paddingHorizontal: 12,
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
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
    gap: 6,
  },
  downloadCompleteText: {
    color: "#46D369",
    fontSize: 12,
    fontWeight: "600",
  },
  container: {
    flex: 1,
    backgroundColor: '#0F0F15',
    paddingTop: 50,
  },
  screenHeader: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 30,
    gap: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  emptyText: {
    color: '#707085',
    fontSize: 14,
  },
  folderCard: {
    backgroundColor: '#191924',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#28283C',
    overflow: 'hidden',
  },
  folderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  poster: {
    width: 44,
    height: 62,
    borderRadius: 6,
    backgroundColor: '#262638',
  },
  folderMeta: {
    flex: 1,
    marginLeft: 12,
  },
  folderTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  folderSub: {
    color: '#8A8A9E',
    fontSize: 12,
    marginTop: 4,
  },
  deleteFolderBtn: {
    padding: 6,
  },
  fileListContainer: {
    backgroundColor: '#13131D',
    borderTopWidth: 1,
    borderTopColor: '#242436',
    paddingVertical: 6,
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#20202F',
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    color: '#EDEDF5',
    fontSize: 13,
    fontWeight: '600',
  },
  fileBadges: {
    color: '#78788E',
    fontSize: 11,
    marginTop: 2,
  },
  deleteFileBtn: {
    padding: 4,
    marginLeft: 8,
  },
});
