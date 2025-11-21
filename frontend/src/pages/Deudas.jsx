import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
    Container, Typography, Button, Table, TableBody, TableCell,
    TableHead, TableRow, Paper, Chip, Box, Grid, TextField,
    InputAdornment, IconButton, CircularProgress, Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

const Deudas = () => {
    const { user } = useAuth();
    const [deudas, setDeudas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        month: new Date().toISOString().slice(0, 7), // YYYY-MM
        status: ''
    });
    const [message, setMessage] = useState(null);

    const isAdminOrOffice = user?.role === 'admin' || user?.role === 'oficina';

    useEffect(() => {
        fetchDeudas();
    }, [filters]);

    const fetchDeudas = async () => {
        setLoading(true);
        try {
            let url = `monthly-fees/?month=${filters.month}`;
            if (filters.status) url += `&status=${filters.status}`;

            const response = await api.get(url);
            setDeudas(response.data);
        } catch (error) {
            console.error("Error fetching debts", error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        if (!window.confirm('¿Estás seguro de generar las deudas para este mes? Esto creará registros para todos los clientes activos.')) return;

        setGenerating(true);
        try {
            await api.post('monthly-fees/generate/');
            setMessage({ type: 'success', text: 'Proceso de generación iniciado correctamente.' });
            setTimeout(() => fetchDeudas(), 2000); // Refresh after a bit
        } catch (error) {
            console.error("Error generating debts", error);
            setMessage({ type: 'error', text: 'Error al iniciar la generación.' });
        } finally {
            setGenerating(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'paid': return 'success';
            case 'pending': return 'warning';
            case 'expired': return 'error';
            case 'partial': return 'info';
            default: return 'default';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'paid': return 'Pagado';
            case 'pending': return 'Pendiente';
            case 'expired': return 'Vencido';
            case 'partial': return 'Parcial';
            default: status;
        }
    };

    const filteredDeudas = deudas.filter(deuda =>
        deuda.client_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    Gestión de Deudas Mensuales
                </Typography>
                <Box>
                    <Button
                        startIcon={<RefreshIcon />}
                        onClick={fetchDeudas}
                        sx={{ mr: 1 }}
                    >
                        Actualizar
                    </Button>
                    {isAdminOrOffice && (
                        <Button
                            variant="contained"
                            color="secondary"
                            startIcon={generating ? <CircularProgress size={20} color="inherit" /> : <PlayArrowIcon />}
                            onClick={handleGenerate}
                            disabled={generating}
                        >
                            Generar Deudas
                        </Button>
                    )}
                </Box>
            </Grid>

            {message && (
                <Alert severity={message.type} onClose={() => setMessage(null)} sx={{ mb: 2 }}>
                    {message.text}
                </Alert>
            )}

            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            label="Buscar Cliente"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <TextField
                            fullWidth
                            type="month"
                            label="Mes"
                            value={filters.month}
                            onChange={(e) => setFilters({ ...filters, month: e.target.value })}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <TextField
                            select
                            fullWidth
                            label="Estado"
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            SelectProps={{ native: true }}
                        >
                            <option value="">Todos</option>
                            <option value="pending">Pendiente</option>
                            <option value="paid">Pagado</option>
                            <option value="expired">Vencido</option>
                        </TextField>
                    </Grid>
                </Grid>
            </Paper>

            <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <Table>
                    <TableHead sx={{ bgcolor: 'grey.200' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Cliente</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Servicio</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Mes</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Vencimiento</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Monto</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Pagado</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : filteredDeudas.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                                    No se encontraron deudas para este filtro.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredDeudas.map((deuda) => (
                                <TableRow key={deuda.id} hover>
                                    <TableCell>{deuda.client_name}</TableCell>
                                    <TableCell>{deuda.service_type}</TableCell>
                                    <TableCell>{deuda.month_date}</TableCell>
                                    <TableCell>{deuda.due_date || '-'}</TableCell>
                                    <TableCell>S/ {deuda.amount}</TableCell>
                                    <TableCell>S/ {deuda.paid_amount}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={getStatusLabel(deuda.status)}
                                            color={getStatusColor(deuda.status)}
                                            size="small"
                                        />
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Paper>
        </Container>
    );
};

export default Deudas;
