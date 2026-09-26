import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import api from './api';
import './../styles.css'; // Mantenemos tu diseño premium original

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

// ================= DASHBOARD =================
const Dashboard = () => {
  const [data, setData] = useState({ capital_prestado: 0, caja_actual: 0, recentLoans: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
    // Renderizar iconos después de cargar UI
    setTimeout(() => {
      if(window.initLucide) window.initLucide();
    }, 100);
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/dashboard');
      setData(res.data);
    } catch (error) {
      console.error('Error cargando dashboard', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '40px', color: '#fff' }}>Cargando datos financieros...</div>;

  return (
    <div className="app-container">
      {/* Sidebar - Reutilizando el CSS */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <h2>FinanPOS</h2>
          </div>
        </div>
        <nav className="sidebar-nav">
          <a href="#" className="nav-item active"><span>Dashboard</span></a>
          <a href="#" className="nav-item"><span>Clientes</span></a>
          <a href="#" className="nav-item"><span>Préstamos</span></a>
          <button onClick={() => { localStorage.clear(); window.location.href='/'; }} style={{background:'transparent', border:'none', color:'var(--accent-danger)', padding:'12px 16px', textAlign:'left', cursor:'pointer', marginTop:'auto', fontWeight:'bold'}}>Cerrar Sesión</button>
        </nav>
      </aside>

      <main className="main-content">
        <header className="top-header">
          <div className="header-title">
            <h1>Panel Principal</h1>
            <p>Resumen financiero en tiempo real</p>
          </div>
          <div className="header-actions">
            <button className="btn btn-primary">Nuevo Préstamo</button>
          </div>
        </header>

        <section className="summary-cards">
          <div className="card summary-card">
            <div className="card-icon blue-bg">
                <i data-lucide="landmark"></i>
            </div>
            <div className="card-info">
              <p className="card-label">Total Invertido</p>
              <h3 className="card-value">$150,000.00</h3>
              <p className="card-trend neutral">Capital inicial del negocio</p>
            </div>
          </div>
          <div className="card summary-card highlight">
            <div className="card-icon green-bg">
                <i data-lucide="hand-coins"></i>
            </div>
            <div className="card-info">
              <p className="card-label">Capital Prestado</p>
              <h3 className="card-value">${Number(data.capital_prestado).toLocaleString()}</h3>
              <p className="card-trend up"><i data-lucide="trending-up"></i> Dinero en la calle</p>
            </div>
          </div>
          <div className="card summary-card">
            <div className="card-icon yellow-bg">
                <i data-lucide="clock"></i>
            </div>
            <div className="card-info">
              <p className="card-label">Intereses Pendientes</p>
              <h3 className="card-value">$12,400.00</h3>
              <p className="card-trend neutral">Ganancia proyectada</p>
            </div>
          </div>
          <div className="card summary-card">
            <div className="card-icon purple-bg">
                <i data-lucide="wallet"></i>
            </div>
            <div className="card-info">
              <p className="card-label">Caja Actual (Disponible)</p>
              <h3 className="card-value">${Number(data.caja_actual).toLocaleString()}</h3>
              <p className="card-trend down"><i data-lucide="trending-down"></i> - ${Number(data.capital_prestado).toLocaleString()} prestados</p>
            </div>
          </div>
        </section>

        <section className="analysis-section">
          <div className="card chart-card">
              <div className="card-header">
                  <h2>Análisis de Préstamos (Últimos 6 meses)</h2>
                  <select className="filter-select">
                      <option>Por Mes</option>
                      <option>Por Año</option>
                  </select>
              </div>
              <div className="chart-placeholder">
                  <div className="bar-chart">
                      <div className="bar" style={{height: '40%'}}><span>Abr</span></div>
                      <div className="bar" style={{height: '60%'}}><span>May</span></div>
                      <div className="bar" style={{height: '50%'}}><span>Jun</span></div>
                      <div className="bar" style={{height: '80%'}}><span>Jul</span></div>
                      <div className="bar" style={{height: '70%'}}><span>Ago</span></div>
                      <div className="bar highlight-bar" style={{height: '100%'}}><span>Sep</span></div>
                  </div>
              </div>
          </div>

          <div className="card recent-activity">
            <div className="card-header">
              <h2>Préstamos Recientes</h2>
            </div>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Capital</th>
                    <th>Tasa (%)</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentLoans.length === 0 ? (
                    <tr><td colSpan="4">No hay préstamos activos.</td></tr>
                  ) : (
                    data.recentLoans.map(loan => (
                      <tr key={loan.id}>
                        <td><strong>{loan.client_name}</strong></td>
                        <td>${Number(loan.capital_amount).toLocaleString()}</td>
                        <td>{loan.interest_rate}%</td>
                        <td><span className="badge active">{loan.status}</span></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
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
        <Route path="/" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;
