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
          Icon: AlertTriangle
        };
      case 'danger':
        return {
          bg: 'var(--status-danger-bg)',
          border: 'var(--status-danger-border)',
          text: 'var(--status-danger-text)',
          Icon: AlertOctagon
        };
      case 'success':
        return {
          bg: 'var(--status-success-bg)',
          border: 'var(--status-success-border)',
          text: 'var(--status-success-text)',
          Icon: CheckCircle2
        };
      case 'info':
      default:
        return {
          bg: 'var(--bit-data-bg)',
          border: 'var(--bit-data-border)',
          text: 'var(--bit-data-text)',
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
        gap: '0.875rem',
        padding: '1rem 1.25rem',
        background: scheme.bg,
        border: `1px solid ${scheme.border}`,
        borderRadius: 'var(--radius-md)',
        color: scheme.text,
        fontSize: '0.9375rem',
        lineHeight: 1.5,
        ...style
      }}
    >
      <div style={{ flexShrink: 0, marginTop: '0.125rem' }}>
        <IconComponent size={20} strokeWidth={1.75} />
      </div>
      <div style={{ flex: 1 }}>
        {title && (
          <h4
            style={{
              fontSize: '0.9375rem',
              fontWeight: 600,
              color: scheme.text,
              marginBottom: '0.25rem'
            }}
          >
            {title}
          </h4>
        )}
        <div style={{ color: scheme.text, opacity: 0.95 }}>{children}</div>
      </div>
    </div>
  );
}
