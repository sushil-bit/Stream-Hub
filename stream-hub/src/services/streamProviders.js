// services/streamProviders.js
export const PROVIDERS = [
  {
      id: 'vidsrc_pm',
          name: 'VidSrc PM',
              buildUrl: (type, id, s = 1, e = 1) =>
                    type === 'tv'
                            ? `https://vidsrc.pm/embed/tv/${id}/${s}/${e}`
                                    : `https://vidsrc.pm/embed/movie/${id}`,
                                      },
                                        {
                                            id: 'vidlink',
                                                name: 'VidLink',
                                                    buildUrl: (type, id, s = 1, e = 1) =>
                                                          type === 'tv'
                                                                  ? `https://vidlink.pro/tv/${id}/${s}/${e}`
                                                                          : `https://vidlink.pro/movie/${id}`,
                                                                            },
                                                                              {
                                                                                  id: 'superembed',
                                                                                      name: 'SuperEmbed',
                                                                                          buildUrl: (type, id, s = 1, e = 1) =>
                                                                                                type === 'tv'
                                                                                                        ? `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s}&e=${e}`
                                                                                                                : `https://multiembed.mov/?video_id=${id}&tmdb=1`,
                                                                                                                  },
                                                                                                                  ];
                                                                                                                  