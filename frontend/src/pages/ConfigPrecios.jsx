import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Button, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField, Select, MenuItem,
    FormControl, InputLabel, IconButton
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon } from '@mui/icons-material';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export default function ConfigPrecios() {
    const [precios, setPrecios] = useState([]);
    const [caserios, setCaserios] = useState([]);
    const [open, setOpen] = useState(false);
    const [currentPrecio, setCurrentPrecio] = useState({
        zona: '',
        tipo_servicio: '',
        precio_base: '',
        vigencia_desde: new Date().toISOString().split('T')[0],
        activo: true
    });

    useEffect(() => {
        fetchPrecios();
        fetchCaserios();
    }, []);

    const fetchPrecios = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/precios-zona/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPrecios(response.data);
        } catch (error) {
            console.error('Error fetching precios:', error);
        }
    };

    const fetchCaserios = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/caserios/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCaserios(response.data);
        } catch (error) {
            console.error('Error fetching caserios:', error);
        }
    };

    const handleOpen = (precio = null) => {
        if (precio) {
            setCurrentPrecio(precio);
        } else {
            setCurrentPrecio({
                zona: '',
                tipo_servicio: '',
                precio_base: '',
                vigencia_desde: new Date().toISOString().split('T')[0],
                activo: true
            });
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem('token');
            if (currentPrecio.id) {
                await axios.put(`${API_URL}/precios-zona/${currentPrecio.id}/`, currentPrecio, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post(`${API_URL}/precios-zona/`, currentPrecio, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            fetchPrecios();
            handleClose();
        } catch (error) {
            console.error('Error saving precio:', error);
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4">Configuración de Precios por Zona</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpen()}
                >
                    Nuevo Precio
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Zona</TableCell>
                            <TableCell>Tipo Servicio</TableCell>
                            <TableCell>Precio Base</TableCell>
                            <TableCell>Vigencia Desde</TableCell>
                            <TableCell>Estado</TableCell>
                            <TableCell>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {precios.map((precio) => (
                            <TableRow key={precio.id}>
                                <TableCell>{precio.zona_nombre}</TableCell>
                                <TableCell>{precio.tipo_servicio === 'internet' ? 'Internet' : 'Cable'}</TableCell>
                                <TableCell>S/. {precio.precio_base}</TableCell>
                                <TableCell>{new Date(precio.vigencia_desde).toLocaleDateString('es-PE')}</TableCell>
                                <TableCell>{precio.activo ? 'Activo' : 'Inactivo'}</TableCell>
                                <TableCell>
                                    <IconButton onClick={() => handleOpen(precio)} size="small">
                                        <EditIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>{currentPrecio.id ? 'Editar Precio' : 'Nuevo Precio'}</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Zona (Caserío)</InputLabel>
                        <Select
                            value={currentPrecio.zona}
                            onChange={(e) => setCurrentPrecio({ ...currentPrecio, zona: e.target.value })}
                        >
                            {caserios.map((caserio) => (
                                <MenuItem key={caserio.id} value={caserio.id}>
                                    {caserio.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth margin="normal">
                        <InputLabel>Tipo de Servicio</InputLabel>
                        <Select
                            value={currentPrecio.tipo_servicio}
                            onChange={(e) => setCurrentPrecio({ ...currentPrecio, tipo_servicio: e.target.value })}
                        >
                            <MenuItem value="internet">Internet</MenuItem>
                            <MenuItem value="cable">Cable</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        fullWidth
                        label="Precio Base (S/.)"
                        type="number"
                        value={currentPrecio.precio_base}
                        onChange={(e) => setCurrentPrecio({ ...currentPrecio, precio_base: e.target.value })}
                        margin="normal"
                    />

                    <TextField
                        fullWidth
                        label="Vigencia Desde"
                        type="date"
                        value={currentPrecio.vigencia_desde}
                        onChange={(e) => setCurrentPrecio({ ...currentPrecio, vigencia_desde: e.target.value })}
                        margin="normal"
                        InputLabelProps={{ shrink: true }}
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
