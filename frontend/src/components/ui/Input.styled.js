import styled from 'styled-components';

export const InputStyled = styled.input`
  display: flex;
  height: 3.25rem;
  width: 100%;
  border-radius: 0.75rem;
  border: 1.5px solid var(--border);
  background-color: var(--background);
  padding: 0.75rem 1.25rem;
  font-size: 1rem;
  color: var(--foreground);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &::placeholder {
    color: var(--muted-foreground);
  }

  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 4px var(--ring);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
    background-color: var(--muted);
  }
`;

export const FileInputStyled = styled.input`
  &::file-selector-button {
    border: 0;
    background: transparent;
    font-size: 0.875rem;
    font-weight: 500;
  }
`;
