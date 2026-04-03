import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import styled from 'styled-components';

const PageWrapper = styled.div`
  min-height: 100vh;
  width : 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2370&auto=format&fit=crop');
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
  color: var(--destructive);
  background-color: rgba(220, 38, 38, 0.1);
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

const StyledLabel = styled(Label)`
  color: var(--foreground);
`;

const SocialButton = styled(Button)`
  background: #4285f4;
  &:hover {
    background: #3574dc;
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1rem 0;
  
  &::before, &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(0, 0, 0, 0.1);
  }
  
  span {
    font-size: 0.875rem;
    color: rgba(0, 0, 0, 0.5);
  }
`;

export default function SocialLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      window.location.href = '/social-dashboard';
    }, 500);
  };

  return (
    <PageWrapper>
      <StyledCard style={{ width: '100%', maxWidth: '35rem', animation: 'slideUp 0.3s ease' }}>
        <CardHeader style={{ textAlign: 'center' }}>
          <UniTitle>University Portal</UniTitle>
          <UniSubtitle>Student & Staff Management System</UniSubtitle>
          <CardTitle style={{ fontSize: '1.25rem', color: 'var(--foreground)' }}>Social Login</CardTitle>
          <CardDescription>Login with username and password</CardDescription>
        </CardHeader>
        <CardContent>
          <Form onSubmit={handleSubmit}>
            {error && <Alert>{error}</Alert>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <StyledLabel htmlFor="username">Username</StyledLabel>
              <StyledInput
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <StyledLabel htmlFor="password">Password</StyledLabel>
              <StyledInput
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </Form>
        </CardContent>
        <CardFooter style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <FooterLink>
            <Link to="/login"><StyledLink>Back to email login</StyledLink></Link>
          </FooterLink>
        </CardFooter>
      </StyledCard>
    </PageWrapper>
  );
}
