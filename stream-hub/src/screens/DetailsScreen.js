import LoadingPanel from "../components/Common/LoadingPanel";
import { CastRow } from '../components/CastRow';
import { RecommendationRow } from '../components/RecommendationRow';
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ActivityIndicator,
} from "react-native";
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

const fetchMediaDetailsExtra = async (type, id) => {
  try {
    const TMDB_KEY = "fb2e44c3e763e38d9214c5266987acf3";
    const [recsRes, credsRes] = await Promise.allSettled([
      fetch(`https://api.themoviedb.org/3/${type}/${id}/recommendations?api_key=${TMDB_KEY}&page=1`),
      fetch(`https://api.themoviedb.org/3/${type}/${id}/credits?api_key=${TMDB_KEY}`),
    ]);

    const recommendations = recsRes.status === 'fulfilled'
      ? (await recsRes.value.json()).results || []
      : [];

    const credits = credsRes.status === 'fulfilled'
      ? await credsRes.value.json()
      : { cast: [], crew: [] };

    const directors = credits.crew ? credits.crew.filter((c) => c.job === 'Director') : [];
    const topCast = credits.cast ? credits.cast.slice(0, 15) : [];

    return { recommendations, topCast, directors };
  } catch (err) {
    return { recommendations: [], topCast: [], directors: [] };
  }
};

export default function DetailsScreen({ route, navigation }) {
  const media = route?.params?.media || {};
  const isTv =
    media.media_type === "tv" || media.isAnime || !!media.first_air_date;

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



    const [extraData, setExtraData] = useState({
    recommendations: [],
    topCast: [],
    directors: [],
  });
  const [loadingExtras, setLoadingExtras] = useState(false);


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
    console.log('[DEBUG Details] Loading extras for:', media?.id, 'isTv:', isTv);
    setLoadingExtras(true);
    try {
      const type = isTv ? 'tv' : 'movie';
      const data = await (type, media.id);
      console.log('[DEBUG Details] Received extra data:', JSON.stringify(data)?.slice(0, 100));
    setExtraData(data);
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
          {isTv && (
            <View style={styles.episodesWrapper}>
              <View style={styles.seasonHeaderRow}>
                <Text style={styles.sectionHeader}>Seasons & Episodes</Text>
              </View>

              {/* Season Selection Pills */}
              {seasons.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.seasonsScroll}
                >
                  {seasons.map((s) => {
                    const isSelected = selectedSeason === s.season_number;
                    return (
                      <TouchableOpacity
                        key={"season-" + s.season_number}
                        style={[
                          styles.seasonChip,
                          isSelected && styles.seasonChipActive,
                        ]}
                        onPress={() => handleSeasonSelect(s.season_number)}
                      >
                        <Text
                          style={[
                            styles.seasonChipText,
                            isSelected && styles.seasonChipTextActive,
                          ]}
                        >
                          {s.name || "Season " + s.season_number}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}

              {/* Episode Cards */}
              {loadingEpisodes ? (
                <View style={styles.episodesLoader}>
                  <ActivityIndicator size="small" color="#FF334B" />
                </View>
              ) : episodes.length > 0 ? (
                <View style={styles.episodeList}>
                  {episodes.map((ep) => {
                    const thumb = ep.still_path
                      ? IMAGE_URL + ep.still_path
                      : backdropUri;
                    return (
                      <TouchableOpacity
                        key={"ep-" + ep.id}
                        style={styles.episodeCard}
                        activeOpacity={0.8}
                        onPress={() =>
                          launchPlayer(selectedSeason, ep.episode_number)
                        }
                      >
                        <View style={styles.thumbWrapper}>
                          <Image
                            source={{ uri: thumb }}
                            style={styles.thumbImg}
                          />
                          <View style={styles.playIconMini}>
                            <Ionicons name="play" size={14} color="#FFF" />
                          </View>
                        </View>
                        <View style={styles.epDetails}>
                          <Text style={styles.epNumber}>
                            Episode {ep.episode_number}
                          </Text>
                          <Text style={styles.epTitle} numberOfLines={1}>
                            {ep.name || "Episode " + ep.episode_number}
                          </Text>
                          <Text style={styles.epOverview} numberOfLines={2}>
                            {ep.overview ||
                              "No overview available for this episode."}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : (
                <View style={styles.fallbackEpGrid}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                    <TouchableOpacity
                      key={"fallback-" + num}
                      style={styles.fallbackEpButton}
                      onPress={() => launchPlayer(selectedSeason, num)}
                    >
                      <Ionicons
                        name="play-circle-outline"
                        size={16}
                        color="#FF334B"
                      />
                      <Text style={styles.fallbackEpText}>Episode {num}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}
        
        {/* Cast & Recommendations */}
        <CastRow cast={extraData.topCast} />
        <RecommendationRow 
          items={extraData.recommendations} 
          type={isTv ? 'tv' : 'movie'} 
          navigation={navigation} 
        />
      </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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
