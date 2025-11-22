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

const Caserios = () => {
    const [caserios, setCaserios] = useState([]);
    const [distritos, setDistritos] = useState([]);
    const [provincias, setProvincias] = useState([]);
    const [departamentos, setDepartamentos] = useState([]);
    const [open, setOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ name: '', code: '', district: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [filterDist, setFilterDist] = useState('');

    useEffect(() => {
        fetchDepartamentos();
        fetchProvincias();
        fetchDistritos();
        fetchCaserios();
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
        }
    };

    const fetchCaserios = async () => {
        try {
            const response = await api.get('caserios/');
            setCaserios(response.data);
        } catch (error) {
            console.error('Error fetching caserios:', error);
            setError('Error al cargar caseríos');
        }
    };

    const handleOpen = (caserio = null) => {
        if (caserio) {
            setEditingId(caserio.id);
            setFormData({ name: caserio.name, code: caserio.code, district: caserio.district });
        } else {
            setEditingId(null);
            setFormData({ name: '', code: '', district: '' });
        }
        setOpen(true);
        setError('');
    };

    const handleClose = () => {
        setOpen(false);
        setEditingId(null);
        setFormData({ name: '', code: '', district: '' });
        setError('');
    };

    const handleSubmit = async () => {
        try {
            if (editingId) {
                await api.put(`caserios/${editingId}/`, formData);
                setSuccess('Caserío actualizado exitosamente');
            } else {
                await api.post('caserios/', formData);
                setSuccess('Caserío creado exitosamente');
            }
            fetchCaserios();
            handleClose();
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            console.error('Error saving caserio:', error);
            if (error.response?.data) {
                const errorMsg = Object.values(error.response.data).flat().join(', ');
                setError(`Error al guardar: ${errorMsg}`);
            } else {
                setError('Error al guardar caserío');
            }
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Está seguro de eliminar este caserío?')) {
            try {
                await api.delete(`caserios/${id}/`);
                setSuccess('Caserío eliminado exitosamente');
                fetchCaserios();
                setTimeout(() => setSuccess(''), 3000);
            } catch (error) {
                console.error('Error deleting caserio:', error);
                setError('Error al eliminar caserío. Puede tener clientes asociados.');
            }
        }
    };

    const getDistrictName = (distId) => {
        const dist = distritos.find(d => d.id === distId);
        return dist ? dist.name : 'N/A';
    };

    const getProvinceName = (distId) => {
        const dist = distritos.find(d => d.id === distId);
        if (dist) {
            const prov = provincias.find(p => p.id === dist.province);
            return prov ? prov.name : 'N/A';
        }
        return 'N/A';
    };

    const getDepartmentName = (distId) => {
        const dist = distritos.find(d => d.id === distId);
        if (dist) {
            const prov = provincias.find(p => p.id === dist.province);
            if (prov) {
                const dept = departamentos.find(d => d.id === prov.department);
                return dept ? dept.name : 'N/A';
            }
        }
        return 'N/A';
    };

    const filteredCaserios = filterDist
        ? caserios.filter(c => c.district === parseInt(filterDist))
        : caserios;

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    Gestión de Caseríos
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpen()}
                >
                    Nuevo Caserío
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

            <Box sx={{ mb: 2 }}>
                <FormControl sx={{ minWidth: 250 }}>
                    <InputLabel>Filtrar por Distrito</InputLabel>
                    <Select
                        value={filterDist}
                        onChange={(e) => setFilterDist(e.target.value)}
                        label="Filtrar por Distrito"
                    >
                        <MenuItem value="">Todos</MenuItem>
                        {distritos.map((dist) => (
                            <MenuItem key={dist.id} value={dist.id}>{dist.name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: 'primary.main' }}>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Código</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nombre</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Distrito</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Provincia</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Departamento</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredCaserios.map((cas) => (
                            <TableRow key={cas.id} hover>
                                <TableCell>{cas.code}</TableCell>
                                <TableCell>{cas.name}</TableCell>
                                <TableCell>{getDistrictName(cas.district)}</TableCell>
                                <TableCell>{getProvinceName(cas.district)}</TableCell>
                                <TableCell>{getDepartmentName(cas.district)}</TableCell>
                                <TableCell align="right">
                                    <IconButton
                                        color="primary"
                                        onClick={() => handleOpen(cas)}
                                        size="small"
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        color="error"
                                        onClick={() => handleDelete(cas.id)}
                                        size="small"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredCaserios.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    No hay caseríos registrados
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingId ? 'Editar Caserío' : 'Nuevo Caserío'}
                </DialogTitle>
                <DialogContent>
                    <FormControl fullWidth margin="normal" required>
                        <InputLabel>Distrito</InputLabel>
                        <Select
                            value={formData.district}
                            onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                            label="Distrito"
                        >
                            {distritos.map((dist) => (
                                <MenuItem key={dist.id} value={dist.id}>
                                    {dist.name} - {getProvinceName(dist.id)}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        fullWidth
                        label="Nombre del Caserío"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        margin="normal"
                        required
                        autoFocus
                        helperText="Ej: Villa del Mar, Los Pinos, Santa Rosa"
                    />
                    <TextField
                        fullWidth
                        label="Código del Caserío"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        margin="normal"
                        required
                        inputProps={{ maxLength: 10 }}
                        helperText="Código único (max 10 caracteres). Ej: VM, LP, SR"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancelar</Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={!formData.name.trim() || !formData.code.trim() || !formData.district}
                    >
                        {editingId ? 'Actualizar' : 'Crear'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Caserios;
