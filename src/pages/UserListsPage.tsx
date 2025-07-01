import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Bookmark, Play } from 'lucide-react';
import {
  getFavoriteMovies,
  getFavoriteTv,
  getWatchlistMovies,
  getWatchlistTv,
  fetchVideos,
  getTrailerUrl
} from '../api/tmdbApi';
import { getStoredSessionData, isAuthenticated } from '../api/tmdbAuth';
import MovieCardActions from '../components/MovieCardActions';
import TrailerModal from '../components/TrailerModal';
import BrowseNavbar from '../components/Navbar/BrowseNavbar';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface MediaItem {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string;
  backdrop_path?: string;
  overview?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  media_type?: 'movie' | 'tv';
}

const UserListsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [favoriteMovies, setFavoriteMovies] = useState<MediaItem[]>([]);
  const [favoriteTv, setFavoriteTv] = useState<MediaItem[]>([]);
  const [watchlistMovies, setWatchlistMovies] = useState<MediaItem[]>([]);
  const [watchlistTv, setWatchlistTv] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrailer, setSelectedTrailer] = useState<string | null>(null);
  const [trailerLoading, setTrailerLoading] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'favorites' | 'watchlist'>('favorites');

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/signin');
    }
  }, [user, navigate]);

  useEffect(() => {
    const loadUserLists = async () => {
      if (!isAuthenticated()) {
        toast.error('Please sign in with TMDb to view your lists');
        setLoading(false);
        return;
      }

      const sessionData = getStoredSessionData();
      if (!sessionData.sessionId || !sessionData.accountId) {
        toast.error('TMDb session not found. Please sign in again.');
        setLoading(false);
        return;
      }

      try {
        const [favMovies, favTv, watchMovies, watchTv] = await Promise.all([
          getFavoriteMovies(sessionData.accountId, sessionData.sessionId),
          getFavoriteTv(sessionData.accountId, sessionData.sessionId),
          getWatchlistMovies(sessionData.accountId, sessionData.sessionId),
          getWatchlistTv(sessionData.accountId, sessionData.sessionId)
        ]);

        setFavoriteMovies(favMovies.map((item: MediaItem) => ({ ...item, media_type: 'movie' })));
        setFavoriteTv(favTv.map((item: MediaItem) => ({ ...item, media_type: 'tv' })));
        setWatchlistMovies(watchMovies.map((item: MediaItem) => ({ ...item, media_type: 'movie' })));
        setWatchlistTv(watchTv.map((item: MediaItem) => ({ ...item, media_type: 'tv' })));
      } catch (error) {
        console.error('Error loading user lists:', error);
        toast.error('Failed to load your lists');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadUserLists();
    }
  }, [user]);

  const handlePlayTrailer = async (item: MediaItem) => {
    if (!item.media_type) return;
    
    setTrailerLoading(item.id);
    try {
      const videos = await fetchVideos(item.id, item.media_type);
      const trailerInfo = getTrailerUrl(videos);
      
      if (trailerInfo && trailerInfo.embedUrl) {
        setSelectedTrailer(trailerInfo.embedUrl);
      } else {
        toast.error('No trailer found for this item');
      }
    } catch (error) {
      console.error('Error fetching trailer:', error);
      toast.error('Failed to load trailer');
    } finally {
      setTrailerLoading(null);
    }
  };

  const renderMediaGrid = (items: MediaItem[], title: string) => {
    if (items.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-400">No items in your {title.toLowerCase()}</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {items.map((item, index) => (
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
                  mediaType={item.media_type!}
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
    );
  };

  if (!user) {
    return null; // Will redirect via useEffect
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <BrowseNavbar />
        <div className="flex justify-center items-center h-screen">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-400">Loading your lists...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <BrowseNavbar />
      
      <div className="pt-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-6">My Lists</h1>
            
            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-gray-800 rounded-lg p-1 w-fit">
              <button
                onClick={() => setActiveTab('favorites')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  activeTab === 'favorites'
                    ? 'bg-red-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Heart size={16} />
                Favorites
              </button>
              <button
                onClick={() => setActiveTab('watchlist')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  activeTab === 'watchlist'
                    ? 'bg-red-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Bookmark size={16} />
                Watchlist
              </button>
            </div>
          </motion.div>

          {/* Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'favorites' ? (
              <motion.div
                key="favorites"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Favorite Movies */}
                <div className="mb-12">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Heart className="text-red-600" size={24} />
                    Favorite Movies ({favoriteMovies.length})
                  </h2>
                  {renderMediaGrid(favoriteMovies, 'Favorite Movies')}
                </div>

                {/* Favorite TV Shows */}
                <div className="mb-12">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Heart className="text-red-600" size={24} />
                    Favorite TV Shows ({favoriteTv.length})
                  </h2>
                  {renderMediaGrid(favoriteTv, 'Favorite TV Shows')}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="watchlist"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Watchlist Movies */}
                <div className="mb-12">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Bookmark className="text-blue-600" size={24} />
                    Watchlist Movies ({watchlistMovies.length})
                  </h2>
                  {renderMediaGrid(watchlistMovies, 'Watchlist Movies')}
                </div>

                {/* Watchlist TV Shows */}
                <div className="mb-12">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Bookmark className="text-blue-600" size={24} />
                    Watchlist TV Shows ({watchlistTv.length})
                  </h2>
                  {renderMediaGrid(watchlistTv, 'Watchlist TV Shows')}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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

export default UserListsPage;