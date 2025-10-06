import { useState } from "react";
import { Link } from "react-router-dom";
import toast, { Toaster } from 'react-hot-toast';

function Signup() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Use toast.promise for streamlined handling of loading, success, and error states
    // This removes the need for manual toast.loading() and toast.dismiss() calls, improving speed.
    const promise = fetch("http://localhost:8080/api/users/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    .then(async (response) => {
      const text = await response.text();
      
      if (!response.ok) {
        // Throw an error to trigger the error toast
        throw new Error(text || "Registration failed. Please check your details.");
      }
      // If response is OK, return the successful message
      return text || "Registration Successful! You can now log in.";
    });

    toast.promise(
      promise,
      {
        loading: 'Creating your account...',
        success: (message) => {
          // Reset form on success
          setForm({ firstName: "", lastName: "", email: "", password: "" }); 
          return message;
        },
        error: (error) => {
          // Display the error message from the response text
          return error.message; 
        },
      },
      {
        duration: 4000,
      }
    );
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white p-4">
      
      {/* 2. THE TOASTER REMAINS HERE - THIS IS CRUCIAL */}
      <Toaster position="top-center" reverseOrder={false} />

      {/* Main Signup Card (Elevated and Animated) */}
      <div 
        className="max-w-md w-full p-8 bg-white border border-gray-100 shadow-xl rounded-2xl animate-fadeIn transform transition-all duration-700 ease-out"
        style={{ animationDelay: '200ms', animationFillMode: 'backwards' }} 
      >
        <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold text-blue-600 mb-2">CivicPulse</h1>
            <h2 className="text-xl font-semibold text-gray-800">Create Your Account</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="flex space-x-4">
                <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={form.firstName}
                    onChange={handleChange}
                    className="w-1/2 p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200"
                    required
                />
                <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={form.lastName}
                    onChange={handleChange}
                    className="w-1/2 p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200"
                    required
                />
            </div>
            
            <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={form.email}
                onChange={handleChange}
                className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200"
                required
            />
            <input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200"
                required
            />
            
            <button
                type="submit"
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition duration-300 shadow-lg transform hover:scale-[1.01] focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
                Sign Up
            </button>
        </form>
        
        <div className="mt-8 text-center text-sm space-y-2">
            <p className="text-gray-600">
                Already have an account? 
                <Link to="/login" className="text-blue-600 hover:text-blue-700 hover:underline font-bold ml-1">
                    Log in here
                </Link>
            </p>
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

export default Signup;