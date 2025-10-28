import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { gsap } from 'gsap'; // Import GSAP

const categories = [
    "Road Damage (Potholes, Cracks)",
    "Water Leakage / Supply Issue",
    "Solid Waste / Garbage Overflow",
    "Street Light Outage",
    "Illegal Dumping / Encroachment",
    "Sewer / Drainage Blockage",
    "Public Safety Hazard (Fallen Trees, Wires)",
    "Park / Public Area Maintenance",
    "Noise Pollution",
    "Other Infrastructure Issue"
];

function RegisterComplains() {
    const navigate = useNavigate();
    const userId = localStorage.getItem('userId');
    const userEmail = localStorage.getItem('userEmail');

    // Refs for GSAP animations
    const containerRef = useRef(null);
    // Use a single ref for all animatable elements in the form for simpler staggering
    const animatableElementsRef = useRef([]);

    // GSAP ANIMATIONS
    useEffect(() => {
        // Clear previous refs to prevent duplicates on re-renders (important for stagger)
        animatableElementsRef.current = [];

        // Main container animation
        gsap.fromTo(containerRef.current,
            { opacity: 0, scale: 0.98, y: 20 },
            { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: "power3.out" }
        );

        // Staggered animation for all collected input/select/textarea/label elements
        gsap.from(animatableElementsRef.current, {
            opacity: 0,
            y: -20, // Animate from top to bottom
            duration: 0.6,
            stagger: 0.1, // Stagger the animation
            ease: "back.out(1.2)", // More playful bounce
            delay: 0.4 // Start slightly after the container
        });

    }, []);

    // Check if the user is logged in
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setForm(prev => ({ ...prev, image: e.target.files[0] }));
    };

    const handleLogout = () => {
        gsap.to(containerRef.current, { opacity: 0, y: -50, duration: 0.5, onComplete: () => {
            localStorage.clear();
            navigate('/login');
        }});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const submitButton = e.currentTarget.querySelector('.submit-btn');
        gsap.to(submitButton, { scale: 0.96, duration: 0.1, yoyo: true, repeat: 1, ease: "power1.inOut" });


        const formData = new FormData();
        formData.append('userId', userId);
        formData.append('title', form.title);
        formData.append('category', form.category);
        formData.append('description', form.description);
        formData.append('location', form.location);
        if (form.image) {
            formData.append('image', form.image);
        }

        const submissionPromise = fetch("http://localhost:8080/api/users/complain/raise", {
            method: 'POST',
            body: formData,
        });

        await toast.promise(
            submissionPromise,
            {
                loading: 'Submitting complaint...',
                success: async (response) => {
                    if (response.ok) {
                        setForm({ title: '', category: categories[0], description: '', location: '', image: null });
                        document.getElementById('file-input').value = null;

                        const text = await response.text();

                        gsap.to(containerRef.current, { opacity: 0, y: -50, duration: 0.5, delay: 1, onComplete: () => {
                            navigate('/status');
                        }});

                        return `Complaint Registered! ${text.split('.')[0]}`;
                    } else {
                        const errorText = await response.text();
                        throw new Error(errorText || `Submission failed with status: ${response.status}`);
                    }
                },
                error: (err) => {
                    return `Error: ${err.message || 'Failed to connect to server.'}`;
                },
            }
        );
    };

    // Helper to dynamically add ref to elements for staggering
    const addAnimatableRef = (el) => {
        if (el && !animatableElementsRef.current.includes(el)) {
            animatableElementsRef.current.push(el);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 py-10 px-4"> {/* Reverted to light gray background */}
            <Toaster position="top-center" reverseOrder={false} />

            <div ref={containerRef} className="max-w-4xl w-full p-10 bg-white shadow-2xl rounded-2xl border-t-8 border-indigo-600"> {/* White background, less blur */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-gray-200 pb-4">
                    <div className="flex flex-col mb-4 md:mb-0">
                        <h2 className="text-4xl font-extrabold text-indigo-700">
                            Report Civic Issue 🚨
                        </h2>
                        <p className="text-md text-gray-500 mt-1">Lodge a complaint to the municipal corporation.</p>
                    </div>
                    <div className="flex flex-col items-start md:items-end space-y-2 pt-1">
                         <p className="text-sm text-gray-600">Logged in as: <span className="font-semibold text-indigo-700">{userEmail}</span></p>
                         <div className="flex space-x-3">
                            <Link to="/status" className="px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-600 rounded-xl hover:bg-indigo-50 transition-colors duration-200">
                                📈 Track Status
                            </Link>
                            <button onClick={handleLogout} className="px-4 py-2 text-sm font-medium bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors duration-200">
                                Logout
                            </button>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Complaint Title */}
                    <div ref={addAnimatableRef} className="block"> {/* Added ref here */}
                        <span className="text-gray-700 font-bold text-sm mb-1 block">Complaint Title (Mandatory)</span>
                        <input
                            type="text"
                            name="title"
                            placeholder="e.g., Large Pothole on Main Street near Bank"
                            value={form.title}
                            onChange={handleChange}
                            className="mt-1 block w-full p-3 border border-gray-300 rounded-xl bg-gray-50 placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Category */}
                        <div ref={addAnimatableRef} className="block"> {/* Added ref here */}
                            <span className="text-gray-700 font-bold text-sm mb-1 block">Category (Mandatory)</span>
                            <select
                                name="category"
                                value={form.category}
                                onChange={handleChange}
                                className="mt-1 block w-full p-3 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 bg-white cursor-pointer appearance-none pr-10 transition-all duration-200"
                                required
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* Location / Address */}
                        <div ref={addAnimatableRef} className="block"> {/* Added ref here */}
                            <span className="text-gray-700 font-bold text-sm mb-1 block">Location / Address (Mandatory)</span>
                            <input
                                type="text"
                                name="location"
                                placeholder="e.g., 45B, Gandhi Road, Sector 3"
                                value={form.location}
                                onChange={handleChange}
                                className="mt-1 block w-full p-3 border border-gray-300 rounded-xl bg-gray-50 placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                                required
                            />
                        </div>
                    </div>

                    {/* Detailed Description */}
                    <div ref={addAnimatableRef} className="block"> {/* Added ref here */}
                        <span className="text-gray-700 font-bold text-sm mb-1 block">Detailed Description (Mandatory)</span>
                        <textarea
                            name="description"
                            placeholder="Provide detailed information: size, severity, time of day noticed, etc."
                            value={form.description}
                            onChange={handleChange}
                            rows="5"
                            className="mt-1 block w-full p-3 border border-gray-300 rounded-xl bg-gray-50 placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-all duration-200"
                            required
                        ></textarea>
                    </div>

                    {/* Image Upload */}
                    <div ref={addAnimatableRef} className="block"> {/* Added ref here */}
                        <label className="p-5 border-2 border-dashed border-indigo-300 rounded-xl bg-indigo-50 hover:bg-indigo-100 cursor-pointer transition-colors duration-300 flex flex-col items-center justify-center">
                            <span className="text-indigo-700 font-bold flex items-center justify-center text-lg mb-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>
                                Upload Supporting Image (Optional)
                            </span>
                            <input type="file" id="file-input" name="image" accept="image/*" onChange={handleFileChange} className="hidden" />
                            <p className="text-sm text-gray-600 text-center">
                                {form.image ?
                                    <span className="font-medium text-indigo-700">✅ File Selected: {form.image.name}</span>
                                    :
                                    'Click anywhere in this box to select a photo of the issue (Max 5MB).'
                                }
                            </p>
                        </label>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="submit-btn w-full bg-indigo-600 text-white py-4 rounded-xl text-xl font-bold hover:bg-indigo-700 transition duration-300 shadow-xl shadow-indigo-200 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50"
                    >
                        🚀 Submit New Complaint
                    </button>
                </form>
            </div>
        </div>
    );
}

export default RegisterComplains;