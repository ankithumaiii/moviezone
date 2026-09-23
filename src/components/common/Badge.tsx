import React from 'react';

export type BadgeVariant = 'neutral' | 'accent' | 'ok' | 'slow' | 'beta' | 'danger';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  className = '',
  icon,
}) => {
  return (
    <span className={`badge badge-${variant} ${className}`}>
      {icon}
      {children}
    </span>
  );
};
