import { createClient } from '@supabase/supabase-js';
import { type Database } from '../types/supabase';

// Import environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Authentication functions
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  return { data, error };
};

// Sign in a user with device limitation
export const signIn = async (email: string, password: string) => {
  try {
    // First authenticate the user to get their ID
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Still log the failed sign-in attempt if possible
      try {
        await supabase.from('signin_attempts').insert({
          email,
          ip_address: 'Client IP', // In a real app, you'd get this from a server
          attempt_time: new Date().toISOString(),
          success: false
        });
      } catch (logError) {
        console.error('Error logging failed sign-in attempt:', logError);
        // Don't disrupt the sign-in process if logging fails
      }
      return { data: null, error };
    }

    if (data) {
      // Check if user has existing active sessions
      const { data: existingSessions, error: sessionError } = await supabase
        .from('active_sessions')
        .select('*')
        .eq('user_id', data.user.id);

      if (sessionError) {
        console.error('Error checking existing sessions:', sessionError);
        // Continue with sign in attempt even if check fails, to avoid blocking legitimate users
      }

      if (existingSessions && existingSessions.length > 0) {
        // User is already logged in on another device
        // Sign them out from Supabase auth to prevent access
        await supabase.auth.signOut();
        return { 
          data: null, 
          error: { 
            message: 'You are already logged in on another device. Please log out from that device first.' 
          } 
        };
      }

      // Log successful sign-in attempt - non critical operation
      try {
        const { error: attemptError } = await supabase.from('signin_attempts').insert({
          email,
          ip_address: 'Client IP',
          attempt_time: new Date().toISOString(),
          success: true
        });
        if (attemptError) {
          console.error('Error logging sign-in attempt:', attemptError);
        }
      } catch (logError) {
        console.error('Exception logging sign-in attempt:', logError);
      }

      // Remove any old sessions for this user (just in case) - non critical
      try {
        const { error: deleteError } = await supabase
          .from('active_sessions')
          .delete()
          .eq('user_id', data.user.id);
        if (deleteError) {
          console.error('Error removing old sessions:', deleteError);
        }
      } catch (deleteError) {
        console.error('Exception removing old sessions:', deleteError);
      }

      // Add new active session with device info - non critical
      try {
        const { error: sessionError } = await supabase.from('active_sessions').insert({
          user_id: data.user.id,
          device_info: navigator.userAgent,
          ip_address: 'Client IP',
          last_active: new Date().toISOString()
        });
        if (sessionError) {
          console.error('Error adding new active session:', sessionError);
        }
      } catch (sessionError) {
        console.error('Exception adding new active session:', sessionError);
      }

      // Create security audit log entry - non critical
      try {
        const { error: auditError } = await supabase.from('security_audit_log').insert({
          user_id: data.user.id,
          action: 'SIGN_IN',
          ip_address: 'Client IP',
          user_agent: navigator.userAgent
        });
        if (auditError) {
          console.error('Error logging to security audit:', auditError);
        }
      } catch (auditError) {
        console.error('Exception logging to security audit:', auditError);
      }
    }

    return { data, error: null };
  } catch (error: any) {
    console.error('Error during sign in:', error);
    return { data: null, error };
  }
};

// Sign out a user and remove their active session
export const signOut = async () => {
  try {
    // Get current user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error getting user during sign out:', userError);
    } else if (userData?.user) {
      // Remove active session - non critical
      try {
        const { error: sessionError } = await supabase
          .from('active_sessions')
          .delete()
          .eq('user_id', userData.user.id);
          
        if (sessionError) {
          console.error('Error removing active session:', sessionError);
        }
      } catch (sessionError) {
        console.error('Exception removing active session:', sessionError);
      }
      
      // Log sign out in audit log - non critical
      try {
        const { error: logError } = await supabase.from('security_audit_log').insert({
          user_id: userData.user.id,
          action: 'SIGN_OUT',
          ip_address: 'Client IP',
          user_agent: navigator.userAgent
        });
        
        if (logError) {
          console.error('Error logging sign out:', logError);
        }
      } catch (logError) {
        console.error('Exception logging sign out:', logError);
      }
    }
    
    // Perform the actual sign out
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return { error };
    }
    
    return { error: null };
  } catch (error: any) {
    console.error('Error signing out:', error);
    return { error };
  }
};

export const resetPassword = async (email: string) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  
  return { data, error };
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Sign-in logs functions
export const getSignInLogs = async (userId: string) => {
  const { data, error } = await supabase
    .from('signin_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return { data, error };
}; 