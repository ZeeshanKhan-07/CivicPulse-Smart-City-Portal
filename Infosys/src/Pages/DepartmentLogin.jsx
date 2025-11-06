import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginDepartment, getAllDepartmentNames } from "../api/DepartmentAPI";
import toast, { Toaster } from "react-hot-toast";

const DeptLogin = () => {
  const [formData, setFormData] = useState({
    departmentName: "",
    adminEmail: "",
    password: "",
  });
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFetchingDepts, setIsFetchingDepts] = useState(true);
  const navigate = useNavigate();

  const PRIMARY_GREEN = "#00A859";

  useEffect(() => {
    const fetchNames = async () => {
      try {
        const data = await getAllDepartmentNames();
        setDepartments(data);
      } catch (error) {
        toast.error("Failed to load departments.");
      } finally {
        setIsFetchingDepts(false);
      }
    };
    fetchNames();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.departmentName) {
      toast.error("Please select a department.");
      return;
    }

    setLoading(true);

    try {
      const deptId = await loginDepartment(formData);
      if (deptId) {
        toast.success("Login successful! Redirecting...");
        navigate(`/dashboard/${deptId}`);
      }
    } catch (err) {
      const errorMessage =
        err?.message || "An unexpected error occurred during login.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isButtonDisabled = loading || !formData.departmentName || isFetchingDepts;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 sm:p-10">
        <h2 className="text-center text-3xl font-extrabold text-gray-800 mb-8">
          Department Officer Login
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Department Dropdown */}
          <div>
            <label
              htmlFor="departmentName"
              className="block text-sm font-semibold text-gray-700"
            >
              Department
            </label>
            <select
              id="departmentName"
              name="departmentName"
              required
              value={formData.departmentName}
              onChange={handleChange}
              disabled={isFetchingDepts}
              className={`mt-2 outline-none w-full px-4 py-3 rounded-lg border ${
                formData.departmentName
                  ? "border-green-500"
                  : "border-gray-300"
              } text-gray-700 outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-150 disabled:bg-gray-100`}
            >
              <option value="" disabled>
                {isFetchingDepts
                  ? "Loading departments..."
                  : "--- Select Department ---"}
              </option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.name}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {/* Email Field */}
          <div>
            <label
              htmlFor="adminEmail"
              className="block text-sm font-semibold text-gray-700"
            >
              Officer Email
            </label>
            <input
              id="adminEmail"
              name="adminEmail"
              type="email"
              required
              placeholder="Enter your email"
              value={formData.adminEmail}
              onChange={handleChange}
              className="mt-2 w-full px-4 py-3 outline-none border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-150 placeholder-gray-400"
            />
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              className="mt-2 w-full outline-none px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-150 placeholder-gray-400"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isButtonDisabled}
              className={`w-full py-3 px-4 text-lg font-semibold rounded-lg shadow-md transition duration-200 ${
                isButtonDisabled
                  ? "bg-green-400 cursor-not-allowed opacity-70"
                  : "bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-offset-2 focus:ring-green-600 text-white"
              }`}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeptLogin;
