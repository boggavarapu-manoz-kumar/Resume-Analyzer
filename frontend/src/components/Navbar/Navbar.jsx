import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';
import { BrainCircuit, LogOut, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'text-white font-semibold' : 'text-slate-400 hover:text-indigo-400 font-medium';

  return (
    <div className="fixed top-0 left-0 w-full z-50 animate-fade-up">
      <div className="bg-black/20 backdrop-blur-xl border-b border-white/10">
        <header className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
          
          {/* Brand Section */}
          <Link to={ROUTES.DASHBOARD} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform duration-300">
               <BrainCircuit className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-black tracking-tight text-white">ResumeFlow</span>
          </Link>
          
          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to={ROUTES.DASHBOARD} className={`transition-colors duration-200 ${isActive(ROUTES.DASHBOARD)}`}>Dashboard</Link>
            <Link to={ROUTES.UPLOAD} className={`transition-colors duration-200 ${isActive(ROUTES.UPLOAD)}`}>Analyze</Link>
            <Link to={ROUTES.MOCK_INTERVIEW} className={`transition-colors duration-200 ${isActive(ROUTES.MOCK_INTERVIEW)}`}>Interview</Link>
            <Link to={ROUTES.JOB_MATCHING} className={`transition-colors duration-200 ${isActive(ROUTES.JOB_MATCHING)}`}>Jobs</Link>
            <Link to={ROUTES.CAREER_ROADMAP} className={`transition-colors duration-200 ${isActive(ROUTES.CAREER_ROADMAP)}`}>Roadmap</Link>
          </nav>

          {/* User Profile Section */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full backdrop-blur-md">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-sm">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="text-sm font-semibold text-slate-200 hidden sm:block">
                {user?.name || 'Guest'}
              </span>
            </div>
            
            <button 
              onClick={() => logout()} 
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
          
        </header>
      </div>
    </div>
  );
};

export default Navbar;
