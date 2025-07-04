import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

// Define types for auth response
type AuthResponse = {
  data: {
    user: {
      id: string;
      email?: string;
    } | null;
    session: any | null;
  } | null;
  error: Error | null;
};



// Import environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client with proper typing
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Authentication functions with enhanced security
export const signUp = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw error;

    // Create security audit log entry
    if (data.user) {
      await supabase.from('security_audit_log').insert({
        user_id: data.user.id,
        action: 'SIGN_UP',
        ip_address: 'Client IP', // In production, this would be handled by server
        user_agent: navigator.userAgent
      });
    }

    return { data: data ?? null, error: null };
  } catch (error: any) {
    console.error('Error in signUp:', error.message);
    return { data: null, error };
  }
};

// Sign in a user with device limitation
export const signIn = async (email: string, password: string) => {
  try {
    // Check for too many failed attempts
    const { data: attempts } = await supabase
      .from('signin_attempts')
      .select('*')
      .eq('email', email)
      .eq('success', false)
      .gte('attempt_time', new Date(Date.now() - 15 * 60 * 1000).toISOString())
      .order('attempt_time', { ascending: false });

    if (attempts && attempts.length >= 5) {
      return {
        data: null,
        error: new Error('Too many failed attempts. Please try again later.')
      };
    }

    // First authenticate the user to get their ID
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    }) as AuthResponse;

    if (error) {
      // Log the failed sign-in attempt
      try {
        await supabase.from('signin_attempts').insert({
          email,
          ip_address: 'Client IP',
          attempt_time: new Date().toISOString(),
          success: false,
          user_agent: navigator.userAgent
        });

        // Update failed attempts count in user profile
        if (data?.user?.id) {
          const userId = data.user.id;
          await supabase
            .from('profiles')
            .update({ failed_attempts: (attempts?.length || 0) + 1 })
            .eq('id', userId);
        }
      } catch (logError) {
        console.error('Error logging failed sign-in attempt:', logError);
      }
      return { data: null, error };
    }

    if (data?.user?.id) {
      // Check if user has existing active sessions
      const { data: existingSessions, error: sessionError } = await supabase
        .from('active_sessions')
        .select('*')
        .eq('user_id', data.user.id);
        
      if (sessionError) {
        console.error('Error checking existing sessions:', sessionError);
        return { data: null, error: sessionError };
      }

      if (existingSessions && existingSessions.length > 0) {
        // User is already logged in on another device
        // Sign them out from Supabase auth to prevent access
        await supabase.auth.signOut();
        return { 
          data: null, 
          error: new Error('You are already logged in on another device. Please log out from that device first.')
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
        if (!data?.user?.id) {
          throw new Error('User ID not found in session');
        }
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

    return { data: data ?? null, error: null };
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
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) throw error;
    
    // Log password reset request in security audit log
    if (data?.user?.id) {
      const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Server';
      await supabase.from('security_audit_log').insert({
        user_id: data.user.id,
        action: 'PASSWORD_RESET_REQUESTED',
        ip_address: 'Client IP',
        user_agent: userAgent,
        created_at: new Date().toISOString()
      });
    }
    return { data: data ?? null, error: null };
  } catch (error: any) {
    console.error('Error in resetPassword:', error.message);
    return { data: null, error };
  }
};

export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Sign-in logs functions
export const getSignInLogs = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('signin_attempts')
      .select('*')
      .eq('email', userId)
      .order('attempt_time', { ascending: false });

    if (error) throw error;
    return { data: data ?? null, error: null };
  } catch (error) {
    console.error('Error getting sign-in logs:', error);
    return { data: null, error };
  }
};