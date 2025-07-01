import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Banner from '../../components/Banner/Banner';
import Row from '../../components/Row/Row';
import BrowseNavbar from '../../components/Navbar/BrowseNavbar';
import requests from '../../api/requests';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { isAuthenticated, getStoredSessionData } from '../../api/tmdbAuth';
import { getFavoriteMovies, getFavoriteTv, getWatchlistMovies, getWatchlistTv } from '../../api/tmdbApi';
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
  const [userLists, setUserLists] = useState({
    favoriteMovies: [],
    favoriteTv: [],
    watchlistMovies: [],
    watchlistTv: []
  });
  const [showUserLists, setShowUserLists] = useState(false);
  const [isTMDbAuthenticated, setIsTMDbAuthenticated] = useState(false);

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

  useEffect(() => {
    // Check TMDb authentication and load user lists
    const checkTMDbAndLoadLists = async () => {
      const authenticated = isAuthenticated();
      setIsTMDbAuthenticated(authenticated);
      
      if (authenticated) {
        const sessionData = getStoredSessionData();
        if (sessionData.sessionId && sessionData.accountId) {
          try {
            const [favMovies, favTv, watchMovies, watchTv] = await Promise.all([
              getFavoriteMovies(sessionData.accountId, sessionData.sessionId),
              getFavoriteTv(sessionData.accountId, sessionData.sessionId),
              getWatchlistMovies(sessionData.accountId, sessionData.sessionId),
              getWatchlistTv(sessionData.accountId, sessionData.sessionId)
            ]);

            setUserLists({
              favoriteMovies: favMovies.slice(0, 10), // Limit to 10 items for preview
              favoriteTv: favTv.slice(0, 10),
              watchlistMovies: watchMovies.slice(0, 10),
              watchlistTv: watchTv.slice(0, 10)
            });
          } catch (error) {
            console.error('Error loading user lists:', error);
          }
        }
      }
    };

    checkTMDbAndLoadLists();
  }, []);

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
        {/* User's Personal Lists (if TMDb authenticated) */}
        {isTMDbAuthenticated && (userLists.favoriteMovies.length > 0 || userLists.favoriteTv.length > 0 || userLists.watchlistMovies.length > 0 || userLists.watchlistTv.length > 0) && (
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center justify-between px-4 mb-4">
              <h2 className="text-2xl font-bold text-white">My Lists</h2>
              <button
                onClick={() => setShowUserLists(!showUserLists)}
                className="text-red-600 hover:text-red-400 transition-colors text-sm"
              >
                {showUserLists ? 'Hide' : 'Show All'}
              </button>
            </div>
            
            <AnimatePresence>
              {showUserLists && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {userLists.favoriteMovies.length > 0 && (
                    <div className="px-4">
                      <h3 className="text-lg font-semibold text-red-400 mb-3">❤️ Favorite Movies</h3>
                      <div className="flex overflow-x-scroll space-x-4 pb-4">
                        {userLists.favoriteMovies.map((movie: any) => (
                          <div key={movie.id} className="flex-shrink-0">
                            <img
                              src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                              alt={movie.title}
                              className="w-32 h-48 object-cover rounded-md hover:scale-105 transition-transform cursor-pointer"
                              loading="lazy"
                            />
                            <p className="text-xs mt-2 text-center max-w-32 truncate">{movie.title}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {userLists.favoriteTv.length > 0 && (
                    <div className="px-4">
                      <h3 className="text-lg font-semibold text-red-400 mb-3">❤️ Favorite TV Shows</h3>
                      <div className="flex overflow-x-scroll space-x-4 pb-4">
                        {userLists.favoriteTv.map((show: any) => (
                          <div key={show.id} className="flex-shrink-0">
                            <img
                              src={`https://image.tmdb.org/t/p/w300${show.poster_path}`}
                              alt={show.name}
                              className="w-32 h-48 object-cover rounded-md hover:scale-105 transition-transform cursor-pointer"
                              loading="lazy"
                            />
                            <p className="text-xs mt-2 text-center max-w-32 truncate">{show.name}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {userLists.watchlistMovies.length > 0 && (
                    <div className="px-4">
                      <h3 className="text-lg font-semibold text-blue-400 mb-3">🔖 Watchlist Movies</h3>
                      <div className="flex overflow-x-scroll space-x-4 pb-4">
                        {userLists.watchlistMovies.map((movie: any) => (
                          <div key={movie.id} className="flex-shrink-0">
                            <img
                              src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                              alt={movie.title}
                              className="w-32 h-48 object-cover rounded-md hover:scale-105 transition-transform cursor-pointer"
                              loading="lazy"
                            />
                            <p className="text-xs mt-2 text-center max-w-32 truncate">{movie.title}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {userLists.watchlistTv.length > 0 && (
                    <div className="px-4">
                      <h3 className="text-lg font-semibold text-blue-400 mb-3">🔖 Watchlist TV Shows</h3>
                      <div className="flex overflow-x-scroll space-x-4 pb-4">
                        {userLists.watchlistTv.map((show: any) => (
                          <div key={show.id} className="flex-shrink-0">
                            <img
                              src={`https://image.tmdb.org/t/p/w300${show.poster_path}`}
                              alt={show.name}
                              className="w-32 h-48 object-cover rounded-md hover:scale-105 transition-transform cursor-pointer"
                              loading="lazy"
                            />
                            <p className="text-xs mt-2 text-center max-w-32 truncate">{show.name}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Standard Netflix Rows */}
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
          {isTMDbAuthenticated && (
            <p className="mb-2">TMDb Status: <span className="text-green-500 font-semibold">Connected</span></p>
          )}
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