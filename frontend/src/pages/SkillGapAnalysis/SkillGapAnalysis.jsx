import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { BookOpen, Check, X } from 'lucide-react';

const SkillGapAnalysis = () => {
  const [data, setData] = useState(null);
  const navigate = useNavigate();

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

  if (!data) return <LoadingSpinner text="Loading Skills..." />;

  const presentSkills = data.parsed_data?.skills || [];
  const missingSkills = data.missing_skills || [];
  const recommendations = data.skill_recommendations || [];

  return (
    <div className="flex-col gap-xl max-w-4xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="hero-title" style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>What You're Missing</h1>
          <p className="hero-subtitle" style={{ fontSize: '1.1rem', margin: 0 }}>See the skills you need to learn to get your dream job.</p>
        </div>
        <div className="flex gap-sm">
          <Link to={ROUTES.MOCK_INTERVIEW} className="btn btn-primary">
            Prepare for Interview <span style={{ marginLeft: '0.25rem' }}>→</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-lg">
        {/* Present Skills */}
        <div className="bento-card animate-fade-up stagger-2" style={{ padding: '2rem' }}>
          <div className="flex justify-between items-center mb-md">
            <h3 className="flex items-center gap-sm" style={{ fontSize: '1.3rem' }}>
              <span style={{ color: 'var(--color-success)', display: 'flex' }}><Check size={24} /></span> Skills You Have
            </h3>
            <span className="badge badge-success">{presentSkills.length}</span>
          </div>
          
          <div className="flex" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
            {presentSkills.length > 0 ? (
              presentSkills.map((skill, idx) => (
                <span key={idx} className="badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)', color: 'var(--color-success)' }}>
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-muted w-full py-md">No technical skills detected.</p>
            )}
          </div>
        </div>

        {/* Missing Skills */}
        <div className="bento-card animate-fade-up stagger-3" style={{ padding: '2rem' }}>
          <div className="flex justify-between items-center mb-md">
            <h3 className="flex items-center gap-sm" style={{ fontSize: '1.3rem' }}>
              <span style={{ color: 'var(--color-danger)', display: 'flex' }}><X size={24} /></span> Skills You Need
            </h3>
            <span className="badge badge-danger">{missingSkills.length}</span>
          </div>
          
          <div className="flex" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
            {missingSkills.length > 0 ? (
              missingSkills.map((skill, idx) => (
                <span key={idx} className="badge" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)', color: 'var(--color-danger)' }}>
                  {skill}
                </span>
              ))
            ) : (
              <p className="w-full py-md" style={{ color: 'var(--color-success)' }}>
                Great! You have all the skills needed for this job.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Recommendations & Courses */}
      {recommendations.length > 0 && (
        <div className="bento-card animate-fade-up stagger-4" style={{ padding: '2rem', marginTop: '1rem' }}>
          <h3 className="mb-lg flex items-center gap-sm" style={{ fontSize: '1.5rem' }}>
            <BookOpen size={24} color="var(--color-primary)" /> How to Learn Them
          </h3>
          
          <div className="grid grid-cols-2 gap-md" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            {recommendations.map((rec, idx) => (
              <div key={idx} style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border)' }}>
                <div className="flex justify-between items-start mb-sm">
                  <h4 style={{ color: 'var(--color-primary)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>{rec.skill}</h4>
                  <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>{rec.priority} Priority</span>
                </div>
                <p style={{ fontSize: '1rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>{rec.reason}</p>
                
                <h5 style={{ fontSize: '0.9rem', color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>Resources to help:</h5>
                <ul style={{ paddingLeft: '1.25rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                  {rec.resources.map((res, rIdx) => (
                    <li key={rIdx} className="mb-xs">{res}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillGapAnalysis;
