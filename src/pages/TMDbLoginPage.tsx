import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { authenticateWithTMDb } from '../api/tmdbAuth';
import BrowseNavbar from '../components/Navbar/BrowseNavbar';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const TMDbLoginPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if not authenticated with main app
  React.useEffect(() => {
    if (!user) {
      navigate('/signin');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      toast.error('Please enter both username and password');
      return;
    }

    setLoading(true);
    try {
      const result = await authenticateWithTMDb(username, password);
      
      toast.success(`Successfully signed in to TMDb as ${result.accountDetails.username}`);
      navigate('/my-lists');
    } catch (error: any) {
      console.error('TMDb authentication failed:', error);
      
      if (error.response?.status === 401) {
        toast.error('Invalid TMDb credentials. Please check your username and password.');
      } else if (error.response?.status === 429) {
        toast.error('Too many requests. Please try again later.');
      } else {
        toast.error('Failed to sign in to TMDb. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <BrowseNavbar />
      
      <div className="pt-20 px-4 md:px-8">
        <div className="max-w-md mx-auto">
          <motion.div
            className="bg-gray-900 rounded-lg p-8 shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Sign in to TMDb</h1>
              <p className="text-gray-400">
                Connect your TMDb account to access favorites and watchlists
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                  TMDb Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                  placeholder="Enter your TMDb username"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  TMDb Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                  placeholder="Enter your TMDb password"
                  disabled={loading}
                />
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign in to TMDb'
                )}
              </motion.button>
            </form>

            <div className="mt-8 p-4 bg-gray-800 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-300 mb-2">Don't have a TMDb account?</h3>
              <p className="text-xs text-gray-400 mb-3">
                You need a TMDb account to use favorites and watchlist features.
              </p>
              <a
                href="https://www.themoviedb.org/signup"
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-400 hover:text-red-300 text-sm underline"
              >
                Create a free TMDb account →
              </a>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => navigate('/browse')}
                className="text-gray-400 hover:text-white text-sm underline"
              >
                Skip for now and continue browsing
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TMDbLoginPage;