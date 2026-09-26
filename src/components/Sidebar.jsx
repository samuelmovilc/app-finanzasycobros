import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Briefcase, LogOut, Wallet, ArrowUpDown, BarChart3, Settings, Menu, X } from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      {/* Botón flotante para móvil */}
      <button 
        className="mobile-menu-btn" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Abrir menú"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay oscuro cuando el sidebar está abierto en móvil */}
      {isOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <Wallet className="logo-icon" size={24} />
            <h2>Sicol Pagos y Créditos</h2>
          </div>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/" onClick={closeSidebar} className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')} end>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/clientes" onClick={closeSidebar} className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            <Users size={20} />
            <span>Clientes / POS</span>
          </NavLink>
          <NavLink to="/prestamos" onClick={closeSidebar} className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            <Briefcase size={20} />
            <span>Préstamos</span>
          </NavLink>
          <NavLink to="/ingresos-egresos" onClick={closeSidebar} className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            <ArrowUpDown size={20} />
            <span>Ingresos / Egresos</span>
          </NavLink>
          <NavLink to="/reportes" onClick={closeSidebar} className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            <BarChart3 size={20} />
            <span>Reportes</span>
          </NavLink>
          <NavLink to="/configuracion" onClick={closeSidebar} className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            <Settings size={20} />
            <span>Configuración</span>
          </NavLink>
          <button 
            onClick={handleLogout} 
            className="nav-item logout-btn"
          >
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
