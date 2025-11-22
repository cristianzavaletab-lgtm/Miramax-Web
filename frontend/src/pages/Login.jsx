import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Paper, TextField, Button, Typography, Box } from '@mui/material';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Form submitted");
        setError('');
        try {
            console.log("Calling login function...");
            const result = await login(username, password);
            console.log("Login result:", result);
            if (result.success) {
                console.log("Login successful, navigating to dashboard");
                navigate('/dashboard');
            } else {
                console.log("Login failed with error:", result.error);
                setError(result.error);
            }
        } catch (err) {
            console.error("Unexpected error in handleSubmit:", err);
            setError("Error inesperado en la aplicación");
        }
    };

    return (
        <Container maxWidth="xs" sx={{ mt: 8 }}>
            <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <img src="/logo.png" alt="Miramax Logo" style={{ width: '200px', marginBottom: '20px' }} />
                <Typography component="h1" variant="h5">
                    Iniciar Sesión
                </Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Usuario"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        autoFocus
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Contraseña"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    {error && (
                        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                            {error}
                        </Typography>
                    )}
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Ingresar
                    </Button>
                    <Box sx={{ textAlign: 'center' }}>
                        <Link to="/forgot-password" style={{ textDecoration: 'none', color: '#1976d2' }}>
                            ¿Olvidaste tu contraseña?
                        </Link>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default Login;
