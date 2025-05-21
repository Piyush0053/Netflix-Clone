import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation, Link } from 'react-router-dom';
import './Navbar.css';

interface NavbarProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
  navigate: (path: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ darkMode, toggleDarkMode, navigate }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const isShowPage = location.pathname === '/netflix-show';
  const isAuthPage = location.pathname === '/signup' || location.pathname === '/signin';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLanguage(e.target.value);
  };

  return (
    <motion.div 
      className={`main-logo-bar glass-effect ${isScrolled ? 'scrolled' : ''} ${isShowPage ? 'show-page' : ''}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <Link to="/">
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" 
          alt="Netflix Logo" 
          className="main-netflix-logo" 
        />
      </Link>
      
      <div className="top-right-controls">
        {!isShowPage && (
          <>
            <motion.button 
              className="theme-toggle"
              whileTap={{ scale: 0.9 }}
              onClick={toggleDarkMode}
            >
              <span className="theme-toggle-icon">
                {darkMode ? '☀️' : '🌙'}
              </span>
            </motion.button>
            
            <div className="language-picker-top glass-effect">
              <select
                className="language-select"
                value={selectedLanguage}
                onChange={handleLanguageChange}
              >
                <option value="en">English</option>
                <option value="hi">हिंदी</option>
              </select>
            </div>
          </>
        )}
        
        {isShowPage ? (
          <img
            className="nav-avatar"
            src="https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png"
            alt="Netflix Avatar"
          />
        ) : (
          <div className="auth-buttons">
            <Link to="/signin">
              <motion.button 
                className="btn btn-red btn-sign-in glass-effect"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Sign In
              </motion.button>
            </Link>
            
            {!isAuthPage && (
              <Link to="/signup">
                <motion.button 
                  className="btn btn-red btn-sign-up glass-effect ml-4"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Sign Up
                </motion.button>
              </Link>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Navbar;