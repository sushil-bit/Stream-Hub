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
                              console.error('TMDb Fetch Error:', err);
                                  return [];
                                    }
                                    };

                                    export const fetchTopAnime = async () => {
  try {
    const res = await fetch('https://api.jikan.moe/v4/top/anime?filter=airing&limit=15');
    if (!res.ok) {
      // Fallback endpoint if top/anime gets rate-limited
      const fallbackRes = await fetch('https://api.jikan.moe/v4/seasons/now?limit=15');
      const fallbackJson = await fallbackRes.json();
      return formatAnime(fallbackJson.data || []);
    }
    const json = await res.json();
    return formatAnime(json.data || []);
  } catch (err) {
    console.error('Jikan Fetch Error:', err);
    return [];
  }
};

const formatAnime = (list) =>
  list.map((item) => ({
    id: item.mal_id,
    title: item.title,
    name: item.title,
    poster_path: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url,
    isAnime: true,
    media_type: 'tv',
  }));
