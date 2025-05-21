import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './Hero.css';
import gsap from 'gsap';

interface HeroProps {
  email: string;
  onEmailChange: (email: string) => void;
  onEmailSubmit: (e: React.FormEvent) => void;
}

const Hero: React.FC<HeroProps> = ({ email, onEmailChange, onEmailSubmit }) => {
  const heroRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (heroRef.current) {
      const tl = gsap.timeline({
        defaults: { 
          ease: "power3.out",
          duration: 0.4
        }
      });

      tl.from('.hero-main-title', {
        opacity: 0,
        y: 20,
        clearProps: "transform"
      })
      .from('.hero-sub', {
        opacity: 0,
        y: 15,
        stagger: 0.1,
        clearProps: "transform"
      }, "-=0.2")
      .from('.hero-form', {
        opacity: 0,
        y: 10,
        clearProps: "transform"
      }, "-=0.1");
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    gsap.to('.hero-form', {
      scale: 0.98,
      duration: 0.1,
      onComplete: () => {
        gsap.to('.hero-form', {
          scale: 1,
          duration: 0.1,
          onComplete: () => {
            navigate('/netflix-show');
          }
        });
      }
    });
  };

  return (
    <motion.section 
      className="hero"
      ref={heroRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <h1 className="hero-main-title">Unlimited movies, TV shows and more</h1>
      <h2 className="hero-sub">Starts at $7.99. Cancel at any time.</h2>
      <h3 className="hero-sub">Ready to watch? Enter your email to create or restart your membership.</h3>
      
      <motion.form 
        onSubmit={handleSubmit} 
        className="hero-form glass-effect"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <motion.input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          required
          whileFocus={{ boxShadow: "0 0 0 2px #e50914" }}
        />
        <motion.button 
          type="submit" 
          className="btn btn-red btn-xl submit-btn"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Get Started &gt;
        </motion.button>
      </motion.form>
      
      <motion.div 
        className="ad-plan-note"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <p>
          The Netflix you love for just $7.99.
          <motion.button 
            className="ad-plan-link"
            onClick={() => window.open('https://netflix.com/plans', '_blank')}
            whileHover={{ scale: 1.05 }}
          >
            Learn More
          </motion.button>
        </p>
      </motion.div>
    </motion.section>
  );
};

export default Hero;