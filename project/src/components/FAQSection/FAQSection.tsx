import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './FAQSection.css';
import FAQItem from './FAQItem';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

interface FAQSectionProps {
  email: string;
  onEmailChange: (email: string) => void;
  onEmailSubmit: (e: React.FormEvent) => void;
}

// FAQ Content from Netflix with expanded items
const faqData = [
  {
    question: "What is Netflix?",
    answer: "Netflix is a streaming service that offers a wide variety of award-winning TV shows, movies, anime, documentaries, and more on thousands of internet-connected devices. You can watch as much as you want, whenever you want – all for one low monthly price. There's always something new to discover, and new TV shows and movies are added every week!"
  },
  {
    question: "How much does Netflix cost?",
    answer: "Watch Netflix on your smartphone, tablet, Smart TV, laptop, or streaming device, all for one fixed monthly fee. Plans range from $7.99 to $24.99 a month. No extra costs, no contracts."
  },
  {
    question: "Where can I watch?",
    answer: "Watch anywhere, anytime. Sign in with your Netflix account to watch instantly on the web at netflix.com from your personal computer or on any internet-connected device that offers the Netflix app, including smart TVs, smartphones, tablets, streaming media players and game consoles. You can also download your favourite shows with the iOS or Android app. Use downloads to watch while you're on the go and without an internet connection. Take Netflix with you anywhere."
  },
  {
    question: "How do I cancel?",
    answer: "Netflix is flexible. There are no annoying contracts and no commitments. You can easily cancel your account online in two clicks. There are no cancellation fees – start or stop your account anytime."
  },
  {
    question: "What can I watch on Netflix?",
    answer: "Netflix has an extensive library of feature films, documentaries, TV shows, anime, award-winning Netflix originals, and more. Watch as much as you want, anytime you want."
  },
  {
    question: "Is Netflix good for kids?",
    answer: "The Netflix Kids experience is included in your membership to give parents control while kids enjoy family-friendly TV shows and films in their own space. Kids profiles come with PIN-protected parental controls that let you restrict the maturity rating of content kids can watch and block specific titles you don't want kids to see."
  }
];

const FAQSection: React.FC<FAQSectionProps> = ({ email, onEmailChange, onEmailSubmit }) => {
  const [faqOpen, setFaqOpen] = useState<Record<number, boolean>>({});
  const faqRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (faqRef.current) {
      ScrollTrigger.create({
        trigger: faqRef.current,
        start: "top 80%",
        onEnter: () => {
          gsap.fromTo('.faq h2', 
            { opacity: 0, y: 15 },
            { 
              opacity: 1, 
              y: 0, 
              duration: 0.5,
              clearProps: "transform"
            }
          );
        },
        once: true
      });
    }
  }, []);

  const toggleFaq = (index: number) => {
    setFaqOpen(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <motion.section 
      className="faq"
      ref={faqRef}
    >
      <h2>Frequently Asked Questions</h2>
      <div className="questions">
        {faqData.map((item, index) => (
          <FAQItem
            key={index}
            question={item.question}
            answer={item.answer}
            isOpen={!!faqOpen[index]}
            onToggle={() => toggleFaq(index)}
            index={index}
          />
        ))}
      </div>
      <motion.span 
        className="hero-sub"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        Ready to watch? Enter your email to create or restart your membership.
      </motion.span>
      <motion.form 
        onSubmit={onEmailSubmit} 
        className="hero-form faq-form glass-effect"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
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
    </motion.section>
  );
};

export default FAQSection;