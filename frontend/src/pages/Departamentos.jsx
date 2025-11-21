import React, { useState, useEffect } from 'react';
import {
    Box, Paper, Typography, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, IconButton, Dialog,
    DialogTitle, DialogContent, DialogActions, TextField, Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../api/axios';

const Departamentos = () => {
    const [departamentos, setDepartamentos] = useState([]);
    const [open, setOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ name: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchDepartamentos();
    }, []);

    const fetchDepartamentos = async () => {
        try {
            const response = await api.get('departments/');
            setDepartamentos(response.data);
        } catch (error) {
            console.error('Error fetching departamentos:', error);
            setError('Error al cargar departamentos');
        }
    };

    const handleOpen = (departamento = null) => {
        if (departamento) {
            setEditingId(departamento.id);
            setFormData({ name: departamento.name });
        } else {
            setEditingId(null);
            setFormData({ name: '' });
        }
        setOpen(true);
        setError('');
    };

    const handleClose = () => {
        setOpen(false);
        setEditingId(null);
        setFormData({ name: '' });
        setError('');
    };

    const handleSubmit = async () => {
        try {
            if (editingId) {
                await api.put(`departments/${editingId}/`, formData);
                setSuccess('Departamento actualizado exitosamente');
            } else {
                await api.post('departments/', formData);
                setSuccess('Departamento creado exitosamente');
            }
            fetchDepartamentos();
            handleClose();
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            console.error('Error saving departamento:', error);
            setError('Error al guardar departamento');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Está seguro de eliminar este departamento? Esto eliminará todas sus provincias, distritos y caseríos asociados.')) {
            try {
                await api.delete(`departments/${id}/`);
                setSuccess('Departamento eliminado exitosamente');
                fetchDepartamentos();
                setTimeout(() => setSuccess(''), 3000);
            } catch (error) {
                console.error('Error deleting departamento:', error);
                setError('Error al eliminar departamento. Puede tener datos asociados.');
            }
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    Gestión de Departamentos
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpen()}
                >
                    Nuevo Departamento
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: 'primary.main' }}>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ID</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nombre</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {departamentos.map((dept) => (
                            <TableRow key={dept.id} hover>
                                <TableCell>{dept.id}</TableCell>
                                <TableCell>{dept.name}</TableCell>
                                <TableCell align="right">
                                    <IconButton
                                        color="primary"
                                        onClick={() => handleOpen(dept)}
                                        size="small"
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        color="error"
                                        onClick={() => handleDelete(dept.id)}
                                        size="small"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {departamentos.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={3} align="center">
                                    No hay departamentos registrados
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingId ? 'Editar Departamento' : 'Nuevo Departamento'}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Nombre del Departamento"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        margin="normal"
                        required
                        autoFocus
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancelar</Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={!formData.name.trim()}
                    >
                        {editingId ? 'Actualizar' : 'Crear'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Departamentos;
