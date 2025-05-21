import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './Footer.css';

const Footer: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLanguage(e.target.value);
  };

  const footerLinks = [
    "FAQ", "Help Centre", "Account", "Media Centre", 
    "Investor Relations", "Jobs", "Ways to Watch", 
    "Terms of Use", "Privacy", "Cookie Preferences", 
    "Corporate Information", "Contact Us", 
    "Speed Test", "Legal Notices", "Only on Netflix"
  ];

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      <div className="footer-content">
        <p>Questions? Call 1-844-505-2993</p>
        <div className="links">
          {footerLinks.map((link, index) => (
            <motion.button 
              key={index}
              className="link-button"
              whileHover={{ color: "#e50914", x: 2 }}
            >
              {link}
            </motion.button>
          ))}
        </div>
        <div className="language-picker-footer glass-effect">
          <select
            className="language-select"
            value={selectedLanguage}
            onChange={handleLanguageChange}
          >
            <option value="en">English</option>
            <option value="hi">हिंदी</option>
          </select>
        </div>
        <p className="copyright">© {new Date().getFullYear()} Netflix Clone - Built for Educational Purposes</p>
      </div>
    </motion.footer>
  );
};

export default Footer;