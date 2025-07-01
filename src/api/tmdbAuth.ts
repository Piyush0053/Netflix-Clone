import axios from 'axios';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

export interface TMDbAuthResponse {
  success: boolean;
  expires_at: string;
  request_token: string;
}

export interface TMDbSessionResponse {
  success: boolean;
  session_id: string;
}

export interface TMDbAccountDetails {
  avatar: {
    gravatar: {
      hash: string;
    };
    tmdb: {
      avatar_path: string | null;
    };
  };
  id: number;
  iso_639_1: string;
  iso_3166_1: string;
  name: string;
  include_adult: boolean;
  username: string;
}

// Get a new request token
export const getRequestToken = async (): Promise<TMDbAuthResponse> => {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/authentication/token/new`, {
      params: {
        api_key: API_KEY
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error getting request token:', error);
    throw error;
  }
};

// Validate token with login credentials
export const validateTokenWithLogin = async (
  username: string,
  password: string,
  requestToken: string
): Promise<TMDbAuthResponse> => {
  try {
    const response = await axios.post(`${TMDB_BASE_URL}/authentication/token/validate_with_login`, {
      username,
      password,
      request_token: requestToken
    }, {
      params: {
        api_key: API_KEY
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error validating token with login:', error);
    throw error;
  }
};

// Create a session ID
export const createSession = async (requestToken: string): Promise<TMDbSessionResponse> => {
  try {
    const response = await axios.post(`${TMDB_BASE_URL}/authentication/session/new`, {
      request_token: requestToken
    }, {
      params: {
        api_key: API_KEY
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
};

// Get account details
export const getAccountDetails = async (sessionId: string): Promise<TMDbAccountDetails> => {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/account`, {
      params: {
        api_key: API_KEY,
        session_id: sessionId
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error getting account details:', error);
    throw error;
  }
};

// Complete authentication flow
export const authenticateWithTMDb = async (username: string, password: string) => {
  try {
    // Step 1: Get request token
    const tokenResponse = await getRequestToken();
    
    // Step 2: Validate token with login
    const validatedToken = await validateTokenWithLogin(username, password, tokenResponse.request_token);
    
    // Step 3: Create session
    const sessionResponse = await createSession(validatedToken.request_token);
    
    // Step 4: Get account details
    const accountDetails = await getAccountDetails(sessionResponse.session_id);
    
    // Store session data
    localStorage.setItem('tmdb_session_id', sessionResponse.session_id);
    localStorage.setItem('tmdb_account_id', accountDetails.id.toString());
    localStorage.setItem('tmdb_username', accountDetails.username);
    
    return {
      sessionId: sessionResponse.session_id,
      accountId: accountDetails.id,
      accountDetails
    };
  } catch (error) {
    console.error('TMDb authentication failed:', error);
    throw error;
  }
};

// Check if user is authenticated with TMDb
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('tmdb_session_id');
};

// Get stored session data
export const getStoredSessionData = () => {
  return {
    sessionId: localStorage.getItem('tmdb_session_id'),
    accountId: localStorage.getItem('tmdb_account_id'),
    username: localStorage.getItem('tmdb_username')
  };
};

// Sign out from TMDb
export const signOutTMDb = () => {
  localStorage.removeItem('tmdb_session_id');
  localStorage.removeItem('tmdb_account_id');
  localStorage.removeItem('tmdb_username');
};