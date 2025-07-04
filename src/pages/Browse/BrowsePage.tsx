import React from 'react';
import { motion } from 'framer-motion';
import BrowseNavbar from '../../components/Navbar/BrowseNavbar';
import Row from '../../components/Row/Row';
import requests from '../../api/requests';

const BrowsePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <BrowseNavbar />
      
      <div className="pt-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Row title="Netflix Originals" fetchURL={requests.fetchNetflixOriginals} isLargeRow />
          <Row title="Trending Now" fetchURL={requests.fetchTrending} />
          <Row title="Top Rated" fetchURL={requests.fetchTopRated} />
          <Row title="Action Movies" fetchURL={requests.fetchActionMovies} />
          <Row title="Comedy Movies" fetchURL={requests.fetchComedyMovies} />
          <Row title="Horror Movies" fetchURL={requests.fetchHorrorMovies} />
          <Row title="Romance Movies" fetchURL={requests.fetchRomanceMovies} />
          <Row title="Documentaries" fetchURL={requests.fetchDocumentaries} />
        </motion.div>
      </div>
    </div>
  );
};

export default BrowsePage;