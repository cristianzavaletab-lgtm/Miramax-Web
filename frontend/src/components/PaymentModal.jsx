import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, MenuItem, Button, Typography
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import api from '../api/axios';

const PaymentModal = ({ open, onClose, client, onSuccess }) => {
    const [formData, setFormData] = useState({
        client: '',
        amount: '',
        method: 'cash',
        reference_number: '',
        proof_image: null
    });
    const [clients, setClients] = useState([]);

    useEffect(() => {
        if (open) {
            fetchClients();
            if (client) {
                setFormData(prev => ({ ...prev, client: client.id }));
            } else {
                setFormData(prev => ({ ...prev, client: '' }));
            }
        }
    }, [open, client]);

    const fetchClients = async () => {
        try {
            const response = await api.get('clients/');
            setClients(response.data);
        } catch (error) {
            console.error("Error fetching clients", error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, proof_image: e.target.files[0] });
    };

    const handleSubmit = async () => {
        const data = new FormData();
        data.append('client', formData.client);
        data.append('amount', formData.amount);
        data.append('method', formData.method);
        data.append('reference_number', formData.reference_number);
        if (formData.proof_image) {
            data.append('proof_image', formData.proof_image);
        }

        try {
            await api.post('payments/', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (onSuccess) onSuccess();
            onClose();
            setFormData({ client: '', amount: '', method: 'cash', reference_number: '', proof_image: null });
        } catch (error) {
            console.error("Error registering payment", error);
            alert("Error al registrar pago.");
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
                Registrar Pago {client ? `- ${client.name}` : ''}
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
                {!client && (
                    <TextField
                        select
                        margin="dense"
                        label="Cliente"
                        name="client"
                        fullWidth
                        value={formData.client}
                        onChange={handleChange}
                    >
                        {clients.map((c) => (
                            <MenuItem key={c.id} value={c.id}>
                                {c.code} - {c.name}
                            </MenuItem>
                        ))}
                    </TextField>
                )}

                <TextField
                    margin="dense"
                    label="Monto (S/)"
                    name="amount"
                    type="number"
                    fullWidth
                    value={formData.amount}
                    onChange={handleChange}
                />
                <TextField
                    select
                    margin="dense"
                    label="Método de Pago"
                    name="method"
                    fullWidth
                    value={formData.method}
                    onChange={handleChange}
                >
                    <MenuItem value="cash">Efectivo</MenuItem>
                    <MenuItem value="yape">Yape</MenuItem>
                    <MenuItem value="plin">Plin</MenuItem>
                    <MenuItem value="transfer">Transferencia</MenuItem>
                </TextField>
                {formData.method !== 'cash' && (
                    <>
                        <TextField
                            margin="dense"
                            label="Número de Referencia"
                            name="reference_number"
                            fullWidth
                            value={formData.reference_number}
                            onChange={handleChange}
                        />
                        <Button
                            variant="outlined"
                            component="label"
                            startIcon={<CloudUploadIcon />}
                            fullWidth
                            sx={{ mt: 2 }}
                        >
                            Subir Comprobante
                            <input type="file" hidden onChange={handleFileChange} />
                        </Button>
                        {formData.proof_image && <Typography variant="caption">{formData.proof_image.name}</Typography>}
                    </>
                )}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} color="secondary">Cancelar</Button>
                <Button onClick={handleSubmit} variant="contained" color="primary">Registrar</Button>
            </DialogActions>
        </Dialog>
    );
};

export default PaymentModal;
