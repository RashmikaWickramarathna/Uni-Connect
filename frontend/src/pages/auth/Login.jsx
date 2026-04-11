import React, { useState } from 'react';
import { FiLock, FiMail } from 'react-icons/fi';
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
import { authApi } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';

const featurePoints = [
  'Manage student feedback and inquiries from one secure account',
  'Move between dashboard tools without repeated login prompts',
  'Stay connected with Uni-Connect events, societies, and profile updates',
];

export default function Login() {
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

    try {
      const res = await authApi.login({ email, password });
      if (res.data.user) {
        const studentUser = {
          ...res.data.user,
          email: res.data.user?.email || email,
          userId: res.data.user?.id || res.data.user?._id || res.data.user?.userId,
          role: res.data.user?.role || 'student',
        };

        if (!studentUser.userId) {
          setError('Login succeeded, but the user record returned by the server is missing an id.');
          setLoading(false);
          return;
        }

        login(studentUser);
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    }

    setLoading(false);
  };

  return (
    <AuthPageLayout
      brandTag="Secure University Access"
      showcaseTitle="Connect with"
      showcaseAccent="UniConnect"
      showcaseText="Sign in once and move straight into your student dashboard, feedback tools, inquiry history, and profile management without repeated login interruptions."
      featurePoints={featurePoints}
      formTag="Student Login"
      formTitle="Welcome Back"
      formSubtitle="Enter your student account details to continue into Uni-Connect."
      footer={
        <>
          <AuthDivider />
          <AuthLinkRow>
            <AuthUtilityLink to="/admin-login">Admin Login</AuthUtilityLink>
            <AuthUtilityLink to="/social-login">Society Login</AuthUtilityLink>
            <AuthUtilityLink to="/forgot-password">Forgot password?</AuthUtilityLink>
          </AuthLinkRow>
          <AuthHelperNote>
            Use your registered student email and password here. Once signed in, the protected pages will open
            directly without asking you to log in again.
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
              placeholder="Enter your email"
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
