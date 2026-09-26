import React, { useState } from 'react';
import api from '../api';
import Sidebar from '../components/Sidebar';
import { Settings, Lock } from 'lucide-react';

const Configuracion = () => {
  const [formData, setFormData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (formData.newPassword !== formData.confirmPassword) {
      return setError('Las contraseñas nuevas no coinciden');
    }

    try {
      await api.put('/auth/password', { 
          currentPassword: formData.currentPassword, 
          newPassword: formData.newPassword 
      });
      setMessage('Contraseña actualizada exitosamente. Usa tu nueva contraseña la próxima vez.');
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Error al actualizar configuración');
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <header className="top-header">
          <div className="header-title">
            <h1>Configuración</h1>
            <p>Ajustes de la cuenta y seguridad</p>
          </div>
        </header>

        <section className="analysis-section" style={{ gridTemplateColumns: '1fr', maxWidth: '600px' }}>
          
          <div className="card">
            <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <Lock style={{ color: 'var(--accent-primary)' }} />
              <h2>Cambiar Contraseña</h2>
            </div>
            
            {message && <div style={{ color: 'var(--accent-success)', marginBottom: '15px', padding: '10px', backgroundColor: 'rgba(0, 242, 254, 0.1)', borderRadius: '8px' }}>{message}</div>}
            {error && <div style={{ color: 'var(--accent-danger)', marginBottom: '15px', padding: '10px', backgroundColor: 'rgba(255, 75, 75, 0.1)', borderRadius: '8px' }}>{error}</div>}
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Contraseña Actual</label>
                <input 
                  type="password" required 
                  value={formData.currentPassword} 
                  onChange={e => setFormData({...formData, currentPassword: e.target.value})} 
                  style={inputStyle} 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Nueva Contraseña</label>
                <input 
                  type="password" required minLength="6"
                  value={formData.newPassword} 
                  onChange={e => setFormData({...formData, newPassword: e.target.value})} 
                  style={inputStyle} 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Confirmar Nueva Contraseña</label>
                <input 
                  type="password" required minLength="6"
                  value={formData.confirmPassword} 
                  onChange={e => setFormData({...formData, confirmPassword: e.target.value})} 
                  style={inputStyle} 
                />
              </div>
              
              <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>
                Actualizar Contraseña
              </button>
            </form>
          </div>

        </section>
      </main>
    </div>
  );
};

const inputStyle = { width: '100%', padding:'10px', borderRadius:'8px', border:'1px solid var(--border-color)', backgroundColor:'var(--bg-dark)', color:'#fff' };

export default Configuracion;
