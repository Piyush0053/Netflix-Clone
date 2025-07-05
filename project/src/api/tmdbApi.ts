// TMDB API utility functions
// For demo purposes, we're using mock data to avoid API key issues
// const API_KEY = '2e532cd4d1582a35f387926e4372aa81';
const BASE_URL = 'https://api.themoviedb.org/3';

// Flag to determine if we should attempt API calls or just use mock data
const USE_MOCK_DATA = true;

// Fallback mock data in case API calls fail
const FALLBACK_TRENDING = [
  {
    id: 1,
    title: 'Stranger Things',
    name: 'Stranger Things',
    media_type: 'tv',
    backdrop_path: '/56v2KjBlU4XaOv9rVYEQypROD7P.jpg',
    overview: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces, and one strange little girl.',
    genre_ids: [18, 10765, 9648]
  },
  {
    id: 2,
    title: 'The Matrix',
    name: 'The Matrix',
    media_type: 'movie',
    backdrop_path: '/fNG7i7RqMErkcqhohV2a6cV1Ehy.jpg',
    overview: 'Set in the 22nd century, The Matrix tells the story of a computer hacker who joins a group of underground insurgents fighting the vast and powerful computers who now rule the earth.',
    genre_ids: [28, 878]
  },
  {
    id: 3,
    title: 'Inception',
    name: 'Inception',
    media_type: 'movie',
    backdrop_path: '/s3TBrRGB1iav7gFOCNx3H31MoES.jpg',
    overview: 'Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life as payment for a task considered to be impossible.',
    genre_ids: [28, 878, 12]
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
  // If we're using mock data, skip the API call
  if (USE_MOCK_DATA) {
    return FALLBACK_TRENDING;
  }
  
  try {
    // Note: API_KEY is commented out, so this would fail in the current setup
    // This is intentional as we're using mock data
    // This code path won't be executed with USE_MOCK_DATA set to true
    // Just here for completeness
    const response = await fetch(
      `${BASE_URL}/trending/all/week?api_key=DUMMY_KEY&language=en-US`
    );
    
    if (!response.ok) {
      return FALLBACK_TRENDING;
    }
    
    const data = await response.json();
    
    if (!data.results || !Array.isArray(data.results)) {
      return FALLBACK_TRENDING;
    }
    
    return data.results.slice(0, 10); // Limit to 10 items
  } catch (error) {
    return FALLBACK_TRENDING;
  }
};

// Fetch movie/TV show details including videos
export const fetchVideos = async (id: number, mediaType: 'movie' | 'tv') => {
  console.log(`fetchVideos called with id: ${id}, mediaType: ${mediaType}`);
  
  // Enhanced mock video data mapping with more specific content
  const mockVideos: {[key: string]: any[]} = {
    // Stranger Things (TV)
    '1_tv': [{ 
      key: 'b9EkMc79ZSU', 
      site: 'YouTube', 
      type: 'Trailer', 
      name: 'Stranger Things 4 | Official Trailer' 
    }],
    // The Matrix (Movie)
    '2_movie': [{ 
      key: 'm8e-FF8MsqU', 
      site: 'YouTube', 
      type: 'Trailer', 
      name: 'The Matrix Resurrections – Official Trailer' 
    }],
    // Inception (Movie)
    '3_movie': [{ 
      key: 'YoHD9XEInc0', 
      site: 'YouTube', 
      type: 'Trailer', 
      name: 'Inception Official Trailer' 
    }],
    // Default fallback for any other content
    'default': [{ 
      key: 'dQw4w9WgXcQ', 
      site: 'YouTube', 
      type: 'Trailer', 
      name: 'Sample Trailer' 
    }]
  };
  
  // Create a unique key for this specific content
  const contentKey = `${id}_${mediaType}`;
  console.log(`Looking for videos with key: ${contentKey}`);
  
  // If we're using mock data, return it directly
  if (USE_MOCK_DATA) {
    const videos = mockVideos[contentKey] || mockVideos['default'];
    console.log(`Returning mock videos for ${contentKey}:`, videos);
    return videos;
  }
  
  try {
    // This code path won't be executed with USE_MOCK_DATA set to true
    // Just here for completeness
    const response = await fetch(
      `${BASE_URL}/${mediaType}/${id}/videos?api_key=DUMMY_KEY&language=en-US`
    );
    
    if (!response.ok) {
      console.log(`API call failed, returning mock videos for ${contentKey}`);
      return mockVideos[contentKey] || mockVideos['default'];
    }
    
    const data = await response.json();
    
    if (!data.results || !Array.isArray(data.results) || data.results.length === 0) {
      console.log(`No API results, returning mock videos for ${contentKey}`);
      return mockVideos[contentKey] || mockVideos['default'];
    }
    
    return data.results;
  } catch (error) {
    console.error(`Error fetching videos for ${contentKey}:`, error);
    return mockVideos[contentKey] || mockVideos['default'];
  }
};

// Get a YouTube trailer URL from video results
export const getTrailerUrl = (videos: any[], options: { muted?: boolean, autoplay?: boolean } = {}) => {
  console.log('getTrailerUrl called with videos:', videos);
  
  // Default options
  const { muted = false, autoplay = true } = options;
  
  // First try to find an official trailer
  const trailer = videos.find(
    video => 
      video.type === 'Trailer' && 
      video.site === 'YouTube' && 
      video.name.toLowerCase().includes('official')
  );
  
  // If no official trailer, try any trailer
  const anyTrailer = videos.find(
    video => video.type === 'Trailer' && video.site === 'YouTube'
  );
  
  // If no trailer at all, use any YouTube video
  const anyVideo = videos.find(video => video.site === 'YouTube');
  
  const video = trailer || anyTrailer || anyVideo;
  console.log('Selected video:', video);
  
  if (!video) {
    console.log('No suitable video found');
    return null;
  }

  // For embedding in iframes (modal trailer)
  const embedUrl = `https://www.youtube.com/embed/${video.key}?autoplay=${autoplay ? 1 : 0}&mute=${muted ? 1 : 0}&rel=0&modestbranding=1`;
  
  // For direct video source (background video)
  const directUrl = `https://www.youtube.com/watch?v=${video.key}`;
  
  const result = {
    embedUrl,
    directUrl,
    videoId: video.key,
    title: video.name
  };
  
  console.log('Returning trailer URL info:', result);
  return result;
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
    
    // Shuffle the trending array to get a random item each time
    const shuffled = [...trending].sort(() => 0.5 - Math.random());
    
    // Try items one by one until we find one with a trailer
    for (const item of shuffled) {
      if (!item || !item.id || !item.media_type) {
        console.warn('Invalid trending item:', item);
        continue;
      }
      
      const videos = await fetchVideos(item.id, item.media_type as "movie" | "tv");
      const trailerInfo = getTrailerUrl(videos, { muted: true, autoplay: true });
      
      if (trailerInfo) {
        // Get genre names for this item
        const genreNames = getGenreNames(item.genre_ids);
        
        return {
          ...item,
          trailerInfo,
          genres: genreNames
        };
      }
    }
    
    // If we couldn't find any item with a trailer, use the first item
    // with a fallback video
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
    
    // Return fallback item in case of error
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