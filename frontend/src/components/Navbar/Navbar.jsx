import React from 'react';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user } = useAuth();

  return (
    <div className="navbar-wrapper">
      <header className="navbar-pill">
        <div className="flex items-center gap-sm" style={{ cursor: 'pointer' }}>
          <div style={{
            width: '28px', height: '28px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--color-primary)',
            color: 'var(--color-bg-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: '700', fontSize: '14px'
          }}>
            R
          </div>
          <span style={{ fontWeight: 700, letterSpacing: '-0.02em', fontSize: '1.05rem', color: '#fff' }}>ResumeAI</span>
        </div>
        
        <nav className="nav-links">
          <a href="#" className="nav-link active">Home</a>
          <a href="#features" className="nav-link">Features</a>
          <a href="#" className="nav-link">Pricing</a>
        </nav>

        <div className="flex items-center gap-md">
          <div className="flex items-center gap-sm">
            <span style={{ fontSize: '0.85rem', fontWeight: '500', color: 'var(--color-text-secondary)', lineHeight: 1 }}>{user?.name}</span>
            <div style={{
              width: '32px', height: '32px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--color-bg-tertiary)',
              border: '1px solid var(--color-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: '500', color: 'var(--color-text-primary)',
              fontSize: '14px'
            }}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};

export default Navbar;
