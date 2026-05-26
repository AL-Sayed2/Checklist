import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { logout } from '../api';
import { getCurrentWeekString } from '../utils/dateUtils';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <div className="nav-title">
          🏥 AADC IPC Checklist
          <span className="nav-week">{getCurrentWeekString()}</span>
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
