import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import gsap from "gsap";
import { 
  completeComplaint, 
  getWorkersByComplaintId, 
  getComplaintDeadline 
} from "../api/DepartmentAPI";

// --- Deadline Timer Component ---
const DeadlineTimer = ({ complaintId, complaint }) => {
  const [deadline, setDeadline] = useState(null);
  const [completionTime, setCompletionTime] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState("");
  const [isOverdue, setIsOverdue] = useState(false);
  const [loading, setLoading] = useState(true);

  const isResolved = complaint.status === "RESOLVED";

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isResolved) {
          // Fetch completion time for resolved complaints
          const response = await fetch(
            `http://localhost:8080/api/dept-manager/complaints/${complaintId}/completion-time`
          );
          const completionTimeText = await response.text();
          setCompletionTime(completionTimeText);
        } else {
          // Fetch deadline for active complaints
          const deadlineData = await getComplaintDeadline(complaintId);
          setDeadline(new Date(deadlineData));
        }
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [complaintId, isResolved]);

  useEffect(() => {
    if (!deadline || isResolved) return;

    const updateTimer = () => {
      const now = new Date();
      const diff = deadline - now;

      if (diff <= 0) {
        setIsOverdue(true);
        setTimeRemaining("OVERDUE");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m`);
      } else {
        setTimeRemaining(`${minutes}m`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [deadline, isResolved]);

  if (loading) {
    return (
      <span className="text-xs text-gray-500 italic">Loading...</span>
    );
  }

  // Show completion time for resolved complaints
  if (isResolved) {
    return (
      <span className="text-xs font-semibold px-2 py-1 rounded bg-green-100 text-green-800">
        ✓ Completed {completionTime || "within deadline"}
      </span>
    );
  }

  if (!deadline) {
    return (
      <span className="text-xs text-gray-500 italic">No deadline set</span>
    );
  }

  return (
    <span
      className={`text-xs font-semibold px-2 py-1 rounded ${
        isOverdue
          ? "bg-red-100 text-red-700"
          : "bg-yellow-100 text-yellow-800"
      }`}
    >
      ⏱ {timeRemaining}
    </span>
  );
};

// --- Completion Modal Component ---
const CompletionModal = ({
  isOpen,
  onClose,
  complaint,
  workers,
  onComplete,
}) => {
  const [formData, setFormData] = useState({
    message: "",
    imageFile: null,
    workerIds: [],
  });

  const [loading, setLoading] = useState(false);
  const modalRef = useRef(null);

  // GSAP modal animation
  useEffect(() => {
    if (isOpen && modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.3, ease: "power2.out" }
      );
    }
  }, [isOpen]);

  const handleWorkerToggle = (workerId) => {
    setFormData((prev) => {
      const newWorkerIds = prev.workerIds.includes(workerId)
        ? prev.workerIds.filter((id) => id !== workerId)
        : [...prev.workerIds, workerId];
      return { ...prev, workerIds: newWorkerIds };
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setFormData({ ...formData, imageFile: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (formData.workerIds.length === 0) {
      toast.error("Please select at least one worker who did this task.");
      setLoading(false);
      return;
    }

    if (!formData.imageFile) {
      toast.error("Please upload the after image (required).");
      setLoading(false);
      return;
    }

    const data = new FormData();
    data.append("message", formData.message);
    data.append("workerIds", formData.workerIds.join(","));
    data.append("imageFile", formData.imageFile);

    const completionPromise = completeComplaint(complaint.complainId, data);

    toast
      .promise(completionPromise, {
        loading: "Marking task complete...",
        success: "Task resolved successfully!",
        error: (err) => err.message,
      })
      .then(() => {
        onComplete();
        onClose();
      })
      .finally(() => setLoading(false));
  };

  if (!isOpen || !complaint) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-transparent"
      style={{ backdropFilter: "blur(10px)" }}
    >
      <div
        ref={modalRef}
        className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-lg border border-gray-200"
      >
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h3 className="text-xl font-bold text-gray-800">
            Complete Task: {complaint.title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* FORM */}
        <div className="space-y-4">
          {/* Worker Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Workers who completed the task:
            </label>
            <div className="flex flex-wrap gap-2 p-2 border border-gray-300 rounded-md bg-gray-50 max-h-32 overflow-y-auto">
              {workers.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => handleWorkerToggle(w.id.toString())}
                  className={`px-3 py-1 text-sm rounded-full transition-all duration-150 ${
                    formData.workerIds.includes(w.id.toString())
                      ? "bg-blue-600 text-white shadow-md scale-105"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-blue-50"
                  }`}
                >
                  {w.name}
                </button>
              ))}
            </div>
            {formData.workerIds.length === 0 && (
              <p className="text-xs text-red-500 mt-1">
                Please select at least one worker.
              </p>
            )}
          </div>

          {/* After Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload After Image (Evidence)
            </label>
            <input
              type="file"
              name="imageFile"
              onChange={handleInputChange}
              required
              accept="image/*"
              className="w-full text-sm text-gray-700 p-2 border border-gray-300 rounded-md file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
            />
            {formData.imageFile && (
              <p className="text-xs text-gray-600 mt-1">
                File selected: {formData.imageFile.name}
              </p>
            )}
          </div>

          {/* Message */}
          <textarea
            name="message"
            placeholder="Final message, notes, and details on completion."
            value={formData.message}
            onChange={handleInputChange}
            rows="3"
            required
            className="w-full p-2 border border-gray-300 rounded-md"
          ></textarea>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 border rounded-md"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={
                loading ||
                formData.workerIds.length === 0 ||
                !formData.imageFile
              }
              className="px-4 py-2 text-sm text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-green-400"
            >
              {loading ? "Submitting..." : "Mark as RESOLVED"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Complaint List Component ---
const CompliantList = ({ complaints, workers, onTaskCompleted }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [resolvedWorkersMap, setResolvedWorkersMap] = useState({});
  const listRef = useRef(null);

  // Fetch workers for resolved complaints
  useEffect(() => {
    const fetchResolvedWorkers = async () => {
      const workersData = {};
      
      for (const complaint of complaints) {
        if (complaint.status === "RESOLVED") {
          try {
            const workers = await getWorkersByComplaintId(complaint.complainId);
            workersData[complaint.complainId] = workers;
          } catch (error) {
            console.error(`Failed to fetch workers for complaint ${complaint.complainId}:`, error);
            workersData[complaint.complainId] = [];
          }
        }
      }
      
      setResolvedWorkersMap(workersData);
    };

    if (complaints.length > 0) {
      fetchResolvedWorkers();
    }
  }, [complaints]);

  // Animate complaint cards on mount
  useEffect(() => {
    if (listRef.current) {
      gsap.fromTo(
        listRef.current.children,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.1,
          duration: 0.4,
          ease: "power2.out",
        }
      );
    }
  }, [complaints]);

  const openCompletionModal = (complaint) => {
    setSelectedComplaint(complaint);
    setIsModalOpen(true);
  };

  if (complaints.length === 0) {
    return (
      <p className="text-gray-500 p-4 border rounded-lg bg-white">
        No complaints currently assigned.
      </p>
    );
  }

  return (
    <>
      <div ref={listRef} className="space-y-4">
        {complaints.map((complaint) => {
          const isResolved = complaint.status === "RESOLVED";
          const resolvedWorkers = resolvedWorkersMap[complaint.complainId] || [];
          
          return (
            <div
              key={complaint.complainId}
              className={`p-6 rounded-lg shadow transition-all duration-300 border-l-4 ${
                isResolved
                  ? "bg-green-50 border-green-600"
                  : "bg-white border-blue-500"
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="text-xl font-semibold text-gray-900">
                    {complaint.title}
                  </h4>
                  <div className="mt-2">
                    <DeadlineTimer complaintId={complaint.complainId} complaint={complaint} />
                  </div>
                </div>
                <span
                  className={`font-bold text-sm ${
                    isResolved ? "text-green-700" : "text-blue-700"
                  }`}
                >
                  {complaint.status}
                </span>
              </div>

              <p className="text-gray-600 mt-2">{complaint.description}</p>

              <div className="mt-4 pt-3 border-t flex justify-between items-center">
                {isResolved ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 font-medium">
                      Completed by:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {resolvedWorkers.length > 0 ? (
                        resolvedWorkers.map((worker) => (
                          <span
                            key={worker.id}
                            className="px-3 py-1 text-xs font-medium rounded-full bg-olive-100 text-olive-800 border border-olive-300"
                            style={{
                              backgroundColor: "#e8f5e9",
                              color: "#2e7d32",
                              borderColor: "#81c784",
                            }}
                          >
                            {worker.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-500 italic">
                          Loading workers...
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 italic">
                    Assigned:{" "}
                    {complaint.workers && complaint.workers.length > 0
                      ? complaint.workers.map((w) => w.name).join(", ")
                      : "None"}
                  </p>
                )}

                {!isResolved && (
                  <button
                    onClick={() => openCompletionModal(complaint)}
                    className="px-4 py-2 text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                  >
                    Complete Task
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <CompletionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        complaint={selectedComplaint}
        workers={workers}
        onComplete={onTaskCompleted}
      />
    </>
  );
};

export default CompliantList;