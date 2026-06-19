import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { Lightbulb, CheckCircle, AlertTriangle, Target, Briefcase } from 'lucide-react';

const ResumeAnalysis = () => {
  const [data, setData] = useState(null);
  const navigate = useNavigate();
  const circleRef = useRef(null);

  useEffect(() => {
    // Retrieve data from session storage
    const stored = sessionStorage.getItem('currentAnalysis');
    if (stored) {
      setData(JSON.parse(stored));
    } else {
      // If no data, redirect to upload
      navigate(ROUTES.UPLOAD);
    }
  }, [navigate]);

  useEffect(() => {
    if (data && data.analysis && circleRef.current) {
      const score = data.analysis.overall_score || 0;
      const radius = 60;
      const circumference = 2 * Math.PI * radius;
      const offset = circumference - (score / 100) * circumference;
      
      // Setup initial state
      circleRef.current.style.strokeDasharray = `${circumference} ${circumference}`;
      circleRef.current.style.strokeDashoffset = circumference;
      
      // Animate
      setTimeout(() => {
        circleRef.current.style.strokeDashoffset = offset;
        
        // Color based on score
        if (score >= 80) circleRef.current.style.stroke = 'var(--color-success)';
        else if (score >= 60) circleRef.current.style.stroke = 'var(--color-warning)';
        else circleRef.current.style.stroke = 'var(--color-danger)';
      }, 100);
    }
  }, [data]);

  if (!data || !data.analysis) return <LoadingSpinner text="Loading AI Analysis..." />;

  const { analysis } = data;

  const getScoreColor = (score) => {
    if (score >= 80) return 'var(--color-success)';
    if (score >= 60) return 'var(--color-warning)';
    return 'var(--color-danger)';
  };

  const getScoreMessage = (score) => {
    if (score >= 80) return "Excellent! Your resume is highly optimized and competitive.";
    if (score >= 60) return "Good potential, but needs strategic improvements to stand out.";
    return "Needs significant changes. Strongly consider a complete rewrite.";
  };

  return (
    <div className="flex-col gap-lg max-w-3xl mx-auto" style={{ paddingBottom: 'var(--spacing-3xl)' }}>
      <div className="text-center animate-fade-up stagger-1" style={{ marginTop: '2rem' }}>
        <h1 className="hero-title" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Your Resume Analysis</h1>
        <p className="hero-subtitle" style={{ fontSize: '1.1rem', marginTop: '0' }}>Here is what our AI found in your resume.</p>
      </div>

      {/* Score Message */}
      <div className="bento-card animate-fade-up stagger-2" style={{ padding: '2rem', textAlign: 'center' }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Overall Score: {analysis.overall_score}/100</h3>
        <p style={{ fontSize: '1.1rem' }}>
          <strong style={{ color: getScoreColor(analysis.overall_score) }}>
            {getScoreMessage(analysis.overall_score)}
          </strong>
        </p>
      </div>

      {/* Summary Message */}
      <div className="bento-card animate-fade-up stagger-3" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: 'var(--color-primary)' }}>What Recruiters Think</h3>
        <p style={{ marginBottom: '1.5rem', fontSize: '1.05rem' }}>{analysis.summary_feedback}</p>
        
        <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: 'var(--color-primary)' }}>How Your Resume Looks</h3>
        <p style={{ fontSize: '1.05rem' }}>{analysis.structural_feedback}</p>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="bento-card animate-fade-up stagger-4" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: 'var(--color-success)' }}>What You Did Well</h3>
        {analysis.strengths && analysis.strengths.length > 0 ? (
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '2rem', fontSize: '1.05rem' }}>
            {analysis.strengths.map((item, idx) => (
              <li key={idx} style={{ marginBottom: '0.5rem' }}>{item}</li>
            ))}
          </ul>
        ) : (
          <p style={{ marginBottom: '2rem' }}>No major strengths found yet.</p>
        )}

        <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: 'var(--color-warning)' }}>What Needs Work</h3>
        {analysis.areas_for_improvement && analysis.areas_for_improvement.length > 0 ? (
          <ul style={{ paddingLeft: '1.5rem', fontSize: '1.05rem' }}>
            {analysis.areas_for_improvement.map((item, idx) => (
              <li key={idx} style={{ marginBottom: '0.5rem' }}>{item}</li>
            ))}
          </ul>
        ) : (
          <p>Your resume looks perfect in this area!</p>
        )}
      </div>

      {/* Actionable Suggestions */}
      {analysis.missing_keywords && analysis.missing_keywords.length > 0 && (
        <div className="bento-card animate-fade-up stagger-5" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: 'var(--color-accent)' }}>Missing Skills</h3>
          <p style={{ marginBottom: '1rem', fontSize: '1.05rem' }}>Add these keywords to your resume to match the job description better:</p>
          <div className="flex" style={{ gap: '0.5rem', flexWrap: 'wrap' }}>
            {analysis.missing_keywords.map((kw, idx) => (
              <span key={idx} className="badge">
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Next Steps */}
      <div className="bento-card animate-fade-up stagger-6" style={{ padding: '2rem', textAlign: 'center', borderColor: 'var(--color-accent)' }}>
        <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>What's Next?</h3>
        <p style={{ fontSize: '1.05rem', marginBottom: '1.5rem' }}>Do you want to see what jobs fit you best, or learn what skills you need to improve?</p>
        <div className="flex gap-md justify-center">
          <Link to={ROUTES.SKILL_GAP} className="btn btn-secondary">
            See Missing Skills
          </Link>
          <Link to={ROUTES.JOB_MATCHING} className="btn btn-primary">
            Find Matching Jobs
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalysis;
