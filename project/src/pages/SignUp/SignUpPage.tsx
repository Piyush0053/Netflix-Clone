import React, { useState } from 'react';
import SignUpForm from '../../components/auth/SignUpForm';
import Navbar from '../../components/Navbar/Navbar';
import { useNavigate } from 'react-router-dom';
import './SignUpPage.css';

const SignUpPage: React.FC = () => {
  const [darkMode, setDarkMode] = useState(true);
  const navigate = useNavigate();
  
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('light-mode');
  };

  return (
    <div className={`signup-page ${darkMode ? 'dark-theme' : 'light-theme'}`}>
      <div className="auth-background">
        <div className="background-overlay">
          <img 
            src="./src/assets/images/signinpage.jpg" 
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
      
      <SignUpForm />
    </div>
  );
};

export default SignUpPage; 