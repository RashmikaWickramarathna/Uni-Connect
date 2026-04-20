import React from 'react';
import { InputStyled } from './Input.styled';

export function Input({ className = '', ...props }) {
  return <InputStyled className={className} {...props} />;
}
