import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import * as api from '../../api';

export default function Navbar() {
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      await api.logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-links">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/pet">Pet</Link>
        <Link to="/leaderboard">Leaderboard</Link>
        <Link to="/settings">Settings</Link>
      </div>
      <button onClick={handleLogout} className="logout-btn">
        Logout
      </button>
    </nav>
  );
}