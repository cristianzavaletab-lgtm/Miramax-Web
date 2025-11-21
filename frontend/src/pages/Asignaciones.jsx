import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Select, MenuItem,
    Button, FormControl, InputLabel, Chip
} from '@mui/material';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export default function Asignaciones() {
    const [clients, setClients] = useState([]);
    const [cobradores, setCobradores] = useState([]);
    const [selectedCobrador, setSelectedCobrador] = useState({});

    useEffect(() => {
        fetchClients();
        fetchCobradores();
    }, []);

    const fetchClients = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/clients/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setClients(response.data);
        } catch (error) {
            console.error('Error fetching clients:', error);
        }
    };

    const fetchCobradores = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/users/?role=cobrador`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCobradores(response.data);
        } catch (error) {
            console.error('Error fetching cobradores:', error);
        }
    };

    const handleAssign = async (clientId) => {
        const cobradorId = selectedCobrador[clientId];
        if (!cobradorId) return;

        try {
            const token = localStorage.getItem('token');
            await axios.patch(
                `${API_URL}/clients/${clientId}/`,
                { cobrador_asignado: cobradorId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchClients();
        } catch (error) {
            console.error('Error assigning cobrador:', error);
        }
    };

    const handleUnassign = async (clientId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(
                `${API_URL}/clients/${clientId}/`,
                { cobrador_asignado: null },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchClients();
        } catch (error) {
            console.error('Error unassigning cobrador:', error);
        }
    };

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 3 }}>
                Asignación de Clientes a Cobradores
            </Typography>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Código</TableCell>
                            <TableCell>Cliente</TableCell>
                            <TableCell>DNI</TableCell>
                            <TableCell>Teléfono</TableCell>
                            <TableCell>Cobrador Actual</TableCell>
                            <TableCell>Asignar a</TableCell>
                            <TableCell>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {clients.map((client) => (
                            <TableRow key={client.id}>
                                <TableCell>{client.code}</TableCell>
                                <TableCell>{client.name}</TableCell>
                                <TableCell>{client.dni}</TableCell>
                                <TableCell>{client.phone}</TableCell>
                                <TableCell>
                                    {client.cobrador_asignado ? (
                                        <Chip
                                            label={cobradores.find(c => c.id === client.cobrador_asignado)?.username || 'N/A'}
                                            color="primary"
                                            size="small"
                                        />
                                    ) : (
                                        <Chip label="Sin asignar" size="small" />
                                    )}
                                </TableCell>
                                <TableCell>
                                    <FormControl size="small" sx={{ minWidth: 150 }}>
                                        <Select
                                            value={selectedCobrador[client.id] || ''}
                                            onChange={(e) =>
                                                setSelectedCobrador({
                                                    ...selectedCobrador,
                                                    [client.id]: e.target.value
                                                })
                                            }
                                        >
                                            <MenuItem value="">Seleccionar...</MenuItem>
                                            {cobradores.map((cobrador) => (
                                                <MenuItem key={cobrador.id} value={cobrador.id}>
                                                    {cobrador.username}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </TableCell>
                                <TableCell>
                                    <Button
                                        size="small"
                                        variant="contained"
                                        onClick={() => handleAssign(client.id)}
                                        disabled={!selectedCobrador[client.id]}
                                        sx={{ mr: 1 }}
                                    >
                                        Asignar
                                    </Button>
                                    {client.cobrador_asignado && (
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            color="error"
                                            onClick={() => handleUnassign(client.id)}
                                        >
                                            Quitar
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
