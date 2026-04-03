import React from 'react';
import styled from 'styled-components';

const PageWrapper = styled.div`
  min-height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%);
  padding: 2rem;
`;

const DashboardCard = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 3rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #1e3a5f;
  margin-bottom: 1rem;
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: #64748b;
`;

export default function SocialDashboard() {
  return (
    <PageWrapper>
      <DashboardCard>
        <Title>Social Dashboard</Title>
        <Subtitle>Welcome to the social login area!</Subtitle>
      </DashboardCard>
    </PageWrapper>
  );
}
