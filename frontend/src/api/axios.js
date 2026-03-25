import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
});

// Helper to get token and set headers
export const getAuthHeaders = async (user) => {
    if (!user) return {};
    const token = await user.getIdToken();
    return {
        headers: { 'Authorization': `Bearer ${token}` }
    };
};

export default api;
