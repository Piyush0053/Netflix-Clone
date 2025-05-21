import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import './FeaturesSection.css';

interface FeatureProps {
  title: string;
  description: string;
  image: string;
  video?: string;
  reverse?: boolean;
}

const Feature = forwardRef<HTMLElement, FeatureProps>(({ 
  title, 
  description, 
  image, 
  video, 
  reverse = false 
}, ref) => {
  return (
    <motion.section
      ref={ref}
      className={`feature-row glass-card ${reverse ? 'reverse' : ''}`}
    >
      <div className="feature-text">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <motion.div 
        className="feature-image"
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        <img src={image} alt={title} />
        {video && (
          <video autoPlay loop muted className="feature-video">
            <source src={video} type="video/mp4" />
          </video>
        )}
      </motion.div>
    </motion.section>
  );
});

export default Feature;