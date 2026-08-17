import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const NAV_ITEMS = [
  { label: 'World Population',     to: '/world-population' },
  { label: 'Prevalence/Incidence', to: '/prevalence' },
  { label: 'Mortality',            to: '/mortality' },
  { label: 'Definitions',          to: '/definitions' },
  { label: 'Contact Us',           to: '/contact' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'LR';

  return (
    <header className="navbar">

      {/* ── Top row: logo + title + avatar ── */}
      <div className="navbar__top">
        <div className="navbar__brand">
          <div className="navbar__logo">
            <img src="/logo.png" alt="REED Logo" />
          </div>
          <div className="navbar__divider" />
          <span className="navbar__title">Rare Disease Epi Database</span>
        </div>

        <div className="navbar__right">
          <span className="navbar__version">Latest version 2.0</span>
          <button className="navbar__avatar" onClick={handleLogout} title="Logout">
            {initials}
            <span className="avatar__online" />
          </button>
        </div>
      </div>

      {/* ── Bottom row: nav links ── */}
      <nav className="navbar__nav">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `navbar__link${isActive ? ' navbar__link--active' : ''}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

    </header>
  );
}