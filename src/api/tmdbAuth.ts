import axios from './axios';

interface SessionData {
  sessionId: string;
  accountId: string;
  username: string;
}

interface AccountDetails {
  id: number;
  username: string;
  name: string;
}

interface AuthResult {
  sessionId: string;
  accountDetails: AccountDetails;
}

const STORAGE_KEY = 'tmdb_session';

// Store session data in localStorage
export const storeSessionData = (data: SessionData): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

// Get stored session data
export const getStoredSessionData = (): SessionData => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return { sessionId: '', accountId: '', username: '' };
};

// Check if user is authenticated with TMDb
export const isAuthenticated = (): boolean => {
  const data = getStoredSessionData();
  return !!(data.sessionId && data.accountId);
};

// Sign out from TMDb
export const signOutTMDb = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

// Authenticate with TMDb
export const authenticateWithTMDb = async (username: string, password: string): Promise<AuthResult> => {
  try {
    // Step 1: Create request token
    const tokenResponse = await axios.get('/authentication/token/new');
    const requestToken = tokenResponse.data.request_token;

    // Step 2: Validate request token with login
    await axios.post('/authentication/token/validate_with_login', {
      username,
      password,
      request_token: requestToken
    });

    // Step 3: Create session
    const sessionResponse = await axios.post('/authentication/session/new', {
      request_token: requestToken
    });
    const sessionId = sessionResponse.data.session_id;

    // Step 4: Get account details
    const accountResponse = await axios.get(`/account?session_id=${sessionId}`);
    const accountDetails = accountResponse.data;

    // Store session data
    storeSessionData({
      sessionId,
      accountId: accountDetails.id.toString(),
      username: accountDetails.username
    });

    return {
      sessionId,
      accountDetails
    };
  } catch (error) {
    console.error('TMDb authentication failed:', error);
    throw error;
  }
};