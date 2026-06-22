import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { 
  BarChart, Users, Target, Briefcase, Award, AlertTriangle, 
  CheckCircle, TrendingUp, TrendingDown, Eye, ArrowRight, UserCheck, Activity, LineChart, Loader2
} from 'lucide-react';
import api from '../../services/api';

const TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart },
  { id: 'hiring', label: 'Hiring Simulation', icon: Users },
  { id: 'projects', label: 'Project Impact', icon: Award },
  { id: 'market', label: 'Market & Skills', icon: Activity },
  { id: 'brand', label: 'Brand & Trajectory', icon: TrendingUp },
  { id: 'interview', label: 'Interview Prep', icon: Target }
];

const ProgressBar = ({ label, value, colorClass }) => (
  <div className="mb-4">
    <div className="flex justify-between text-sm font-bold text-slate-300 mb-1">
      <span>{label}</span>
      <span>{value}%</span>
    </div>
    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
      <div 
        className={`h-full ${colorClass} transition-all duration-1000 ease-out`}
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
);

const ResumeAnalysis = () => {
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [deepAnalysisLoading, setDeepAnalysisLoading] = useState(false);
  const navigate = useNavigate();
  const circleRef = useRef(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('currentAnalysis');
    if (stored) {
      const parsedData = JSON.parse(stored);
      setData(parsedData);
      
      // If we only have base_analysis and no deep analysis yet, fetch it
      if (parsedData.resume_id && (!parsedData.analysis || !parsedData.analysis.persona)) {
        fetchDeepAnalysis(parsedData.resume_id, parsedData.target_job);
      }
    } else {
      navigate(ROUTES.UPLOAD);
    }
  }, [navigate]);

  const fetchDeepAnalysis = async (resumeId, targetJob) => {
    setDeepAnalysisLoading(true);
    try {
      const response = await api.post(`/api/resumes/${resumeId}/analyze-deep`, {
        target_job: targetJob
      });
      
      setData(prev => {
        const newData = {
          ...prev,
          analysis: {
            ...prev.analysis,
            ...response.data.analysis
          }
        };
        sessionStorage.setItem('currentAnalysis', JSON.stringify(newData));
        return newData;
      });
    } catch (err) {
      console.error("Failed to fetch deep analysis", err);
    } finally {
      setDeepAnalysisLoading(false);
    }
  };

  useEffect(() => {
    if (data && data.analysis && circleRef.current && activeTab === 'overview') {
      const score = data.analysis.base_analysis?.resume_score || 0;
      const radius = 60;
      const circumference = 2 * Math.PI * radius;
      const offset = circumference - (score / 100) * circumference;
      
      circleRef.current.style.strokeDasharray = `${circumference} ${circumference}`;
      circleRef.current.style.strokeDashoffset = circumference;
      
      setTimeout(() => {
        circleRef.current.style.strokeDashoffset = offset;
        if (score >= 80) circleRef.current.style.stroke = '#10b981';
        else if (score >= 60) circleRef.current.style.stroke = '#f59e0b';
        else circleRef.current.style.stroke = '#ef4444';
      }, 100);
    }
  }, [data, activeTab]);

  if (!data || !data.analysis) return <LoadingSpinner text="Loading Ultimate AI Analysis..." />;

  const { analysis } = data;
  const quotaWarning = analysis._quota_warning || null;

  // Fallbacks in case engines failed
  const base = analysis.base_analysis || {};
  const persona = analysis.persona || {};
  const hiring = analysis.hiring_simulation || {};
  const projects = analysis.project_evaluation || {};
  const market = analysis.market_demand || {};
  const graph = analysis.knowledge_graph || {};
  const trajectory = analysis.career_trajectory || {};
  const brand = analysis.personal_brand || {};
  const interview = analysis.interview_prediction || {};

  const getScoreColorClass = (score) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-red-400';
  };

  const renderOverview = () => (
    <div className="space-y-8 animate-fade-up">
      {/* Score Card */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center gap-10">
        <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        {/* SVG Circular Progress */}
        <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
            <circle cx="70" cy="70" r="60" className="stroke-white/10" strokeWidth="12" fill="none" />
            <circle 
              ref={circleRef}
              cx="70" cy="70" r="60" 
              stroke="currentColor" 
              strokeWidth="12" 
              fill="none" 
              strokeLinecap="round"
              className="text-indigo-500 transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-4xl font-black ${getScoreColorClass(base.resume_score || 0)}`}>{base.resume_score || 0}</span>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">/ 100</span>
          </div>
        </div>

        <div className="flex-1 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-3">
            <UserCheck className="w-4 h-4" /> Detected Persona: {persona.persona || 'Candidate'}
          </div>
          <h2 className="text-2xl font-bold mb-3 text-white">Target: {data.target_job || persona.primary_goal || 'Software Engineer'}</h2>
          <p className="text-slate-400 leading-relaxed mb-4">
            {base.summary_feedback || 'Your profile has been fully analyzed by our engine orchestrator.'}
          </p>
          
          {/* Heatmap Mini */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <ProgressBar label="Project Strength" value={projects.overall_project_strength || 0} colorClass="bg-blue-500" />
            <ProgressBar label="Hiring Probability" value={hiring.offer_probability || 0} colorClass="bg-emerald-500" />
          </div>
        </div>
      </div>

      {/* End-to-End Deep Analysis Detailed Report */}
      {base.end_to_end_summary && (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
            <Activity className="text-violet-400" /> End-to-End Profile Analysis (A to Z Deep Dive)
          </h3>
          <p className="text-slate-300 leading-relaxed whitespace-pre-line text-justify">
            {base.end_to_end_summary}
          </p>
        </div>
      )}

      {/* Recruiter Verdict & Risk Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Rejection Risks / Why Rejected */}
        <div className="bg-red-500/5 border border-red-500/20 rounded-3xl p-8 backdrop-blur-xl">
          <h3 className="text-xl font-bold text-red-400 flex items-center gap-2 mb-4">
            <AlertTriangle className="text-red-400" /> Why This Resume Might Get Rejected
          </h3>
          <ul className="space-y-3">
            {(base.why_it_would_be_rejected || []).map((reason, i) => (
              <li key={i} className="text-red-300/90 flex items-start gap-2 text-sm leading-relaxed">
                <span className="text-red-500 mt-1 font-bold">•</span> {reason}
              </li>
            ))}
            {(!base.why_it_would_be_rejected || base.why_it_would_be_rejected.length === 0) && (
              <li className="text-slate-400 italic">No high-risk rejection points found.</li>
            )}
          </ul>
        </div>

        {/* Action Plan / How to Get More Interviews */}
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-3xl p-8 backdrop-blur-xl">
          <h3 className="text-xl font-bold text-emerald-400 flex items-center gap-2 mb-4">
            <CheckCircle className="text-emerald-400" /> Action Plan to Guarantee More Interviews
          </h3>
          <ul className="space-y-3">
            {(base.how_to_get_more_interviews || []).map((step, i) => (
              <li key={i} className="text-emerald-300/90 flex items-start gap-2 text-sm leading-relaxed">
                <span className="text-emerald-500 mt-1 font-bold">✓</span> {step}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Deep-Dive Parameter Critique Card */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-xl">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <LineChart className="text-indigo-400" /> Granular Parameter Evaluation & Critiques
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Formatting */}
          <div className="bg-black/30 border border-white/5 rounded-2xl p-6">
            <h4 className="text-md font-bold text-slate-200 mb-2 flex items-center justify-between">
              <span>ATS Formatting & Structure</span>
              <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">Verified</span>
            </h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              {base.detailed_formatting_analysis}
            </p>
          </div>

          {/* Keywords */}
          <div className="bg-black/30 border border-white/5 rounded-2xl p-6">
            <h4 className="text-md font-bold text-slate-200 mb-2 flex items-center justify-between">
              <span>Keyword & Semantic Alignment</span>
              <span className="text-xs px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 font-mono">Detailed</span>
            </h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              {base.detailed_keyword_analysis}
            </p>
          </div>

          {/* Experience */}
          <div className="bg-black/30 border border-white/5 rounded-2xl p-6">
            <h4 className="text-md font-bold text-slate-200 mb-2 flex items-center justify-between">
              <span>Experience & Metric Quantification</span>
              <span className="text-xs px-2 py-0.5 rounded bg-fuchsia-500/20 text-fuchsia-300 font-mono">Impact Check</span>
            </h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              {base.detailed_experience_analysis}
            </p>
          </div>

          {/* Skills */}
          <div className="bg-black/30 border border-white/5 rounded-2xl p-6">
            <h4 className="text-md font-bold text-slate-200 mb-2 flex items-center justify-between">
              <span>Skill Gap & Industry Benchmarking</span>
              <span className="text-xs px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 font-mono">Competency</span>
            </h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              {base.detailed_skills_analysis}
            </p>
          </div>
        </div>
      </div>

      {/* Strengths & Mistakes Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
          <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
            <CheckCircle className="text-emerald-400" /> Quick Strengths
          </h3>
          <ul className="space-y-3">
            {(base.strengths || []).map((s, i) => (
              <li key={i} className="text-slate-300 flex items-start gap-2 text-sm">
                <span className="text-emerald-500 mt-1">•</span> {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
          <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
            <AlertTriangle className="text-amber-400" /> Immediate Things to Remove
          </h3>
          <ul className="space-y-3">
            {(base.garbage_to_remove || []).map((s, i) => (
              <li key={i} className="text-slate-300 flex items-start gap-2 text-sm">
                <span className="text-amber-500 mt-1">•</span> {s}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );

  const renderHiringSimulation = () => (
    <div className="space-y-8 animate-fade-up">
      <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
          <Users className="text-indigo-400" /> Interview Success Probability
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'HR Round', val: hiring.hr_pass_probability, color: 'text-blue-400' },
            { label: 'Tech Round', val: hiring.technical_pass_probability, color: 'text-violet-400' },
            { label: 'Manager Round', val: hiring.manager_pass_probability, color: 'text-fuchsia-400' },
            { label: 'Offer Rate', val: hiring.offer_probability, color: 'text-emerald-400' }
          ].map((item, idx) => (
             <div key={idx} className="bg-black/20 rounded-2xl p-6 text-center border border-white/5">
                <div className={`text-4xl font-black ${item.color} mb-2`}>{item.val || 0}%</div>
                <div className="text-slate-400 text-sm font-bold uppercase tracking-wider">{item.label}</div>
             </div>
          ))}
        </div>

        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-red-400 flex items-center gap-2 mb-4">
            <TrendingDown /> Top Rejection Risks
          </h3>
          <ul className="space-y-3">
            {(hiring.rejection_risks || []).map((risk, idx) => (
              <li key={idx} className="text-red-300/80 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0" /> {risk}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );

  const renderProjects = () => (
    <div className="space-y-6 animate-fade-up">
      <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Award className="text-indigo-400" /> Project Evaluation Engine
          </h2>
          <div className="px-4 py-2 bg-indigo-500/20 text-indigo-300 rounded-xl font-bold">
            Overall Strength: {projects.overall_project_strength || 0}/100
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {(projects.projects || []).map((proj, idx) => (
            <div key={idx} className="bg-black/20 border border-white/5 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">{proj.project_name}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <div className="text-xs text-slate-500 uppercase font-bold">Complexity</div>
                  <div className="text-lg text-slate-300">{proj.technical_complexity_score}/10</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase font-bold">Deployment</div>
                  <div className="text-lg text-slate-300">{proj.deployment_score}/10</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase font-bold">Relevance</div>
                  <div className="text-lg text-slate-300">{proj.industry_relevance_score}/10</div>
                </div>
                <div>
                  <div className="text-xs text-emerald-500 uppercase font-bold">Impact</div>
                  <div className="text-lg text-emerald-400 font-bold">{proj.resume_impact_score}/10</div>
                </div>
              </div>
              <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl text-indigo-300 text-sm">
                <strong>AI Suggestion:</strong> {proj.improvement_suggestion}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderMarket = () => (
    <div className="space-y-8 animate-fade-up">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Market Demand */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
          <h2 className="text-xl font-bold text-white flex items-center gap-3 mb-6">
            <LineChart className="text-emerald-400" /> Market Demand
          </h2>
          <div className="flex items-center gap-4 mb-6">
            <div className="text-4xl font-black text-white">{market.overall_demand || 'N/A'}</div>
            <div className="text-sm text-slate-400 uppercase font-bold tracking-widest">Overall Demand</div>
          </div>
          <h4 className="text-sm text-slate-500 uppercase font-bold mb-3">Skill Demand Map</h4>
          <div className="flex flex-wrap gap-2 mb-6">
            {(market.skill_demand_list || []).map(({skill, demand}, idx) => (
               <span key={idx} className={`px-3 py-1 rounded-lg text-sm font-bold ${demand === 'High' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-300'}`}>
                 {skill}: {demand}
               </span>
            ))}
          </div>
          <h4 className="text-sm text-slate-500 uppercase font-bold mb-3">Target Companies</h4>
          <div className="flex flex-wrap gap-2">
            {(market.best_target_companies || []).map((comp, idx) => (
               <span key={idx} className="px-3 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 text-sm font-bold">
                 {comp}
               </span>
            ))}
          </div>
        </div>

        {/* Knowledge Graph Path */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
          <h2 className="text-xl font-bold text-white flex items-center gap-3 mb-6">
            <Target className="text-violet-400" /> Learning Path
          </h2>
          <div className="bg-black/20 border border-white/5 p-4 rounded-xl mb-6 flex flex-col gap-2">
            <div className="text-sm text-slate-400">Current: <strong className="text-white">{graph.current_position}</strong></div>
            <div className="text-sm text-emerald-400">Target: <strong>{graph.target_position}</strong></div>
          </div>
          <h4 className="text-sm text-slate-500 uppercase font-bold mb-3">Missing Nodes to Target</h4>
          <div className="space-y-3">
            {(graph.missing_skills_path || []).map((node, idx) => (
               <div key={idx} className="flex items-center gap-3 text-slate-300 text-sm">
                 <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 font-bold text-xs">{idx + 1}</div>
                 {node}
               </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );

  const renderBrandAndTrajectory = () => (
    <div className="space-y-8 animate-fade-up">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Personal Brand */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Eye className="text-cyan-400" /> Personal Brand
            </h2>
            <div className="px-4 py-2 bg-cyan-500/20 text-cyan-300 rounded-xl font-bold text-sm">
              Overall: {brand.overall_brand_score || 0}/100
            </div>
          </div>
          <div className="space-y-4 mb-6">
            <ProgressBar label="Technical Brand" value={brand.technical_brand_score || 0} colorClass="bg-cyan-500" />
            <ProgressBar label="Online Presence" value={brand.online_presence_score || 0} colorClass="bg-indigo-500" />
            <ProgressBar label="Professional Visibility" value={brand.professional_visibility_score || 0} colorClass="bg-violet-500" />
          </div>
          <div className="bg-black/20 rounded-2xl p-4 border border-white/5">
            <h4 className="text-xs text-slate-500 uppercase font-bold mb-3">AI Brand Suggestions</h4>
            <ul className="space-y-2">
              {(brand.brand_suggestions || []).map((sugg, idx) => (
                <li key={idx} className="text-slate-300 text-sm flex items-start gap-2">
                  <span className="text-cyan-400 mt-0.5">•</span> {sugg}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Career Trajectory */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-8">
            <TrendingUp className="text-rose-400" /> Career Trajectory
          </h2>
          
          <div className="relative pl-6 space-y-6 mb-8 border-l-2 border-white/10">
            <div className="relative">
              <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-slate-600 border-4 border-black"></div>
              <div className="text-xs font-bold text-slate-500 uppercase mb-1">Current Stage</div>
              <div className="text-lg text-white font-bold">{trajectory.current_stage || 'Unknown'}</div>
            </div>
            <div className="relative">
              <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-indigo-500 border-4 border-black"></div>
              <div className="text-xs font-bold text-indigo-400 uppercase mb-1">6 Months</div>
              <div className="text-lg text-white font-bold">{trajectory.six_months || 'Unknown'}</div>
            </div>
            <div className="relative">
              <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-violet-500 border-4 border-black"></div>
              <div className="text-xs font-bold text-violet-400 uppercase mb-1">1 Year</div>
              <div className="text-lg text-white font-bold">{trajectory.one_year || 'Unknown'}</div>
            </div>
            <div className="relative">
              <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-rose-500 border-4 border-black shadow-[0_0_10px_rgba(244,63,94,0.5)]"></div>
              <div className="text-xs font-bold text-rose-400 uppercase mb-1">3 Years Goal</div>
              <div className="text-xl text-white font-black">{trajectory.three_years || 'Unknown'}</div>
            </div>
          </div>

          <div className="bg-black/20 rounded-2xl p-4 border border-white/5">
            <h4 className="text-xs text-slate-500 uppercase font-bold mb-3">Milestones to 3-Year Goal</h4>
            <div className="space-y-3">
              {(trajectory.milestones || []).map((m, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="text-xs font-bold text-rose-400 shrink-0 w-20">{m.step}</div>
                  <div className="text-sm text-slate-300">{m.focus}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );

  const renderInterviewPrep = () => (
    <div className="space-y-8 animate-fade-up">
      <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
          <Target className="text-fuchsia-400" /> AI Predicted Interview Questions
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-black/20 rounded-2xl p-6 text-center border border-white/5">
            <div className="text-3xl font-black text-blue-400 mb-2">{interview.technical_readiness_score || 0}%</div>
            <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Technical Readiness</div>
          </div>
          <div className="bg-black/20 rounded-2xl p-6 text-center border border-white/5">
            <div className="text-3xl font-black text-violet-400 mb-2">{interview.communication_readiness_score || 0}%</div>
            <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Communication</div>
          </div>
          <div className="bg-black/20 rounded-2xl p-6 text-center border border-white/5">
            <div className="text-3xl font-black text-emerald-400 mb-2">{interview.project_explanation_score || 0}%</div>
            <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Project Explanation</div>
          </div>
        </div>

        <div className="space-y-4">
          {(interview.predicted_questions || []).map((q, idx) => (
            <div key={idx} className="bg-black/20 border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
              <div className={`absolute top-0 left-0 w-1 h-full ${
                q.difficulty === 'Hard' ? 'bg-red-500' : q.difficulty === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'
              }`} />
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 rounded-full bg-white/10 text-slate-300 text-xs font-bold">{q.category}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  q.difficulty === 'Hard' ? 'bg-red-500/20 text-red-400' : q.difficulty === 'Medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                }`}>{q.difficulty}</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-3 leading-relaxed">"{q.question}"</h3>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-xs text-slate-500 font-bold uppercase mb-1">What the interviewer wants to hear:</div>
                <div className="text-sm text-indigo-300 font-medium">{q.expected_answer_focus}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto pb-24 relative z-10">
      
      {/* Header */}
      <div className="text-center animate-fade-up mt-12 mb-4">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4">
          Ultimate <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-500">Operating System</span>
        </h1>
        <p className="text-lg text-slate-400 max-w-xl mx-auto">
          Your profile has been processed through 9 parallel AI engines.
        </p>
      </div>

      {quotaWarning && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl px-6 py-4 flex items-start gap-3">
          <span className="text-2xl shrink-0">⚠️</span>
          <div>
            <p className="text-amber-300 font-bold mb-1">AI Engine Fallback</p>
            <p className="text-amber-400/80 text-sm">We are using local engine fallbacks due to quota exhaustion.</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-4 animate-fade-up stagger-1">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${
                isActive 
                  ? 'bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]' 
                  : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && renderOverview()}
        {activeTab !== 'overview' && deepAnalysisLoading && (
          <div className="flex flex-col items-center justify-center h-64 space-y-4 animate-fade-up">
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
            <p className="text-slate-400 font-bold">Deep AI Engines are processing this section in the background...</p>
          </div>
        )}
        {activeTab !== 'overview' && !deepAnalysisLoading && (
          <>
            {activeTab === 'hiring' && renderHiringSimulation()}
            {activeTab === 'projects' && renderProjects()}
            {activeTab === 'market' && renderMarket()}
            {activeTab === 'brand' && renderBrandAndTrajectory()}
            {activeTab === 'interview' && renderInterviewPrep()}
          </>
        )}
      </div>

      {/* Next Steps CTA */}
      <div className="bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 rounded-3xl p-10 text-center animate-fade-up relative overflow-hidden mt-8">
        <h3 className="text-2xl font-bold text-white mb-4">Want more specific analysis?</h3>
        <div className="flex justify-center gap-4">
          <Link to={ROUTES.JOB_MATCHING} className="px-8 py-4 rounded-xl font-bold bg-white text-black hover:bg-slate-200 transition-colors">
            Match Job Description
          </Link>
          <Link to={ROUTES.CAREER_ROADMAP} className="px-8 py-4 rounded-xl font-bold bg-indigo-500 text-white hover:bg-indigo-400 transition-colors">
            Generate 90-Day Roadmap
          </Link>
        </div>
      </div>

    </div>
  );
};

export default ResumeAnalysis;
