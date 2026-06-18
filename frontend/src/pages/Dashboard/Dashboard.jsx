import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';
import api from '../../services/api';
import { FileUp, Target, Briefcase, Zap, BrainCircuit, BarChart } from 'lucide-react';

const Dashboard = () => {
  const [resumes, setResumes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Optionally fetch resumes or user stats to show personalized greeting
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
      <div className="flex-col items-center text-center animate-fade-up stagger-1" style={{ marginTop: '4rem', marginBottom: '4rem' }}>
        <div className="pulse-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', marginBottom: '2rem', color: 'var(--color-accent)', fontWeight: 500, fontSize: '0.875rem' }}>
          <Zap size={16} fill="currentColor" /> Welcome to the future of career acceleration
        </div>
        
        <h1 className="hero-title">
          Elevate Your Resume<br />with AI Precision.
        </h1>
        
        <p className="hero-subtitle">
          Unlock your career potential. Our AI deeply analyzes your experience, uncovers hidden skill gaps, and matches you with your dream job in seconds.
        </p>
        
        <div className="flex gap-md justify-center">
          <Link to={ROUTES.UPLOAD} className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
            Get Started
          </Link>
          {resumes.length > 0 && (
            <Link to={ROUTES.RESUME_ANALYSIS} className="btn btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
              View Recent Analysis
            </Link>
          )}
        </div>
      </div>

      {/* Bento Grid Showcase */}
      <div className="bento-grid">
        {/* Core Feature 1 */}
        <div className="bento-card animate-fade-up stagger-2" style={{ gridColumn: 'span 8', minHeight: '300px' }} onClick={() => navigate(ROUTES.UPLOAD)}>
          <div className="bento-icon-wrapper" style={{ color: '#8b5cf6' }}>
            <BrainCircuit size={24} />
          </div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>AI Resume Analysis</h3>
          <p style={{ fontSize: '1.1rem', maxWidth: '80%' }}>Upload your PDF or DOCX. Our proprietary AI scans your structure, extracts core competencies, and gives you actionable feedback to beat ATS systems instantly.</p>
          <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
            <span style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>Upload Now →</span>
          </div>
        </div>

        {/* Core Feature 2 */}
        <div className="bento-card animate-fade-up stagger-3" style={{ gridColumn: 'span 4', minHeight: '300px' }} onClick={() => navigate(ROUTES.JOB_MATCHING)}>
          <div className="bento-icon-wrapper" style={{ color: '#10b981' }}>
            <Briefcase size={24} />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Job Matching</h3>
          <p>We cross-reference your AI-extracted profile with live roles to find your perfect fit.</p>
          <div style={{ marginTop: 'auto' }}>
            <span style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>Find Jobs →</span>
          </div>
        </div>

        {/* Core Feature 3 */}
        <div className="bento-card animate-fade-up stagger-4" style={{ gridColumn: 'span 6', minHeight: '250px' }} onClick={() => navigate(ROUTES.SKILL_GAP)}>
          <div className="bento-icon-wrapper" style={{ color: '#3b82f6' }}>
            <Target size={24} />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Skill Gap Analysis</h3>
          <p>Identify exactly what skills you're missing for your target role and get a roadmap to learn them.</p>
        </div>

        {/* Core Feature 4 */}
        <div className="bento-card animate-fade-up stagger-4" style={{ gridColumn: 'span 6', minHeight: '250px' }} onClick={() => navigate(ROUTES.CAREER_ROADMAP)}>
          <div className="bento-icon-wrapper" style={{ color: '#f59e0b' }}>
            <BarChart size={24} />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Career Roadmap</h3>
          <p>Generate a step-by-step progression plan to go from your current role to your dream career.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
