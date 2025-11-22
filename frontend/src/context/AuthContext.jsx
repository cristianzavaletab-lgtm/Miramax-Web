import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        const userData = localStorage.getItem('user_data');

        if (token && userData) {
            try {
                setUser(JSON.parse(userData));
            } catch (error) {
                console.error('Invalid user data:', error);
            }
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            const response = await api.post('token/', { username, password });
            const { access, refresh, user: userData } = response.data;

            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);

            if (userData) {
                localStorage.setItem('user_data', JSON.stringify(userData));
                setUser(userData);
            } else {
                const userResponse = await api.get('users/me/');
                localStorage.setItem('user_data', JSON.stringify(userResponse.data));
                setUser(userResponse.data);
            }

            return { success: true };
        } catch (error) {
            console.error("Login failed", error);
            let errorMessage = 'Error al iniciar sesión';
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                if (error.response.status === 401) {
                    errorMessage = 'Credenciales inválidas';
                } else {
                    errorMessage = `Error del servidor: ${error.response.status}`;
                }
            } else if (error.request) {
                // The request was made but no response was received
                errorMessage = 'No se pudo conectar con el servidor. Verifique su conexión.';
            } else {
                // Something happened in setting up the request that triggered an Error
                errorMessage = error.message;
            }
            return { success: false, error: errorMessage };
        }
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
