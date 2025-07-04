import { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { toast } from 'react-hot-toast';

// Create context types
interface SupabaseContextType {
  supabase: typeof supabase;
  session: Session | null;
  user: User | null;
  loading: boolean;
  refreshSession: () => Promise<void>;
}

// Create the context with default values
const SupabaseContext = createContext<SupabaseContextType>({
  supabase,
  session: null,
  user: null,
  loading: true,
  refreshSession: async () => {},
});

// Create a provider component
export const SupabaseProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to refresh the session
  const refreshSession = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { session: newSession }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error refreshing session:', error);
        toast.error('Session refresh failed. Please sign in again.');
        setSession(null);
        setUser(null);
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
        setSession(null);
        setUser(null);
      }
    } catch (error) {
      console.error('Unexpected error in refreshSession:', error);
      setSession(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Get initial session and user
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting initial session:', error);
          setSession(null);
          setUser(null);
          return;
        }

        if (initialSession) {
          setSession(initialSession);
          setUser(initialSession.user);
        } else {
          setSession(null);
          setUser(null);
        }
      } catch (error) {
        console.error('Unexpected error initializing auth:', error);
        setSession(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
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
          setSession(null);
          setUser(null);
        }
        setLoading(false);
      }
    );

    // Clean up the subscription when component unmounts
    return () => {
      subscription.unsubscribe();
    };
  }, [refreshSession]);

  const value = {
    supabase,
    session,
    user,
    loading,
    refreshSession,
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
};

// Create a custom hook for using the context
export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
};
