
export const fetchMediaDetailsExtra = async (type, id) => {
  try {
    const [recommendationsRes, creditsRes] = await Promise.allSettled([
      fetch(`https://api.themoviedb.org/3/${type}/${id}/recommendations?api_key=${TMDB_API_KEY}&page=1`),
      fetch(`https://api.themoviedb.org/3/${type}/${id}/credits?api_key=${TMDB_API_KEY}`),
    ]);

    const recommendations = recommendationsRes.status === 'fulfilled' 
      ? (await recommendationsRes.value.json()).results || [] 
      : [];

    const credits = creditsRes.status === 'fulfilled' 
      ? await creditsRes.value.json() 
      : { cast: [], crew: [] };

    const directors = credits.crew?.filter((c) => c.job === 'Director') || [];
    const topCast = credits.cast?.slice(0, 15) || [];

    return { recommendations, topCast, directors };
  } catch (err) {
    return { recommendations: [], topCast: [], directors: [] };
  }
};
