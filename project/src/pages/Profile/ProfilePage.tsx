import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const ProfilePage: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-black">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto py-10 px-4">
        <div className="max-w-2xl mx-auto bg-zinc-900 rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6 text-red-600">My Profile</h1>
          
          {profile ? (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="w-24 h-24 rounded-full bg-red-600 flex items-center justify-center text-3xl font-bold">
                  {user?.email?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-semibold">{profile.full_name || 'Netflix User'}</h2>
                  <p className="text-zinc-400">{user?.email}</p>
                </div>
              </div>
              
              <div className="border-t border-zinc-700 pt-6">
                <h3 className="text-xl font-semibold mb-4">Account Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-zinc-400">Member since</p>
                    <p>{new Date(user?.created_at || '').toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-zinc-400">Subscription</p>
                    <p className="text-green-500">Active</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-zinc-700">
                <button
                  onClick={handleSignOut}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded transition duration-200"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <p>No profile data available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
