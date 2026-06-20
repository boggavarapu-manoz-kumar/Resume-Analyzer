import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';
import { 
  FileText, 
  Target, 
  Map, 
  ChevronRight,
  Sparkles,
  Zap,
  ShieldCheck,
  TrendingUp,
  BrainCircuit,
  Rocket
} from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-[#030712] text-slate-50 font-sans selection:bg-indigo-500/30 overflow-hidden relative">
      {/* --- AMAZING BACKGROUND EFFECTS --- */}
      {/* Deep grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      
      {/* Glowing Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/30 blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/20 blur-[150px] pointer-events-none mix-blend-screen" />
      <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-blue-500/20 blur-[100px] pointer-events-none mix-blend-screen" />
      
      {/* --- NAVBAR --- */}
      <nav className="relative z-50 border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between max-w-7xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <BrainCircuit className="text-white w-6 h-6" />
            </div>
            <span className="font-extrabold text-2xl tracking-tighter text-white">
              Resume<span className="text-indigo-400">Flow</span>
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link 
              to={ROUTES.LOGIN} 
              className="text-sm font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link 
              to={ROUTES.REGISTER} 
              className="group relative px-6 py-2.5 rounded-full text-sm font-bold text-white bg-white/10 border border-white/20 hover:bg-white/20 transition-all overflow-hidden"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              <span className="relative flex items-center gap-2">
                Get Started <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative z-20 pt-32 pb-24 px-6">
        <div className="container mx-auto max-w-5xl text-center">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-semibold mb-8 animate-[fade-in_1s_ease-out_forwards]">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            AI-Powered Career Advancement
          </div>
          
          {/* Headline */}
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[1.05] mb-8 text-white">
            Unlock your <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-blue-400">
              true potential.
            </span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed font-light">
            Stop sending resumes into the void. Our advanced AI perfectly aligns your profile with top jobs, giving you the ultimate unfair advantage.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <Link 
              to={ROUTES.REGISTER} 
              className="relative group w-full sm:w-auto"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-violet-600 rounded-2xl blur opacity-60 group-hover:opacity-100 transition duration-500 group-hover:duration-200"></div>
              <div className="relative flex items-center justify-center gap-3 px-8 py-4 bg-black rounded-2xl leading-none text-white font-bold text-lg border border-white/10 hover:border-white/20 transition-all">
                <Rocket className="w-5 h-5 text-indigo-400" />
                Analyze My Resume
              </div>
            </Link>
            
            <Link 
              to={ROUTES.LOGIN} 
              className="w-full sm:w-auto px-8 py-4 rounded-2xl text-lg font-bold bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center backdrop-blur-md"
            >
              See Demo
            </Link>
          </div>

          {/* Social Proof / Stats */}
          <div className="mt-20 pt-10 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
             <div className="text-center">
                <div className="text-4xl font-black text-white mb-2">98<span className="text-indigo-500">%</span></div>
                <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider">ATS Success Rate</div>
             </div>
             <div className="text-center">
                <div className="text-4xl font-black text-white mb-2">3x</div>
                <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider">More Interviews</div>
             </div>
             <div className="text-center">
                <div className="text-4xl font-black text-white mb-2">50<span className="text-indigo-500">k+</span></div>
                <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Resumes Analyzed</div>
             </div>
             <div className="text-center">
                <div className="text-4xl font-black text-white mb-2">#1</div>
                <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider">AI Career Tool</div>
             </div>
          </div>
        </div>
      </section>

      {/* --- FEATURES BENTO GRID --- */}
      <section className="relative z-20 py-24 bg-black/40 border-y border-white/5 backdrop-blur-sm">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-20 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-6">Built for the modern <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Job Seeker</span></h2>
            <p className="text-xl text-slate-400 font-light">Every tool you need to land the perfect job, designed with an obsessive focus on quality and precision.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <div className="group relative bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-500 hover:-translate-y-2 overflow-hidden flex flex-col justify-between h-96">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 flex items-center justify-center mb-6 text-indigo-400">
                  <FileText className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Hyper-Accurate Analysis</h3>
                <p className="text-slate-400 leading-relaxed">Our AI dissects your resume line-by-line, providing actionable feedback on keywords, formatting, and impact. Say goodbye to the ATS black hole.</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-500 hover:-translate-y-2 overflow-hidden flex flex-col justify-between h-96">
              <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl group-hover:bg-violet-500/20 transition-all"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30 flex items-center justify-center mb-6 text-violet-400">
                  <Target className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Precision Job Matching</h3>
                <p className="text-slate-400 leading-relaxed">Upload a job description and instantly see your fit. We'll highlight exact skill gaps and tell you exactly how to tailor your resume.</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-500 hover:-translate-y-2 overflow-hidden flex flex-col justify-between h-96">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-sky-500/20 border border-blue-500/30 flex items-center justify-center mb-6 text-blue-400">
                  <Map className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Dynamic Career Roadmaps</h3>
                <p className="text-slate-400 leading-relaxed">Not qualified yet? We generate a step-by-step learning path with resources to bridge your skills gap and prepare you for the next level.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="relative z-20 border-t border-white/10 bg-[#030712] pt-16 pb-8">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
             <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <BrainCircuit className="text-white w-4 h-4" />
              </div>
              <span className="font-bold text-xl tracking-tighter text-white">
                ResumeFlow
              </span>
            </div>
            <div className="flex gap-8 text-sm font-medium text-slate-400">
               <Link to="#" className="hover:text-white transition-colors">Privacy</Link>
               <Link to="#" className="hover:text-white transition-colors">Terms</Link>
               <Link to="#" className="hover:text-white transition-colors">Contact</Link>
            </div>
          </div>
          <div className="text-center text-slate-600 text-sm border-t border-white/5 pt-8">
            &copy; {new Date().getFullYear()} ResumeFlow AI. Crafted with precision.
          </div>
        </div>
      </footer>
      
      {/* Required style for the shimmer animation used in the button */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}} />
    </div>
  );
};

export default Landing;
