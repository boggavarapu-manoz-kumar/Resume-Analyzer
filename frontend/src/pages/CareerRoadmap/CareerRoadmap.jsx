import React, { useState } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { Award } from 'lucide-react';

const CareerRoadmap = () => {
  const [currentRole, setCurrentRole] = useState('Junior Developer');
  const [targetRole, setTargetRole] = useState('Senior Full Stack Engineer');
  const [skills, setSkills] = useState('React, Node.js, SQL');
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState(null);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const skillList = skills.split(',').map(s => s.trim());
      const response = await api.post('/api/interviews/career-guidance', { 
        current_role: currentRole,
        target_role: targetRole,
        skills: skillList
      });
      setRoadmap(response.data);
    } catch (err) {
      console.error(err);
      alert('Failed to generate career roadmap.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-col gap-lg max-w-4xl mx-auto">
      <div className="text-center mb-md">
        <h1 className="section-title">AI Career Roadmap</h1>
        <p className="section-subtitle">Get a step-by-step personalized guide to reach your dream role.</p>
      </div>

      <div className="card">
        <form onSubmit={handleGenerate} className="grid grid-cols-2 gap-md items-end">
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label">Your Current Skills</label>
            <input 
              type="text" 
              className="form-input" 
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g. Python, Django, REST APIs"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Current Role</label>
            <input 
              type="text" 
              className="form-input" 
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Target Role</label>
            <input 
              type="text" 
              className="form-input" 
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              required
            />
          </div>
          <div style={{ gridColumn: 'span 2', marginTop: '1rem' }}>
            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? 'Generating Path...' : 'Generate Roadmap'}
            </button>
          </div>
        </form>
      </div>

      {loading && <LoadingSpinner text="Analyzing career paths and building your roadmap..." size="large" />}

      {roadmap && !loading && (
        <div className="flex-col gap-lg mt-lg animate-fade-in">
          <div className="card">
            <h2 className="mb-md text-center" style={{ color: 'var(--color-primary)' }}>
              Your Path to {targetRole}
            </h2>
            
            {roadmap.career_recommendation && (
              <div className="card-glass mb-lg" style={{ padding: '1.25rem', borderLeft: '4px solid var(--color-primary)', borderRadius: 'var(--radius-md)' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--color-primary)' }}>AI Transition Guidance</h3>
                <p className="text-muted" style={{ fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>{roadmap.career_recommendation}</p>
              </div>
            )}

            <div className="flex-col gap-md">
              {(() => {
                const stepsList = (roadmap.learning_roadmap || roadmap.steps || []).map((step, idx) => ({
                  number: step.step || idx + 1,
                  title: step.topic || step.title || `Step ${idx + 1}`,
                  duration: step.duration || '',
                  description: step.details || step.description || '',
                  resources: step.resources || null
                }));

                if (stepsList.length === 0) {
                  return (
                    <div className="prose text-muted" style={{ whiteSpace: 'pre-line', lineHeight: '1.8' }}>
                      {roadmap.raw_text || JSON.stringify(roadmap)}
                    </div>
                  );
                }

                return stepsList.map((step, idx) => (
                  <div key={idx} className="flex gap-md">
                    <div className="flex-col items-center">
                      <div style={{ 
                        width: '32px', height: '32px', 
                        borderRadius: '50%', background: 'var(--gradient-primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 'bold', color: 'white', zIndex: 2
                      }}>
                        {step.number}
                      </div>
                      {idx < stepsList.length - 1 && (
                        <div style={{ width: '2px', flex: 1, background: 'var(--color-border-subtle)', margin: '0.25rem 0' }}></div>
                      )}
                    </div>
                    <div className="card-glass flex-1 mb-md" style={{ padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                      <div className="flex justify-between items-start mb-xs">
                        <h3 style={{ margin: 0, color: 'var(--color-text-primary)' }}>{step.title}</h3>
                        {step.duration && <span className="badge badge-secondary">{step.duration}</span>}
                      </div>
                      <p className="text-muted" style={{ fontSize: '0.875rem', margin: 0 }}>{step.description}</p>
                      {step.resources && step.resources.length > 0 && (
                        <div className="mt-sm">
                          <strong style={{ fontSize: '0.75rem', color: 'var(--color-secondary)' }}>Focus Areas: </strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{step.resources.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ));
              })()}
            </div>

            {roadmap.certifications && roadmap.certifications.length > 0 && (
              <div className="card-glass mt-lg" style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', color: 'var(--color-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Award size={20} /> Recommended Certifications</h3>
                <div className="flex gap-xs" style={{ flexWrap: 'wrap' }}>
                  {roadmap.certifications.map((cert, cIdx) => (
                    <span key={cIdx} className="skill-tag skill-tag-neutral" style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}>
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerRoadmap;
