import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Button, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField, Select, MenuItem,
    FormControl, InputLabel, Chip
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import api from '../api/axios';

export default function Visitas() {
    const [visitas, setVisitas] = useState([]);
    const [clients, setClients] = useState([]);
    const [open, setOpen] = useState(false);
    const [newVisit, setNewVisit] = useState({
        cliente: '',
        estado: '',
        notas: ''
    });

    useEffect(() => {
        fetchVisitas();
        fetchClients();
    }, []);

    const fetchVisitas = async () => {
        try {
            const response = await api.get('visitas/');
            setVisitas(response.data);
        } catch (error) {
            console.error('Error fetching visitas:', error);
        }
    };

    const fetchClients = async () => {
        try {
            const response = await api.get('clients/');
            setClients(response.data);
        } catch (error) {
            console.error('Error fetching clients:', error);
        }
    };

    const handleOpen = () => {
        setNewVisit({ cliente: '', estado: '', notas: '' });
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleSave = async () => {
        try {
            await api.post('visitas/', newVisit);
            fetchVisitas();
            handleClose();
        } catch (error) {
            console.error('Error saving visita:', error);
        }
    };

    const getEstadoColor = (estado) => {
        switch (estado) {
            case 'pago': return 'success';
            case 'no_estaba': return 'warning';
            case 'se_mudo': return 'error';
            case 'no_responde': return 'default';
            default: return 'default';
        }
    };

    const getEstadoLabel = (estado) => {
        const labels = {
            'pago': 'Pagó',
            'no_estaba': 'No estaba',
            'se_mudo': 'Se mudó',
            'no_responde': 'No responde'
        };
        return labels[estado] || estado;
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4">Registro de Visitas</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpen}
                >
                    Registrar Visita
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Fecha</TableCell>
                            <TableCell>Cliente</TableCell>
                            <TableCell>Cobrador</TableCell>
                            <TableCell>Estado</TableCell>
                            <TableCell>Notas</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {visitas.map((visita) => (
                            <TableRow key={visita.id}>
                                <TableCell>
                                    {new Date(visita.fecha).toLocaleString('es-PE')}
                                </TableCell>
                                <TableCell>{visita.cliente_nombre}</TableCell>
                                <TableCell>{visita.cobrador_nombre}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={getEstadoLabel(visita.estado)}
                                        color={getEstadoColor(visita.estado)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>{visita.notas}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>Registrar Visita</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Cliente</InputLabel>
                        <Select
                            value={newVisit.cliente}
                            onChange={(e) => setNewVisit({ ...newVisit, cliente: e.target.value })}
                        >
                            {clients.map((client) => (
                                <MenuItem key={client.id} value={client.id}>
                                    {client.code} - {client.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth margin="normal">
                        <InputLabel>Estado</InputLabel>
                        <Select
                            value={newVisit.estado}
                            onChange={(e) => setNewVisit({ ...newVisit, estado: e.target.value })}
                        >
                            <MenuItem value="pago">Pagó</MenuItem>
                            <MenuItem value="no_estaba">No estaba</MenuItem>
                            <MenuItem value="se_mudo">Se mudó</MenuItem>
                            <MenuItem value="no_responde">No responde</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        fullWidth
                        label="Notas"
                        value={newVisit.notas}
                        onChange={(e) => setNewVisit({ ...newVisit, notas: e.target.value })}
                        margin="normal"
                        multiline
                        rows={3}
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
