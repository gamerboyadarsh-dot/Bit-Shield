import React from 'react';
import { motion } from 'framer-motion';

export function Button({
  children,
  onClick,
  variant = 'primary', // 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
  size = 'md',        // 'sm' | 'md' | 'lg'
  disabled = false,
  icon: Icon = null,
  iconPosition = 'left',
  type = 'button',
  className = '',
  style = {},
  ariaLabel
}) {
  const sizeStyles = {
    sm: { padding: '0.4rem 0.85rem', fontSize: '0.8125rem', gap: '0.4rem' },
    md: { padding: '0.6rem 1.15rem', fontSize: '0.9375rem', gap: '0.5rem' },
    lg: { padding: '0.8rem 1.6rem', fontSize: '1.025rem', gap: '0.625rem' }
  }[size];

  const variantStyles = {
    primary: {
      background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
      color: '#ffffff',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 4px 18px -2px rgba(99, 102, 241, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.25)'
    },
    secondary: {
      background: 'var(--bg-card-subtle)',
      color: 'var(--text-main)',
      border: '1px solid var(--border-card)',
      backdropFilter: 'blur(12px)',
      boxShadow: 'var(--shadow-sm)'
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-muted)',
      border: '1px solid transparent'
    },
    danger: {
      background: 'var(--status-danger-bg)',
      color: 'var(--status-danger-text)',
      border: '1px solid var(--status-danger-border)',
      boxShadow: '0 4px 14px -2px rgba(244, 63, 94, 0.25)'
    },
    success: {
      background: 'var(--status-success-bg)',
      color: 'var(--status-success-text)',
      border: '1px solid var(--status-success-border)',
      boxShadow: '0 4px 14px -2px rgba(16, 185, 129, 0.25)'
    }
  }[variant];

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.02, y: -1 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`btn-glow ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-sans)',
        fontWeight: 600,
        letterSpacing: '-0.01em',
        borderRadius: 'var(--radius-md)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        whiteSpace: 'nowrap',
        outline: 'none',
        ...sizeStyles,
        ...variantStyles,
        ...style
      }}
      aria-label={ariaLabel}
    >
      {Icon && iconPosition === 'left' && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} strokeWidth={1.8} />}
      <span>{children}</span>
      {Icon && iconPosition === 'right' && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} strokeWidth={1.8} />}
    </motion.button>
  );
}

export default Button;
