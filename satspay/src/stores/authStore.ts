import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthCredentials, SignUpData } from '../types/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  sessionExpiry: number | null;
  
  // Actions
  signIn: (credentials: AuthCredentials) => Promise<boolean>;
  signUp: (signUpData: SignUpData) => Promise<boolean>;
  signOut: () => void;
  setUser: (user: User) => void;
  clearError: () => void;
  checkSession: () => boolean;
  refreshSession: () => void;
  initializeAuth: () => Promise<void>;
}

const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      sessionExpiry: null,
      
      signIn: async (credentials: AuthCredentials) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simple validation - in a real app, this would validate against a backend
          // For now, just check if credentials are provided
          if (!credentials.email || !credentials.pin) {
            set({ 
              isLoading: false, 
              error: 'Please provide both email and PIN.' 
            });
            return false;
          }
          
          // Create a simple user object
          const user: User = {
            id: `user_${Date.now()}`,
            name: 'Demo User',
            email: credentials.email,
            age: 25,
            createdAt: new Date(),
          };
          
          // Set session expiry
          const sessionExpiry = Date.now() + SESSION_DURATION;
          
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false, 
            error: null,
            sessionExpiry 
          });
          
          return true;
        } catch (error) {
          console.error('Sign-in error:', error);
          set({ 
            isLoading: false, 
            error: 'An error occurred during sign-in. Please try again.' 
          });
          return false;
        }
      },
      
      signUp: async (signUpData: SignUpData) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simple validation
          if (!signUpData.email || !signUpData.pin || !signUpData.name) {
            set({ 
              isLoading: false, 
              error: 'Please fill in all required fields.' 
            });
            return false;
          }
          
          // Create user object
          const user: User = {
            id: `user_${Date.now()}`,
            name: signUpData.name,
            email: signUpData.email,
            age: signUpData.age,
            createdAt: new Date(),
          };
          
          // Set session expiry
          const sessionExpiry = Date.now() + SESSION_DURATION;
          
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false, 
            error: null,
            sessionExpiry 
          });
          
          return true;
        } catch (error) {
          console.error('Sign-up error:', error);
          set({ 
            isLoading: false, 
            error: 'An error occurred during account creation. Please try again.' 
          });
          return false;
        }
      },
      
      signOut: () => {
        set({ 
          user: null, 
          isAuthenticated: false, 
          error: null,
          sessionExpiry: null 
        });
      },
      
      setUser: (user: User) => {
        const sessionExpiry = Date.now() + SESSION_DURATION;
        set({ 
          user, 
          isAuthenticated: true,
          sessionExpiry 
        });
      },
      
      clearError: () => {
        set({ error: null });
      },
      
      checkSession: () => {
        const { sessionExpiry, isAuthenticated } = get();
        
        if (!isAuthenticated || !sessionExpiry) {
          return false;
        }
        
        const isExpired = Date.now() > sessionExpiry;
        if (isExpired) {
          // Session expired, sign out
          get().signOut();
          return false;
        }
        
        return true;
      },
      
      refreshSession: () => {
        const { isAuthenticated } = get();
        if (isAuthenticated) {
          const sessionExpiry = Date.now() + SESSION_DURATION;
          set({ sessionExpiry });
        }
      },
      
      initializeAuth: async () => {
        set({ isLoading: true });
        
        try {
          // Check if session is still valid
          const isSessionValid = get().checkSession();
          
          if (!isSessionValid) {
            // Session expired, sign out
            get().signOut();
          } else {
            // Session is still valid, refresh it
            get().refreshSession();
          }
          
          set({ isLoading: false });
        } catch (error) {
          console.error('Auth initialization error:', error);
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'satspay-auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated,
        sessionExpiry: state.sessionExpiry 
      }),
      // Custom storage to handle session validation on hydration
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Check session validity on app load
          state.checkSession();
        }
      },
    }
  )
);