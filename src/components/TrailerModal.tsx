import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface TrailerModalProps {
  trailerUrl: string;
  onClose: () => void;
}

const TrailerModal: React.FC<TrailerModalProps> = ({ trailerUrl, onClose }) => {
  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition-all"
        >
          <X size={24} />
        </button>
        
        <iframe
          src={trailerUrl}
          title="Trailer"
          className="w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </motion.div>
    </motion.div>
  );
};

export default TrailerModal;