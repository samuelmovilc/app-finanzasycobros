import React, { useState, useEffect } from 'react';
import api from '../api';
import Sidebar from '../components/Sidebar';
import { Plus, ArrowUpDown } from 'lucide-react';

const Transacciones = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ amount: '', concept: '', type: 'INGRESO_MANUAL' });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await api.get('/transactions');
      setTransactions(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/transactions', formData);
      setShowModal(false);
      setFormData({ amount: '', concept: '', type: 'INGRESO_MANUAL' });
      fetchTransactions();
    } catch (err) {
      setError('Error al registrar la transacción');
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <header className="top-header">
          <div className="header-title">
            <h1>Ingresos y Egresos</h1>
            <p>Registro manual de movimientos</p>
          </div>
          <div className="header-actions">
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={20} /> Nueva Transacción
            </button>
          </div>
        </header>

        <section className="analysis-section" style={{ gridTemplateColumns: '1fr' }}>
          <div className="card recent-activity">
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Concepto</th>
                    <th>Tipo</th>
                    <th>Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="4">Cargando...</td></tr>
                  ) : transactions.length === 0 ? (
                    <tr><td colSpan="4">No hay transacciones.</td></tr>
                  ) : (
                    transactions.map(t => (
                      <tr key={t.id}>
                        <td>{new Date(t.created_at).toLocaleDateString()}</td>
                        <td>{t.concept}</td>
                        <td>
                            <span className={`badge ${t.type.includes('INGRESO') || t.type === 'PAGO_RECIBIDO' ? 'active' : 'danger'}`}>
                                {t.type}
                            </span>
                        </td>
                        <td>
                          <span style={{ color: t.type.includes('INGRESO') || t.type === 'PAGO_RECIBIDO' ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
                            {t.type.includes('INGRESO') || t.type === 'PAGO_RECIBIDO' ? '+' : '-'}${Number(t.amount).toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {showModal && (
          <div style={modalOverlayStyle}>
            <div className="card" style={{ width:'400px' }}>
              <h2 style={{ marginBottom:'20px', color:'var(--accent-primary)' }}>Registrar Movimiento</h2>
              {error && <div style={{ color:'var(--accent-danger)', marginBottom:'10px' }}>{error}</div>}
              <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'15px' }}>
                <select required value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} style={inputStyle}>
                  <option value="INGRESO_MANUAL">Ingreso Manual</option>
                  <option value="EGRESO_MANUAL">Egreso Manual</option>
                  <option value="INGRESO_CAPITAL">Aporte de Capital</option>
                </select>
                <input type="number" placeholder="Monto ($)" required value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} style={inputStyle} />
                <input type="text" placeholder="Concepto (Ej: Pago de luz, Aporte socio)" required value={formData.concept} onChange={e => setFormData({...formData, concept: e.target.value})} style={inputStyle} />
                <div style={{ display:'flex', gap:'10px', marginTop:'10px' }}>
                  <button type="button" onClick={() => setShowModal(false)} style={cancelBtnStyle}>Cancelar</button>
                  <button type="submit" className="btn btn-primary" style={{ flex:1 }}>Guardar</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const inputStyle = { padding:'10px', borderRadius:'8px', border:'1px solid var(--border-color)', backgroundColor:'var(--bg-dark)', color:'#fff' };
const cancelBtnStyle = { flex:1, padding:'10px', borderRadius:'8px', backgroundColor:'var(--bg-light)', color:'#fff', border:'none', cursor:'pointer' };
const modalOverlayStyle = { position:'fixed', top:0, left:0, right:0, bottom:0, backgroundColor:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex: 1000 };

export default Transacciones;
