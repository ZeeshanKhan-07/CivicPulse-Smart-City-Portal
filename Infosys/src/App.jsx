import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation, // Correctly placed inside the Router context now
} from "react-router-dom";
import "./App.css";

// Import all required pages and components
import Login from "./Pages/login/Login";
import Signup from "./Pages/login/Signup";
import AdminLogin from "./Pages/login/AdminLogin";
import RegisterComplains from "./Pages/RegisterComplains";
import Status from "./Pages/Status";
import ComplaintsDashboard from "./Pages/ComplaintsDashboard";
import HomePage from "./Pages/Home";
import UserProfile from "./Pages/UserProfile";
import AdminProfile from "./Pages/AdminProfile";
import DepartmentDashboard from "./Pages/DepartmentDashboard";
import DepartmentLogin from "./Pages/DepartmentLogin";
import PrivateRoute from "./Components/PrivateRoute";
import { Toaster } from "react-hot-toast";

// The App component must be inside the Router to use routing hooks
function App() {
  // useLocation is now valid as App is rendered within Router in AppWrapper
  const location = useLocation(); 

  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        
        {/* 1. Public Routes (Auth Pages) */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/adminLogin" element={<AdminLogin />} />
        <Route path="/departmentLogin" element={<DepartmentLogin />} />

        {/* Department Dashboard - Assuming the logic for department access is handled internally 
            and doesn't require the Admin/User PrivateRoute logic. */}
        <Route path="/dashboard/:deptId" element={<DepartmentDashboard />} />

        {/* 2. User Protected Routes (isAdminRoute={false}) */}
        <Route element={<PrivateRoute isAdminRoute={false} />}>
          {/* Default user dashboard/profile */}
          <Route path="/user-profile" element={<UserProfile />} />
          <Route path="/registerComplains" element={<RegisterComplains />} />
          <Route path="/status" element={<Status />} />
          {/* Alias/redirect: /user-dashboard redirects to /user-profile */}
          <Route path="/user-dashboard" element={<Navigate to="/user-profile" replace />} />
        </Route>

        {/* 3. Admin Protected Routes (isAdminRoute={true}) */}
        <Route element={<PrivateRoute isAdminRoute={true} />}>
          {/* Default admin dashboard/profile */}
          <Route path="/admin-profile" element={<AdminProfile />} />
          <Route path="/complaints" element={<ComplaintsDashboard />} />
          {/* Alias/redirect: /admin-dashboard redirects to /admin-profile */}
          <Route path="/admin-dashboard" element={<Navigate to="/admin-profile" replace />} />
        </Route>

        {/* 4. Root /profile Redirection */}
        {/* This handles direct access to /profile, redirecting based on the user's role */}
        <Route
          path="/profile"
          element={
            localStorage.getItem("isLoggedIn") === "true" ? (
              // User is logged in, redirect to the appropriate profile
              localStorage.getItem("isAdmin") === "true" ? (
                <Navigate to="/admin-profile" replace />
              ) : (
                <Navigate to="/user-profile" replace />
              )
            ) : (
              // Not logged in, redirect to login page
              <Navigate to="/login" replace />
            )
          }
        />

        {/* 5. Fallback Route: Catch-all for unknown paths */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

// Export the wrapper function which contains the Router
// This is what should be rendered in your main.jsx/main.tsx file.
export default function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}