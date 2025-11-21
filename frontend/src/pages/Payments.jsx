import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
    Container, Typography, Button, Table, TableBody, TableCell,
    TableHead, TableRow, Paper, Chip, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField, MenuItem, Box, Grid,
    IconButton, InputAdornment
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SearchIcon from '@mui/icons-material/Search';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';

import SedeSelector from '../components/SedeSelector';
import PaymentModal from '../components/PaymentModal';

const Payments = () => {
    const { user } = useAuth();
    const [payments, setPayments] = useState([]);
    const [filteredPayments, setFilteredPayments] = useState([]);
    const [clients, setClients] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSede, setSelectedSede] = useState('');
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        client: '',
        amount: '',
        method: 'cash',
        reference_number: '',
        proof_image: null
    });

    const isOficina = user?.role === 'oficina' || user?.role === 'admin';

    useEffect(() => {
        fetchPayments();
        fetchClients();
    }, [selectedSede]);

    useEffect(() => {
        filterPayments();
    }, [searchTerm, payments]);

    const fetchPayments = async () => {
        try {
            let url = 'payments/';
            if (selectedSede) {
                url += `?sede=${selectedSede}`; // Note: Backend needs to support this filter on PaymentViewSet
            }
            const response = await api.get(url);
            setPayments(response.data);
        } catch (error) {
            console.error("Error fetching payments", error);
        }
    };

    const fetchClients = async () => {
        try {
            const response = await api.get('clients/');
            setClients(response.data);
        } catch (error) {
            console.error("Error fetching clients", error);
        }
    };

    const filterPayments = () => {
        const lowerSearch = searchTerm.toLowerCase();
        const filtered = payments.filter(payment =>
            (payment.client_name || '').toLowerCase().includes(lowerSearch) ||
            (payment.method || '').toLowerCase().includes(lowerSearch) ||
            (payment.validation_status || '').toLowerCase().includes(lowerSearch)
        );
        setFilteredPayments(filtered);
    };
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleValidate = async (id, status) => {
        try {
            await api.patch(`payments/${id}/validate_payment/`, { status });
            fetchPayments();
        } catch (error) {
            console.error("Error validating payment", error);
        }
    };

    const handleDownloadReceipt = (url) => {
        if (url) {
            window.open(`http://localhost:8000${url}`, '_blank');
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Pagos
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <SedeSelector onSedeChange={setSelectedSede} />
                    <Button variant="contained" color="primary" onClick={handleOpen} sx={{ ml: 2 }}>
                        Registrar Pago
                    </Button>
                </Box>
            </Grid>

            <Box sx={{ mb: 3 }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Buscar por cliente, método o estado..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                />
            </Box>

            <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <Table>
                    <TableHead sx={{ bgcolor: 'grey.200' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Cliente</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Monto</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Fecha</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Método</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Comprobante</TableCell>
                            {isOficina && <TableCell sx={{ fontWeight: 'bold' }}>Acciones</TableCell>}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredPayments.map((payment) => (
                            <TableRow key={payment.id} hover>
                                <TableCell>{payment.client_name || payment.client}</TableCell>
                                <TableCell>S/ {payment.amount}</TableCell>
                                <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                                <TableCell>{payment.method}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={payment.validation_status === 'validated' ? 'Validado' : payment.validation_status === 'rejected' ? 'Rechazado' : 'Pendiente'}
                                        color={payment.validation_status === 'validated' ? 'success' : payment.validation_status === 'rejected' ? 'error' : 'warning'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        {payment.proof_image && (
                                            <IconButton
                                                component="a"
                                                href={payment.proof_image}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                color="primary"
                                                title="Ver Comprobante"
                                            >
                                                <ImageIcon />
                                            </IconButton>
                                        )}
                                        {payment.receipt_file && (
                                            <IconButton
                                                component="a"
                                                href={`http://localhost:8000${payment.receipt_file}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                color="secondary"
                                                title="Descargar Recibo"
                                            >
                                                <PictureAsPdfIcon />
                                            </IconButton>
                                        )}
                                    </Box>
                                </TableCell>
                                {isOficina && (
                                    <TableCell>
                                        {payment.validation_status === 'pending' && (
                                            <>
                                                <IconButton
                                                    color="success"
                                                    onClick={() => handleValidate(payment.id, 'validated')}
                                                    title="Validar"
                                                >
                                                    <CheckCircleIcon />
                                                </IconButton>
                                                <IconButton
                                                    color="error"
                                                    onClick={() => handleValidate(payment.id, 'rejected')}
                                                    title="Rechazar"
                                                >
                                                    <CancelIcon />
                                                </IconButton>
                                            </>
                                        )}
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Paper>

            <PaymentModal
                open={open}
                onClose={handleClose}
                onSuccess={fetchPayments}
            />
        </Container>
    );
};

export default Payments;
