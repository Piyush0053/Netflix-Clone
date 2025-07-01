import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Bookmark, Play } from 'lucide-react';
import { addFavorite, addToWatchlist, isInFavorites, isInWatchlist } from '../api/tmdbApi';
import { getStoredSessionData } from '../api/tmdbAuth';
import toast from 'react-hot-toast';

interface MovieCardActionsProps {
  mediaId: number;
  mediaType: 'movie' | 'tv';
  title: string;
  onPlayTrailer?: () => void;
  className?: string;
}

const MovieCardActions: React.FC<MovieCardActionsProps> = ({
  mediaId,
  mediaType,
  title,
  onPlayTrailer,
  className = ''
}) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isWatchlist, setIsWatchlist] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check initial state
    setIsFavorite(isInFavorites(mediaId, mediaType));
    setIsWatchlist(isInWatchlist(mediaId, mediaType));
  }, [mediaId, mediaType]);

  const handleFavoriteToggle = async () => {
    const sessionData = getStoredSessionData();
    
    if (!sessionData.sessionId || !sessionData.accountId) {
      toast.error('Please sign in with TMDb to use favorites');
      return;
    }

    setLoading(true);
    try {
      await addFavorite(
        sessionData.accountId,
        sessionData.sessionId,
        mediaType,
        mediaId,
        !isFavorite
      );
      
      setIsFavorite(!isFavorite);
      toast.success(
        isFavorite 
          ? `Removed ${title} from favorites` 
          : `Added ${title} to favorites`
      );
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
    } finally {
      setLoading(false);
    }
  };

  const handleWatchlistToggle = async () => {
    const sessionData = getStoredSessionData();
    
    if (!sessionData.sessionId || !sessionData.accountId) {
      toast.error('Please sign in with TMDb to use watchlist');
      return;
    }

    setLoading(true);
    try {
      await addToWatchlist(
        sessionData.accountId,
        sessionData.sessionId,
        mediaType,
        mediaId,
        !isWatchlist
      );
      
      setIsWatchlist(!isWatchlist);
      toast.success(
        isWatchlist 
          ? `Removed ${title} from watchlist` 
          : `Added ${title} to watchlist`
      );
    } catch (error) {
      console.error('Error toggling watchlist:', error);
      toast.error('Failed to update watchlist');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {onPlayTrailer && (
        <motion.button
          className="flex items-center justify-center w-8 h-8 bg-white text-black rounded-full hover:bg-gray-200 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onPlayTrailer}
          title="Play Trailer"
        >
          <Play size={16} />
        </motion.button>
      )}
      
      <motion.button
        className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
          isFavorite 
            ? 'bg-red-600 text-white' 
            : 'bg-gray-600/70 text-white hover:bg-gray-500/70'
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleFavoriteToggle}
        disabled={loading}
        title={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
      >
        <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
      </motion.button>
      
      <motion.button
        className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
          isWatchlist 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-600/70 text-white hover:bg-gray-500/70'
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleWatchlistToggle}
        disabled={loading}
        title={isWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
      >
        <Bookmark size={16} fill={isWatchlist ? 'currentColor' : 'none'} />
      </motion.button>
    </div>
  );
};

export default MovieCardActions;