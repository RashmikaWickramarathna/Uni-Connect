import React, { useEffect, useState } from 'react';
import { registerApprovedSociety, verifyApprovalToken } from '../../api/societyPortalApi';

export default function ApprovalRegistration({ token, onRegistered, onDismiss }) {
  const [loading, setLoading] = useState(true);
  const [requestData, setRequestData] = useState(null);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    const loadRequest = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await verifyApprovalToken(token);

        if (!active) return;

        setRequestData(response.data?.societyRequest || null);
      } catch (err) {
        if (!active) return;

        setRequestData(null);
        setError(err.response?.data?.message || 'This approval link is invalid or expired.');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadRequest();

    return () => {
      active = false;
    };
  }, [token]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const response = await registerApprovedSociety({ token, password });
      const payload = response.data || {};

      onRegistered?.({
        message: payload.message || 'Society account created successfully.',
        societyName: requestData?.societyName,
        officialEmail: requestData?.officialEmail,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={pageShell}>
      <div style={card}>
        <div style={{ marginBottom: '20px' }}>
          <div style={eyebrow}>UNI-CONNECT</div>
          <h1 style={title}>Register Society Account</h1>
          <p style={subtitle}>
            Complete the final step from your approval email to activate your society portal.
          </p>
        </div>

        {loading ? (
          <p style={infoText}>Checking your approval link...</p>
        ) : requestData ? (
          <>
            <div style={detailsCard}>
              <p style={detailRow}>
                <strong>Society:</strong> {requestData.societyName}
              </p>
              <p style={detailRow}>
                <strong>Email:</strong> {requestData.officialEmail}
              </p>
              <p style={detailRow}>
                <strong>Category:</strong> {requestData.category}
              </p>
              <p style={detailRow}>
                <strong>Faculty:</strong> {requestData.faculty}
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <label style={label} htmlFor="password">
                Create password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                style={input}
                placeholder="Enter your password"
                required
              />

              <label style={label} htmlFor="confirmPassword">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                style={input}
                placeholder="Confirm your password"
                required
              />

              {error ? <p style={errorText}>{error}</p> : null}

              <div style={actions}>
                <button type="submit" style={primaryButton} disabled={submitting}>
                  {submitting ? 'Registering...' : 'Register Society Account'}
                </button>
                <button type="button" style={secondaryButton} onClick={onDismiss}>
                  Back to Portal
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <p style={errorText}>{error || 'This approval link is not available anymore.'}</p>
            <button type="button" style={secondaryButton} onClick={onDismiss}>
              Continue to Portal
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const pageShell = {
  minHeight: '100vh',
  display: 'grid',
  placeItems: 'center',
  padding: '24px',
  background:
    'linear-gradient(135deg, rgba(37,99,235,0.12), rgba(15,23,42,0.06)), #f8fafc',
};

const card = {
  width: '100%',
  maxWidth: '560px',
  background: '#ffffff',
  border: '1px solid #dbeafe',
  borderRadius: '18px',
  boxShadow: '0 20px 45px rgba(15, 23, 42, 0.12)',
  padding: '32px',
};

const eyebrow = {
  fontSize: '12px',
  fontWeight: 700,
  letterSpacing: '0.08em',
  color: '#2563eb',
  marginBottom: '12px',
};

const title = {
  margin: 0,
  fontSize: '30px',
  lineHeight: 1.15,
  color: '#0f172a',
};

const subtitle = {
  margin: '10px 0 0',
  fontSize: '15px',
  color: '#64748b',
  lineHeight: 1.6,
};

const detailsCard = {
  background: '#eff6ff',
  border: '1px solid #bfdbfe',
  borderRadius: '14px',
  padding: '18px 20px',
  marginBottom: '22px',
};

const detailRow = {
  margin: '0 0 8px',
  color: '#1e3a8a',
};

const label = {
  display: 'block',
  marginBottom: '8px',
  marginTop: '14px',
  color: '#334155',
  fontSize: '14px',
  fontWeight: 600,
};

const input = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: '10px',
  border: '1px solid #cbd5e1',
  fontSize: '14px',
  boxSizing: 'border-box',
};

const actions = {
  display: 'flex',
  gap: '12px',
  flexWrap: 'wrap',
  marginTop: '20px',
};

const primaryButton = {
  padding: '12px 22px',
  border: 'none',
  borderRadius: '10px',
  background: '#2563eb',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 700,
  cursor: 'pointer',
};

const secondaryButton = {
  padding: '12px 22px',
  border: '1px solid #cbd5e1',
  borderRadius: '10px',
  background: '#ffffff',
  color: '#334155',
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
};

const errorText = {
  marginTop: '14px',
  color: '#b91c1c',
  fontSize: '14px',
  lineHeight: 1.6,
};

const infoText = {
  margin: 0,
  color: '#475569',
  fontSize: '15px',
};
