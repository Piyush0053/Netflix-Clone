import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { searchMulti, fetchVideos, getTrailerUrl } from '../api/tmdbApi';
import MovieCardActions from '../components/MovieCardActions';
import TrailerModal from '../components/TrailerModal';
import BrowseNavbar from '../components/Navbar/BrowseNavbar';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
  id: number;
  title?: string;
  name?: string;
  media_type: 'movie' | 'tv' | 'person';
  poster_path?: string;
  backdrop_path?: string;
  overview?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
}

const SearchPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTrailer, setSelectedTrailer] = useState<string | null>(null);
  const [trailerLoading, setTrailerLoading] = useState<number | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/signin');
    }
  }, [user, navigate]);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const searchResults = await searchMulti(searchQuery);
      // Filter out person results for now
      const filteredResults = searchResults.filter(
        (result: SearchResult) => result.media_type !== 'person'
      );
      setResults(filteredResults);
    } catch (error) {
      console.error('Error searching:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayTrailer = async (item: SearchResult) => {
    if (item.media_type === 'person') return;
    
    setTrailerLoading(item.id);
    try {
      const videos = await fetchVideos(item.id, item.media_type as 'movie' | 'tv');
      const trailerInfo = getTrailerUrl(videos);
      
      if (trailerInfo && trailerInfo.embedUrl) {
        setSelectedTrailer(trailerInfo.embedUrl);
      } else {
        console.error('No trailer found for this item');
      }
    } catch (error) {
      console.error('Error fetching trailer:', error);
    } finally {
      setTrailerLoading(null);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
  };

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(query);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [query]);

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <BrowseNavbar />
      
      <div className="pt-20 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Search Header */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-6">Search Movies & TV Shows</h1>
            
            {/* Search Input */}
            <div className="relative max-w-2xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for movies, TV shows..."
                  className="w-full pl-12 pr-12 py-4 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                />
                {query && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Loading State */}
          {loading && (
            <motion.div
              className="flex justify-center items-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-3 text-gray-400">Searching...</span>
            </motion.div>
          )}

          {/* Search Results */}
          <AnimatePresence>
            {results.length > 0 && !loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-xl font-semibold mb-4">
                  Search Results ({results.length})
                </h2>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {results.map((item, index) => (
                    <motion.div
                      key={item.id}
                      className="group relative bg-gray-800 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      {/* Poster Image */}
                      <div className="aspect-[2/3] relative">
                        {item.poster_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                            alt={item.title || item.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                            <span className="text-gray-400 text-sm">No Image</span>
                          </div>
                        )}
                        
                        {/* Overlay with Actions */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <MovieCardActions
                            mediaId={item.id}
                            mediaType={item.media_type as 'movie' | 'tv'}
                            title={item.title || item.name || ''}
                            onPlayTrailer={() => handlePlayTrailer(item)}
                            className="flex-col gap-2"
                          />
                          
                          {trailerLoading === item.id && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Content Info */}
                      <div className="p-3">
                        <h3 className="font-semibold text-sm mb-1 line-clamp-2">
                          {item.title || item.name}
                        </h3>
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span className="capitalize">{item.media_type}</span>
                          <span>
                            {item.release_date?.split('-')[0] || item.first_air_date?.split('-')[0]}
                          </span>
                        </div>
                        {item.vote_average && item.vote_average > 0 && (
                          <div className="mt-1">
                            <span className="text-xs text-yellow-400">
                              ★ {item.vote_average.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* No Results */}
          {query && !loading && results.length === 0 && (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-gray-400 text-lg">
                No results found for "{query}"
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Try searching with different keywords
              </p>
            </motion.div>
          )}

          {/* Empty State */}
          {!query && !loading && (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Search className="mx-auto mb-4 text-gray-600" size={48} />
              <p className="text-gray-400 text-lg">
                Start typing to search for movies and TV shows
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Trailer Modal */}
      <AnimatePresence>
        {selectedTrailer && (
          <TrailerModal
            trailerUrl={selectedTrailer}
            onClose={() => setSelectedTrailer(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchPage;