import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import {
    Container, Typography, Box, Paper, Tabs, Tab, Table, TableBody,
    TableCell, TableHead, TableRow, Button, Grid, TextField, Chip
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import SedeSelector from '../components/SedeSelector';

const Reports = () => {
    const [tabValue, setTabValue] = useState(0);
    const [selectedSede, setSelectedSede] = useState('');
    const [debtors, setDebtors] = useState([]);
    const [revenue, setRevenue] = useState({ transactions: [], total_revenue: 0 });
    const [collectors, setCollectors] = useState([]);
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    useEffect(() => {
        if (tabValue === 0) fetchDebtors();
        if (tabValue === 1) fetchRevenue();
        if (tabValue === 2) fetchCollectors();
    }, [tabValue, selectedSede, dateRange]);

    const fetchDebtors = async () => {
        try {
            let url = 'reports/debtors/';
            if (selectedSede) url += `?sede=${selectedSede}`;
            const response = await api.get(url);
            setDebtors(response.data);
        } catch (error) {
            console.error("Error fetching debtors", error);
        }
    };

    const fetchRevenue = async () => {
        try {
            let url = 'reports/revenue/';
            const params = new URLSearchParams();
            if (selectedSede) params.append('sede', selectedSede);
            if (dateRange.start) params.append('start_date', dateRange.start);
            if (dateRange.end) params.append('end_date', dateRange.end);

            const response = await api.get(`${url}?${params.toString()}`);
            setRevenue(response.data);
        } catch (error) {
            console.error("Error fetching revenue", error);
        }
    };

    const fetchCollectors = async () => {
        try {
            let url = 'reports/collectors/';
            if (selectedSede) url += `?sede=${selectedSede}`;
            const response = await api.get(url);
            setCollectors(response.data);
        } catch (error) {
            console.error("Error fetching collectors", error);
        }
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleDateChange = (e) => {
        setDateRange({ ...dateRange, [e.target.name]: e.target.value });
    };

    // Simple CSV Export
    const exportToCSV = (data, filename) => {
        const csvContent = "data:text/csv;charset=utf-8,"
            + data.map(e => Object.values(e).join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    Reportes Avanzados
                </Typography>
                <SedeSelector onSedeChange={setSelectedSede} />
            </Grid>

            <Paper sx={{ mb: 3 }}>
                <Tabs value={tabValue} onChange={handleTabChange} indicatorColor="primary" textColor="primary" centered>
                    <Tab label="Morosos" />
                    <Tab label="Ingresos" />
                    <Tab label="Efectividad Cobradores" />
                </Tabs>
            </Paper>

            {/* Tab Panel: Morosos */}
            {tabValue === 0 && (
                <Paper sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                        <Button startIcon={<DownloadIcon />} onClick={() => exportToCSV(debtors, 'morosos.csv')}>
                            Exportar CSV
                        </Button>
                    </Box>
                    <Table>
                        <TableHead sx={{ bgcolor: 'grey.200' }}>
                            <TableRow>
                                <TableCell>Cliente</TableCell>
                                <TableCell>Zona</TableCell>
                                <TableCell>Teléfono</TableCell>
                                <TableCell>Meses Deuda</TableCell>
                                <TableCell>Total Deuda</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {debtors.map((d, i) => (
                                <TableRow key={i}>
                                    <TableCell>{d.client__name} ({d.client__code})</TableCell>
                                    <TableCell>{d.client__caserio__name}</TableCell>
                                    <TableCell>{d.client__phone}</TableCell>
                                    <TableCell>{d.months_owed}</TableCell>
                                    <TableCell sx={{ color: 'error.main', fontWeight: 'bold' }}>
                                        S/ {d.total_debt}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Paper>
            )}

            {/* Tab Panel: Ingresos */}
            {tabValue === 1 && (
                <Paper sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                        <TextField
                            label="Desde"
                            type="date"
                            name="start"
                            InputLabelProps={{ shrink: true }}
                            onChange={handleDateChange}
                        />
                        <TextField
                            label="Hasta"
                            type="date"
                            name="end"
                            InputLabelProps={{ shrink: true }}
                            onChange={handleDateChange}
                        />
                        <Box sx={{ flexGrow: 1 }} />
                        <Typography variant="h6" color="success.main">
                            Total: S/ {revenue.total_revenue}
                        </Typography>
                        <Button startIcon={<DownloadIcon />} onClick={() => exportToCSV(revenue.transactions, 'ingresos.csv')}>
                            Exportar CSV
                        </Button>
                    </Box>
                    <Table>
                        <TableHead sx={{ bgcolor: 'grey.200' }}>
                            <TableRow>
                                <TableCell>Fecha</TableCell>
                                <TableCell>Cliente</TableCell>
                                <TableCell>Método</TableCell>
                                <TableCell>Monto</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {revenue.transactions.map((t, i) => (
                                <TableRow key={i}>
                                    <TableCell>{new Date(t.date).toLocaleDateString()}</TableCell>
                                    <TableCell>{t.client__name}</TableCell>
                                    <TableCell>{t.method}</TableCell>
                                    <TableCell sx={{ color: 'success.main', fontWeight: 'bold' }}>
                                        S/ {t.amount}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Paper>
            )}

            {/* Tab Panel: Cobradores */}
            {tabValue === 2 && (
                <Paper sx={{ p: 2 }}>
                    <Table>
                        <TableHead sx={{ bgcolor: 'grey.200' }}>
                            <TableRow>
                                <TableCell>Cobrador</TableCell>
                                <TableCell>Transacciones</TableCell>
                                <TableCell>Total Recaudado</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {collectors.map((c, i) => (
                                <TableRow key={i}>
                                    <TableCell>
                                        {c.client__cobrador_asignado__first_name || c.client__cobrador_asignado__username}
                                    </TableCell>
                                    <TableCell>{c.transaction_count}</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>
                                        S/ {c.total_collected}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Paper>
            )}
        </Container>
    );
};

export default Reports;
