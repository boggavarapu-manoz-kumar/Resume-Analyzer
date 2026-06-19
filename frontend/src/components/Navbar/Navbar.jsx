import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';

const Navbar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <div className="navbar-wrapper animate-fade-up">
      <header className="navbar-pill">
        
        {/* Brand Section */}
        <Link to={ROUTES.DASHBOARD} className="flex items-center gap-sm" style={{ cursor: 'pointer', textDecoration: 'none' }}>
          <div style={{
            width: '32px', height: '32px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--color-primary)',
            color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: '800', fontSize: '16px',
            boxShadow: '0 2px 4px rgba(2, 132, 199, 0.2)'
          }}>
            R
          </div>
          <span className="nav-brand">ResumeAI</span>
        </Link>
        
        {/* Desktop Navigation Links */}
        <nav className="nav-links">
          <Link to={ROUTES.DASHBOARD} className={`nav-link ${isActive(ROUTES.DASHBOARD)}`}>Dashboard</Link>
          <Link to={ROUTES.UPLOAD} className={`nav-link ${isActive(ROUTES.UPLOAD)}`}>Analyze</Link>
          <Link to={ROUTES.MOCK_INTERVIEW} className={`nav-link ${isActive(ROUTES.MOCK_INTERVIEW)}`}>Interview</Link>
          <Link to={ROUTES.JOB_MATCHING} className={`nav-link ${isActive(ROUTES.JOB_MATCHING)}`}>Jobs</Link>
          <Link to={ROUTES.CAREER_ROADMAP} className={`nav-link ${isActive(ROUTES.CAREER_ROADMAP)}`}>Roadmap</Link>
          <Link to={ROUTES.PRICING} className={`nav-link ${isActive(ROUTES.PRICING)}`}>Pricing</Link>
        </nav>

        {/* User Profile Section */}
        <div className="flex items-center gap-md">
          <div className="flex items-center gap-sm" style={{ 
            background: 'var(--color-bg-secondary)', 
            padding: '4px 12px 4px 4px', 
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--color-border)'
          }}>
            <div style={{
              width: '32px', height: '32px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--color-bg-tertiary)',
              border: '1px solid var(--color-border-hover)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: '600', color: 'var(--color-primary)',
              fontSize: '14px'
            }}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-text-primary)' }}>
              {user?.name || 'Guest'}
            </span>
          </div>
        </div>
        
      </header>
    </div>
  );
};

export default Navbar;
