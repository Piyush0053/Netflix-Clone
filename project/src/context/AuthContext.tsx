import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useSupabase } from './SupabaseProvider';
import { toast } from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<{ error: any }>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => ({ error: null }),
  refreshSession: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { supabase } = useSupabase();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to refresh the session
  const refreshSession = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { session: newSession }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error refreshing session:', error);
        toast.error('Session refresh failed. Please sign in again.');
        setUser(null);
        setSession(null);
        return;
      }

      if (newSession) {
        setSession(newSession);
        setUser(newSession.user);
        
        // Update last active timestamp in active_sessions
        if (newSession.user) {
          try {
            await supabase
              .from('active_sessions')
              .update({ last_active: new Date().toISOString() })
              .eq('user_id', newSession.user.id);
          } catch (updateError) {
            console.error('Error updating last active:', updateError);
          }
        }
      } else {
        setUser(null);
        setSession(null);
      }
    } catch (error) {
      console.error('Unexpected error in refreshSession:', error);
      setUser(null);
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    // Get initial session and user
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting initial session:', error);
          setUser(null);
          setSession(null);
          return;
        }

        if (initialSession) {
          setSession(initialSession);
          setUser(initialSession.user);
        } else {
          setUser(null);
          setSession(null);
        }
      } catch (error) {
        console.error('Unexpected error initializing auth:', error);
        setUser(null);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (newSession) {
        // If we have a new session, update the state
        setSession(newSession);
        setUser(newSession.user);
        
        // Update last active timestamp in active_sessions
        try {
          await supabase
            .from('active_sessions')
            .update({ last_active: new Date().toISOString() })
            .eq('user_id', newSession.user.id);
        } catch (updateError) {
          console.error('Error updating last active on auth change:', updateError);
        }
      } else {
        // If no session, clear the state
        setUser(null);
        setSession(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signOut = async () => {
    if (!user) {
      toast.error("No user session found to sign out.");
      return { error: 'No user session' };
    }

    try {
      // Remove the active session from the database
      const { error: deleteError } = await supabase
        .from('active_sessions')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) {
        console.error('Error removing active session:', deleteError);
        toast.error('Could not clear session from server.');
      }

      // Sign out from Supabase auth
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        console.error('Error signing out:', signOutError);
        toast.error('Failed to sign out. Please try again.');
        return { error: signOutError };
      }

      // Clear local state
      setUser(null);
      setSession(null);
      toast.success('Successfully signed out');
      return { error: null };
    } catch (error) {
      console.error('Unexpected error during sign out:', error);
      toast.error('An unexpected error occurred during sign out');
      return { error };
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signOut,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};