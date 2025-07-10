/* eslint-disable react-refresh/only-export-components */
/* eslint-disable no-unused-vars */
import { createContext, useContext, useEffect, useState } from 'react';
import api from '../utils/axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    console.warn('Error parsing JWT token:', error);
    return true;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('userData');
      
      console.log('Checking stored credentials:');
      console.log('Token exists:', !!token);
      console.log('UserData exists:', !!userData);
      console.log('Token preview:', token ? token.substring(0, 50) + '...' : 'none');
      console.log('UserData preview:', userData ? userData.substring(0, 100) + '...' : 'none');
      
      if (token && userData) {
        if (isTokenExpired(token)) {
          console.log('Token is expired, clearing data');
          localStorage.removeItem('authToken');
          localStorage.removeItem('userData');
          setUser(null);
        } else {
          try {
          
            const parsedUserData = JSON.parse(userData);
            console.log('Parsed user data:', parsedUserData);
            
            const isValid = await validateToken(token);
            
            if (isValid) {
              console.log('Setting authenticated user');
              setUser(parsedUserData);
            } else {
              console.log('Token validation failed, not setting user');
              setUser(null);
            }
            
          } catch (error) {
            console.error('Error parsing user data:', error);
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            setUser(null);
          }
        }
      } else {
        console.log('No stored credentials found');
        setUser(null);
      }
      
      setIsLoading(false);
      setIsInitialized(true);
    };

    initializeAuth();
  }, []);

  const validateToken = async (token) => {
    if (!token || typeof token !== 'string') {
      console.log('Token is missing or invalid type');
      return false;
    }
    
    if (token.length < 10) {
      console.log('Token is too short to be valid');
      return false;
    }
    
    if (token.includes('.')) {
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        if (isTokenExpired(token)) {
          console.log('JWT token is expired');
          return false;
        }
        console.log('JWT token appears valid and not expired');
        return true;
      }
    }
    
    try {
      console.log('Attempting backend token validation...');
      
      const endpoints = [
        '/api/auth/me',
        '/api/auth/validate', 
        '/api/user/profile',
        '/api/auth/check',
        '/api/user/me'
      ];
      
      for (const endpoint of endpoints) {
        try {
          await api.get(endpoint);
          console.log(` Token validated via ${endpoint}`);
          return true;
        } catch (endpointError) {
          console.log(` ${endpoint} failed:`, endpointError.response?.status || 'Network error');
          continue;
        }
      }
      
      throw new Error('All validation endpoints failed');
      
    } catch (error) {
      console.warn(' Backend token validation failed:', error.message);
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log('Token is definitely invalid (401/403), clearing data');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        setUser(null);
        return false;
      }
      
      console.log('Backend validation unavailable, using client-side validation only');
      
      const userData = localStorage.getItem('userData');
      if (userData) {
        try {
          JSON.parse(userData);
          console.log('Token and user data appear valid, allowing login');
          return true;
        } catch (parseError) {
          console.log('User data is corrupted');
          return false;
        }
      }
      
      console.log('No valid user data found');
      return false;
    }
  };

  const login = (userData, token) => {
    console.log(' Logging in user:', userData.email || userData.username || 'Unknown');
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(userData));
    setUser(userData);
    if (!isInitialized) {
      setIsInitialized(true);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setUser(null);
  };

  const refreshAuth = async () => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (token && userData && !isTokenExpired(token)) {
      try {
        const parsedUserData = JSON.parse(userData);
        setUser(parsedUserData);
        await validateToken(token);
        return true;
      } catch (error) {
        console.error('Error refreshing auth:', error);
        logout();
        return false;
      }
    } else {
      logout();
      return false;
    }
  };

  const value = {
    user,
    isLoading,
    isInitialized,
    login,
    logout,
    refreshAuth,
    isAuthenticated: !!user && isInitialized
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
