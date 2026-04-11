import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled, { css, keyframes } from 'styled-components';
import {
  FiArrowRight,
  FiCalendar,
  FiCheckCircle,
  FiHelpCircle,
  FiHome,
  FiLogOut,
  FiMessageSquare,
  FiPlusCircle,
  FiStar,
  FiTrendingUp,
  FiUser,
} from 'react-icons/fi';
import { HiOutlineAcademicCap } from 'react-icons/hi2';
import { IoMusicalNotesOutline } from 'react-icons/io5';
import { LuGamepad2 } from 'react-icons/lu';

import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-12px);
  }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.03);
  }
`;

const dashboardCards = [
  {
    title: 'My Feedbacks',
    description: 'View and manage your feedback submissions in one place.',
    detail: 'Submit and review feedback',
    route: '/my-feedbacks',
    icon: FiMessageSquare,
    tone: 'blue',
  },
  {
    title: 'My Inquiries',
    description: 'Track questions, updates, and follow-up responses.',
    detail: 'Ask questions anytime',
    route: '/my-inquiries',
    icon: FiHelpCircle,
    tone: 'green',
  },
  {
    title: 'My Profile',
    description: 'Update your personal details and account settings.',
    detail: 'View and edit profile',
    route: '/profile',
    icon: FiUser,
    tone: 'purple',
  },
];

const featuredEvents = [
  {
    title: 'Music Club',
    subtitle: 'Live concert tonight',
    icon: IoMusicalNotesOutline,
    $position: 'top',
  },
  {
    title: 'Debate Competition',
    subtitle: 'Registration open now',
    icon: FiStar,
    $position: 'middle',
  },
  {
    title: 'Gaming Tournament',
    subtitle: 'This weekend on campus',
    icon: LuGamepad2,
    $position: 'bottom',
  },
];

const PageShell = styled.div`
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at top right, rgba(37, 99, 235, 0.16), transparent 32%),
    radial-gradient(circle at bottom left, rgba(251, 191, 36, 0.16), transparent 28%),
    linear-gradient(180deg, #f8fbff 0%, #ffffff 100%);
`;

const BackgroundHalo = styled.div`
  position: absolute;
  border-radius: 999px;
  pointer-events: none;
  filter: blur(2px);

  ${({ $variant }) =>
    $variant === 'blue'
      ? css`
          width: 28rem;
          height: 28rem;
          top: -8rem;
          right: -7rem;
          background: rgba(37, 99, 235, 0.13);
        `
      : css`
          width: 22rem;
          height: 22rem;
          left: -6rem;
          bottom: 3rem;
          background: rgba(250, 204, 21, 0.12);
        `}
`;

const PageContainer = styled.div`
  position: relative;
  z-index: 1;
  width: min(1240px, calc(100% - 3rem));
  margin: 0 auto;

  @media (max-width: 640px) {
    width: min(100% - 1.5rem, 1240px);
  }
`;

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 20;
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(18px);
  border-bottom: 1px solid rgba(148, 163, 184, 0.16);
`;

const HeaderInner = styled.div`
  min-height: 5.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  flex-wrap: wrap;
  padding: 1rem 0;
`;

const Brand = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  color: inherit;
`;

const BrandMark = styled.div`
  width: 3rem;
  height: 3rem;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.35rem;
  padding: 0.4rem;
  border-radius: 0.95rem;
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.12), rgba(250, 204, 21, 0.2));
  box-shadow: 0 10px 30px rgba(37, 99, 235, 0.14);
`;

const BrandSquare = styled.span`
  display: grid;
  place-items: center;
  border-radius: 0.5rem;
  font-size: 0.6rem;
  font-weight: 700;

  ${({ $filled }) =>
    $filled
      ? css`
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: #ffffff;
        `
      : css`
          border: 1.5px solid #2563eb;
          color: #2563eb;
          background: rgba(255, 255, 255, 0.75);
        `}
`;

const BrandText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
`;

const BrandTitle = styled.span`
  font-size: 2rem;
  line-height: 1;
  font-weight: 800;
  letter-spacing: -0.04em;
  color: #1e293b;
`;

const BrandAccent = styled.span`
  color: #f59e0b;
`;

const BrandSubtitle = styled.span`
  font-size: 0.82rem;
  color: #64748b;
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 1.75rem;
  flex-wrap: wrap;
`;

const NavItem = styled(Link)`
  position: relative;
  font-size: 1rem;
  font-weight: 700;
  color: ${({ $active }) => ($active ? '#2563eb' : '#475569')};
  transition: color 0.2s ease;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: -0.45rem;
    width: 100%;
    height: 0.18rem;
    border-radius: 999px;
    background: linear-gradient(90deg, #2563eb, #60a5fa);
    transform: scaleX(${({ $active }) => ($active ? 1 : 0)});
    transform-origin: center;
    transition: transform 0.2s ease;
  }

  &:hover {
    color: #2563eb;
  }

  &:hover::after {
    transform: scaleX(1);
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.9rem;
  flex-wrap: wrap;
`;

const UserPill = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.85rem 1.2rem;
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.09);
  color: #1d4ed8;
  font-weight: 700;
  box-shadow: inset 0 0 0 1px rgba(37, 99, 235, 0.08);
`;

const UserPillIcon = styled.span`
  width: 1.85rem;
  height: 1.85rem;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: rgba(37, 99, 235, 0.14);
  color: #1d4ed8;
`;

const HeaderLinkButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 3rem;
  padding: 0 1.35rem;
  border-radius: 999px;
  font-weight: 700;
  color: ${({ $tone }) => ($tone === 'primary' ? '#ffffff' : '#2563eb')};
  background: ${({ $tone }) =>
    $tone === 'primary'
      ? 'linear-gradient(135deg, #2563eb, #1d4ed8)'
      : 'rgba(255, 255, 255, 0.96)'};
  box-shadow: ${({ $tone }) =>
    $tone === 'primary'
      ? '0 16px 34px rgba(37, 99, 235, 0.22)'
      : '0 16px 34px rgba(15, 23, 42, 0.08)'};
  border: 1px solid ${({ $tone }) => ($tone === 'primary' ? 'transparent' : 'rgba(37, 99, 235, 0.18)')};
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: ${({ $tone }) =>
      $tone === 'primary'
        ? '0 18px 38px rgba(37, 99, 235, 0.28)'
        : '0 18px 38px rgba(15, 23, 42, 0.12)'};
  }
`;

const LogoutButton = styled(Button)`
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: #ffffff;
  box-shadow: 0 16px 34px rgba(245, 158, 11, 0.28);

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #f59e0b, #d97706);
    box-shadow: 0 18px 38px rgba(217, 119, 6, 0.32);
  }
`;

const Main = styled.main`
  padding: 2.75rem 0 4.5rem;
`;

const HeroSection = styled.section`
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(20rem, 0.95fr);
  gap: 2.5rem;
  align-items: center;
  padding: 1.5rem 0 3rem;

  @media (max-width: 1040px) {
    grid-template-columns: 1fr;
  }
`;

const HeroColumn = styled.div`
  position: relative;
`;

const Eyebrow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.8rem 1.2rem;
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.1);
  color: #2563eb;
  font-weight: 700;
  margin-bottom: 1.35rem;
`;

const EyebrowIcon = styled.span`
  width: 2rem;
  height: 2rem;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: rgba(37, 99, 235, 0.14);
`;

const HeroTitle = styled.h1`
  font-size: clamp(2.9rem, 6vw, 5.3rem);
  line-height: 0.96;
  letter-spacing: -0.06em;
  color: #1e293b;
  margin-bottom: 1.35rem;
`;

const HeroHighlight = styled.span`
  color: #f59e0b;
`;

const HeroDescription = styled.p`
  max-width: 38rem;
  font-size: 1.2rem;
  line-height: 1.75;
  color: #64748b;
`;

const HeroActionRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 2rem;
  margin-bottom: 2rem;
`;

const PrimaryHeroButton = styled(Button)`
  min-width: 15rem;
  border-radius: 999px;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  box-shadow: 0 20px 40px rgba(37, 99, 235, 0.22);
`;

const SecondaryHeroButton = styled(Button)`
  min-width: 15rem;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.32);
  background: rgba(255, 255, 255, 0.9);
  color: #334155;
  box-shadow: 0 16px 34px rgba(15, 23, 42, 0.08);

  &:hover:not(:disabled) {
    background: #ffffff;
    color: #2563eb;
    border-color: rgba(37, 99, 235, 0.25);
  }
`;

const WelcomePanel = styled(Card)`
  border-radius: 2rem;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 30px 60px rgba(15, 23, 42, 0.12);
  border: 1px solid rgba(226, 232, 240, 0.85);
  backdrop-filter: blur(18px);
`;

const WelcomePanelBody = styled(CardContent)`
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(14rem, 0.8fr);
  gap: 1.5rem;
  padding: 2rem;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

const WelcomeTitle = styled.h2`
  font-size: 1.9rem;
  line-height: 1.2;
  letter-spacing: -0.04em;
  color: #1e293b;
  margin-bottom: 0.7rem;
`;

const WelcomeCopy = styled.p`
  color: #64748b;
  line-height: 1.7;
  max-width: 32rem;
`;

const WelcomeLinkRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1.35rem;
`;

const UtilityButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  border: none;
  background: transparent;
  color: #2563eb;
  font-weight: 700;
  cursor: pointer;
  padding: 0;

  &:hover {
    color: #1d4ed8;
  }
`;

const WelcomeStats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;

  @media (max-width: 760px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  padding: 1rem;
  border-radius: 1.35rem;
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.92), rgba(241, 245, 249, 0.85));
  border: 1px solid rgba(226, 232, 240, 0.9);
`;

const StatValue = styled.div`
  font-size: 1.65rem;
  font-weight: 800;
  color: #2563eb;
  letter-spacing: -0.04em;
`;

const StatLabel = styled.div`
  font-size: 0.88rem;
  color: #64748b;
  margin-top: 0.15rem;
`;

const VisualPanel = styled.div`
  position: relative;
  min-height: 34rem;

  @media (max-width: 1040px) {
    min-height: 29rem;
  }

  @media (max-width: 640px) {
    min-height: 24rem;
  }
`;

const VisualBubble = styled.div`
  position: absolute;
  border-radius: 999px;
  pointer-events: none;
  background: rgba(37, 99, 235, 0.08);

  &:first-of-type {
    width: 14rem;
    height: 14rem;
    top: 1rem;
    right: 0;
  }

  &:last-of-type {
    width: 17rem;
    height: 17rem;
    right: 4rem;
    bottom: 0;
    background: rgba(59, 130, 246, 0.12);
  }
`;

const MainVisual = styled.div`
  position: absolute;
  right: 4.5rem;
  top: 8.5rem;
  width: min(21rem, 62vw);
  aspect-ratio: 1;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: linear-gradient(145deg, #2563eb, #1d4ed8);
  box-shadow: 0 40px 70px rgba(37, 99, 235, 0.28);
  animation: ${pulse} 4.4s ease-in-out infinite;

  @media (max-width: 1280px) {
    right: 2rem;
  }

  @media (max-width: 640px) {
    right: 1rem;
    top: 6.75rem;
  }
`;

const MainVisualRing = styled.div`
  position: absolute;
  inset: -1rem;
  border-radius: 50%;
  border: 1px solid rgba(37, 99, 235, 0.16);
`;

const MainVisualIcon = styled(HiOutlineAcademicCap)`
  font-size: 6rem;
  color: #ffffff;

  @media (max-width: 640px) {
    font-size: 4.8rem;
  }
`;

const FloatingEventCard = styled(Card)`
  position: absolute;
  width: min(16rem, 70%);
  border-radius: 1.5rem;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(226, 232, 240, 0.9);
  box-shadow: 0 24px 48px rgba(15, 23, 42, 0.1);
  animation: ${float} 5.5s ease-in-out infinite;

  ${({ $position }) =>
    $position === 'top'
      ? css`
          top: 0;
          left: 2rem;
        `
      : $position === 'middle'
      ? css`
          top: 9.5rem;
          right: 0;
          animation-delay: 0.8s;
        `
      : css`
          bottom: 1.25rem;
          left: 5rem;
          animation-delay: 1.6s;
        `}

  @media (max-width: 640px) {
    width: min(13rem, 76%);

    ${({ $position }) =>
      $position === 'top'
        ? css`
            left: 0;
          `
        : $position === 'middle'
        ? css`
            top: 8.5rem;
          `
        : css`
            left: 1rem;
            bottom: 0;
          `}
  }
`;

const FloatingEventBody = styled(CardContent)`
  display: flex;
  align-items: center;
  gap: 0.95rem;
  padding: 1.15rem 1.25rem;
`;

const FloatingIcon = styled.div`
  width: 3rem;
  height: 3rem;
  border-radius: 1rem;
  display: grid;
  place-items: center;
  font-size: 1.3rem;
  color: #4f46e5;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.14), rgba(59, 130, 246, 0.14));
`;

const FloatingTitle = styled.p`
  font-size: 1.45rem;
  font-weight: 700;
  line-height: 1.1;
  color: #1e293b;
`;

const FloatingSubtitle = styled.p`
  font-size: 0.95rem;
  color: #64748b;
  margin-top: 0.2rem;
`;

const Section = styled.section`
  padding-top: 1rem;
`;

const SectionHeader = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  line-height: 1.1;
  letter-spacing: -0.04em;
  color: #1e293b;
`;

const SectionCopy = styled.p`
  max-width: 34rem;
  color: #64748b;
  line-height: 1.7;
`;

const ActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.4rem;

  @media (max-width: 1040px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const ActionCardLink = styled(Link)`
  color: inherit;
`;

const ActionCard = styled(Card)`
  height: 100%;
  border-radius: 1.7rem;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(226, 232, 240, 0.92);
  box-shadow: 0 24px 44px rgba(15, 23, 42, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;

  &:hover {
    transform: translateY(-8px);
    border-color: rgba(37, 99, 235, 0.28);
    box-shadow: 0 28px 52px rgba(37, 99, 235, 0.14);
  }
`;

const ActionCardBody = styled(CardContent)`
  padding: 1.8rem;
`;

const ActionIcon = styled.div`
  width: 3.6rem;
  height: 3.6rem;
  border-radius: 1.15rem;
  display: grid;
  place-items: center;
  font-size: 1.45rem;
  margin-bottom: 1.35rem;

  ${({ $tone }) =>
    $tone === 'green'
      ? css`
          color: #16a34a;
          background: rgba(34, 197, 94, 0.14);
        `
      : $tone === 'purple'
      ? css`
          color: #7c3aed;
          background: rgba(124, 58, 237, 0.14);
        `
      : css`
          color: #2563eb;
          background: rgba(37, 99, 235, 0.14);
        `}
`;

const ActionTitle = styled(CardTitle)`
  font-size: 2rem;
  line-height: 1.1;
  letter-spacing: -0.04em;
  margin-bottom: 0.8rem;
`;

const ActionDescription = styled.p`
  color: #64748b;
  line-height: 1.75;
`;

const ActionMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const MetaBullet = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  color: #64748b;
  font-size: 0.92rem;

  &::before {
    content: '';
    width: 0.6rem;
    height: 0.6rem;
    border-radius: 50%;
    background: #2563eb;
  }
`;

const OpenHint = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: #2563eb;
  font-weight: 700;
`;

const SupportStrip = styled(Card)`
  margin-top: 1.75rem;
  border-radius: 1.7rem;
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(255, 255, 255, 0.92));
  border: 1px solid rgba(37, 99, 235, 0.12);
  box-shadow: 0 24px 44px rgba(15, 23, 42, 0.08);
`;

const SupportContent = styled(CardContent)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  padding: 1.5rem 1.75rem;
`;

const SupportText = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
`;

const SupportBadge = styled.div`
  width: 3rem;
  height: 3rem;
  border-radius: 1rem;
  display: grid;
  place-items: center;
  background: rgba(37, 99, 235, 0.12);
  color: #2563eb;
  font-size: 1.2rem;
`;

const SupportTitle = styled.h3`
  font-size: 1.15rem;
  color: #1e293b;
  margin-bottom: 0.25rem;
`;

const SupportDescription = styled.p`
  color: #64748b;
  line-height: 1.65;
`;

const SupportButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  flex-wrap: wrap;
`;

const SupportButton = styled(Button)`
  border-radius: 999px;
`;

function getDisplayName(user) {
  const candidate = user?.name?.trim() || user?.email?.split('@')[0];
  return candidate || 'Student';
}

export default function Home() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const displayName = getDisplayName(user);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handlePublicHomeRedirect = () => {
    navigate('/');
  };

  return (
    <PageShell>
      <BackgroundHalo $variant="blue" />
      <BackgroundHalo $variant="gold" />

      <Header>
        <PageContainer>
          <HeaderInner>
            <Brand to="/home">
              <BrandMark aria-hidden="true">
                <BrandSquare>F</BrandSquare>
                <BrandSquare $filled>I</BrandSquare>
                <BrandSquare $filled>P</BrandSquare>
                <BrandSquare>U</BrandSquare>
              </BrandMark>
              <BrandText>
                <BrandTitle>
                  Uni<BrandAccent>Connect</BrandAccent>
                </BrandTitle>
                <BrandSubtitle>Student home dashboard</BrandSubtitle>
              </BrandText>
            </Brand>

            <Nav aria-label="Student navigation">
              <NavItem to="/home" $active>
                Home
              </NavItem>
              <NavItem to="/my-feedbacks">Feedbacks</NavItem>
              <NavItem to="/my-inquiries">Inquiries</NavItem>
              <NavItem to="/profile">Profile</NavItem>
            </Nav>

            <HeaderActions>
              <UserPill>
                <UserPillIcon>
                  <FiHome />
                </UserPillIcon>
                Student: {displayName}
              </UserPill>

              <HeaderLinkButton to="/#features">Events</HeaderLinkButton>
              <HeaderLinkButton to="/submit" $tone="primary">
                Create Society
              </HeaderLinkButton>

              <LogoutButton size="sm" onClick={handleLogout}>
                <FiLogOut style={{ marginRight: '0.4rem' }} />
                Log Out
              </LogoutButton>
            </HeaderActions>
          </HeaderInner>
        </PageContainer>
      </Header>

      <Main>
        <PageContainer>
          <HeroSection>
            <HeroColumn>
              <Eyebrow>
                <EyebrowIcon>
                  <HiOutlineAcademicCap />
                </EyebrowIcon>
                University Event and Club Management
              </Eyebrow>

              <HeroTitle>
                Connect. Create.
                <HeroHighlight> Celebrate.</HeroHighlight>
              </HeroTitle>

              <HeroDescription>
                Welcome back, {displayName}. Manage your feedbacks, inquiries, and profile from one polished
                student home while still keeping the Uni-Connect event and society flow close at hand.
              </HeroDescription>

              <HeroActionRow>
                <PrimaryHeroButton as={Link} to="/my-feedbacks">
                  My Feedbacks
                  <FiArrowRight style={{ marginLeft: '0.55rem' }} />
                </PrimaryHeroButton>

                <SecondaryHeroButton as={Link} to="/my-inquiries">
                  My Inquiries
                </SecondaryHeroButton>
              </HeroActionRow>

              <WelcomePanel>
                <WelcomePanelBody>
                  <div>
                    <WelcomeTitle>Welcome back, {displayName}.</WelcomeTitle>
                    <WelcomeCopy>
                      This is your active student dashboard. Jump straight into your current services, review your
                      account settings, or switch to another account when needed.
                    </WelcomeCopy>

                    <WelcomeLinkRow>
                      <UtilityButton type="button" onClick={() => navigate('/profile')}>
                        <FiUser />
                        My Profile
                      </UtilityButton>
                      <UtilityButton type="button" onClick={handlePublicHomeRedirect}>
                        <FiHome />
                        Public Home
                      </UtilityButton>
                    </WelcomeLinkRow>
                  </div>

                  <WelcomeStats>
                    <StatCard>
                      <StatValue>{dashboardCards.length}</StatValue>
                      <StatLabel>Active services</StatLabel>
                    </StatCard>
                    <StatCard>
                      <StatValue>24/7</StatValue>
                      <StatLabel>Support available</StatLabel>
                    </StatCard>
                    <StatCard>
                      <StatValue>1</StatValue>
                      <StatLabel>Student hub</StatLabel>
                    </StatCard>
                  </WelcomeStats>
                </WelcomePanelBody>
              </WelcomePanel>
            </HeroColumn>

            <HeroColumn>
              <VisualPanel aria-hidden="true">
                <VisualBubble />

                {featuredEvents.map(({ icon: Icon, title, subtitle, $position }) => (
                  <FloatingEventCard key={title} $position={$position}>
                    <FloatingEventBody>
                      <FloatingIcon>
                        <Icon />
                      </FloatingIcon>
                      <div>
                        <FloatingTitle>{title}</FloatingTitle>
                        <FloatingSubtitle>{subtitle}</FloatingSubtitle>
                      </div>
                    </FloatingEventBody>
                  </FloatingEventCard>
                ))}

                <MainVisual>
                  <MainVisualRing />
                  <MainVisualIcon />
                </MainVisual>

                <VisualBubble />
              </VisualPanel>
            </HeroColumn>
          </HeroSection>

          <Section>
            <SectionHeader>
              <div>
                <SectionTitle>Quick Actions</SectionTitle>
                <SectionCopy>
                  Your existing student tools are still here. They are now surfaced inside the refreshed Vite home
                  design instead of a separate duplicate page.
                </SectionCopy>
              </div>
            </SectionHeader>

            <ActionsGrid>
              {dashboardCards.map(({ title, description, detail, route, icon: Icon, tone }) => (
                <ActionCardLink key={title} to={route}>
                  <ActionCard>
                    <ActionCardBody>
                      <ActionIcon $tone={tone}>
                        <Icon />
                      </ActionIcon>
                      <ActionTitle>{title}</ActionTitle>
                      <ActionDescription>{description}</ActionDescription>
                      <ActionMeta>
                        <MetaBullet>{detail}</MetaBullet>
                        <OpenHint>
                          Open
                          <FiArrowRight />
                        </OpenHint>
                      </ActionMeta>
                    </ActionCardBody>
                  </ActionCard>
                </ActionCardLink>
              ))}
            </ActionsGrid>

            <SupportStrip>
              <SupportContent>
                <SupportText>
                  <SupportBadge>
                    <FiTrendingUp />
                  </SupportBadge>
                  <div>
                    <SupportTitle>Need more than dashboard tools?</SupportTitle>
                    <SupportDescription>
                      Explore the public event management features or continue into the society creation flow that is
                      already wired in this codebase.
                    </SupportDescription>
                  </div>
                </SupportText>

                <SupportButtons>
                  <SupportButton as={Link} to="/#features" variant="outline">
                    <FiCalendar style={{ marginRight: '0.45rem' }} />
                    Events
                  </SupportButton>
                  <SupportButton as={Link} to="/submit">
                    <FiPlusCircle style={{ marginRight: '0.45rem' }} />
                    Create Society
                  </SupportButton>
                  <SupportButton as={Link} to="/profile" variant="secondary">
                    <FiCheckCircle style={{ marginRight: '0.45rem' }} />
                    My Profile
                  </SupportButton>
                  <SupportButton variant="outline" onClick={handlePublicHomeRedirect}>
                    <FiHome style={{ marginRight: '0.45rem' }} />
                    Public Home
                  </SupportButton>
                </SupportButtons>
              </SupportContent>
            </SupportStrip>
          </Section>
        </PageContainer>
      </Main>
    </PageShell>
  );
}
