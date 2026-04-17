import React, { useEffect, useState } from 'react';
import { FiCalendar, FiClipboard, FiHelpCircle, FiInfo, FiMessageSquare } from 'react-icons/fi';
import { Link } from 'react-router-dom';

import AdminLayout from '../../components/AdminLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { feedbackApi } from '../../api/feedbackApi';
import { inquiryApi } from '../../api/inquiryApi';
import { getAllSocietyRequests } from '../../api/societyApi';

function SmallStatCard({ label, value, color, icon }) {
  return (
    <div className="small-stat-card">
      <div className="small-accent" style={{ background: color }} />
      <div className="small-body">
        <div className="small-icon" style={{ background: color }}>
          {icon}
        </div>
        <div className="small-text">
          <div className="small-value">{value}</div>
          <div className="small-label">{label}</div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState({
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    feedbackCount: 0,
    inquiryCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError('');

        const [requests, feedbackResponse, inquiryResponse] = await Promise.all([
          getAllSocietyRequests(),
          feedbackApi.getAll(),
          inquiryApi.getAll(),
        ]);

        setMetrics({
          pendingRequests: requests.filter((request) => (request.status || '').toLowerCase() === 'pending').length,
          approvedRequests: requests.filter((request) => (request.status || '').toLowerCase() === 'approved').length,
          rejectedRequests: requests.filter((request) => (request.status || '').toLowerCase() === 'rejected').length,
          feedbackCount: feedbackResponse.data.feedbacks?.length || 0,
          inquiryCount: inquiryResponse.data.inquiries?.length || 0,
        });
      } catch (loadError) {
        setError(loadError?.response?.data?.message || 'Failed to load the admin dashboard overview.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  return (
    <AdminLayout>
      <div className="page-header">
        <h2>Admin Dashboard</h2>
        <p>Manage every core admin workflow from the Uni-Connect control panel.</p>
      </div>

      {error && (
        <div className="error-banner">
          <div className="error-text">{error}</div>
        </div>
      )}

      {loading ? (
        <div className="empty-state-panel">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          

          <div className="small-cards-grid">
            <SmallStatCard label="Pending" value={metrics.pendingRequests} color="#f59e0b" icon="P" />
            <SmallStatCard label="Approved Socities" value={metrics.approvedRequests} color="#10b981" icon="A" />
            <SmallStatCard label="Feedbacks" value={metrics.feedbackCount} color="#2563eb" icon="F" />
            <SmallStatCard label="Inquiries" value={metrics.inquiryCount} color="#8b5cf6" icon="I" />
          </div>

          

          <div className="module-grid">
            <Link className="module-card module-card-link" to="/society-admin/requests">
              <div className="module-card-head">
                <div className="module-icon society">
                  <FiClipboard />
                </div>
              </div>
              <h4 className="module-title">Society Approvals</h4>
              <p className="module-description">Review registration submissions, approve societies, and open the full request list.</p>
              <div className="module-meta">
                <span className="pill-dot" />
                Manage approvals
              </div>
            </Link>

            <Link className="module-card module-card-link" to="/admin/events">
              <div className="module-card-head">
                <div className="module-icon feedback">
                  <FiCalendar />
                </div>
              </div>
              <h4 className="module-title">Event Management</h4>
              <p className="module-description">Open the event moderation panel directly inside the main Uni-Connect admin workspace.</p>
              <div className="module-meta">
                <span className="pill-dot" />
                Manage events
              </div>
            </Link>

            <Link className="module-card module-card-link" to="/admin/feedbacks">
              <div className="module-card-head">
                <div className="module-icon feedback">
                  <FiMessageSquare />
                </div>
              </div>
              <h4 className="module-title">Feedback Management</h4>
              <p className="module-description">View and reply to user feedback submissions from the shared admin workspace.</p>
              <div className="module-meta">
                <span className="pill-dot" />
                Manage feedbacks
              </div>
            </Link>

            <Link className="module-card module-card-link" to="/admin/inquiries">
              <div className="module-card-head">
                <div className="module-icon inquiries">
                  <FiHelpCircle />
                </div>
              </div>
              <h4 className="module-title">Inquiry Management</h4>
              <p className="module-description">Open and answer user inquiries without leaving the first-image admin panel layout.</p>
              <div className="module-meta">
                <span className="pill-dot" />
                Manage inquiries
              </div>
            </Link>

            <div className="module-card">
              <div className="module-card-head">
                <div className="module-icon system">
                  <FiInfo />
                </div>
              </div>
              <h4 className="module-title">System Info</h4>
              <p className="module-description">Uni-Connect admin panel running with the sidebar-based interface and unified module access.</p>
              <div className="module-meta">
                <span className="pill-dot" />
                System v1.0
              </div>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
