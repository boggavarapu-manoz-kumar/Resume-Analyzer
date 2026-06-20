import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { ROUTES } from '../../utils/constants';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { Briefcase, Building, ExternalLink, BookmarkPlus, Zap, SearchX } from 'lucide-react';

const JobMatching = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      const stored = sessionStorage.getItem('currentAnalysis');
      let resumeText = '';
      if (stored) {
        const data = JSON.parse(stored);
        resumeText = data.parsed_data?.skills?.join(' ') || '';
      }

      if (!resumeText) {
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
    <div className="flex flex-col gap-8 max-w-5xl mx-auto pb-24 relative z-10">
      
      {/* Header */}
      <div className="text-center animate-fade-up stagger-1 mt-12 mb-4">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4">
          Perfect <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-500">Job Matches</span>
        </h1>
        <p className="text-lg text-slate-400 max-w-xl mx-auto">
          We scanned thousands of roles and found these opportunities that perfectly align with your skill set.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center animate-fade-up stagger-2">
          <SearchX className="w-12 h-12 text-red-400 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Resume Found</h3>
          <p className="text-slate-300">{error}</p>
          <button 
            onClick={() => navigate(ROUTES.UPLOAD)}
            className="mt-6 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors font-medium border border-white/10"
          >
            Upload Resume Now
          </button>
        </div>
      )}

      {!error && jobs.length === 0 && (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center backdrop-blur-xl animate-fade-up stagger-2">
          <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <SearchX className="w-10 h-10 text-slate-500" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">No Matches Right Now</h3>
          <p className="text-slate-400 max-w-md mx-auto">We couldn't find any perfect matches in our current database. Try learning some new skills or check back later.</p>
        </div>
      )}

      {/* Jobs List */}
      {!error && jobs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-up stagger-3">
          {jobs.map((job, idx) => (
            <div key={job.job_id || idx} className="group bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl hover:bg-white/10 hover:border-violet-500/30 transition-all duration-300 flex flex-col h-full shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
              
              <div className="flex justify-between items-start mb-6 gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2 leading-tight group-hover:text-violet-300 transition-colors">{job.title}</h3>
                  <div className="flex items-center gap-2 text-violet-400 font-medium">
                    <Building className="w-4 h-4" />
                    {job.company}
                  </div>
                </div>
                <div className="shrink-0 flex flex-col items-center justify-center bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-4 py-3">
                  <span className="text-xs text-emerald-400/80 font-bold uppercase tracking-wider mb-1">Match</span>
                  <span className="text-xl font-black text-emerald-400 flex items-center gap-1">
                    <Zap className="w-4 h-4" /> {(job.match_score * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
              
              <p className="text-slate-400 leading-relaxed mb-8 flex-1 line-clamp-4">
                {job.description}
              </p>
              
              <div className="mb-8">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-3">Desired Skills</p>
                <div className="flex flex-wrap gap-2">
                  {job.required_skills?.split(',').slice(0, 5).map(skill => (
                    <span key={skill} className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-xs font-medium">
                      {skill.trim()}
                    </span>
                  ))}
                  {(job.required_skills?.split(',').length > 5) && (
                    <span className="px-3 py-1 rounded-lg bg-white/5 border border-transparent text-slate-500 text-xs font-medium">
                      +{job.required_skills.split(',').length - 5} more
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-white/10 mt-auto">
                <button className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold py-3 px-6 rounded-xl transition-all hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:scale-[1.02]">
                  Apply Now <ExternalLink className="w-4 h-4" />
                </button>
                <button className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 font-bold py-3 px-6 rounded-xl transition-colors">
                  <BookmarkPlus className="w-5 h-5" /> Save
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobMatching;
