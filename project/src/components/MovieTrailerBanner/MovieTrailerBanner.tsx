import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Info } from 'lucide-react';

interface MovieTrailerBannerProps {
  videoSrc?: string;
  posterSrc?: string;
  title: string;
  description: string;
  genres: string[];
  onPlayClick?: () => void;
  onMoreInfoClick?: () => void;
}

const MovieTrailerBanner: React.FC<MovieTrailerBannerProps> = ({
  videoSrc,
  posterSrc,
  title,
  description,
  genres,
  onPlayClick,
  onMoreInfoClick,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    // Only try to play if videoSrc is provided
    if (videoRef.current && videoSrc && !videoError) {
      // Add event listeners to track loading and errors
      const loadHandler = () => console.log('Video loaded successfully');
      const errorHandler = () => {
        console.warn('Video failed to load, using static background');
        setVideoError(true);
      };
      
      videoRef.current.addEventListener('loadeddata', loadHandler);
      videoRef.current.addEventListener('error', errorHandler);
      
      // Try to play the video
      videoRef.current.play().catch(error => {
        console.error('Error playing video:', error);
        setVideoError(true);
      });
      
      // Clean up event listeners
      return () => {
        if (videoRef.current) {
          videoRef.current.removeEventListener('loadeddata', loadHandler);
          videoRef.current.removeEventListener('error', errorHandler);
        }
      };
    }
  }, [videoSrc, videoError]);

  const [elementsLoaded, setElementsLoaded] = useState(false);

  // Set elements as loaded after a brief delay for smoother fade-in effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setElementsLoaded(true);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  // Container animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.8,
        when: 'beforeChildren',
        staggerChildren: 0.15
      }
    }
  };

  // Element animation variants
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.6,
        ease: 'easeOut'
      }
    }
  };

  return (
    <motion.div 
      className="relative w-full h-[70vh] md:h-[80vh] overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Video or Image Background */}
      {!videoError && videoSrc ? (
        <video
          ref={videoRef}
          className="absolute top-0 left-0 w-full h-full object-cover"
          src={videoSrc}
          poster={posterSrc}
          muted
          autoPlay
          loop
          playsInline
        />
      ) : (
        <div 
          className="absolute top-0 left-0 w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: posterSrc ? 
              `url(${posterSrc})` : 
              'linear-gradient(to right, #141414, #242424)'
          }}
        />
      )}

      {/* Dark Overlay Gradient */}
      {/* Enhanced dark gradients for better readability and Netflix-like style */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent z-10" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black z-10" />

      {/* Content Container */}
      <motion.div 
        className="relative z-20 h-full w-full flex flex-col justify-center px-6 sm:px-8 md:px-16 lg:px-24"
        variants={containerVariants}
        initial="hidden"
        animate={elementsLoaded ? "visible" : "hidden"}
      >
        <div className="w-full text-center sm:text-left sm:max-w-[80%] md:max-w-[60%] lg:max-w-[50%]">
          {/* Movie Title */}
          <motion.h1 
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4"
            variants={itemVariants}
          >
            {title}
          </motion.h1>

          {/* Genre Tags */}
          <motion.div 
            className="flex flex-wrap justify-center sm:justify-start gap-2 mb-4"
            variants={itemVariants}
          >
            {genres.map((genre, index) => (
              <span 
                key={index} 
                className="text-xs md:text-sm bg-red-600/80 text-white px-3 py-1 rounded-sm"
              >
                {genre}
              </span>
            ))}
          </motion.div>

          {/* Description */}
          <motion.p 
            className="text-sm md:text-base text-white/90 mb-6 line-clamp-3 md:line-clamp-4 max-w-[100%] md:max-w-[90%]"
            variants={itemVariants}
          >
            {description}
          </motion.p>

          {/* Action Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row items-center sm:items-start justify-center sm:justify-start gap-3 sm:gap-4"
            variants={itemVariants}
          >
            <motion.button
              className="flex items-center justify-center gap-2 w-full sm:w-auto bg-white text-black font-semibold px-8 py-3 rounded hover:bg-white/90 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onPlayClick}
            >
              <Play className="h-5 w-5" />
              Play
            </motion.button>
            <motion.button
              className="flex items-center justify-center gap-2 w-full sm:w-auto bg-gray-600/70 text-white font-semibold px-8 py-3 rounded hover:bg-gray-700/80 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onMoreInfoClick}
            >
              <Info className="h-5 w-5" />
              More Info
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MovieTrailerBanner;