// services/api.js

export const fetchTrendingMovies = async () => {
  try {
      const response = await fetch(
            'https://api.themoviedb.org/3/trending/movie/day?api_key=e9e9d8da18ae29fc430845952232787c'
                );
                    const data = await response.json();
                        return data.results || [];
                          } catch (error) {
                              console.error('Error fetching trending movies:', error);
                                  return [];
                                    }
                                    };

                                    export const fetchTopAnime = async () => {
                                      try {
                                          const response = await fetch('https://api.jikan.moe/v4/top/anime?limit=10');
                                              const data = await response.json();
                                                  return data.data || [];
                                                    } catch (error) {
                                                        console.error('Error fetching anime:', error);
                                                            return [];
                                                              }
                                                              };
export const fetchMediaDetails = async (id, type = 'movie') => {
    try {
        const res = await fetch(
              `https://api.themoviedb.org/3/${type}/${id}?api_key=e9e9d8da18ae29fc430845952232787c&append_to_response=videos,credits`
                  );
                      const data = await res.json();
                          return data;
                            } catch (err) {
                                console.error('Error fetching details:', err);
                                    return null;
                                      }
                                      };

                                  
