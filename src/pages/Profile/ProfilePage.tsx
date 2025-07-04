import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import BrowseNavbar from '../../components/Navbar/BrowseNavbar';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-black text-white">
      <BrowseNavbar />
      
      <div className="pt-20 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-8">Profile</h1>
            
            <div className="bg-gray-900 rounded-lg p-6">
              <div className="flex items-center space-x-4 mb-6">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png"
                  alt="Profile Avatar"
                  className="w-16 h-16 rounded"
                />
                <div>
                  <h2 className="text-xl font-semibold">{user?.email}</h2>
                  <p className="text-gray-400">Netflix Member</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Account Information</h3>
                  <div className="text-gray-400">
                    <p>Email: {user?.email}</p>
                    <p>Member since: {new Date().getFullYear()}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;