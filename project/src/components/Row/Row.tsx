import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from '../../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import YouTube from 'react-youtube';
import movieTrailer from 'movie-trailer';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const base_url = "https://image.tmdb.org/t/p/original/";

interface RowProps {
  title: string;
  fetchURL: string;
  isLargeRow?: boolean;
}

interface Movie {
  id: number;
  name: string;
  title: string;
  original_name: string;
  poster_path: string;
  backdrop_path: string;
  overview?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
}

const Row: React.FC<RowProps> = ({ title, fetchURL, isLargeRow = false }) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [trailerUrl, setTrailerUrl] = useState<string | null>("");
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        const request = await axios.get(fetchURL);
        setMovies(request.data.results);
      } catch (error) {
        console.error("Error fetching row data:", error);
        setError("Failed to load movies");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
    
    return () => {
      // Clean up any potential memory leaks
      setTrailerUrl("");
      setShowTrailer(false);
    };
  }, [fetchURL]);

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

  const closeTrailer = () => {
    setTrailerUrl("");
    setShowTrailer(false);
    setSelectedMovie(null);
  };

  const handleClick = async (movie: Movie) => {
    if (trailerUrl && selectedMovie?.id === movie.id) {
      closeTrailer();
    } else {
      try {
        const url = await movieTrailer(
          movie?.name || movie?.title || movie?.original_name || ""
        );
        if (url) {
          const urlParams = new URLSearchParams(new URL(url).search);
          const videoId = urlParams.get("v");
          if (videoId) {
            setTrailerUrl(videoId);
            setSelectedMovie(movie);
            setShowTrailer(true);
            // Scroll to make trailer visible if needed
            setTimeout(() => {
              const trailerElement = document.getElementById(`trailer-${title.replace(/\s+/g, '-')}`);
              if (trailerElement) {
                trailerElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }, 100);
          } else {
            console.error("Could not extract video ID from trailer URL");
          }
        } else {
          console.error("No trailer found for:", movie?.title || movie?.name);
        }
      } catch (error) {
        console.error("Error fetching trailer:", error);
      }
    }
  };
  
  const scrollRow = useCallback((direction: 'left' | 'right') => {
    const container = rowRef.current;
    if (container) {
      const scrollAmount = direction === 'left' ? -500 : 500;
      const newPosition = scrollPosition + scrollAmount;
      container.scrollTo({ left: newPosition, behavior: 'smooth' });
      setScrollPosition(newPosition);
    }
  }, [scrollPosition]);

  // Helper function to get display title
  const getDisplayTitle = (movie: Movie): string => {
    return movie.title || movie.name || movie.original_name || 'Unknown Title';
  };

  // Helper function to get release year
  const getReleaseYear = (movie: Movie): string => {
    const date = movie.release_date || movie.first_air_date;
    if (date) {
      return new Date(date).getFullYear().toString();
    }
    return '';
  };

  return (
    <motion.div 
      className="row relative mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, staggerChildren: 0.1 }}
      layout
    >
      <h2 className="text-2xl font-bold text-white mb-4 ml-4">{title}</h2>
      
      {/* Navigation buttons */}
      <button 
        className="absolute left-0 top-1/2 -translate-y-12 bg-black/50 p-2 rounded-full z-10 text-white hover:bg-black/80 transition-all"
        onClick={() => scrollRow('left')}
        style={{ display: scrollPosition <= 0 ? 'none' : 'block' }}
      >
        <ChevronLeft size={20} />
      </button>
      
      <button 
        className="absolute right-0 top-1/2 -translate-y-12 bg-black/50 p-2 rounded-full z-10 text-white hover:bg-black/80 transition-all"
        onClick={() => scrollRow('right')}
      >
        <ChevronRight size={20} />
      </button>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="w-8 h-8 border-4 border-netflix-red border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-40 text-netflix-light-gray">
          {error}
        </div>
      ) : (
        <div 
          className="flex overflow-x-scroll overflow-y-hidden p-4 hide-scrollbar" 
          ref={rowRef}
          onScroll={(e) => setScrollPosition(e.currentTarget.scrollLeft)}
        >
          <div className="flex space-x-4">
            {movies.map((movie) => (
              <motion.div
                key={movie.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: '-100px' }}
                className="flex-shrink-0 relative group"
              >
                {movie.poster_path || movie.backdrop_path ? (
                  <div className="relative">
                    <motion.img
                      loading="lazy"
                      onClick={() => handleClick(movie)}
                      className={`object-contain cursor-pointer ${isLargeRow ? 'h-64 min-w-[200px]' : 'h-40 min-w-[150px]'}`}
                      src={`${base_url}${isLargeRow ? movie.poster_path : movie.backdrop_path}`}
                      alt={getDisplayTitle(movie)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 400, 
                        damping: 17,
                        bounce: 0.2
                      }}
                    />
                    
                    {/* Movie title overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <h3 className="text-white text-sm font-semibold leading-tight line-clamp-2">
                        {getDisplayTitle(movie)}
                      </h3>
                      {getReleaseYear(movie) && (
                        <p className="text-gray-300 text-xs mt-1">
                          {getReleaseYear(movie)}
                        </p>
                      )}
                      {movie.vote_average && (
                        <div className="flex items-center mt-1">
                          <span className="text-yellow-400 text-xs">★</span>
                          <span className="text-gray-300 text-xs ml-1">
                            {movie.vote_average.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className={`flex items-center justify-center bg-gray-800 text-gray-400 ${isLargeRow ? 'h-64 min-w-[200px]' : 'h-40 min-w-[150px]'} relative group`}>
                    <div className="text-center p-2">
                      <div className="text-xs mb-1">No Image</div>
                      <div className="text-xs font-semibold line-clamp-3">
                        {getDisplayTitle(movie)}
                      </div>
                      {getReleaseYear(movie) && (
                        <div className="text-xs text-gray-500 mt-1">
                          {getReleaseYear(movie)}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}
      
      <AnimatePresence>
        {showTrailer && trailerUrl && selectedMovie && (
          <motion.div 
            id={`trailer-${title.replace(/\s+/g, '-')}`}
            className="relative mt-4 mb-8 bg-black rounded-md overflow-hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="pt-[56.25%] relative">
              <YouTube
                videoId={trailerUrl}
                opts={opts}
                className="absolute top-0 left-0 w-full h-full"
                onEnd={closeTrailer}
              />
            </div>
            <div className="p-4">
              <h3 className="text-white text-xl font-bold">{getDisplayTitle(selectedMovie)}</h3>
              {selectedMovie.overview && (
                <p className="text-gray-300 text-sm mt-2 line-clamp-3">
                  {selectedMovie.overview}
                </p>
              )}
            </div>
            <button 
              className="absolute top-2 right-2 bg-black/70 p-2 rounded-full text-white z-20"
              onClick={closeTrailer}
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Row;