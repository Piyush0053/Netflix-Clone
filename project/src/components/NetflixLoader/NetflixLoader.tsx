import React, { useEffect, useRef } from 'react';
import './NetflixLoader.css';
import gsap from 'gsap';

const NetflixLoader: React.FC = () => {
  const loadingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Animate Netflix letters with GSAP
    gsap.fromTo(
      '.netflix-loader .letter',
      { y: -100, opacity: 0 },
      { 
        y: 0, 
        opacity: 1, 
        stagger: 0.1, 
        ease: "power3.out",
        duration: 1 
      }
    );
  }, []);

  return (
    <div className="netflix-loader" ref={loadingRef}>
      <div className="loader-content">
        {'NETFLIX'.split('').map((letter, i) => (
          <span key={i} className="letter">{letter}</span>
        ))}
      </div>
    </div>
  );
};

export default NetflixLoader;