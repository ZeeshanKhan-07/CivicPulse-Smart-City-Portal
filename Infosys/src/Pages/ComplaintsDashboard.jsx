import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
// Use react-hot-toast for cleaner, faster notifications
import toast, { Toaster } from 'react-hot-toast'; 

const API_BASE_URL = 'http://localhost:8080/api/admin/complaints';
const FILE_BASE_URL = 'http://localhost:8080/api/files/download'; 

// Define the available status filters
const STATUS_FILTERS = {
    PENDING: 'Pending',
    IN_PROGRESS: 'In Progress',
    RESOLVED: 'Resolved',
    ALL_OPEN: 'Open', // Custom filter for Pending/In Progress
};

function ComplaintsDashboard() {
    const [allComplaints, setAllComplaints] = useState([]); // Stores the complete, unfiltered list
    const [loading, setLoading] = useState(true);
    // NEW STATE: Tracks the currently active filter button
    const [activeFilter, setActiveFilter] = useState(STATUS_FILTERS.ALL_OPEN); 
    const [imageModal, setImageModal] = useState({ show: false, imageUrl: '' });
    const navigate = useNavigate();

    // Handlers for image modal
    const openImageModal = (imageUrl) => {
        setImageModal({ show: true, imageUrl });
    };

    const closeImageModal = () => {
        setImageModal({ show: false, imageUrl: '' });
    };

    const fetchComplaints = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(API_BASE_URL);
            if (!response.ok) throw new Error('Failed to fetch complaints.');
            const data = await response.json();
            setAllComplaints(data);
            
        } catch (error) {
            toast.error('Error fetching complaints: ' + error.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Protect route: Redirect if not admin
        if (localStorage.getItem('isAdmin') !== 'true') {
            navigate('/adminLogin');
            return;
        }
        fetchComplaints();
    }, [fetchComplaints, navigate]);

    const handleStatusUpdate = async (complainId, newStatus) => {
        const loadingToastId = toast.loading(`Updating complaint ${complainId} to ${newStatus}...`);
        
        try {
            const response = await fetch(`${API_BASE_URL}/${complainId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) throw new Error('Status update failed.');
            
            toast.success(`Complaint ID ${complainId} updated to ${newStatus}.`, { id: loadingToastId });
            fetchComplaints(); // Refresh the list
            
        } catch (error) {
            toast.error(`Failed to update status: ${error.message}`, { id: loadingToastId });
        }
    };
    
    const handleLogout = () => {
        localStorage.clear();
        navigate('/adminLogin');
    };

    const getStatusClass = (status) => {
        switch (status) {
            case STATUS_FILTERS.RESOLVED: return 'bg-green-600 border-green-700';
            case STATUS_FILTERS.IN_PROGRESS: return 'bg-blue-600 border-blue-700';
            default: return 'bg-yellow-600 border-yellow-700';
        }
    };

    // FILTER LOGIC: Filters complaints based on the activeFilter state
    const filteredComplaints = allComplaints.filter(c => {
        if (activeFilter === STATUS_FILTERS.ALL_OPEN) {
            // Show Pending and In Progress complaints
            return c.status !== STATUS_FILTERS.RESOLVED; 
        }
        return c.status === activeFilter;
    });

    // Button Styling Helper
    const getFilterButtonClass = (filter) => {
        const base = "px-4 py-2 rounded-full font-semibold text-sm transition-colors duration-200 shadow-md";
        if (activeFilter === filter) {
            // Active button style
            if (filter === STATUS_FILTERS.RESOLVED) return `${base} bg-green-700 text-white`;
            if (filter === STATUS_FILTERS.IN_PROGRESS) return `${base} bg-blue-700 text-white`;
            return `${base} bg-yellow-700 text-white`; // Pending/Open
        } else {
            // Inactive button style
            return `${base} bg-gray-200 text-gray-700 hover:bg-gray-300`;
        }
    };

    if (loading) return <div className="text-center mt-20 text-2xl font-semibold text-gray-700">Loading Admin Dashboard...</div>;

    return (
        <div className="min-h-screen bg-gray-100 py-4">
            <Toaster position="top-center" reverseOrder={false} />

            {/* NEW: Image Modal Popup */}
            {imageModal.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4" onClick={closeImageModal}>
                    <div className="relative max-w-4xl max-h-[90vh] w-full bg-white rounded-lg shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <button 
                            onClick={closeImageModal} 
                            className="absolute top-3 right-3 p-2 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors z-10"
                            aria-label="Close image"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <img 
                            src={imageModal.imageUrl} 
                            alt="Full size complaint evidence" 
                            className="w-full h-full object-contain"
                            onError={(e) => { e.target.onerror = null; e.target.src="https://via.placeholder.com/600x400?text=Image+Load+Error"; }}
                        />
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto p-4 md:p-8 bg-white shadow-2xl rounded-2xl">
                
                {/* Header & Controls */}
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-3xl font-extrabold text-teal-700">Complaint Review Center</h2>
                    <div className="flex space-x-3">
                        <button onClick={fetchComplaints} className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-700 font-medium transition">Refresh</button>
                        <button onClick={handleLogout} className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 font-medium transition">Logout</button>
                    </div>
                </div>

                {/* Status Filter Buttons */}
                <div className="flex justify-start space-x-3 mb-6 flex-wrap">
                    <button 
                        onClick={() => setActiveFilter(STATUS_FILTERS.ALL_OPEN)}
                        className={getFilterButtonClass(STATUS_FILTERS.ALL_OPEN)}
                    >
                        Pending/Open ({allComplaints.filter(c => c.status !== STATUS_FILTERS.RESOLVED).length})
                    </button>
                    <button 
                        onClick={() => setActiveFilter(STATUS_FILTERS.IN_PROGRESS)}
                        className={getFilterButtonClass(STATUS_FILTERS.IN_PROGRESS)}
                    >
                        In Progress ({allComplaints.filter(c => c.status === STATUS_FILTERS.IN_PROGRESS).length})
                    </button>
                    <button 
                        onClick={() => setActiveFilter(STATUS_FILTERS.RESOLVED)}
                        className={getFilterButtonClass(STATUS_FILTERS.RESOLVED)}
                    >
                        Resolved ({allComplaints.filter(c => c.status === STATUS_FILTERS.RESOLVED).length})
                    </button>
                </div>

                {/* Complaint List Display */}
                {filteredComplaints.length === 0 ? (
                    <p className="text-center text-xl text-gray-600 p-12 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                        No {activeFilter.toLowerCase()} complaints found. 🎉
                    </p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredComplaints.map((c) => (
                            <div key={c.complainId} className="p-5 border border-gray-200 rounded-xl bg-white shadow-lg transition-shadow duration-300 flex flex-col justify-between">
                                <div>
                                    {/* Complaint Header */}
                                    <div className="flex justify-between items-start mb-3 pb-2 border-b">
                                        <h3 className="text-base font-extrabold text-gray-900">ID #{c.complainId} - {c.title}</h3>
                                        <span className={`px-2 py-0.5 text-xs font-bold text-white rounded-full ${getStatusClass(c.status)}`}>
                                            {c.status}
                                        </span>
                                    </div>
                                    
                                    {/* Details */}
                                    <p className="text-sm font-medium mb-1 text-gray-700">Category: {c.category}</p>
                                    <p className="text-xs text-gray-500 italic mb-2">User: {c.userEmail}</p>
                                    <p className="text-xs text-gray-500 mb-3">Location: {c.location}</p>
                                    <p className="text-sm text-gray-700 mb-4 line-clamp-3 h-[4.5em]">{c.description}</p>
                                    
                                    {/* Image Preview */}
                                    {c.imagePath && (
                                        <div className="mt-3">
                                            <img 
                                                src={`${FILE_BASE_URL}/${c.imagePath}`} 
                                                alt={`Evidence for Complaint ${c.complainId}`}
                                                className="w-full h-32 object-cover rounded-lg border border-gray-300 cursor-pointer hover:opacity-80 transition-opacity"
                                                onClick={() => openImageModal(`${FILE_BASE_URL}/${c.imagePath}`)}
                                                onError={(e) => { e.target.onerror = null; e.target.src="https://via.placeholder.com/150?text=No+Image+Found"; }}
                                            />
                                        </div>
                                    )}
                                </div>
                                
                                {/* Status Update Buttons */}
                                <div className="flex space-x-2 pt-4 border-t mt-4">
                                    <button 
                                        onClick={() => handleStatusUpdate(c.complainId, STATUS_FILTERS.IN_PROGRESS)} 
                                        className="flex-1 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-50" 
                                        disabled={c.status === STATUS_FILTERS.RESOLVED || c.status === STATUS_FILTERS.IN_PROGRESS}
                                    >
                                        Mark In Progress
                                    </button>
                                    <button 
                                        onClick={() => handleStatusUpdate(c.complainId, STATUS_FILTERS.RESOLVED)} 
                                        className="flex-1 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 disabled:opacity-50" 
                                        disabled={c.status === STATUS_FILTERS.RESOLVED}
                                    >
                                        Mark Resolved
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ComplaintsDashboard;