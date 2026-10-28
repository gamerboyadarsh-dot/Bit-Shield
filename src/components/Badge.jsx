import React from 'react';

export function Badge({
  children,
  variant = 'neutral', // 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'parity' | 'data'
  size = 'md',
  className = '',
  style = {}
}) {
  const getColors = () => {
    switch (variant) {
      case 'info':
      case 'data':
        return {
          bg: 'var(--bit-data-bg)',
          border: 'var(--bit-data-border)',
          text: 'var(--bit-data-text)'
        };
      case 'parity':
        return {
          bg: 'var(--bit-parity-bg)',
          border: 'var(--bit-parity-border)',
          text: 'var(--bit-parity-text)'
        };
      case 'success':
        return {
          bg: 'var(--status-success-bg)',
          border: 'var(--status-success-border)',
          text: 'var(--status-success-text)'
        };
      case 'warning':
        return {
          bg: 'var(--status-warning-bg)',
          border: 'var(--status-warning-border)',
          text: 'var(--status-warning-text)'
        };
      case 'danger':
        return {
          bg: 'var(--status-danger-bg)',
          border: 'var(--status-danger-border)',
          text: 'var(--status-danger-text)'
        };
      case 'neutral':
      default:
        return {
          bg: 'var(--bg-card-subtle)',
          border: 'var(--border-card)',
          text: 'var(--text-muted)'
        };
    }
  };

  const colors = getColors();

  return (
    <span
      className={`badge badge-${variant} ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        padding: size === 'sm' ? '0.125rem 0.375rem' : '0.25rem 0.625rem',
        fontSize: size === 'sm' ? '0.75rem' : '0.8125rem',
        fontWeight: 600,
        borderRadius: 'var(--radius-sm)',
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        color: colors.text,
        letterSpacing: '0.02em',
        lineHeight: 1,
        whiteSpace: 'nowrap',
        ...style
      }}
    >
      {children}
    </span>
  );
}
