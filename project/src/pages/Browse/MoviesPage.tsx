import React from 'react';
import { motion } from 'framer-motion';
import BrowseNavbar from '../../components/Navbar/BrowseNavbar';
import Row from '../../components/Row/Row';

const MoviesPage: React.FC = () => {
  // Movie specific API endpoints
  const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
  const BASE_URL = import.meta.env.VITE_TMDB_BASE_URL;

  const movieRequests = {
    fetchTrendingMovies: `${BASE_URL}/trending/movie/week?api_key=${API_KEY}&language=en-US`,
    fetchTopRated: `${BASE_URL}/movie/top_rated?api_key=${API_KEY}&language=en-US`,
    fetchPopularMovies: `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US`,
    fetchUpcomingMovies: `${BASE_URL}/movie/upcoming?api_key=${API_KEY}&language=en-US`,
    fetchActionMovies: `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=28`,
    fetchComedyMovies: `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=35`,
    fetchHorrorMovies: `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=27`,
    fetchRomanceMovies: `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=10749`,
    fetchSciFiMovies: `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=878`,
    fetchThrillerMovies: `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=53`,
    fetchDocumentaries: `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=99`,
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
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Movies</h1>
          <p className="text-xl text-gray-300 max-w-2xl">
            Explore thousands of movies from every genre. From blockbuster hits to indie gems.
          </p>
        </div>
      </motion.div>

      {/* Movie Rows */}
      <motion.div
        className="relative z-10 pb-12"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Row title="Trending Movies" fetchURL={movieRequests.fetchTrendingMovies} isLargeRow />
        <Row title="Top Rated Movies" fetchURL={movieRequests.fetchTopRated} />
        <Row title="Popular Movies" fetchURL={movieRequests.fetchPopularMovies} />
        <Row title="Upcoming Movies" fetchURL={movieRequests.fetchUpcomingMovies} />
        <Row title="Action Movies" fetchURL={movieRequests.fetchActionMovies} />
        <Row title="Comedy Movies" fetchURL={movieRequests.fetchComedyMovies} />
        <Row title="Horror Movies" fetchURL={movieRequests.fetchHorrorMovies} />
        <Row title="Romance Movies" fetchURL={movieRequests.fetchRomanceMovies} />
        <Row title="Sci-Fi Movies" fetchURL={movieRequests.fetchSciFiMovies} />
        <Row title="Thriller Movies" fetchURL={movieRequests.fetchThrillerMovies} />
        <Row title="Documentaries" fetchURL={movieRequests.fetchDocumentaries} />
      </motion.div>
    </motion.div>
  );
};

export default MoviesPage;