import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { saveDownloadRecord } from '../services/downloadManager';

const RESOLUTIONS = ['1080p Full HD', '720p HD', '480p SD'];
const LANGUAGES = ['English (Original)', 'Japanese', 'Spanish', 'Hindi', 'French'];
const SUBTITLES = ['English [CC]', 'Spanish', 'French', 'None'];

export default function DownloadConfigModal({
  visible,
  onClose,
  media,
  season,
  episodes = [],
  onDownloadStarted,
}) {
  const [resolution, setResolution] = useState('1080p Full HD');
  const [language, setLanguage] = useState('English (Original)');
  const [subtitle, setSubtitle] = useState('English [CC]');
  const [processing, setProcessing] = useState(false);

  const isTv = media?.media_type === 'tv' || (!media?.title && !!media?.name);

  const triggerSave = async (fileList) => {
    setProcessing(true);
    for (const item of fileList) {
      await saveDownloadRecord({
        id: `${media?.id}_${item.season ? `s${item.season}_e${item.episode}` : 'movie'}`,
        mediaId: media?.id,
        title: media?.name || media?.title,
        season: item.season,
        episode: item.episode,
        episodeName: item.name,
        mediaType: isTv ? 'tv' : 'movie',
        posterPath: media?.poster_path,
        resolution,
        language,
        subtitle,
        size: resolution.includes('1080p') ? '1.2 GB' : resolution.includes('720p') ? '650 MB' : '320 MB',
      });
    }
    setProcessing(false);
    if (onDownloadStarted) onDownloadStarted();
    onClose();
  };

  const handleDownloadSingle = (ep = null) => {
    if (isTv && ep) {
      triggerSave([{ season, episode: ep.episode_number, name: ep.name }]);
    } else {
      triggerSave([{ name: media?.title || media?.name }]);
    }
  };

  const handleDownloadAll = () => {
    const list = episodes.map((ep) => ({
      season,
      episode: ep.episode_number,
      name: ep.name,
    }));
    triggerSave(list);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title} numberOfLines={1}>
                {media?.name || media?.title}
              </Text>
              <Text style={styles.subTitle}>
                {isTv ? `Season ${season} • Download Options` : 'Movie • Download Options'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-circle" size={26} color="#8A8A9E" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            {/* Resolution Selector */}
            <Text style={styles.sectionLabel}>Resolution</Text>
            <View style={styles.pillRow}>
              {RESOLUTIONS.map((res) => (
                <TouchableOpacity
                  key={res}
                  style={[styles.pill, resolution === res && styles.pillActive]}
                  onPress={() => setResolution(res)}
                >
                  <Text style={[styles.pillText, resolution === res && styles.pillTextActive]}>
                    {res}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Language Selector */}
            <Text style={styles.sectionLabel}>Audio Language</Text>
            <View style={styles.pillRow}>
              {LANGUAGES.map((lang) => (
                <TouchableOpacity
                  key={lang}
                  style={[styles.pill, language === lang && styles.pillActive]}
                  onPress={() => setLanguage(lang)}
                >
                  <Text style={[styles.pillText, language === lang && styles.pillTextActive]}>
                    {lang}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Subtitles / Captions */}
            <Text style={styles.sectionLabel}>Subtitles / Captions</Text>
            <View style={styles.pillRow}>
              {SUBTITLES.map((sub) => (
                <TouchableOpacity
                  key={sub}
                  style={[styles.pill, subtitle === sub && styles.pillActive]}
                  onPress={() => setSubtitle(sub)}
                >
                  <Text style={[styles.pillText, subtitle === sub && styles.pillTextActive]}>
                    {sub}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Action Buttons */}
            {processing ? (
              <ActivityIndicator size="large" color="#E50914" style={{ marginVertical: 20 }} />
            ) : isTv ? (
              <View style={styles.actionBlock}>
                <TouchableOpacity style={styles.batchBtn} onPress={handleDownloadAll}>
                  <Ionicons name="cloud-download" size={18} color="#FFFFFF" />
                  <Text style={styles.batchBtnText}>All Episodes Download ({episodes.length})</Text>
                </TouchableOpacity>

                <Text style={[styles.sectionLabel, { marginTop: 16 }]}>Or Select Individual Episode</Text>
                <View style={styles.episodesGrid}>
                  {episodes.map((ep) => (
                    <TouchableOpacity
                      key={ep.episode_number}
                      style={styles.epBadge}
                      onPress={() => handleDownloadSingle(ep)}
                    >
                      <Ionicons name="arrow-down-circle-outline" size={14} color="#E50914" />
                      <Text style={styles.epBadgeText}>Ep {ep.episode_number}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : (
              <TouchableOpacity style={styles.batchBtn} onPress={() => handleDownloadSingle()}>
                <Ionicons name="download" size={18} color="#FFFFFF" />
                <Text style={styles.batchBtnText}>Start Movie Download</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#16161F',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    padding: 16,
    borderWidth: 1,
    borderColor: '#29293B',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#242436',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    maxWidth: 270,
  },
  subTitle: {
    color: '#8A8A9E',
    fontSize: 12,
    marginTop: 2,
  },
  scroll: {
    paddingVertical: 14,
  },
  sectionLabel: {
    color: '#D8D8E6',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  pill: {
    backgroundColor: '#20202E',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2E2E42',
  },
  pillActive: {
    backgroundColor: '#E50914',
    borderColor: '#E50914',
  },
  pillText: {
    color: '#9595AA',
    fontSize: 12,
    fontWeight: '600',
  },
  pillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  actionBlock: {
    marginTop: 12,
  },
  batchBtn: {
    backgroundColor: '#E50914',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 14,
  },
  batchBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  episodesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  epBadge: {
    backgroundColor: '#212130',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2D2D42',
  },
  epBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
