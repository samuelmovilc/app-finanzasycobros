import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Briefcase, LogOut, Wallet, ArrowUpDown, BarChart3, Settings } from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <Wallet className="logo-icon" size={24} style={{ color: 'var(--accent-primary)', marginRight: '10px' }} />
          <h2>FinanPOS</h2>
        </div>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')} end>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/clientes" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
          <Users size={20} />
          <span>Clientes / POS</span>
        </NavLink>
        <NavLink to="/prestamos" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
          <Briefcase size={20} />
          <span>Préstamos</span>
        </NavLink>
        <NavLink to="/ingresos-egresos" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
          <ArrowUpDown size={20} />
          <span>Ingresos / Egresos</span>
        </NavLink>
        <NavLink to="/reportes" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
          <BarChart3 size={20} />
          <span>Reportes</span>
        </NavLink>
        <NavLink to="/configuracion" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
          <Settings size={20} />
          <span>Configuración</span>
        </NavLink>
        <button 
          onClick={handleLogout} 
          style={{ background:'transparent', border:'none', color:'var(--accent-danger)', padding:'12px 16px', textAlign:'left', cursor:'pointer', marginTop:'auto', fontWeight:'bold', display:'flex', alignItems:'center', gap:'10px' }}
        >
          <LogOut size={20} />
          Cerrar Sesión
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;
