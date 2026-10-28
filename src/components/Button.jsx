import React from 'react';

export function Button({
  children,
  onClick,
  variant = 'primary', // 'primary' | 'secondary' | 'ghost' | 'danger'
  size = 'md',        // 'sm' | 'md' | 'lg'
  disabled = false,
  icon: Icon = null,
  iconPosition = 'left',
  type = 'button',
  className = '',
  style = {},
  ariaLabel
}) {
  const getStyles = () => {
    const base = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      fontFamily: 'var(--font-sans)',
      fontWeight: 500,
      borderRadius: 'var(--radius-md)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      transition: 'all 0.15s ease',
      border: '1px solid transparent',
      textDecoration: 'none',
      whiteSpace: 'nowrap'
    };

    const sizeStyles = {
      sm: { padding: '0.375rem 0.75rem', fontSize: '0.875rem' },
      md: { padding: '0.5rem 1rem', fontSize: '0.9375rem' },
      lg: { padding: '0.75rem 1.5rem', fontSize: '1rem' }
    }[size];

    const variantStyles = {
      primary: {
        background: 'var(--accent)',
        color: 'var(--accent-fg)',
        borderColor: 'var(--accent)'
      },
      secondary: {
        background: 'var(--bg-card)',
        color: 'var(--text-main)',
        borderColor: 'var(--border-card)'
      },
      ghost: {
        background: 'transparent',
        color: 'var(--text-muted)',
        borderColor: 'transparent'
      },
      danger: {
        background: 'var(--status-danger-bg)',
        color: 'var(--status-danger-text)',
        borderColor: 'var(--status-danger-border)'
      }
    }[variant];

    return { ...base, ...sizeStyles, ...variantStyles, ...style };
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant} ${className}`}
      style={getStyles()}
      aria-label={ariaLabel}
    >
      {Icon && iconPosition === 'left' && <Icon size={size === 'sm' ? 14 : 16} strokeWidth={1.75} />}
      {children}
      {Icon && iconPosition === 'right' && <Icon size={size === 'sm' ? 14 : 16} strokeWidth={1.75} />}
    </button>
  );
}
