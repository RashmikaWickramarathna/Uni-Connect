import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { authApi } from '../../api/authApi';
import styled from 'styled-components';

const PageWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2370&auto=format&fit=crop');
  background-size: cover;
  background-position: center;
  padding: 2rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Alert = styled.div`
  padding: 0.75rem;
  font-size: 0.875rem;
  border-radius: 0.375rem;
  ${props => props.$variant === 'error' ? `
    color: var(--destructive);
    background-color: rgba(220, 38, 38, 0.1);
  ` : `
    color: #16a34a;
    background-color: #dcfce7;
  `}
`;

const FooterLink = styled.p`
  font-size: 0.875rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
`;

const StyledLink = styled.span`
  color: #60a5fa;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;

const UniTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: black;
  text-align: center;
  margin-bottom: 0.5rem;
`;

const UniSubtitle = styled.p`
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
  margin-bottom: 1.5rem;
`;

const StyledCard = styled(Card)`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
`;

const StyledInput = styled(Input)``;

const InputRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

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
        setSuccess('OTP sent to your email');
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
        setSuccess('OTP verified successfully');
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
        setSuccess('Password reset successful! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    }
    setLoading(false);
  };

  const getDescription = () => {
    if (step === 1) return 'Enter your email to receive OTP';
    if (step === 2) return 'Enter the OTP sent to your email';
    return 'Enter your new password';
  };

  return (
    <PageWrapper>
      <StyledCard style={{ width: '100%', maxWidth: '35rem', animation: 'slideUp 0.3s ease' }}>
        <CardHeader style={{ textAlign: 'center' }}>
          <UniTitle>University Portal</UniTitle>
          <UniSubtitle>Student & Staff Management System</UniSubtitle>
          <CardTitle style={{ fontSize: '1.25rem', color: 'var(--foreground)' }}>Reset Password</CardTitle>
          <CardDescription>{getDescription()}</CardDescription>
        </CardHeader>
        <CardContent>
          {(error || success) && (
            <Alert $variant={error ? 'error' : 'success'}>
              {error || success}
            </Alert>
          )}

          {step === 1 && (
            <Form onSubmit={handleSendOTP}>
              <InputRow>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <Label htmlFor="email">Email</Label>
                  <StyledInput
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <Button type="submit" disabled={loading} style={{ height: '2.5rem' }}>
                    {loading ? 'Sending...' : 'Send OTP'}
                  </Button>
                </div>
              </InputRow>
            </Form>
          )}

          {step === 2 && (
            <Form onSubmit={handleVerifyOTP}>
              <InputRow>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <Label htmlFor="otp">OTP</Label>
                  <StyledInput
                    id="otp"
                    type="text"
                    placeholder="6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    required
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <Button type="submit" disabled={loading} style={{ height: '2.5rem' }}>
                    {loading ? 'Verifying...' : 'Verify OTP'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => { setStep(1); setError(''); setSuccess(''); }} style={{ height: '2.5rem' }}>
                    Resend
                  </Button>
                </div>
              </InputRow>
            </Form>
          )}

          {step === 3 && (
            <Form onSubmit={handleResetPassword}>
              <InputRow>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <Label htmlFor="newPassword">New Password</Label>
                  <StyledInput
                    id="newPassword"
                    type="password"
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <Button type="submit" fullWidth disabled={loading} style={{ height: '2.5rem' }}>
                    {loading ? 'Resetting...' : 'Reset Password'}
                  </Button>
                </div>
              </InputRow>
            </Form>
          )}
        </CardContent>
        <CardFooter style={{ textAlign: 'center' }}>
          <FooterLink>
            Remember your password?{' '}
            <Link to="/login"><StyledLink>Login</StyledLink></Link>
          </FooterLink>
        </CardFooter>
      </StyledCard>
    </PageWrapper>
  );
}