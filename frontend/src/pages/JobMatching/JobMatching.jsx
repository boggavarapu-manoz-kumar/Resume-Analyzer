import React, { useState, useEffect } from 'react';
import { Search, MapPin, Briefcase, ExternalLink, Laptop, Clock, Filter, Globe, Calendar, FileText } from 'lucide-react';

const JobMatching = () => {
  const [targetRole, setTargetRole] = useState('');
  const [location, setLocation] = useState('');
  const [isRemote, setIsRemote] = useState(true);
  const [experienceLevel, setExperienceLevel] = useState('4'); // Default Mid-Senior
  const [datePosted, setDatePosted] = useState(''); // r86400 (24h), r604800 (1w), r2592000 (1m)
  const [jobType, setJobType] = useState(''); // F (Full-time), P (Part-time), C (Contract), I (Internship)

  useEffect(() => {
    // Try to pre-fill from analyzed resume data
    const stored = sessionStorage.getItem('currentAnalysis');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data.target_job) {
          setTargetRole(data.target_job);
        } else if (data.analysis?.persona?.primary_goal) {
          setTargetRole(data.analysis.persona.primary_goal);
        }
      } catch (err) {
        console.error('Error parsing session data:', err);
      }
    }
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!targetRole) return;

    const encodedRole = encodeURIComponent(targetRole);
    const encodedLocation = encodeURIComponent(location || 'Worldwide');
    
    // Construct Advanced LinkedIn Jobs Search URL
    let linkedInUrl = `https://www.linkedin.com/jobs/search/?keywords=${encodedRole}&location=${encodedLocation}`;
    
    const filters = [];
    if (isRemote) filters.push('f_WT=2'); // 2 = Remote
    if (experienceLevel) filters.push(`f_E=${experienceLevel}`); // 2=Entry, 3=Assoc, 4=Mid, 5=Dir, 6=Exec
    if (datePosted) filters.push(`f_TPR=${datePosted}`);
    if (jobType) filters.push(`f_JT=${jobType}`);
    
    if (filters.length > 0) {
      linkedInUrl += `&${filters.join('&')}`;
    }
    
    window.open(linkedInUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-4 py-8 md:py-12 relative z-10">
      {/* Premium Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] md:w-[800px] h-[400px] md:h-[800px] bg-[#0A66C2]/10 rounded-full blur-[100px] md:blur-[150px] pointer-events-none"></div>
      
      <div className="max-w-4xl w-full relative z-10 animate-fade-up">
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 md:px-5 md:py-2 rounded-full bg-[#0A66C2]/20 text-[#60A5FA] border border-[#0A66C2]/30 mb-6 font-bold text-xs md:text-sm shadow-[0_0_15px_rgba(10,102,194,0.3)]">
            <Globe className="w-4 h-4" />
            Direct LinkedIn Integration
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight text-white mb-4 md:mb-6 leading-tight">
            Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#60A5FA] to-[#3B82F6]">Perfect Match</span>
          </h1>
          <p className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed px-2">
            Configure your filters below for hyper-accurate matches. We will instantly redirect you to LinkedIn with all parameters perfectly applied.
          </p>
        </div>

        <form onSubmit={handleSearch} className="bg-[#0f172a]/80 border border-slate-700/50 rounded-2xl md:rounded-3xl p-6 md:p-10 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
          {/* subtle pattern overlay */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3B82F6_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none"></div>

          <div className="space-y-6 md:space-y-8 relative z-10">
            
            {/* Primary Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2 md:space-y-3">
                <label htmlFor="role" className="block text-xs md:text-sm font-bold text-slate-300 uppercase tracking-wider">
                  Target Role <span className="text-[#60A5FA]">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-[#60A5FA]">
                    <Briefcase className="w-5 h-5 text-slate-400 group-focus-within:text-[#60A5FA] transition-colors" />
                  </div>
                  <input
                    type="text"
                    id="role"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g. Senior Frontend Engineer"
                    className="block w-full pl-12 pr-4 py-3.5 md:py-4 bg-slate-900/50 border border-slate-600 rounded-xl md:rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all shadow-inner text-sm md:text-base"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2 md:space-y-3">
                <label htmlFor="location" className="block text-xs md:text-sm font-bold text-slate-300 uppercase tracking-wider">
                  Location
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MapPin className="w-5 h-5 text-slate-400 group-focus-within:text-[#60A5FA] transition-colors" />
                  </div>
                  <input
                    type="text"
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Worldwide, Remote, New York"
                    className="block w-full pl-12 pr-4 py-3.5 md:py-4 bg-slate-900/50 border border-slate-600 rounded-xl md:rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all shadow-inner text-sm md:text-base"
                  />
                </div>
              </div>
            </div>

            <hr className="border-slate-700/50" />

            {/* Smart Filters */}
            <div>
              <div className="flex items-center gap-2 mb-4 md:mb-6">
                <Filter className="w-4 h-4 md:w-5 md:h-5 text-[#60A5FA]" />
                <h3 className="text-sm md:text-base font-bold text-white uppercase tracking-wider">Advanced Filters</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                
                {/* Experience Level */}
                <div className="space-y-2">
                  <label className="block text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Experience
                  </label>
                  <div className="relative">
                    <select
                      value={experienceLevel}
                      onChange={(e) => setExperienceLevel(e.target.value)}
                      className="block w-full pl-10 pr-8 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6] appearance-none cursor-pointer transition-all shadow-inner text-sm"
                    >
                      <option value="">Any Level</option>
                      <option value="2">Entry Level</option>
                      <option value="3">Associate</option>
                      <option value="4">Mid-Senior</option>
                      <option value="5">Director</option>
                      <option value="6">Executive</option>
                    </select>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Clock className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                </div>

                {/* Date Posted */}
                <div className="space-y-2">
                  <label className="block text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Date Posted
                  </label>
                  <div className="relative">
                    <select
                      value={datePosted}
                      onChange={(e) => setDatePosted(e.target.value)}
                      className="block w-full pl-10 pr-8 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6] appearance-none cursor-pointer transition-all shadow-inner text-sm"
                    >
                      <option value="">Any Time</option>
                      <option value="r86400">Past 24 hours</option>
                      <option value="r604800">Past week</option>
                      <option value="r2592000">Past month</option>
                    </select>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                </div>

                {/* Job Type */}
                <div className="space-y-2">
                  <label className="block text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Job Type
                  </label>
                  <div className="relative">
                    <select
                      value={jobType}
                      onChange={(e) => setJobType(e.target.value)}
                      className="block w-full pl-10 pr-8 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6] appearance-none cursor-pointer transition-all shadow-inner text-sm"
                    >
                      <option value="">Any Type</option>
                      <option value="F">Full-time</option>
                      <option value="P">Part-time</option>
                      <option value="C">Contract</option>
                      <option value="I">Internship</option>
                    </select>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FileText className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                </div>

                {/* Remote Toggle */}
                <div className="space-y-2">
                   <label className="block text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Workplace Type
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsRemote(!isRemote)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                      isRemote 
                        ? 'bg-[#3B82F6]/10 border-[#3B82F6]/50 text-[#60A5FA]' 
                        : 'bg-slate-900/50 border-slate-600 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    <span className="flex items-center gap-2 font-bold text-sm">
                      <Laptop className="w-4 h-4" /> Remote
                    </span>
                    <div className={`w-8 h-5 rounded-full transition-colors relative shrink-0 ${isRemote ? 'bg-[#3B82F6]' : 'bg-slate-600'}`}>
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${isRemote ? 'left-3.5' : 'left-0.5'}`} />
                    </div>
                  </button>
                </div>

              </div>
            </div>

            <button
              type="submit"
              disabled={!targetRole}
              className="w-full flex items-center justify-center gap-2 md:gap-3 bg-[#0A66C2] hover:bg-[#004182] text-white font-bold text-lg md:text-xl py-4 md:py-5 px-6 md:px-8 rounded-xl md:rounded-2xl transition-all shadow-[0_0_20px_rgba(10,102,194,0.4)] hover:shadow-[0_0_35px_rgba(10,102,194,0.6)] hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:bg-[#0A66C2] mt-4 md:mt-8 border border-[#60A5FA]/30"
            >
              <Search className="w-5 h-5 md:w-6 md:h-6" />
              Launch LinkedIn Search
              <ExternalLink className="w-4 h-4 md:w-5 md:h-5 ml-1 opacity-70" />
            </button>
          </div>
        </form>
        
        <div className="mt-6 md:mt-8 text-center text-xs md:text-sm font-medium text-slate-500 flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          Directly integrates with LinkedIn's active job board
        </div>
      </div>
    </div>
  );
};

export default JobMatching;
