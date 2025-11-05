import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = ({ isAdminRoute }) => {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const isAdmin = localStorage.getItem("isAdmin") === "true";
    if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (isAdminRoute && !isAdmin) {
    return <Navigate to="/user-profile" replace />;
  }

  if (!isAdminRoute && isAdmin) {
    return <Navigate to="/admin-profile" replace />;
  }
  
  return <Outlet />;
};

export default PrivateRoute;