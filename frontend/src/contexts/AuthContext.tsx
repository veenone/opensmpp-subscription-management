import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, AuthResponse, LoginRequest, User } from '../services/authService';
import { toast } from '../components/common/Toaster';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

const TOKEN_REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutes

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('accessToken');
  });
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!token && !!user;

  const login = async (credentials: LoginRequest) => {
    setIsLoading(true);
    try {
      const response: AuthResponse = await authApi.login(credentials);
      
      setUser(response.user);
      setToken(response.accessToken);
      
      // Store tokens
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      
      toast.success('Login successful');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    toast.info('Logged out successfully');
  };

  const refreshToken = async () => {
    const storedRefreshToken = localStorage.getItem('refreshToken');
    if (!storedRefreshToken) {
      logout();
      return;
    }

    try {
      const response = await authApi.refreshToken(storedRefreshToken);
      
      setToken(response.accessToken);
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
    } catch (error: any) {
      console.error('Token refresh failed:', error);
      logout();
      throw error;
    }
  };

  const validateToken = async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const user = await authApi.getCurrentUser();
      setUser(user);
    } catch (error: any) {
      console.error('Token validation failed:', error);
      // Try to refresh the token
      try {
        await refreshToken();
        const user = await authApi.getCurrentUser();
        setUser(user);
      } catch (refreshError) {
        logout();
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    validateToken();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    // Set up automatic token refresh
    const intervalId = setInterval(() => {
      refreshToken().catch(() => {
        // Refresh failed, user will be logged out
      });
    }, TOKEN_REFRESH_INTERVAL);

    return () => clearInterval(intervalId);
  }, [isAuthenticated]);

  // Handle token expiration
  useEffect(() => {
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000; // Convert to milliseconds
      const now = Date.now();
      
      if (exp <= now) {
        // Token is expired, try to refresh
        refreshToken().catch(() => {
          logout();
        });
      }
    } catch (error) {
      console.error('Error parsing token:', error);
      logout();
    }
  }, [token]);

  const contextValue: AuthContextType = {
    user,
    token,
    login,
    logout,
    isAuthenticated,
    isLoading,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};