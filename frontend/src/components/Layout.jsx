import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Box, Drawer, AppBar, Toolbar, List, Typography, Divider,
    IconButton, ListItem, ListItemButton, ListItemIcon, ListItemText,
    Avatar, CssBaseline
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import BusinessIcon from '@mui/icons-material/Business';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import PriceCheckIcon from '@mui/icons-material/PriceCheck';
import GavelIcon from '@mui/icons-material/Gavel';
import MapIcon from '@mui/icons-material/Map';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import TerrainIcon from '@mui/icons-material/Terrain';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import AssessmentIcon from '@mui/icons-material/Assessment';

const drawerWidth = 240;

const Layout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const allMenuItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/', roles: ['admin', 'oficina', 'cobrador'] },
        { text: 'Clientes', icon: <PeopleIcon />, path: '/clients', roles: ['admin', 'oficina', 'cobrador'] },
        { text: 'Pagos', icon: <AttachMoneyIcon />, path: '/payments', roles: ['admin', 'oficina', 'cobrador'] },
        { text: 'Deudas', icon: <MoneyOffIcon />, path: '/deudas', roles: ['admin', 'oficina'] },
        { text: 'Reportes', icon: <AssessmentIcon />, path: '/reports', roles: ['admin', 'oficina'] },
        { text: 'Sedes', icon: <BusinessIcon />, path: '/sedes', roles: ['admin'] },
        { text: 'Asignaciones', icon: <AssignmentIndIcon />, path: '/asignaciones', roles: ['admin'] },
        { text: 'Visitas', icon: <DirectionsWalkIcon />, path: '/visitas', roles: ['admin', 'cobrador'] },
        { text: 'Config. Precios', icon: <PriceCheckIcon />, path: '/config-precios', roles: ['admin'] },
        { text: 'Auditoría', icon: <GavelIcon />, path: '/auditoria', roles: ['admin'] },
        // Geographic Zones
        { text: 'Departamentos', icon: <MapIcon />, path: '/departamentos', roles: ['admin'] },
        { text: 'Provincias', icon: <LocationCityIcon />, path: '/provincias', roles: ['admin'] },
        { text: 'Distritos', icon: <TerrainIcon />, path: '/distritos', roles: ['admin'] },
        { text: 'Caseríos', icon: <HomeWorkIcon />, path: '/caserios', roles: ['admin'] },
    ];

    const menuItems = allMenuItems.filter(item =>
        user?.role === 'admin' || item.roles.includes(user?.role)
    );

    const drawer = (
        <div>
            <Toolbar sx={{ bgcolor: 'primary.main', color: 'white', justifyContent: 'center' }}>
                <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
                    MIRAMAX
                </Typography>
            </Toolbar>
            <Divider />
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'secondary.main' }}>{user?.username?.[0]?.toUpperCase()}</Avatar>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {user?.username}
                </Typography>
            </Box>
            <Divider />
            <List>
                {menuItems.map((item) => (
                    <ListItem key={item.text} disablePadding>
                        <ListItemButton
                            selected={location.pathname === item.path}
                            onClick={() => navigate(item.path)}
                            sx={{
                                '&.Mui-selected': {
                                    bgcolor: 'primary.light',
                                    color: 'primary.contrastText',
                                    '& .MuiListItemIcon-root': { color: 'primary.contrastText' },
                                },
                            }}
                        >
                            <ListItemIcon sx={{ color: location.pathname === item.path ? 'inherit' : 'grey.600' }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            <Divider />
            <List>
                <ListItem disablePadding>
                    <ListItemButton onClick={handleLogout}>
                        <ListItemIcon>
                            <ExitToAppIcon color="error" />
                        </ListItemIcon>
                        <ListItemText primary="Cerrar Sesión" sx={{ color: 'error.main' }} />
                    </ListItemButton>
                </ListItem>
            </List>
        </div>
    );

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar
                position="fixed"
                sx={{
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                    bgcolor: 'white',
                    color: 'text.primary',
                    boxShadow: 1
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                        {menuItems.find(item => item.path === location.pathname)?.text || 'Sistema de Cobranza'}
                    </Typography>
                </Toolbar>
            </AppBar>
            <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>
            <Box
                component="main"
                sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` }, bgcolor: '#f5f5f5', minHeight: '100vh' }}
            >
                <Toolbar />
                <Outlet />
            </Box>
        </Box>
    );
};

export default Layout;
