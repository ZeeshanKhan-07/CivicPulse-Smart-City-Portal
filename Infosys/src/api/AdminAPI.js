import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/admin"; // change if needed

export const assignComplaintToDepartment = async (complaintId, departmentId, days) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/complaints/${complaintId}/assign-department`, {
      departmentId,
      days,
    });
    return response.data;
  } catch (error) {
    console.error("Error assigning complaint:", error);
    throw error;
  }
};