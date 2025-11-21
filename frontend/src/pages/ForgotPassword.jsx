import React, { useState } from 'react';
import { Container, Paper, Typography, TextField, Button, Box, Alert } from '@mui/material';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        try {
            await api.post('password-reset/', { email });
            setMessage('Si el correo existe, recibirás un enlace de recuperación.');
        } catch (err) {
            setError('Hubo un error al procesar la solicitud. Inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="xs" sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Paper elevation={6} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                <Typography component="h1" variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
                    Recuperar Contraseña
                </Typography>
                <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 3 }}>
                    Ingresa tu correo electrónico y te enviaremos las instrucciones para restablecer tu contraseña.
                </Typography>

                {message && <Alert severity="success" sx={{ width: '100%', mb: 2 }}>{message}</Alert>}
                {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}

                <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Correo Electrónico"
                        name="email"
                        autoComplete="email"
                        autoFocus
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2, py: 1.5 }}
                        disabled={loading}
                    >
                        {loading ? 'Enviando...' : 'Enviar Enlace'}
                    </Button>
                    <Box sx={{ textAlign: 'center' }}>
                        <Link to="/login" style={{ textDecoration: 'none', color: '#1976d2' }}>
                            Volver al Login
                        </Link>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default ForgotPassword;
