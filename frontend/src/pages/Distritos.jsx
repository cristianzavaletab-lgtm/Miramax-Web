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

const Distritos = () => {
    const [distritos, setDistritos] = useState([]);
    const [provincias, setProvincias] = useState([]);
    const [departamentos, setDepartamentos] = useState([]);
    const [open, setOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ name: '', province: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [filterProv, setFilterProv] = useState('');

    useEffect(() => {
        fetchDepartamentos();
        fetchProvincias();
        fetchDistritos();
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
        }
    };

    const fetchDistritos = async () => {
        try {
            const response = await api.get('districts/');
            setDistritos(response.data);
        } catch (error) {
            console.error('Error fetching distritos:', error);
            setError('Error al cargar distritos');
        }
    };

    const handleOpen = (distrito = null) => {
        if (distrito) {
            setEditingId(distrito.id);
            setFormData({ name: distrito.name, province: distrito.province });
        } else {
            setEditingId(null);
            setFormData({ name: '', province: '' });
        }
        setOpen(true);
        setError('');
    };

    const handleClose = () => {
        setOpen(false);
        setEditingId(null);
        setFormData({ name: '', province: '' });
        setError('');
    };

    const handleSubmit = async () => {
        try {
            if (editingId) {
                await api.put(`districts/${editingId}/`, formData);
                setSuccess('Distrito actualizado exitosamente');
            } else {
                await api.post('districts/', formData);
                setSuccess('Distrito creado exitosamente');
            }
            fetchDistritos();
            handleClose();
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            console.error('Error saving distrito:', error);
            setError('Error al guardar distrito');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Está seguro de eliminar este distrito? Esto eliminará todos sus caseríos asociados.')) {
            try {
                await api.delete(`districts/${id}/`);
                setSuccess('Distrito eliminado exitosamente');
                fetchDistritos();
                setTimeout(() => setSuccess(''), 3000);
            } catch (error) {
                console.error('Error deleting distrito:', error);
                setError('Error al eliminar distrito. Puede tener datos asociados.');
            }
        }
    };

    const getProvinceName = (provId) => {
        const prov = provincias.find(p => p.id === provId);
        return prov ? prov.name : 'N/A';
    };

    const getDepartmentName = (provId) => {
        const prov = provincias.find(p => p.id === provId);
        if (prov) {
            const dept = departamentos.find(d => d.id === prov.department);
            return dept ? dept.name : 'N/A';
        }
        return 'N/A';
    };

    const filteredDistritos = filterProv
        ? distritos.filter(d => d.province === parseInt(filterProv))
        : distritos;

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    Gestión de Distritos
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpen()}
                >
                    Nuevo Distrito
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

            <Box sx={{ mb: 2 }}>
                <FormControl sx={{ minWidth: 250 }}>
                    <InputLabel>Filtrar por Provincia</InputLabel>
                    <Select
                        value={filterProv}
                        onChange={(e) => setFilterProv(e.target.value)}
                        label="Filtrar por Provincia"
                    >
                        <MenuItem value="">Todos</MenuItem>
                        {provincias.map((prov) => (
                            <MenuItem key={prov.id} value={prov.id}>{prov.name}</MenuItem>
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
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Provincia</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Departamento</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredDistritos.map((dist) => (
                            <TableRow key={dist.id} hover>
                                <TableCell>{dist.id}</TableCell>
                                <TableCell>{dist.name}</TableCell>
                                <TableCell>{getProvinceName(dist.province)}</TableCell>
                                <TableCell>{getDepartmentName(dist.province)}</TableCell>
                                <TableCell align="right">
                                    <IconButton
                                        color="primary"
                                        onClick={() => handleOpen(dist)}
                                        size="small"
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        color="error"
                                        onClick={() => handleDelete(dist.id)}
                                        size="small"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredDistritos.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    No hay distritos registrados
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingId ? 'Editar Distrito' : 'Nuevo Distrito'}
                </DialogTitle>
                <DialogContent>
                    <FormControl fullWidth margin="normal" required>
                        <InputLabel>Provincia</InputLabel>
                        <Select
                            value={formData.province}
                            onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                            label="Provincia"
                        >
                            {provincias.map((prov) => (
                                <MenuItem key={prov.id} value={prov.id}>
                                    {prov.name} ({getDepartmentName(prov.id)})
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        fullWidth
                        label="Nombre del Distrito"
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
                        disabled={!formData.name.trim() || !formData.province}
                    >
                        {editingId ? 'Actualizar' : 'Crear'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Distritos;
