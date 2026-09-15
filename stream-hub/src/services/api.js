



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
      `${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query.trim())}&include_adult=false`
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
