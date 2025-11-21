import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Payments from './pages/Payments';
import Reports from './pages/Reports';
import Sedes from './pages/Sedes';
import Asignaciones from './pages/Asignaciones';
import Visitas from './pages/Visitas';
import ConfigPrecios from './pages/ConfigPrecios';
import Auditoria from './pages/Auditoria';
import Departamentos from './pages/Departamentos';
import Provincias from './pages/Provincias';
import Distritos from './pages/Distritos';
import Caserios from './pages/Caserios';
import Deudas from './pages/Deudas';
import ForgotPassword from './pages/ForgotPassword';
import Layout from './components/Layout';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/sedes" element={<Sedes />} />
          <Route path="/asignaciones" element={<Asignaciones />} />
          <Route path="/visitas" element={<Visitas />} />
          <Route path="/config-precios" element={<ConfigPrecios />} />
          <Route path="/auditoria" element={<Auditoria />} />
          <Route path="/departamentos" element={<Departamentos />} />
          <Route path="/provincias" element={<Provincias />} />
          <Route path="/distritos" element={<Distritos />} />
          <Route path="/caserios" element={<Caserios />} />
        </Route>
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;
