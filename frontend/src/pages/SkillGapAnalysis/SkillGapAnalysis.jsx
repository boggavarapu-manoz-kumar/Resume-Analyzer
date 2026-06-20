import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { BookOpen, CheckCircle2, XCircle, ArrowRight, Lightbulb, PlayCircle } from 'lucide-react';

const SkillGapAnalysis = () => {
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = sessionStorage.getItem('currentAnalysis');
    if (stored) {
      setData(JSON.parse(stored));
    } else {
      navigate(ROUTES.UPLOAD);
    }
  }, [navigate]);

  if (!data) return <LoadingSpinner text="Analyzing Skills..." />;

  const presentSkills = data.parsed_data?.skills || [];
  const missingSkills = data.missing_skills || [];
  const recommendations = data.skill_recommendations || [];

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto pb-24 relative z-10">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mt-12 mb-8 animate-fade-up stagger-1">
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2">
            Skill <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-500">Gap Analysis</span>
          </h1>
          <p className="text-lg text-slate-400">
            Identify what's holding you back and learn exactly what you need for your dream job.
          </p>
        </div>
        <div className="shrink-0">
          <Link to={ROUTES.MOCK_INTERVIEW} className="group flex items-center justify-center gap-2 bg-white text-black font-bold py-3 px-6 rounded-xl transition-all hover:bg-slate-200 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
            Prepare for Interview <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Present Skills */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl animate-fade-up stagger-2 relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex justify-between items-center mb-8 relative z-10">
            <h3 className="flex items-center gap-3 text-2xl font-bold text-white">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              Skills You Have
            </h3>
            <span className="px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold">
              {presentSkills.length} Total
            </span>
          </div>
          
          <div className="flex flex-wrap gap-3 relative z-10">
            {presentSkills.length > 0 ? (
              presentSkills.map((skill, idx) => (
                <span key={idx} className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium">
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-slate-500 italic py-4">No technical skills detected.</p>
            )}
          </div>
        </div>

        {/* Missing Skills */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl animate-fade-up stagger-3 relative overflow-hidden group hover:border-rose-500/30 transition-colors">
           <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl pointer-events-none"></div>
           
          <div className="flex justify-between items-center mb-8 relative z-10">
            <h3 className="flex items-center gap-3 text-2xl font-bold text-white">
               <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <XCircle className="w-6 h-6" />
              </div>
              Skills You Need
            </h3>
            <span className="px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold">
              {missingSkills.length} Missing
            </span>
          </div>
          
          <div className="flex flex-wrap gap-3 relative z-10">
            {missingSkills.length > 0 ? (
              missingSkills.map((skill, idx) => (
                <span key={idx} className="px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 font-medium">
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-emerald-400 py-4 flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-5 h-5"/> Great! You have all the skills needed.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Recommendations & Courses */}
      {recommendations.length > 0 && (
        <div className="animate-fade-up stagger-4 mt-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent flex-1"></div>
            <h3 className="flex items-center gap-3 text-2xl font-bold text-white whitespace-nowrap">
               <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                <BookOpen className="w-6 h-6" />
              </div>
              How To Learn Them
            </h3>
            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent flex-1"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendations.map((rec, idx) => (
              <div key={idx} className="bg-black/40 border border-white/10 rounded-3xl p-8 hover:bg-white/5 hover:border-blue-500/30 transition-colors flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-xl font-bold text-blue-400">{rec.skill}</h4>
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider
                    ${rec.priority?.toLowerCase() === 'high' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 
                      rec.priority?.toLowerCase() === 'medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 
                      'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
                    {rec.priority} Priority
                  </span>
                </div>
                
                <p className="text-slate-400 leading-relaxed mb-6 flex-1">
                  <Lightbulb className="w-4 h-4 inline-block mr-2 text-yellow-400/70" />
                  {rec.reason}
                </p>
                
                <div className="mt-auto pt-6 border-t border-white/10">
                  <h5 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Recommended Resources</h5>
                  <ul className="space-y-3">
                    {rec.resources.map((res, rIdx) => (
                      <li key={rIdx} className="flex items-start gap-3 group/item">
                        <PlayCircle className="w-5 h-5 text-slate-500 shrink-0 group-hover/item:text-blue-400 transition-colors" />
                        <span className="text-slate-300 text-sm leading-relaxed group-hover/item:text-white transition-colors cursor-pointer">{res}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillGapAnalysis;
