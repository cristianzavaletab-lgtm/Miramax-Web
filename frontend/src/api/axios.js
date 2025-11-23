import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/',
});

api.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            // Token invalid or expired, clear storage and redirect to login page
            // BUT ignore if the error comes from the login endpoint itself
            /*
            if (!error.config.url.includes('token/')) {
                localStorage.removeItem('access_token');
                window.location.href = '/login';
            }
            */
        }
        return Promise.reject(error);
    }
);

export default api;
