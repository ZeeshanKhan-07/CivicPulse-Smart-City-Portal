import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast'; // Import toast for notifications

// The Role Selection Modal Component (for Sign In)
const RoleSelectionModal = ({ onClose }) => {
  const navigate = useNavigate();

  const handleUserClick = () => {
    onClose();
    navigate('/login'); // Redirect to standard User Login page
  };
  
  const handleAdminClick = () => {
    onClose();
    navigate('/adminLogin'); // Redirect to Admin Login page
  };

  const handleDepartmentClick = () => {
    onClose();
    navigate('/departmentLogin');
  }
 
  return (
    // Modal Overlay/Backdrop
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      
      {/* Background Blur Effect */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={onClose} // Close when clicking the dark area
      />

      {/* Modal Box */}
      <div className="relative bg-white text-gray-900 rounded-xl shadow-2xl p-6 w-full max-w-sm transform transition-all">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 transition"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>

        <h3 className="text-xl font-bold mb-6 text-center">
          Continue as
        </h3>
        
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
    // Check local storage for login status when the component mounts
    const status = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(status);
  }, []);


  const openModal = (e) => {
    e.preventDefault(); 
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Handles the "Get Started" button click (Requires Login)
  const handleGetStartedClick = (e) => {
    if (!isLoggedIn) {
      e.preventDefault();
      // SHOW POPUP: Display toast message if not logged in
      toast.error('Please login first to report a complaint.', {
        duration: 3000,
        position: 'top-center',
      });
    } else {
      // If logged in, proceed to the registerComplains page
      navigate('/registerComplains');
    }
  };

  // FIX APPLIED HERE: Handles the "Profile" button click, redirecting to the new path
  const handleProfileClick = () => {
    // Navigate to the correct user profile path defined in App.jsx
    navigate('/user-profile'); 
  }

  return (
    // Main page container (still sticky and non-scrollable)
    <div className="fixed inset-0 w-screen h-screen flex flex-col bg-[#121c3b] text-white overflow-hidden">
      
      {/* Toaster for notifications */}
      <Toaster />

      {/* --- Navbar (Minimal, Dark Theme) --- */}
      <nav className="z-40 p-4 md:px-6 md:py-6 w-full"> 
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-10">
            <div className="flex-shrink-0">
              <h1 className="text-lg md:text-xl font-light text-blue-300 tracking-wider">
                <Link to="/">Infosys_CivicPulse Hub</Link> 
              </h1>
            </div>

            <div className="hidden md:flex space-x-8 items-center text-sm font-light text-white/80">
              <Link to="/" className="hover:text-blue-400 transition duration-150">Home</Link>
              <Link to="/about" className="hover:text-blue-400 transition duration-150">About</Link>
              <Link to="/contact" className="hover:text-blue-400 transition duration-150">Contact</Link>
              
              {/* CONDITIONAL RENDERING: Profile or Sign in */}
              {isLoggedIn ? (
                <button 
                  onClick={handleProfileClick} // Uses the corrected navigation
                  className="px-4 py-1.5 border border-white/50 rounded-lg text-white hover:border-green-400 hover:text-green-400 transition duration-300"
                >
                  Profile
                </button>
              ) : (
                // Show Sign in button if not logged in - OPENS THE DUAL-ROLE MODAL
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

      {/* --- Hero Content --- */}
      <div 
          className="relative z-10 w-full flex-grow flex items-center justify-start overflow-y-auto"
      > 
        <div className="px-8 md:pl-16 md:px-4 max-w-4xl text-left mx-auto md:mx-0 py-10 md:py-0">
          
          <h2 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-4 md:mb-6 tracking-tight leading-tight drop-shadow-lg">
            Unified Smart City <br />
            Feedback
          </h2>
          
          <p className="text-base md:text-lg text-white/70 mb-8 md:mb-10 max-w-lg font-light tracking-wide">
            Your single platform for rapid feedback and streamlined redressal of civic issues, powering the **Infosys_CivicPulse Hub** for a smarter city.
          </p>
          
          {/* "Get Started" button uses the logic to check login status */}
          <Link 
            to="/registerComplains" 
            onClick={handleGetStartedClick} 
            className="inline-block px-8 py-2 md:px-10 md:py-3 text-base md:text-lg font-medium text-white border border-blue-400 rounded-full hover:bg-blue-600 transition duration-300 transform hover:scale-[1.03]"
          >
            Get Started
          </Link>
        </div>
      </div>
      
      {/* Role Selection Modal - Only renders when isModalOpen is true */}
      {isModalOpen && <RoleSelectionModal onClose={closeModal} />}
    </div>
  );
}

export default HomePage;