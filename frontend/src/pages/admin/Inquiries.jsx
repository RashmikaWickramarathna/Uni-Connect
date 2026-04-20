import React, { useEffect, useState } from 'react';

import AdminLayout from '../../components/AdminLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { inquiryApi } from '../../api/inquiryApi';

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

export default function Inquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState({});
  const [activeId, setActiveId] = useState(null);
  const [error, setError] = useState('');

  const loadInquiries = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await inquiryApi.getAll();
      setInquiries(response.data.inquiries || []);
    } catch (loadError) {
      setError(loadError?.response?.data?.message || 'Failed to fetch inquiry submissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInquiries();
  }, []);

  const handleReply = async (id) => {
    if (!replyText[id]?.trim()) return;

    try {
      await inquiryApi.reply(id, replyText[id]);
      setReplyText((current) => ({ ...current, [id]: '' }));
      setActiveId(null);
      loadInquiries();
    } catch (replyError) {
      setError(replyError?.response?.data?.message || 'Failed to send the inquiry reply.');
    }
  };

  const repliedCount = inquiries.filter((inquiry) => Boolean(inquiry.adminReply)).length;
  const pendingCount = inquiries.length - repliedCount;

  return (
    <AdminLayout>
      <div className="page-header">
        <h2>Inquiry Management</h2>
        <p>Review user questions and send replies from the unified first-image admin panel layout.</p>
      </div>

      {error && (
        <div className="error-banner">
          <div className="error-text">{error}</div>
          <div className="error-actions">
            <button className="btn" type="button" onClick={() => setError('')}>
              Dismiss
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="empty-state-panel">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          <div className="small-cards-grid">
            <SmallStatCard label="Total" value={inquiries.length} color="#2563eb" icon="T" />
            <SmallStatCard label="Replied" value={repliedCount} color="#10b981" icon="R" />
            <SmallStatCard label="Pending" value={pendingCount} color="#f59e0b" icon="P" />
          </div>

          {inquiries.length === 0 ? (
            <div className="empty-state-panel">No inquiry submissions yet.</div>
          ) : (
            <div className="list-grid">
              {inquiries.map((inquiry) => (
                <div className="entry-card" key={inquiry._id}>
                  <div className="entry-header">
                    <div>
                      <h3 className="entry-name">{inquiry.name}</h3>
                      <div className="entry-email">{inquiry.email}</div>
                    </div>

                    <div className="entry-badges">
                      <span className="subject-badge">{inquiry.subject}</span>
                      <span className="date-badge">{new Date(inquiry.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <p className="entry-message">{inquiry.message}</p>

                  {inquiry.adminReply ? (
                    <div className="reply-box">
                      <p className="reply-label">Admin Reply</p>
                      <p className="entry-message">{inquiry.adminReply}</p>
                      <div className="reply-date">
                        Replied on: {inquiry.repliedAt ? new Date(inquiry.repliedAt).toLocaleDateString() : '-'}
                      </div>
                    </div>
                  ) : (
                    <div className="reply-controls">
                      {activeId === inquiry._id ? (
                        <>
                          <textarea
                            className="reply-textarea"
                            placeholder="Write your reply..."
                            value={replyText[inquiry._id] || ''}
                            onChange={(event) =>
                              setReplyText((current) => ({ ...current, [inquiry._id]: event.target.value }))
                            }
                          />
                          <div className="actions">
                            <button className="btn primary small" type="button" onClick={() => handleReply(inquiry._id)}>
                              Send Reply
                            </button>
                            <button className="btn small" type="button" onClick={() => setActiveId(null)}>
                              Cancel
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="actions">
                          <button className="btn small" type="button" onClick={() => setActiveId(inquiry._id)}>
                            Reply to Inquiry
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </AdminLayout>
  );
}
