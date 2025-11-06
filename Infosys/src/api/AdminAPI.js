import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/admin"; // change if needed

export const assignComplaintToDepartment = async (
  complaintId,
  departmentId,
  days
) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/complaints/${complaintId}/assign-department`,
      {
        departmentId,
        days,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error assigning complaint:", error);
    throw error;
  }
};

export const fetchDepartmentComplaintCount = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/complaints/department-count`
    );
    // Map the response data for better compatibility with Recharts
    return response.data.map((item) => ({
      name: item.departmentName,
      value: item.complaintCount,
    }));
  } catch (error) {
    console.error("Error fetching department complaint count:", error);
    throw error;
  }
};

export const fetchCityComplaintCount = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/complaints/city-count`);
    
    // FIX 1: Filter out entries where 'city' is null or undefined 
    // This removes the unstable "Unknown Zone" bar generated from null city data.
    const data = response.data
        .filter(item => item.city !== null && item.city !== undefined) 
        .map(item => ({
            name: item.city, // Use the actual city name
            value: item.count,
            // Conditional color logic: Red if count >= 10, otherwise Green
            fill: item.count >= 10 ? '#EF4444' : '#10B981', 
        }));
    
    return data;
  } catch (error) {
    console.error("Error fetching city complaint count:", error);
    throw error;
  }
};

export const fetchFeedbackDetails = async (complainId) => {
    try {
        const response = await axios.get(
            `http://localhost:8080/api/admin/complaints/${complainId}/feedback`
        );
        return response.data;
    } catch (error) {
        // --- FIX: Check for 404 Status Code ---
        if (error.response && error.response.status === 404) {
            // A 404 response means "No feedback found" for this ID.
            // This is expected behavior, so we return null instead of throwing an error.
            return null; 
        }
        
        // Throw all other errors (e.g., 500 server error, network issues)
        console.error("Error fetching feedback details:", error);
        throw error;
    }
};

