import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';
import api from '../../services/api';
import { FileUp, Target, Briefcase, Zap, BrainCircuit, BarChart, MessageSquare, ArrowRight } from 'lucide-react';

const Dashboard = () => {
  const [resumes, setResumes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/api/resumes/my-resumes');
        setResumes(res.data || []);
      } catch (err) {
        console.error('Failed to fetch resumes', err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="container" style={{ paddingBottom: 'var(--spacing-3xl)' }}>
      {/* Hero Section */}
      <div className="flex flex-col items-center text-center animate-fade-up stagger-1 mt-16 mb-20">
        
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-semibold text-sm backdrop-blur-sm shadow-[0_0_15px_rgba(99,102,241,0.2)]">
          <Zap size={16} fill="currentColor" /> Welcome to the future of career acceleration
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white mb-6 leading-tight">
          Elevate Your Resume<br />with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-500">AI Precision.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
          Unlock your career potential. Our platform deeply analyzes your experience, uncovers hidden skill gaps, and matches you with your dream job in seconds.
        </p>
        
        <div className="flex flex-wrap gap-4 justify-center">
          <Link to={ROUTES.UPLOAD} className="group relative inline-flex items-center justify-center gap-2 bg-white text-black font-bold py-4 px-8 rounded-xl transition-all hover:bg-slate-200 shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:scale-105">
            Get Started <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          {resumes.length > 0 && (
            <Link to={ROUTES.RESUME_ANALYSIS} className="inline-flex items-center justify-center py-4 px-8 rounded-xl font-bold text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-colors backdrop-blur-md">
              View Recent Analysis
            </Link>
          )}
        </div>
      </div>

      {/* Bento Grid Showcase */}
      <div className="bento-grid mt-8">
        
        {/* Core Feature 1 */}
        <div className="bento-card group cursor-pointer animate-fade-up stagger-2" style={{ minHeight: '280px' }} onClick={() => navigate(ROUTES.UPLOAD)}>
          <div className="bento-icon-wrapper group-hover:scale-110 transition-transform duration-300 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
            <BrainCircuit size={24} className="text-indigo-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-3">Analyze My Resume</h3>
          <p className="text-slate-400 leading-relaxed mb-6">Upload your resume. Our AI reads it, finds your best skills, and tells you exactly how to improve it to get hired faster.</p>
          <div className="mt-auto">
            <span className="inline-flex items-center gap-2 text-indigo-400 font-bold group-hover:translate-x-1 transition-transform">Start Here <ArrowRight className="w-4 h-4" /></span>
          </div>
        </div>

        {/* Core Feature 2 */}
        <div className="bento-card group cursor-pointer animate-fade-up stagger-3" style={{ minHeight: '280px' }} onClick={() => navigate(ROUTES.JOB_MATCHING)}>
          <div className="bento-icon-wrapper group-hover:scale-110 transition-transform duration-300 shadow-[0_0_20px_rgba(139,92,246,0.2)]">
            <Briefcase size={24} className="text-violet-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-3">Find Jobs For Me</h3>
          <p className="text-slate-400 leading-relaxed mb-6">We take your skills and automatically find open jobs that perfectly match your profile.</p>
          <div className="mt-auto">
             <span className="inline-flex items-center gap-2 text-violet-400 font-bold group-hover:translate-x-1 transition-transform">Find Jobs <ArrowRight className="w-4 h-4" /></span>
          </div>
        </div>

        {/* Core Feature 3 */}
        <div className="bento-card group cursor-pointer animate-fade-up stagger-4" style={{ minHeight: '250px' }} onClick={() => navigate(ROUTES.SKILL_GAP)}>
          <div className="bento-icon-wrapper group-hover:scale-110 transition-transform duration-300">
            <Target size={24} className="text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-3">What Am I Missing?</h3>
          <p className="text-slate-400 leading-relaxed">See exactly what skills you need to learn to get the job you want.</p>
        </div>

        {/* Core Feature 4 */}
        <div className="bento-card group cursor-pointer animate-fade-up stagger-5" style={{ minHeight: '250px' }} onClick={() => navigate(ROUTES.MOCK_INTERVIEW)}>
          <div className="bento-icon-wrapper group-hover:scale-110 transition-transform duration-300">
            <MessageSquare size={24} className="text-amber-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-3">Practice Interview</h3>
          <p className="text-slate-400 leading-relaxed">Practice answering common questions with our interview coach so you are ready for the real thing.</p>
        </div>

        {/* Core Feature 5 */}
        <div className="bento-card group cursor-pointer animate-fade-up stagger-6" style={{ minHeight: '250px' }} onClick={() => navigate(ROUTES.CAREER_ROADMAP)}>
          <div className="bento-icon-wrapper group-hover:scale-110 transition-transform duration-300">
            <BarChart size={24} className="text-pink-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-3">My Career Plan</h3>
          <p className="text-slate-400 leading-relaxed">Get a simple, step-by-step plan to grow from your current job to your dream job.</p>
        </div>
        
      </div>
    </div>
  );
};

export default Dashboard;
