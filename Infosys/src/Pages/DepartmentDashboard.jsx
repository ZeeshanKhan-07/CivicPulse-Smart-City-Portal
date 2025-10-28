import React, { useState, useEffect, useCallback } from "react";
import { useParams, Navigate } from "react-router-dom";
import {
  getAssignedComplaints,
  getDepartmentId,
  logoutDepartment,
  getDepartmentWorkers,
  getDepartmentInfo,
} from "../api/DepartmentAPI";
import CompliantList from "../Components/CompliantList";
import WorkerModal from "../Components/WorkerModal";
import { Toaster } from "react-hot-toast";

const DeptDashboard = () => {
  const { deptId: paramDeptId } = useParams();
  const [complaints, setComplaints] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [deptName, setDeptName] = useState("Loading...");
  const [loading, setLoading] = useState(true);
  const [isWorkerModalOpen, setIsWorkerModalOpen] = useState(false);

  const storedDeptId = getDepartmentId();
  const deptId = storedDeptId || paramDeptId;

  const fetchDashboardData = useCallback(async () => {
    if (!deptId) return;
    setLoading(true);

    try {
      const [complaintsData, workersData, deptInfo] = await Promise.all([
        getAssignedComplaints(deptId),
        getDepartmentWorkers(deptId),
        getDepartmentInfo(deptId),
      ]);

      setComplaints(complaintsData);
      setWorkers(workersData);
      if (deptInfo) setDeptName(deptInfo.name);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [deptId]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleWorkerAdded = (newWorker) => {
    setWorkers((prev) => [...prev, newWorker]);
    setIsWorkerModalOpen(false);
  };

  const handleLogout = () => {
    logoutDepartment();
    window.location.href = "/login";
  };

  if (!deptId) return <Navigate to="/login" />;
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-lg text-gray-700">
        Loading Dashboard...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Toaster position="top-right" />

      {/* ✅ Sticky Navbar */}
      <header className="sticky top-0 z-50 bg-white shadow-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
            {deptName}
          </h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-semibold rounded-md text-white bg-red-600 hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* ✅ Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* ✅ Workers Sidebar */}
          <div className="lg:col-span-1 bg-white rounded-2xl shadow-lg p-5 border border-gray-100 h-fit">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Team Members ({workers.length})
              </h2>
              <button
                onClick={() => setIsWorkerModalOpen(true)}
                className="px-3 py-1 text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition"
              >
                + Add
              </button>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {workers.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-6">
                  No workers added yet.
                </p>
              ) : (
                workers.map((w) => (
                  <div
                    key={w.id}
                    className="p-3 border rounded-lg bg-gray-50 hover:bg-gray-100 transition"
                  >
                    <p className="font-medium text-gray-800">{w.name}</p>
                    <p className="text-xs text-gray-500">{w.email}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ✅ Complaints Section */}
          <div className="lg:col-span-3 bg-white rounded-2xl shadow-lg p-6 border border-gray-100 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">
                Assigned Complaints ({complaints.length})
              </h2>
              <span className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleDateString()}
              </span>
            </div>

            {/* Scrollable complaints list */}
            <div className="flex-1 overflow-y-auto max-h-[65vh] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {complaints.length === 0 ? (
                <div className="text-center text-gray-500 py-10 text-sm">
                  No complaints assigned yet.
                </div>
              ) : (
                <CompliantList
                  complaints={complaints}
                  workers={workers}
                  onTaskCompleted={fetchDashboardData}
                />
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ✅ Worker Modal */}
      <WorkerModal
        deptId={deptId}
        isOpen={isWorkerModalOpen}
        onClose={() => setIsWorkerModalOpen(false)}
        onWorkerAdded={handleWorkerAdded}
      />
    </div>
  );
};

export default DeptDashboard;
