import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { logout } from '../api';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const currentWeek = () => {
    // Generate current week string, e.g., "2026-W13"
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now - start) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((now.getDay() + 1 + days) / 7);
    return `${now.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`;
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <div className="nav-title">
          🏥 AADC IPC Checklist
          <span className="nav-week">{currentWeek()}</span>
        </div>
        <div className="nav-links">
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
            Checklist
          </NavLink>
          <NavLink to="/summary" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Summary
          </NavLink>
          <NavLink to="/ai-summary" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            AI Summary
          </NavLink>
          <NavLink to="/history" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            History
          </NavLink>
        </div>
      </div>
      <button onClick={handleLogout} className="nav-logout">
        Logout
      </button>
    </nav>
  );
};

export default Navbar;
