import React, { useState } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { Award, Compass, ArrowRight, Target, Map, MapPin, Zap } from 'lucide-react';

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
    <div className="flex flex-col gap-8 max-w-4xl mx-auto pb-24 relative z-10">
      
      {/* Header */}
      <div className="text-center animate-fade-up stagger-1 mt-12 mb-4">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4">
          AI Career <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Roadmap</span>
        </h1>
        <p className="text-lg text-slate-400 max-w-xl mx-auto">
          Get a personalized, step-by-step master plan to bridge the gap between where you are and where you want to be.
        </p>
      </div>

      {/* Input Form */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden animate-fade-up stagger-2 group hover:border-amber-500/30 transition-colors">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-white mb-2 tracking-wide uppercase">Your Current Skills</label>
            <input 
              type="text" 
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g. Python, Django, REST APIs"
              required
              className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all font-medium"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-white mb-2 tracking-wide uppercase">Current Role</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                <MapPin className="w-5 h-5" />
              </div>
              <input 
                type="text" 
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value)}
                required
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all font-medium"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-white mb-2 tracking-wide uppercase">Target Dream Role</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                <Target className="w-5 h-5" />
              </div>
              <input 
                type="text" 
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                required
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all font-medium"
              />
            </div>
          </div>
          <div className="md:col-span-2 mt-4">
            <button 
              type="submit" 
              className="group relative w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold py-4 rounded-xl transition-all hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] disabled:opacity-70 hover:scale-[1.01]" 
              disabled={loading}
            >
              {loading ? (
                <><Zap className="w-5 h-5 animate-spin" /> Generating Master Plan...</>
              ) : (
                <><Compass className="w-5 h-5" /> Generate Roadmap <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </div>
        </form>
      </div>

      {loading && <LoadingSpinner text="Analyzing career paths and building your roadmap..." />}

      {roadmap && !loading && (
        <div className="flex flex-col gap-8 mt-4 animate-fade-up stagger-3">
          
          <div className="text-center mb-4">
            <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
              <Map className="w-8 h-8 text-amber-400" />
              Your Path to {targetRole}
            </h2>
          </div>

          {/* AI Guidance Summary */}
          {roadmap.career_recommendation && (
            <div className="bg-amber-500/10 border-l-4 border-amber-500 rounded-r-2xl p-6 backdrop-blur-md">
              <h3 className="text-lg font-bold text-amber-400 mb-2">Strategic Insight</h3>
              <p className="text-slate-300 leading-relaxed">{roadmap.career_recommendation}</p>
            </div>
          )}

          {/* Timeline / Roadmap Steps */}
          <div className="flex flex-col gap-6 relative">
            {/* Connecting line */}
            <div className="absolute left-[27px] top-4 bottom-4 w-1 bg-white/10 rounded-full hidden sm:block"></div>

            {(() => {
              const stepsList = (roadmap.learning_roadmap || roadmap.steps || []).map((step, idx) => ({
                number: step.step || idx + 1,
                title: step.topic || step.title || `Phase ${idx + 1}`,
                duration: step.duration || '',
                description: step.details || step.description || '',
                resources: step.resources || null
              }));

              if (stepsList.length === 0) {
                return (
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-8 whitespace-pre-line text-slate-300 leading-relaxed">
                    {roadmap.raw_text || JSON.stringify(roadmap)}
                  </div>
                );
              }

              return stepsList.map((step, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row gap-6 relative z-10 group">
                  {/* Step Number Badge */}
                  <div className="shrink-0 flex sm:flex-col items-center gap-4 sm:gap-0">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center font-black text-xl text-white shadow-[0_0_15px_rgba(245,158,11,0.5)] group-hover:scale-110 transition-transform duration-300">
                      {step.number}
                    </div>
                    {/* Mobile connecting line if needed, usually we just stack */}
                  </div>
                  
                  {/* Step Content */}
                  <div className="flex-1 bg-white/5 border border-white/10 hover:border-amber-500/30 hover:bg-white/10 transition-colors rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-lg">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                      <h3 className="text-2xl font-bold text-white">{step.title}</h3>
                      {step.duration && (
                        <span className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-400 font-bold text-sm uppercase tracking-wider whitespace-nowrap">
                          {step.duration}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-300 leading-relaxed mb-6">{step.description}</p>
                    
                    {step.resources && step.resources.length > 0 && (
                      <div className="pt-4 border-t border-white/10">
                        <strong className="text-sm font-bold text-amber-500 uppercase tracking-wider block mb-2">Focus Areas</strong>
                        <div className="flex flex-wrap gap-2">
                          {step.resources.map((res, rIdx) => (
                            <span key={rIdx} className="px-3 py-1.5 bg-black/40 border border-white/10 rounded-lg text-slate-300 text-sm font-medium">
                              {res}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ));
            })()}
          </div>

          {/* Certifications */}
          {roadmap.certifications && roadmap.certifications.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl mt-4">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Award className="w-6 h-6" />
                </div>
                Recommended Certifications
              </h3>
              <div className="flex flex-wrap gap-3">
                {roadmap.certifications.map((cert, cIdx) => (
                  <div key={cIdx} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl text-amber-400 font-bold hover:scale-105 transition-transform cursor-default">
                    <Award className="w-4 h-4" /> {cert}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default CareerRoadmap;
