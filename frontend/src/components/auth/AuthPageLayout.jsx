import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiCheck } from 'react-icons/fi';
import styled from 'styled-components';

import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';

const DEFAULT_BACKGROUND =
  "url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2370&auto=format&fit=crop')";

const PageWrapper = styled.div`
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background:
    linear-gradient(115deg, rgba(13, 110, 253, 0.88), rgba(96, 165, 250, 0.78)),
    ${({ $backgroundImage }) => $backgroundImage || DEFAULT_BACKGROUND};
  background-size: cover;
  background-position: center;
`;

const Glow = styled.div`
  position: absolute;
  border-radius: 999px;
  filter: blur(2px);
  pointer-events: none;
  background: rgba(255, 255, 255, 0.12);

  ${({ $variant }) =>
    $variant === 'top'
      ? `
        width: 18rem;
        height: 18rem;
        top: -4rem;
        left: 18%;
      `
      : `
        width: 14rem;
        height: 14rem;
        right: 8%;
        bottom: 6%;
      `}
`;

const AuthShell = styled.div`
  position: relative;
  z-index: 1;
  width: min(1180px, 100%);
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(380px, 0.85fr);
  border-radius: 2rem;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 35px 90px rgba(31, 41, 55, 0.24);
  backdrop-filter: blur(14px);

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const ShowcasePanel = styled.section`
  position: relative;
  padding: 4.5rem 4rem;
  color: white;
  background:
    linear-gradient(140deg, rgba(13, 110, 253, 0.24), rgba(96, 165, 250, 0.18)),
    rgba(255, 255, 255, 0.06);

  @media (max-width: 980px) {
    padding: 3rem 2rem 2.25rem;
  }
`;

const VerticalDivider = styled.div`
  position: absolute;
  top: 10%;
  right: 0;
  width: 1px;
  height: 80%;
  background: rgba(255, 255, 255, 0.18);

  @media (max-width: 980px) {
    display: none;
  }
`;

const HomeLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  color: rgba(255, 255, 255, 0.88);
  font-weight: 600;
  margin-bottom: 2rem;

  &:hover {
    color: white;
  }
`;

const BrandTag = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.7rem 1rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  color: white;
  font-size: 0.95rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
`;

const BrandDot = styled.span`
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 999px;
  background: #60a5fa;
  box-shadow: 0 0 0 6px rgba(96, 165, 250, 0.18);
`;

const ShowcaseTitle = styled.h1`
  font-size: clamp(3rem, 6vw, 5rem);
  line-height: 1.02;
  font-weight: 800;
  letter-spacing: -0.05em;
  margin-bottom: 1.25rem;
`;

const ShowcaseAccent = styled.span`
  display: block;
  color: #dbeafe;
`;

const ShowcaseText = styled.p`
  max-width: 34rem;
  font-size: 1.3rem;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 2.25rem;
`;

const FeatureList = styled.div`
  display: grid;
  gap: 1rem;
`;

const FeatureItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1.1rem;
  padding: 1.3rem 1.5rem;
  border-radius: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
`;

const FeatureIcon = styled.div`
  width: 4.3rem;
  height: 4.3rem;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: linear-gradient(135deg, #60a5fa, #0d6efd);
  box-shadow: 0 12px 30px rgba(13, 110, 253, 0.28);
  font-size: 1.5rem;
`;

const FeatureText = styled.p`
  font-size: 1.15rem;
  line-height: 1.6;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
`;

const FormPanel = styled.section`
  padding: 3rem 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.18);

  @media (max-width: 980px) {
    padding-top: 0;
    padding-bottom: 2.5rem;
  }
`;

const FormCard = styled(Card)`
  width: min(100%, 33rem);
  border-radius: 1.9rem;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 28px 80px rgba(30, 41, 59, 0.16);
`;

const FormBody = styled(CardContent)`
  padding: 3rem 2.5rem;

  @media (max-width: 540px) {
    padding: 2.2rem 1.5rem;
  }
`;

const FormTag = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.9rem;
  border-radius: 999px;
  background: rgba(13, 110, 253, 0.1);
  color: #0d6efd;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  margin-bottom: 1rem;
`;

const FormTitle = styled.h2`
  font-size: clamp(2.3rem, 4vw, 3.2rem);
  line-height: 1.04;
  letter-spacing: -0.05em;
  color: #1f2a44;
  margin-bottom: 0.9rem;
`;

const FormSubtitle = styled.p`
  color: #64748b;
  font-size: 1.03rem;
  line-height: 1.7;
  margin-bottom: 1.75rem;
`;

export const AuthAlert = styled.div`
  padding: 0.9rem 1rem;
  font-size: 0.92rem;
  border-radius: 0.9rem;
  margin-bottom: 1rem;
  ${({ $variant }) =>
    $variant === 'error'
      ? `
        color: #b91c1c;
        background: rgba(254, 226, 226, 0.92);
        border: 1px solid rgba(248, 113, 113, 0.35);
      `
      : `
        color: #166534;
        background: rgba(220, 252, 231, 0.92);
        border: 1px solid rgba(74, 222, 128, 0.35);
      `}
`;

export const AuthForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const AuthInputBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
`;

export const AuthInputGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

export const AuthLabel = styled(Label)`
  font-size: 0.96rem;
  font-weight: 700;
  color: #334155;
`;

export const AuthInputFrame = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0 1rem;
  border-radius: 1rem;
  border: 1px solid #cbd5e1;
  background: #eef4ff;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;

  &:focus-within {
    background: white;
    border-color: #0d6efd;
    box-shadow: 0 0 0 4px rgba(13, 110, 253, 0.12);
  }
`;

export const AuthInputIcon = styled.span`
  display: inline-flex;
  color: #0d6efd;
  font-size: 1rem;
`;

export const AuthInput = styled(Input)`
  border: none;
  background: transparent;
  box-shadow: none;
  padding-left: 0;
  padding-right: 0;

  &:focus {
    border: none;
    box-shadow: none;
    outline: none;
  }
`;

export const AuthPrimaryButton = styled(Button)`
  margin-top: 0.65rem;
  height: 3.6rem;
  border-radius: 1.2rem;
  font-size: 1.05rem;
  background: linear-gradient(135deg, #0d6efd, #0b5ed7);
  box-shadow: 0 18px 30px rgba(13, 110, 253, 0.26);

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #0b5ed7, #0a58ca);
    box-shadow: 0 20px 34px rgba(13, 110, 253, 0.28);
  }
`;

export const AuthSecondaryButton = styled(Button).attrs({ variant: 'outline' })`
  height: 3.35rem;
  border-radius: 1.1rem;
  border-color: rgba(13, 110, 253, 0.24);
  color: #0d6efd;
  background: rgba(239, 246, 255, 0.95);

  &:hover:not(:disabled) {
    background: #dbeafe;
    border-color: rgba(13, 110, 253, 0.44);
    color: #0b5ed7;
  }
`;

export const AuthDivider = styled.div`
  height: 1px;
  background: linear-gradient(90deg, rgba(148, 163, 184, 0), rgba(148, 163, 184, 0.7), rgba(148, 163, 184, 0));
  margin: 1.6rem 0 1.35rem;
`;

export const AuthLinkRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
`;

export const AuthUtilityLink = styled(Link)`
  color: #0d6efd;
  font-weight: 600;

  &:hover {
    text-decoration: underline;
  }
`;

export const AuthHelperNote = styled.p`
  margin-top: 1.35rem;
  font-size: 0.9rem;
  line-height: 1.6;
  color: #64748b;
`;

export function AuthPageLayout({
  brandTag,
  showcaseTitle,
  showcaseAccent,
  showcaseText,
  featurePoints,
  formTag,
  formTitle,
  formSubtitle,
  footer,
  children,
  backgroundImage,
}) {
  return (
    <PageWrapper $backgroundImage={backgroundImage}>
      <Glow $variant="top" />
      <Glow $variant="bottom" />

      <AuthShell>
        <ShowcasePanel>
          <VerticalDivider />
          <HomeLink to="/">
            <FiArrowLeft />
            Back to Uni-Connect
          </HomeLink>

          <BrandTag>
            <BrandDot />
            {brandTag}
          </BrandTag>

          <ShowcaseTitle>
            {showcaseTitle}
            <ShowcaseAccent>{showcaseAccent}</ShowcaseAccent>
          </ShowcaseTitle>

          <ShowcaseText>{showcaseText}</ShowcaseText>

          <FeatureList>
            {featurePoints.map((point) => (
              <FeatureItem key={point}>
                <FeatureIcon>
                  <FiCheck />
                </FeatureIcon>
                <FeatureText>{point}</FeatureText>
              </FeatureItem>
            ))}
          </FeatureList>
        </ShowcasePanel>

        <FormPanel>
          <FormCard>
            <FormBody>
              <FormTag>{formTag}</FormTag>
              <FormTitle>{formTitle}</FormTitle>
              <FormSubtitle>{formSubtitle}</FormSubtitle>

              {children}
              {footer}
            </FormBody>
          </FormCard>
        </FormPanel>
      </AuthShell>
    </PageWrapper>
  );
}

