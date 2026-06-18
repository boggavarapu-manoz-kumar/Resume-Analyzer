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
    <div className="chat-container">
      {/* Intro Message */}
      <div className="ai-message">
        <div className="ai-avatar">AI</div>
        <div className="ai-content">
          <p>I've finished analyzing your resume. Here is my comprehensive feedback based on industry standards.</p>
        </div>
      </div>

      {/* Score Message */}
      <div className="ai-message">
        <div className="ai-avatar">AI</div>
        <div className="ai-content">
          <h3 style={{ marginTop: 0 }}>Overall Readiness Score: {analysis.overall_score}/100</h3>
          <p>
            <strong style={{ color: getScoreColor(analysis.overall_score) }}>
              {getScoreMessage(analysis.overall_score)}
            </strong>
          </p>
        </div>
      </div>

      {/* Summary Message */}
      <div className="ai-message">
        <div className="ai-avatar">AI</div>
        <div className="ai-content">
          <h3 style={{ marginTop: 0 }}>Recruiter's Summary</h3>
          <p>{analysis.summary_feedback}</p>
          
          <h3>Structural Feedback</h3>
          <p>{analysis.structural_feedback}</p>
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="ai-message">
        <div className="ai-avatar">AI</div>
        <div className="ai-content">
          <h3 style={{ marginTop: 0 }}>Core Strengths</h3>
          {analysis.strengths && analysis.strengths.length > 0 ? (
            <ul>
              {analysis.strengths.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          ) : (
            <p>No significant strengths identified.</p>
          )}

          <h3>Areas for Improvement</h3>
          {analysis.areas_for_improvement && analysis.areas_for_improvement.length > 0 ? (
            <ul>
              {analysis.areas_for_improvement.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          ) : (
            <p>Your resume looks perfect in this area!</p>
          )}
        </div>
      </div>

      {/* Actionable Suggestions */}
      {analysis.missing_keywords && analysis.missing_keywords.length > 0 && (
        <div className="ai-message">
          <div className="ai-avatar">AI</div>
          <div className="ai-content">
            <h3 style={{ marginTop: 0 }}>Missing Key Competencies</h3>
            <p>Based on the job description, you should strategically add these missing competencies to your resume:</p>
            <div className="flex" style={{ gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
              {analysis.missing_keywords.map((kw, idx) => (
                <span key={idx} style={{ 
                  backgroundColor: 'var(--color-bg-secondary)', 
                  padding: '0.25rem 0.75rem', 
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.875rem',
                  border: '1px solid var(--color-border)'
                }}>
                  {kw}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Next Steps */}
      <div className="ai-message">
        <div className="ai-avatar">AI</div>
        <div className="ai-content">
          <p>Would you like to explore specific job matches based on this profile, or view a detailed skill gap analysis?</p>
          <div className="flex gap-sm mt-md">
            <Link to={ROUTES.SKILL_GAP} className="btn btn-primary">
              View Skill Gap
            </Link>
            <Link to={ROUTES.JOB_MATCHING} className="btn btn-secondary">
              Find Matching Jobs
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalysis;
