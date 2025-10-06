import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast'; // 1. Import toast and Toaster
// import Popup from "../Components/Popup"; // 2. Remove Popup import

const categories = ["Road Damage", "Water Supply", "Waste Management", "Public Safety", "Other"];

function RegisterComplains() {
    const navigate = useNavigate();
    const userId = localStorage.getItem('userId');
    // 3. Remove the popup state and handler as they are no longer needed
    // const [popup, setPopup] = useState({ show: false, type: "", text: "" });
    // const handleClosePopup = () => setPopup({ show: false, type: "", text: "" });

    if (!userId) {
        navigate('/login');
        return null;
    }

    const [form, setForm] = useState({
        title: '',
        category: categories[0],
        description: '',
        location: '',
        image: null,
    });
    
    // const handleClosePopup = () => setPopup({ show: false, type: "", text: "" }); // Remove this

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setForm(prev => ({ ...prev, image: e.target.files[0] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('userId', userId);
        formData.append('title', form.title);
        formData.append('category', form.category);
        formData.append('description', form.description);
        formData.append('location', form.location);
        if (form.image) {
            formData.append('image', form.image);
        }

        try {
            // Display a loading toast while the complaint is being submitted
            const submissionPromise = fetch("http://localhost:8080/api/users/complain/raise", {
                method: 'POST',
                body: formData,
            });

            await toast.promise(
                submissionPromise,
                {
                    loading: 'Submitting complaint...',
                    success: (response) => {
                        // This logic runs if the fetch is successful
                        if (response.ok) {
                            // Clear form after successful submission
                            setForm({ title: '', category: categories[0], description: '', location: '', image: null });
                            document.getElementById('file-input').value = null; // Reset file input
                            
                             setTimeout(() => {
                                navigate('/status');
                            }, 1500);
                            
                            // Return the success message for the toast
                            return 'Complaint Registered successfully!';
                        } else {
                            // Throw an error to trigger the 'error' toast state
                            throw new Error('Submission failed with status: ' + response.status);
                        }
                    },
                    error: (err) => {
                        // This logic runs if the fetch fails or an error is thrown in 'success'
                        console.error("Submission Error:", err);
                        return `Error: Submission failed. ${err.message || ''}`;
                    },
                }
            );

        } catch (error) {
            // Note: The toast.promise handles the primary network/API errors, 
            // but a final catch is good practice, though rarely hit when using toast.promise correctly.
            console.error("Toast Promise Catch:", error);
            // If you need a fallback toast for errors outside of the promise chain:
            // toast.error('An unexpected error occurred.'); 
        }
    };
    
    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div className="min-h-screen flex justify-center bg-gray-100 py-10">
            {/* 4. Add the Toaster component */}
            <Toaster position="top-center" reverseOrder={false} /> 

            {/* {popup.show && <Popup type={popup.type} text={popup.text} onClose={handleClosePopup} />} Removed Popup */}

            <div className="max-w-3xl w-full p-8 bg-white shadow-2xl rounded-2xl">
                <div className="flex justify-between items-center mb-6 border-b pb-3">
                    <h2 className="text-3xl font-bold text-blue-700">Municipal Complaint Form</h2>
                    <div className="flex space-x-3">
                        <Link to="/status" className="px-4 py-2 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50">Track Status</Link>
                        <button onClick={handleLogout} className="px-4 py-2 text-sm bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Logout</button>
                    </div>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                    
                    <label className="block">
                        <span className="text-gray-700 font-medium">Complaint Title</span>
                        <input type="text" name="title" placeholder="Brief summary of the issue" value={form.title} onChange={handleChange} className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" required />
                    </label>

                    <div className="grid grid-cols-2 gap-4">
                        <label className="block">
                            <span className="text-gray-700 font-medium">Category</span>
                            <select name="category" value={form.category} onChange={handleChange} className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white" required>
                                {categories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                            </select>
                        </label>
                        <label className="block">
                            <span className="text-gray-700 font-medium">Location / Address</span>
                            <input type="text" name="location" placeholder="Specific address of the problem" value={form.location} onChange={handleChange} className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" required />
                        </label>
                    </div>

                    <label className="block">
                        <span className="text-gray-700 font-medium">Detailed Description</span>
                        <textarea name="description" placeholder="Provide details, dates, and severity." value={form.description} onChange={handleChange} rows="4" className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-none" required></textarea>
                    </label>
                    
                    <label className="block p-4 border border-dashed border-gray-400 rounded-lg bg-blue-50 hover:bg-blue-100 cursor-pointer">
                        <span className="text-blue-700 font-medium flex items-center mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>
                            Upload Supporting Image (Optional)
                        </span>
                        <input type="file" id="file-input" name="image" accept="image/*" onChange={handleFileChange} className="hidden" />
                        <p className="text-sm text-gray-600">{form.image ? form.image.name : 'Click to select file or drag it here (Max 5MB).'}</p>
                    </label>
                    
                    <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 shadow-lg transform hover:scale-[1.01]">
                        Submit Complaint
                    </button>
                </form>
            </div>
        </div>
    );
}

export default RegisterComplains;