import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { Bot, User, ArrowRight, Star, RefreshCw, Send, CheckCircle2, Mic, MicOff } from 'lucide-react';

const MockInterview = () => {
  const [setupMode, setSetupMode] = useState(true);
  const [skills, setSkills] = useState('');
  const [experience, setExperience] = useState('2 years');
  const [questions, setQuestions] = useState([]);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [transcript, setTranscript] = useState([]);
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  
  // Voice Recording States
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('currentAnalysis');
    if (stored) {
      const data = JSON.parse(stored);
      if (data.parsed_data?.skills) {
        setSkills(data.parsed_data.skills.slice(0, 5).join(', '));
      }
    }

    // Initialize Web Speech API
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setAnswer(prev => {
          // A simple heuristic to avoid duplicating text if it's continuously appending
          // In a production app, handling interim vs final results requires more robust diffing,
          // but for this MVP we append the final result chunks or overwrite if it's the same segment.
          return prev + (prev.endsWith(' ') ? '' : ' ') + currentTranscript;
        });
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      setAnswer(''); // Optional: clear answer when starting new recording, or append. Let's append actually.
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [transcript]);

  const handleStart = async (e) => {
    e.preventDefault();
    if (!skills) return;
    
    setLoading(true);
    try {
      const skillList = skills.split(',').map(s => s.trim());
      const response = await api.post('/api/interviews/generate-questions', { skills: skillList, experience });
      setQuestions(response.data.questions || []);
      setSetupMode(false);
    } catch (err) {
      console.error(err);
      alert('Failed to generate questions. Please check AI Service connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleNextQuestion = () => {
    if (!answer.trim()) return;
    
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    }

    const newTranscript = [...transcript, { 
      question: questions[currentQIdx]?.question || '', 
      answer: answer 
    }];
    setTranscript(newTranscript);
    setAnswer('');

    if (currentQIdx < questions.length - 1) {
      setCurrentQIdx(currentQIdx + 1);
    } else {
      submitForEvaluation(newTranscript);
    }
  };

  const submitForEvaluation = async (finalTranscript) => {
    setEvaluating(true);
    try {
      const response = await api.post('/api/interviews/evaluate', { transcript: finalTranscript });
      setEvaluation(response.data);
    } catch (err) {
      console.error(err);
      alert('Failed to evaluate interview.');
    } finally {
      setEvaluating(false);
    }
  };

  if (setupMode) {
    return (
      <div className="flex flex-col gap-8 max-w-2xl mx-auto pb-24 relative z-10">
        <div className="text-center animate-fade-up stagger-1 mt-12 mb-4">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.3)]">
              <Bot className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4">
            AI Mock <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-500">Interview</span>
          </h1>
          <p className="text-lg text-slate-400">
            Practice with our AI coach before the real thing. Highly realistic.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 backdrop-blur-xl animate-fade-up stagger-2 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <form onSubmit={handleStart} className="flex flex-col gap-8 relative z-10">
            <div>
              <label className="block text-sm font-bold text-white mb-3 tracking-wide">WHAT SKILLS DO YOU WANT TO PRACTICE?</label>
              <input 
                type="text" 
                placeholder="e.g. React, Java, System Design"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                required
                className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-5 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-lg font-medium"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-white mb-3 tracking-wide">HOW MUCH EXPERIENCE DO YOU HAVE?</label>
              <div className="relative">
                <select 
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-5 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-lg font-medium cursor-pointer"
                >
                  <option value="Beginner (0-1 years)" className="bg-slate-900 text-white">Beginner (0-1 years)</option>
                  <option value="Junior (1-3 years)" className="bg-slate-900 text-white">Junior (1-3 years)</option>
                  <option value="Mid-Level (3-5 years)" className="bg-slate-900 text-white">Mid-Level (3-5 years)</option>
                  <option value="Senior (5+ years)" className="bg-slate-900 text-white">Senior (5+ years)</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-5 pointer-events-none">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              className="group relative w-full flex items-center justify-center gap-2 bg-white text-black font-bold py-4 rounded-xl transition-all hover:bg-slate-200 disabled:opacity-70 disabled:cursor-not-allowed mt-4 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              disabled={loading}
            >
              {loading ? (
                <><RefreshCw className="w-5 h-5 animate-spin" /> Preparing Questions...</>
              ) : (
                <>Start Interview <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (evaluating) {
    return <LoadingSpinner text="AI is evaluating your responses..." />;
  }

  if (evaluation) {
    return (
      <div className="flex flex-col gap-8 max-w-4xl mx-auto animate-fade-up stagger-1 pt-12 pb-24 relative z-10">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white text-center mb-8">
          Interview <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Evaluation</span>
        </h1>
        
        <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center backdrop-blur-xl relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col items-center">
             <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6">
                <Star className="w-10 h-10 fill-emerald-400/20" />
             </div>
            <h2 className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 mb-2">
              {evaluation.score}
            </h2>
            <p className="text-xl font-bold text-slate-400 uppercase tracking-widest">Final Score</p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-10 backdrop-blur-xl mt-4">
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/10">
            <CheckCircle2 className="w-8 h-8 text-indigo-400" />
            <h3 className="text-2xl font-bold text-white">Detailed Feedback</h3>
          </div>
          <div className="prose prose-invert max-w-none text-slate-300 text-lg leading-relaxed whitespace-pre-line">
            {evaluation.feedback}
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <button 
            className="group flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white font-bold py-4 px-8 rounded-xl transition-all"
            onClick={() => { setSetupMode(true); setEvaluation(null); setTranscript([]); setCurrentQIdx(0); }}
          >
            <RefreshCw className="w-5 h-5 group-hover:-rotate-180 transition-transform duration-500" /> Practice Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-4xl mx-auto pt-6 relative z-10">
      
      {/* Progress Header */}
      <div className="flex justify-between items-center pb-6 border-b border-white/10 shrink-0">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div> Live Interview
        </h2>
        <div className="px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold text-sm tracking-wide">
          Question {currentQIdx + 1} of {questions.length}
        </div>
      </div>

      {/* Chat History Area */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-6 py-8 pr-2 custom-scrollbar">
        {transcript.map((item, idx) => (
          <React.Fragment key={idx}>
            {/* AI Message */}
            <div className="flex items-start gap-4 mr-12 animate-fade-up">
              <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/30">
                <Bot className="w-6 h-6" />
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm p-5 text-slate-200 text-lg leading-relaxed shadow-lg backdrop-blur-sm">
                {item.question}
              </div>
            </div>
            
            {/* User Message */}
            <div className="flex items-start gap-4 ml-12 flex-row-reverse animate-fade-up">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <User className="w-6 h-6" />
              </div>
              <div className="bg-indigo-500/20 border border-indigo-500/30 rounded-2xl rounded-tr-sm p-5 text-white text-lg leading-relaxed shadow-lg backdrop-blur-sm">
                {item.answer}
              </div>
            </div>
          </React.Fragment>
        ))}

        {/* Current Question */}
        <div className="flex items-start gap-4 mr-12 animate-fade-up mt-4">
          <div className="w-10 h-10 rounded-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] text-white flex items-center justify-center shrink-0 border border-indigo-400">
            <Bot className="w-6 h-6" />
          </div>
          <div className="bg-white/10 border border-indigo-500/40 rounded-2xl rounded-tl-sm p-5 text-white text-lg leading-relaxed shadow-lg backdrop-blur-md">
            {questions[currentQIdx]?.question}
          </div>
        </div>
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Input Area */}
      <div className="bg-black/40 border border-white/10 rounded-3xl p-6 shrink-0 mb-6 backdrop-blur-xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <textarea 
          className="w-full bg-transparent border-none text-white text-lg leading-relaxed resize-none focus:ring-0 placeholder-slate-500 outline-none"
          placeholder="Type your response or use the microphone..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          rows="3"
        ></textarea>
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/10">
          <span className="text-sm text-slate-500 font-medium px-2">Take your time and be specific.</span>
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleRecording}
              className={`flex items-center justify-center w-12 h-12 rounded-full transition-all ${
                isRecording 
                  ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30 border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse' 
                  : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10 hover:text-white'
              }`}
              title={isRecording ? "Stop Recording" : "Start Recording"}
            >
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <button 
              className="group flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-3 px-8 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(99,102,241,0.4)] hover:shadow-[0_0_25px_rgba(99,102,241,0.6)]"
              onClick={handleNextQuestion} 
              disabled={!answer.trim()}
            >
              {currentQIdx === questions.length - 1 ? 'Finish Interview' : 'Submit'} 
              <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockInterview;

