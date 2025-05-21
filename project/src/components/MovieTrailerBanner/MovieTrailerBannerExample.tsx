import React, { useState } from 'react';
import MovieTrailerBanner from './MovieTrailerBanner';
import TrailerModal from '../TrailerModal';

const MovieTrailerBannerExample: React.FC = () => {
  const [showTrailer, setShowTrailer] = useState(false);
  
  // Sample movie data
  const movieData = {
    videoSrc: '/sample-trailer-background.mp4', // This should be a local video file in your public folder
    title: 'Stranger Things 4',
    description: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces, and one strange little girl. The fourth season raises the stakes with new supernatural threats and a deeper conspiracy.',
    genres: ['Sci-Fi', 'Horror', 'Drama', 'Mystery'],
  };

  const handlePlayClick = () => {
    setShowTrailer(true);
  };

  const handleMoreInfoClick = () => {
    console.log('More info clicked');
    // Navigate to details page or show more information
  };

  return (
    <div className="w-full">
      <MovieTrailerBanner
        videoSrc={movieData.videoSrc}
        title={movieData.title}
        description={movieData.description}
        genres={movieData.genres}
        onPlayClick={handlePlayClick}
        onMoreInfoClick={handleMoreInfoClick}
      />
      
      {showTrailer && (
        <TrailerModal
          trailerUrl="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1" // Replace with actual trailer URL
          onClose={() => setShowTrailer(false)}
        />
      )}
    </div>
  );
};

export default MovieTrailerBannerExample;