import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// Ensure you have run: npm install react-hot-toast
import toast, { Toaster } from 'react-hot-toast';

function UserLogin() { // Renamed from Login to UserLogin for clarity
  const [form, setForm] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Use toast.promise for fast, integrated loading/success/error handling
    const promise = fetch('http://localhost:8080/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
      .then(async (response) => {
        const text = await response.text();

        if (!response.ok) {
          // Throw an error to trigger the error toast
          throw new Error(text || 'Invalid credentials. Please try again.');
        }

        const idMatch = text.match(/UserID:(\d+)/);
        const userId = idMatch ? idMatch[1] : null;

        if (!userId) {
          throw new Error('Login failed: User ID not received.');
        }

        // Set Local Storage and return success message
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', form.email);
        localStorage.setItem('userId', userId);
        localStorage.setItem('isAdmin', 'false');

        // Delay navigation slightly to let the success toast appear
        setTimeout(() => {
          navigate('/profile');
        }, 1000);

        return 'Login Successful! Redirecting...';
      })
      .catch((error) => {
        // Re-throw the error so toast.promise handles the rejection
        throw error;
      });

    toast.promise(
      promise,
      {
        loading: 'Logging in...',
        success: (message) => message,
        error: (error) => error.message,
      },
      {
        duration: 4000,
      }
    );
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white p-4">
      
      {/* THE TOASTER COMPONENT */}
      <Toaster position="top-center" reverseOrder={false} />

      {/* Main Login Card (Elevated and Animated) */}
      <div 
        className="max-w-md w-full p-8 bg-white border border-gray-100 shadow-xl rounded-2xl animate-fadeIn transform transition-all duration-700 ease-out"
        // Move @keyframes to your global CSS!
        style={{ animationDelay: '200ms', animationFillMode: 'backwards' }} 
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-blue-600 mb-2">CivicPulse</h1>
          <h2 className="text-xl font-semibold text-gray-800">Sign in to report issues</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            onChange={handleChange}
            className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 bg-white text-gray-800"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 bg-white text-gray-800"
            required
          />
          
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition duration-300 shadow-lg transform hover:scale-[1.01] focus:outline-none focus:ring-4 focus:ring-blue-300"
          >
            Login
          </button>
        </form>
        
        <div className="mt-8 text-center text-sm space-y-2">
          <p className="text-gray-600">
            Don't have an account? 
            <Link to="/signup" className="text-blue-600 hover:text-blue-700 hover:underline font-bold ml-1">
              Sign up here
            </Link>
          </p>
          {/* REMOVED: Final Admin Login link */}
        </div>
      </div>
      
      {/* Animation Styles - Move to global CSS! */}
      <style global jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation-name: fadeIn;
          animation-duration: 0.5s;
          animation-timing-function: ease-out;
        }
      `}</style>
    </div>
  );
}

export default UserLogin;