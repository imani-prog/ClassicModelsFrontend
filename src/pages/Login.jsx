import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import shoppingImage from '../assets/shopping-login.jpg';
import { debugLogin, testCurrentToken } from '../utils/authDebug';
import TokenManager from '../utils/tokenManager';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const successMessage = location.state?.message;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Use debug utility for comprehensive response analysis
      console.log('🔍 Starting login with debug analysis...');
      testCurrentToken(); // Check current state before login
      
      const response = await debugLogin(formData.email, formData.password);
      const data = response.data;

      // Enhanced token extraction logic
      let token = null;
      let user = null;
      let success = false;

      // Check for token in multiple possible fields (including snake_case variants)
      const tokenFields = ['token', 'accessToken', 'jwt', 'authToken', 'access_token', 'auth_token'];
      for (const field of tokenFields) {
        if (data[field] && typeof data[field] === 'string' && data[field].length > 0) {
          token = data[field];
          console.log(`✅ Found token in field: ${field}`);
          break;
        }
      }

      // Check for success indicators
      const successFields = ['success', 'status', 'ok'];
      for (const field of successFields) {
        if (data[field] === true || data[field] === 'success' || data[field] === 'ok') {
          success = true;
          console.log(`✅ Found success indicator in field: ${field}`);
          break;
        }
      }

      // If we got a 200 response and a token, consider it successful even without explicit success field
      if (response.status === 200 && token) {
        success = true;
        console.log('✅ Inferred success from 200 status + token');
      }

      // Check for user data in multiple possible fields
      const userFields = ['user', 'userDetails', 'userData', 'userInfo', 'profile'];
      for (const field of userFields) {
        if (data[field] && typeof data[field] === 'object') {
          user = data[field];
          console.log(`✅ Found user data in field: ${field}`);
          break;
        }
      }

      // If no user object found, create one from available data
      if (!user) {
        user = {
          email: formData.email,
          // Include any other user-related fields from the response
          ...Object.fromEntries(
            Object.entries(data).filter(([key, value]) => 
              !tokenFields.includes(key) && 
              !successFields.includes(key) && 
              typeof value !== 'object' &&
              key !== 'message' &&
              key !== 'timestamp'
            )
          )
        };
        console.log('✅ Created user object from available data');
      }

      console.log('🔍 Final extraction results:');
      console.log('  Token:', token ? `${token.substring(0, 30)}...` : 'NONE');
      console.log('  User:', user);
      console.log('  Success:', success);

      if (success && token) {
        // Store the token and user data using TokenManager
        const tokenStored = TokenManager.setToken(token);
        const userStored = TokenManager.setUser(user);
        
        if (tokenStored && userStored) {
          console.log('✅ Authentication data stored successfully');
          
          // Verify storage worked
          testCurrentToken(); // Debug current state after storage
          
          navigate('/dashboard');
        } else {
          setError('Failed to store authentication data. Please try again.');
        }
      } else {
        console.error('❌ Login failed - Success:', success, 'Token:', !!token);
        if (!token) {
          setError('Authentication failed: No authentication token received from server. Please check your credentials.');
        } else {
          setError(data.message || data.msg || 'Login failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side with image */}
      <div className="hidden md:flex w-1/2 bg-gray-100 items-center justify-center">
        <img
          src={shoppingImage}
          alt="E-commerce illustration"
          className="max-w-full h-auto object-cover"
        />
      </div>

      {/* Right side with login form */}
      <div className="flex w-full md:w-1/2 items-center justify-center p-10 bg-white">
        <div className="w-full max-w-md space-y-6">
          <h2 className="text-4xl font-bold text-gray-800">Welcome Back</h2>
          <p className="text-gray-600">Please enter your credentials to sign in.</p>

          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <p className="text-sm text-green-600">{successMessage}</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="you@example.com"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="flex justify-between items-center">
              <label className="flex items-center gap-2 text-sm">
                <input 
                  type="checkbox" 
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="accent-blue-500" 
                /> 
                Remember me
              </label>
              <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2 rounded-md transition duration-300 text-white ${
                isLoading 
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLoading ? 'Signing in...' : 'Login'}
            </button>

            {/* Debug button for development */}
            <button
              type="button"
              onClick={() => {
                console.log('🔍 Manual debug check...');
                testCurrentToken();
              }}
              className="w-full py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition duration-300 text-sm"
            >
              🔍 Debug Auth State
            </button>
          </form>

          <p className="text-center text-sm text-gray-600">
            Don't have an account?
            <Link to="/signup" className="text-blue-600 ml-1 hover:underline">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
