import { useState, useEffect } from 'react';
import './NetflixHome.css';
import Navbar from '../../components/Navbar/Navbar';
import BrowseNavbar from '../../components/Navbar/BrowseNavbar';
import { useAuth } from '../../context/AuthContext';
import Hero from '../../components/Hero/Hero';
import TrendingSection from '../../components/TrendingSection/TrendingSection';
import FeaturesSection from '../../components/FeaturesSection/FeaturesSection';
import FAQSection from '../../components/FAQSection/FAQSection';
import Footer from '../../components/Footer/Footer';
import NetflixLoader from '../../components/NetflixLoader/NetflixLoader';
import { useNavigate } from '../../hooks/useNavigate';
import TrailerModal from '../../components/TrailerModal';
import MovieTrailerBanner from '../../components/MovieTrailerBanner/MovieTrailerBanner';
import { fetchRandomTrailer } from '../../api/tmdbApi';
import { motion, AnimatePresence } from 'framer-motion';

function NetflixHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [showTrailerModal, setShowTrailerModal] = useState(false);
  const [trailerLoading, setTrailerLoading] = useState(false);
  const [trailerInfo, setTrailerInfo] = useState<any>(null);
  const [featureContent, setFeatureContent] = useState<any>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Load trailer immediately after page loads
    const loadFeatureContent = async () => {
      // Wait for the page to finish loading
      if (isLoading) return;
      
      // Start loading trailer
      setTrailerLoading(true);
      try {
        const item = await fetchRandomTrailer();
        if (item && item.trailerInfo) {
          setFeatureContent(item);
        }
      } catch (error) {
        console.error('Error loading feature content:', error);
      } finally {
        setTrailerLoading(false);
      }
    };
    
    loadFeatureContent();
  }, [isLoading]);
  
  // Handle play button click from banner
  const handlePlayTrailer = () => {
    if (featureContent?.trailerInfo?.embedUrl) {
      setTrailerInfo({
        title: featureContent.title || featureContent.name,
        media_type: featureContent.media_type,
        trailerUrl: featureContent.trailerInfo.embedUrl
      });
      setShowTrailerModal(true);
    }
  };
  
  // Handle more info button click from banner
  const handleMoreInfo = () => {
    console.log('More info about:', featureContent?.title || featureContent?.name);
    // Can implement navigation to content details page
  };


  const handleEmailChange = (newEmail: string) => {
    try {
      if (typeof newEmail !== 'string') {
        throw new Error('Expected newEmail to be a string');
      }
      setEmail(newEmail);
    } catch (error) {
      console.error('Error handling email change:', error);
    }
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Email submitted:', email);
      navigate('/netflix-show');
    } catch (error) {
      console.error('Error submitting email:', error);
    }
  };

  if (isLoading) return <NetflixLoader />;

  return (
    <div className="main dark-theme">
      <div
        className="homepage-background"
        style={{
          backgroundImage: `url(${process.env.PUBLIC_URL}/src/assets/images/background.jpg)`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center center',
          backgroundSize: 'cover',
        }}
      >
        <div className="background-overlay" />
      </div>

      {user ? (
        <BrowseNavbar />
      ) : (
        <Navbar />
      )}
      
      {/* Featured Content Banner with Trailer Video */}
      {featureContent ? (
        <MovieTrailerBanner 
          // Use a local video file instead of YouTube embed if possible
          // videoSrc={`/videos/sample-trailer.mp4`}
          // Fall back to a poster image from TMDB
          posterSrc={`https://image.tmdb.org/t/p/original${featureContent.backdrop_path || featureContent.poster_path}`}
          title={featureContent.title || featureContent.name}
          description={featureContent.overview}
          genres={featureContent.genres || []}
          onPlayClick={handlePlayTrailer}
          onMoreInfoClick={handleMoreInfo}
        />
      ) : (
        <Hero email={email} onEmailChange={handleEmailChange} onEmailSubmit={handleEmailSubmit} />
      )}
      
      {/* Trailer notification with AnimatePresence for smooth transitions */}
      <AnimatePresence>
        {trailerLoading && (
          <motion.div 
            className="trailer-loading-notification"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="loading-spinner-small"></div>
            <span>Loading featured content...</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Trailer modal with AnimatePresence for smooth transitions */}
      <AnimatePresence>
        {showTrailerModal && trailerInfo && (
          <>
            <TrailerModal 
              trailerUrl={trailerInfo.trailerUrl} 
              onClose={() => setShowTrailerModal(false)} 
            />
            <motion.div 
              className="trailer-info-overlay"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <h3>{trailerInfo.title || trailerInfo.name}</h3>
              <p>{trailerInfo.media_type === 'movie' ? 'Movie' : 'TV Show'}</p>
              <button 
                className="close-trailer-button"
                onClick={() => setShowTrailerModal(false)}
                aria-label="Close trailer"
              >
                Close
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      <div className="separation" />
      <TrendingSection />
      <div className="separation" />
      <FeaturesSection />
      <div className="separation" />
      <FAQSection email={email} onEmailChange={handleEmailChange} onEmailSubmit={handleEmailSubmit} />
      <div className="separation" />
      <Footer />
    </div>
  );
}

export default NetflixHome;