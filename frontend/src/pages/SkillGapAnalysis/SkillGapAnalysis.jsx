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
          <h1 className="section-title">Skill Gap Analysis</h1>
          <p className="section-subtitle mb-0">Identify missing skills compared to industry standards or your target job.</p>
        </div>
        <div className="flex gap-sm">
          <Link to={ROUTES.MOCK_INTERVIEW} className="btn btn-primary">
            Prepare for Interview <span style={{ marginLeft: '0.25rem' }}>→</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-lg">
        {/* Present Skills */}
        <div className="card animate-fade-in">
          <div className="flex justify-between items-center mb-md">
            <h3 className="flex items-center gap-sm">
              <span style={{ color: 'var(--color-success)', display: 'flex' }}><Check size={20} /></span> Skills Found
            </h3>
            <span className="badge badge-success">{presentSkills.length}</span>
          </div>
          
          <div className="flex" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
            {presentSkills.length > 0 ? (
              presentSkills.map((skill, idx) => (
                <span key={idx} className="skill-tag skill-tag-present">
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-muted w-full text-center py-md">No technical skills detected.</p>
            )}
          </div>
        </div>

        {/* Missing Skills */}
        <div className="card animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex justify-between items-center mb-md">
            <h3 className="flex items-center gap-sm">
              <span style={{ color: 'var(--color-danger)', display: 'flex' }}><X size={20} /></span> Missing Keywords
            </h3>
            <span className="badge badge-danger">{missingSkills.length}</span>
          </div>
          
          <div className="flex" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
            {missingSkills.length > 0 ? (
              missingSkills.map((skill, idx) => (
                <span key={idx} className="skill-tag skill-tag-missing">
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-muted w-full text-center py-md" style={{ color: 'var(--color-success)' }}>
                Great! No major missing skills identified for the target role.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Recommendations & Courses */}
      {recommendations.length > 0 && (
        <div className="card animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <h3 className="mb-lg flex items-center gap-sm">
            <BookOpen size={24} color="var(--color-primary)" /> Recommended Learning Path
          </h3>
          
          <div className="grid grid-cols-2 gap-md">
            {recommendations.map((rec, idx) => (
              <div key={idx} className="card-glass" style={{ padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div className="flex justify-between items-start mb-sm">
                  <h4 style={{ color: 'var(--color-primary)' }}>{rec.skill}</h4>
                  <span className="badge badge-secondary">{rec.priority} Priority</span>
                </div>
                <p className="text-muted mb-md" style={{ fontSize: '0.875rem' }}>{rec.reason}</p>
                
                <h5 style={{ fontSize: '0.8125rem', color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>Suggested Resources:</h5>
                <ul style={{ paddingLeft: '1.25rem', fontSize: '0.8125rem' }}>
                  {rec.resources.map((res, rIdx) => (
                    <li key={rIdx} className="mb-xs text-muted">{res}</li>
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
