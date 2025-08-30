import { MMKV } from 'react-native-mmkv';
import bcrypt from 'bcryptjs';

// Initialize MMKV storage for secure local storage
const storage = new MMKV({
  id: 'user-storage',
  encryptionKey: 'health-ai-secure-key-2024',
});

// Session storage key
const SESSION_KEY = 'user_session';

// User credentials storage prefix
const USER_PREFIX = 'user_';

export interface User {
  email: string;
  createdAt: string;
}

export interface AuthResult {
  success: boolean;
  message: string;
  user?: User;
}

/**
 * Sign up a new user with email and password
 * Securely hashes the password and stores credentials locally
 */
export const signUp = async (email: string, password: string): Promise<AuthResult> => {
  try {
    // Validate input
    if (!email || !password) {
      return { success: false, message: 'Email and password are required' };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return { success: false, message: 'Please enter a valid email address' };
    }

    // Validate password strength
    if (password.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters long' };
    }

    const userKey = USER_PREFIX + email.trim().toLowerCase();
    
    // Check if user already exists
    const existingUser = storage.getString(userKey);
    if (existingUser) {
      return { success: false, message: 'An account with this email already exists' };
    }

    // Hash the password with salt rounds of 12 for security
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create user object
    const user: User = {
      email: email.trim().toLowerCase(),
      createdAt: new Date().toISOString(),
    };

    // Store user credentials securely
    const userCredentials = {
      user,
      hashedPassword,
    };

    storage.set(userKey, JSON.stringify(userCredentials));

    return { 
      success: true, 
      message: 'Account created successfully',
      user 
    };
  } catch (error) {
    console.error('Sign up error:', error);
    return { 
      success: false, 
      message: 'An error occurred while creating your account' 
    };
  }
};

/**
 * Sign in a user with email and password
 * Retrieves stored credentials and compares hashed passwords
 */
export const signIn = async (email: string, password: string): Promise<AuthResult> => {
  try {
    // Validate input
    if (!email || !password) {
      return { success: false, message: 'Email and password are required' };
    }

    const userKey = USER_PREFIX + email.trim().toLowerCase();
    
    // Retrieve user credentials
    const storedData = storage.getString(userKey);
    if (!storedData) {
      return { success: false, message: 'Invalid email or password' };
    }

    const { user, hashedPassword } = JSON.parse(storedData);
    
    // Compare passwords using bcrypt
    const isPasswordValid = await bcrypt.compare(password, hashedPassword);
    if (!isPasswordValid) {
      return { success: false, message: 'Invalid email or password' };
    }

    // Create session
    const sessionData = {
      user,
      signedInAt: new Date().toISOString(),
    };
    storage.set(SESSION_KEY, JSON.stringify(sessionData));

    return { 
      success: true, 
      message: 'Signed in successfully',
      user 
    };
  } catch (error) {
    console.error('Sign in error:', error);
    return { 
      success: false, 
      message: 'An error occurred while signing in' 
    };
  }
};

/**
 * Sign out the current user
 * Clears the user's session data
 */
export const signOut = async (): Promise<AuthResult> => {
  try {
    storage.delete(SESSION_KEY);
    return { 
      success: true, 
      message: 'Signed out successfully' 
    };
  } catch (error) {
    console.error('Sign out error:', error);
    return { 
      success: false, 
      message: 'An error occurred while signing out' 
    };
  }
};

/**
 * Get the current user session if it exists
 */
export const getCurrentUser = (): User | null => {
  try {
    const sessionData = storage.getString(SESSION_KEY);
    if (!sessionData) {
      return null;
    }

    const { user } = JSON.parse(sessionData);
    return user;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};

/**
 * Check if a user is currently signed in
 */
export const isSignedIn = (): boolean => {
  return getCurrentUser() !== null;
};

/**
 * Clear all user data (for testing or reset purposes)
 * WARNING: This will delete all stored user accounts and sessions
 */
export const clearAllUserData = (): void => {
  try {
    // Get all keys and delete user-related data
    const allKeys = storage.getAllKeys();
    allKeys.forEach(key => {
      if (key.startsWith(USER_PREFIX) || key === SESSION_KEY) {
        storage.delete(key);
      }
    });
    console.log('All user data cleared successfully');
  } catch (error) {
    console.error('Error clearing user data:', error);
  }
};