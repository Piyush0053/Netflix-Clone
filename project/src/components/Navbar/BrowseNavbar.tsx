import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';
                                              
const BrowseNavbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.div 
      className={`main-logo-bar glass-effect ${isScrolled ? 'scrolled' : ''}`}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <Link to="/">
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" 
          alt="Netflix Logo" 
          className="main-netflix-logo" 
        />
      </Link>
      
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
                onClick={signOut}
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
