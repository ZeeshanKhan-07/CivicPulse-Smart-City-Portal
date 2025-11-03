import axios from 'axios';
const API_BASE_URL = 'http://localhost:8080/api/users';

export const submitFeedback = async (complainId, feedbackData) => {
    try {
        // feedbackData = { rating: Number, feedbackMessage: String }
        const response = await axios.post(
            `${API_BASE_URL}/complaints/${complainId}/feedback`,
            feedbackData
        );
        return response.data; // "Feedback submitted successfully" or similar message
    } catch (error) {
        console.error(`Failed to submit feedback for Complaint ${complainId}:`, error);
        throw new Error(error.response?.data?.message || "Failed to submit feedback.");
    }
};

export const getRatingByComplainId = async (complainId) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/complaints/${complainId}/rating`
        );
        // Example response: { rating: 5 }
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch rating for Complaint ${complainId}:`, error);
        throw new Error(error.response?.data?.message || "Failed to fetch rating.");
    }
};