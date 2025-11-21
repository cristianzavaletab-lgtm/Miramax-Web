import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
    Container, Grid, Paper, Typography, Box, CircularProgress,
    Card, CardContent, Divider
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import ReceiptIcon from '@mui/icons-material/Receipt';
import SedeSelector from '../components/SedeSelector';

const StatCard = ({ title, value, icon, color, subtitle }) => (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'visible' }}>
        <Box
            sx={{
                position: 'absolute',
                top: -20,
                left: 20,
                bgcolor: color,
                color: 'white',
                p: 2,
                borderRadius: 2,
                boxShadow: 3
            }}
        >
            {icon}
        </Box>
        <CardContent sx={{ pt: 4, textAlign: 'right' }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
                {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                {value}
            </Typography>
            {subtitle && (
                <>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="caption" color="text.secondary">
                        {subtitle}
                    </Typography>
                </>
            )}
        </CardContent>
    </Card>
);

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedSede, setSelectedSede] = useState('');

    useEffect(() => {
        fetchStats();
    }, [selectedSede]);

    const fetchStats = async () => {
        setLoading(true);
        try {
            let url = 'dashboard/';
            if (selectedSede) {
                url += `?sede=${selectedSede}`;
            }
            const response = await api.get(url);
            setStats(response.data);
        } catch (error) {
            console.error("Error fetching dashboard stats", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 5 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    Dashboard
                </Typography>
                <SedeSelector onSedeChange={setSelectedSede} />
            </Grid>

            <Grid container spacing={4}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Clientes Totales"
                        value={stats?.total_clients || 0}
                        subtitle={`${stats?.active_clients || 0} Activos`}
                        icon={<PeopleIcon fontSize="large" />}
                        color="#1976d2" // Primary Blue
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Recaudación Mes"
                        value={`S/ ${stats?.monthly_revenue || 0}`}
                        subtitle="Pagos validados este mes"
                        icon={<AttachMoneyIcon fontSize="large" />}
                        color="#2e7d32" // Success Green
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Deuda Pendiente"
                        value={`S/ ${stats?.total_debt || 0}`}
                        subtitle="Total acumulado por cobrar"
                        icon={<MoneyOffIcon fontSize="large" />}
                        color="#d32f2f" // Error Red
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Pagos por Validar"
                        value={stats?.pending_payments || 0}
                        subtitle="Requieren atención de Oficina"
                        icon={<ReceiptIcon fontSize="large" />}
                        color="#ed6c02" // Warning Orange
                    />
                </Grid>
            </Grid>

            {/* Future charts or detailed lists could go here */}

        </Container>
    );
};

export default Dashboard;
