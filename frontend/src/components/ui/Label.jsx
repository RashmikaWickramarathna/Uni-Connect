import React from 'react';
import { LabelStyled, TextareaStyled } from './Label.styled';

export function Label({ className = '', children, ...props }) {
  return (
    <LabelStyled className={className} {...props}>
      {children}
    </LabelStyled>
  );
}

export function Textarea({ className = '', ...props }) {
  return <TextareaStyled className={className} {...props} />;
}