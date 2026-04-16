import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { inquiryApi } from '../../api/inquiryApi';
import Navbar from '../../components/Navbar/Navbar';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Textarea } from '../../components/ui/Label';
import styled from 'styled-components';

const PageWrapper = styled.div`
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background:
    radial-gradient(circle at top right, rgba(37, 99, 235, 0.12), transparent 28%),
    radial-gradient(circle at bottom left, rgba(251, 191, 36, 0.14), transparent 26%),
    linear-gradient(180deg, #f8fbff 0%, #ffffff 45%, #f8fbff 100%);

  &::before {
    content: '';
    position: fixed;
    top: 6rem;
    right: -9rem;
    width: 24rem;
    height: 24rem;
    border-radius: 50%;
    background: rgba(37, 99, 235, 0.08);
    filter: blur(12px);
    pointer-events: none;
  }

  &::after {
    content: '';
    position: fixed;
    left: -8rem;
    bottom: 2rem;
    width: 22rem;
    height: 22rem;
    border-radius: 50%;
    background: rgba(251, 191, 36, 0.08);
    filter: blur(14px);
    pointer-events: none;
  }
`;

const Main = styled.main`
  position: relative;
  z-index: 1;
  padding: 7.5rem 2rem 3rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const PageTitle = styled.h2`
  font-size: clamp(1.8rem, 2.8vw, 2.3rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  color: #1f2937;
  margin-bottom: 1.5rem;
`;

const BackButton = styled.button`
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(147, 197, 253, 0.7);
  color: #2563eb;
  padding: 0.7rem 1.1rem;
  border-radius: 999px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 1rem;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;

  &:hover {
    background: #ffffff;
    transform: translateY(-1px);
    box-shadow: 0 16px 32px rgba(15, 23, 42, 0.1);
  }
`;

const Section = styled.div`
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(209, 213, 219, 0.72);
  border-radius: 1.35rem;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08);
  padding: 1.75rem;
  margin-bottom: 1.75rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--foreground);
  margin-bottom: 1rem;
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

const StyledInput = styled(Input)`
  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.14);
  }
`;

const InquiryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const InquiryCard = styled(Card)`
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(209, 213, 219, 0.72);
  box-shadow: 0 14px 32px rgba(15, 23, 42, 0.06);
`;

const InquiryHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 0.5rem;
`;

const InquiryMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const DateBadge = styled.span`
  font-size: 0.75rem;
  color: var(--muted-foreground);
  background: var(--muted);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
`;

const SubjectBadge = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.375rem 0.75rem;
  border-radius: 2rem;
  background: #dbeafe;
  color: #2563eb;
  text-transform: uppercase;
  letter-spacing: 0.025em;
`;

const StatusBadge = styled.span`
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  ${props => props.$replied ? `
    background: #dcfce7;
    color: #16a34a;
  ` : `
    background: #fef3c7;
    color: #d97706;
  `}
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const ReplyBox = styled.div`
  background: #f0f9ff;
  border-left: 3px solid #2563eb;
  padding: 0.75rem 1rem;
  border-radius: 0 0.375rem 0.375rem 0;
  margin-top: 0.75rem;
`;

const ReplyLabel = styled.p`
  font-size: 0.75rem;
  font-weight: 600;
  color: #2563eb;
  text-transform: uppercase;
`;

const ReplyText = styled.p`
  font-size: 0.875rem;
  color: var(--foreground);
`;

const EmptyState = styled.p`
  text-align: center;
  color: var(--muted-foreground);
  padding: 2rem;
`;

const LoadingWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
`;

const Spinner = styled.div`
  width: 2rem;
  height: 2rem;
  border: 3px solid #e2e8f0;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

export default function MyInquiries() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.email?.split('@')[0] || '',
    email: user?.email || '',
    subject: '',
    message: '',
  });
  
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({ name: '', email: '', subject: '', message: '' });
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');

  const fetchInquiries = useCallback(async () => {
    if (!user?.userId) {
      setLoading(false);
      return;
    }

    try {
      const res = await inquiryApi.getMy(user.userId);
      setInquiries(res.data.inquiries || []);
    } catch (error) {
      console.error('Failed to fetch inquiries', error);
    } finally {
      setLoading(false);
    }
  }, [user?.userId]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = (data) => {
    if (!data.name?.trim()) return 'Name is required';
    if (!data.email?.trim()) return 'Email is required';
    if (!data.subject?.trim()) return 'Subject is required';
    if (!data.message?.trim()) return 'Message is required';
    if (data.message.length < 10) return 'Message must be at least 10 characters';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    const validationError = validateForm(formData);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      await inquiryApi.create({
        ...formData,
        userId: user.userId,
      });
      setFormSuccess('Inquiry submitted successfully!');
      setFormData({ ...formData, subject: '', message: '' });
      fetchInquiries();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to submit inquiry');
    }
    setSubmitting(false);
  };

  const handleEdit = (inq) => {
    setEditId(inq._id);
    setEditData({ name: inq.name, email: inq.email, subject: inq.subject, message: inq.message });
    setEditError('');
    setEditSuccess('');
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
  };

  const handleUpdate = async () => {
    const validationError = validateForm(editData);
    if (validationError) {
      setEditError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      await inquiryApi.update(editId, editData);
      setEditSuccess('Inquiry updated successfully!');
      setEditId(null);
      fetchInquiries();
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update inquiry');
    }
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this inquiry?')) return;
    
    setSubmitting(true);
    try {
      await inquiryApi.delete(id);
      fetchInquiries();
    } catch (error) {
      console.error('Failed to delete inquiry', error);
      alert('Failed to delete inquiry');
    }
    setSubmitting(false);
  };

  return (
    <PageWrapper>
      <Navbar />

      <Main>
        <BackButton onClick={() => navigate('/home')}>← Back to Dashboard</BackButton>
        <PageTitle>My Inquiries</PageTitle>

        <Section>
          <SectionTitle>Submit New Inquiry</SectionTitle>
          <Form onSubmit={handleSubmit}>
            {formError && <Alert $variant="error">{formError}</Alert>}
            {formSuccess && <Alert $variant="success">{formSuccess}</Alert>}
            
            <div>
              <Label htmlFor="name">Name</Label>
              <StyledInput
                id="name"
                name="name"
                placeholder="Your name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <StyledInput
                id="email"
                name="email"
                type="email"
                placeholder="Your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="subject">Subject</Label>
              <StyledInput
                id="subject"
                name="subject"
                placeholder="Enter subject (e.g., Payment Issue, Account Help)"
                value={formData.subject}
                onChange={handleChange}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                name="message"
                placeholder="Describe your inquiry in detail (min 10 characters)"
                value={formData.message}
                onChange={handleChange}
                required
              />
            </div>
            
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Inquiry'}
            </Button>
          </Form>
        </Section>

        <Section>
          <SectionTitle>My Inquiry History ({inquiries.length})</SectionTitle>
          
          {loading ? (
            <LoadingWrapper><Spinner /></LoadingWrapper>
          ) : inquiries.length === 0 ? (
            <EmptyState>No inquiries yet. Submit your first inquiry above!</EmptyState>
          ) : (
            <InquiryList>
              {inquiries.map((inq) => (
                <InquiryCard key={inq._id}>
                  <CardContent>
                    {editId === inq._id ? (
                      <Form onSubmit={(e) => { e.preventDefault(); handleUpdate(); }}>
                        {editError && <Alert $variant="error">{editError}</Alert>}
                        {editSuccess && <Alert $variant="success">{editSuccess}</Alert>}
                        
                        <div>
                          <Label>Name</Label>
                          <StyledInput
                            name="name"
                            value={editData.name}
                            onChange={handleEditChange}
                          />
                        </div>
                        <div>
                          <Label>Email</Label>
                          <StyledInput
                            name="email"
                            value={editData.email}
                            onChange={handleEditChange}
                          />
                        </div>
                        <div>
                          <Label>Subject</Label>
                          <StyledInput
                            name="subject"
                            value={editData.subject}
                            onChange={handleEditChange}
                          />
                        </div>
                        <div>
                          <Label>Message</Label>
                          <Textarea
                            name="message"
                            value={editData.message}
                            onChange={handleEditChange}
                          />
                        </div>
                        
                        <ActionButtons>
                          <Button type="submit" size="sm" disabled={submitting}>
                            {submitting ? 'Saving...' : 'Save'}
                          </Button>
                          <Button type="button" size="sm" variant="outline" onClick={() => setEditId(null)}>
                            Cancel
                          </Button>
                        </ActionButtons>
                      </Form>
                    ) : (
                      <>
                        <InquiryHeader>
                          <InquiryMeta>
                            <SubjectBadge>{inq.subject}</SubjectBadge>
                            <DateBadge>{new Date(inq.createdAt).toLocaleDateString()}</DateBadge>
                            <StatusBadge $replied={!!inq.adminReply}>
                              {inq.adminReply ? 'Replied' : 'Pending'}
                            </StatusBadge>
                          </InquiryMeta>
                        </InquiryHeader>
                        
                        <p style={{ color: 'var(--foreground)', marginBottom: '0.5rem' }}>{inq.message}</p>
                        
                        {inq.adminReply ? (
                          <ReplyBox>
                            <ReplyLabel>Admin Reply</ReplyLabel>
                            <ReplyText>{inq.adminReply}</ReplyText>
                          </ReplyBox>
                        ) : (
                          <ActionButtons>
                            <Button size="sm" variant="outline" onClick={() => handleEdit(inq)}>
                              Edit
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDelete(inq._id)}>
                              Delete
                            </Button>
                          </ActionButtons>
                        )}
                      </>
                    )}
                  </CardContent>
                </InquiryCard>
              ))}
            </InquiryList>
          )}
        </Section>
      </Main>
    </PageWrapper>
  );
}
