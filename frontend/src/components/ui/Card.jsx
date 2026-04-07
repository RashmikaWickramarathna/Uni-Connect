import React from 'react';
import {
  CardStyled,
  CardHeaderStyled,
  CardTitleStyled,
  CardDescriptionStyled,
  CardContentStyled,
  CardFooterStyled,
} from './Card.styled';

export function Card({ className = '', children }) {
  return <CardStyled className={className}>{children}</CardStyled>;
}

export function CardHeader({ className = '', children }) {
  return <CardHeaderStyled className={className}>{children}</CardHeaderStyled>;
}

export function CardTitle({ className = '', children }) {
  return <CardTitleStyled className={className}>{children}</CardTitleStyled>;
}

export function CardDescription({ className = '', children }) {
  return <CardDescriptionStyled className={className}>{children}</CardDescriptionStyled>;
}

export function CardContent({ className = '', children }) {
  return <CardContentStyled className={className}>{children}</CardContentStyled>;
}

export function CardFooter({ className = '', children }) {
  return <CardFooterStyled className={className}>{children}</CardFooterStyled>;
}