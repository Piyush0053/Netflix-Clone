import React, { useState } from 'react';
import ForgotPasswordForm from '../../components/auth/ForgotPasswordForm';
import Navbar from '../../components/Navbar/Navbar';
import { useNavigate } from 'react-router-dom';
import './ForgotPasswordPage.css';

const ForgotPasswordPage: React.FC = () => {
  const [darkMode, setDarkMode] = useState(true);
  const navigate = useNavigate();
  
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('light-mode');
  };

  return (
    <div className={`forgot-password-page ${darkMode ? 'dark-theme' : 'light-theme'}`}>
      <div className="auth-background">
        <div className="background-overlay">
          <img 
            src="/src/assets/images/background.jpg" 
            alt=""
            className="background-image"
          />
        </div>
      </div>
      
      <Navbar 
        darkMode={darkMode} 
        toggleDarkMode={toggleDarkMode} 
        navigate={navigate}
      />
      
      <ForgotPasswordForm />
    </div>
  );
};

export default ForgotPasswordPage; 