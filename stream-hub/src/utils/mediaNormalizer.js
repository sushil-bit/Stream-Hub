const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

export const normalizeTmdbItem = (item, mediaType = "movie") => {
  if (!item) return null;
  const isMovie = mediaType === "movie" || !!item.title;
  return {
    id: `tmdb_${item.id}`,
    rawId: item.id,
    source: "tmdb",
    mediaType: isMovie ? "movie" : "tv",
    title: item.title || item.name || "Untitled",
    poster: item.poster_path
      ? `${TMDB_IMAGE_BASE}${item.poster_path}`
      : "https://via.placeholder.com/300x450?text=No+Poster",
    backdrop: item.backdrop_path
      ? `${TMDB_IMAGE_BASE}${item.backdrop_path}`
      : null,
    rating: typeof item.vote_average === "number" ? item.vote_average.toFixed(1) : "N/A",
    year: (item.release_date || item.first_air_date || "").slice(0, 4) || "N/A",
    overview: item.overview || "",
  };
};

export const normalizeJikanItem = (item) => {
  if (!item) return null;
  const poster =
    item.images?.jpg?.large_image_url ||
    item.images?.webp?.large_image_url ||
    item.images?.jpg?.image_url ||
    "https://via.placeholder.com/300x450?text=No+Poster";

  return {
    id: `jikan_${item.mal_id}`,
    rawId: item.mal_id,
    source: "jikan",
    mediaType: "anime",
    title: item.title_english || item.title || "Untitled Anime",
    poster,
    backdrop: item.trailer?.images?.maximum_image_url || poster,
    rating: typeof item.score === "number" ? item.score.toFixed(1) : "N/A",
    year: item.year || (item.aired?.from ? item.aired.from.slice(0, 4) : "N/A"),
    episodes: item.episodes ? `${item.episodes} eps` : "TV",
    overview: item.synopsis || "",
  };
};
