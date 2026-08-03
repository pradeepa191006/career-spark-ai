import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { ErrorBoundary } from './components/common/ErrorBoundary';

// Pages
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { Dashboard } from './pages/Dashboard';
import { Profile } from './pages/Profile';
import { ResumeBuilder } from './pages/ResumeBuilder';
import { AtsAnalyzer } from './pages/AtsAnalyzer';
import { ResumeRewriter } from './pages/ResumeRewriter';
import { ResumeOptimizer } from './pages/ResumeOptimizer';
import { CoverLetter } from './pages/CoverLetter';
import { SkillGap } from './pages/SkillGap';
import { InterviewPrep } from './pages/InterviewPrep';
import { VoiceInterview } from './pages/VoiceInterview';
import { VideoInterview } from './pages/VideoInterview';
import { Portfolio } from './pages/Portfolio';
import { HelpCenter } from './pages/HelpCenter';
import { Settings } from './pages/Settings';
import { CareerMentor } from './pages/CareerMentor';
import { FileManager } from './pages/FileManager';
import { ToastProvider } from './components/common/Toast';

// Layout wrapper for auth
import { AuthLayout } from './components/layout/AuthLayout';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <BrowserRouter>
              <Routes>
              {/* Public Routes with AuthLayout */}
              <Route 
                path="/login" 
                element={
                  <AuthLayout>
                    <Login />
                  </AuthLayout>
                } 
              />
              <Route 
                path="/signup" 
                element={
                  <AuthLayout>
                    <Signup />
                  </AuthLayout>
                } 
              />
              <Route 
                path="/forgot-password" 
                element={
                  <AuthLayout>
                    <ForgotPassword />
                  </AuthLayout>
                } 
              />
              <Route 
                path="/reset-password" 
                element={
                  <AuthLayout>
                    <ResetPassword />
                  </AuthLayout>
                } 
              />

              {/* Protected Routes wrapped in ProtectedRoute & DashboardLayout */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/resume" element={<ResumeBuilder />} />
                <Route path="/ats-analyzer" element={<AtsAnalyzer />} />
                <Route path="/resume-rewriter" element={<ResumeRewriter />} />
                <Route path="/resume-optimizer" element={<ResumeOptimizer />} />
                <Route path="/cover-letter" element={<CoverLetter />} />
                <Route path="/skill-gap" element={<SkillGap />} />
                <Route path="/interview" element={<InterviewPrep />} />
                <Route path="/interview/voice" element={<VoiceInterview />} />
                <Route path="/interview/video" element={<VideoInterview />} />
                <Route path="/portfolio-setup" element={<Portfolio />} />
                <Route path="/career-mentor" element={<CareerMentor />} />
                <Route path="/help-center" element={<HelpCenter />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/files" element={<FileManager />} />
              </Route>

              {/* Fallbacks */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;

