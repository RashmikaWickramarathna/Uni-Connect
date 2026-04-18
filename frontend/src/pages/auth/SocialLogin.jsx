import React, { useState } from 'react';
import { FiLock, FiUser } from 'react-icons/fi';
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
import { loginSociety } from '../../api/societyPortalApi';
import { storeSocietyUser } from '../../utils/societySession';

const featurePoints = [
  'Sign in with the official society email that was approved by the admin team',
  'Use the same password you created from the approval email link to manage events',
  'Open the same society dashboard for any approved club without needing a separate browser',
];

export default function SocialLogin() {
  const [officialEmail, setOfficialEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await loginSociety({ officialEmail, password });
      const nextUser = storeSocietyUser(response.data?.data || response.data);

      if (!nextUser) {
        throw new Error('Failed to store society session.');
      }

      navigate('/social-dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to log in to the society portal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageLayout
      brandTag="Society Workspace Access"
      showcaseTitle="Society"
      showcaseAccent="Login"
      showcaseText="Use the official approved society email and the password created from the approval link to enter the society workspace."
      featurePoints={featurePoints}
      formTag="Society Login"
      formTitle="Welcome Back"
      formSubtitle="Enter the official society email and password to continue into the event management dashboard."
      footer={
        <>
          <AuthDivider />
          <AuthLinkRow>
            <AuthUtilityLink to="/login">Back to User Login</AuthUtilityLink>
          </AuthLinkRow>
          <AuthHelperNote>
            After your society is approved, open the approval email once to create a password. From then on, use
            that official email and password here.
          </AuthHelperNote>
        </>
      }
    >
      {error && <AuthAlert $variant="error">{error}</AuthAlert>}

      <AuthForm onSubmit={handleSubmit}>
        <AuthInputBlock>
          <AuthLabel htmlFor="officialEmail">Official Email</AuthLabel>
          <AuthInputFrame>
            <AuthInputIcon>
              <FiUser />
            </AuthInputIcon>
            <AuthInput
              id="officialEmail"
              type="email"
              placeholder="Enter your official society email"
              value={officialEmail}
              onChange={(e) => setOfficialEmail(e.target.value)}
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
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </AuthInputFrame>
        </AuthInputBlock>

        <AuthPrimaryButton type="submit" fullWidth disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </AuthPrimaryButton>
      </AuthForm>
    </AuthPageLayout>
  );
}
