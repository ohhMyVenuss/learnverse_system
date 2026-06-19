import apiClient from './apiClient';
export const authApi = {
    login: async (email, password) => {
        const response = await apiClient.post('/auth/login', { email, password });
        return response.data;
    },
    register: async (email, password, fullName, role) => {
        const response = await apiClient.post('/auth/register', { email, password, fullName, role });
        return response.data;
    }
}