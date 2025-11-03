import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const AssignmentPopup = ({ show, onClose, complaint, departments, onAssign }) => {
    const [selectedDeptId, setSelectedDeptId] = useState('');
    const [deadlineDays, setDeadlineDays] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (show) {
            setSelectedDeptId('');
            setDeadlineDays('');
        }
    }, [show]);

    if (!show) return null;

    const handleSubmit = async () => {
        if (!selectedDeptId) {
            toast.error('Please select a department');
            return;
        }
        if (!deadlineDays || deadlineDays <= 0) {
            toast.error('Please enter valid deadline days');
            return;
        }

        setIsSubmitting(true);
        try {
            await onAssign(complaint.complainId, selectedDeptId, parseInt(deadlineDays));
            onClose();
        } catch (error) {
            // Error handling done in parent
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div 
                className="relative max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-teal-600 to-teal-700 p-4 text-white">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold">Assign Department</h3>
                        <button 
                            onClick={onClose}
                            className="text-white hover:text-gray-200 transition-colors"
                            aria-label="Close"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <p className="text-sm mt-1 text-teal-100">
                        Complaint ID: <span className="font-mono font-semibold">{complaint?.complainId}</span>
                    </p>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5">
                    {/* Complaint Info */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h4 className="font-bold text-gray-900 mb-1">{complaint?.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{complaint?.category}</p>
                        <p className="text-xs text-gray-500 line-clamp-2">{complaint?.description}</p>
                    </div>

                    {/* Department Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Select Department <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={selectedDeptId}
                            onChange={(e) => setSelectedDeptId(e.target.value)}
                            className="w-full p-3 border border-gray-300 outline-none rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                        >
                            <option value="">-- Choose Department --</option>
                            {departments.map(dept => (
                                <option key={dept.id} value={dept.id}>
                                    {dept.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Deadline Days */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Deadline (Days) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={deadlineDays}
                            onChange={(e) => setDeadlineDays(e.target.value)}
                            placeholder="Enter number of days"
                            className="w-full p-3 border outline-none border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Specify how many days the department has to resolve this complaint
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !selectedDeptId || !deadlineDays}
                        className="px-5 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                    >
                        {isSubmitting ? 'Assigning...' : 'Assign Department'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AssignmentPopup;