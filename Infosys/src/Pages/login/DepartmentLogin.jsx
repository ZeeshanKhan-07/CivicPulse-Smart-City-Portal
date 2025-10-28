import { useState } from "react";
import { Toaster } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

const DepartmentLogin = () => {
    const [form, setForm] = useState({ 
        email: '', 
        password: '', 
        department: '' // Add department to form state
    });
    
    const navigate = useNavigate();

    // List of departments
    const departments = [
        { id: 1, name: 'Water Department' },
        { id: 2, name: 'Road Department' },
        { id: 3, name: 'Electricity Department' },
        { id: 4, name: 'Sanitation Department' },
        { id: 5, name: 'Public Works Department' }
    ];

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.department) {
            toast.error('Please select a department');
            return;
        }

        const promise = fetch('http://localhost:8080/api/departments/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        })
            .then(async (response) => {
                const text = await response.text();

                if (!response.ok) {
                    throw new Error(text || 'Invalid credentials. Please try again.');
                }

                const idMatch = text.match(/UserID:(\d+)/);
                const userId = idMatch ? idMatch[1] : null;

                if (!userId) {
                    throw new Error('Login failed: User ID not received.');
                }

                // Set Local Storage with department info
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userEmail', form.email);
                localStorage.setItem('userId', userId);
                localStorage.setItem('department', form.department);
                localStorage.setItem('isDepartment', 'true');

                setTimeout(() => {
                    navigate('/department-dashboard');
                }, 1000);

                return 'Login Successful! Redirecting...';
            })
            .catch((error) => {
                throw error;
            });

        toast.promise(
            promise,
            {
                loading: 'Logging in...',
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

            <div className="max-w-md w-full p-8 bg-white border border-gray-100 shadow-xl rounded-2xl animate-fadeIn">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-blue-600 mb-2">CivicPulse</h1>
                    <h2 className="text-xl font-semibold text-gray-800">Department Login</h2>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Department Dropdown */}
                    <select
                        name="department"
                        onChange={handleChange}
                        value={form.department}
                        className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 bg-white text-gray-800"
                        required
                    >
                        <option value="">Select Department</option>
                        {departments.map((dept) => (
                            <option key={dept.id} value={dept.name}>
                                {dept.name}
                            </option>
                        ))}
                    </select>

                    <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        onChange={handleChange}
                        className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 bg-white text-gray-800"
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        onChange={handleChange}
                        className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 bg-white text-gray-800"
                        required
                    />
                    
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition duration-300 shadow-lg transform hover:scale-[1.01] focus:outline-none focus:ring-4 focus:ring-blue-300"
                    >
                        Login as Department
                    </button>
                </form>
                
                <div className="mt-8 text-center text-sm">
                    <Link to="/" className="text-blue-600 hover:text-blue-700 hover:underline font-bold">
                        Back to Home!
                    </Link>
                </div>
            </div>

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

export default DepartmentLogin;