// Authentication debugging utility
import { authAPI } from './axios';

export const debugLogin = async (email, password) => {
  console.log('🔍 Starting authentication debug...');
  console.log('📧 Email:', email);
  console.log('🔑 Password length:', password.length);

  try {
    const response = await authAPI.login({ email, password });
    
    // Complete response analysis
    console.log('📥 Complete response object:', response);
    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', response.headers);
    console.log('📊 Response data:', response.data);
    console.log('📊 Response data type:', typeof response.data);
    console.log('📊 Response data keys:', Object.keys(response.data || {}));
    
    // Token analysis
    const data = response.data;
    console.log('🔍 Checking for token fields...');
    console.log('  data.token:', data.token);
    console.log('  data.accessToken:', data.accessToken);
    console.log('  data.jwt:', data.jwt);
    console.log('  data.authToken:', data.authToken);
    console.log('  data.access_token:', data.access_token);
    
    // Success analysis
    console.log('🔍 Checking for success fields...');
    console.log('  data.success:', data.success);
    console.log('  data.status:', data.status);
    console.log('  data.ok:', data.ok);
    
    // User data analysis
    console.log('🔍 Checking for user fields...');
    console.log('  data.user:', data.user);
    console.log('  data.userDetails:', data.userDetails);
    console.log('  data.userData:', data.userData);
    console.log('  data.userInfo:', data.userInfo);
    
    // Message analysis
    console.log('🔍 Checking for message fields...');
    console.log('  data.message:', data.message);
    console.log('  data.msg:', data.msg);
    
    return response;
  } catch (error) {
    console.error('❌ Authentication debug failed:', error);
    console.error('❌ Error response:', error.response);
    console.error('❌ Error data:', error.response?.data);
    throw error;
  }
};

export const testCurrentToken = () => {
  const token = localStorage.getItem('authToken');
  const userData = localStorage.getItem('userData');
  
  console.log('🔍 Current localStorage state:');
  console.log('  authToken:', token);
  console.log('  authToken type:', typeof token);
  console.log('  authToken length:', token?.length || 0);
  console.log('  userData:', userData);
  console.log('  userData type:', typeof userData);
  
  try {
    if (userData && userData !== 'undefined' && userData !== 'null') {
      const parsedUser = JSON.parse(userData);
      console.log('  parsed userData:', parsedUser);
    }
  } catch (e) {
    console.error('  Error parsing userData:', e);
  }
};
