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
