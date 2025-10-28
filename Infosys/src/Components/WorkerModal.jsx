import React, { useState, useEffect, useRef } from "react";
import { createWorker } from "../api/DepartmentAPI";
import toast from "react-hot-toast";
import { gsap } from "gsap";

const WorkerModal = ({ deptId, isOpen, onClose, onWorkerAdded }) => {
  const [worker, setWorker] = useState({
    name: "",
    email: "",
    phoneNumber: "",
  });
  const [loading, setLoading] = useState(false);

  const modalRef = useRef(null);

  // GSAP animation for modal open/close
  useEffect(() => {
    if (isOpen) {
      gsap.fromTo(
        modalRef.current,
        { opacity: 0, y: -30, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "power2.out" }
      );
    }
  }, [isOpen]);

  const handleChange = (e) => {
    setWorker({ ...worker, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const newWorker = await createWorker(deptId, worker);
      toast.success(`Worker ${newWorker.name} added successfully!`);
      onWorkerAdded(newWorker);
      setWorker({ name: "", email: "", phoneNumber: "" });
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    // ✨ Background Blur Overlay (not dark)
    <div className="fixed inset-0 backdrop-blur-sm bg-white/10 flex items-center justify-center z-50">
      {/* ✨ Modal Card */}
      <div
        ref={modalRef}
        className="bg-white/80 backdrop-blur-md border border-gray-200 shadow-2xl rounded-2xl p-6 w-full max-w-md transition-all duration-300"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-2">
          <h3 className="text-2xl font-bold text-indigo-700">Add New Worker</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-3xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              name="name"
              placeholder="Worker Name"
              value={worker.name}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>

          <div>
            <input
              type="email"
              name="email"
              placeholder="Worker Email"
              value={worker.email}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>

          <div>
            <input
              type="tel"
              name="phoneNumber"
              placeholder="Phone Number"
              value={worker.phoneNumber}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-lg text-white font-semibold bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-transform duration-200 disabled:bg-indigo-400"
          >
            {loading ? "Adding..." : "Create Worker"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default WorkerModal;
