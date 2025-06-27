import React from 'react';
import { Link } from 'react-router-dom';
import shoppingImage from '../assets/shopping-login.jpg'; // Reuse the image from login

const Signup = () => {
  return (
    <div className="min-h-screen flex">
      {/* Left side image */}
      <div className="hidden md:flex w-1/2 bg-gray-100 items-center justify-center">
        <img
          src={shoppingImage}
          alt="E-commerce illustration"
          className="max-w-full h-auto object-cover"
        />
      </div>

     
      <div className="flex w-full md:w-1/2 items-center justify-center p-10 bg-white">
        <div className="w-full max-w-md space-y-6">
          <h2 className="text-4xl font-bold text-gray-800">Create Account</h2>
          <p className="text-gray-600">Join us and start shopping smarter!</p>

          <form className="space-y-5">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

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
                placeholder="Create a strong password"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">Confirm Password</label>
              <input
                type="password"
                placeholder="Re-enter password"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-300"
            >
              Sign Up
            </button>
          </form>

          <p className="text-center text-sm text-gray-600">
            Already have an account?
            <Link to="/login" className="text-blue-600 ml-1 hover:underline">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
