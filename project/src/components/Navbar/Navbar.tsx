import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { user, signOut } = useAuth();
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

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      // User will be redirected automatically by the auth context
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsSigningOut(false);
    }
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
        {!isShowPage && null}
        
        {isShowPage ? (
          <img
            className="nav-avatar"
            src="https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png"
            alt="Netflix Avatar"
          />
        ) : user ? (
          // Show user menu when signed in
          <div className="flex items-center gap-4">
            <span className="text-white text-sm hidden md:inline">
              {user.email}
            </span>
            <motion.button 
              className="btn btn-red btn-sign-in glass-effect"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSignOut}
              disabled={isSigningOut}
            >
              {isSigningOut ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing Out...
                </div>
              ) : (
                'Sign Out'
              )}
            </motion.button>
          </div>
        ) : (
          // Show auth buttons when not signed in
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