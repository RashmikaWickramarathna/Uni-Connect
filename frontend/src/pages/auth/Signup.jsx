import React, { useState } from 'react';
import { FiLock, FiMail, FiPhone } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

import {
  AuthAlert,
  AuthDivider,
  AuthForm,
  AuthHelperNote,
  AuthInput,
  AuthInputBlock,
  AuthInputFrame,
  AuthInputGrid,
  AuthInputIcon,
  AuthLabel,
  AuthLinkRow,
  AuthPageLayout,
  AuthPrimaryButton,
  AuthUtilityLink,
} from '../../components/auth/AuthPageLayout';
import { authApi } from '../../api/authApi';

const featurePoints = [
  'Create your Uni-Connect student account using the same updated auth experience',
  'Register with your university email, mobile number, and password in one place',
  'Move directly into the existing login flow once registration is complete',
];

export default function Signup() {
  const [formData, setFormData] = useState({
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.mobile.length !== 10) {
      setError('Mobile number must be 10 digits.');
      return;
    }

    setLoading(true);

    try {
      const res = await authApi.signup({
        email: formData.email,
        mobile: formData.mobile,
        password: formData.password,
      });

      if (res.data.message) {
        setSuccess('Registration successful. Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    }

    setLoading(false);
  };

  return (
    <AuthPageLayout
      brandTag="Student Registration"
      showcaseTitle="Create your"
      showcaseAccent="UniConnect account"
      showcaseText="Join Uni-Connect with the same refreshed blue auth look, then continue through the regular login flow into your student tools."
      featurePoints={featurePoints}
      formTag="Student Signup"
      formTitle="Create Account"
      formSubtitle="Enter your details below to create a student account without changing the rest of the landing-page experience."
      footer={
        <>
          <AuthDivider />
          <AuthLinkRow>
            <AuthUtilityLink to="/login">Already have an account? Login</AuthUtilityLink>
          </AuthLinkRow>
          <AuthHelperNote>
            Use your real student contact details here. After registration succeeds, the page will send you back to
            the standard login screen.
          </AuthHelperNote>
        </>
      }
    >
      {error && <AuthAlert $variant="error">{error}</AuthAlert>}
      {success && <AuthAlert $variant="success">{success}</AuthAlert>}

      <AuthForm onSubmit={handleSubmit}>
        <AuthInputBlock>
          <AuthLabel htmlFor="email">Email</AuthLabel>
          <AuthInputFrame>
            <AuthInputIcon>
              <FiMail />
            </AuthInputIcon>
            <AuthInput
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </AuthInputFrame>
        </AuthInputBlock>

        <AuthInputGrid>
          <AuthInputBlock>
            <AuthLabel htmlFor="mobile">Mobile</AuthLabel>
            <AuthInputFrame>
              <AuthInputIcon>
                <FiPhone />
              </AuthInputIcon>
              <AuthInput
                id="mobile"
                name="mobile"
                type="tel"
                placeholder="10-digit mobile"
                value={formData.mobile}
                onChange={handleChange}
                maxLength={10}
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
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </AuthInputFrame>
          </AuthInputBlock>
        </AuthInputGrid>

        <AuthInputBlock>
          <AuthLabel htmlFor="confirmPassword">Confirm Password</AuthLabel>
          <AuthInputFrame>
            <AuthInputIcon>
              <FiLock />
            </AuthInputIcon>
            <AuthInput
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </AuthInputFrame>
        </AuthInputBlock>

        <AuthPrimaryButton type="submit" fullWidth disabled={loading}>
          {loading ? 'Signing up...' : 'Sign Up'}
        </AuthPrimaryButton>
      </AuthForm>
    </AuthPageLayout>
  );
}
