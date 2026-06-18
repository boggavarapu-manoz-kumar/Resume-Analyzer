// API Base URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

export const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8000';

// Auth token key
export const TOKEN_KEY = 'authToken';
export const USER_KEY = 'authUser';

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  UPLOAD: '/upload',
  RESUME_ANALYSIS: '/resume-analysis',
  SKILL_GAP: '/skill-gap',
  JOB_MATCHING: '/jobs',
  MOCK_INTERVIEW: '/mock-interview',
  CAREER_ROADMAP: '/career-roadmap',
  PROFILE: '/profile',
};
