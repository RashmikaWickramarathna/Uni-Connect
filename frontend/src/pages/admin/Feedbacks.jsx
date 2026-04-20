import React, { useEffect, useState } from 'react';

import AdminLayout from '../../components/AdminLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { feedbackApi } from '../../api/feedbackApi';

function renderStars(rating) {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating);
}

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

export default function Feedbacks() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState({});
  const [activeId, setActiveId] = useState(null);
  const [error, setError] = useState('');

  const loadFeedbacks = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await feedbackApi.getAll();
      setFeedbacks(response.data.feedbacks || []);
    } catch (loadError) {
      setError(loadError?.response?.data?.message || 'Failed to fetch feedback submissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedbacks();
  }, []);

  const handleReply = async (id) => {
    if (!replyText[id]?.trim()) return;

    try {
      await feedbackApi.reply(id, replyText[id]);
      setReplyText((current) => ({ ...current, [id]: '' }));
      setActiveId(null);
      loadFeedbacks();
    } catch (replyError) {
      setError(replyError?.response?.data?.message || 'Failed to send the feedback reply.');
    }
  };

  const repliedCount = feedbacks.filter((feedback) => Boolean(feedback.adminReply)).length;
  const pendingCount = feedbacks.length - repliedCount;

  return (
    <AdminLayout>
      <div className="page-header">
        <h2>Feedback Management</h2>
        <p>Review submitted feedback and send admin replies from the shared admin sidebar workspace.</p>
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
            <SmallStatCard label="Total" value={feedbacks.length} color="#2563eb" icon="T" />
            <SmallStatCard label="Replied" value={repliedCount} color="#10b981" icon="R" />
            <SmallStatCard label="Pending" value={pendingCount} color="#f59e0b" icon="P" />
          </div>

          {feedbacks.length === 0 ? (
            <div className="empty-state-panel">No feedback submissions yet.</div>
          ) : (
            <div className="list-grid">
              {feedbacks.map((feedback) => (
                <div className="entry-card" key={feedback._id}>
                  <div className="entry-header">
                    <div>
                      <h3 className="entry-name">{feedback.name}</h3>
                      <div className="entry-email">{feedback.email}</div>
                    </div>

                    <div className="entry-badges">
                      <span className="rating-stars">{renderStars(feedback.rating)}</span>
                      <span className="date-badge">{new Date(feedback.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <p className="entry-message">{feedback.comments}</p>

                  {feedback.adminReply ? (
                    <div className="reply-box">
                      <p className="reply-label">Admin Reply</p>
                      <p className="entry-message">{feedback.adminReply}</p>
                      <div className="reply-date">
                        Replied on: {feedback.repliedAt ? new Date(feedback.repliedAt).toLocaleDateString() : '-'}
                      </div>
                    </div>
                  ) : (
                    <div className="reply-controls">
                      {activeId === feedback._id ? (
                        <>
                          <textarea
                            className="reply-textarea"
                            placeholder="Write your reply..."
                            value={replyText[feedback._id] || ''}
                            onChange={(event) =>
                              setReplyText((current) => ({ ...current, [feedback._id]: event.target.value }))
                            }
                          />
                          <div className="actions">
                            <button className="btn feedback-primary small" type="button" onClick={() => handleReply(feedback._id)}>
                              Send Reply
                            </button>
                            <button className="btn feedback-secondary small" type="button" onClick={() => setActiveId(null)}>
                              Cancel
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="actions">
                          <button className="btn feedback small" type="button" onClick={() => setActiveId(feedback._id)}>
                            Reply to Feedback
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
