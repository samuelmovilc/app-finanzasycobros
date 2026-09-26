import React, { useState, useEffect } from 'react';
import api from '../api';
import Sidebar from '../components/Sidebar';
import { Plus, DollarSign, List, CheckCircle } from 'lucide-react';

const Prestamos = () => {
  const [loans, setLoans] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(null); 
  const [showHistoryModal, setShowHistoryModal] = useState(null); 
  const [paymentsHistory, setPaymentsHistory] = useState([]);
  
  const [loanForm, setLoanForm] = useState({ client_id: '', capital_amount: '', interest_rate: '' });
  const [paymentForm, setPaymentForm] = useState({ amount: '', concept: 'Pago de cuota' });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [loansRes, clientsRes] = await Promise.all([
        api.get('/loans'),
        api.get('/clients')
      ]);
      setLoans(loansRes.data);
      setClients(clientsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoanSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/loans', loanForm);
      setShowLoanModal(false);
      setLoanForm({ client_id: '', capital_amount: '', interest_rate: '' });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear préstamo');
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/payments', { ...paymentForm, loan_id: showPaymentModal });
      setShowPaymentModal(null);
      setPaymentForm({ amount: '', concept: 'Pago de cuota' });
      fetchData();
    } catch (err) {
      setError('Error al registrar pago');
    }
  };

  const openHistory = async (id) => {
    setShowHistoryModal(id);
    try {
      const res = await api.get(`/loans/${id}/payments`);
      setPaymentsHistory(res.data);
    } catch (err) {
      console.error('Error al cargar historial');
    }
  };

  const markAsPaid = async (id) => {
    if (window.confirm('¿Confirmas que este préstamo ha sido liquidado totalmente?')) {
      try {
        await api.put(`/loans/${id}/status`, { status: 'PAGADO' });
        fetchData();
        setShowHistoryModal(null);
      } catch (err) {
        alert('Error al liquidar');
      }
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <header className="top-header">
          <div className="header-title">
            <h1>Gestión de Préstamos</h1>
            <p>Cartera activa e historial</p>
          </div>
          <div className="header-actions">
            <button className="btn btn-primary" onClick={() => setShowLoanModal(true)}>
              <Plus size={20} /> Nuevo Préstamo
            </button>
          </div>
        </header>

        <section className="analysis-section" style={{ gridTemplateColumns: '1fr' }}>
          <div className="card recent-activity">
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Cliente</th>
                    <th>Capital Inicial</th>
                    <th>Tasa (%)</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="6">Cargando...</td></tr>
                  ) : loans.length === 0 ? (
                    <tr><td colSpan="6">No hay préstamos activos.</td></tr>
                  ) : (
                    loans.map(l => (
                      <tr key={l.id}>
                        <td>#{l.id}</td>
                        <td><strong>{l.client_name}</strong></td>
                        <td>${Number(l.capital_amount).toLocaleString()}</td>
                        <td>{l.interest_rate}%</td>
                        <td><span className={`badge ${l.status === 'ACTIVO' ? 'active' : 'neutral'}`}>{l.status}</span></td>
                        <td>
                          {l.status === 'ACTIVO' && (
                            <button onClick={() => setShowPaymentModal(l.id)} className="btn btn-primary" style={{ padding: '5px 10px', fontSize: '12px', marginRight: '5px' }}>
                              <DollarSign size={14} /> Abonar
                            </button>
                          )}
                          <button onClick={() => openHistory(l.id)} className="btn btn-primary" style={{ padding: '5px 10px', fontSize: '12px', backgroundColor: 'var(--bg-light)' }}>
                            <List size={14} /> Historial
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Modal Nuevo Préstamo */}
        {showLoanModal && (
          <div style={modalOverlayStyle}>
            <div className="card" style={{ width:'400px' }}>
              <h2 style={{ marginBottom:'20px', color:'var(--accent-primary)' }}>Nuevo Préstamo</h2>
              {error && <div style={{ color:'var(--accent-danger)', marginBottom:'10px' }}>{error}</div>}
              <form onSubmit={handleLoanSubmit} style={{ display:'flex', flexDirection:'column', gap:'15px' }}>
                <select required value={loanForm.client_id} onChange={e => setLoanForm({...loanForm, client_id: e.target.value})} style={inputStyle}>
                  <option value="">Seleccione un cliente...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <input type="number" placeholder="Monto del Capital ($)" required value={loanForm.capital_amount} onChange={e => setLoanForm({...loanForm, capital_amount: e.target.value})} style={inputStyle} />
                <input type="number" step="0.1" placeholder="Tasa de Interés (%)" required value={loanForm.interest_rate} onChange={e => setLoanForm({...loanForm, interest_rate: e.target.value})} style={inputStyle} />
                <div style={{ display:'flex', gap:'10px', marginTop:'10px' }}>
                  <button type="button" onClick={() => setShowLoanModal(false)} style={cancelBtnStyle}>Cancelar</button>
                  <button type="submit" className="btn btn-primary" style={{ flex:1 }}>Guardar Préstamo</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Pago */}
        {showPaymentModal && (
          <div style={modalOverlayStyle}>
            <div className="card" style={{ width:'400px' }}>
              <h2 style={{ marginBottom:'20px', color:'var(--accent-primary)' }}>Registrar Abono</h2>
              {error && <div style={{ color:'var(--accent-danger)', marginBottom:'10px' }}>{error}</div>}
              <form onSubmit={handlePaymentSubmit} style={{ display:'flex', flexDirection:'column', gap:'15px' }}>
                <input type="number" placeholder="Monto del Abono ($)" required value={paymentForm.amount} onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})} style={inputStyle} />
                <input type="text" placeholder="Concepto" required value={paymentForm.concept} onChange={e => setPaymentForm({...paymentForm, concept: e.target.value})} style={inputStyle} />
                <div style={{ display:'flex', gap:'10px', marginTop:'10px' }}>
                  <button type="button" onClick={() => setShowPaymentModal(null)} style={cancelBtnStyle}>Cancelar</button>
                  <button type="submit" className="btn btn-primary" style={{ flex:1 }}>Registrar Abono</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Historial */}
        {showHistoryModal && (
          <div style={modalOverlayStyle}>
            <div className="card" style={{ width:'500px', maxHeight: '80vh', overflowY: 'auto' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
                  <h2 style={{ color:'var(--accent-primary)', margin:0 }}>Historial de Abonos</h2>
                  {loans.find(l => l.id === showHistoryModal)?.status === 'ACTIVO' && (
                      <button onClick={() => markAsPaid(showHistoryModal)} className="btn btn-primary" style={{ backgroundColor: 'var(--accent-success)' }}>
                          <CheckCircle size={16} /> Liquidar
                      </button>
                  )}
              </div>
              <table className="data-table" style={{ marginBottom: '20px' }}>
                <thead><tr><th>Fecha</th><th>Concepto</th><th>Monto</th></tr></thead>
                <tbody>
                  {paymentsHistory.length === 0 ? <tr><td colSpan="3">No hay abonos registrados</td></tr> : 
                    paymentsHistory.map(p => (
                      <tr key={p.id}>
                        <td>{new Date(p.created_at).toLocaleDateString()}</td>
                        <td>{p.concept}</td>
                        <td>${Number(p.amount).toLocaleString()}</td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
              <button type="button" onClick={() => setShowHistoryModal(null)} style={cancelBtnStyle}>Cerrar</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const inputStyle = { padding:'10px', borderRadius:'8px', border:'1px solid var(--border-color)', backgroundColor:'var(--bg-dark)', color:'#fff' };
const cancelBtnStyle = { padding:'10px', borderRadius:'8px', backgroundColor:'var(--bg-light)', color:'#fff', border:'none', cursor:'pointer', width: '100%' };
const modalOverlayStyle = { position:'fixed', top:0, left:0, right:0, bottom:0, backgroundColor:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex: 1000 };

export default Prestamos;
