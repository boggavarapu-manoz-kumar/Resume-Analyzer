import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';
import api from '../../services/api';
import { FileUp, Target, Briefcase, Zap, BrainCircuit, BarChart, MessageSquare } from 'lucide-react';

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
        <div className="pulse-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#f0f9ff', border: '1px solid #bae6fd', padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', marginBottom: '2rem', color: '#0284c7', fontWeight: 600, fontSize: '0.875rem' }}>
          <Zap size={16} fill="currentColor" /> Welcome to the future of career acceleration
        </div>
        
        <h1 className="hero-title">
          Elevate Your Resume<br />with <span>AI Precision.</span>
        </h1>
        
        <p className="hero-subtitle">
          Unlock your career potential. Our platform deeply analyzes your experience, uncovers hidden skill gaps, and matches you with your dream job in seconds.
        </p>
        
        <div className="flex gap-md justify-center">
          <Link to={ROUTES.UPLOAD} className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
            Get Started
          </Link>
          {resumes.length > 0 && (
            <Link to={ROUTES.RESUME_ANALYSIS} className="btn btn-secondary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
              View Recent Analysis
            </Link>
          )}
        </div>
      </div>

      {/* Bento Grid Showcase */}
      <div className="bento-grid">
        {/* Core Feature 1 */}
        <div className="bento-card animate-fade-up stagger-2" style={{ minHeight: '280px' }} onClick={() => navigate(ROUTES.UPLOAD)}>
          <div className="bento-icon-wrapper">
            <BrainCircuit size={24} />
          </div>
          <h3>Analyze My Resume</h3>
          <p style={{ fontSize: '1.05rem', maxWidth: '95%' }}>Upload your resume. Our platform reads it, finds your best skills, and tells you exactly how to improve it to get hired faster.</p>
          <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-start' }}>
            <span className="badge badge-primary">Start Here &rarr;</span>
          </div>
        </div>

        {/* Core Feature 2 */}
        <div className="bento-card animate-fade-up stagger-3" style={{ minHeight: '280px' }} onClick={() => navigate(ROUTES.JOB_MATCHING)}>
          <div className="bento-icon-wrapper">
            <Briefcase size={24} />
          </div>
          <h3>Find Jobs For Me</h3>
          <p>We take your skills and automatically find open jobs that perfectly match your profile.</p>
          <div style={{ marginTop: 'auto' }}>
            <span className="badge">Find Jobs &rarr;</span>
          </div>
        </div>

        {/* Core Feature 3 */}
        <div className="bento-card animate-fade-up stagger-4" style={{ minHeight: '250px' }} onClick={() => navigate(ROUTES.SKILL_GAP)}>
          <div className="bento-icon-wrapper">
            <Target size={24} />
          </div>
          <h3>What Am I Missing?</h3>
          <p>See exactly what skills you need to learn to get the job you want.</p>
        </div>

        {/* Core Feature 4 */}
        <div className="bento-card animate-fade-up stagger-5" style={{ minHeight: '250px' }} onClick={() => navigate(ROUTES.MOCK_INTERVIEW)}>
          <div className="bento-icon-wrapper">
            <MessageSquare size={24} />
          </div>
          <h3>Practice Interview</h3>
          <p>Practice answering common questions with our interview coach so you are ready for the real thing.</p>
        </div>

        {/* Core Feature 5 */}
        <div className="bento-card animate-fade-up stagger-6" style={{ minHeight: '250px' }} onClick={() => navigate(ROUTES.CAREER_ROADMAP)}>
          <div className="bento-icon-wrapper">
            <BarChart size={24} />
          </div>
          <h3>My Career Plan</h3>
          <p>Get a simple, step-by-step plan to grow from your current job to your dream job.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
