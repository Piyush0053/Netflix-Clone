import axios from 'axios';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

// Enhanced TMDB API utility functions with favorites and watchlist support
const USE_MOCK_DATA = !API_KEY; // Use mock data if no API key is provided

// Fallback mock data
const FALLBACK_TRENDING = [
  {
    id: 1,
    title: 'Stranger Things',
    name: 'Stranger Things',
    media_type: 'tv',
    backdrop_path: '/56v2KjBlU4XaOv9rVYEQypROD7P.jpg',
    poster_path: '/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
    overview: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces, and one strange little girl.',
    genre_ids: [18, 10765, 9648],
    release_date: '2016-07-15',
    first_air_date: '2016-07-15'
  },
  {
    id: 2,
    title: 'The Matrix',
    name: 'The Matrix',
    media_type: 'movie',
    backdrop_path: '/fNG7i7RqMErkcqhohV2a6cV1Ehy.jpg',
    poster_path: '/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
    overview: 'Set in the 22nd century, The Matrix tells the story of a computer hacker who joins a group of underground insurgents fighting the vast and powerful computers who now rule the earth.',
    genre_ids: [28, 878],
    release_date: '1999-03-30'
  },
  {
    id: 3,
    title: 'Inception',
    name: 'Inception',
    media_type: 'movie',
    backdrop_path: '/s3TBrRGB1iav7gFOCNx3H31MoES.jpg',
    poster_path: '/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
    overview: 'Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life as payment for a task considered to be impossible.',
    genre_ids: [28, 878, 12],
    release_date: '2010-07-16'
  }
];

// Map of genre IDs to genre names
const GENRE_MAP = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Science Fiction',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
  10759: 'Action & Adventure',
  10762: 'Kids',
  10763: 'News',
  10764: 'Reality',
  10765: 'Sci-Fi & Fantasy',
  10766: 'Soap',
  10767: 'Talk',
  10768: 'War & Politics',
};

// Fetch trending content
export const fetchTrending = async () => {
  if (USE_MOCK_DATA) {
    return FALLBACK_TRENDING;
  }
  
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/trending/all/week`, {
      params: {
        api_key: API_KEY,
        language: 'en-US'
      }
    });
    
    if (!response.data.results || !Array.isArray(response.data.results)) {
      return FALLBACK_TRENDING;
    }
    
    return response.data.results.slice(0, 10);
  } catch (error) {
    console.error('Error fetching trending:', error);
    return FALLBACK_TRENDING;
  }
};

// Search movies
export const searchMovies = async (query: string) => {
  if (USE_MOCK_DATA) {
    // Filter mock data based on query
    return FALLBACK_TRENDING.filter(item => 
      (item.title || item.name).toLowerCase().includes(query.toLowerCase())
    );
  }
  
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
      params: {
        api_key: API_KEY,
        query,
        language: 'en-US'
      }
    });
    
    return response.data.results || [];
  } catch (error) {
    console.error('Error searching movies:', error);
    return [];
  }
};

// Search multi (movies and TV shows)
export const searchMulti = async (query: string) => {
  if (USE_MOCK_DATA) {
    return FALLBACK_TRENDING.filter(item => 
      (item.title || item.name).toLowerCase().includes(query.toLowerCase())
    );
  }
  
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/search/multi`, {
      params: {
        api_key: API_KEY,
        query,
        language: 'en-US'
      }
    });
    
    return response.data.results || [];
  } catch (error) {
    console.error('Error searching multi:', error);
    return [];
  }
};

// Fetch movie/TV show details including videos
export const fetchVideos = async (id: number, mediaType: 'movie' | 'tv') => {
  const mockVideos: {[key: number]: any[]} = {
    1: [{ key: 'b9EkMc79ZSU', site: 'YouTube', type: 'Trailer', name: 'Stranger Things 4 | Official Trailer' }],
    2: [{ key: 'm8e-FF8MsqU', site: 'YouTube', type: 'Trailer', name: 'The Matrix Resurrections – Official Trailer' }],
    3: [{ key: 'YoHD9XEInc0', site: 'YouTube', type: 'Trailer', name: 'Inception Official Trailer' }]
  };
  
  if (USE_MOCK_DATA) {
    return mockVideos[id] || mockVideos[1];
  }
  
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/${mediaType}/${id}/videos`, {
      params: {
        api_key: API_KEY,
        language: 'en-US'
      }
    });
    
    if (!response.data.results || !Array.isArray(response.data.results) || response.data.results.length === 0) {
      return mockVideos[id] || mockVideos[1];
    }
    
    return response.data.results;
  } catch (error) {
    console.error('Error fetching videos:', error);
    return mockVideos[id] || mockVideos[1];
  }
};

// Add to favorites
export const addFavorite = async (
  accountId: string,
  sessionId: string,
  mediaType: 'movie' | 'tv',
  mediaId: number,
  favorite: boolean
) => {
  if (USE_MOCK_DATA) {
    // Mock implementation - store in localStorage
    const key = `tmdb_favorites_${mediaType}`;
    const favorites = JSON.parse(localStorage.getItem(key) || '[]');
    
    if (favorite) {
      if (!favorites.includes(mediaId)) {
        favorites.push(mediaId);
      }
    } else {
      const index = favorites.indexOf(mediaId);
      if (index > -1) {
        favorites.splice(index, 1);
      }
    }
    
    localStorage.setItem(key, JSON.stringify(favorites));
    return { success: true };
  }
  
  try {
    const response = await axios.post(`${TMDB_BASE_URL}/account/${accountId}/favorite`, {
      media_type: mediaType,
      media_id: mediaId,
      favorite
    }, {
      params: {
        api_key: API_KEY,
        session_id: sessionId
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error adding to favorites:', error);
    throw error;
  }
};

// Add to watchlist
export const addToWatchlist = async (
  accountId: string,
  sessionId: string,
  mediaType: 'movie' | 'tv',
  mediaId: number,
  watchlist: boolean
) => {
  if (USE_MOCK_DATA) {
    // Mock implementation - store in localStorage
    const key = `tmdb_watchlist_${mediaType}`;
    const watchlistItems = JSON.parse(localStorage.getItem(key) || '[]');
    
    if (watchlist) {
      if (!watchlistItems.includes(mediaId)) {
        watchlistItems.push(mediaId);
      }
    } else {
      const index = watchlistItems.indexOf(mediaId);
      if (index > -1) {
        watchlistItems.splice(index, 1);
      }
    }
    
    localStorage.setItem(key, JSON.stringify(watchlistItems));
    return { success: true };
  }
  
  try {
    const response = await axios.post(`${TMDB_BASE_URL}/account/${accountId}/watchlist`, {
      media_type: mediaType,
      media_id: mediaId,
      watchlist
    }, {
      params: {
        api_key: API_KEY,
        session_id: sessionId
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    throw error;
  }
};

// Get favorite movies
export const getFavoriteMovies = async (accountId: string, sessionId: string) => {
  if (USE_MOCK_DATA) {
    const favoriteIds = JSON.parse(localStorage.getItem('tmdb_favorites_movie') || '[]');
    return FALLBACK_TRENDING.filter(item => favoriteIds.includes(item.id) && item.media_type === 'movie');
  }
  
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/account/${accountId}/favorite/movies`, {
      params: {
        api_key: API_KEY,
        session_id: sessionId,
        language: 'en-US'
      }
    });
    
    return response.data.results || [];
  } catch (error) {
    console.error('Error getting favorite movies:', error);
    return [];
  }
};

// Get favorite TV shows
export const getFavoriteTv = async (accountId: string, sessionId: string) => {
  if (USE_MOCK_DATA) {
    const favoriteIds = JSON.parse(localStorage.getItem('tmdb_favorites_tv') || '[]');
    return FALLBACK_TRENDING.filter(item => favoriteIds.includes(item.id) && item.media_type === 'tv');
  }
  
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/account/${accountId}/favorite/tv`, {
      params: {
        api_key: API_KEY,
        session_id: sessionId,
        language: 'en-US'
      }
    });
    
    return response.data.results || [];
  } catch (error) {
    console.error('Error getting favorite TV shows:', error);
    return [];
  }
};

// Get watchlist movies
export const getWatchlistMovies = async (accountId: string, sessionId: string) => {
  if (USE_MOCK_DATA) {
    const watchlistIds = JSON.parse(localStorage.getItem('tmdb_watchlist_movie') || '[]');
    return FALLBACK_TRENDING.filter(item => watchlistIds.includes(item.id) && item.media_type === 'movie');
  }
  
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/account/${accountId}/watchlist/movies`, {
      params: {
        api_key: API_KEY,
        session_id: sessionId,
        language: 'en-US'
      }
    });
    
    return response.data.results || [];
  } catch (error) {
    console.error('Error getting watchlist movies:', error);
    return [];
  }
};

// Get watchlist TV shows
export const getWatchlistTv = async (accountId: string, sessionId: string) => {
  if (USE_MOCK_DATA) {
    const watchlistIds = JSON.parse(localStorage.getItem('tmdb_watchlist_tv') || '[]');
    return FALLBACK_TRENDING.filter(item => watchlistIds.includes(item.id) && item.media_type === 'tv');
  }
  
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/account/${accountId}/watchlist/tv`, {
      params: {
        api_key: API_KEY,
        session_id: sessionId,
        language: 'en-US'
      }
    });
    
    return response.data.results || [];
  } catch (error) {
    console.error('Error getting watchlist TV shows:', error);
    return [];
  }
};

// Check if item is in favorites
export const isInFavorites = (mediaId: number, mediaType: 'movie' | 'tv'): boolean => {
  if (USE_MOCK_DATA) {
    const favorites = JSON.parse(localStorage.getItem(`tmdb_favorites_${mediaType}`) || '[]');
    return favorites.includes(mediaId);
  }
  
  // For real API, you'd need to fetch the favorites list or maintain local state
  return false;
};

// Check if item is in watchlist
export const isInWatchlist = (mediaId: number, mediaType: 'movie' | 'tv'): boolean => {
  if (USE_MOCK_DATA) {
    const watchlist = JSON.parse(localStorage.getItem(`tmdb_watchlist_${mediaType}`) || '[]');
    return watchlist.includes(mediaId);
  }
  
  // For real API, you'd need to fetch the watchlist or maintain local state
  return false;
};

// Get a YouTube trailer URL from video results
export const getTrailerUrl = (videos: any[], options: { muted?: boolean, autoplay?: boolean } = {}) => {
  const { muted = false, autoplay = true } = options;
  
  const trailer = videos.find(
    video => 
      video.type === 'Trailer' && 
      video.site === 'YouTube' && 
      video.name.toLowerCase().includes('official')
  );
  
  const anyTrailer = videos.find(
    video => video.type === 'Trailer' && video.site === 'YouTube'
  );
  
  const anyVideo = videos.find(video => video.site === 'YouTube');
  
  const video = trailer || anyTrailer || anyVideo;
  
  if (!video) return null;

  const embedUrl = `https://www.youtube.com/embed/${video.key}?autoplay=${autoplay ? 1 : 0}&mute=${muted ? 1 : 0}`;
  const directUrl = `https://www.youtube.com/watch?v=${video.key}`;
  
  return {
    embedUrl,
    directUrl,
    videoId: video.key,
    title: video.name
  };
};

// Get genre names from genre IDs
export const getGenreNames = (genreIds: number[]) => {
  if (!genreIds || !Array.isArray(genreIds)) return [];
  return genreIds.map(id => GENRE_MAP[id as keyof typeof GENRE_MAP]).filter(Boolean);
};

// Fetch a random trending item with a trailer
export const fetchRandomTrailer = async () => {
  try {
    const trending = await fetchTrending();
    
    if (!trending || trending.length === 0) {
      console.warn('No trending items found for trailer selection');
      return null;
    }
    
    const shuffled = [...trending].sort(() => 0.5 - Math.random());
    
    for (const item of shuffled) {
      if (!item || !item.id || !item.media_type) {
        console.warn('Invalid trending item:', item);
        continue;
      }
      
      const videos = await fetchVideos(item.id, item.media_type as "movie" | "tv");
      const trailerInfo = getTrailerUrl(videos, { muted: true, autoplay: true });
      
      if (trailerInfo) {
        const genreNames = getGenreNames(item.genre_ids);
        
        return {
          ...item,
          trailerInfo,
          genres: genreNames
        };
      }
    }
    
    const firstItem = shuffled[0];
    const fallbackVideo = [{ 
      key: 'b9EkMc79ZSU', 
      site: 'YouTube', 
      type: 'Trailer', 
      name: 'Netflix Featured Trailer' 
    }];
    
    const trailerInfo = getTrailerUrl(fallbackVideo, { muted: true, autoplay: true });
    const genreNames = getGenreNames(firstItem.genre_ids);
    
    return {
      ...firstItem,
      trailerInfo,
      genres: genreNames
    };
  } catch (error) {
    console.error('Error fetching random trailer:', error);
    
    const fallbackItem = FALLBACK_TRENDING[0];
    const fallbackVideo = [{ 
      key: 'b9EkMc79ZSU', 
      site: 'YouTube', 
      type: 'Trailer', 
      name: 'Stranger Things 4 | Official Trailer' 
    }];
    
    const trailerInfo = getTrailerUrl(fallbackVideo, { muted: true, autoplay: true });
    const genreNames = getGenreNames(fallbackItem.genre_ids);
    
    return {
      ...fallbackItem,
      trailerInfo,
      genres: genreNames
    };
  }
};