import React from 'react';

export function Card({
  title,
  subtitle,
  action,
  children,
  className = '',
  style = {},
  headerClassName = '',
  bodyClassName = ''
}) {
  return (
    <div
      className={`card-container ${className}`}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-card)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden',
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
        ...style
      }}
    >
      {(title || subtitle || action) && (
        <div
          className={`card-header ${headerClassName}`}
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap'
          }}
        >
          <div>
            {title && (
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
                {title}
              </h3>
            )}
            {subtitle && (
              <p style={{ fontSize: '0.875rem', color: 'var(--text-subtle)', marginTop: '0.25rem', margin: 0 }}>
                {subtitle}
              </p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={`card-body ${bodyClassName}`} style={{ padding: '1.5rem' }}>
        {children}
      </div>
    </div>
  );
}
