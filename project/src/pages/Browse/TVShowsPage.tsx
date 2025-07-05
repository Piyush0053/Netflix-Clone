import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import BrowseNavbar from '../../components/Navbar/BrowseNavbar';
import Row from '../../components/Row/Row';
import { searchTVShows, getTrending } from '../../api/tmdbSearch';
import type { SearchResult } from '../../api/tmdbSearch';

const TVShowsPage: React.FC = () => {
  const [trendingShows, setTrendingShows] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTVShows = async () => {
      try {
        setLoading(true);
        const trending = await getTrending('tv', 'week');
        setTrendingShows(trending.results);
      } catch (error) {
        console.error('Error fetching TV shows:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTVShows();
  }, []);

  // TV Show specific API endpoints
  const tvRequests = {
    fetchTrendingTV: `/trending/tv/week?api_key=d5bd6f3bb580845fab6e6dee25c3f0a0&language=en-US`,
    fetchTopRatedTV: `/tv/top_rated?api_key=d5bd6f3bb580845fab6e6dee25c3f0a0&language=en-US`,
    fetchPopularTV: `/tv/popular?api_key=d5bd6f3bb580845fab6e6dee25c3f0a0&language=en-US`,
    fetchNetflixOriginals: `/discover/tv?api_key=d5bd6f3bb580845fab6e6dee25c3f0a0&with_networks=213`,
    fetchActionTV: `/discover/tv?api_key=d5bd6f3bb580845fab6e6dee25c3f0a0&with_genres=10759`,
    fetchComedyTV: `/discover/tv?api_key=d5bd6f3bb580845fab6e6dee25c3f0a0&with_genres=35`,
    fetchCrimeTV: `/discover/tv?api_key=d5bd6f3bb580845fab6e6dee25c3f0a0&with_genres=80`,
    fetchDocumentaryTV: `/discover/tv?api_key=d5bd6f3bb580845fab6e6dee25c3f0a0&with_genres=99`,
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
          <h1 className="text-4xl md:text-6xl font-bold mb-4">TV Shows</h1>
          <p className="text-xl text-gray-300 max-w-2xl">
            Discover the best TV shows from around the world. From gripping dramas to hilarious comedies.
          </p>
        </div>
      </motion.div>

      {/* TV Show Rows */}
      <motion.div
        className="relative z-10 pb-12"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Row
          title="Netflix Originals"
          fetchURL={tvRequests.fetchNetflixOriginals}
          isLargeRow
        />
        <Row title="Trending TV Shows" fetchURL={tvRequests.fetchTrendingTV} />
        <Row title="Top Rated TV Shows" fetchURL={tvRequests.fetchTopRatedTV} />
        <Row title="Popular TV Shows" fetchURL={tvRequests.fetchPopularTV} />
        <Row title="Action & Adventure" fetchURL={tvRequests.fetchActionTV} />
        <Row title="Comedy TV Shows" fetchURL={tvRequests.fetchComedyTV} />
        <Row title="Crime TV Shows" fetchURL={tvRequests.fetchCrimeTV} />
        <Row title="Documentaries" fetchURL={tvRequests.fetchDocumentaryTV} />
      </motion.div>
    </motion.div>
  );
};

export default TVShowsPage;