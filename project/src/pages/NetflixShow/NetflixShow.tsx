import React from 'react';
import Row from '../../components/Row/Row';
import requests from '../../api/requests';
import Banner from "../../components/Banner/Banner";
import Navbar from '../../components/Navbar/Navbar';
import { motion } from 'framer-motion';

function NetflixShow() {
  return (
    <motion.div
      className="bg-black min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Navbar darkMode={true} toggleDarkMode={() => {}} navigate={() => {}} />
      <Banner />
      <div className="mt-[-64px] relative z-10">
        <Row title="NETFLIX ORIGINALS" fetchURL={requests.fetchNetflixOriginals} isLargeRow />
        <Row title="Trending Now" fetchURL={requests.fetchTrending} />
        <Row title="Top Rated" fetchURL={requests.fetchTopRated} />
        <Row title="Action Movies" fetchURL={requests.fetchActionMovies} />
        <Row title="Comedy" fetchURL={requests.fetchComedyMovies} />
        <Row title="Documentaries" fetchURL={requests.fetchDocumentaries} />
        <Row title="Horror" fetchURL={requests.fetchHorrorMovies} />
        <Row title="Romance" fetchURL={requests.fetchRomanceMovies} />
      </div>
    </motion.div>
  );
}

export default NetflixShow;