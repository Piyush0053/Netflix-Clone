import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import requests from '../../api/requests';
import { Play, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import YouTube from 'react-youtube';

const Banner: React.FC = () => {
  const [movie, setMovie] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const request = await axios.get(requests.fetchNetflixOriginals);
        // Get a valid movie with backdrop_path
        const results = request.data.results.filter((m: any) => m.backdrop_path);
        const randomMovie = results[Math.floor(Math.random() * results.length)];
        setMovie(randomMovie);
      } catch (error) {
        console.error("Error fetching banner data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
    
    // Clean up function
    return () => {
      setTrailerUrl(null);
      setShowTrailer(false);
    };
  }, []);

  function truncate(str: string, n: number) {
    return str?.length > n ? str.substr(0, n - 1) + "..." : str;
  }

  // Configure YouTube options
  const opts = {
    height: "390",
    width: "100%",
    playerVars: {
      autoplay: 1,
      origin: window.location.origin,
      host: 'https://www.youtube-nocookie.com',
      enablejsapi: 1
    },
  };

  // Handle play button click to fetch and show trailer
  const handlePlayClick = async () => {
    if (showTrailer && trailerUrl) {
      setShowTrailer(false);
      setTrailerUrl(null);
      return;
    }

    try {
      // Get the movie title or name
      const movieTitle = movie?.title || movie?.name || movie?.original_name;
      // Make the API request to search for videos
      const response = await axios.get(
        `/search/movie?api_key=d5bd6f3bb580845fab6e6dee25c3f0a0&query=${encodeURIComponent(movieTitle)}`
      );
      
      // Get the movie ID from the search results
      const movieId = response.data.results[0]?.id;
      
      if (movieId) {
        // Get videos for this movie
        const videoResponse = await axios.get(
          `/movie/${movieId}/videos?api_key=d5bd6f3bb580845fab6e6dee25c3f0a0`
        );
        
        // Get official trailers first, fallback to any video
        const trailers = videoResponse.data.results.filter(
          (video: any) => video.type === "Trailer" && video.site === "YouTube"
        );
        
        if (trailers.length > 0) {
          setTrailerUrl(trailers[0].key);
          setShowTrailer(true);
        } else {
          console.error("No trailer found for this movie");
        }
      }
    } catch (error) {
      console.error("Error fetching trailer:", error);
    }
  };

  if (isLoading) {
    return (
      <motion.div 
        className="relative h-[448px] flex items-center justify-center bg-netflix-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-12 h-12 border-4 border-netflix-red border-t-transparent rounded-full animate-spin"></div>
      </motion.div>
    );
  }

  if (!movie) return null;

  return (
    <motion.header 
      className="relative h-[448px] text-white object-contain"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        backgroundSize: "cover",
        backgroundImage: `linear-gradient(180deg, transparent, rgba(37, 37, 37, 0.61), #111),
          url("https://image.tmdb.org/t/p/original/${movie?.backdrop_path}")`,
        backgroundPosition: "center center",
      }}
    >
      <div className="ml-8 pt-32 h-48">
        <motion.h1 
          className="text-5xl font-bold pb-3"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {movie?.title || movie?.name || movie?.original_name}
        </motion.h1>
        <motion.div 
          className="flex gap-4 my-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <motion.button 
            className="banner-button bg-white text-black"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePlayClick}
          >
            <Play className="h-5 w-5" />
            {showTrailer ? 'Close' : 'Play'}
          </motion.button>
          <motion.button 
            className="banner-button bg-gray-500/70"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Info className="h-5 w-5" />
            More Info
          </motion.button>
        </motion.div>
        <motion.div
          className="w-[45rem] pt-4 text-sm max-w-[360px]"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {truncate(movie?.overview, 150)}
        </motion.div>
      </div>
      
      {/* Trailer section */}
      {showTrailer && trailerUrl && (
        <motion.div 
          className="absolute bottom-0 left-0 right-0 z-10 bg-black"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <YouTube
            videoId={trailerUrl}
            opts={opts}
            className="w-full"
            onEnd={() => setShowTrailer(false)}
          />
          <motion.button
            className="absolute top-2 right-2 bg-black/70 text-white p-2 rounded-full"
            onClick={() => setShowTrailer(false)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            ✕
          </motion.button>
        </motion.div>
      )}
    </motion.header>
  );
}

export default Banner;