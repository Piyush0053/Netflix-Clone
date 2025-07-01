import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, Heart, Bookmark, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { isAuthenticated, getStoredSessionData, signOutTMDb } from '../../api/tmdbAuth';
import './Navbar.css';
                                              
const BrowseNavbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
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

  const handleTMDbSignOut = () => {
    signOutTMDb();
    setIsTMDbAuthenticated(false);
    setTmdbUsername(null);
    setIsProfileOpen(false);
  };

  return (
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
          <Link to="/search" className="text-white hover:text-gray-300 transition-colors">
            Search
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
          <Link to="/search">
            <motion.button
              className="p-2 text-white hover:text-gray-300 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Search"
            >
              <Search size={20} />
            </motion.button>
          </Link>

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
            <div className={`absolute right-0 mt-2 w-64 bg-[#141414] rounded-md shadow-lg py-1 z-50 border border-gray-700 ${isProfileOpen ? 'block' : 'hidden'}`}>
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
              
              <Link 
                to="/search" 
                className="flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
                onClick={() => setIsProfileOpen(false)}
              >
                <Search size={16} className="mr-2" />
                Search
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
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BrowseNavbar;