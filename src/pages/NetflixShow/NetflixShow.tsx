import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const NetflixShow: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-8">Netflix Shows</h1>
          <p className="text-lg mb-8">Discover amazing Netflix original content.</p>
          
          <Link to="/browse">
            <motion.button
              className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded font-semibold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Browse All Shows
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default NetflixShow;