import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './TrendingSection.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import TrailerModal from '../TrailerModal';
import MovieCardActions from '../MovieCardActions';
import { fetchTrending, fetchVideos, getTrailerUrl } from '../../api/tmdbApi';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const TrendingSection: React.FC = () => {
  const [trendingContent, setTrendingContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrailer, setSelectedTrailer] = useState<string | null>(null);
  const [loadingTrailer, setLoadingTrailer] = useState<number | null>(null);
  const trendingRef = useRef<HTMLElement>(null);

  useEffect(() => {
    async function loadTrending() {
      setLoading(true);
      try {
        const data = await fetchTrending();
        const enhancedData = await Promise.all(
          data.map(async (item: { id: number; media_type: string }) => {
            try {
              const videos = await fetchVideos(item.id, item.media_type as "movie" | "tv");
              const hasTrailer = videos.some(
                (video: any) => video.type === 'Trailer' && video.site === 'YouTube'
              );
              return { ...item, hasTrailer };
            } catch (error) {
              console.error(`Error checking trailer for item ${item.id}:`, error);
              return { ...item, hasTrailer: false };
            }
          })
        );
        setTrendingContent(enhancedData);
      } catch (error) {
        console.error('Error loading trending content:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadTrending();
  }, []);

  useEffect(() => {
    if (trendingRef.current && !loading && trendingContent.length > 0) {
      const animationTimeout = setTimeout(() => {
        const titleElement = document.querySelector('.trending-title');
        if (titleElement) {
          gsap.fromTo(titleElement, 
            { opacity: 0, y: 10 },
            { 
              opacity: 1, 
              y: 0, 
              duration: 0.4,
              clearProps: "transform"
            }
          );
        }
        
        const cards = document.querySelectorAll('.trending-card');
        if (cards && cards.length > 0) {
          const visibleCards = Array.from(cards).slice(0, 6);
          
          gsap.fromTo(visibleCards, 
            { opacity: 0, y: 15 },
            { 
              opacity: 1, 
              y: 0, 
              stagger: 0.05,
              duration: 0.4,
              clearProps: "transform"
            }
          );
        }
      }, 300);
      
      return () => clearTimeout(animationTimeout);
    }
  }, [loading, trendingContent]);

  const handleThumbnailHover = (id: number) => {
    const card = document.querySelector(`.trending-card[data-id="${id}"]`);
    if (card) {
      (card as HTMLElement).style.willChange = 'transform, box-shadow';
      
      gsap.to(card, {
        scale: 1.05,
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
        duration: 0.15,
        ease: "power2.out"
      });
    }
  };

  const handleThumbnailLeave = (id: number) => {
    const card = document.querySelector(`.trending-card[data-id="${id}"]`);
    if (card) {
      gsap.to(card, {
        scale: 1,
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
        duration: 0.15,
        ease: "power2.out",
        onComplete: () => {
          (card as HTMLElement).style.willChange = 'auto';
        }
      });
    }
  };

  const handlePlayTrailer = async (item: any) => {
    try {
      setLoadingTrailer(item.id);
      
      const videos = await fetchVideos(item.id, item.media_type);
      const trailerInfo = getTrailerUrl(videos);
      
      if (trailerInfo && trailerInfo.embedUrl) {
        setSelectedTrailer(trailerInfo.embedUrl);
        console.log(`Playing trailer for ${item.title || item.name}`);
      } else {
        console.error('No trailer found for this item');
      }
    } catch (error) {
      console.error('Error fetching trailer:', error);
    } finally {
      setLoadingTrailer(null);
    }
  };

  return (
    <motion.section 
      className="trending-section"
      ref={trendingRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="trending-title">Trending Now</h2>
      
      {loading ? (
        <div className="trending-loading">
          <div className="loading-spinner"></div>
          <p>Loading trending content...</p>
        </div>
      ) : (
        <div className="trending-grid">
          {trendingContent.map((item) => (
            <div 
              key={item.id}
              className="trending-card group"
              data-id={item.id}
              onMouseEnter={() => handleThumbnailHover(item.id)}
              onMouseLeave={() => handleThumbnailLeave(item.id)}
            >
              <div className="card-image-container">
                <img 
                  src={`https://image.tmdb.org/t/p/w500${item.backdrop_path || item.poster_path}`}
                  alt={item.title || item.name}
                  className="card-image"
                  loading="lazy"
                />
                
                {/* Movie Card Actions Overlay */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <MovieCardActions
                    mediaId={item.id}
                    mediaType={item.media_type}
                    title={item.title || item.name}
                    onPlayTrailer={() => handlePlayTrailer(item)}
                    className="flex-col gap-1"
                  />
                </div>
                
                {item.hasTrailer && (
                  <div className="play-icon-container">
                    {loadingTrailer === item.id ? (
                      <div className="loading-spinner"></div>
                    ) : (
                      <button 
                        className="play-icon"
                        onClick={() => handlePlayTrailer(item)}
                        aria-label={`Play trailer for ${item.title || item.name}`}
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </button>
                    )}
                  </div>
                )}
              </div>
              
              <div className="card-content">
                <h3>{item.title || item.name}</h3>
                <div className="card-meta">
                  <span>{item.media_type === 'movie' ? 'Movie' : 'TV Show'}</span>
                  <span>{item.release_date || item.first_air_date}</span>
                </div>
                <div className="card-actions">
                  {item.hasTrailer && (
                    <button 
                      className="play-button"
                      onClick={() => handlePlayTrailer(item)}
                      disabled={loadingTrailer === item.id}
                    >
                      {loadingTrailer === item.id ? 'Loading...' : 'Play Trailer'}
                    </button>
                  )}
                  <button className="info-button">More Info</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <AnimatePresence>
        {selectedTrailer && (
          <TrailerModal 
            trailerUrl={selectedTrailer} 
            onClose={() => setSelectedTrailer(null)} 
          />
        )}
      </AnimatePresence>
    </motion.section>
  );
};

export default TrendingSection;