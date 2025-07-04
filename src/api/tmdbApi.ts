import axios from './axios';

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

export interface TrailerInfo {
  videoId: string;
  embedUrl: string;
}

// Search for movies, TV shows, and people
export const searchMulti = async (query: string) => {
  const response = await axios.get(`/search/multi?query=${encodeURIComponent(query)}`);
  return response.data.results;
};

// Fetch videos for a movie or TV show
export const fetchVideos = async (id: number, mediaType: 'movie' | 'tv'): Promise<Video[]> => {
  const response = await axios.get(`/${mediaType}/${id}/videos`);
  return response.data.results;
};

// Get trailer URL from videos
export const getTrailerUrl = (videos: Video[]): TrailerInfo | null => {
  const trailer = videos.find(
    (video) => video.type === 'Trailer' && video.site === 'YouTube'
  ) || videos.find(
    (video) => video.site === 'YouTube'
  );

  if (trailer) {
    return {
      videoId: trailer.key,
      embedUrl: `https://www.youtube.com/embed/${trailer.key}?autoplay=1&rel=0`
    };
  }

  return null;
};

// TMDb Lists API functions
export const getFavoriteMovies = async (accountId: string, sessionId: string) => {
  const response = await axios.get(`/account/${accountId}/favorite/movies?session_id=${sessionId}`);
  return response.data.results;
};

export const getFavoriteTv = async (accountId: string, sessionId: string) => {
  const response = await axios.get(`/account/${accountId}/favorite/tv?session_id=${sessionId}`);
  return response.data.results;
};

export const getWatchlistMovies = async (accountId: string, sessionId: string) => {
  const response = await axios.get(`/account/${accountId}/watchlist/movies?session_id=${sessionId}`);
  return response.data.results;
};

export const getWatchlistTv = async (accountId: string, sessionId: string) => {
  const response = await axios.get(`/account/${accountId}/watchlist/tv?session_id=${sessionId}`);
  return response.data.results;
};

// Add/remove from favorites
export const toggleFavorite = async (
  accountId: string,
  sessionId: string,
  mediaType: 'movie' | 'tv',
  mediaId: number,
  favorite: boolean
) => {
  const response = await axios.post(`/account/${accountId}/favorite?session_id=${sessionId}`, {
    media_type: mediaType,
    media_id: mediaId,
    favorite
  });
  return response.data;
};

// Add/remove from watchlist
export const toggleWatchlist = async (
  accountId: string,
  sessionId: string,
  mediaType: 'movie' | 'tv',
  mediaId: number,
  watchlist: boolean
) => {
  const response = await axios.post(`/account/${accountId}/watchlist?session_id=${sessionId}`, {
    media_type: mediaType,
    media_id: mediaId,
    watchlist
  });
  return response.data;
};