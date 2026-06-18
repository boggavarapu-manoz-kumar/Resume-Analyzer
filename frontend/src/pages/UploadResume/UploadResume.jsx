import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { ROUTES } from '../../utils/constants';

const UploadResume = () => {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [previousResumes, setPreviousResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState(null);
  
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch previous resumes
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

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleFileSelect = (selectedFile) => {
    setError('');
    setSelectedResumeId(null); // Clear selected if user uploads new
    
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
    
    if (!validTypes.includes(selectedFile.type)) {
      setError('Please upload a PDF or DOCX file.');
      return;
    }
    
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB.');
      return;
    }
    
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file && !selectedResumeId) {
      setError('Please select a file or choose a previously uploaded resume.');
      return;
    }

    setUploading(true);
    setError('');

    try {
      let response;
      if (selectedResumeId) {
        // Analyze existing
        const payload = jobDescription.trim() ? { job_description: jobDescription } : {};
        response = await api.post(`/api/resumes/${selectedResumeId}/analyze`, payload);
      } else {
        // Upload new
        const formData = new FormData();
        formData.append('file', file);
        if (jobDescription.trim()) {
          formData.append('job_description', jobDescription);
        }
        response = await api.post('/api/resumes/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }
      
      // Store result in sessionStorage to pass to Resume Analysis page
      sessionStorage.setItem('currentAnalysis', JSON.stringify(response.data));
      navigate(ROUTES.RESUME_ANALYSIS);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to analyze resume.');
      setUploading(false);
    }
  };

  return (
    <div className="flex-col gap-lg max-w-3xl mx-auto">
      <div>
        <h1 className="section-title">Upload & Analyze Resume</h1>
        <p className="section-subtitle">Get instant AI-driven structural feedback and actionable suggestions.</p>
      </div>

      <div className="card">
        {error && (
          <div className="badge badge-danger mb-md w-full" style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', display: 'block' }}>
            {error}
          </div>
        )}

        <div className="flex-col gap-lg mb-lg">
          {/* New Upload Area */}
          <div 
            className={`dropzone ${dragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{ padding: '4rem 2rem', borderColor: file ? 'var(--color-accent)' : '' }}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept=".pdf,.doc,.docx"
              style={{ display: 'none' }} 
            />
            
            <div className="flex-col items-center justify-center gap-sm">
              <div style={{ color: file ? 'var(--color-accent)' : 'var(--color-text-muted)', marginBottom: '1rem' }}>
                {file ? (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                ) : (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                )}
              </div>
              
              {file ? (
                <div className="text-center">
                  <h3 style={{ color: 'var(--color-text-primary)', fontSize: '1.1rem' }}>{file.name}</h3>
                  <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 500 }}>Upload a new resume</h3>
                  <p className="text-muted" style={{ fontSize: '0.9rem' }}>Drag & drop a PDF or DOCX file</p>
                </div>
              )}
            </div>
          </div>

          {/* Previous Resumes Selection */}
          {previousResumes.length > 0 && (
            <div className="flex-col gap-sm mt-md">
              <h3 style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Or analyze a previously uploaded resume</h3>
              <div className="flex gap-sm overflow-x-auto" style={{ paddingBottom: '0.5rem' }}>
                {previousResumes.map(r => (
                  <div 
                    key={r.resumeId} 
                    onClick={() => { setSelectedResumeId(r.resumeId); setFile(null); }}
                    style={{ 
                      padding: '0.75rem 1rem', 
                      borderRadius: 'var(--radius-md)', 
                      cursor: 'pointer',
                      background: selectedResumeId === r.resumeId ? 'var(--color-bg-tertiary)' : 'var(--color-bg-primary)',
                      border: selectedResumeId === r.resumeId ? '1px solid var(--color-accent)' : '1px solid var(--color-border)',
                      minWidth: '200px',
                      flexShrink: 0
                    }}
                  >
                    <div style={{ fontWeight: 500, fontSize: '0.9rem', color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {r.resumePath.split('/').pop()}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                      {new Date(r.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="divider"></div>

        <div className="form-group mb-lg">
          <label className="form-label">Target Job Description (Optional but Recommended)</label>
          <textarea 
            className="form-input" 
            placeholder="Paste the job description here to get a tailored analysis..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            style={{ minHeight: '100px' }}
          ></textarea>
        </div>

        <div className="flex justify-between items-center">
          {(file || selectedResumeId) && (
            <button className="btn btn-ghost" onClick={() => { setFile(null); setSelectedResumeId(null); }}>
              Clear
            </button>
          )}
          
          <button 
            className="btn btn-primary" 
            onClick={handleUpload}
            disabled={(!file && !selectedResumeId) || uploading}
            style={{ marginLeft: 'auto' }}
          >
            {uploading ? (
              <>
                <span className="spinner spinner-sm" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></span>
                Analyzing with AI...
              </>
            ) : (
              <>
                Analyze Resume
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadResume;
