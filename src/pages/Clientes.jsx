import React, { useState, useEffect } from 'react';
import api from '../api';
import Sidebar from '../components/Sidebar';
import { Plus, Trash2, Edit } from 'lucide-react';

const Clientes = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', document: '', phone: '', address: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await api.get('/clients');
      setClients(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (client = null) => {
    setError('');
    if (client) {
        setEditingId(client.id);
        setFormData({ name: client.name, document: client.document, phone: client.phone || '', address: client.address || '' });
    } else {
        setEditingId(null);
        setFormData({ name: '', document: '', phone: '', address: '' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
          // Edit
          await api.put(`/clients/${editingId}`, formData);
      } else {
          // Create
          await api.post('/clients', formData);
      }
      setShowModal(false);
      fetchClients();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar cliente. Verifique el documento.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar este cliente?')) {
      try {
        await api.delete(`/clients/${id}`);
        fetchClients();
      } catch (err) {
        alert(err.response?.data?.error || 'Error al eliminar');
      }
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <header className="top-header">
          <div className="header-title">
            <h1>Gestión de Clientes</h1>
            <p>Directorio de prestatarios</p>
          </div>
          <div className="header-actions">
            <button className="btn btn-primary" onClick={() => handleOpenModal()}>
              <Plus size={20} /> Nuevo Cliente
            </button>
          </div>
        </header>

        <section className="analysis-section" style={{ gridTemplateColumns: '1fr' }}>
          <div className="card recent-activity">
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Documento</th>
                    <th>Teléfono</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="4">Cargando...</td></tr>
                  ) : clients.length === 0 ? (
                    <tr><td colSpan="4">No hay clientes registrados.</td></tr>
                  ) : (
                    clients.map(c => (
                      <tr key={c.id}>
                        <td><strong>{c.name}</strong></td>
                        <td>{c.document}</td>
                        <td>{c.phone}</td>
                        <td>
                          <button onClick={() => handleOpenModal(c)} style={{ background:'transparent', border:'none', color:'var(--accent-primary)', cursor:'pointer', marginRight:'10px' }}>
                            <Edit size={18} />
                          </button>
                          <button onClick={() => handleDelete(c.id)} style={{ background:'transparent', border:'none', color:'var(--accent-danger)', cursor:'pointer' }}>
                            <Trash2 size={18} />
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

        {showModal && (
          <div style={{ position:'fixed', top:0, left:0, right:0, bottom:0, backgroundColor:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex: 1000 }}>
            <div className="card" style={{ width:'400px' }}>
              <h2 style={{ marginBottom:'20px', color:'var(--accent-primary)' }}>{editingId ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
              {error && <div style={{ color:'var(--accent-danger)', marginBottom:'10px' }}>{error}</div>}
              <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'15px' }}>
                <input placeholder="Nombre Completo" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={inputStyle} />
                <input placeholder="Documento de Identidad" required disabled={!!editingId} value={formData.document} onChange={e => setFormData({...formData, document: e.target.value})} style={inputStyle} />
                <input placeholder="Teléfono" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={inputStyle} />
                <input placeholder="Dirección" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} style={inputStyle} />
                <div style={{ display:'flex', gap:'10px', marginTop:'10px' }}>
                  <button type="button" onClick={() => setShowModal(false)} style={{ flex:1, padding:'10px', borderRadius:'8px', backgroundColor:'var(--bg-light)', color:'#fff', border:'none', cursor:'pointer' }}>Cancelar</button>
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

export default Clientes;
