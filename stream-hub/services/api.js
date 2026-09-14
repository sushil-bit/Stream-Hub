const TMDB_API_KEY = '84103507c91834927f8ebc761e7a08b9';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const JIKAN_BASE_URL = 'https://api.jikan.moe/v4';

export const fetchTrendingMovies = async () => {
  try {
    const response = await fetch(`${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}`);
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error fetching trending movies:', error);
    return [];
  }
};

export const fetchTopAnime = async () => {
  try {
    const response = await fetch(`${JIKAN_BASE_URL}/top/anime?limit=15`);
    const data = await response.json();
    return (data.data || []).map((anime) => ({
      id: anime.mal_id,
      title: anime.title,
      poster_path: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
      backdrop_path: anime.images?.jpg?.large_image_url,
      overview: anime.synopsis,
      vote_average: anime.score,
      release_date: anime.aired?.from?.slice(0, 4) || 'N/A',
      isAnime: true,
      media_type: 'tv',
    }));
  } catch (error) {
    console.error('Error fetching anime:', error);
    return [];
  }
};
