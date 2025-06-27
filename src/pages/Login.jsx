import React from 'react';
import { Link } from 'react-router-dom';
import shoppingImage from '../assets/shopping-login.jpg'; // Save your generated image as shopping-login.jpg

const Login = () => {
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

          <form className="space-y-5">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="flex justify-between items-center">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="accent-blue-500" /> Remember me
              </label>
              <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-300"
            >
              Login
            </button>
          </form>

          <p className="text-center text-sm text-gray-600">
            Don't have an account?
            <Link to="/signup" className="text-blue-600 ml-1 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
