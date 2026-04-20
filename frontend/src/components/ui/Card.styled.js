import styled from 'styled-components';

export const CardStyled = styled.div`
  border-radius: var(--radius);
  border: none;
  background-color: var(--card);
  color: var(--card-foreground);
  box-shadow: var(--shadow);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  overflow: hidden;
`;

export const CardHeaderStyled = styled.div`
  display: flex;
  flex-direction: column;
  padding: 2rem;
  padding-bottom: 0.5rem;
`;

export const CardTitleStyled = styled.h3`
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.025em;
  margin-bottom: 0.5rem;
`;

export const CardDescriptionStyled = styled.p`
  font-size: 0.95rem;
  color: var(--muted-foreground);
`;

export const CardContentStyled = styled.div`
  padding: 2rem;
  padding-top: 1rem;
`;

export const CardFooterStyled = styled.div`
  display: flex;
  align-items: center;
  padding: 2rem;
  padding-top: 0;
`;
