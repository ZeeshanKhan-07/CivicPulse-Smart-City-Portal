import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

function AdminProfile() {
    const navigate = useNavigate();
    const [adminEmail, setAdminEmail] = useState('Admin');
    
    // Define the color scheme for consistency (Teal for Admin)
    const HEADER_BG = '#121c3b'; // Dark Navy from Homepage
    const ACCENT_COLOR = 'text-teal-400'; // Teal accent for Admin

    useEffect(() => {
        // Fetch admin email from localStorage
        const email = localStorage.getItem("userEmail");
        const isAdmin = localStorage.getItem("isAdmin") === "true";

        if (email && isAdmin) {
            // Display only the part before the '@' sign for a clean look
            setAdminEmail(email.split('@')[0]);
        }
        
        // CRITICAL CHECK: If not logged in OR not an admin, redirect
        if (localStorage.getItem("isLoggedIn") !== "true" || !isAdmin) {
            toast.error("Access Denied. Please log in as an administrator.", { duration: 3000 });
            navigate('/adminLogin');
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

            {/* --- Project Name Header (Same as User Profile) --- */}
            <header className={`w-full p-4 md:p-6 shadow-lg flex justify-between items-center z-10`} style={{ backgroundColor: HEADER_BG }}>
                <h1 className="text-xl md:text-2xl font-bold tracking-wider text-blue-300">
                    Infosys_CivicPulse Hub - ADMIN
                </h1>
                
                <button 
                    onClick={handleLogout}
                    // Logout button uses the Admin accent color (Teal)
                    className="px-4 py-2 text-sm font-semibold text-teal-400 border border-teal-400 rounded-lg hover:bg-gray-700 transition duration-200"
                >
                    Logout
                </button>
            </header>
            
            {/* --- Main Admin Content --- */}
            <div className="flex-grow flex flex-col items-center justify-center p-6 space-y-10">
                
                {/* Welcome Message/Admin Details */}
                <h2 className="text-3xl md:text-4xl font-extrabold text-center">
                    Admin Dashboard, <span className={ACCENT_COLOR}>{adminEmail}</span>.
                </h2>
                <p className="text-xl text-gray-400">
                    Manage and track all submitted civic complaints.
                </p>

                {/* --- Primary Action Card: View All Complaints --- */}
                <div className="w-full max-w-xl">
                    <Link 
                        to="/complaints" // Assuming this is your route to view all complaints
                        className="p-10 bg-gray-800 rounded-xl shadow-2xl hover:bg-gray-700 transition duration-300 transform hover:scale-[1.03] flex flex-col items-center justify-center space-y-5 border-b-4 border-teal-500"
                    >
                        {/* Icon for Complaint Management */}
                        <svg className="w-16 h-16 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                        
                        <h3 className="text-3xl font-bold text-white">
                            View All Complaints
                        </h3>
                        <p className="text-gray-400 text-lg text-center">
                            Access the complete list of reports, assign tasks, and update statuses.
                        </p>
                        <span className="mt-4 text-teal-400 font-semibold flex items-center text-lg">
                            Go to Complaint Tracker
                            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                        </span>
                    </Link>
                </div>
                
            </div>
            
            <footer className="p-4 text-center text-sm text-gray-500 border-t border-gray-800">
                &copy; 2024 Infosys_CivicPulse Hub. Admin Access.
            </footer>
        </div>
    );
}

export default AdminProfile;