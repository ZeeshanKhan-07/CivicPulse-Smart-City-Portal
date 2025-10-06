import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

function UserProfile() {
    const navigate = useNavigate();
    const [userEmail, setUserEmail] = useState('User');
    
    // Define the color scheme for consistency
    const HEADER_BG = '#121c3b'; // Dark Navy from HomePage
    const ACCENT_COLOR = 'text-blue-400';

    useEffect(() => {
        // Fetch user email from localStorage
        const email = localStorage.getItem("userEmail");
        if (email) {
            // Display only the part before the '@' sign for a clean look
            setUserEmail(email.split('@')[0]);
        }
        
        // Optional: Check if logged in, redirect if not
        if (localStorage.getItem("isLoggedIn") !== "true") {
            toast.error("Please log in to view your profile.", { duration: 2000 });
            navigate('/login');
        }
    }, [navigate]);

    const handleLogout = () => {
        // Clear all necessary local storage items
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userId");
        localStorage.removeItem("isAdmin");
        
        toast.success('Logged out successfully.', { duration: 1500 });
        
        // Use a slight delay before navigating to let the toast display
        setTimeout(() => {
            navigate('/'); 
        }, 1500);
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-900 text-white">
            <Toaster position="top-center" reverseOrder={false} />

            {/* --- Project Name Header --- */}
            <header className={`w-full p-4 md:p-6 shadow-lg flex justify-between items-center z-10`} style={{ backgroundColor: HEADER_BG }}>
                <h1 className="text-xl md:text-2xl font-bold tracking-wider text-blue-300">
                    Infosys_CivicPulse Hub
                </h1>
                
                <button 
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-semibold text-red-400 border border-red-400 rounded-lg hover:bg-red-900 transition duration-200"
                >
                    Logout
                </button>
            </header>
            
            {/* --- Main Profile Content --- */}
            <div className="flex-grow flex flex-col items-center justify-center p-6 space-y-10">
                
                {/* Welcome Message */}
                <h2 className="text-3xl md:text-4xl font-extrabold text-center">
                    Welcome back, <span className={ACCENT_COLOR}>{userEmail}</span>!
                </h2>

                {/* --- Action Cards Container --- */}
                <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* Card 1: Raise Complaint */}
                    <Link 
                        to="/registerComplains" 
                        className="p-8 bg-gray-800 rounded-xl shadow-2xl hover:bg-gray-700 transition duration-300 transform hover:scale-[1.03] flex flex-col items-start space-y-4 border-t-4 border-blue-500"
                    >
                        <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        
                        <h3 className="text-2xl font-bold text-white">
                            Raise a New Complaint
                        </h3>
                        <p className="text-gray-400 text-lg">
                            Report a pothole, civic issue, or infrastructure problem directly to the municipal hub.
                        </p>
                        <span className="mt-4 text-blue-400 font-semibold flex items-center">
                            Start Reporting Now 
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                        </span>
                    </Link>

                    {/* Card 2: Check Complaint Status */}
                    <Link 
                        to="/status" 
                        className="p-8 bg-gray-800 rounded-xl shadow-2xl hover:bg-gray-700 transition duration-300 transform hover:scale-[1.03] flex flex-col items-start space-y-4 border-t-4 border-green-500"
                    >
                        <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v14H9zM9 19c-3.866 0-7-3.134-7-7s3.134-7 7-7m0 14c3.866 0 7-3.134 7-7s-3.134-7-7-7"></path></svg>
                        
                        <h3 className="text-2xl font-bold text-white">
                            Check Complaint Status
                        </h3>
                        <p className="text-gray-400 text-lg">
                            View the progress, updates, and resolution status of your submitted complaints.
                        </p>
                        <span className="mt-4 text-green-400 font-semibold flex items-center">
                            View Status History
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                        </span>
                    </Link>
                </div>
                
            </div>
            
            <footer className="p-4 text-center text-sm text-gray-500 border-t border-gray-800">
                &copy; 2024 Infosys_CivicPulse Hub. All rights reserved.
            </footer>
        </div>
    );
}

export default UserProfile;