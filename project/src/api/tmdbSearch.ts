// TMDB Search API functions
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

export interface SearchResult {
  id: number;
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  poster_path?: string;
  backdrop_path?: string;
  overview?: string;
  media_type?: 'movie' | 'tv';
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  genre_ids?: number[];
}

export interface SearchResponse {
  page: number;
  results: SearchResult[];
  total_pages: number;
  total_results: number;
}

// Search for movies and TV shows
export const searchMulti = async (query: string, page: number = 1): Promise<SearchResponse> => {
  try {
    if (!query.trim()) {
      return {
        page: 1,
        results: [],
        total_pages: 0,
        total_results: 0
      };
    }

    const response = await fetch(
      `${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}&language=en-US`
    );

    if (!response.ok) {
      throw new Error(`Search failed: ${response.status}`);
    }

    const data = await response.json();
    
    // Filter out person results, only keep movies and TV shows
    const filteredResults = data.results.filter((item: SearchResult) => 
      item.media_type === 'movie' || item.media_type === 'tv'
    );

    return {
      ...data,
      results: filteredResults
    };
  } catch (error) {
    console.error('Error searching content:', error);
    return {
      page: 1,
      results: [],
      total_pages: 0,
      total_results: 0
    };
  }
};

// Search specifically for movies
export const searchMovies = async (query: string, page: number = 1): Promise<SearchResponse> => {
  try {
    if (!query.trim()) {
      return {
        page: 1,
        results: [],
        total_pages: 0,
        total_results: 0
      };
    }

    const response = await fetch(
      `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}&language=en-US`
    );

    if (!response.ok) {
      throw new Error(`Movie search failed: ${response.status}`);
    }

    const data = await response.json();
    
    // Add media_type for consistency
    const resultsWithMediaType = data.results.map((item: SearchResult) => ({
      ...item,
      media_type: 'movie' as const
    }));

    return {
      ...data,
      results: resultsWithMediaType
    };
  } catch (error) {
    console.error('Error searching movies:', error);
    return {
      page: 1,
      results: [],
      total_pages: 0,
      total_results: 0
    };
  }
};

// Search specifically for TV shows
export const searchTVShows = async (query: string, page: number = 1): Promise<SearchResponse> => {
  try {
    if (!query.trim()) {
      return {
        page: 1,
        results: [],
        total_pages: 0,
        total_results: 0
      };
    }

    const response = await fetch(
      `${BASE_URL}/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}&language=en-US`
    );

    if (!response.ok) {
      throw new Error(`TV search failed: ${response.status}`);
    }

    const data = await response.json();
    
    // Add media_type for consistency
    const resultsWithMediaType = data.results.map((item: SearchResult) => ({
      ...item,
      media_type: 'tv' as const
    }));

    return {
      ...data,
      results: resultsWithMediaType
    };
  } catch (error) {
    console.error('Error searching TV shows:', error);
    return {
      page: 1,
      results: [],
      total_pages: 0,
      total_results: 0
    };
  }
};

// Get trending content for search suggestions
export const getTrending = async (mediaType: 'all' | 'movie' | 'tv' = 'all', timeWindow: 'day' | 'week' = 'week'): Promise<SearchResponse> => {
  try {
    const response = await fetch(
      `${BASE_URL}/trending/${mediaType}/${timeWindow}?api_key=${API_KEY}&language=en-US`
    );

    if (!response.ok) {
      throw new Error(`Trending fetch failed: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      page: data.page || 1,
      results: data.results || [],
      total_pages: data.total_pages || 1,
      total_results: data.total_results || 0
    };
  } catch (error) {
    console.error('Error fetching trending content:', error);
    return {
      page: 1,
      results: [],
      total_pages: 0,
      total_results: 0
    };
  }
};

// Helper function to get display title
export const getDisplayTitle = (item: SearchResult): string => {
  return item.title || item.name || item.original_title || item.original_name || 'Unknown Title';
};

// Helper function to get release year
export const getReleaseYear = (item: SearchResult): string => {
  const date = item.release_date || item.first_air_date;
  if (date) {
    return new Date(date).getFullYear().toString();
  }
  return '';
};