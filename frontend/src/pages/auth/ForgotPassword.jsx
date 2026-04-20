import React, { useState } from 'react';
import { FiKey, FiLock, FiMail } from 'react-icons/fi';
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
  AuthSecondaryButton,
  AuthUtilityLink,
} from '../../components/auth/AuthPageLayout';
import { authApi } from '../../api/authApi';

const featurePoints = [
  'Reset your password through the same streamlined Uni-Connect access flow',
  'Verify ownership with email OTP before creating a new password',
  'Return to your student dashboard tools without changing the public landing-page experience',
];

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await authApi.forgotPassword(email);
      if (res.data.message) {
        setStep(2);
        setSuccess('OTP sent to your email.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please check your email.');
    }

    setLoading(false);
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await authApi.verifyOTP({ email, otp });
      if (res.data.message) {
        setStep(3);
        setSuccess('OTP verified successfully.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP. Please try again.');
    }

    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await authApi.resetPassword({ email, newPassword });
      if (res.data.message) {
        setSuccess('Password reset successful. Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    }

    setLoading(false);
  };

  const formSubtitle =
    step === 1
      ? 'Enter your registered email address and we will send a one-time password.'
      : step === 2
        ? 'Enter the OTP sent to your inbox to confirm it is really you.'
        : 'Create a new password for your Uni-Connect account.';

  return (
    <AuthPageLayout
      brandTag="Password Recovery"
      showcaseTitle="Reset your"
      showcaseAccent="account access"
      showcaseText="Forgot your password? Recover your account through the same polished blue auth flow without changing the existing public home experience."
      featurePoints={featurePoints}
      formTag="Password Reset"
      formTitle="Forgot Password"
      formSubtitle={formSubtitle}
      footer={
        <>
          <AuthDivider />
          <AuthLinkRow>
            <AuthUtilityLink to="/login">Back to Login</AuthUtilityLink>
          </AuthLinkRow>
          <AuthHelperNote>
            Complete the email, OTP, and password steps in order. Once the reset finishes, you will be sent back to
            the main login page.
          </AuthHelperNote>
        </>
      }
    >
      {(error || success) && <AuthAlert $variant={error ? 'error' : 'success'}>{error || success}</AuthAlert>}

      {step === 1 && (
        <AuthForm onSubmit={handleSendOTP}>
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

          <AuthPrimaryButton type="submit" fullWidth disabled={loading}>
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </AuthPrimaryButton>
        </AuthForm>
      )}

      {step === 2 && (
        <AuthForm onSubmit={handleVerifyOTP}>
          <AuthInputBlock>
            <AuthLabel htmlFor="otp">OTP</AuthLabel>
            <AuthInputFrame>
              <AuthInputIcon>
                <FiKey />
              </AuthInputIcon>
              <AuthInput
                id="otp"
                type="text"
                placeholder="Enter your 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                required
              />
            </AuthInputFrame>
          </AuthInputBlock>

          <AuthPrimaryButton type="submit" fullWidth disabled={loading}>
            {loading ? 'Verifying OTP...' : 'Verify OTP'}
          </AuthPrimaryButton>

          <AuthSecondaryButton
            type="button"
            fullWidth
            onClick={() => {
              setStep(1);
              setError('');
              setSuccess('');
            }}
          >
            Resend OTP
          </AuthSecondaryButton>
        </AuthForm>
      )}

      {step === 3 && (
        <AuthForm onSubmit={handleResetPassword}>
          <AuthInputBlock>
            <AuthLabel htmlFor="newPassword">New Password</AuthLabel>
            <AuthInputFrame>
              <AuthInputIcon>
                <FiLock />
              </AuthInputIcon>
              <AuthInput
                id="newPassword"
                type="password"
                placeholder="Enter your new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </AuthInputFrame>
          </AuthInputBlock>

          <AuthPrimaryButton type="submit" fullWidth disabled={loading}>
            {loading ? 'Resetting Password...' : 'Reset Password'}
          </AuthPrimaryButton>
        </AuthForm>
      )}
    </AuthPageLayout>
  );
}
