import axios from 'axios';

// Base URL for the Department Management endpoints
const API_BASE_URL = 'http://localhost:8080/api/dept-manager';
const DEPARTMENT_ID_KEY = 'dept_id';

// --- AUTHENTICATION ---

export const loginDepartment = async (loginData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/login`, loginData);
        // The backend returns the Department ID (Long) on success
        const deptId = response.data;

        // Store Department ID in localStorage for future requests
        localStorage.setItem(DEPARTMENT_ID_KEY, deptId);
        return deptId;
    } catch (error) {
        if (error.response && error.response.status === 401) {
            throw new Error("Invalid credentials or department not found.");
        }
        throw new Error("Login failed due to server error.");
    }
};

export const getDepartmentId = () => {
    return localStorage.getItem(DEPARTMENT_ID_KEY);
};

export const logoutDepartment = () => {
    localStorage.removeItem(DEPARTMENT_ID_KEY);
};

// --- COMPLAINTS & WORKERS ---

export const getAssignedComplaints = async (deptId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/${deptId}/complaints`);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch complaints:", error);
        return [];
    }
};

export const createWorker = async (deptId, workerData) => {
    try {
        // The backend expects the worker object in the request body
        const response = await axios.post(`${API_BASE_URL}/${deptId}/workers`, workerData);
        return response.data; // The newly created worker object
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to create worker.");
    }
};

export const getAllDepartmentNames = async () => {
    try {
        // HITTING THE NEWLY CREATED ENDPOINT
        const response = await axios.get(`${API_BASE_URL}/all-names`); 
        
        // Return only the necessary fields for the dropdown: id and name.
        // We rely on the backend's Jackson annotations to suppress sensitive data.
        return response.data.map(dept => ({ 
            id: dept.id, 
            name: dept.name 
        }));
    } catch (error) {
        console.error("Failed to fetch department names:", error);
        // Toast notification will handle the display of this error in the Login component.
        return [];
    }
};


// export const getDepartmentInfo = async (deptId) => {
//     // Fetches ONE specific department's details (for name display)
//     try {
//         const response = await axios.get(`http://localhost:8080/api/departments/${deptId}`); 
//         return response.data;
//     } catch (error) {
//         console.error(`Failed to fetch department info for ID ${deptId}:`, error);
//         return null;
//     }
// }

// export const getDepartmentWorkers = async (deptId) => {
//     // Uses the working endpoint: GET /api/dept-manager/{deptId}/workers
//     try {
//         const response = await axios.get(`${API_BASE_URL}/${deptId}/workers`);
//         return response.data; // List of Worker objects
//     } catch (error) {
//         console.error("Failed to fetch department workers:", error);
//         return [];
//     }
// };

// export const completeComplaint = async (complaintId, data) => {
//     // Hitting the PUT /api/dept-manager/complaints/{complaintId}/complete
//     // data = { message, afterImagePath }
//     try {
//         const response = await axios.put(`${API_BASE_URL}/complaints/${complaintId}/complete`, data);
//         return response.data;
//     } catch (error) {
//         throw new Error(error.response?.data?.message || "Failed to complete task.");
//     }
// };

export const getDepartmentInfo = async (deptId) => {
    // FIX: URL adjusted to hit the new dedicated controller: /api/departments/{id}
    try {
        const response = await axios.get(`http://localhost:8080/api/dept-manager/${deptId}`); 
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch department info for ID ${deptId}:`, error);
        return null;
    }
}

export const getDepartmentWorkers = async (deptId) => {
    // Uses the working endpoint: GET /api/dept-manager/{deptId}/workers
    const response = await axios.get(`${API_BASE_URL}/${deptId}/workers`);
    return response.data; // List of Worker objects
};

export const completeComplaint = async (complaintId, formData) => {
    // formData MUST contain: 'message', 'workerIds' (JSON string), and 'imageFile'
    try {
        const response = await axios.put(
            `${API_BASE_URL}/complaints/${complaintId}/complete`, 
            formData,
            {
                headers: {
                    // CRITICAL: axios must NOT set the Content-Type header; 
                    // the browser handles it automatically for FormData.
                    'Content-Type': 'multipart/form-data', 
                },
            }
        );
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to complete task.");
    }
};

export const getWorkersByComplaintId = async (complainId) => {
    try {
        const response = await axios.get(`http://localhost:8080/api/dept-manager/complaints/${complainId}/workers`);
        return response.data; 
    } catch (error) {
        console.error(`Failed to fetch workers for Complaint ${complainId}:`, error);
        return [];
    }
};

export const getDepartmentNameByComplaintId = async (complainId) => {
    try {
        // Hitting the new backend endpoint: GET /api/dept-manager/complaints/{complainId}/department-name
        const response = await axios.get(`${API_BASE_URL}/complaints/${complainId}/department-name`);
        
        // The backend returns the department name as a string directly (response.data)
        return response.data; 
    } catch (error) {
        if (error.response && error.response.status === 404) {
            // Complaint not found or department not assigned
            return "Department not assigned"; 
        }
        console.error(`Failed to fetch department name for Complaint ${complainId}:`, error);
        throw new Error("Failed to retrieve department name.");
    }
};

export const getComplaintDeadline = async (complaintId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/complaints/${complaintId}/deadline`);
        return response.data; // Expected: date string or deadline object
    } catch (error) {
        console.error(`Failed to fetch deadline for complaint ${complaintId}:`, error);
        throw new Error(error.response?.data?.message || "Failed to get complaint deadline.");
    }
};

export const getComplaintCompletionTime = async (complaintId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/complaints/${complaintId}/completion-time`);
        // The backend should return something like: "Completed within 1 days, 3 hours"
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch completion time for complaint ${complaintId}:`, error);
        throw new Error(error.response?.data?.message || "Failed to get completion time.");
    }
};

