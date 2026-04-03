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
  background: linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('https://images.unsplash.com/photo-1564981797816-1043664bf78d?q=80&w=2148&auto=format&fit=crop');
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
      setError('Passwords do not match');
      return;
    }

    if (formData.mobile.length !== 10) {
      setError('Mobile number must be 10 digits');
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
        setSuccess('Registration successful! Please login.');
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <PageWrapper>
      <StyledCard style={{ width: '100%', maxWidth: '35rem', animation: 'slideUp 0.3s ease' }}>
        <CardHeader style={{ textAlign: 'center' }}>
          <UniTitle>University Portal</UniTitle>
          <UniSubtitle>Student & Staff Management System</UniSubtitle>
          <CardTitle style={{ fontSize: '1.25rem', color: 'var(--foreground)' }}>Create Account</CardTitle>
          <CardDescription>Enter your details to register</CardDescription>
        </CardHeader>
        <CardContent>
          <Form onSubmit={handleSubmit}>
            {error && <Alert $variant="error">{error}</Alert>}
            {success && <Alert $variant="success">{success}</Alert>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Label htmlFor="email">Email</Label>
              <StyledInput
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <InputRow>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Label htmlFor="mobile">Mobile</Label>
                <StyledInput
                  id="mobile"
                  name="mobile"
                  type="tel"
                  placeholder="10-digit"
                  value={formData.mobile}
                  onChange={handleChange}
                  maxLength={10}
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Label htmlFor="password">Password</Label>
                <StyledInput
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </InputRow>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <StyledInput
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Signing up...' : 'Sign Up'}
            </Button>
          </Form>
        </CardContent>
        <CardFooter style={{ textAlign: 'center' }}>
          <FooterLink>
            Already have an account?{' '}
            <Link to="/login"><StyledLink>Login</StyledLink></Link>
          </FooterLink>
        </CardFooter>
      </StyledCard>
    </PageWrapper>
  );
}