import React from 'react';
import { Info, AlertTriangle, AlertOctagon, CheckCircle2 } from 'lucide-react';

export function Callout({
  type = 'info', // 'info' | 'warning' | 'danger' | 'success'
  title,
  children,
  icon: CustomIcon,
  className = '',
  style = {}
}) {
  const getScheme = () => {
    switch (type) {
      case 'warning':
        return {
          bg: 'var(--status-warning-bg)',
          border: 'var(--status-warning-border)',
          text: 'var(--status-warning-text)',
          glow: '0 0 20px rgba(251, 191, 36, 0.15)',
          Icon: AlertTriangle
        };
      case 'danger':
        return {
          bg: 'var(--status-danger-bg)',
          border: 'var(--status-danger-border)',
          text: 'var(--status-danger-text)',
          glow: '0 0 20px rgba(251, 113, 133, 0.15)',
          Icon: AlertOctagon
        };
      case 'success':
        return {
          bg: 'var(--status-success-bg)',
          border: 'var(--status-success-border)',
          text: 'var(--status-success-text)',
          glow: '0 0 20px rgba(52, 211, 153, 0.15)',
          Icon: CheckCircle2
        };
      case 'info':
      default:
        return {
          bg: 'var(--bit-data-bg)',
          border: 'var(--bit-data-border)',
          text: 'var(--bit-data-text)',
          glow: '0 0 20px rgba(96, 165, 250, 0.15)',
          Icon: Info
        };
    }
  };

  const scheme = getScheme();
  const IconComponent = CustomIcon || scheme.Icon;

  return (
    <div
      role="alert"
      className={`callout callout-${type} ${className}`}
      style={{
        display: 'flex',
        gap: '1rem',
        padding: '1.15rem 1.4rem',
        background: scheme.bg,
        border: `1px solid ${scheme.border}`,
        borderLeft: `4px solid ${scheme.border}`,
        borderRadius: 'var(--radius-md)',
        color: scheme.text,
        fontSize: '0.9375rem',
        lineHeight: 1.55,
        boxShadow: scheme.glow,
        backdropFilter: 'blur(12px)',
        position: 'relative',
        ...style
      }}
    >
      <div style={{ flexShrink: 0, marginTop: '0.125rem', color: scheme.border }}>
        <IconComponent size={20} strokeWidth={2} />
      </div>
      <div style={{ flex: 1 }}>
        {title && (
          <h4
            style={{
              fontSize: '0.95rem',
              fontWeight: 700,
              color: scheme.text,
              letterSpacing: '-0.01em',
              marginBottom: '0.35rem'
            }}
          >
            {title}
          </h4>
        )}
        <div style={{ color: scheme.text, opacity: 0.95, fontSize: '0.9rem' }}>{children}</div>
      </div>
    </div>
  );
}

export default Callout;
