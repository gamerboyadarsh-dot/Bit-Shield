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
          text: 'var(--bit-data-text)',
          glow: 'var(--bit-data-glow)'
        };
      case 'parity':
        return {
          bg: 'var(--bit-parity-bg)',
          border: 'var(--bit-parity-border)',
          text: 'var(--bit-parity-text)',
          glow: 'var(--bit-parity-glow)'
        };
      case 'success':
        return {
          bg: 'var(--status-success-bg)',
          border: 'var(--status-success-border)',
          text: 'var(--status-success-text)',
          glow: '0 0 14px rgba(52, 211, 153, 0.25)'
        };
      case 'warning':
        return {
          bg: 'var(--status-warning-bg)',
          border: 'var(--status-warning-border)',
          text: 'var(--status-warning-text)',
          glow: '0 0 14px rgba(251, 191, 36, 0.25)'
        };
      case 'danger':
        return {
          bg: 'var(--status-danger-bg)',
          border: 'var(--status-danger-border)',
          text: 'var(--status-danger-text)',
          glow: '0 0 14px rgba(251, 113, 133, 0.3)'
        };
      case 'neutral':
      default:
        return {
          bg: 'var(--bg-card-subtle)',
          border: 'var(--border-subtle)',
          text: 'var(--text-muted)',
          glow: 'none'
        };
    }
  };

  const scheme = getColors();

  const sizeStyles = {
    sm: { padding: '0.15rem 0.55rem', fontSize: '0.72rem' },
    md: { padding: '0.25rem 0.75rem', fontSize: '0.8125rem' },
    lg: { padding: '0.35rem 0.95rem', fontSize: '0.9rem' }
  }[size] || { padding: '0.25rem 0.75rem', fontSize: '0.8125rem' };

  return (
    <span
      className={`badge badge-${variant} ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.375rem',
        borderRadius: 'var(--radius-full)',
        background: scheme.bg,
        border: `1px solid ${scheme.border}`,
        color: scheme.text,
        boxShadow: scheme.glow !== 'none' ? scheme.glow : 'none',
        fontFamily: 'var(--font-sans)',
        fontWeight: 650,
        letterSpacing: '0.01em',
        lineHeight: 1.3,
        whiteSpace: 'nowrap',
        backdropFilter: 'blur(8px)',
        ...sizeStyles,
        ...style
      }}
    >
      {children}
    </span>
  );
}

export default Badge;
