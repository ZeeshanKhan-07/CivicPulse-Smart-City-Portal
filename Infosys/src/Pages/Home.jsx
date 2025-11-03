import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

// The Role Selection Modal Component (for Sign In)
const RoleSelectionModal = ({ onClose }) => {
  const navigate = useNavigate();

  const handleUserClick = () => {
    onClose();
    navigate('/login');
  };

  const handleAdminClick = () => {
    onClose();
    navigate('/adminLogin');
  };

  const handleDepartmentClick = () => {
    onClose();
    navigate('/departmentLogin');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white text-gray-900 rounded-xl shadow-2xl p-6 w-full max-w-sm transform transition-all">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 transition"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>

        <h3 className="text-xl font-bold mb-6 text-center">Continue as</h3>

        <div className="flex flex-col space-y-4">
          <button
            onClick={handleUserClick}
            className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-300 shadow-md"
          >
            I'm a User
          </button>

          <button
            onClick={handleAdminClick}
            className="w-full px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition duration-300 shadow-md"
          >
            I'm an Admin
          </button>

          <button
            onClick={handleDepartmentClick}
            className="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition duration-300 shadow-md"
          >
            I'm Department Officer
          </button>
        </div>
      </div>
    </div>
  );
};

function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const status = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(status);
  }, []);

  const openModal = (e) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleGetStartedClick = (e) => {
    if (!isLoggedIn) {
      e.preventDefault();
      toast.error('Please login first to report a complaint.', {
        duration: 3000,
        position: 'top-center',
      });
    } else {
      navigate('/registerComplains');
    }
  };

  const handleProfileClick = () => {
    navigate('/user-profile');
  };

  return (
    <div className="relative w-screen h-screen flex flex-col overflow-hidden">

      {/* --- Background Video (only for large screens) --- */}
      <video
        className="hidden md:block absolute top-0 left-0 w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
      >
        {/* Change this path to match your actual video location */}
        <source src="/videos/video1.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* --- Background color for small screens --- */}
      <div className="block md:hidden absolute inset-0 bg-white"></div>

      {/* Overlay with slight dark tint for better text visibility */}
      <div className="absolute inset-0 bg-black/40 md:bg-black/50 z-0"></div>

      {/* Toaster for notifications */}
      <Toaster />

      {/* --- Navbar --- */}
      <nav className="z-40 p-4 md:px-6 md:py-6 w-full fixed top-0 left-0 backdrop-blur bg-white/10 border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-1">
            <div className="flex-shrink-0">
              <h1 className="text-lg md:text-xl font-bold text-white tracking-wider">
                <Link to="/">CivicPulse_Hub</Link>
              </h1>
            </div>

            <div className="hidden md:flex space-x-8 items-center text-sm font-light text-white/80">
              <Link
                to="/"
                className="hover:text-blue-400 transition duration-150"
              >
                Home
              </Link>
              <Link
                to="/about"
                className="hover:text-blue-400 transition duration-150"
              >
                About
              </Link>
              <Link
                to="/contact"
                className="hover:text-blue-400 transition duration-150"
              >
                Contact
              </Link>

              {isLoggedIn ? (
                <button
                  onClick={handleProfileClick}
                  className="px-4 py-1.5 border border-white/50 rounded-lg text-white hover:border-green-400 hover:text-green-400 transition duration-300"
                >
                  Profile
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={openModal}
                  className="px-4 py-1.5 border border-white/50 rounded-lg text-white hover:border-blue-400 hover:text-blue-400 transition duration-300"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <div className="relative z-10 w-full flex-grow flex items-center justify-start">
        <div className="px-8 md:pl-16 md:px-4 max-w-4xl text-left mx-auto md:mx-0 py-10 md:py-0">
          <h2 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-4 md:mb-6 tracking-tight leading-tight text-white drop-shadow-lg">
            Unified Smart City <br />
            Feedback
          </h2>

          <p className="text-base md:text-lg text-white/70 mb-8 md:mb-10 max-w-lg font-light tracking-wide">
            Your single platform for rapid feedback and streamlined redressal of
            civic issues, powering the <b>CivicPulse Hub</b> for a smarter city.
          </p>

          <Link
            to="/registerComplains"
            onClick={handleGetStartedClick}
            className="inline-block px-8 py-2 md:px-10 md:py-3 text-base md:text-lg font-medium text-white border border-blue-400 rounded-full hover:bg-blue-600 transition duration-300 transform hover:scale-[1.03]"
          >
            Get Started
          </Link>
        </div>
      </div>

      {/* --- Modal --- */}
      {isModalOpen && <RoleSelectionModal onClose={closeModal} />}
    </div>
  );
}

export default HomePage;
