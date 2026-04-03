import styled, { css } from 'styled-components';

const baseStyles = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  border: none;
  font-size: 1rem;

  &:disabled {
    pointer-events: none;
    opacity: 0.6;
  }
`;

const variants = {
  default: css`
    background-color: var(--primary);
    color: var(--primary-foreground);
    box-shadow: 0 4px 14px 0 rgba(37, 99, 235, 0.39);
    &:hover:not(:disabled) {
      background-color: #1d4ed8;
      box-shadow: 0 6px 20px rgba(37, 99, 235, 0.23);
      transform: translateY(-1px);
    }
  `,
  destructive: css`
    background-color: var(--destructive);
    color: var(--destructive-foreground);
    box-shadow: 0 4px 14px 0 rgba(239, 68, 68, 0.39);
    &:hover:not(:disabled) {
      background-color: #dc2626;
      box-shadow: 0 6px 20px rgba(239, 68, 68, 0.23);
      transform: translateY(-1px);
    }
  `,
  outline: css`
    border: 2px solid var(--input);
    background-color: transparent;
    color: var(--foreground);
    &:hover:not(:disabled) {
      background-color: var(--accent);
      border-color: var(--primary);
      color: var(--primary);
    }
  `,
  secondary: css`
    background-color: var(--secondary);
    color: var(--secondary-foreground);
    &:hover:not(:disabled) {
      background-color: #c7d2fe;
      transform: translateY(-1px);
    }
  `,
  ghost: css`
    background-color: transparent;
    color: var(--foreground);
    &:hover:not(:disabled) {
      background-color: var(--accent);
      color: var(--primary);
    }
  `,
  link: css`
    background-color: transparent;
    color: var(--primary);
    text-decoration: none;
    &:hover:not(:disabled) {
      color: #1e40af;
      text-decoration: underline;
    }
  `,
};

const sizes = {
  default: css`
    height: 3rem;
    padding: 0 1.5rem;
  `,
  sm: css`
    height: 2.5rem;
    padding: 0 1rem;
    font-size: 0.875rem;
  `,
  lg: css`
    height: 3.5rem;
    padding: 0 2.5rem;
    font-size: 1.125rem;
  `,
  icon: css`
    height: 3rem;
    width: 3rem;
  `,
};

export const Button = styled.button`
  ${baseStyles}
  ${({ $variant = 'default' }) => variants[$variant]}
  ${({ $size = 'default' }) => sizes[$size]}
  ${({ $fullWidth }) => $fullWidth && css`width: 100%;`}
`;

export const buttonVariants = (variant = 'default') => variants[variant];
export const buttonSizes = (size = 'default') => sizes[size];