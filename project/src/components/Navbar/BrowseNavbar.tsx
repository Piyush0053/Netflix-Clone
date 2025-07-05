import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SearchBar from '../SearchBar/SearchBar';
import TrailerModal from '../TrailerModal';
import { type SearchResult } from '../../api/tmdbSearch';
import { fetchVideos, getTrailerUrl } from '../../api/tmdbApi';
import './Navbar.css';

const BrowseNavbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);
  const [isLoadingTrailer, setIsLoadingTrailer] = useState(false);
  const [selectedContent, setSelectedContent] = useState<SearchResult | null>(null);

  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchResultSelect = async (result: SearchResult) => {

    console.log('Selected search result:', result);
    setSelectedContent(result);
    setIsLoadingTrailer(true);

    try {
      // Ensure we're using the correct ID and media type from the selected result
      const mediaType = result.media_type || (result.title ? 'movie' : 'tv');
      const contentId = result.id;
      
      console.log(`Fetching videos for ${mediaType} with ID: ${contentId}`);
      
      // Fetch videos for the selected content with the exact ID and media type
      const videos = await fetchVideos(contentId, mediaType as 'movie' | 'tv');
      console.log('Fetched videos:', videos);
      
      const trailerInfo = getTrailerUrl(videos, { muted: false, autoplay: true });

      console.log('Trailer info:', trailerInfo);

      
      if (trailerInfo && trailerInfo.embedUrl) {
        setTrailerUrl(trailerInfo.embedUrl);
        setShowTrailer(true);
        console.log('Playing trailer:', trailerInfo.embedUrl);
      } else {
        console.log('No trailer found for:', result.title || result.name);
        // Show a user-friendly message
        alert(`Sorry, no trailer is available for "${result.title || result.name}"`);
      }
    } catch (error) {
      console.error('Error fetching trailer:', error);
      alert('Failed to load trailer. Please try again.');
    } finally {
      setIsLoadingTrailer(false);
    }
  };

  const closeTrailer = () => {
    console.log('Closing trailer');
    setShowTrailer(false);
    setTrailerUrl(null);
  };

  // Helper function to check if a nav link is active
  const isActiveLink = (path: string) => {
    if (path === '/browse' && location.pathname === '/browse') return true;
    if (path !== '/browse' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      <motion.div 
        className={`main-logo-bar glass-effect ${isScrolled ? 'scrolled' : ''}`}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div className="navbar-left">
          <Link to="/browse">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" 
              alt="Netflix Logo" 
              className="main-netflix-logo" 
            />
          </Link>
          
          {/* Navigation Links */}
          <nav className="nav-links">
            <Link 
              to="/browse" 
              className={`nav-link ${isActiveLink('/browse') ? 'active' : ''}`}
            >
              Home
            </Link>
            <Link 
              to="/browse/tv-shows" 
              className={`nav-link ${isActiveLink('/browse/tv-shows') ? 'active' : ''}`}
            >
              TV Shows
            </Link>
            <Link 
              to="/browse/movies" 
              className={`nav-link ${isActiveLink('/browse/movies') ? 'active' : ''}`}
            >
              Movies
            </Link>
            <Link 
              to="/browse/new-popular" 
              className={`nav-link ${isActiveLink('/browse/new-popular') ? 'active' : ''}`}
            >
              New & Popular
            </Link>
            <Link 
              to="/browse/my-list" 
              className={`nav-link ${isActiveLink('/browse/my-list') ? 'active' : ''}`}
            >
              My List
            </Link>
          </nav>
        </div>
        
        <div className="navbar-center">
          <SearchBar 
            onResultSelect={handleSearchResultSelect}
            placeholder="Search for movies and TV shows..."
            className="navbar-search"
          />
        </div>
        
        <div className="top-right-controls">
          <div className="flex items-center gap-4">
            <div className="relative">
              <motion.img
                className="nav-avatar cursor-pointer"
                src="https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png"
                alt="Netflix Avatar"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              />
              <div className={`absolute right-0 mt-2 w-48 bg-[#141414] rounded-md shadow-lg py-1 z-50 ${isProfileOpen ? 'block' : 'hidden'}`}>
                <div className="px-4 py-2 text-sm text-gray-400 border-b border-gray-700">
                  {user?.email || 'User'}
                </div>
                <Link to="/profile" className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-700">Profile</Link>
                <button 
                  onClick={async () => {
                    try {
                      await signOut();
                      navigate('/');
                    } catch (error) {
                      console.error('Error signing out:', error);
                    }
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Loading indicator for trailer */}
      <AnimatePresence>
        {isLoadingTrailer && (
          <motion.div
            className="fixed bottom-4 right-4 bg-black/80 text-white px-4 py-2 rounded-lg flex items-center gap-2 z-40"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Loading trailer for {selectedContent?.title || selectedContent?.name}...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trailer Modal */}
      <AnimatePresence>
        {showTrailer && trailerUrl && (
          <TrailerModal 
            trailerUrl={trailerUrl} 
            onClose={closeTrailer} 
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default BrowseNavbar;