import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Banner from '../../components/Banner/Banner';
import Row from '../../components/Row/Row';
import BrowseNavbar from '../../components/Navbar/BrowseNavbar';
import requests from '../../api/requests';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import './BrowsePage.css';

interface SignInLog {
  id: number;
  created_at: string;
  success: boolean;
  ip_address: string;
  user_agent: string;
}

const BrowsePage: React.FC = () => {
  const { user, signOut } = useAuth();
  const [signInLogs, setSignInLogs] = useState<SignInLog[]>([]);

  useEffect(() => {
    const fetchLogs = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('signin_logs')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (data && !error) {
          setSignInLogs(data);
        }
      }
    };

    fetchLogs();
  }, [user]);

  return (
    <motion.div 
      className="min-h-screen bg-netflix-black text-white overflow-x-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <BrowseNavbar />
      
      {/* Banner with featured content */}
      <Banner />
      
      {/* Rows with different categories */}
      <motion.div
        className="relative z-10 mt-[-20px] pb-12"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Row
          title="NETFLIX ORIGINALS"
          fetchURL={requests.fetchNetflixOriginals}
          isLargeRow
        />
        <Row title="Trending Now" fetchURL={requests.fetchTrending} />
        <Row title="Top Rated" fetchURL={requests.fetchTopRated} />
        <Row title="Action Movies" fetchURL={requests.fetchActionMovies} />
        <Row title="Comedy Movies" fetchURL={requests.fetchComedyMovies} />
        <Row title="Horror Movies" fetchURL={requests.fetchHorrorMovies} />
        <Row title="Romance Movies" fetchURL={requests.fetchRomanceMovies} />
        <Row title="Documentaries" fetchURL={requests.fetchDocumentaries} />
      </motion.div>
      
      {/* User account section */}
      <motion.div 
        className="mt-10 mx-4 md:mx-8 p-6 bg-[#141414] rounded-md shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Account Information</h2>
          <button
            onClick={() => signOut()}
            className="bg-netflix-red px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Sign Out
          </button>
        </div>
        
        <div className="text-netflix-light-gray">
          <p className="mb-2">Signed in as: <span className="text-white font-semibold">{user?.email}</span></p>
        </div>
        
        {/* Sign-in logs if available */}
        {signInLogs.length > 0 && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-4">Recent Sign-in Activity</h3>
            <div className="space-y-3">
              {signInLogs.slice(0, 3).map((log) => (
                <div
                  key={log.id}
                  className="p-3 bg-[#1a1a1a] rounded-md flex justify-between"
                >
                  <div>
                    <p className="text-sm text-netflix-light-gray">
                      {new Date(log.created_at).toLocaleString()}
                    </p>
                    <p className="mt-1">
                      Status:{' '}
                      <span className={log.success ? 'text-green-500' : 'text-netflix-red'}>
                        {log.success ? 'Successful' : 'Failed'}
                      </span>
                    </p>
                  </div>
                  <div className="text-right text-sm text-netflix-light-gray">
                    <p className="truncate max-w-xs" title={log.user_agent}>
                      {log.user_agent.split(' ')[0]}
                    </p>
                    <p>{log.ip_address}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default BrowsePage;