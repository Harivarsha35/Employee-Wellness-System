import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.PROD 
        ? 'https://employee-wellness-system-nuw7fpxh2-hari35varsha-9246s-projects.vercel.app/api' 
        : 'http://localhost:5000/api',
});

export const imageBaseURL = import.meta.env.PROD 
    ? 'https://employee-wellness-system-nuw7fpxh2-hari35varsha-9246s-projects.vercel.app' 
    : 'http://localhost:5000';

// Add a request interceptor to attach the token
api.interceptors.request.use(
    (config) => {
        const user = localStorage.getItem('user');
        if (user) {
            const token = JSON.parse(user).token;
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
