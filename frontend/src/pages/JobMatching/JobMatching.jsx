import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { ROUTES } from '../../utils/constants';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { Search } from 'lucide-react';

const JobMatching = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      // Get resume text from session or use a default query
      const stored = sessionStorage.getItem('currentAnalysis');
      let resumeText = '';
      if (stored) {
        const data = JSON.parse(stored);
        resumeText = data.parsed_data?.skills?.join(' ') || '';
      }

      if (!resumeText) {
        // If no skills found, we could fetch jobs anyway, but let's prompt them
        setError('Please upload a resume first to get personalized job matches.');
        setLoading(false);
        return;
      }

      try {
        const response = await api.post('/api/jobs/match', { resume_text: resumeText });
        setJobs(response.data.matched_jobs || []);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch job matches.');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [navigate]);

  if (loading) return <LoadingSpinner text="Finding the best jobs for you..." />;

  return (
    <div className="chat-container">
      {/* AI Intro Message */}
      <div className="ai-message">
        <div className="ai-avatar">AI</div>
        <div className="ai-content">
          <p>I have scanned available roles that match your extracted skills and experience.</p>
          {error && (
            <p style={{ color: 'var(--color-text-secondary)', backgroundColor: '#fffbeb', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #fde68a', marginTop: '0.5rem' }}>
              {error}
            </p>
          )}
          {!error && jobs.length === 0 && (
            <p style={{ marginTop: '0.5rem' }}>Unfortunately, I couldn't find any perfect matches right now. Try expanding your skills or check back later.</p>
          )}
          {!error && jobs.length > 0 && (
            <p style={{ marginTop: '0.5rem' }}>Here are the top matches I found for you:</p>
          )}
        </div>
      </div>

      {/* Jobs List (Rendered as AI follow-up) */}
      {!error && jobs.length > 0 && (
        <div className="ai-message">
          <div className="ai-avatar" style={{ backgroundColor: 'transparent' }}></div>
          <div className="ai-content">
            <div className="flex-col gap-lg">
              {jobs.map((job, idx) => (
                <div key={job.job_id || idx} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1.25rem', backgroundColor: 'var(--color-bg-primary)' }}>
                  <div className="flex justify-between items-start mb-sm">
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{job.title}</h3>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-accent)' }}>Match: {(job.match_score * 100).toFixed(0)}%</span>
                  </div>
                  <p style={{ fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.75rem', fontSize: '0.95rem' }}>{job.company}</p>
                  <p style={{ fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {job.description}
                  </p>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Key Skills Required:</p>
                    <div className="flex" style={{ gap: '0.5rem', flexWrap: 'wrap' }}>
                      {job.required_skills?.split(',').slice(0, 5).map(skill => (
                        <span key={skill} style={{ backgroundColor: 'var(--color-bg-secondary)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', border: '1px solid var(--color-border)' }}>
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-sm">
                    <button className="btn btn-primary">Apply Now</button>
                    <button className="btn btn-secondary">Save Job</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobMatching;
