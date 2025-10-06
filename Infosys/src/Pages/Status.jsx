import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Popup from "../Components/Popup";

function Status() {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [popup, setPopup] = useState({ show: false, type: "", text: "" });
    const navigate = useNavigate();
    const userId = localStorage.getItem('userId');

    const handleClosePopup = () => setPopup({ show: false, type: "", text: "" });

    const fetchComplaints = useCallback(async () => {
        if (!userId) {
            localStorage.clear();
            navigate('/login');
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/api/users/complaints/history/${userId}`);
            
            if (!response.ok) throw new Error('Failed to fetch complaints.');

            const data = await response.json();
            setComplaints(data);
        } catch (err) {
            setPopup({ show: true, type: "error", text: 'Error fetching complaints: ' + err.message });
        } finally {
            setLoading(false);
        }
    }, [userId, navigate]);

    useEffect(() => {
        fetchComplaints();
    }, [fetchComplaints]);
    
    const getStatusClass = (status) => {
        switch (status) {
            case 'Resolved': return 'bg-green-500 text-white';
            case 'In Progress': return 'bg-blue-500 text-white';
            default: return 'bg-yellow-500 text-gray-800';
        }
    };
    
    if (loading) return <div className="text-center mt-20 text-2xl font-semibold text-gray-700">Loading your complaint history...</div>;

    return (
        <div className="max-w-4xl mx-auto p-8 mt-6 bg-white shadow-2xl rounded-2xl">
            {popup.show && <Popup type={popup.type} text={popup.text} onClose={handleClosePopup} />}
            
            <div className="flex justify-between items-center mb-8 border-b pb-3">
                <h2 className="text-3xl font-bold text-blue-700">My Complaint Status Tracker</h2>
                <div className="flex space-x-3">
                    <Link to="/registerComplains" className="px-4 py-2 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50">New Complaint</Link>
                    <button onClick={fetchComplaints} className="px-4 py-2 text-sm bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Refresh</button>
                </div>
            </div>

            {complaints.length === 0 ? (
                <p className="text-center text-xl text-gray-600 p-8 border border-dashed rounded-lg">
                    You have not registered any complaints yet. <Link to="/registerComplains" className="text-blue-600 underline">File your first one!</Link>
                </p>
            ) : (
                <div className="space-y-5">
                    {complaints.map((c) => (
                        <div key={c.complainId} className="p-5 border border-gray-200 rounded-xl bg-gray-50 hover:shadow-lg transition-shadow duration-300">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold text-gray-800">{c.title}</h3>
                                    <p className="text-sm text-gray-500">Filed on: {new Date().toLocaleDateString()} | ID: {c.complainId}</p>
                                </div>
                                <span className={`px-4 py-1 text-sm font-bold rounded-full shadow-md ${getStatusClass(c.status)}`}>
                                    {c.status}
                                </span>
                            </div>
                            <p className="text-md text-gray-700 mt-3">{c.description}</p>
                            <p className="text-sm text-gray-500 mt-2 italic">Location: {c.location}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Status;