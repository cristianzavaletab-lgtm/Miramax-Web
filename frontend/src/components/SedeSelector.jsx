import React, { useEffect, useState } from 'react';
import { MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const SedeSelector = ({ onSedeChange }) => {
    const { user } = useAuth();
    const [sedes, setSedes] = useState([]);
    const [selectedSede, setSelectedSede] = useState('');

    useEffect(() => {
        if (user?.role === 'admin') {
            fetchSedes();
        }
    }, [user]);

    const fetchSedes = async () => {
        try {
            const response = await api.get('sedes/');
            setSedes(response.data);

            // Restore selection or default to empty (All)
            const savedSede = localStorage.getItem('selected_sede');
            if (savedSede) {
                setSelectedSede(savedSede);
                onSedeChange(savedSede);
            }
        } catch (error) {
            console.error("Error fetching sedes", error);
        }
    };

    const handleChange = (e) => {
        const value = e.target.value;
        setSelectedSede(value);
        localStorage.setItem('selected_sede', value);
        onSedeChange(value);
    };

    if (user?.role !== 'admin') return null;

    return (
        <FormControl variant="outlined" size="small" sx={{ minWidth: 150, bgcolor: 'white', borderRadius: 1 }}>
            <InputLabel>Filtrar por Sede</InputLabel>
            <Select
                value={selectedSede}
                onChange={handleChange}
                label="Filtrar por Sede"
            >
                <MenuItem value=""><em>Todas las Sedes</em></MenuItem>
                {sedes.map((sede) => (
                    <MenuItem key={sede.id} value={sede.id}>
                        {sede.nombre}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};

export default SedeSelector;
