// services/api.js
const API_KEY = "fb2e44c3e763e38d9214c5266987acf3"; // Replace with your actual TMDB key
const BASE_URL = "https://api.themoviedb.org/3";
const JIKAN_BASE = "https://api.jikan.moe/v4";

// 1. Your original function (still here and working!)
export async function getTrending() {
  const res = await fetch(`${BASE_URL}/trending/all/day?api_key=${API_KEY}`);
    if (!res.ok) throw new Error("Failed to fetch trending data");
      const data = await res.json();
        return data.results || [];
        }

        // 2. Added for the Anime Carousel
        export async function fetchTopAnime() {
          const res = await fetch(`${JIKAN_BASE}/top/anime?filter=airing&limit=10`);
            const data = await res.json();
              return (data.data || []).map((item) => ({
                  id: `anime-${item.mal_id}`,
                      title: item.title,
                          poster_path: item.images?.jpg?.large_image_url,
                              backdrop_path: item.images?.jpg?.large_image_url,
                                  overview: item.synopsis,
                                      genres: item.genres?.map((g) => g.name) || [],
                                          trailer_url: item.trailer?.embed_url,
                                              isAnime: true,
                                                }));
                                                }

                                                // 3. Added for Details & Video playback (cast + trailer key)
                                                export async function fetchMediaDetails(id, mediaType = "movie") {
                                                  const [detailsRes, creditsRes, videosRes] = await Promise.all([
                                                      fetch(`${BASE_URL}/${mediaType}/${id}?api_key=${API_KEY}`),
                                                          fetch(`${BASE_URL}/${mediaType}/${id}/credits?api_key=${API_KEY}`),
                                                              fetch(`${BASE_URL}/${mediaType}/${id}/videos?api_key=${API_KEY}`),
                                                                ]);

                                                                  const details = await detailsRes.json();
                                                                    const credits = await creditsRes.json();
                                                                      const videos = await videosRes.json();

                                                                        const officialTrailer = videos.results?.find(
                                                                            (v) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser")
                                                                              );

                                                                                return {
                                                                                    ...details,
                                                                                        cast: credits.cast ? credits.cast.slice(0, 10) : [],
                                                                                            youtubeKey: officialTrailer ? officialTrailer.key : null,
                                                                                              };
                                                                                              }
