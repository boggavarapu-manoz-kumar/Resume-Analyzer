import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { Bot } from 'lucide-react';

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
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Try to pre-fill skills from session storage
    const stored = sessionStorage.getItem('currentAnalysis');
    if (stored) {
      const data = JSON.parse(stored);
      if (data.parsed_data?.skills) {
        setSkills(data.parsed_data.skills.slice(0, 5).join(', '));
      }
    }
  }, []);

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

    const newTranscript = [...transcript, { 
      question: questions[currentQIdx]?.question || '', 
      answer: answer 
    }];
    setTranscript(newTranscript);
    setAnswer('');

    if (currentQIdx < questions.length - 1) {
      setCurrentQIdx(currentQIdx + 1);
    } else {
      // Finished
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
      <div className="flex-col gap-lg max-w-2xl mx-auto" style={{ paddingBottom: 'var(--spacing-3xl)' }}>
        <div className="text-center animate-fade-up stagger-1" style={{ marginTop: '2rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div className="bento-icon-wrapper" style={{ margin: 0, color: 'var(--color-accent)', width: '64px', height: '64px' }}>
              <Bot size={32} />
            </div>
          </div>
          <h1 className="hero-title" style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>Practice Interview</h1>
          <p className="hero-subtitle" style={{ fontSize: '1.1rem', margin: 0 }}>Get ready for the real thing with our AI coach.</p>
        </div>

        <div className="bento-card animate-fade-up stagger-2" style={{ padding: '2.5rem' }}>
          <form onSubmit={handleStart} className="flex-col gap-lg">
            <div className="flex-col gap-sm">
              <label style={{ fontSize: '1.05rem', fontWeight: 500, color: 'var(--color-text-primary)' }}>What skills do you want to practice?</label>
              <input 
                type="text" 
                placeholder="e.g. React, Java, Teamwork"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                required
                style={{ 
                  width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border)', 
                  borderRadius: 'var(--radius-md)', padding: '1rem', color: 'var(--color-text-primary)', outline: 'none' 
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--color-accent)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
              />
            </div>
            
            <div className="flex-col gap-sm">
              <label style={{ fontSize: '1.05rem', fontWeight: 500, color: 'var(--color-text-primary)' }}>How much experience do you have?</label>
              <select 
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                style={{ 
                  width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border)', 
                  borderRadius: 'var(--radius-md)', padding: '1rem', color: 'var(--color-text-primary)', outline: 'none' 
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--color-accent)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
              >
                <option value="Beginner (0-1 years)" style={{ background: 'var(--color-bg-secondary)' }}>Beginner (0-1 years)</option>
                <option value="Junior (1-3 years)" style={{ background: 'var(--color-bg-secondary)' }}>Junior (1-3 years)</option>
                <option value="Mid-Level (3-5 years)" style={{ background: 'var(--color-bg-secondary)' }}>Mid-Level (3-5 years)</option>
                <option value="Senior (5+ years)" style={{ background: 'var(--color-bg-secondary)' }}>Senior (5+ years)</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '1rem', fontSize: '1.1rem', marginTop: '1rem' }}>
              {loading ? 'Getting questions ready...' : 'Start Interview'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (evaluating) {
    return <LoadingSpinner text="AI is evaluating your responses..." size="large" />;
  }

  if (evaluation) {
    return (
      <div className="flex-col gap-lg max-w-4xl mx-auto animate-fade-up stagger-1" style={{ paddingBottom: 'var(--spacing-3xl)', paddingTop: '2rem' }}>
        <h1 className="hero-title text-center" style={{ fontSize: '3rem' }}>How You Did</h1>
        
        <div className="bento-card text-center mb-lg" style={{ padding: '3rem' }}>
          <h2 style={{ fontSize: '4rem', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>{evaluation.score}/100</h2>
          <p style={{ fontSize: '1.2rem', color: 'var(--color-text-secondary)' }}>Your Final Score</p>
        </div>

        <div className="bento-card" style={{ padding: '2.5rem' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--color-primary)' }}>Detailed Feedback</h3>
          <div style={{ whiteSpace: 'pre-line', lineHeight: '1.8', fontSize: '1.1rem', color: 'var(--color-text-secondary)' }}>
            {evaluation.feedback}
          </div>
        </div>

        <div className="flex justify-center mt-md">
          <button className="btn btn-primary" onClick={() => { setSetupMode(true); setEvaluation(null); setTranscript([]); setCurrentQIdx(0); }} style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
            Practice Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-col gap-lg max-w-3xl mx-auto" style={{ height: 'calc(100vh - 120px)', paddingTop: '2rem' }}>
      <div className="flex justify-between items-center pb-md" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <h2 style={{ fontSize: '1.5rem' }}>Interview in Progress</h2>
        <span className="badge badge-primary">Question {currentQIdx + 1} of {questions.length}</span>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto flex-col gap-lg pr-sm pb-xl" style={{ display: 'flex', flexDirection: 'column' }}>
        {transcript.map((item, idx) => (
          <React.Fragment key={idx}>
            <div className="bento-card animate-fade-up" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', marginRight: '2rem', borderTopLeftRadius: '4px' }}>
              <strong style={{ color: 'var(--color-accent)', display: 'block', marginBottom: '0.5rem' }}>AI Coach:</strong>
              <span style={{ fontSize: '1.05rem', lineHeight: '1.6' }}>{item.question}</span>
            </div>
            <div className="bento-card animate-fade-up" style={{ padding: '1.5rem', background: 'rgba(96, 165, 250, 0.05)', marginLeft: '2rem', borderColor: 'var(--color-border)', borderTopRightRadius: '4px' }}>
              <strong style={{ color: 'var(--color-primary)', display: 'block', marginBottom: '0.5rem' }}>You:</strong>
              <span style={{ fontSize: '1.05rem', lineHeight: '1.6' }}>{item.answer}</span>
            </div>
          </React.Fragment>
        ))}

        {/* Current Question */}
        <div className="bento-card animate-fade-up" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', marginRight: '2rem', borderTopLeftRadius: '4px', borderColor: 'var(--color-accent)' }}>
          <strong style={{ color: 'var(--color-accent)', display: 'block', marginBottom: '0.5rem' }}>AI Coach:</strong>
          <span style={{ fontSize: '1.05rem', lineHeight: '1.6' }}>{questions[currentQIdx]?.question}</span>
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bento-card" style={{ padding: '1.5rem', marginTop: 'auto', marginBottom: '2rem' }}>
        <div className="flex-col gap-sm">
          <textarea 
            style={{ 
              minHeight: '120px', width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--color-border)', 
              borderRadius: 'var(--radius-md)', padding: '1rem', color: 'var(--color-text-primary)', outline: 'none',
              fontFamily: 'inherit', resize: 'vertical', fontSize: '1.05rem', lineHeight: '1.6'
            }}
            placeholder="Type your answer here..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onFocus={(e) => e.target.style.borderColor = 'var(--color-accent)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
          ></textarea>
        </div>
        <div className="flex justify-end mt-md">
          <button className="btn btn-primary" onClick={handleNextQuestion} disabled={!answer.trim()} style={{ padding: '0.8rem 2rem' }}>
            {currentQIdx === questions.length - 1 ? 'Finish Interview' : 'Submit Answer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MockInterview;
