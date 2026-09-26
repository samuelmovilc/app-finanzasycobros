import React, { useState, useEffect } from 'react';
import api from '../api';
import Sidebar from '../components/Sidebar';
import { Plus, Check, X } from 'lucide-react';

const Transacciones = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Estado del formulario de transacción
  const [formData, setFormData] = useState({ amount: '', concept: '', type: 'INGRESO', category_id: '' });
  
  // Estado para creación de categoría "al vuelo"
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [transRes, catRes] = await Promise.all([
        api.get('/transactions'),
        api.get('/categories')
      ]);
      setTransactions(transRes.data);
      setCategories(catRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const res = await api.post('/categories', { name: newCategoryName, type: formData.type });
      setCategories([...categories, res.data]);
      setFormData({ ...formData, category_id: res.data.id });
      setNewCategoryName('');
      setIsCreatingCategory(false);
    } catch (err) {
      setError('Error al crear categoría');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/transactions', formData);
      setShowModal(false);
      setFormData({ amount: '', concept: '', type: 'INGRESO', category_id: '' });
      fetchData();
    } catch (err) {
      setError('Error al registrar la transacción');
    }
  };

  // Filtrar categorías según el tipo seleccionado
  const filteredCategories = categories.filter(c => c.type === formData.type);

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <header className="top-header">
          <div className="header-title">
            <h1>Ingresos y Egresos</h1>
            <p>Registro manual de movimientos y categorías</p>
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
                    <th>Categoría</th>
                    <th>Concepto</th>
                    <th>Tipo</th>
                    <th>Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="5">Cargando...</td></tr>
                  ) : transactions.length === 0 ? (
                    <tr><td colSpan="5">No hay transacciones.</td></tr>
                  ) : (
                    transactions.map(t => (
                      <tr key={t.id}>
                        <td data-label="Fecha">{new Date(t.created_at).toLocaleDateString()}</td>
                        <td data-label="Categoría"><strong>{t.category_name || '-'}</strong></td>
                        <td data-label="Concepto">{t.concept}</td>
                        <td data-label="Tipo">
                            <span className={`badge ${t.type.includes('INGRESO') || t.type === 'PAGO_RECIBIDO' ? 'active' : 'danger'}`}>
                                {t.type}
                            </span>
                        </td>
                        <td data-label="Monto">
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
                <select required value={formData.type} onChange={e => {
                  setFormData({...formData, type: e.target.value, category_id: ''});
                  setIsCreatingCategory(false);
                }} style={inputStyle}>
                  <option value="INGRESO">Ingreso Manual</option>
                  <option value="EGRESO">Egreso Manual</option>
                </select>

                {/* Sección de Categoría */}
                {!isCreatingCategory ? (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <select required value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})} style={{...inputStyle, flex: 1}}>
                      <option value="">Seleccione Categoría...</option>
                      {filteredCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <button type="button" onClick={() => setIsCreatingCategory(true)} className="btn btn-primary" title="Nueva Categoría" style={{ padding: '0 15px' }}>
                      <Plus size={20} />
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input 
                      type="text" placeholder="Nombre nueva categoría..." 
                      value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} 
                      style={{...inputStyle, flex: 1}} autoFocus
                    />
                    <button type="button" onClick={handleCreateCategory} className="btn" style={{ background: 'var(--accent-success)', color: '#fff', padding: '10px' }} title="Guardar">
                      <Check size={20} />
                    </button>
                    <button type="button" onClick={() => setIsCreatingCategory(false)} className="btn" style={{ background: 'var(--bg-light)', color: '#fff', padding: '10px' }} title="Cancelar">
                      <X size={20} />
                    </button>
                  </div>
                )}

                <input type="number" placeholder="Monto ($)" required value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} style={inputStyle} />
                <input type="text" placeholder="Concepto (Opcional, Ej: Recibo #001)" value={formData.concept} onChange={e => setFormData({...formData, concept: e.target.value})} style={inputStyle} />
                
                <div style={{ display:'flex', gap:'10px', marginTop:'10px' }}>
                  <button type="button" onClick={() => setShowModal(false)} style={cancelBtnStyle}>Cancelar</button>
                  <button type="submit" className="btn btn-primary" style={{ flex:1 }}>Guardar Movimiento</button>
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
