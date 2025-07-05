import React from 'react';
import { motion } from 'framer-motion';
import BrowseNavbar from '../../components/Navbar/BrowseNavbar';
import Row from '../../components/Row/Row';

const NewPopularPage: React.FC = () => {
  // New & Popular specific API endpoints
  const newPopularRequests = {
    fetchTrendingAll: `/trending/all/day?api_key=d5bd6f3bb580845fab6e6dee25c3f0a0&language=en-US`,
    fetchTrendingWeek: `/trending/all/week?api_key=d5bd6f3bb580845fab6e6dee25c3f0a0&language=en-US`,
    fetchUpcomingMovies: `/movie/upcoming?api_key=d5bd6f3bb580845fab6e6dee25c3f0a0&language=en-US`,
    fetchPopularMovies: `/movie/popular?api_key=d5bd6f3bb580845fab6e6dee25c3f0a0&language=en-US`,
    fetchPopularTV: `/tv/popular?api_key=d5bd6f3bb580845fab6e6dee25c3f0a0&language=en-US`,
    fetchAiringToday: `/tv/airing_today?api_key=d5bd6f3bb580845fab6e6dee25c3f0a0&language=en-US`,
    fetchOnTheAir: `/tv/on_the_air?api_key=d5bd6f3bb580845fab6e6dee25c3f0a0&language=en-US`,
    fetchNetflixOriginals: `/discover/tv?api_key=d5bd6f3bb580845fab6e6dee25c3f0a0&with_networks=213`,
    fetchNewReleases: `/discover/movie?api_key=d5bd6f3bb580845fab6e6dee25c3f0a0&sort_by=release_date.desc&primary_release_date.gte=${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}`,
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
          <h1 className="text-4xl md:text-6xl font-bold mb-4">New & Popular</h1>
          <p className="text-xl text-gray-300 max-w-2xl">
            Stay up to date with the latest releases and trending content everyone's talking about.
          </p>
        </div>
      </motion.div>

      {/* New & Popular Rows */}
      <motion.div
        className="relative z-10 pb-12"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Row title="Trending Today" fetchURL={newPopularRequests.fetchTrendingAll} isLargeRow />
        <Row title="Trending This Week" fetchURL={newPopularRequests.fetchTrendingWeek} />
        <Row title="New Releases" fetchURL={newPopularRequests.fetchNewReleases} />
        <Row title="Upcoming Movies" fetchURL={newPopularRequests.fetchUpcomingMovies} />
        <Row title="Popular Movies" fetchURL={newPopularRequests.fetchPopularMovies} />
        <Row title="Popular TV Shows" fetchURL={newPopularRequests.fetchPopularTV} />
        <Row title="Airing Today" fetchURL={newPopularRequests.fetchAiringToday} />
        <Row title="Currently On Air" fetchURL={newPopularRequests.fetchOnTheAir} />
        <Row title="Netflix Originals" fetchURL={newPopularRequests.fetchNetflixOriginals} />
      </motion.div>
    </motion.div>
  );
};

export default NewPopularPage;