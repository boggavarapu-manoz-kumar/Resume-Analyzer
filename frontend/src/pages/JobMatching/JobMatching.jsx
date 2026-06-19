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

  if (loading) return <LoadingSpinner text="Looking for your perfect job..." />;

  return (
    <div className="flex-col gap-lg max-w-4xl mx-auto" style={{ paddingBottom: 'var(--spacing-3xl)' }}>
      <div className="text-center animate-fade-up stagger-1" style={{ marginTop: '2rem', marginBottom: '1rem' }}>
        <h1 className="hero-title" style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>Your Job Matches</h1>
        <p className="hero-subtitle" style={{ fontSize: '1.1rem', margin: 0 }}>We found these jobs that fit your skills perfectly.</p>
      </div>

      {error && (
        <div className="bento-card animate-fade-up stagger-2" style={{ padding: '1.5rem', textAlign: 'center', borderColor: 'var(--color-danger)' }}>
          <p style={{ color: 'var(--color-danger)', margin: 0, fontSize: '1.1rem' }}>{error}</p>
        </div>
      )}

      {!error && jobs.length === 0 && (
        <div className="bento-card animate-fade-up stagger-2" style={{ padding: '2rem', textAlign: 'center' }}>
          <p style={{ fontSize: '1.1rem', margin: 0 }}>We couldn't find any perfect matches right now. Try learning some new skills or check back later.</p>
        </div>
      )}

      {/* Jobs List */}
      {!error && jobs.length > 0 && (
        <div className="flex-col gap-lg animate-fade-up stagger-3">
          {jobs.map((job, idx) => (
            <div key={job.job_id || idx} className="bento-card" style={{ padding: '2rem' }}>
              <div className="flex justify-between items-start mb-sm">
                <h3 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--color-text-primary)' }}>{job.title}</h3>
                <span className="badge badge-success" style={{ fontSize: '1rem' }}>Match: {(job.match_score * 100).toFixed(0)}%</span>
              </div>
              <p style={{ fontWeight: 500, color: 'var(--color-accent)', marginBottom: '1rem', fontSize: '1.1rem' }}>{job.company}</p>
              <p style={{ fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '1.5rem', color: 'var(--color-text-secondary)' }}>
                {job.description}
              </p>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontSize: '0.95rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>Skills they want:</p>
                <div className="flex" style={{ gap: '0.5rem', flexWrap: 'wrap' }}>
                  {job.required_skills?.split(',').slice(0, 5).map(skill => (
                    <span key={skill} className="badge">
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-md">
                <button className="btn btn-primary" style={{ padding: '0.8rem 2rem' }}>Apply Now</button>
                <button className="btn btn-secondary">Save for later</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobMatching;
