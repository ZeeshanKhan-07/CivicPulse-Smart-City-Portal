import { useNavigate } from "react-router-dom";
import { useState } from "react";

function Dashboard() {
  const navigate = useNavigate();
  const userEmail = localStorage.getItem("userEmail") || "Guest";
  const [feedback, setFeedback] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");
    navigate("/login");
  };

  const handleFeedbackSubmit = () => {
    if (feedback.trim() === "") {
      alert("Please enter your feedback before submitting.");
      return;
    }
    alert(`Feedback submitted: ${feedback}`);
    setFeedback("");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navbar with project name */}
      <nav className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <h1 className="text-lg font-bold">
          CivicPulse – Smart City Grievance &amp; Feedback Management Portal
        </h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Logout
        </button>
      </nav>

      {/* Dashboard Content */}
      <div className="flex-grow flex flex-col items-center justify-center p-6">
        <h2 className="text-2xl font-bold mb-6">Welcome, {userEmail} 🎉</h2>

        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Write your feedback here..."
          className="w-full max-w-lg p-4 border border-gray-300 rounded-lg bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200"
          rows="5"
        ></textarea>

        <button
          onClick={handleFeedbackSubmit}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Submit Feedback
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
