import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, TextField,
    Select, MenuItem, FormControl, InputLabel, Grid
} from '@mui/material';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export default function Auditoria() {
    const [audits, setAudits] = useState([]);
    const [filters, setFilters] = useState({
        tabla: '',
        accion: '',
        usuario: ''
    });

    useEffect(() => {
        fetchAudits();
    }, [filters]);

    const fetchAudits = async () => {
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams();
            if (filters.tabla) params.append('tabla', filters.tabla);
            if (filters.accion) params.append('accion', filters.accion);
            if (filters.usuario) params.append('usuario', filters.usuario);

            const response = await axios.get(`${API_URL}/auditoria/?${params}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAudits(response.data);
        } catch (error) {
            console.error('Error fetching audits:', error);
        }
    };

    const getAccionColor = (accion) => {
        switch (accion) {
            case 'CREATE': return 'success';
            case 'UPDATE': return 'info';
            case 'DELETE': return 'error';
            case 'VALIDATE': return 'primary';
            case 'REJECT': return 'warning';
            case 'CANCEL': return 'error';
            default: return 'default';
        }
    };

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 3 }}>
                Auditoría del Sistema
            </Typography>

            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Tabla</InputLabel>
                            <Select
                                value={filters.tabla}
                                onChange={(e) => setFilters({ ...filters, tabla: e.target.value })}
                            >
                                <MenuItem value="">Todas</MenuItem>
                                <MenuItem value="Payment">Pagos</MenuItem>
                                <MenuItem value="Client">Clientes</MenuItem>
                                <MenuItem value="Service">Servicios</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Acción</InputLabel>
                            <Select
                                value={filters.accion}
                                onChange={(e) => setFilters({ ...filters, accion: e.target.value })}
                            >
                                <MenuItem value="">Todas</MenuItem>
                                <MenuItem value="CREATE">Crear</MenuItem>
                                <MenuItem value="UPDATE">Actualizar</MenuItem>
                                <MenuItem value="DELETE">Eliminar</MenuItem>
                                <MenuItem value="VALIDATE">Validar</MenuItem>
                                <MenuItem value="REJECT">Rechazar</MenuItem>
                                <MenuItem value="CANCEL">Anular</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Usuario"
                            value={filters.usuario}
                            onChange={(e) => setFilters({ ...filters, usuario: e.target.value })}
                        />
                    </Grid>
                </Grid>
            </Paper>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Fecha</TableCell>
                            <TableCell>Usuario</TableCell>
                            <TableCell>Tabla</TableCell>
                            <TableCell>Acción</TableCell>
                            <TableCell>Registro ID</TableCell>
                            <TableCell>Detalles</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {audits.map((audit) => (
                            <TableRow key={audit.id}>
                                <TableCell>
                                    {new Date(audit.fecha).toLocaleString('es-PE')}
                                </TableCell>
                                <TableCell>{audit.usuario_nombre}</TableCell>
                                <TableCell>{audit.tabla}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={audit.accion_display}
                                        color={getAccionColor(audit.accion)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>{audit.registro_id}</TableCell>
                                <TableCell>
                                    <pre style={{ margin: 0, fontSize: '0.75rem' }}>
                                        {JSON.stringify(audit.detalle, null, 2)}
                                    </pre>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
