import React, { useState, useEffect } from 'react';
import {
    Box, Paper, Typography, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, IconButton, Dialog,
    DialogTitle, DialogContent, DialogActions, TextField, Alert,
    MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../api/axios';

const Provincias = () => {
    const [provincias, setProvincias] = useState([]);
    const [departamentos, setDepartamentos] = useState([]);
    const [open, setOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ name: '', department: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [filterDept, setFilterDept] = useState('');

    useEffect(() => {
        fetchDepartamentos();
        fetchProvincias();
    }, []);

    const fetchDepartamentos = async () => {
        try {
            const response = await api.get('departments/');
            setDepartamentos(response.data);
        } catch (error) {
            console.error('Error fetching departamentos:', error);
        }
    };

    const fetchProvincias = async () => {
        try {
            const response = await api.get('provinces/');
            setProvincias(response.data);
        } catch (error) {
            console.error('Error fetching provincias:', error);
            setError('Error al cargar provincias');
        }
    };

    const handleOpen = (provincia = null) => {
        if (provincia) {
            setEditingId(provincia.id);
            setFormData({ name: provincia.name, department: provincia.department });
        } else {
            setEditingId(null);
            setFormData({ name: '', department: '' });
        }
        setOpen(true);
        setError('');
    };

    const handleClose = () => {
        setOpen(false);
        setEditingId(null);
        setFormData({ name: '', department: '' });
        setError('');
    };

    const handleSubmit = async () => {
        try {
            if (editingId) {
                await api.put(`provinces/${editingId}/`, formData);
                setSuccess('Provincia actualizada exitosamente');
            } else {
                await api.post('provinces/', formData);
                setSuccess('Provincia creada exitosamente');
            }
            fetchProvincias();
            handleClose();
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            console.error('Error saving provincia:', error);
            setError('Error al guardar provincia');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Está seguro de eliminar esta provincia? Esto eliminará todos sus distritos y caseríos asociados.')) {
            try {
                await api.delete(`provinces/${id}/`);
                setSuccess('Provincia eliminada exitosamente');
                fetchProvincias();
                setTimeout(() => setSuccess(''), 3000);
            } catch (error) {
                console.error('Error deleting provincia:', error);
                setError('Error al eliminar provincia. Puede tener datos asociados.');
            }
        }
    };

    const getDepartmentName = (deptId) => {
        const dept = departamentos.find(d => d.id === deptId);
        return dept ? dept.name : 'N/A';
    };

    const filteredProvincias = filterDept
        ? provincias.filter(p => p.department === parseInt(filterDept))
        : provincias;

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    Gestión de Provincias
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpen()}
                >
                    Nueva Provincia
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

            <Box sx={{ mb: 2 }}>
                <FormControl sx={{ minWidth: 250 }}>
                    <InputLabel>Filtrar por Departamento</InputLabel>
                    <Select
                        value={filterDept}
                        onChange={(e) => setFilterDept(e.target.value)}
                        label="Filtrar por Departamento"
                    >
                        <MenuItem value="">Todos</MenuItem>
                        {departamentos.map((dept) => (
                            <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: 'primary.main' }}>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ID</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nombre</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Departamento</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredProvincias.map((prov) => (
                            <TableRow key={prov.id} hover>
                                <TableCell>{prov.id}</TableCell>
                                <TableCell>{prov.name}</TableCell>
                                <TableCell>{getDepartmentName(prov.department)}</TableCell>
                                <TableCell align="right">
                                    <IconButton
                                        color="primary"
                                        onClick={() => handleOpen(prov)}
                                        size="small"
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        color="error"
                                        onClick={() => handleDelete(prov.id)}
                                        size="small"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredProvincias.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} align="center">
                                    No hay provincias registradas
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingId ? 'Editar Provincia' : 'Nueva Provincia'}
                </DialogTitle>
                <DialogContent>
                    <FormControl fullWidth margin="normal" required>
                        <InputLabel>Departamento</InputLabel>
                        <Select
                            value={formData.department}
                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                            label="Departamento"
                        >
                            {departamentos.map((dept) => (
                                <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        fullWidth
                        label="Nombre de la Provincia"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        margin="normal"
                        required
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancelar</Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={!formData.name.trim() || !formData.department}
                    >
                        {editingId ? 'Actualizar' : 'Crear'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Provincias;
