import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import api from './api';
import './../styles.css';

import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Prestamos from './pages/Prestamos';
import Transacciones from './pages/Transacciones';
import Reportes from './pages/Reportes';
import Configuracion from './pages/Configuracion';

// ================= LOGIN =================
const Login = ({ setAuth }) => {
  const [email, setEmail] = useState('admin@finanzas.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setAuth(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-dark)' }}>
      <div className="card" style={{ width: '400px', padding: '40px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px', color: 'var(--accent-primary)' }}>FinanPOS</h2>
        {error && <div style={{ color: 'var(--accent-danger)', marginBottom: '15px' }}>{error}</div>}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input 
            type="email" placeholder="Correo Electrónico" 
            value={email} onChange={(e)=>setEmail(e.target.value)}
            style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-dark)', color: '#fff' }} required
          />
          <input 
            type="password" placeholder="Contraseña" 
            value={password} onChange={(e)=>setPassword(e.target.value)}
            style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-dark)', color: '#fff' }} required
          />
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ justifyContent: 'center' }}>
            {loading ? 'Cargando...' : 'Entrar al Sistema'}
          </button>
        </form>
      </div>
    </div>
  );
};

// ================= ROUTER =================
const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  return (
    <Router>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login setAuth={setIsAuthenticated} />} />
        
        {/* Rutas Protegidas */}
        <Route path="/" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/clientes" element={isAuthenticated ? <Clientes /> : <Navigate to="/login" />} />
        <Route path="/prestamos" element={isAuthenticated ? <Prestamos /> : <Navigate to="/login" />} />
        
        {/* Dummy Routes */}
        <Route path="/ingresos-egresos" element={isAuthenticated ? <Transacciones /> : <Navigate to="/login" />} />
        <Route path="/reportes" element={isAuthenticated ? <Reportes /> : <Navigate to="/login" />} />
        <Route path="/configuracion" element={isAuthenticated ? <Configuracion /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;
