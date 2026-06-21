import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { ROUTES } from '../../utils/constants';
import { FileUp, FileText, CheckCircle2, Loader2, FileCheck, ArrowRight, X, Sparkles, Brain, Target, Users, BarChart2, Award } from 'lucide-react';

const LOADING_STAGES = [
  { icon: Brain,     label: 'Scanning Resume Structure...',       color: 'text-indigo-400' },
  { icon: Target,    label: 'Running ATS Deep Analysis...',        color: 'text-violet-400' },
  { icon: Users,     label: 'Simulating Recruiter View...',        color: 'text-fuchsia-400' },
  { icon: BarChart2, label: 'Evaluating Project Impact...',        color: 'text-pink-400' },
  { icon: Sparkles,  label: 'Mapping Skill Knowledge Graph...',    color: 'text-amber-400' },
  { icon: Award,     label: 'Predicting Hiring Probability...',    color: 'text-emerald-400' },
  { icon: Sparkles,  label: 'Generating Career Roadmap...',        color: 'text-sky-400' },
  { icon: Target,    label: 'Predicting Career Trajectory...',     color: 'text-rose-400' },
  { icon: Award,     label: 'Scoring Personal Brand...',           color: 'text-cyan-400' },
];

const LoadingOverlay = () => {
  const [stageIndex, setStageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const stageDuration = 2200;
    const stageInterval = setInterval(() => {
      setStageIndex(prev => (prev + 1) % LOADING_STAGES.length);
    }, stageDuration);
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 0.8, 95));
    }, 120);
    return () => { clearInterval(stageInterval); clearInterval(progressInterval); };
  }, []);

  const stage = LOADING_STAGES[stageIndex];
  const Icon = stage.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl">
      <div className="relative flex flex-col items-center gap-8 max-w-sm w-full mx-4">
        {/* Pulsing Orb */}
        <div className="relative w-32 h-32 flex items-center justify-center">
          <div className={`absolute inset-0 rounded-full bg-indigo-500/20 animate-ping`} />
          <div className="absolute inset-2 rounded-full bg-indigo-500/10 animate-pulse" />
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-[0_0_40px_rgba(99,102,241,0.5)]">
            <Icon className="w-9 h-9 text-white" />
          </div>
        </div>

        {/* Stage Label */}
        <div className="text-center">
          <h2 className="text-2xl font-black text-white mb-2">AI Engine Running</h2>
          <p className={`text-base font-semibold transition-all duration-500 ${stage.color}`}>
            {stage.label}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-slate-500">Running 9 parallel AI engines...</p>
      </div>
    </div>
  );
};

const UploadResume = () => {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Fresher');
  const [targetJob, setTargetJob] = useState('');
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [previousResumes, setPreviousResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState(null);
  
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const response = await api.get('/api/resumes/my-resumes');
        setPreviousResumes(response.data || []);
      } catch (err) {
        console.error("Failed to fetch previous resumes", err);
      }
    };
    fetchResumes();
  }, []);

  const handleDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = () => setDragging(false);
  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    if (e.dataTransfer.files?.length > 0) handleFileSelect(e.dataTransfer.files[0]);
  };
  const handleFileChange = (e) => {
    if (e.target.files?.length > 0) handleFileSelect(e.target.files[0]);
  };

  const handleFileSelect = (selectedFile) => {
    setError('');
    setSelectedResumeId(null);
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
    if (!validTypes.includes(selectedFile.type)) { setError('Please upload a PDF or DOCX file.'); return; }
    if (selectedFile.size > 5 * 1024 * 1024) { setError('File size must be less than 5MB.'); return; }
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file && !selectedResumeId) { setError('Please select a file or choose a previously uploaded resume.'); return; }
    if (!targetJob.trim()) { setError('Please specify your Target Job for better analysis.'); return; }
    setUploading(true); setError('');
    try {
      let response;
      if (selectedResumeId) {
        const payload = {};
        if (jobDescription.trim()) payload.job_description = jobDescription;
        if (experienceLevel.trim()) payload.experience_level = experienceLevel;
        if (targetJob.trim()) payload.target_job = targetJob;
        response = await api.post(`/api/resumes/${selectedResumeId}/analyze`, payload);
      } else {
        const formData = new FormData();
        formData.append('file', file);
        if (jobDescription.trim()) formData.append('job_description', jobDescription);
        if (experienceLevel.trim()) formData.append('experience_level', experienceLevel);
        if (targetJob.trim()) formData.append('target_job', targetJob);
        response = await api.post('/api/resumes/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      sessionStorage.setItem('currentAnalysis', JSON.stringify(response.data));
      navigate(ROUTES.RESUME_ANALYSIS);
    } catch (err) {
      const detail = err.response?.data?.detail || '';
      let msg = 'Failed to analyze resume. Please try again.';
      if (detail.includes('RESOURCE_EXHAUSTED') || detail.includes('quota') || detail.includes('429')) {
        msg = '⏳ AI quota limit reached. The system is automatically trying backup models. Please retry in 30 seconds.';
      } else if (detail.includes('All Gemini models exhausted')) {
        msg = '⚠️ All AI models have hit their daily limit. Please wait a few minutes and try again.';
      } else if (detail) {
        msg = `Error: ${detail.substring(0, 200)}`;
      }
      setError(msg);
      setUploading(false);
    }
  };

  return (
    <>
      {uploading && <LoadingOverlay />}
      <div className="flex flex-col gap-8 max-w-4xl mx-auto pb-24 relative z-10">
        
        {/* Header */}
        <div className="text-center animate-fade-up stagger-1 mt-12 mb-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-semibold text-sm">
            <Sparkles className="w-4 h-4" /> 9 Parallel AI Engines
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4">
            Upload Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-500">Resume</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-xl mx-auto">
            Get a 15-layer analysis: ATS, Recruiter View, Hiring Simulation, Skill Gaps, and Career Roadmap.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-10 backdrop-blur-xl shadow-2xl relative overflow-hidden animate-fade-up stagger-2">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

          {error && (
            <div className="mb-8 px-5 py-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 text-red-300">
              <X className="w-5 h-5 shrink-0 mt-0.5" />
              <span className="text-sm leading-relaxed font-medium">{error}</span>
            </div>
          )}

          <div className="flex flex-col gap-8 relative z-10">
            
            {/* Dropzone */}
            <div
              className={`relative border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all duration-300 group
                ${dragging ? 'border-indigo-400 bg-indigo-500/10' :
                  file ? 'border-emerald-500/50 bg-emerald-500/5' :
                  'border-white/10 bg-black/20 hover:border-indigo-500/50 hover:bg-white/5'}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf,.doc,.docx" className="hidden" />
              <div className="flex flex-col items-center justify-center">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-all duration-300
                  ${file ? 'bg-emerald-500/20 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-white/5 text-indigo-400 group-hover:scale-110 shadow-[0_0_15px_rgba(99,102,241,0.15)]'}`}
                >
                  {file ? <FileCheck className="w-10 h-10" /> : <FileUp className="w-10 h-10" />}
                </div>
                {file ? (
                  <div className="animate-fade-up">
                    <h3 className="text-xl font-bold text-white mb-2">{file.name}</h3>
                    <p className="text-emerald-400 font-medium flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Ready for Deep Analysis ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Drag & Drop Resume</h3>
                    <p className="text-slate-400">PDF or Word Documents up to 5MB</p>
                  </div>
                )}
              </div>
            </div>

            {/* Previous Resumes */}
            {previousResumes.length > 0 && (
              <div className="flex flex-col gap-4 mt-2">
                <div className="flex items-center gap-4">
                  <div className="h-px bg-white/10 flex-1" />
                  <span className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Or Reuse Previous</span>
                  <div className="h-px bg-white/10 flex-1" />
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 pt-2 hide-scrollbar">
                  {previousResumes.map(r => (
                    <div
                      key={r.resumeId}
                      onClick={() => { setSelectedResumeId(r.resumeId); setFile(null); }}
                      className={`min-w-[240px] flex-shrink-0 p-4 rounded-2xl cursor-pointer border transition-all duration-200
                        ${selectedResumeId === r.resumeId
                          ? 'bg-indigo-500/20 border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                          : 'bg-black/40 border-white/10 hover:border-white/20 hover:bg-white/5'}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${selectedResumeId === r.resumeId ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/5 text-slate-400'}`}>
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="overflow-hidden">
                          <div className={`font-semibold text-sm truncate ${selectedResumeId === r.resumeId ? 'text-white' : 'text-slate-300'}`}>
                            {r.resumePath.split('/').pop()}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">Uploaded {new Date(r.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="h-px bg-white/10" />

            {/* Input Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-3">
                <label className="text-base font-bold text-white">Experience Level</label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                >
                  <option value="Student">Student</option>
                  <option value="Fresher">Fresher (0–1 years)</option>
                  <option value="Experienced">Experienced Professional</option>
                </select>
              </div>
              <div className="flex flex-col gap-3">
                <label className="text-base font-bold text-white flex items-center gap-2">
                  Target Job <span className="text-xs px-2 py-1 bg-red-500/20 rounded-md text-red-300 font-normal">Required</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Java Backend Developer"
                  value={targetJob}
                  onChange={(e) => setTargetJob(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-base font-bold text-white flex items-center gap-2">
                Job Description <span className="text-xs px-2 py-1 bg-white/10 rounded-md text-slate-300 font-normal">Optional — Unlocks JD Match Score</span>
              </label>
              <textarea
                placeholder="Paste the full job description to get a precise JD match score and missing keyword analysis..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full min-h-[160px] bg-black/40 border border-white/10 rounded-2xl p-5 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all resize-y"
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-2">
              {(file || selectedResumeId) ? (
                <button
                  className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-colors"
                  onClick={() => { setFile(null); setSelectedResumeId(null); }}
                >
                  Clear Selection
                </button>
              ) : <div />}

              <button
                className="w-full sm:w-auto group relative flex items-center justify-center gap-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-bold py-4 px-10 rounded-xl transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:shadow-[0_0_40px_rgba(99,102,241,0.6)] ml-auto"
                onClick={handleUpload}
                disabled={(!file && !selectedResumeId) || uploading}
              >
                {uploading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Engines Running...</>
                ) : (
                  <><Sparkles className="w-5 h-5" /> Run Full AI Analysis <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
                )}
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default UploadResume;
