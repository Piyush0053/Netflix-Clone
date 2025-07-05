import React, { useRef, useEffect } from 'react';
import './FeaturesSection.css';
import Feature from './Feature';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Import images
const tvImg = '/assets/images/tv.png'; 
const strangerImg = '/assets/images/stranger.jpg';
const childImg = '/assets/images/child.png';

const FeaturesSection: React.FC = () => {
  const featuresRef = useRef<Array<HTMLElement | null>>([]);
  
  useEffect(() => {
    // Feature animations with ScrollTrigger
    featuresRef.current.forEach((feature) => {
      if (feature) {
        ScrollTrigger.create({
          trigger: feature,
          start: "top 80%",
          onEnter: () => {
            gsap.fromTo(feature, 
              { opacity: 0, y: 25 },
              { 
                opacity: 1, 
                y: 0, 
                duration: 0.5,
                clearProps: "transform",
                ease: "power2.out" 
              }
            );
          },
          once: true
        });
      }
    });
  }, []);

  const features = [
    {
      title: "Enjoy on your TV",
      description: "Watch on smart TVs, PlayStation, Xbox, Chromecast, Apple TV, Blu-ray players and more.",
      image: tvImg,
      video: "/assets/videos/video1tv.m4v",
      reverse: false
    },
    {
      title: "Download your shows to watch offline",
      description: "Save your favourites easily and always have something to watch.",
      image: strangerImg,
      reverse: true
    },
    {
      title: "Watch everywhere",
      description: "Stream unlimited movies and TV shows on your phone, tablet, laptop, and TV.",
      image: tvImg,
      video: "/assets/videos/video2tv.m4v",
      reverse: false
    },
    {
      title: "Create profiles for kids",
      description: "Send kids on adventures with their favourite characters in a space made just for them — free with your membership.",
      image: childImg,
      reverse: true
    }
  ];

  return (
    <>
      {features.map((feature, index) => (
        <React.Fragment key={index}>
          {index > 0 && <div className="separation"></div>}
          <Feature
            ref={(el) => (featuresRef.current[index] = el)}
            title={feature.title}
            description={feature.description}
            image={feature.image}
            video={feature.video}
            reverse={feature.reverse}
          />
        </React.Fragment>
      ))}
    </>
  );
};

export default FeaturesSection;