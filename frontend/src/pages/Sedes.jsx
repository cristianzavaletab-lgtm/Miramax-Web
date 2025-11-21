import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Button, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField, IconButton, Chip
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export default function Sedes() {
    const [sedes, setSedes] = useState([]);
    const [open, setOpen] = useState(false);
    const [currentSede, setCurrentSede] = useState({
        nombre: '',
        direccion: '',
        telefono: '',
        email: '',
        activo: true
    });
    const [editMode, setEditMode] = useState(false);

    useEffect(() => {
        fetchSedes();
    }, []);

    const fetchSedes = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/sedes/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSedes(response.data);
        } catch (error) {
            console.error('Error fetching sedes:', error);
        }
    };

    const handleOpen = (sede = null) => {
        if (sede) {
            setCurrentSede(sede);
            setEditMode(true);
        } else {
            setCurrentSede({
                nombre: '',
                direccion: '',
                telefono: '',
                email: '',
                activo: true
            });
            setEditMode(false);
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setCurrentSede({
            nombre: '',
            direccion: '',
            telefono: '',
            email: '',
            activo: true
        });
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem('token');
            if (editMode) {
                await axios.put(`${API_URL}/sedes/${currentSede.id}/`, currentSede, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post(`${API_URL}/sedes/`, currentSede, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            fetchSedes();
            handleClose();
        } catch (error) {
            console.error('Error saving sede:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Está seguro de eliminar esta sede?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${API_URL}/sedes/${id}/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                fetchSedes();
            } catch (error) {
                console.error('Error deleting sede:', error);
            }
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4">Gestión de Sedes</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpen()}
                >
                    Nueva Sede
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Nombre</TableCell>
                            <TableCell>Dirección</TableCell>
                            <TableCell>Teléfono</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Estado</TableCell>
                            <TableCell>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sedes.map((sede) => (
                            <TableRow key={sede.id}>
                                <TableCell>{sede.nombre}</TableCell>
                                <TableCell>{sede.direccion}</TableCell>
                                <TableCell>{sede.telefono}</TableCell>
                                <TableCell>{sede.email}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={sede.activo ? 'Activo' : 'Inactivo'}
                                        color={sede.activo ? 'success' : 'default'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <IconButton onClick={() => handleOpen(sede)} size="small">
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleDelete(sede.id)} size="small" color="error">
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>{editMode ? 'Editar Sede' : 'Nueva Sede'}</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Nombre"
                        value={currentSede.nombre}
                        onChange={(e) => setCurrentSede({ ...currentSede, nombre: e.target.value })}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="Dirección"
                        value={currentSede.direccion}
                        onChange={(e) => setCurrentSede({ ...currentSede, direccion: e.target.value })}
                        margin="normal"
                        multiline
                        rows={2}
                    />
                    <TextField
                        fullWidth
                        label="Teléfono"
                        value={currentSede.telefono}
                        onChange={(e) => setCurrentSede({ ...currentSede, telefono: e.target.value })}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={currentSede.email}
                        onChange={(e) => setCurrentSede({ ...currentSede, email: e.target.value })}
                        margin="normal"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancelar</Button>
                    <Button onClick={handleSave} variant="contained">
                        Guardar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
