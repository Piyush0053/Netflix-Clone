import { query } from './db';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';

const JWT_SECRET = import.meta.env.VITE_JWT_SECRET || 'your-secret-key';
const TOKEN_EXPIRY = '7d'; // 7 days

// Helper function to hash passwords
const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Helper function to compare passwords
const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

// Helper function to generate a JWT token
const generateToken = (userId: number): string => {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
};

// Sign up a new user
export const signUp = async (email: string, password: string) => {
  try {
    // Check if user already exists
    const userCheck = await query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (userCheck.data && userCheck.data.length > 0) {
      return { data: null, error: { message: 'User already exists' } };
    }
    
    // Hash password
    const passwordHash = await hashPassword(password);
    
    // Insert new user
    const result = await query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at',
      [email, passwordHash]
    );
    
    if (result.error) {
      throw result.error;
    }
    
    // Generate verification email (in a real app)
    // For now, we'll just return the user data
    
    return { 
      data: { 
        user: result.data ? result.data[0] : null,
        session: null 
      }, 
      error: null 
    };
  } catch (error: any) {
    console.error('Error signing up:', error);
    return { data: null, error: { message: error.message || 'Failed to sign up' } };
  }
};

// Sign in an existing user
export const signIn = async (email: string, password: string) => {
  try {
    // Find user by email
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (!result.data || result.data.length === 0) {
      return { data: null, error: { message: 'Invalid credentials' } };
    }
    
    const user = result.data[0];
    
    // Verify password
    const passwordValid = await comparePassword(password, user.password_hash);
    
    if (!passwordValid) {
      // Log failed login attempt
      await query(
        'INSERT INTO signin_logs (email, user_id, success, ip_address, user_agent) VALUES ($1, $2, $3, $4, $5)',
        [email, user.id, false, 'Client IP', navigator.userAgent]
      );
      
      return { data: null, error: { message: 'Invalid credentials' } };
    }
    
    // Update last login time
    await query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);
    
    // Generate token
    const token = generateToken(user.id);
    
    // Create session
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now
    
    await query(
      'INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, token, expiresAt]
    );
    
    // Log successful login
    await query(
      'INSERT INTO signin_logs (email, user_id, success, ip_address, user_agent) VALUES ($1, $2, $3, $4, $5)',
      [email, user.id, true, 'Client IP', navigator.userAgent]
    );
    
    // Return user and session data
    return { 
      data: { 
        user: {
          id: user.id,
          email: user.email,
          created_at: user.created_at
        },
        session: {
          token,
          expires_at: expiresAt
        }
      }, 
      error: null 
    };
  } catch (error: any) {
    console.error('Error signing in:', error);
    return { data: null, error: { message: error.message || 'Failed to sign in' } };
  }
};

// Sign out a user
export const signOut = async (token: string) => {
  try {
    // Delete session
    await query('DELETE FROM sessions WHERE token = $1', [token]);
    
    return { error: null };
  } catch (error: any) {
    console.error('Error signing out:', error);
    return { error: { message: error.message || 'Failed to sign out' } };
  }
};

// Reset password
export const resetPassword = async (email: string) => {
  try {
    // Check if user exists
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (!result.data || result.data.length === 0) {
      return { data: null, error: { message: 'User not found' } };
    }
    
    // In a real app, send a password reset email with a token
    // For now, we'll just return success
    
    return { data: { success: true }, error: null };
  } catch (error: any) {
    console.error('Error resetting password:', error);
    return { data: null, error: { message: error.message || 'Failed to reset password' } };
  }
};

// Get current user from token
export const getCurrentUser = async (token: string) => {
  try {
    // Find session
    const sessionResult = await query(
      'SELECT * FROM sessions WHERE token = $1 AND expires_at > CURRENT_TIMESTAMP',
      [token]
    );
    
    if (!sessionResult.data || sessionResult.data.length === 0) {
      return null;
    }
    
    const session = sessionResult.data[0];
    
    // Find user
    const userResult = await query('SELECT * FROM users WHERE id = $1', [session.user_id]);
    
    if (!userResult.data || userResult.data.length === 0) {
      return null;
    }
    
    const user = userResult.data[0];
    
    return {
      id: user.id,
      email: user.email,
      created_at: user.created_at
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Get sign-in logs for a user
export const getSignInLogs = async (userId: number) => {
  try {
    const result = await query(
      'SELECT * FROM signin_logs WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    
    return { data: result.data, error: null };
  } catch (error: any) {
    console.error('Error getting sign-in logs:', error);
    return { data: null, error: { message: error.message || 'Failed to get sign-in logs' } };
  }
}; 