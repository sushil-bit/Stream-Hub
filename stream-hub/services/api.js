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
                                          const res = await fetch('https://api.jikan.moe/v4/top/anime');
                                              const json = await res.json();
                                                  if (!json.data) return [];

                                                      return json.data.map((item) => ({
                                                            id: item.mal_id,
                                                                  title: item.title,
                                                                        name: item.title,
                                                                              poster_path: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url,
                                                                                    isAnime: true,
                                                                                          media_type: 'tv',
                                                                                              }));
                                                                                                } catch (err) {
                                                                                                    console.error('Jikan Fetch Error:', err);
                                                                                                        return [];
                                                                                                          }
                                                                                                          };
