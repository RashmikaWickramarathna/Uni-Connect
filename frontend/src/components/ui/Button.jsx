import React from 'react';
import { Button as StyledButton } from './Button.styled';

export function Button({
  children,
  variant = 'default',
  size = 'default',
  className = '',
  fullWidth = false,
  ...props
}) {
  return (
    <StyledButton
      $variant={variant}
      $size={size}
      $fullWidth={fullWidth}
      className={className}
      {...props}
    >
      {children}
    </StyledButton>
  );
}
