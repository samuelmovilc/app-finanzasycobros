import React, { useState, useEffect } from 'react';
import api from '../api';
import Sidebar from '../components/Sidebar';
import { Landmark, HandCoins, Clock, Wallet, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({ 
    capital_prestado: 0, 
    caja_actual: 0, 
    recentLoans: [],
    total_invertido: 0,
    intereses_pendientes: 0,
    chartData: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
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
      <Sidebar />
      <main className="main-content">
        <header className="top-header">
          <div className="header-title">
            <h1>Panel Principal</h1>
            <p>Resumen financiero en tiempo real</p>
          </div>
          <div className="header-actions">
            <button className="btn btn-primary" onClick={() => navigate('/prestamos')}>
              <Plus size={20} /> Nuevo Préstamo
            </button>
          </div>
        </header>

        <section className="summary-cards">
          <div className="card summary-card">
            <div className="card-icon blue-bg">
                <Landmark />
            </div>
            <div className="card-info">
              <p className="card-label">Total Invertido</p>
              <h3 className="card-value">${Number(data.total_invertido).toLocaleString()}</h3>
              <p className="card-trend neutral">Capital inicial del negocio</p>
            </div>
          </div>
          <div className="card summary-card highlight">
            <div className="card-icon green-bg">
                <HandCoins />
            </div>
            <div className="card-info">
              <p className="card-label">Capital Prestado</p>
              <h3 className="card-value">${Number(data.capital_prestado).toLocaleString()}</h3>
              <p className="card-trend up">Dinero en la calle</p>
            </div>
          </div>
          <div className="card summary-card">
            <div className="card-icon yellow-bg">
                <Clock />
            </div>
            <div className="card-info">
              <p className="card-label">Intereses Pendientes</p>
              <h3 className="card-value">${Number(data.intereses_pendientes).toLocaleString()}</h3>
              <p className="card-trend neutral">Ganancia proyectada</p>
            </div>
          </div>
          <div className="card summary-card">
            <div className="card-icon purple-bg">
                <Wallet />
            </div>
            <div className="card-info">
              <p className="card-label">Caja Actual (Disponible)</p>
              <h3 className="card-value">${Number(data.caja_actual).toLocaleString()}</h3>
              <p className="card-trend down">- ${Number(data.capital_prestado).toLocaleString()} prestados</p>
            </div>
          </div>
        </section>

        <section className="analysis-section">
          <div className="card chart-card">
              <div className="card-header">
                  <h2>Análisis de Préstamos (Últimos 6 meses)</h2>
              </div>
              <div className="chart-placeholder" style={{ height: '300px', marginTop: '20px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                      <XAxis dataKey="name" stroke="#888" axisLine={false} tickLine={false} />
                      <YAxis stroke="#888" axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
                      <Tooltip 
                        cursor={{fill: 'rgba(255,255,255,0.05)'}} 
                        contentStyle={{backgroundColor: '#1e2433', border: 'none', borderRadius: '8px', color: '#fff'}}
                        itemStyle={{color: '#00f2fe'}}
                      />
                      <Bar dataKey="total" fill="#00f2fe" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
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

export default Dashboard;
