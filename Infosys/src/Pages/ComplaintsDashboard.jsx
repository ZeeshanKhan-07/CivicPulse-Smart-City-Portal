import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import AssignmentPopup from "../Components/AssignDepartmentModal";
import { getAllDepartmentNames, getDepartmentNameByComplaintId } from "../api/DepartmentAPI";

// --- API Constants ---
const API_BASE_URL = "http://localhost:8080/api/admin/complaints";
const FILE_BASE_URL = "http://localhost:8080/api/files/download";

// Define the available status filters
const STATUS_FILTERS = {
  PENDING: "PENDING",
  IN_PROGRESS: "IN_PROGRESS",
  RESOLVED: "RESOLVED",
  ALL_OPEN: "Open",
};

// --- Sticky Header Component ---
const StickyAdminHeader = ({
  onLogout,
  onRefresh,
  activeFilter,
  setActiveFilter,
}) => {
  const getFilterButtonClass = (filter) => {
    const base =
      "px-3 py-1 rounded-lg font-medium text-sm transition-colors duration-200 shadow-md whitespace-nowrap";
    if (activeFilter === filter) {
      if (filter === STATUS_FILTERS.RESOLVED)
        return `${base} bg-green-700 text-white`;
      if (filter === STATUS_FILTERS.IN_PROGRESS)
        return `${base} bg-indigo-600 text-white`;
      return `${base} bg-yellow-600 text-gray-900`;
    } else {
      return `${base} bg-gray-100 text-gray-700 hover:bg-gray-200`;
    }
  };

  const adminName = localStorage.getItem("adminName") || "Admin";

  return (
    <header className="sticky top-0 z-20 bg-white shadow-xl">
      <div className="max-w-7xl mx-auto p-3 md:p-4">
        <div className="flex justify-between items-center pb-3 border-b border-gray-100">
          <h1 className="text-xl md:text-2xl font-extrabold text-teal-700 whitespace-nowrap">
            Complaint Review Center
          </h1>

          <div className="flex items-center space-x-3">
            <span className="text-sm font-semibold text-gray-700 hidden sm:inline">
              Hello, {adminName}
            </span>
            <button
              onClick={onLogout}
              className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition shadow-md text-sm"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center pt-3 flex-wrap gap-2">
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {Object.values(STATUS_FILTERS).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={getFilterButtonClass(filter)}
              >
                {filter.charAt(0).toUpperCase() +
                  filter.slice(1).toLowerCase().replace(/_/g, " ")}
              </button>
            ))}
          </div>
          <button
            onClick={onRefresh}
            className="p-1.5 bg-teal-100 text-teal-700 rounded-full hover:bg-teal-200 transition shadow-sm"
            title="Refresh Complaints"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.962 8.962 0 0120 10c0-4.97-4.03-9-9-9a9 9 0 00-6 15.659v1.24H3v3.137l1.71-1.71C5.753 19.336 8.35 20 11 20c4.97 0 9-4.03 9-9 0-.965-.188-1.89-.54-2.738L21.5 5.5V5h-16z"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

// --- Image Modal ---
const ImagePopup = ({ show, imageUrl, title, onClose }) => {
  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl max-h-[90vh] w-full bg-white rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-3 bg-gray-900 text-white text-lg font-semibold flex justify-between items-center">
          <span>{title}</span>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 transition-colors z-10"
            aria-label="Close image"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-contain"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              "https://via.placeholder.com/600x400?text=Image+Not+Available";
          }}
        />
      </div>
    </div>
  );
};

// --- Main Complaints Dashboard Component ---
function ComplaintsDashboard() {
  const [allComplaints, setAllComplaints] = useState([]);
  const [allDepartments, setAllDepartments] = useState([]);
  const [departmentNames, setDepartmentNames] = useState({}); // Store department names by complaint ID
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState(STATUS_FILTERS.ALL_OPEN);
  const [imageModal, setImageModal] = useState({
    show: false,
    imageUrl: "",
    title: "",
  });
  const [messageInput, setMessageInput] = useState({});
  const [assignmentPopup, setAssignmentPopup] = useState({
    show: false,
    complaint: null,
  });

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/adminLogin");
  };

  const openImageModal = (imageUrl, title) => {
    setImageModal({ show: true, imageUrl, title });
  };

  const closeImageModal = () => {
    setImageModal({ show: false, imageUrl: "", title: "" });
  };

  const openAssignmentPopup = (complaint) => {
    setAssignmentPopup({ show: true, complaint });
  };

  const closeAssignmentPopup = () => {
    setAssignmentPopup({ show: false, complaint: null });
  };

  const handleMessageChange = (complainId, value) => {
    setMessageInput((prev) => ({ ...prev, [complainId]: value }));
  };

  // --- API Calls ---
  const fetchAllDepartments = useCallback(async () => {
    try {
      const data = await getAllDepartmentNames();
      setAllDepartments(data);
    } catch (error) {
      toast.error("Error fetching departments: " + error.message);
    }
  }, []);

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(API_BASE_URL);
      if (!response.ok) throw new Error("Failed to fetch complaints.");
      const data = await response.json();
      setAllComplaints(data);

      // Fetch department names for all complaints that have been assigned or are in progress
      const deptNamePromises = data
        .filter((c) => c.status === STATUS_FILTERS.IN_PROGRESS || (c.department && c.department.id))
        .map(async (c) => {
          try {
            const deptName = await getDepartmentNameByComplaintId(c.complainId);
            return { complainId: c.complainId, deptName };
          } catch (error) {
            console.error(`Failed to fetch department for complaint ${c.complainId}`);
            return { complainId: c.complainId, deptName: "Unknown Department" };
          }
        });

      const deptNamesArray = await Promise.all(deptNamePromises);
      const deptNamesMap = {};
      deptNamesArray.forEach(({ complainId, deptName }) => {
        deptNamesMap[complainId] = deptName;
      });
      setDepartmentNames(deptNamesMap);
    } catch (error) {
      toast.error("Error fetching complaints: " + error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAssignDepartment = async (complainId, departmentId, days) => {
    const loadingToastId = toast.loading("Assigning department...");
    try {
      const response = await fetch(
        `${API_BASE_URL}/${complainId}/assign-department`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            departmentId: departmentId,
            timelineDays: days,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Department assignment failed.");
      }

      toast.success(`Complaint ID ${complainId} assigned successfully!`, {
        id: loadingToastId,
      });
      fetchComplaints();
    } catch (error) {
      toast.error(`Assignment failed: ${error.message}`, {
        id: loadingToastId,
      });
      throw error;
    }
  };

  const handleStatusUpdate = async (complainId, newStatus) => {
    const loadingToastId = toast.loading(
      `Updating complaint ${complainId} to ${newStatus}...`
    );

    const message = messageInput[complainId] || "";

    try {
      const response = await fetch(`${API_BASE_URL}/${complainId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, message: message }),
      });

      if (!response.ok) throw new Error("Status update failed.");

      toast.success(`Complaint ID ${complainId} updated to ${newStatus}.`, {
        id: loadingToastId,
      });

      setMessageInput((prev) => ({ ...prev, [complainId]: "" }));

      fetchComplaints();
    } catch (error) {
      toast.error(`Failed to update status: ${error.message}`, {
        id: loadingToastId,
      });
    }
  };

  useEffect(() => {
    if (localStorage.getItem("isAdmin") !== "true") {
      navigate("/adminLogin");
      return;
    }
    fetchAllDepartments();
    fetchComplaints();
  }, [fetchComplaints, fetchAllDepartments, navigate]);

  // --- UI Helpers ---
  const getStatusClass = (status) => {
    switch (status) {
      case STATUS_FILTERS.RESOLVED:
        return "bg-green-600 border-green-700";
      case STATUS_FILTERS.IN_PROGRESS:
        return "bg-indigo-500 border-indigo-600";
      default:
        return "bg-yellow-500 border-yellow-600";
    }
  };

  const filteredComplaints = allComplaints.filter((c) => {
    if (activeFilter === STATUS_FILTERS.ALL_OPEN) {
      return (
        c.status === STATUS_FILTERS.PENDING ||
        c.status === STATUS_FILTERS.IN_PROGRESS
      );
    }
    return c.status === activeFilter;
  });

  if (loading && allComplaints.length === 0)
    return (
      <div className="text-center mt-20 text-2xl font-semibold text-gray-700">
        Loading Admin Dashboard...
      </div>
    );

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      <Toaster position="top-center" reverseOrder={false} />

      <StickyAdminHeader
        onLogout={handleLogout}
        onRefresh={fetchComplaints}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
      />

      <ImagePopup
        show={imageModal.show}
        imageUrl={imageModal.imageUrl}
        title={imageModal.title}
        onClose={closeImageModal}
      />

      <AssignmentPopup
        show={assignmentPopup.show}
        complaint={assignmentPopup.complaint}
        departments={allDepartments}
        onClose={closeAssignmentPopup}
        onAssign={handleAssignDepartment}
      />

      <main className="flex-grow p-3 md:p-4 max-w-7xl w-full mx-auto overflow-hidden">
        <div className="bg-white p-4 rounded-xl shadow-xl h-full flex flex-col">
          <h2 className="text-xl font-bold text-gray-800 mb-3 border-b pb-2">
            {activeFilter.charAt(0).toUpperCase() +
              activeFilter.slice(1).toLowerCase().replace(/_/g, " ")}{" "}
            Complaints ({filteredComplaints.length})
          </h2>

          {filteredComplaints.length === 0 ? (
            <div className="text-center text-xl text-gray-600 p-12 flex-grow flex items-center justify-center">
              No **{activeFilter.toLowerCase().replace(/_/g, " ")}** complaints
              found. 🎉
            </div>
          ) : (
            <div
              className="flex-grow overflow-y-auto pr-2"
              style={{ maxHeight: "100%" }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-4">
                {filteredComplaints.map((c) => {
                  const isAssigned = c.department && c.department.id;
                  const isInProgress = c.status === STATUS_FILTERS.IN_PROGRESS;
                  const departmentName = departmentNames[c.complainId] || "Loading...";

                  return (
                    <div
                      key={c.complainId}
                      className="p-4 border border-gray-200 rounded-xl bg-gray-50 shadow-md transition-shadow duration-300 flex flex-col"
                    >
                      <div className="flex-grow">
                        <div className="flex justify-between items-start mb-2 pb-2 border-b">
                          <div>
                            <h3 className="text-base font-extrabold text-gray-900 line-clamp-1">
                              {c.title}
                            </h3>
                            <p className="text-xs text-gray-500">
                              ID:{" "}
                              <span className="font-mono">{c.complainId}</span>
                            </p>
                          </div>
                          <span
                            className={`px-2 py-0.5 text-xs font-bold text-white rounded-full ${getStatusClass(
                              c.status
                            )} whitespace-nowrap`}
                          >
                            {c.status.replace(/_/g, " ")}
                          </span>
                        </div>

                        <p className="text-sm font-medium mb-1 text-teal-700">
                          Category: {c.category}
                        </p>
                        <p className="text-xs text-gray-600 italic mb-2">
                          User: {c.userEmail}
                        </p>
                        <p className="text-sm text-gray-700 mb-4">
                          {c.description}
                        </p>

                        {/* Department Assignment Section - UPDATED WITH API CALL */}
                        <div className="mb-4">
                          {isAssigned || isInProgress ? (
                            <p className="text-sm font-bold text-indigo-700 bg-indigo-50 p-2 rounded-lg border border-indigo-200">
                              Assigned to: {departmentName}
                            </p>
                          ) : (
                            c.status !== STATUS_FILTERS.RESOLVED && (
                              <button
                                onClick={() => openAssignmentPopup(c)}
                                className="w-full p-2 bg-teal-500 text-white rounded-md text-sm font-medium hover:bg-teal-600 transition shadow-md"
                              >
                                Assign Department
                              </button>
                            )
                          )}
                        </div>

                        {/* Image Display Buttons */}
                        <div className="flex space-x-2 pt-2 border-t border-gray-100">
                          {c.beforeImagePath && (
                            <button
                              onClick={() =>
                                openImageModal(
                                  `${FILE_BASE_URL}/${c.beforeImagePath}`,
                                  `Evidence: Before Image - Complaint #${c.complainId}`
                                )
                              }
                              className="flex-1 py-1 bg-yellow-500 text-white text-xs font-medium rounded-lg hover:bg-yellow-600 shadow-sm"
                            >
                              View Before
                            </button>
                          )}
                          {c.afterImagePath && (
                            <button
                              onClick={() =>
                                openImageModal(
                                  `${FILE_BASE_URL}/${c.afterImagePath}`,
                                  `Resolution: After Image - Complaint #${c.complainId}`
                                )
                              }
                              className="flex-1 py-1 bg-green-500 text-white text-xs font-medium rounded-lg hover:bg-green-600 shadow-sm"
                            >
                              View After
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Footer Section */}
                      <div className="mt-3 pt-3 border-t border-gray-100 flex-shrink-0">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Update Message:
                        </label>
                        <textarea
                          value={messageInput[c.complainId] ?? c.message ?? ""}
                          onChange={(e) =>
                            handleMessageChange(c.complainId, e.target.value)
                          }
                          placeholder="Message for the user..."
                          rows="2"
                          className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        ></textarea>

                        {/* Status Update Buttons */}
                        <div className="flex space-x-2 pt-2">
                          <button
                            onClick={() =>
                              handleStatusUpdate(
                                c.complainId,
                                STATUS_FILTERS.IN_PROGRESS
                              )
                            }
                            className="flex-1 py-2 bg-indigo-500 text-white rounded-lg text-xs font-medium hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                            disabled={
                              c.status === STATUS_FILTERS.RESOLVED ||
                              c.status === STATUS_FILTERS.IN_PROGRESS
                            }
                          >
                            Set In Progress
                          </button>
                          <button
                            onClick={() =>
                              handleStatusUpdate(
                                c.complainId,
                                STATUS_FILTERS.RESOLVED
                              )
                            }
                            className="flex-1 py-2 bg-green-500 text-white rounded-lg text-xs font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                            disabled={c.status === STATUS_FILTERS.RESOLVED}
                          >
                            Mark Resolved
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default ComplaintsDashboard;