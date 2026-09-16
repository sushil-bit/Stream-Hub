const BASE_URL = "https://api.themoviedb.org/3";




// services/api.js

const TMDB_API_KEY = 'fb2e44c3e763e38d9214c5266987acf3';

export const fetchTrendingMovies = async () => {
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/trending/movie/week?api_key=${TMDB_API_KEY}`
    );
    const json = await res.json();
    return json.results || [];
  } catch (err) {
    console.error('TMDb Movies Error:', err);
    return [];
  }
};

export const fetchTopAnime = async () => {
  try {
    // Queries TMDb directly for top Japanese TV animation (genre 16 + origin JA)
    const res = await fetch(
      `https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_API_KEY}&with_genres=16&with_original_language=ja&sort_by=popularity.desc`
    );
    const json = await res.json();
    
    return (json.results || []).map((item) => ({
      id: item.id,
      title: item.name || item.original_name,
      name: item.name || item.original_name,
      poster_path: item.poster_path,
      isAnime: true,
      media_type: 'tv',
    }));
  } catch (err) {
    console.error('Anime Fetch Error:', err);
    return [];
  }
};

export const searchMulti = async (query) => {
  if (!query || !query.trim()) return [];
  try {
    const res = await fetch(
      `${BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query.trim())}&include_adult=false`
    );
    const data = await res.json();
    // Filter out people or items without posters
    return (data.results || []).filter(
      (item) => (item.media_type === 'movie' || item.media_type === 'tv') && (item.poster_path || item.backdrop_path)
    );
  } catch (error) {
    console.error('Multi-search error:', error);
    return [];
  }
};

export const fetchSeasonDetails = async (tvId, seasonNum = 1) => {
  try {
    const res = await fetch(
      `${BASE_URL}/tv/${tvId}/season/${seasonNum}?api_key=${TMDB_API_KEY}&language=en-US`
    );
    const data = await res.json();
    return data.episodes || [];
  } catch (err) {
    console.error("Failed to fetch season episodes:", err);
    return [];
  }
};

export const fetchTvDetails = async (tvId) => {
  try {
    const res = await fetch(
      `${BASE_URL}/tv/${tvId}?api_key=${TMDB_API_KEY}&language=en-US`
    );
    return await res.json();
  } catch (err) {
    console.error("Failed to fetch tv details:", err);
    return null;
  }
};

export const fetchMediaDetailsExtra = async (type, id) => {
  try {
    const TMDB_API_KEY = "2c46288716a18f8861fbac2907798388";
    const [recsRes, credsRes] = await Promise.allSettled([
      fetch(`https://api.themoviedb.org/3/${type}/${id}/recommendations?api_key=${TMDB_API_KEY}&page=1`),
      fetch(`https://api.themoviedb.org/3/${type}/${id}/credits?api_key=${TMDB_API_KEY}`),
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
    console.warn("fetchMediaDetailsExtra error:", err);
    return { recommendations: [], topCast: [], directors: [] };
  }
};
