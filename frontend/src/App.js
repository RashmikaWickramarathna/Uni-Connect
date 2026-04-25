import React, { Suspense, lazy } from 'react';
import styled from 'styled-components';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

const Login = lazy(() => import('./pages/auth/Login'));
const Signup = lazy(() => import('./pages/auth/Signup'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const SocialLogin = lazy(() => import('./pages/auth/SocialLogin'));
const SocialDashboard = lazy(() => import('./pages/student/SocialDashboard'));
const Home = lazy(() => import('./pages/student/Home'));
const Profile = lazy(() => import('./pages/student/Profile'));
const MyFeedbacks = lazy(() => import('./pages/student/MyFeedbacks'));
const MyInquiries = lazy(() => import('./pages/student/MyInquiries'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminFeedbacks = lazy(() => import('./pages/admin/Feedbacks'));
const AdminInquiries = lazy(() => import('./pages/admin/Inquiries'));

const LoadingWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Spinner = styled.div`
  width: 2.5rem;
  height: 2.5rem;
  border: 4px solid #e2e8f0;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

function Loading() {
  return (
    <LoadingWrapper>
      <Spinner />
    </LoadingWrapper>
  );
}

function ProtectedRoute({ children, allowedRole }) {
  const { user, loading } = useAuth();

  if (loading) return <Loading />;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return user.role === 'admin' ? <Navigate to="/admin" replace /> : <Navigate to="/home" replace />;
  }

  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <Loading />;

  if (user) {
    return user.role === 'admin' ? <Navigate to="/admin" replace /> : <Navigate to="/home" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/social-login" element={<PublicRoute><SocialLogin /></PublicRoute>} />
        <Route path="/social-dashboard" element={<SocialDashboard />} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
        
        <Route path="/home" element={<ProtectedRoute allowedRole="student"><Home /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute allowedRole="student"><Profile /></ProtectedRoute>} />
        <Route path="/my-feedbacks" element={<ProtectedRoute allowedRole="student"><MyFeedbacks /></ProtectedRoute>} />
        <Route path="/my-inquiries" element={<ProtectedRoute allowedRole="student"><MyInquiries /></ProtectedRoute>} />
        
        <Route path="/admin" element={<ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/feedbacks" element={<ProtectedRoute allowedRole="admin"><AdminFeedbacks /></ProtectedRoute>} />
        <Route path="/admin/inquiries" element={<ProtectedRoute allowedRole="admin"><AdminInquiries /></ProtectedRoute>} />
        
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}