import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#FF4500', // Orange from logo
        },
        secondary: {
            main: '#1A1A1A', // Dark Grey from logo
        },
        background: {
            default: '#f5f5f5',
        },
    },
    typography: {
        fontFamily: 'Roboto, Arial, sans-serif',
        h1: {
            fontSize: '2rem',
            fontWeight: 600,
        },
    },
});

export default theme;
