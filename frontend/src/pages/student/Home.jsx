import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import styled from 'styled-components';

const PageWrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('https://images.unsplash.com/photo-1492538368677-f6e0afe31dcc?q=80&w=2370&auto=format&fit=crop');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
`;

const Header = styled.header`
  background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%);
  color: white;
  padding: 1rem 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Logo = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: black;
`;

const LogoIcon = styled.span`
  width: 2.5rem;
  height: 2.5rem;
  background: white;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2563eb;
  font-weight: bold;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const UserBadge = styled.div`
  background: rgba(255, 255, 255, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-size: 0.875rem;
`;

const Main = styled.main`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const WelcomeSection = styled.div`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
`;

const WelcomeText1 = styled.div``;

const WelcomeTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--foreground);
  margin-bottom: 0.25rem;
`;

const WelcomeSubtitle = styled.p`
  color: var(--muted-foreground);
  font-size: 0.875rem;
`;

const QuickStats = styled.div`
  display: flex;
  gap: 2rem;
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #2563eb;
`;

const StatLabel = styled.div`
  font-size: 0.75rem;
  color: var(--muted-foreground);
`;

const PageTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
  margin-bottom: 1.5rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const CardLink = styled(Link)`
  text-decoration: none;
  color: inherit;
`;

const StyledCard = styled(Card)`
  cursor: pointer;
  transition: all 0.2s ease;
  height: 100%;
  border: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
    border-color: #2563eb;
  }
`;

const CardIcon = styled.div`
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin-bottom: 1rem;
  ${props => props.$color === 'blue' ? `
    background: #dbeafe;
    color: #2563eb;
  ` : props.$color === 'green' ? `
    background: #dcfce7;
    color: #16a34a;
  ` : props.$color === 'purple' ? `
    background: #f3e8ff;
    color: #9333ea;
  ` : `
    background: #f1f5f9;
    color: #64748b;
  `}
`;

const Description = styled.p`
  font-size: 0.875rem;
  color: var(--muted-foreground);
`;

const CardMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  font-size: 0.75rem;
  color: var(--muted-foreground);
`;

const MetaDot = styled.span`
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: #2563eb;
`;

export default function Home() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const getUserName = () => {
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  return (
    <PageWrapper>
      <Header>
        <HeaderContent>
          <Logo>
            <LogoIcon>U</LogoIcon>
            University Portal
          </Logo>
          <HeaderRight>
            <UserBadge>Student: {getUserName()}</UserBadge>
            <Button variant="secondary" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </HeaderRight>
        </HeaderContent>
      </Header>

      <Main>
        <WelcomeSection>
          <WelcomeText1>
            <WelcomeTitle>Welcome back, {getUserName()}!</WelcomeTitle>
            <WelcomeSubtitle>Access your feedback and inquiry submissions</WelcomeSubtitle>
          </WelcomeText1>
          <QuickStats>
            <StatItem>
              <StatValue>2</StatValue>
              <StatLabel>Active Services</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>24/7</StatValue>
              <StatLabel>Support Available</StatLabel>
            </StatItem>
          </QuickStats>
        </WelcomeSection>

        <PageTitle>Quick Actions</PageTitle>
        
        <Grid>
          <CardLink to="/my-feedbacks">
            <StyledCard>
              <CardContent>
                <CardIcon $color="blue">★</CardIcon>
                <CardTitle>My Feedbacks</CardTitle>
                <Description>View and manage your feedback submissions</Description>
                <CardMeta>
                  <MetaDot />
                  Submit feedback
                </CardMeta>
              </CardContent>
            </StyledCard>
          </CardLink>

          <CardLink to="/my-inquiries">
            <StyledCard>
              <CardContent>
                <CardIcon $color="green">?</CardIcon>
                <CardTitle>My Inquiries</CardTitle>
                <Description>View and manage your inquiries</Description>
                <CardMeta>
                  <MetaDot />
                  Ask questions
                </CardMeta>
              </CardContent>
            </StyledCard>
          </CardLink>

          <CardLink to="/profile">
            <StyledCard>
              <CardContent>
                <CardIcon $color="purple">👤</CardIcon>
                <CardTitle>My Profile</CardTitle>
                <Description>View and manage your profile settings</Description>
                <CardMeta>
                  <MetaDot />
                  View profile
                </CardMeta>
              </CardContent>
            </StyledCard>
          </CardLink>
        </Grid>
      </Main>
    </PageWrapper>
  );
}