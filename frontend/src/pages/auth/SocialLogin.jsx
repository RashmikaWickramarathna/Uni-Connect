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

const featurePoints = [
  'Access your society workspace with a cleaner, focused sign-in experience',
  'Review event, member, and request activity from one society dashboard',
  'Move back to the main Uni-Connect login flow any time you need student access',
];

export default function SocialLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      navigate('/social-dashboard');
    }, 500);
  };

  return (
    <AuthPageLayout
      brandTag="Society Workspace Access"
      showcaseTitle="Society"
      showcaseAccent="Login"
      showcaseText="Use the same polished sign-in experience to enter the society side of Uni-Connect and continue into the social dashboard flow."
      featurePoints={featurePoints}
      formTag="Society Login"
      formTitle="Welcome Back"
      formSubtitle="Enter your society username and password to continue. This keeps the same style and flow as the main user login page."
      footer={
        <>
          <AuthDivider />
          <AuthLinkRow>
            <AuthUtilityLink to="/login">Back to User Login</AuthUtilityLink>
          </AuthLinkRow>
          <AuthHelperNote>
            This screen now uses the same updated blue auth styling as the user login page while preserving the
            existing society dashboard redirect behavior.
          </AuthHelperNote>
        </>
      }
    >
      {error && <AuthAlert $variant="error">{error}</AuthAlert>}

      <AuthForm onSubmit={handleSubmit}>
        <AuthInputBlock>
          <AuthLabel htmlFor="username">Username</AuthLabel>
          <AuthInputFrame>
            <AuthInputIcon>
              <FiUser />
            </AuthInputIcon>
            <AuthInput
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
