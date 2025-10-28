import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import ImagePopup from "../Components/ImagePopup";
import Popup from "../Components/Popup";

// File base URL for displaying images
const FILE_BASE_URL = 'http://localhost:8080/api/files/download';

// Utility component for the Sticky Header/Background
// I'm assuming you can get the user's name from localStorage or a context/state.
// For this example, I'll use a placeholder.
const StickyHeader = ({ userName, onLogout, onRefresh, navigate }) => (
    // This is the "background component" that remains sticky
    <header className="sticky top-0 z-10 bg-white shadow-lg p-4 border-b border-gray-100">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
            {/* User Info (like the name) */}
            <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {userName ? userName[0].toUpperCase() : 'U'}
                </div>
                <h1 className="text-xl font-semibold text-gray-800 hidden sm:block">
                    Welcome, {userName || 'User'}!
                </h1>
            </div>

            {/* Action Buttons and Logout */}
            <div className="flex space-x-3 items-center">
                <button
                    onClick={() => navigate("/registerComplains")}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-lg shadow-md hover:bg-green-600 transition duration-150 ease-in-out"
                >
                    New Complaint
                </button>
                <button
                    onClick={onRefresh}
                    className="p-2 text-gray-600 rounded-full hover:bg-gray-100 transition duration-150 ease-in-out"
                    title="Refresh Complaints"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0110.804 5.397c.433-.174.922.023 1.05.462A1 1 0 0117 13v.003h-1.006A7.002 7.002 0 015.197 7.545a.999.999 0 01-1.05-.462 1 1 0 01.144-1.026v-.006a1 1 0 01.859-.444H5V3a1 1 0 011-1h1.5a1 1 0 01.954.712A8.98 8.98 0 0019 10a9 9 0 10-18 0 8.98 8.98 0 001.546 5.288 1 1 0 01-1.853.535A11.002 11.002 0 011 10a10 10 0 1120 0 10.002 10.002 0 01-1.55 5.767 1 1 0 01-1.853.535A8.98 8.98 0 0019 10a9 9 0 10-18 0 8.98 8.98 0 001.546 5.288 1 1 0 01-1.853.535A11.002 11.002 0 011 10a10 10 0 1120 0 10.002 10.002 0 01-1.55 5.767zM5 3v1.994H3V3a1 1 0 011-1h1.5z" clipRule="evenodd" />
                    </svg>
                </button>
                <button
                    onClick={onLogout}
                    className="px-4 py-2 text-sm font-medium text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition duration-150 ease-in-out"
                >
                    Logout
                </button>
            </div>
        </div>
    </header>
);

// --- Main Status Component ---
function Status() {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [popup, setPopup] = useState({ show: false, type: "", text: "" });
    const [imageModal, setImageModal] = useState({ show: false, imageUrl: '', title: '' });

    const navigate = useNavigate();
    const userName = localStorage.getItem("userName") || "Citizen"; // Placeholder for user name
    const userId = localStorage.getItem("userId");

    // --- Handlers ---
    const handleClosePopup = () => setPopup({ show: false, type: "", text: "" });

    const openImageModal = (imageUrl, title) => {
        setImageModal({ show: true, imageUrl, title });
    };

    const closeImageModal = () => {
        setImageModal({ show: false, imageUrl: '', title: '' });
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    const fetchComplaints = useCallback(async () => {
        if (!userId) {
            handleLogout();
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(
                `http://localhost:8080/api/users/complaints/history/${userId}`
            );

            if (!response.ok) throw new Error("Failed to fetch complaints.");

            const data = await response.json();
            setComplaints(data);
            setPopup({ show: false, type: "", text: "" }); // Clear any previous error popups on success
        } catch (err) {
            setPopup({
                show: true,
                type: "error",
                text: "Error fetching complaints: " + err.message,
            });
        } finally {
            setLoading(false);
        }
    }, [userId, navigate]);

    useEffect(() => {
        fetchComplaints();
    }, [fetchComplaints]);

    const getStatusClass = (status) => {
        const s = status ? status.toUpperCase() : 'PENDING';
        switch (s) {
            case "RESOLVED":
            case "AWAITING_APPROVAL":
                return "bg-green-600 text-white";
            case "IN_PROGRESS":
                return "bg-blue-600 text-white";
            default: // PENDING
                return "bg-yellow-500 text-gray-800";
        }
    };

    // --- Loading State ---
    if (loading && complaints.length === 0)
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="text-center text-xl font-semibold text-gray-700 p-10 bg-white rounded-lg shadow-xl">
                    Loading your complaint history...
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mt-4"></div>
                </div>
            </div>
        );

    return (
        // Main container: full height, flex column
        <div className="min-h-screen bg-gray-100 flex flex-col">
            {/* Sticky Header Component */}
            <StickyHeader
                userName={userName}
                onLogout={handleLogout}
                onRefresh={fetchComplaints}
                navigate={navigate}
            />
            {/* Popups (They should float over everything, including the sticky header) */}
            {popup.show && (
                <Popup type={popup.type} text={popup.text} onClose={handleClosePopup} />
            )}
            {imageModal.show && (
                <ImagePopup
                    imageUrl={imageModal.imageUrl}
                    title={imageModal.title}
                    onClose={closeImageModal}
                />
            )}
            
            {/* Main Content Area */}
            {/* This div will take the remaining height and contain the scrollable content */}
            <main className="flex-grow p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">

                {/* Complaint List Container - This is the scrollable area */}
                {complaints.length === 0 ? (
                    <div className="text-center text-xl text-gray-600 p-8 border border-dashed rounded-xl bg-white shadow-md">
                        You have not registered any complaints yet.{" "}
                        <Link to="/registerComplains" className="text-blue-600 underline hover:text-blue-800">
                            File your first one!
                        </Link>
                    </div>
                ) : (
                    // The actual list of complaints
                    <div className="space-y-6">
                        {complaints.map((c) => {
                            const messageToDisplay = c.message;
                            const hasBeforeImage = c.beforeImagePath;
                            const hasAfterImage = c.afterImagePath;
                            const hasWorkers = c.workers && c.workers.length > 0;

                            return (
                                <div
                                    key={c.complainId}
                                    className="p-6 border border-gray-200 rounded-xl bg-white shadow-lg hover:shadow-xl transition-shadow duration-300"
                                >
                                    <div className="flex justify-between items-start flex-wrap gap-3">
                                        <div className="space-y-1">
                                            <h3 className="text-xl font-bold text-gray-800">{c.title}</h3>
                                            <p className="text-sm text-gray-500">
                                                Filed on: {new Date(c.createdAt || Date.now()).toLocaleDateString()} | ID: <span className="font-mono text-xs">{c.complainId}</span>
                                            </p>
                                        </div>
                                        <span
                                            className={`px-3 py-1 text-sm font-bold rounded-full whitespace-nowrap ${getStatusClass(
                                                c.status
                                            )}`}
                                        >
                                            {c.status.replace(/_/g, ' ')}
                                        </span>
                                    </div>
                                    <p className="text-md text-gray-700 mt-3">{c.description}</p>
                                    <p className="text-sm text-gray-500 mt-2 italic">
                                        Location: {c.location}
                                    </p>

                                    {/* Display Admin Message */}
                                    {messageToDisplay && (
                                        <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded-md">
                                            <p className="text-xs font-semibold text-blue-800 mb-1">
                                                Department Update:
                                            </p>
                                            <p className="text-sm text-blue-700">{messageToDisplay}</p>
                                        </div>
                                    )}

                                    {/* Image Viewers and Workers */}
                                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-end flex-wrap gap-4">

                                        {/* Image Buttons */}
                                        <div className="flex space-x-3">
                                            {hasBeforeImage && (
                                                <button
                                                    onClick={() => openImageModal(
                                                        `${FILE_BASE_URL}/${c.beforeImagePath}`,
                                                        `Original Evidence (Before) for ID ${c.complainId}`
                                                    )}
                                                    className="px-3 py-1 text-xs text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition shadow-md"
                                                >
                                                    View Before Image
                                                </button>
                                            )}

                                            {hasAfterImage && (
                                                <button
                                                    onClick={() => openImageModal(
                                                        `${FILE_BASE_URL}/${c.afterImagePath}`,
                                                        `Resolution Evidence (After) for ID ${c.complainId}`
                                                    )}
                                                    className="px-3 py-1 text-xs text-white bg-green-500 rounded-lg hover:bg-green-600 transition shadow-md"
                                                >
                                                    View After Image
                                                </button>
                                            )}
                                        </div>

                                        {/* Workers Assigned Detail */}
                                        {hasWorkers && (
                                            <p className="text-xs text-gray-600">
                                                Assigned Workers:{" "}
                                                <span className="font-semibold text-teal-700">
                                                    {c.workers.map(w => w.name).join(', ')}
                                                </span>
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}

export default Status;