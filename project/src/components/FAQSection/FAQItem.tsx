import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer, isOpen, onToggle, index }) => {
  useEffect(() => {
    // Animation is handled inside the component when it toggles
    if (isOpen || isOpen === false) {
      const answerElement = document.querySelector(`.question:nth-child(${index + 1}) .answer`);
      if (!answerElement) return;
      
      // Add will-change before animation
      (answerElement as HTMLElement).style.willChange = 'opacity, height';
      
      if (!isOpen) {
        // Closing - faster and simpler animation
        gsap.to(answerElement, {
          height: 0,
          opacity: 0,
          duration: 0.2,
          ease: "power2.in",
          onComplete: () => {
            // Clean up will-change
            (answerElement as HTMLElement).style.willChange = 'auto';
          }
        });
      } else {
        // Opening
        gsap.fromTo(answerElement,
          { height: 0, opacity: 0 },
          { 
            height: "auto", 
            opacity: 1,
            duration: 0.25,
            ease: "power2.out",
            onComplete: () => {
              // Clean up will-change
              (answerElement as HTMLElement).style.willChange = 'auto';
            }
          }
        );
      }
    }
  }, [isOpen, index]);

  return (
    <motion.div 
      className="question glass-card"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
    >
      <motion.div
        className="question-text"
        onClick={onToggle}
        whileHover={{ backgroundColor: "rgba(75, 75, 75, 0.3)" }}
      >
        {question}
        <motion.span 
          className="toggle-icon"
          animate={{ rotate: isOpen ? 45 : 0 }}
        >
          {isOpen ? '×' : '+'}
        </motion.span>
      </motion.div>
      <AnimatePresence>
        {isOpen && (
          <div className="answer">
            {answer}
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FAQItem;