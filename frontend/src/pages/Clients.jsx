import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import {
    Container, Typography, Button, Table, TableBody, TableCell,
    TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField, MenuItem, Grid, Chip,
    Box, FormControl, InputLabel, Select, Divider, InputAdornment
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import SearchIcon from '@mui/icons-material/Search';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

import SedeSelector from '../components/SedeSelector';
import PaymentModal from '../components/PaymentModal';

const Clients = () => {
    const [clients, setClients] = useState([]);
    const [filteredClients, setFilteredClients] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSede, setSelectedSede] = useState('');
    const [departments, setDepartments] = useState([]);
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [caserios, setCaserios] = useState([]);

    const [open, setOpen] = useState(false);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [selectedClientForPayment, setSelectedClientForPayment] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        dni: '',
        phone: '',
        address: '',
        department: '',
        province: '',
        district: '',
        caserio: '',
        service_type: 'internet',
        service_price: ''
    });

    useEffect(() => {
        fetchClients();
        fetchDepartments();
    }, [selectedSede]);

    useEffect(() => {
        filterClients();
    }, [searchTerm, clients]);

    const handleOpenPayment = (client) => {
        setSelectedClientForPayment(client);
        setPaymentModalOpen(true);
    };

    const handleClosePayment = () => {
        setPaymentModalOpen(false);
        setSelectedClientForPayment(null);
    };

    const fetchClients = async () => {
        try {
            let url = 'clients/';
            if (selectedSede) {
                url += `?sede=${selectedSede}`;
            }
            const response = await api.get(url);
            setClients(response.data);
        } catch (error) {
            console.error("Error fetching clients", error);
        }
    };

    const fetchDepartments = async () => {
        try {
            const response = await api.get('departments/');
            setDepartments(response.data);
        } catch (error) {
            console.error("Error fetching departments", error);
        }
    };

    const filterClients = () => {
        const lowerSearch = searchTerm.toLowerCase();
        const filtered = clients.filter(client =>
            (client.name || '').toLowerCase().includes(lowerSearch) ||
            (client.code || '').toLowerCase().includes(lowerSearch) ||
            (client.dni || '').toLowerCase().includes(lowerSearch)
        );
        setFilteredClients(filtered);
    };

    const handleDepartmentChange = async (e) => {
        const deptId = e.target.value;
        setFormData({ ...formData, department: deptId, province: '', district: '', caserio: '' });
        try {
            const response = await api.get(`provinces/?department=${deptId}`);
            setProvinces(response.data);
        } catch (error) {
            console.error("Error fetching provinces", error);
        }
    };

    const handleProvinceChange = async (e) => {
        const provId = e.target.value;
        setFormData({ ...formData, province: provId, district: '', caserio: '' });
        try {
            const response = await api.get(`districts/?province=${provId}`);
            setDistricts(response.data);
        } catch (error) {
            console.error("Error fetching districts", error);
        }
    };

    const handleDistrictChange = async (e) => {
        const distId = e.target.value;
        setFormData({ ...formData, district: distId, caserio: '' });
        try {
            const response = await api.get(`caserios/?district=${distId}`);
            setCaserios(response.data);
        } catch (error) {
            console.error("Error fetching caserios", error);
        }
    };

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        try {
            const clientData = {
                name: formData.name,
                dni: formData.dni,
                phone: formData.phone,
                address: formData.address,
                caserio: formData.caserio || null
            };
            const clientResponse = await api.post('clients/', clientData);
            const clientId = clientResponse.data.id;

            if (formData.service_price) {
                await api.post('services/', {
                    client: clientId,
                    service_type: formData.service_type,
                    price: formData.service_price
                });
            }

            fetchClients();
            handleClose();
            setFormData({
                name: '', dni: '', phone: '', address: '',
                department: '', province: '', district: '', caserio: '',
                service_type: 'internet', service_price: ''
            });
            alert('Cliente creado exitosamente');
        } catch (error) {
            console.error("Error creating client", error);
            console.error("Error data:", error.response?.data);
            let errorMessage = 'Error al crear cliente';
            if (error.response?.data) {
                const errors = error.response.data;
                errorMessage = Object.entries(errors)
                    .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
                    .join('\n');
            }
            alert(`Error al crear cliente:\n${errorMessage}`);
        }
    };

    const handleWhatsApp = (client) => {
        if (client.phone) {
            const message = `Hola ${client.name}, le saludamos de MIRAMAX.`;
            const url = `https://wa.me/51${client.phone}?text=${encodeURIComponent(message)}`;
            window.open(url, '_blank');
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    Gestión de Clientes
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <SedeSelector onSedeChange={setSelectedSede} />
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={handleOpen}
                        sx={{ borderRadius: 2 }}
                    >
                        Nuevo Cliente
                    </Button>
                </Box>
            </Grid>

            <Box sx={{ mb: 3 }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Buscar por nombre, código o DNI..."
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
                            <TableCell>Cliente</TableCell>
                            <TableCell>DNI</TableCell>
                            <TableCell>Teléfono</TableCell>
                            <TableCell>Dirección / Zona</TableCell>
                            <TableCell>Servicios</TableCell>
                            <TableCell align="center">Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredClients.map((client) => (
                            <TableRow key={client.id} hover>
                                <TableCell>
                                    <Typography variant="subtitle2" fontWeight="bold">
                                        {client.name}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                        {client.code}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                        {client.caserio_name || 'Sin zona'}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    {client.active_services && client.active_services.map((service, idx) => (
                                        <Chip
                                            key={idx}
                                            label={service}
                                            size="small"
                                            color="primary"
                                            variant="outlined"
                                            sx={{ mr: 0.5 }}
                                        />
                                    ))}
                                </TableCell>
                                <TableCell align="center">
                                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            color="success"
                                            startIcon={<AttachMoneyIcon />}
                                            onClick={() => handleOpenPayment(client)}
                                        >
                                            Pagar
                                        </Button>
                                        <IconButton color="primary" size="small">
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton color="error" size="small">
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredClients.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                    <Typography color="textSecondary">
                                        No se encontraron clientes
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Paper>

            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>Nuevo Cliente</DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="h6" gutterBottom>Datos Personales</Typography>
                            <TextField margin="dense" label="Nombre Completo" name="name" fullWidth value={formData.name} onChange={handleChange} />
                            <TextField margin="dense" label="DNI" name="dni" fullWidth value={formData.dni} onChange={handleChange} />
                            <TextField margin="dense" label="Teléfono" name="phone" fullWidth value={formData.phone} onChange={handleChange} />
                            <TextField margin="dense" label="Dirección" name="address" fullWidth multiline rows={2} value={formData.address} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant="h6" gutterBottom>Ubicación (Zona)</Typography>
                            <FormControl fullWidth margin="dense">
                                <InputLabel>Departamento</InputLabel>
                                <Select value={formData.department} label="Departamento" onChange={handleDepartmentChange}>
                                    {departments.map(d => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
                                </Select>
                            </FormControl>
                            <FormControl fullWidth margin="dense" disabled={!formData.department}>
                                <InputLabel>Provincia</InputLabel>
                                <Select value={formData.province} label="Provincia" onChange={handleProvinceChange}>
                                    {provinces.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
                                </Select>
                            </FormControl>
                            <FormControl fullWidth margin="dense" disabled={!formData.province}>
                                <InputLabel>Distrito</InputLabel>
                                <Select value={formData.district} label="Distrito" onChange={handleDistrictChange}>
                                    {districts.map(d => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
                                </Select>
                            </FormControl>
                            <FormControl fullWidth margin="dense" disabled={!formData.district}>
                                <InputLabel>Caserío</InputLabel>
                                <Select name="caserio" value={formData.caserio} label="Caserío" onChange={handleChange}>
                                    {caserios.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="h6" gutterBottom>Servicio Inicial</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <FormControl fullWidth margin="dense">
                                        <InputLabel>Tipo Servicio</InputLabel>
                                        <Select name="service_type" value={formData.service_type} label="Tipo Servicio" onChange={handleChange}>
                                            <MenuItem value="internet">Internet</MenuItem>
                                            <MenuItem value="cable">Cable</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField margin="dense" label="Precio Mensual (S/)" name="service_price" type="number" fullWidth value={formData.service_price} onChange={handleChange} />
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={handleClose} color="secondary">Cancelar</Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary">Guardar</Button>
                </DialogActions>
            </Dialog>

            <PaymentModal
                open={paymentModalOpen}
                onClose={handleClosePayment}
                client={selectedClientForPayment}
                onSuccess={() => {
                    fetchClients();
                    handleClosePayment();
                }}
            />
        </Container >
    );
};

export default Clients;
