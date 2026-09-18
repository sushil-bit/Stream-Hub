import DownloadConfigModal from '../components/DownloadConfigModal.jsx';
import DownloadButton from '../components/DownloadButton.jsx';
import { getDownloads } from '../services/downloadManager';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  StatusBar,
  Share,
  Modal
} from 'react-native';

import CastRow from '../components/CastRow.jsx';
import RecommendationRow from '../components/RecommendationRow.jsx';
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, Feather } from "@expo/vector-icons";
import {
  IMAGE_BASE_URL,
  fetchTvDetails,
  fetchSeasonDetails,
} from "../services/api";
import { getWatchlist, toggleWatchlist } from "../services/storage";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const BACKDROP_HEIGHT = SCREEN_WIDTH * 1.1;
const IMAGE_URL = IMAGE_BASE_URL || "https://image.tmdb.org/t/p/w500";

export default function DetailsScreen({ route, navigation }) {
  const media = route?.params?.media || route?.params?.item || route?.params || {};
  const mediaId = media?.id || route?.params?.id;
  const isTv = Boolean(
    media?.first_air_date ||
    media?.name ||
    media?.number_of_seasons ||
    route?.params?.media_type === "tv" ||
    route?.params?.type === "tv"
  );
  const [loadingActor, setLoadingActor] = useState(false);
  const [selectedActor, setSelectedActor] = useState(null);
  const [actorDetails, setActorDetails] = useState(null);

  const handleActorPress = async (person) => {
    if (!person?.id) return;
    setSelectedActor(person);
    setLoadingActor(true);
    try {
      const TMDB_KEY = "fb2e44c3e763e38d9214c5266987acf3";
      const res = await fetch(
        `https://api.themoviedb.org/3/person/${person.id}?api_key=${TMDB_KEY}&append_to_response=combined_credits`
      );
      const data = await res.json();
      setActorDetails(data);
    } catch (err) {
      console.warn('Error fetching actor details:', err);
    } finally {
      setLoadingActor(false);
    }
  };
  const [extraData, setExtraData] = useState(null);

  
      const fetchMediaDetailsExtra = async (type, id) => {
    if (!id || id === "undefined" || id === "null" || isNaN(Number(id))) {
      return;
    }

    const TMDB_KEY = "fb2e44c3e763e38d9214c5266987acf3";
    let primaryType = (type === "tv" || type === "series") ? "tv" : "movie";
    let secondaryType = primaryType === "tv" ? "movie" : "tv";

    const tryFetch = async (targetType) => {
      const url = `https://api.themoviedb.org/3/${targetType}/${id}?api_key=${TMDB_KEY}&append_to_response=credits,recommendations`;
      const res = await fetch(url);
      if (!res.ok) return null;
      const text = await res.text();
      if (!text.trim().startsWith("{")) return null;
      return JSON.parse(text);
    };

    try {
      // 1. Try primary type
      let data = await tryFetch(primaryType);

      // 2. If TMDB 500 or 404, fallback to secondary type automatically
      if (!data) {
        data = await tryFetch(secondaryType);
      }

      if (data) {
        setExtraData(prev => ({
          ...(prev || {}),
          ...data,
          credits: {
            cast: data?.credits?.cast || [],
            crew: data?.credits?.crew || [],
          },
        }));
      }
    } catch (e) {
      console.warn("Media extras fetch caught:", e.message);
    }
  };

  console.log('[DEBUG Component Imports]', {
    CastRow: typeof CastRow,
    RecommendationRow: typeof RecommendationRow,
    LoadingPanel: typeof LoadingPanel,
    Ionicons: typeof Ionicons,
    Feather: typeof Feather,
    Modal: typeof Modal,
    LinearGradient: typeof LinearGradient,
    SafeAreaView: typeof SafeAreaView
  });
  

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodes, setEpisodes] = useState([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);

  const title = media.title || media.name || "Untitled Media";
  const releaseYear =
    media.release_date?.split("-")[0] ||
    media.first_air_date?.split("-")[0] ||
    media.year ||
    "2026";
  const rating = Number(media.vote_average || media.score || 7.5).toFixed(1);
  const overview =
    media.overview ||
    media.synopsis ||
    "No storyline available for this title yet. Tap Play to start streaming.";

  const posterUri = media.poster_path?.startsWith("http")
    ? media.poster_path
    : media.poster_path
      ? IMAGE_URL + media.poster_path
      : media.images?.jpg?.large_image_url ||
        "https://via.placeholder.com/500x750";

  const backdropUri = media.backdrop_path
    ? IMAGE_URL + media.backdrop_path
    : posterUri;



    const [loadingExtras, setLoadingExtras] = useState(false);
  const [episodeViewMode, setEpisodeViewMode] = useState('grid');
  const [seasonLayoutMode, setSeasonLayoutMode] = useState('dropdown'); // 'dropdown' | 'slideable'
  const [seasonModalVisible, setSeasonModalVisible] = useState(false);
  
  const [downloadMap, setDownloadMap] = useState({});
  const [downloadConfigVisible, setDownloadConfigVisible] = useState(false);

  useEffect(() => {
    if (mediaId) {
      const type = isTv ? "tv" : "movie";
      fetchMediaDetailsExtra(type, mediaId);
    }
  }, [mediaId, isTv]);

  useEffect(() => {
    checkBookmark();
    if (isTv && media && media.id) {
      loadTvMetadata();
    }
    if (media && media.id && !media.mal_id) {
      loadExtraDetails();
    }
  }, [media]);

  const loadExtraDetails = async () => {
    if (!media?.id) return;
    setLoadingExtras(true);
    try {
      const type = isTv ? 'tv' : 'movie';
      const key = 'fb2e44c3e763e38d9214c5266987acf3';

      const [recsRes, credsRes] = await Promise.allSettled([
        fetch(`https://api.themoviedb.org/3/${type}/${media.id}/recommendations?api_key=${key}&page=1`),
        fetch(`https://api.themoviedb.org/3/${type}/${media.id}/credits?api_key=${key}`)
      ]);

      const recommendations = recsRes.status === 'fulfilled'
        ? (await recsRes.value.json()).results || []
        : [];

      const credits = credsRes.status === 'fulfilled'
        ? await credsRes.value.json()
        : { cast: [], crew: [] };

      const directors = credits.crew ? credits.crew.filter(c => c.job === 'Director') : [];
      const topCast = credits.cast ? credits.cast.slice(0, 15) : [];

      console.log('[DEBUG_CAST]', { recommendations, topCast, directors }?.credits ? 'Has Credits: ' + { recommendations, topCast, directors }.credits.cast?.length : 'No Credits Key');
    setExtraData({ recommendations, topCast, directors });
    } catch (err) {
      console.warn('Failed to load extra details:', err);
    } finally {
      setLoadingExtras(false);
    }
  };


  const loadTvMetadata = async () => {
    try {
      const tvInfo = await fetchTvDetails(media.id);
      if (tvInfo?.seasons?.length) {
        // Filter out specials (season 0) if desired
        const validSeasons = tvInfo.seasons.filter((s) => s.season_number > 0);
        setSeasons(validSeasons.length ? validSeasons : tvInfo.seasons);
        const firstSeason = validSeasons[0]?.season_number || 1;
        setSelectedSeason(firstSeason);
        loadEpisodes(firstSeason);
      } else {
        // Fallback default season
        loadEpisodes(1);
      }
    } catch (err) {
      console.warn("Failed TV meta load:", err);
      loadEpisodes(1);
    }
  };

  const loadEpisodes = async (seasonNum) => {
    setLoadingEpisodes(true);
    try {
      const eps = await fetchSeasonDetails(media.id, seasonNum);
      setEpisodes(eps || []);
    } catch (err) {
      console.warn("Error fetching episodes:", err);
    } finally {
      setLoadingEpisodes(false);
    }
  };

  const handleSeasonSelect = (seasonNum) => {
    setSelectedSeason(seasonNum);
    loadEpisodes(seasonNum);
  };

  const checkBookmark = async () => {
    try {
      if (typeof getWatchlist === "function") {
        const list = await getWatchlist();
        const id = media.id || media.mal_id;
        setIsBookmarked(list.some((item) => (item.id || item.mal_id) === id));
      }
    } catch (e) {
      console.warn("Bookmark check error:", e);
    }
  };

  const handleBookmarkToggle = async () => {
    try {
      if (typeof toggleWatchlist === "function") {
        const added = await toggleWatchlist(media);
        setIsBookmarked(added);
      } else {
        setIsBookmarked(!isBookmarked);
      }
    } catch (e) {
      console.warn("Bookmark toggle error:", e);
    }
  };

  const launchPlayer = (seasonNum = 1, episodeNum = 1) => {
    navigation.navigate("PlayerScreen", {
      media: {
        ...media,
        selectedSeason: seasonNum,
        selectedEpisode: episodeNum,
      },
    });
  };

  const handleDownloadStatus = () => {
    getDownloads().then((map) => setDownloadMap(map || {}));
  };

  
  console.log('--- COMPONENT RUNTIME CHECK ---');
  console.log('SafeAreaView:', typeof SafeAreaView);
  console.log('LinearGradient:', typeof LinearGradient);
  console.log('Ionicons:', typeof Ionicons);
  console.log('Feather:', typeof Feather);
  console.log('CastRow:', typeof CastRow);
  console.log('RecommendationRow:', typeof RecommendationRow);
  console.log('Modal:', typeof Modal);
  console.log('-------------------------------');

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 130 }}
      >
        {/* Backdrop Image */}
        <View style={styles.heroWrapper}>
          <Image source={{ uri: backdropUri }} style={styles.backdropImage} />
          <LinearGradient
            colors={["rgba(10,10,14,0.2)", "rgba(10,10,14,0.75)", "#0A0A0E"]}
            locations={[0.2, 0.7, 1]}
            style={StyleSheet.absoluteFillObject}
          />

          <SafeAreaView style={styles.headerBar}>
            <TouchableOpacity
              style={styles.iconCircle}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-back" size={22} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconCircle}
              onPress={handleBookmarkToggle}
            >
              <Ionicons
                name={isBookmarked ? "bookmark" : "bookmark-outline"}
                size={20}
                color={isBookmarked ? "#FF334B" : "#FFF"}
              />
            </TouchableOpacity>
          </SafeAreaView>
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.mediaTitle}>{title}</Text>

          <View style={styles.tagsRow}>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={13} color="#FFB800" />
              <Text style={styles.ratingText}>{rating}</Text>
            </View>
            <View style={styles.pillBadge}>
              <Text style={styles.pillText}>{releaseYear}</Text>
            </View>
            <View style={styles.pillBadge}>
              <Text style={styles.pillText}>HD</Text>
            </View>
            <View style={styles.pillBadge}>
              <Text style={styles.pillText}>
                {media.isAnime ? "ANIME" : isTv ? "SERIES" : "MOVIE"}
              </Text>
            </View>
          </View>

          {/* Action Row */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.playButton}
              activeOpacity={0.85}
              onPress={() => launchPlayer(selectedSeason, 1)}
            >
              <LinearGradient
                colors={["#FF4D64", "#D81B34"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.playGradient}
              >
                <Ionicons
                  name="play"
                  size={20}
                  color="#FFF"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.playText}>
                  {isTv ? "Watch S" + selectedSeason + " E1" : "Play Now"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.heroDownloadTriggerBtn}
              onPress={() => setDownloadConfigVisible(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="download-outline" size={20} color="#FFFFFF" />
              <Text style={styles.heroDownloadTriggerText}>Download</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.bookmarkBtn}
              onPress={handleBookmarkToggle}
            >
              <Feather
                name={isBookmarked ? "check" : "plus"}
                size={22}
                color={isBookmarked ? "#FF334B" : "#FFF"}
              />
            </TouchableOpacity>
          </View>

          {/* Storyline */}
          <View style={styles.synopsisSection}>
            <Text style={styles.sectionHeader}>Storyline</Text>
            <Text style={styles.overviewText}>{overview}</Text>
          </View>

          {/* Seasons & Episodes Section (Only rendered for TV Shows & Anime) */}
          <CastRow
        cast={extraData?.credits?.cast || []}
        crew={extraData?.credits?.crew || []}
        onSelectActor={handleActorPress}
      />
      {isTv && (
        <View style={styles.tvSectionContainer}>
          {/* Seasons Header + Layout Mode Toggle (Dropdown vs Slideable) */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitleText}>Seasons</Text>
            <View style={styles.toggleButtonGroup}>
              <TouchableOpacity
                style={[styles.modeToggleBtn, seasonLayoutMode === 'dropdown' && styles.modeToggleBtnActive]}
                onPress={() => setSeasonLayoutMode('dropdown')}
              >
                <Ionicons
                  name="chevron-down-circle-outline"
                  size={17}
                  color={seasonLayoutMode === 'dropdown' ? '#FFFFFF' : '#888888'}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeToggleBtn, seasonLayoutMode === 'slideable' && styles.modeToggleBtnActive]}
                onPress={() => setSeasonLayoutMode('slideable')}
              >
                <Ionicons
                  name="swap-horizontal-outline"
                  size={17}
                  color={seasonLayoutMode === 'slideable' ? '#FFFFFF' : '#888888'}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Season View: Downward Dropdown OR Slideable Horizontal Pills */}
          {seasonLayoutMode === 'dropdown' ? (
            <View style={styles.seasonDropdownWrapper}>
              <TouchableOpacity
                style={styles.seasonDropdownTriggerBtn}
                onPress={() => setSeasonModalVisible(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.seasonDropdownBtnText}>
                  {seasons.find(s => s.season_number === selectedSeason)?.name || `Season ${selectedSeason}`}
                </Text>
                <Ionicons name="chevron-down" size={17} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.slideableSeasonsContent}
            >
              {(seasons && seasons.length > 0
                ? seasons.filter(s => s.season_number > 0)
                : Array.from({ length: media?.number_of_seasons || 1 }, (_, i) => ({
                    season_number: i + 1,
                    name: `Season ${i + 1}`
                  }))
              ).map((s) => {
                const sNum = s.season_number;
                const isSelected = selectedSeason === sNum;
                return (
                  <TouchableOpacity
                    key={sNum}
                    style={[styles.seasonSlidePill, isSelected && styles.seasonSlidePillActive]}
                    onPress={() => setSelectedSeason(sNum)}
                  >
                    <Text style={[styles.seasonSlidePillText, isSelected && styles.seasonSlidePillTextActive]}>
                      Season {sNum}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          {/* Episodes Header + Layout Mode Toggle (Grid vs List) */}
          <View style={[styles.sectionHeaderRow, { marginTop: 14 }]}>
            <Text style={styles.sectionTitleText}>Episodes</Text>
            <View style={styles.toggleButtonGroup}>
              <TouchableOpacity
                style={[styles.modeToggleBtn, episodeViewMode === 'grid' && styles.modeToggleBtnActive]}
                onPress={() => setEpisodeViewMode('grid')}
              >
                <Ionicons
                  name="grid-outline"
                  size={17}
                  color={episodeViewMode === 'grid' ? '#FFFFFF' : '#888888'}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeToggleBtn, episodeViewMode === 'list' && styles.modeToggleBtnActive]}
                onPress={() => setEpisodeViewMode('list')}
              >
                <Ionicons
                  name="list-outline"
                  size={17}
                  color={episodeViewMode === 'list' ? '#FFFFFF' : '#888888'}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Episode List Rendering */}
          {loadingEpisodes ? (
            <ActivityIndicator size="small" color="#E50914" style={{ marginVertical: 20 }} />
          ) : episodeViewMode === 'grid' ? (
            <View style={styles.episodesGridContainer}>
              {(episodes && episodes.length > 0
                ? episodes
                : Array.from({ length: 16 }, (_, i) => ({ episode_number: i + 1, name: `Episode ${i + 1}` }))
              ).map((ep) => {
                const epNum = ep.episode_number;
                return (
                  <TouchableOpacity
                    key={epNum}
                    style={styles.episodeGridCard}
                    onPress={() => launchPlayer(selectedSeason, epNum)}
                  >
                    <Ionicons name="play" size={13} color="#E50914" />
                    <Text style={styles.episodeGridCardText}>Ep {epNum}</Text>
                    {downloadMap[`${media?.id}_s${selectedSeason}_e${epNum}`] && (
                      <Ionicons name="checkmark-circle" size={12} color="#46D369" style={{ marginLeft: 3 }} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <View style={styles.episodesListContainer}>
              {(episodes && episodes.length > 0
                ? episodes
                : Array.from({ length: 16 }, (_, i) => ({ episode_number: i + 1, name: `Episode ${i + 1}`, overview: 'No overview available.' }))
              ).map((ep) => {
                const epNum = ep.episode_number;
                return (
                  <View key={epNum} style={styles.episodeListItemRow}>
                    <TouchableOpacity
                      style={styles.episodeListMainTouchable}
                      onPress={() => launchPlayer(selectedSeason, epNum)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.episodeListPlayBadge}>
                        <Ionicons name="play" size={15} color="#FFFFFF" />
                      </View>
                      <View style={styles.episodeListContent}>
                        <Text style={styles.episodeListTitle} numberOfLines={1}>
                          {epNum}. {ep.name || `Episode ${epNum}`}
                        </Text>
                        {ep.overview ? (
                          <Text style={styles.episodeListOverview} numberOfLines={2}>
                            {ep.overview}
                          </Text>
                        ) : null}
                      </View>
                    </TouchableOpacity>
                    <DownloadButton
                      itemKey={`${media?.id}_s${selectedSeason}_e${epNum}`}
                      title={`${media?.name || media?.title} - S${selectedSeason}E${epNum}`}
                      mediaType="tv"
                      season={selectedSeason}
                      episode={epNum}
                      isDownloaded={!!downloadMap[`${media?.id}_s${selectedSeason}_e${epNum}`]}
                      onStatusChange={handleDownloadStatus}
                      size={22}
                      style={styles.listDownloadBtn}
                    />
                  </View>
                );
              })}
            </View>
          )}
        </View>
      )}

      <RecommendationRow 
          items={extraData?.recommendations?.results || extraData?.recommendations || []} 
          type={isTv ? 'tv' : 'movie'} 
          navigation={navigation} 
        />
      </View>
      
      {/* Season Selection Modal */}
      <Modal
        visible={seasonModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSeasonModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSeasonModalVisible(false)}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Season</Text>
              <TouchableOpacity onPress={() => setSeasonModalVisible(false)}>
                <Ionicons name="close" size={22} color="#AAAAAA" />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 320 }}>
              {(seasons && seasons.length > 0
                ? seasons.filter(s => s.season_number > 0)
                : Array.from({ length: media?.number_of_seasons || 1 }, (_, i) => ({
                    season_number: i + 1,
                    name: `Season ${i + 1}`
                  }))
              ).map((s) => {
                const sNum = s.season_number;
                const isSelected = selectedSeason === sNum;
                return (
                  <TouchableOpacity
                    key={sNum}
                    style={[styles.seasonOptionRow, isSelected && styles.seasonOptionRowActive]}
                    onPress={() => {
                      setSelectedSeason(sNum);
                      setSeasonModalVisible(false);
                    }}
                  >
                    <Text style={[styles.seasonOptionText, isSelected && styles.seasonOptionTextActive]}>
                      {s.name || `Season ${sNum}`}
                    </Text>
                    {isSelected && <Ionicons name="checkmark" size={20} color="#E50914" />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Actor Bio & Filmography Modal */}
      <Modal
        visible={!!selectedActor}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSelectedActor(null)}
      >
        <View style={styles.actorModalBackdrop}>
          <View style={styles.actorModalContainer}>
            <View style={styles.actorModalHeader}>
              <Text style={styles.actorModalTitle} numberOfLines={1}>
                {selectedActor?.name}
              </Text>
              <TouchableOpacity onPress={() => setSelectedActor(null)}>
                <Ionicons name="close-circle" size={26} color="#8A8A9E" />
              </TouchableOpacity>
            </View>

            {loadingActor ? (
              <ActivityIndicator size="large" color="#E50914" style={{ marginVertical: 40 }} />
            ) : (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                <View style={styles.actorProfileRow}>
                  <Image
                    source={{
                      uri: selectedActor?.profile_path
                        ? `https://image.tmdb.org/t/p/w185${selectedActor.profile_path}`
                        : 'https://via.placeholder.com/185x278.png?text=No+Photo'
                    }}
                    style={styles.actorModalAvatar}
                  />
                  <View style={styles.actorProfileDetails}>
                    {actorDetails?.bio?.birthday ? (
                      <Text style={styles.actorMetaText}>Born: {actorDetails.bio.birthday}</Text>
                    ) : null}
                    {actorDetails?.bio?.place_of_birth ? (
                      <Text style={styles.actorMetaText} numberOfLines={2}>
                        From: {actorDetails.bio.place_of_birth}
                      </Text>
                    ) : null}
                    {actorDetails?.bio?.known_for_department ? (
                      <Text style={styles.actorMetaText}>Role: {actorDetails.bio.known_for_department}</Text>
                    ) : null}
                  </View>
                </View>

                {actorDetails?.bio?.biography ? (
                  <View style={styles.actorBioSection}>
                    <Text style={styles.actorSubheading}>Biography</Text>
                    <Text style={styles.actorBioBody} numberOfLines={6}>
                      {actorDetails.bio.biography}
                    </Text>
                  </View>
                ) : null}

                <View style={styles.actorCreditsSection}>
                  <Text style={styles.actorSubheading}>Known For & Filmography</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingTop: 8 }}>
                    {(actorDetails?.credits || [])
                      .filter(item => item.poster_path)
                      .slice(0, 20)
                      .map((item) => (
                        <TouchableOpacity
                          key={`${item.id}-${item.media_type}`}
                          style={styles.creditCard}
                          activeOpacity={0.7}
                          onPress={() => {
                            setSelectedActor(null);
                            navigation.push('DetailsScreen', { media: item });
                          }}
                        >
                          <Image
                            source={{ uri: `https://image.tmdb.org/t/p/w185${item.poster_path}` }}
                            style={styles.creditPoster}
                          />
                          <Text style={styles.creditTitle} numberOfLines={1}>
                            {item.title || item.name}
                          </Text>
                          <Text style={styles.creditCharacter} numberOfLines={1}>
                            {item.character ? item.character : item.media_type?.toUpperCase()}
                          </Text>
                        </TouchableOpacity>
                      ))}
                  </ScrollView>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

</ScrollView>
      <DownloadConfigModal
        visible={downloadConfigVisible}
        onClose={() => setDownloadConfigVisible(false)}
        media={media}
        season={selectedSeason}
        episodes={episodes || []}
        onDownloadStarted={() => {
          getDownloads().then((map) => setDownloadMap(map || {}));
        }}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  heroDownloadTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#20202E',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#37374D',
    marginLeft: 10,
    gap: 6,
  },
  heroDownloadTriggerText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  openDownloadConfigBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#222230',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#36364A',
    marginLeft: 10,
  },
  openDownloadConfigText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  episodeGridCardWrapper: {
    width: '23%',
    position: 'relative',
    marginBottom: 8,
  },
  gridDownloadBtn: {
    position: 'absolute',
    top: 2,
    right: 2,
    padding: 3,
    backgroundColor: 'rgba(20,20,28,0.85)',
    borderRadius: 10,
  },
  episodeListItemRow: {
    flexDirection: 'row',
    backgroundColor: '#1C1C24',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#292938',
    marginBottom: 8,
  },
  episodeListMainTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  listDownloadBtn: {
    padding: 8,
    backgroundColor: '#242434',
    borderRadius: 20,
    marginLeft: 10,
  },
  actorModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  actorModalContainer: {
    backgroundColor: '#16161F',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: '#2A2A3A',
  },
  actorModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#242432',
  },
  actorModalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  actorProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },
  actorModalAvatar: {
    width: 75,
    height: 75,
    borderRadius: 38,
    backgroundColor: '#252533',
    borderWidth: 1,
    borderColor: '#3D3D4E',
  },
  actorProfileDetails: {
    flex: 1,
    gap: 3,
  },
  actorMetaText: {
    color: '#A2A2B8',
    fontSize: 12,
  },
  actorBioSection: {
    marginBottom: 16,
  },
  actorSubheading: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  actorBioBody: {
    color: '#9595A8',
    fontSize: 12,
    lineHeight: 18,
  },
  actorCreditsSection: {
    marginBottom: 10,
  },
  creditCard: {
    width: 95,
  },
  creditPoster: {
    width: 95,
    height: 140,
    borderRadius: 8,
    backgroundColor: '#252533',
    marginBottom: 5,
  },
  creditTitle: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  creditCharacter: {
    color: '#7D7D92',
    fontSize: 10,
  },
  tvSectionContainer: {
    marginVertical: 14,
    paddingHorizontal: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitleText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  toggleButtonGroup: {
    flexDirection: 'row',
    backgroundColor: '#1C1C24',
    borderRadius: 8,
    padding: 3,
    borderWidth: 1,
    borderColor: '#2A2A38',
  },
  modeToggleBtn: {
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  modeToggleBtnActive: {
    backgroundColor: '#2E2E3E',
  },
  seasonDropdownWrapper: {
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  seasonDropdownTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E26',
    paddingVertical: 9,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2E2E3E',
    gap: 8,
  },
  seasonDropdownBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  slideableSeasonsContent: {
    gap: 8,
    paddingBottom: 6,
  },
  seasonSlidePill: {
    backgroundColor: '#1E1E26',
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#2A2A38',
    marginRight: 6,
  },
  seasonSlidePillActive: {
    backgroundColor: '#E50914',
    borderColor: '#E50914',
  },
  seasonSlidePillText: {
    color: '#9E9EB2',
    fontSize: 13,
    fontWeight: '600',
  },
  seasonSlidePillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  episodesGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  episodeGridCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1C1C24',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    minWidth: '22%',
    flexGrow: 1,
    borderWidth: 1,
    borderColor: '#292938',
    gap: 6,
  },
  episodeGridCardText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  episodesListContainer: {
    gap: 10,
  },
  episodeListItem: {
    flexDirection: 'row',
    backgroundColor: '#1C1C24',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#292938',
    marginBottom: 8,
  },
  episodeListPlayBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E50914',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  episodeListContent: {
    flex: 1,
    paddingRight: 10,
  },
  episodeDownloadBtn: {
    padding: 8,
    backgroundColor: '#242434',
    borderRadius: 20,
    marginLeft: 8,
  },
  episodeListTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 3,
  },
  episodeListOverview: {
    color: '#8A8A9E',
    fontSize: 12,
    lineHeight: 16,
  },
  seasonSectionWrapper: {
    marginBottom: 14,
  },
  seasonHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  seasonDropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E26',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2F2F3D',
    gap: 6,
  },
  seasonDropdownLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  seasonPillScroller: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 16,
  },
  seasonPillItem: {
    backgroundColor: '#181820',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#282836',
  },
  seasonPillItemActive: {
    backgroundColor: '#E50914',
    borderColor: '#E50914',
  },
  seasonPillText: {
    color: '#8E8E9F',
    fontSize: 13,
    fontWeight: '600',
  },
  seasonPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  seasonDropdownRow: {
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  seasonDropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E24',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2F2F3D',
    gap: 10,
  },
  seasonDropdownText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#16161D',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 36,
    borderWidth: 1,
    borderColor: '#2D2D3B',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  seasonOptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#242432',
  },
  seasonOptionRowActive: {
    backgroundColor: '#1E1E26',
    borderRadius: 6,
    paddingHorizontal: 8,
  },
  seasonOptionText: {
    color: '#A0A0B2',
    fontSize: 15,
  },
  seasonOptionTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  tvSectionContainer: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  sectionHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  seasonScrollContent: {
    paddingBottom: 14,
    gap: 8,
  },
  seasonPill: {
    backgroundColor: '#1E1E24',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2D2D38',
    marginRight: 8,
  },
  seasonPillActive: {
    backgroundColor: '#E50914',
    borderColor: '#E50914',
  },
  seasonPillText: {
    color: '#A0A0B0',
    fontSize: 13,
    fontWeight: '600',
  },
  seasonPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  episodesHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 12,
  },
  viewToggleGroup: {
    flexDirection: 'row',
    backgroundColor: '#1E1E24',
    borderRadius: 8,
    padding: 3,
  },
  toggleBtn: {
    padding: 6,
    borderRadius: 6,
  },
  toggleBtnActive: {
    backgroundColor: '#2D2D38',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  gridCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E1E24',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 8,
    minWidth: '22%',
    flexGrow: 1,
    borderWidth: 1,
    borderColor: '#2A2A35',
    gap: 6,
  },
  gridCardText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  listContainer: {
    gap: 10,
  },
  listItemCard: {
    flexDirection: 'row',
    backgroundColor: '#1E1E24',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2A35',
  },
  listBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E50914',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  listDetails: {
    flex: 1,
  },
  listTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 3,
  },
  listOverview: {
    color: '#8A8A9E',
    fontSize: 12,
    lineHeight: 16,
  },
  container: { flex: 1, backgroundColor: "#0A0A0E" },
  heroWrapper: { width: SCREEN_WIDTH, height: BACKDROP_HEIGHT },
  backdropImage: { width: "100%", height: "100%", resizeMode: "cover" },
  headerBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(22,22,32,0.75)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  contentContainer: { paddingHorizontal: 20, marginTop: -32 },
  mediaTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  tagsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    flexWrap: "wrap",
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,184,0,0.15)",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,184,0,0.3)",
  },
  ratingText: {
    color: "#FFB800",
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 4,
  },
  pillBadge: {
    backgroundColor: "#161622",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#232332",
  },
  pillText: { color: "#8E8E9E", fontSize: 11, fontWeight: "700" },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 20,
  },
  playButton: { flex: 1, height: 50, borderRadius: 25, overflow: "hidden" },
  playGradient: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  playText: { color: "#FFF", fontSize: 15, fontWeight: "700" },
  bookmarkBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#161622",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#242434",
  },
  synopsisSection: { marginTop: 24 },
  sectionHeader: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 10,
  },
  overviewText: { color: "#9E9EB0", fontSize: 14, lineHeight: 22 },
  episodesWrapper: { marginTop: 28 },
  seasonHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  seasonsScroll: { gap: 10, paddingVertical: 10 },
  seasonChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: "#161622",
    borderWidth: 1,
    borderColor: "#242434",
  },
  seasonChipActive: { backgroundColor: "#FF334B", borderColor: "#FF334B" },
  seasonChipText: { color: "#8E8E9E", fontSize: 13, fontWeight: "600" },
  seasonChipTextActive: { color: "#FFF" },
  episodesLoader: { paddingVertical: 30, alignItems: "center" },
  episodeList: { gap: 14, marginTop: 10 },
  episodeCard: {
    flexDirection: "row",
    backgroundColor: "#14141E",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "#22222E",
  },
  thumbWrapper: {
    width: 110,
    height: 68,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#0A0A0E",
  },
  thumbImg: { width: "100%", height: "100%", resizeMode: "cover" },
  playIconMini: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  epDetails: { flex: 1, marginLeft: 12, justifyContent: "center" },
  epNumber: { color: "#FF334B", fontSize: 11, fontWeight: "700" },
  epTitle: { color: "#FFF", fontSize: 14, fontWeight: "700", marginTop: 2 },
  epOverview: { color: "#7E7E8E", fontSize: 11, lineHeight: 16, marginTop: 4 },
  fallbackEpGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  fallbackEpButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#161622",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#242434",
    width: "48%",
  },
  fallbackEpText: { color: "#FFF", fontSize: 12, fontWeight: "600" },
});
