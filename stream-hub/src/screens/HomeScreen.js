import React, { useState, useEffect, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Dimensions, StatusBar, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const POSTER_WIDTH = (width - 48) / 3;
const POSTER_HEIGHT = POSTER_WIDTH * 1.48;

const TOP_NAV_TABS = [
  { id: "trending", label: "Trending" },
  { id: "movie", label: "Movie" },
  { id: "web_series", label: "Web Series" },
  { id: "anime", label: "Anime" },
  { id: "tv_channel", label: "TV Channel" },
];

const SUB_FILTERS = {
  trending: ["All", "Top Rated", "Now Playing", "Upcoming"],
  movie: ["TOP Movies", "Cinema", "Bollywood", "South Indian", "Hollywood"],
  web_series: ["Top Series", "Indian Drama", "Crime Thriller", "Romance", "Mini Series"],
  anime: ["All", "Action", "Fantasy", "Shounen"],
  tv_channel: ["All", "News", "Entertainment", "Music"],
};

const CURATED_FEEDS = {
  trending: {
    hero: { title: "HAIWAAN", subtitle: "Haiwaan [Hindi][CAM]", meta: "2026 • Action • Crime", backdrop: "https://image.tmdb.org/t/p/w1280/1E5baAaEse26fej7uHcjOgEE2t2.jpg" },
    primary: [
      { id: "t1", title: "Fighter", lang: "Hindi", rank: 1, poster: "https://image.tmdb.org/t/p/w500/zDZowFj0GklN9N8T42z1qg5Vd3y.jpg" },
      { id: "t2", title: "Animal", lang: "Hindi", rank: 2, poster: "https://image.tmdb.org/t/p/w500/hrHAhu3xXhH2vFpP06f69rYwH7V.jpg" },
      { id: "t3", title: "Jawan", lang: "Hindi", rank: 3, poster: "https://image.tmdb.org/t/p/w500/jEjHfRqhZRQ4m39ggba5938gW5o.jpg" },
    ],
    secondary: [
      { id: "t4", title: "Dunki", lang: "Hindi", rank: 1, poster: "https://image.tmdb.org/t/p/w500/4c5iU58c6R1eD4xYnZzB9G3O3j.jpg" },
      { id: "t5", title: "Salaar", lang: "Hindi", rank: 2, poster: "https://image.tmdb.org/t/p/w500/wzp5qGjL1o6j5q6Yk2gJp4KzH5p.jpg" },
      { id: "t6", title: "Leo", lang: "Hindi", rank: 3, poster: "https://image.tmdb.org/t/p/w500/b1X1w8B1b6x5a0H3q2A6f3R3f9J.jpg" },
    ],
  },
  movie: {
    hero: { title: "DUNE: PART TWO", subtitle: "Dune: Part Two [Hindi/Eng]", meta: "2024 • Sci-Fi • Adventure", backdrop: "https://image.tmdb.org/t/p/w1280/xOMo8BRK7PfcJv9JCnx7s5hj0x2.jpg" },
    primary: [
      { id: "m1", title: "Kalki 2898 AD", lang: "Hindi", rank: 1, poster: "https://image.tmdb.org/t/p/w500/8bBqXyE1uX4F5U3H6kZ9G7L8M1a.jpg" },
      { id: "m2", title: "Shaitaan", lang: "Hindi", rank: 2, poster: "https://image.tmdb.org/t/p/w500/e9m0Zqj4vW0gYfP7n3xG9A6jK2l.jpg" },
      { id: "m3", title: "Spider-Man", lang: "Hindi", rank: 3, poster: "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg" },
    ],
    secondary: [
      { id: "m4", title: "Oppenheimer", lang: "Hindi", rank: 1, poster: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg" },
      { id: "m5", title: "Pathaan", lang: "Hindi", rank: 2, poster: "https://image.tmdb.org/t/p/w500/m1b9ToUd9Nn1iU7rG7uQW0f1A9v.jpg" },
      { id: "m6", title: "RRR", lang: "Hindi", rank: 3, poster: "https://image.tmdb.org/t/p/w500/nEufeZlyAOLqO2brrs0yeMu1Q2P.jpg" },
    ],
  },
  web_series: {
    hero: { title: "MIRZAPUR", subtitle: "Mirzapur: Season 3 [Hindi]", meta: "2024 • Crime • Action", backdrop: "https://image.tmdb.org/t/p/w1280/1E5baAaEse26fej7uHcjOgEE2t2.jpg" },
    primary: [
      { id: "w1", title: "Panchayat", lang: "Hindi", rank: 1, poster: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg" },
      { id: "w2", title: "Stranger Things", lang: "Hindi", rank: 2, poster: "https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg" },
      { id: "w3", title: "Asur: Dark Side", lang: "Hindi", rank: 3, poster: "https://image.tmdb.org/t/p/w500/56v2KjBlU4XaOv9rVYEQypROD7P.jpg" },
    ],
    secondary: [
      { id: "w4", title: "The Family Man", lang: "Hindi", rank: 1, poster: "https://image.tmdb.org/t/p/w500/xUfRZu2mi8jH6SzQEJGP6tjBuYj.jpg" },
      { id: "w5", title: "Sacred Games", lang: "Hindi", rank: 2, poster: "https://image.tmdb.org/t/p/w500/hFWP5HkbVEe40grUdu2QKjEZBm2.jpg" },
      { id: "w6", title: "Farzi", lang: "Hindi", rank: 3, poster: "https://image.tmdb.org/t/p/w500/hTP1DtLGFamjfu8WqjnuQdP1n4i.jpg" },
    ],
  },
  anime: {
    hero: { title: "DEMON SLAYER", subtitle: "Demon Slayer: Infinity Castle [Hindi Dub]", meta: "2025 • Action • Animation", backdrop: "https://image.tmdb.org/t/p/w1280/nTvM4mhqZlHI09GmnWuaEknYueL.jpg" },
    primary: [
      { id: "a1", title: "Bleach: TYBW", lang: "Hindi", rank: 1, poster: "https://image.tmdb.org/t/p/w500/2Eewgp7o5AU1xCjrXY9AcVJ23xU.jpg" },
      { id: "a2", title: "Jujutsu Kaisen", lang: "Hindi", rank: 2, poster: "https://image.tmdb.org/t/p/w500/hFWP5HkbVEe40grUdu2QKjEZBm2.jpg" },
      { id: "a3", title: "Solo Leveling", lang: "Hindi", rank: 3, poster: "https://image.tmdb.org/t/p/w500/geCRueV3ElhRTr0xtJuVbpAxvG8.jpg" },
    ],
    secondary: [
      { id: "a4", title: "Attack on Titan", lang: "Hindi", rank: 1, poster: "https://image.tmdb.org/t/p/w500/hTP1DtLGFamjfu8WqjnuQdP1n4i.jpg" },
      { id: "a5", title: "One Piece", lang: "Hindi", rank: 2, poster: "https://image.tmdb.org/t/p/w500/cMD9Ygz11yjEzAeiUR954aBtJVT.jpg" },
      { id: "a6", title: "Naruto Shippuden", lang: "Hindi", rank: 3, poster: "https://image.tmdb.org/t/p/w500/xUfRZu2mi8jH6SzQEJGP6tjBuYj.jpg" },
    ],
  },
};

const TV_CHANNELS_TOP = [
  { id: "c1", name: "Aaj Tak", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Aaj_tak_logo.png/300px-Aaj_tak_logo.png" },
  { id: "c2", name: "DD National", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Doordarshan_logo.svg/300px-Doordarshan_logo.svg.png" },
  { id: "c3", name: "News18 India", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/News18_India_logo.png/300px-News18_India_logo.png" },
  { id: "c4", name: "Asianet News", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Asianet_News_logo.png/300px-Asianet_News_logo.png" },
  { id: "c5", name: "India TV", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/India_TV_logo.svg/300px-India_TV_logo.svg.png" },
];

const ALL_CHANNELS_LIST = [
  { id: "ch_1", name: "Aaj Tak", lang: "HIN" },
  { id: "ch_2", name: "10 TV", lang: "TEL" },
  { id: "ch_3", name: "24 News", lang: "MAL" },
  { id: "ch_4", name: "7S Music", lang: "TAM" },
  { id: "ch_5", name: "India TV", lang: "HIN" },
  { id: "ch_6", name: "Asianet News", lang: "MAL" },
  { id: "ch_7", name: "TV9 Telugu", lang: "TEL" },
];

export default function HomeScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState("trending");
  const [activeSubFilter, setActiveSubFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTime, setCurrentTime] = useState("6:28 PM");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-IN", {
          timeZone: "Asia/Kolkata",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    const sub = SUB_FILTERS[tabId];
    if (sub && sub.length > 0) setActiveSubFilter(sub[0]);
  };

  const currentFeed = CURATED_FEEDS[activeTab] || CURATED_FEEDS.trending;

  const filteredPrimary = useMemo(() => {
    if (!searchQuery.trim()) return currentFeed.primary;
    return currentFeed.primary.filter((item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [currentFeed, searchQuery]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#101014" />
      <View style={styles.topHeader}>
        <View style={styles.appBadge}><Text style={styles.appBadgeText}>SH</Text></View>
        <View style={styles.searchBarWrapper}>
          <Ionicons name="search" size={16} color="#7E7E8E" style={{ marginRight: 6 }} />
          <TextInput
            placeholder="Search movies, series, anime..."
            placeholderTextColor="#6D6D7A"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={16} color="#7E7E8E" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.downloadIconBtn} onPress={() => navigation?.navigate && navigation.navigate("Downloads")}>
          <Ionicons name="download-outline" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      <View style={styles.navTabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.navTabScroll}>
          {TOP_NAV_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity key={tab.id} onPress={() => handleTabChange(tab.id)} style={styles.navTabBtn} activeOpacity={0.7}>
                <Text style={[styles.navTabText, isActive && styles.navTabTextActive]}>{tab.label}</Text>
                {isActive && <View style={styles.navTabIndicator} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.bodyScroll}>
        {activeTab === "tv_channel" ? (
          <View style={styles.tvChannelContainer}>
            <View style={styles.countryBar}>
              <View style={styles.countryLeft}>
                <Text style={{ fontSize: 16 }}>🇮🇳</Text>
                <Text style={styles.countryName}>India</Text>
                <Ionicons name="chevron-down" size={14} color="#8E8E9A" />
              </View>
              <Text style={styles.localTimeText}>Local time: {currentTime}</Text>
            </View>
            <Text style={styles.subHeaderTitle}>Top Picks</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.topChannelRow}>
              {TV_CHANNELS_TOP.map((ch) => (
                <TouchableOpacity key={ch.id} style={styles.channelGridCard} activeOpacity={0.8}>
                  <Image source={{ uri: ch.logo }} style={styles.channelGridLogo} resizeMode="contain" />
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={[styles.subHeaderTitle, { marginTop: 22 }]}>All Channels</Text>
            <View style={styles.channelListContainer}>
              {ALL_CHANNELS_LIST.map((ch) => (
                <TouchableOpacity key={ch.id} style={styles.channelListRow} activeOpacity={0.7}>
                  <View style={styles.channelRowLeft}>
                    <Text style={{ fontSize: 13, marginRight: 8 }}>🇮🇳</Text>
                    <Text style={styles.channelRowName}>{ch.name}</Text>
                  </View>
                  <View style={styles.channelRowRight}>
                    <Text style={styles.channelLangBadge}>{ch.lang}</Text>
                    <Ionicons name="stats-chart" size={14} color="#8E8E9A" style={{ marginLeft: 8 }} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <>
            <View style={styles.spotlightContainer}>
              <Image source={{ uri: currentFeed.hero.backdrop }} style={styles.spotlightBackdrop} />
              <View style={styles.spotlightGradient}>
                <Text style={styles.heroPosterTitle} numberOfLines={1}>{currentFeed.hero.title}</Text>
              </View>
            </View>
            <View style={styles.miniCardRow}>
              <View style={styles.miniCard}>
                <Image source={{ uri: currentFeed.hero.backdrop }} style={styles.miniThumb} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.miniTitle} numberOfLines={1}>{currentFeed.hero.subtitle}</Text>
                  <Text style={styles.miniMeta}>{currentFeed.hero.meta}</Text>
                </View>
                <TouchableOpacity style={styles.miniPlayBtn} activeOpacity={0.85}>
                  <Ionicons name="play" size={15} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
            {SUB_FILTERS[activeTab] && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subFilterRow}>
                {SUB_FILTERS[activeTab].map((chip) => {
                  const isSelected = activeSubFilter === chip;
                  return (
                    <TouchableOpacity key={chip} style={[styles.filterChip, isSelected && styles.filterChipActive]} onPress={() => setActiveSubFilter(chip)} activeOpacity={0.7}>
                      <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>{chip}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
            <View style={styles.shelfSection}>
              <View style={styles.shelfHeader}>
                <Text style={styles.shelfHeading}>
                  {activeTab === "anime" ? "Trending Anime" : activeTab === "web_series" ? "Top Web Series" : "Trending Movies"}
                </Text>
                <TouchableOpacity><Text style={styles.seeAllText}>All &gt;</Text></TouchableOpacity>
              </View>
              <View style={styles.posterGrid}>
                {filteredPrimary.map((item) => (
                  <TouchableOpacity key={item.id} style={styles.posterCard} activeOpacity={0.8}>
                    <View style={styles.posterWrapper}>
                      <Image source={{ uri: item.poster }} style={styles.posterImg} />
                      <View style={styles.tagBadge}><Text style={styles.tagBadgeText}>{item.lang}</Text></View>
                      <Text style={styles.rankWatermark}>{item.rank}</Text>
                    </View>
                    <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.shelfSection}>
              <View style={styles.shelfHeader}>
                <Text style={styles.shelfHeading}>Recommended For You</Text>
                <TouchableOpacity><Text style={styles.seeAllText}>All &gt;</Text></TouchableOpacity>
              </View>
              <View style={styles.posterGrid}>
                {currentFeed.secondary.map((item) => (
                  <TouchableOpacity key={"sec_" + item.id} style={styles.posterCard} activeOpacity={0.8}>
                    <View style={styles.posterWrapper}>
                      <Image source={{ uri: item.poster }} style={styles.posterImg} />
                      <View style={styles.tagBadge}><Text style={styles.tagBadgeText}>{item.lang}</Text></View>
                      <Text style={styles.rankWatermark}>{item.rank}</Text>
                    </View>
                    <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#101014" },
  topHeader: { paddingTop: 45, paddingHorizontal: 14, paddingBottom: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  appBadge: { width: 32, height: 32, borderRadius: 8, backgroundColor: "#FF334B", alignItems: "center", justifyContent: "center" },
  appBadgeText: { color: "#FFFFFF", fontWeight: "900", fontSize: 12 },
  searchBarWrapper: { flex: 1, height: 36, backgroundColor: "#1E1E26", borderRadius: 8, flexDirection: "row", alignItems: "center", paddingHorizontal: 10, marginHorizontal: 10 },
  searchInput: { flex: 1, color: "#FFFFFF", fontSize: 12.5, paddingVertical: 0 },
  downloadIconBtn: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  navTabContainer: { height: 38, borderBottomWidth: 1, borderBottomColor: "#1C1C26" },
  navTabScroll: { paddingHorizontal: 12, alignItems: "center", gap: 16 },
  navTabBtn: { position: "relative", paddingVertical: 8 },
  navTabText: { fontSize: 14, fontWeight: "600", color: "#8E8E9A" },
  navTabTextActive: { color: "#FFFFFF", fontWeight: "800" },
  navTabIndicator: { position: "absolute", bottom: 0, left: 4, right: 4, height: 2.5, backgroundColor: "#FF334B", borderRadius: 2 },
  bodyScroll: { paddingBottom: 110 },
  spotlightContainer: { width: width, height: 280, position: "relative", backgroundColor: "#15151D" },
  spotlightBackdrop: { width: "100%", height: "100%" },
  spotlightGradient: { position: "absolute", left: 0, right: 0, bottom: 0, height: "60%", justifyContent: "flex-end", paddingHorizontal: 16, paddingBottom: 24, backgroundColor: "rgba(16, 16, 20, 0.65)" },
  heroPosterTitle: { fontSize: 30, fontWeight: "900", color: "#FF2A2A", letterSpacing: 1.5 },
  miniCardRow: { paddingHorizontal: 14, marginTop: -16 },
  miniCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#1B1B24", borderRadius: 10, padding: 8, borderWidth: 1, borderColor: "#282836" },
  miniThumb: { width: 38, height: 38, borderRadius: 6 },
  miniTitle: { fontSize: 12.5, fontWeight: "700", color: "#FFFFFF" },
  miniMeta: { fontSize: 10.5, color: "#7E7E8A", marginTop: 2 },
  miniPlayBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#22C55E", alignItems: "center", justifyContent: "center" },
  subFilterRow: { paddingHorizontal: 14, marginTop: 14, gap: 8 },
  filterChip: { paddingVertical: 5, paddingHorizontal: 12, borderRadius: 14, backgroundColor: "#1B1B24" },
  filterChipActive: { backgroundColor: "#2A3831" },
  filterChipText: { fontSize: 11.5, fontWeight: "600", color: "#8E8E9A" },
  filterChipTextActive: { color: "#4ADE80", fontWeight: "700" },
  shelfSection: { marginTop: 18, paddingHorizontal: 14 },
  shelfHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  shelfHeading: { fontSize: 15, fontWeight: "800", color: "#FFFFFF" },
  seeAllText: { fontSize: 12, color: "#7E7E8A", fontWeight: "600" },
  posterGrid: { flexDirection: "row", justifyContent: "space-between" },
  posterCard: { width: POSTER_WIDTH },
  posterWrapper: { width: POSTER_WIDTH, height: POSTER_HEIGHT, borderRadius: 8, overflow: "hidden", backgroundColor: "#181822", position: "relative" },
  posterImg: { width: "100%", height: "100%" },
  tagBadge: { position: "absolute", top: 5, right: 5, backgroundColor: "rgba(0, 0, 0, 0.65)", borderRadius: 4, paddingHorizontal: 4, paddingVertical: 2 },
  tagBadgeText: { fontSize: 9, color: "#FFFFFF", fontWeight: "700" },
  rankWatermark: { position: "absolute", bottom: -6, right: 4, fontSize: 42, fontWeight: "900", color: "rgba(255, 255, 255, 0.4)" },
  cardTitle: { fontSize: 11, fontWeight: "600", color: "#CCCCCC", marginTop: 5 },
  tvChannelContainer: { paddingHorizontal: 14, paddingTop: 12 },
  countryBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#1B1B24", padding: 10, borderRadius: 8, marginBottom: 14 },
  countryLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  countryName: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  localTimeText: { color: "#7E7E8A", fontSize: 11 },
  subHeaderTitle: { color: "#FFFFFF", fontSize: 13.5, fontWeight: "700", marginBottom: 10 },
  topChannelRow: { gap: 10 },
  channelGridCard: { width: 68, height: 68, borderRadius: 10, backgroundColor: "#181822", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#262634", padding: 6 },
  channelGridLogo: { width: "90%", height: "90%" },
  channelListContainer: { backgroundColor: "#161620", borderRadius: 8, overflow: "hidden" },
  channelListRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: "#1F1F2C" },
  channelRowLeft: { flexDirection: "row", alignItems: "center" },
  channelRowName: { color: "#E0E0EC", fontSize: 13, fontWeight: "600" },
  channelRowRight: { flexDirection: "row", alignItems: "center" },
  channelLangBadge: { color: "#7E7E8A", fontSize: 11, fontWeight: "700" },
});
