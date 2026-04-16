import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/authApi';
import Navbar from '../../components/Navbar/Navbar';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
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
  max-width: 800px;
  margin: 0 auto;
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

const PageTitle = styled.h2`
  font-size: clamp(1.8rem, 2.8vw, 2.3rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  color: #1f2937;
  margin-bottom: 1.5rem;
`;

const ProfileCard = styled(Card)`
  background: rgba(255, 255, 255, 0.97);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(209, 213, 219, 0.72);
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08);
  border-radius: 1.35rem;
  margin-bottom: 1.5rem;
`;

const Avatar = styled.div`
  width: 5rem;
  height: 5rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #2563eb 0%, #1e3a5f 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin: 0 auto 1rem;
`;

const ProfileInfo = styled.div`
  text-align: center;
  margin-bottom: 1.5rem;
`;

const UserName = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--foreground);
`;

const UserEmail = styled.p`
  font-size: 0.875rem;
  color: var(--muted-foreground);
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
  ` : props.$variant === 'success' ? `
    color: #16a34a;
    background-color: #dcfce7;
  ` : `
    color: #d97706;
    background-color: #fef3c7;
  `}
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const DangerButton = styled(Button)`
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  &:hover {
    background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%);
  }
`;

const StyledInput = styled(Input)`
  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.14);
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  text-align: center;
`;

const ModalTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
`;

const ModalText = styled.p`
  color: var(--muted-foreground);
  margin-bottom: 1.5rem;
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
`;

const LoadingWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
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

export default function Profile() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fetchUserData = useCallback(async () => {
    if (!user?.userId) {
      setLoading(false);
      return;
    }

    try {
      const res = await authApi.getUser(user.userId);
      if (res.data.user) {
        setFormData({
          name: res.data.user.name || user.email?.split('@')[0] || '',
          mobile: res.data.user.mobile || '',
        });
      }
    } catch (error) {
      setFormData({
        name: user.email?.split('@')[0] || '',
        mobile: '',
      });
      console.error('Failed to fetch user data', error);
    } finally {
      setLoading(false);
    }
  }, [user?.userId, user?.email]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    
    if (!formData.name?.trim()) {
      setError('Name is required');
      setSubmitting(false);
      return;
    }
    
    try {
      const res = await authApi.updateUser(user.userId, {
        name: formData.name,
        mobile: formData.mobile,
      });
      
      if (res.data.user) {
        const updatedUser = { ...user, name: formData.name, mobile: formData.mobile };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        login(updatedUser);
      }
      
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await authApi.deleteUser(user.userId);
      logout();
      localStorage.removeItem('user');
      navigate('/login');
    } catch (error) {
      console.error('Failed to delete account', error);
      alert('Failed to delete account');
      setSubmitting(false);
    }
  };

  const getUserInitial = () => {
    const name = formData.name || user?.email?.split('@')[0] || 'U';
    return name.charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <PageWrapper>
        <LoadingWrapper><Spinner /></LoadingWrapper>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Navbar />

      <Main>
        <BackButton onClick={() => navigate('/home')}>← Back to Dashboard</BackButton>
        <PageTitle>My Profile</PageTitle>

        <ProfileCard>
          <CardContent style={{ padding: '2rem' }}>
            <Avatar>{getUserInitial()}</Avatar>
            <ProfileInfo>
              <UserName>{formData.name || user?.email?.split('@')[0] || 'User'}</UserName>
              <UserEmail>{user?.email}</UserEmail>
            </ProfileInfo>
            
            {!isEditing ? (
              <>
                <Button onClick={() => setIsEditing(true)} fullWidth>
                  Edit Profile
                </Button>
              </>
            ) : (
              <Form onSubmit={handleUpdate}>
                {error && <Alert $variant="error">{error}</Alert>}
                {success && <Alert $variant="success">{success}</Alert>}
                
                <div>
                  <Label htmlFor="name">Name</Label>
                  <StyledInput
                    id="name"
                    name="name"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <StyledInput
                    id="email"
                    value={user?.email || ''}
                    disabled
                    style={{ opacity: 0.6 }}
                  />
                </div>
                
                <div>
                  <Label htmlFor="mobile">Mobile Number</Label>
                  <StyledInput
                    id="mobile"
                    name="mobile"
                    placeholder="Enter mobile number"
                    value={formData.mobile}
                    onChange={handleChange}
                  />
                </div>
                
                <ButtonGroup>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => { setIsEditing(false); setError(''); setSuccess(''); }}>
                    Cancel
                  </Button>
                </ButtonGroup>
              </Form>
            )}
          </CardContent>
        </ProfileCard>

        <ProfileCard>
          <CardContent style={{ padding: '1.5rem' }}>
            <SectionTitle>Account Actions</SectionTitle>
            <ButtonGroup>
              <DangerButton 
                variant="destructive" 
                onClick={() => setShowDeleteModal(true)}
              >
                Delete Account
              </DangerButton>
            </ButtonGroup>
          </CardContent>
        </ProfileCard>
      </Main>

      {showDeleteModal && (
        <Modal onClick={() => setShowDeleteModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalTitle style={{ color: '#dc2626' }}>Delete Account</ModalTitle>
            <ModalText>
              Are you sure you want to delete your account? This action cannot be undone and all your data will be lost.
            </ModalText>
            <ModalButtons>
              <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
              <DangerButton onClick={handleDelete} disabled={submitting}>
                {submitting ? 'Deleting...' : 'Delete Account'}
              </DangerButton>
            </ModalButtons>
          </ModalContent>
        </Modal>
      )}
    </PageWrapper>
  );
}
