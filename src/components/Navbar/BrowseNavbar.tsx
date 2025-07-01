import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, Heart, Bookmark, User, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { isAuthenticated, getStoredSessionData, signOutTMDb } from '../../api/tmdbAuth';
import { searchMulti, fetchVideos, getTrailerUrl } from '../../api/tmdbApi';
import MovieCardActions from '../MovieCardActions';
import TrailerModal from '../TrailerModal';
import './Navbar.css';

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
                                              
const BrowseNavbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedTrailer, setSelectedTrailer] = useState<string | null>(null);
  const [trailerLoading, setTrailerLoading] = useState<number | null>(null);
  const [isTMDbAuthenticated, setIsTMDbAuthenticated] = useState(false);
  const [tmdbUsername, setTmdbUsername] = useState<string | null>(null);
  const { user, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Check TMDb authentication status
    const checkTMDbAuth = () => {
      const authenticated = isAuthenticated();
      setIsTMDbAuthenticated(authenticated);
      
      if (authenticated) {
        const sessionData = getStoredSessionData();
        setTmdbUsername(sessionData.username);
      }
    };

    checkTMDbAuth();
    
    // Check periodically in case user signs in/out in another tab
    const interval = setInterval(checkTMDbAuth, 5000);
    return () => clearInterval(interval);
  }, []);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const results = await searchMulti(query);
      // Filter out person results and limit to 8 results
      const filteredResults = results
        .filter((result: SearchResult) => result.media_type !== 'person')
        .slice(0, 8);
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Error searching:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
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

  const handleTMDbSignOut = () => {
    signOutTMDb();
    setIsTMDbAuthenticated(false);
    setTmdbUsername(null);
    setIsProfileOpen(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearchOpen(false);
  };

  return (
    <>
      <motion.div 
        className={`main-logo-bar glass-effect ${isScrolled ? 'scrolled' : ''}`}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div className="flex items-center">
          <Link to="/">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" 
              alt="Netflix Logo" 
              className="main-netflix-logo" 
            />
          </Link>
          
          {/* Navigation Links */}
          <nav className="hidden md:flex items-center ml-8 space-x-6">
            <Link to="/browse" className="text-white hover:text-gray-300 transition-colors">
              Home
            </Link>
            {isTMDbAuthenticated && (
              <Link to="/my-lists" className="text-white hover:text-gray-300 transition-colors">
                My Lists
              </Link>
            )}
          </nav>
        </div>
        
        <div className="top-right-controls">
          <div className="flex items-center gap-4">
            {/* Search Icon */}
            <motion.button
              className="p-2 text-white hover:text-gray-300 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              title="Search"
            >
              <Search size={20} />
            </motion.button>

            {/* My Lists Icon (only show if TMDb authenticated) */}
            {isTMDbAuthenticated && (
              <Link to="/my-lists">
                <motion.button
                  className="p-2 text-white hover:text-gray-300 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="My Lists"
                >
                  <Heart size={20} />
                </motion.button>
              </Link>
            )}

            {/* Profile Dropdown */}
            <div className="relative">
              <motion.img
                className="nav-avatar cursor-pointer"
                src="https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png"
                alt="Netflix Avatar"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              />
              
              {/* Dropdown Menu */}
              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    className="absolute right-0 mt-2 w-64 bg-[#141414] rounded-md shadow-lg py-1 z-50 border border-gray-700"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-700">
                      <div className="text-sm text-gray-200 font-medium">
                        {user?.email || 'User'}
                      </div>
                      {isTMDbAuthenticated && tmdbUsername && (
                        <div className="text-xs text-green-400 mt-1">
                          TMDb: {tmdbUsername}
                        </div>
                      )}
                    </div>

                    {/* Navigation Links */}
                    <Link 
                      to="/profile" 
                      className="flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <User size={16} className="mr-2" />
                      Profile
                    </Link>

                    {isTMDbAuthenticated ? (
                      <>
                        <Link 
                          to="/my-lists" 
                          className="flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <Heart size={16} className="mr-2" />
                          My Lists
                        </Link>
                        <button 
                          onClick={handleTMDbSignOut}
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
                        >
                          <Bookmark size={16} className="mr-2" />
                          Sign out of TMDb
                        </button>
                      </>
                    ) : (
                      <Link 
                        to="/tmdb-login" 
                        className="flex items-center px-4 py-2 text-sm text-blue-400 hover:bg-gray-700"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Bookmark size={16} className="mr-2" />
                        Connect TMDb
                      </Link>
                    )}

                    {/* Divider */}
                    <div className="border-t border-gray-700 my-1"></div>

                    {/* Sign Out */}
                    <button 
                      onClick={() => {
                        signOut();
                        setIsProfileOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
                    >
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            className="fixed inset-0 bg-black/90 z-50 pt-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="max-w-4xl mx-auto px-4">
              {/* Search Input */}
              <div className="relative mb-8">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for movies, TV shows..."
                    className="w-full pl-12 pr-12 py-4 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                    autoFocus
                  />
                  <button
                    onClick={clearSearch}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Loading State */}
              {searchLoading && (
                <div className="flex justify-center items-center py-12">
                  <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="ml-3 text-gray-400">Searching...</span>
                </div>
              )}

              {/* Search Results */}
              {searchResults.length > 0 && !searchLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-xl font-semibold mb-4 text-white">
                    Search Results ({searchResults.length})
                  </h2>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {searchResults.map((item, index) => (
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
                          <h3 className="font-semibold text-sm mb-1 line-clamp-2 text-white">
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

              {/* No Results */}
              {searchQuery && !searchLoading && searchResults.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-lg">
                    No results found for "{searchQuery}"
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    Try searching with different keywords
                  </p>
                </div>
              )}

              {/* Empty State */}
              {!searchQuery && !searchLoading && (
                <div className="text-center py-12">
                  <Search className="mx-auto mb-4 text-gray-600" size={48} />
                  <p className="text-gray-400 text-lg">
                    Start typing to search for movies and TV shows
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trailer Modal */}
      <AnimatePresence>
        {selectedTrailer && (
          <TrailerModal
            trailerUrl={selectedTrailer}
            onClose={() => setSelectedTrailer(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default BrowseNavbar;