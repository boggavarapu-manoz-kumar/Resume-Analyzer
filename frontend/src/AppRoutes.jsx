import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ROUTES } from './utils/constants';

// Layout & Components
import Layout from './components/Layout/Layout';
import LoadingSpinner from './components/LoadingSpinner/LoadingSpinner';

// Pages
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import UploadResume from './pages/UploadResume/UploadResume';
import ResumeAnalysis from './pages/ResumeAnalysis/ResumeAnalysis';
import SkillGapAnalysis from './pages/SkillGapAnalysis/SkillGapAnalysis';
import JobMatching from './pages/JobMatching/JobMatching';
import MockInterview from './pages/MockInterview/MockInterview';
import CareerRoadmap from './pages/CareerRoadmap/CareerRoadmap';
import Pricing from './pages/Pricing/Pricing';


// Private Route Wrapper
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  
  return isAuthenticated ? children : <Navigate to={ROUTES.LOGIN} replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path={ROUTES.LOGIN} element={<Login />} />
      <Route path={ROUTES.REGISTER} element={<Register />} />
      
      {/* Protected Routes inside Layout */}
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Navigate to={ROUTES.DASHBOARD} replace />} />
        <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
        <Route path={ROUTES.UPLOAD} element={<UploadResume />} />
        <Route path={ROUTES.RESUME_ANALYSIS} element={<ResumeAnalysis />} />
        <Route path={ROUTES.SKILL_GAP} element={<SkillGapAnalysis />} />
        <Route path={ROUTES.JOB_MATCHING} element={<JobMatching />} />
        <Route path={ROUTES.MOCK_INTERVIEW} element={<MockInterview />} />
        <Route path={ROUTES.CAREER_ROADMAP} element={<CareerRoadmap />} />
        <Route path={ROUTES.PRICING} element={<Pricing />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
    </Routes>
  );
};

export default AppRoutes;
