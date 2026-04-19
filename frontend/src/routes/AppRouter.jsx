import React, { Suspense, lazy } from "react";
import styled from "styled-components";
import { Navigate, Route, Routes } from "react-router-dom";

import { normalizeAuthRole, useAuth } from "../context/AuthContext";
import AdminBookingsPage from "../pages/Admin/AdminBookingsPage";
import AdminPaymentsPage from "../pages/Admin/AdminPaymentsPage";
import EventsListPage from "../pages/Events/EventsListPage";
import MyTicketsPage from "../pages/MyTickets/MyTicketPage";
import PaymentHistoryPage from "../pages/PaymentHistory/PaymentHistoryPage";
import TicketBookingPage from "../pages/TicketBooking/TicketBookingPage";

const LandingHome = lazy(() => import("../pages/Home"));
const TicketingHome = lazy(() => import("../pages/Home/HomePage"));
const SocietyRequestSubmit = lazy(() => import("../pages/SocietyRequestSubmit"));
const SocietyRequestsAdmin = lazy(() => import("../pages/SocietyRequestsAdmin"));
const SocietyRequestDetail = lazy(() => import("../pages/SocietyRequestDetail"));
const SocietyRegisterByToken = lazy(() => import("../pages/SocietyRegisterByToken"));
const CreateEvent = lazy(() => import("../pages/CreateEvent"));

const Login = lazy(() => import("../pages/auth/Login"));
const AdminLogin = lazy(() => import("../pages/auth/AdminLogin"));
const Signup = lazy(() => import("../pages/auth/Signup"));
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword"));
const SocialLogin = lazy(() => import("../pages/auth/SocialLogin"));
const SocialDashboard = lazy(() => import("../pages/student/SocialDashboard"));
const MyFeedbacks = lazy(() => import("../pages/student/MyFeedbacks"));
const MyInquiries = lazy(() => import("../pages/student/MyInquiries"));
const Profile = lazy(() => import("../pages/student/Profile"));
const AdminDashboard = lazy(() => import("../pages/Admin/Dashboard"));
const AdminEvents = lazy(() => import("../pages/Admin/Events"));
const AdminFeedbacks = lazy(() => import("../pages/Admin/Feedbacks"));
const AdminInquiries = lazy(() => import("../pages/Admin/Inquiries"));
const CommonSettings = lazy(() => import("../pages/Admin/CommonSettings"));

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
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
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
  const userRole = normalizeAuthRole(user?.role);
  const requiredRole = normalizeAuthRole(allowedRole);

  if (loading) return <Loading />;
  if (!user) {
    return <Navigate to={requiredRole === "admin" ? "/admin-login" : "/login"} replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    return userRole === "admin" ? <Navigate to="/admin" replace /> : <Navigate to="/" replace />;
  }

  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  const userRole = normalizeAuthRole(user?.role);

  if (loading) return <Loading />;
  if (user) {
    return userRole === "admin" ? <Navigate to="/admin" replace /> : <Navigate to="/" replace />;
  }

  return children;
}

export default function AppRouter() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<LandingHome />} />
        <Route path="/ticketing" element={<TicketingHome />} />
        <Route path="/events" element={<EventsListPage />} />
        <Route path="/events/:eventId/book" element={<TicketBookingPage />} />
        <Route path="/my-tickets" element={<MyTicketsPage />} />
        <Route path="/payment-history" element={<PaymentHistoryPage />} />

        <Route path="/submit" element={<SocietyRequestSubmit />} />
        <Route path="/society-admin" element={<Navigate to="/society-admin/requests" replace />} />
        <Route
          path="/society-admin/requests"
          element={
            <ProtectedRoute allowedRole="admin">
              <SocietyRequestsAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/society-admin/requests/:id"
          element={
            <ProtectedRoute allowedRole="admin">
              <SocietyRequestDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/requests"
          element={<Navigate to="/society-admin/requests" replace />}
        />
        <Route
          path="/admin/requests/:id"
          element={<Navigate to="/society-admin/requests" replace />}
        />
        <Route path="/society-register/:token" element={<SocietyRegisterByToken />} />
        <Route path="/create-event/:token" element={<CreateEvent />} />

        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/admin-login"
          element={
            <PublicRoute>
              <AdminLogin />
            </PublicRoute>
          }
        />
        <Route path="/social-login" element={<SocialLogin />} />
        <Route path="/social-dashboard" element={<SocialDashboard />} />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />

        <Route
          path="/home"
          element={
            <ProtectedRoute allowedRole="student">
              <Navigate to="/" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRole="student">
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-feedbacks"
          element={
            <ProtectedRoute allowedRole="student">
              <MyFeedbacks />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-inquiries"
          element={
            <ProtectedRoute allowedRole="student">
              <MyInquiries />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/events"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminEvents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/feedbacks"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminFeedbacks />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/inquiries"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminInquiries />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/bookings"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminBookingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/payments"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminPaymentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute allowedRole="admin">
              <CommonSettings />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
