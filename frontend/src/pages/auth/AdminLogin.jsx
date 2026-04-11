import React, { useState } from 'react';
import { FiLock, FiMail, FiShield } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

import {
  AuthAlert,
  AuthDivider,
  AuthForm,
  AuthHelperNote,
  AuthInput,
  AuthInputBlock,
  AuthInputFrame,
  AuthInputIcon,
  AuthLabel,
  AuthLinkRow,
  AuthPageLayout,
  AuthPrimaryButton,
  AuthUtilityLink,
} from '../../components/auth/AuthPageLayout';
import { useAuth } from '../../context/AuthContext';

const featurePoints = [
  'Access the admin dashboard from a dedicated login path',
  'Manage feedbacks and inquiries from one protected control panel',
  'Return to the normal user login flow any time from this screen',
];

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (email === 'admin@admin.com' && password === 'admin123') {
      login({
        email: 'admin@admin.com',
        userId: 'admin',
        role: 'admin',
      });
      navigate('/admin');
      setLoading(false);
      return;
    }

    setError('Invalid admin credentials. Use the configured admin login details.');
    setLoading(false);
  };

  return (
    <AuthPageLayout
      brandTag="Administrator Access"
      showcaseTitle="Admin"
      showcaseAccent="Login"
      showcaseText="Use the same updated auth design to sign into the Uni-Connect admin area and continue directly into the management dashboard."
      featurePoints={featurePoints}
      formTag="Admin Login"
      formTitle="Admin Login"
      formSubtitle="Enter the administrator credentials to continue into the protected admin dashboard."
      footer={
        <>
          <AuthDivider />
          <AuthLinkRow>
            <AuthUtilityLink to="/login">Back to User Login</AuthUtilityLink>
          </AuthLinkRow>
          <AuthHelperNote>
            This admin screen uses the same shared background and blue auth styling as the other sign-in pages.
          </AuthHelperNote>
        </>
      }
    >
      {error && <AuthAlert $variant="error">{error}</AuthAlert>}

      <AuthForm onSubmit={handleSubmit}>
        <AuthInputBlock>
          <AuthLabel htmlFor="email">Email</AuthLabel>
          <AuthInputFrame>
            <AuthInputIcon>
              <FiMail />
            </AuthInputIcon>
            <AuthInput
              id="email"
              type="email"
              placeholder="Enter admin email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </AuthInputFrame>
        </AuthInputBlock>

        <AuthInputBlock>
          <AuthLabel htmlFor="password">Password</AuthLabel>
          <AuthInputFrame>
            <AuthInputIcon>
              <FiLock />
            </AuthInputIcon>
            <AuthInput
              id="password"
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </AuthInputFrame>
        </AuthInputBlock>

        <AuthPrimaryButton type="submit" fullWidth disabled={loading}>
          <FiShield style={{ marginRight: '0.5rem' }} />
          {loading ? 'Logging in...' : 'Login as Admin'}
        </AuthPrimaryButton>
      </AuthForm>
    </AuthPageLayout>
  );
}
