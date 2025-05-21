// Determine which implementation to use based on the environment
// For the browser demo, we'll use the browser-compatible versions

import * as authBrowser from './auth-browser';

// Re-export the browser-compatible versions
export const signUp = authBrowser.signUp;
export const signIn = authBrowser.signIn;
export const signOut = authBrowser.signOut;
export const resetPassword = authBrowser.resetPassword;
export const getCurrentUser = authBrowser.getCurrentUser;
export const getSignInLogs = authBrowser.getSignInLogs; 