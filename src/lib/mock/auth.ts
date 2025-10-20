/**
 * Mock authentication provider for local development
 * Bypasses Supabase Auth and uses mock user data
 */

import { mockData } from './data';

// Simulate authentication state
let currentUser = mockData.user;
let isAuthenticated = true;

export const mockAuth = {
  // Get current authenticated user
  getCurrentUser: async () => {
    return isAuthenticated ? currentUser : null;
  },

  // Get current session
  getSession: async () => {
    if (!isAuthenticated) return null;
    
    return {
      user: currentUser,
      access_token: 'mock_access_token',
      refresh_token: 'mock_refresh_token',
      expires_at: Date.now() + 3600000, // 1 hour from now
    };
  },

  // Sign in (mock - always succeeds)
  signIn: async (email: string, password: string) => {
    isAuthenticated = true;
    return {
      user: currentUser,
      session: {
        access_token: 'mock_access_token',
        refresh_token: 'mock_refresh_token',
      },
      error: null,
    };
  },

  // Sign up (mock - always succeeds)
  signUp: async (email: string, password: string, displayName?: string) => {
    const newUser = {
      ...mockData.user,
      email,
      displayName: displayName || email.split('@')[0],
    };
    currentUser = newUser;
    isAuthenticated = true;
    return {
      user: newUser,
      session: {
        access_token: 'mock_access_token',
        refresh_token: 'mock_refresh_token',
      },
      error: null,
    };
  },

  // Sign out
  signOut: async () => {
    isAuthenticated = false;
    return { error: null };
  },

  // Update user profile
  updateProfile: async (updates: Partial<typeof currentUser>) => {
    currentUser = { ...currentUser, ...updates };
    return { user: currentUser, error: null };
  },

  // Reset password (mock - always succeeds)
  resetPassword: async (email: string) => {
    return { error: null };
  },

  // Update password (mock - always succeeds)
  updatePassword: async (newPassword: string) => {
    return { error: null };
  },

  // Check if user has specific role
  hasRole: (role: 'standard' | 'verified_seller' | 'moderator' | 'admin') => {
    return currentUser?.role === role;
  },

  // Check if user has minimum role level
  hasMinRole: (minRole: 'standard' | 'verified_seller' | 'moderator' | 'admin') => {
    const roleHierarchy = ['standard', 'verified_seller', 'moderator', 'admin'];
    const userRoleIndex = roleHierarchy.indexOf(currentUser?.role || 'standard');
    const minRoleIndex = roleHierarchy.indexOf(minRole);
    return userRoleIndex >= minRoleIndex;
  },
};

export type MockAuth = typeof mockAuth;

// React hook for client components
export function useMockAuth() {
  return {
    user: currentUser,
    isAuthenticated,
    signIn: mockAuth.signIn,
    signUp: mockAuth.signUp,
    signOut: mockAuth.signOut,
    updateProfile: mockAuth.updateProfile,
  };
}
