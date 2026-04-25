import styled from 'styled-components';

export const LabelStyled = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1;
  color: var(--foreground);
`;

export const TextareaStyled = styled.textarea`
  display: flex;
  min-height: 5rem;
  width: 100%;
  border-radius: 0.5rem;
  border: 1px solid var(--input);
  background-color: var(--background);
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  color: var(--foreground);
  font-family: inherit;

  &::placeholder {
    color: var(--muted-foreground);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px var(--ring);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;