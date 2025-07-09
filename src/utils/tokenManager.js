// Token management utilities
export const TokenManager = {
  // Store token securely
  setToken: (token) => {
    if (!token) {
      console.error('❌ Attempted to store null/undefined token');
      return false;
    }
    
    try {
      localStorage.setItem('authToken', token);
      console.log('✅ Token stored successfully:', token.substring(0, 30) + '...');
      return true;
    } catch (error) {
      console.error('❌ Failed to store token:', error);
      return false;
    }
  },

  // Get token from storage
  getToken: () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token && token !== 'undefined' && token !== 'null') {
        return token;
      }
      return null;
    } catch (error) {
      console.error('❌ Failed to retrieve token:', error);
      return null;
    }
  },

  // Clear token from storage
  clearToken: () => {
    try {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      console.log('✅ Token and user data cleared');
      return true;
    } catch (error) {
      console.error('❌ Failed to clear token:', error);
      return false;
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = TokenManager.getToken();
    return token !== null && token.length > 0;
  },

  // Store user data
  setUser: (userData) => {
    if (!userData) {
      console.error('❌ Attempted to store null/undefined user data');
      return false;
    }
    
    try {
      localStorage.setItem('userData', JSON.stringify(userData));
      console.log('✅ User data stored successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to store user data:', error);
      return false;
    }
  },

  // Get user data
  getUser: () => {
    try {
      const userData = localStorage.getItem('userData');
      if (userData && userData !== 'undefined' && userData !== 'null') {
        return JSON.parse(userData);
      }
      return null;
    } catch (error) {
      console.error('❌ Failed to retrieve user data:', error);
      return null;
    }
  }
};

export default TokenManager;
