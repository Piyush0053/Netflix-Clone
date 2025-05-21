import { supabase } from './supabase';
import type { Database } from '../types/supabase';

/**
 * Database utility functions for the Netflix clone application
 * These functions provide a clean interface for interacting with the Supabase database
 */

// User profile functions
export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return { data: null, error };
  }
}

export async function updateUserProfile(userId: string, updates: Partial<Database['public']['Tables']['profiles']['Update']>) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { data: null, error };
  }
}

// Security audit log functions
export async function addSecurityLog(
  userId: string | null, 
  action: string, 
  ipAddress: string | null = null,
  userAgent: string | null = null
) {
  try {
    const { error } = await supabase
      .from('security_audit_log')
      .insert({
        user_id: userId,
        action,
        ip_address: ipAddress,
        user_agent: userAgent || navigator.userAgent
      });
    
    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error('Error adding security log:', error);
    return { success: false, error };
  }
}

export async function getSecurityLogs(userId: string, limit: number = 20) {
  try {
    const { data, error } = await supabase
      .from('security_audit_log')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching security logs:', error);
    return { data: null, error };
  }
}

// Sign-in attempts tracking
export async function getSignInAttempts(email: string, limit: number = 5) {
  try {
    const { data, error } = await supabase
      .from('signin_attempts')
      .select('*')
      .eq('email', email)
      .order('attempt_time', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching sign-in attempts:', error);
    return { data: null, error };
  }
}

export async function checkForTooManyFailedAttempts(email: string, minutesWindow: number = 15) {
  try {
    // Get failed attempts in the last X minutes
    const windowStart = new Date(Date.now() - minutesWindow * 60 * 1000).toISOString();
    
    const { data, error } = await supabase
      .from('signin_attempts')
      .select('*')
      .eq('email', email)
      .eq('success', false)
      .gte('attempt_time', windowStart);
    
    if (error) throw error;
    
    // Return count of failed attempts
    return { 
      tooManyAttempts: (data?.length || 0) >= 5,
      attemptCount: data?.length || 0,
      error: null 
    };
  } catch (error) {
    console.error('Error checking failed attempts:', error);
    return { tooManyAttempts: false, attemptCount: 0, error };
  }
}
