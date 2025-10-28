import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  Navigate,
  Outlet,
} from "react-router-dom";
import "./App.css";

// Import all required pages
import Login from "./Pages/login/Login";
import Signup from "./Pages/login/Signup";
import AdminLogin from "./Pages/login/AdminLogin";
import RegisterComplains from "./Pages/RegisterComplains";
import Status from "./Pages/Status";
import ComplaintsDashboard from "./Pages/ComplaintsDashboard";
import HomePage from "./Pages/Home";
import UserProfile from "./Pages/UserProfile";
import AdminProfile from "./Pages/AdminProfile"; // Ensure this is imported
import DepartmentDashboard from "./Pages/DepartmentDashboard";
import DepartmentLogin from "./Pages/DepartmentLogin";

// --- Private Route Component (Updated) ---
const PrivateRoute = ({ isAdminRoute }) => {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  // 1. If not logged in, redirect to login page.
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // 2. If accessing an Admin route but not an Admin, redirect to user dashboard.
  if (isAdminRoute && !isAdmin) {
    return <Navigate to="/user-dashboard" replace />;
  }

  // 3. If accessing a User route but is an Admin, redirect to admin dashboard.
  if (!isAdminRoute && isAdmin) {
    return <Navigate to="/admin-dashboard" replace />;
  }

  // Pass control to the nested route
  return <Outlet />;
};
// ------------------------------------------------------------------

function App() {
  const location = useLocation();

  // Note: Removed the unused isProtectedOrAuthPage variable.

  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        {/* 1. Public Routes (Auth Pages) */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/adminLogin" element={<AdminLogin />} />
        <Route path="/departmentLogin" element={<DepartmentLogin />} />

        {/* Dashboard Page - Secured by localStorage check inside the component */}
        <Route path="/dashboard/:deptId" element={<DepartmentDashboard />} />

        {/* 2. User Protected Routes */}
        <Route element={<PrivateRoute isAdminRoute={false} />}>
          {/* NEW PATH: Consolidated user profile/dashboard access */}
          <Route path="/user-profile" element={<UserProfile />} />
          <Route path="/registerComplains" element={<RegisterComplains />} />
          <Route path="/status" element={<Status />} />
          {/* Aliases/redirects for consistency */}
          <Route path="/user-dashboard" element={<UserProfile />} />
        </Route>

        {/* 3. Admin Protected Routes */}
        <Route element={<PrivateRoute isAdminRoute={true} />}>
          {/* NEW PATH: Consolidated admin profile/dashboard access */}
          <Route path="/admin-profile" element={<AdminProfile />} />
          <Route path="/complaints" element={<ComplaintsDashboard />} />
          {/* Aliases/redirects for consistency */}
          <Route path="/admin-dashboard" element={<AdminProfile />} />
        </Route>

        {/* 4. Catch-all: Redirect any stray /profile attempts to the correct dashboard */}
        <Route
          path="/profile"
          element={
            localStorage.getItem("isAdmin") === "true" ? (
              <Navigate to="/admin-profile" replace />
            ) : (
              <Navigate to="/user-profile" replace />
            )
          }
        />

        {/* 5. Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}
