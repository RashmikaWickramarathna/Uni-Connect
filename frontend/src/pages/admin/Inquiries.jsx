import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { inquiryApi } from '../../api/inquiryApi';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Label';
import styled from 'styled-components';

const PageWrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2370&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D');
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

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const BackButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const Logo = styled.h1`
  font-size: 1.25rem;
  font-weight: 700;
`;

const Main = styled.main`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
`;

const PageTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
`;

const StatsBar = styled.div`
  display: flex;
  gap: 1rem;
`;

const StatBadge = styled.div`
  background: white;
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-size: 0.875rem;
  color: var(--muted-foreground);
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.05);
`;

const EmptyState = styled.p`
  color: var(--muted-foreground);
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 0.5rem;
`;

const InquiryCard = styled(Card)`
  animation: slideUp 0.3s ease;
  margin-bottom: 1rem;
  border: 1px solid var(--border);
`;

const InquiryHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const UserInfo = styled.div``;

const UserName = styled.p`
  font-weight: 600;
  font-size: 1.125rem;
`;

const UserEmail = styled.p`
  font-size: 0.875rem;
  color: var(--muted-foreground);
`;

const Badge = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.375rem 0.75rem;
  border-radius: 2rem;
  background: #dbeafe;
  color: #2563eb;
  text-transform: uppercase;
  letter-spacing: 0.025em;
`;

const DateBadge = styled.span`
  font-size: 0.75rem;
  color: var(--muted-foreground);
  background: var(--muted);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
`;

const Message = styled.p`
  margin-bottom: 1rem;
  color: var(--foreground);
`;

const ReplyBox = styled.div`
  background: #f0f9ff;
  border-left: 3px solid #2563eb;
  padding: 0.75rem 1rem;
  border-radius: 0 0.375rem 0.375rem 0;
  margin-top: 0.5rem;
`;

const ReplyLabel = styled.p`
  font-size: 0.75rem;
  font-weight: 600;
  color: #2563eb;
  margin-bottom: 0.25rem;
  text-transform: uppercase;
`;

const ReplyText = styled.p`
  font-size: 0.875rem;
  color: var(--foreground);
`;

const ReplyDate = styled.p`
  font-size: 0.75rem;
  color: var(--muted-foreground);
  margin-top: 0.25rem;
`;

const ReplySection = styled.div`
  margin-top: 1rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const LoadingWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Spinner = styled.div`
  width: 2.5rem;
  height: 2.5rem;
  border: 4px solid #e2e8f0;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const CardsGrid = styled.div`
  display: grid;
  gap: 1rem;
`;

export default function Inquiries() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState({});
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      const res = await inquiryApi.getAll();
      setInquiries(res.data.inquiries || []);
    } catch (err) {
      console.error('Failed to fetch inquiries');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleReply = async (id) => {
    if (!replyText[id]?.trim()) return;
    try {
      await inquiryApi.reply(id, replyText[id]);
      setReplyText({ ...replyText, [id]: '' });
      setActiveId(null);
      fetchInquiries();
    } catch (err) {
      console.error('Failed to reply');
    }
  };

  if (loading) {
    return (
      <LoadingWrapper>
        <Spinner />
      </LoadingWrapper>
    );
  }

  return (
    <PageWrapper>
      <Header>
        <HeaderContent>
          <HeaderLeft>
            <BackButton onClick={() => navigate('/admin')}>← Back</BackButton>
            <Logo>Inquiry Management</Logo>
          </HeaderLeft>
          <Button variant="secondary" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </HeaderContent>
      </Header>

      <Main>
        <TitleRow>
          <PageTitle>All Inquiry Submissions</PageTitle>
          <StatsBar>
            <StatBadge>Total: {inquiries.length}</StatBadge>
          </StatsBar>
        </TitleRow>

        {inquiries.length === 0 ? (
          <EmptyState>No inquiry submissions yet.</EmptyState>
        ) : (
          <CardsGrid>
            {inquiries.map((inq) => (
              <InquiryCard key={inq._id}>
                <CardHeader style={{ paddingBottom: '0.5rem' }}>
                  <InquiryHeader>
                    <UserInfo>
                      <UserName>{inq.name}</UserName>
                      <UserEmail>{inq.email}</UserEmail>
                    </UserInfo>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <Badge>{inq.subject}</Badge>
                      <DateBadge>{new Date(inq.createdAt).toLocaleDateString()}</DateBadge>
                    </div>
                  </InquiryHeader>
                </CardHeader>
                <CardContent>
                  <Message>{inq.message}</Message>
                  
                  {inq.adminReply ? (
                    <ReplyBox>
                      <ReplyLabel>Admin Reply</ReplyLabel>
                      <ReplyText>{inq.adminReply}</ReplyText>
                      <ReplyDate>
                        Replied on: {inq.repliedAt ? new Date(inq.repliedAt).toLocaleDateString() : ''}
                      </ReplyDate>
                    </ReplyBox>
                  ) : (
                    <ReplySection>
                      {activeId === inq._id ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <Textarea
                            placeholder="Write your reply..."
                            value={replyText[inq._id] || ''}
                            onChange={(e) => setReplyText({ ...replyText, [inq._id]: e.target.value })}
                          />
                          <ButtonGroup>
                            <Button size="sm" onClick={() => handleReply(inq._id)}>Send Reply</Button>
                            <Button size="sm" variant="outline" onClick={() => setActiveId(null)}>Cancel</Button>
                          </ButtonGroup>
                        </div>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => setActiveId(inq._id)}>Reply to Inquiry</Button>
                      )}
                    </ReplySection>
                  )}
                </CardContent>
              </InquiryCard>
            ))}
          </CardsGrid>
        )}
      </Main>
    </PageWrapper>
  );
}
