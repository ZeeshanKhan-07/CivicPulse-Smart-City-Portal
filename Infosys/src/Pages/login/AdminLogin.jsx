import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Use toast.promise for streamlined handling of loading, success, and error states
        const promise = fetch("http://localhost:8080/api/admin/login", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        })
        .then(async (response) => {
            const text = await response.text();

            if (response.ok && response.status === 200) {
                // Set Local Storage only on success
                localStorage.setItem("isLoggedIn", "true");
                localStorage.setItem("isAdmin", "true");
                localStorage.setItem("userEmail", email);
                
                // Delay navigation slightly to let the success toast appear
                setTimeout(() => navigate('/profile'), 1000);

                return 'Admin Login Successful! Redirecting...';
            } else if (response.status === 401) {
                throw new Error('Invalid email or password for Admin.');
            } else {
                throw new Error(text || 'Admin login failed.');
            }
        })
        .catch((error) => {
            // Re-throw the error so toast.promise handles the rejection
            throw error;
        });

        toast.promise(
            promise,
            {
                loading: 'Verifying Admin Credentials...',
                success: (message) => message,
                error: (error) => error.message,
            },
            {
                duration: 4000,
            }
        );
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-white p-4">
            
            <Toaster position="top-center" reverseOrder={false} />

            {/* DESIGN: Elevated Card with Teal/Dark Cyan Styling and Animation */}
            <div 
                className="max-w-md w-full p-8 bg-white border border-gray-100 shadow-xl rounded-2xl animate-fadeIn transform transition-all duration-700 ease-out"
                style={{ animationDelay: '200ms', animationFillMode: 'backwards' }}
            >
                {/* Admin Identifier */}
                <div className="text-center mb-10">
                    {/* Teal Accent Color */}
                    <h1 className="text-4xl font-extrabold text-teal-700 mb-2">Admin Portal</h1> 
                    <h2 className="text-xl font-semibold text-gray-800">Secure Access Required</h2>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <input
                        type="email"
                        placeholder="Admin Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        // Focus ring is teal
                        className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition duration-300 bg-white text-gray-800"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition duration-300 bg-white text-gray-800"
                        required
                    />
                    {/* Button with Admin Teal color theme */}
                    <button
                        type="submit"
                        className="w-full bg-teal-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-teal-700 transition duration-300 shadow-lg transform hover:scale-[1.01] focus:outline-none focus:ring-4 focus:ring-teal-300"
                    >
                        Secure Login
                    </button>
                </form>
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

export default AdminLogin;