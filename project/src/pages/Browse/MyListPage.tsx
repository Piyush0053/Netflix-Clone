import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import BrowseNavbar from '../../components/Navbar/BrowseNavbar';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

interface WatchlistItem {
  id: string;
  user_id: string;
  movie_id: number;
  title: string;
  poster_path: string;
  media_type: 'movie' | 'tv';
  added_at: string;
}

const MyListPage: React.FC = () => {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWatchlist = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('user_watchlist')
          .select('*')
          .eq('user_id', user.id)
          .order('added_at', { ascending: false });

        if (error) throw error;
        setWatchlist(data || []);
      } catch (error) {
        console.error('Error fetching watchlist:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWatchlist();
  }, [user]);

  const removeFromWatchlist = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('user_watchlist')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      
      setWatchlist(prev => prev.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error removing from watchlist:', error);
    }
  };

  return (
    <motion.div 
      className="min-h-screen bg-netflix-black text-white overflow-x-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <BrowseNavbar />
      
      {/* Hero Section */}
      <motion.div 
        className="pt-24 pb-8 px-4 md:px-8"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">My List</h1>
          <p className="text-xl text-gray-300 max-w-2xl">
            Your personal collection of movies and TV shows to watch later.
          </p>
        </div>
      </motion.div>

      {/* Watchlist Content */}
      <motion.div
        className="relative z-10 pb-12 px-4 md:px-8"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="w-8 h-8 border-4 border-netflix-red border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : watchlist.length === 0 ? (
            <div className="text-center py-20">
              <h2 className="text-2xl font-semibold mb-4">Your list is empty</h2>
              <p className="text-gray-400 mb-8">
                Start adding movies and TV shows to your list to see them here.
              </p>
              <motion.button
                className="bg-netflix-red px-6 py-3 rounded-md hover:bg-red-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.history.back()}
              >
                Browse Content
              </motion.button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {watchlist.map((item) => (
                <motion.div
                  key={item.id}
                  className="relative group cursor-pointer"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="aspect-[2/3] bg-gray-800 rounded-md overflow-hidden">
                    {item.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <span className="text-sm text-center p-2">{item.title}</span>
                      </div>
                    )}
                    
                    {/* Overlay with remove button */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <button
                        onClick={() => removeFromWatchlist(item.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <h3 className="text-sm font-medium line-clamp-2">{item.title}</h3>
                    <p className="text-xs text-gray-400 mt-1">
                      {item.media_type === 'movie' ? 'Movie' : 'TV Show'}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MyListPage;