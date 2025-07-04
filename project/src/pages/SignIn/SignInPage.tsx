import React, { useState } from 'react';
import SignInForm from '../../components/auth/SignInForm';
import Navbar from '../../components/Navbar/Navbar';
import { useNavigate } from 'react-router-dom';
import './SignInPage.css';

const SignInPage: React.FC = () => {
  const [darkMode, setDarkMode] = useState(true);
  const navigate = useNavigate();
  
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('light-mode');
  };

  return (
    <div className={`signin-page ${darkMode ? 'dark-theme' : 'light-theme'}`}>
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
      
      <SignInForm />
    </div>
  );
};

export default SignInPage; 