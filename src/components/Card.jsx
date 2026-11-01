import React from 'react';
import { motion } from 'framer-motion';

export function Card({
  title,
  subtitle,
  action,
  children,
  className = '',
  style = {},
  headerClassName = '',
  bodyClassName = '',
  hoverEffect = false,
  level = 1, // 1 | 2
  halo = false
}) {
  const levelClass = level === 2 ? 'glass-l2' : 'glass-l1';
  const hoverClass = hoverEffect && level === 1 ? 'glass-l1-hover' : '';
  const haloClass = halo ? 'hero-halo' : '';

  return (
    <div
      className={`${levelClass} ${hoverClass} ${haloClass} ${className}`}
      style={{
        ...style
      }}
    >
      {(title || subtitle || action) && (
        <div
          className={`card-header ${headerClassName}`}
          style={{
            padding: level === 2 ? '1.5rem 2rem' : '1.25rem 1.75rem',
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
              <h3
                style={{
                  fontSize: level === 2 ? '1.25rem' : '1.125rem',
                  fontWeight: 700,
                  color: 'var(--text-main)',
                  letterSpacing: '-0.02em',
                  margin: 0
                }}
              >
                {title}
              </h3>
            )}
            {subtitle && (
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--text-muted)',
                  marginTop: '0.25rem',
                  lineHeight: 1.45,
                  margin: '0.25rem 0 0 0'
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
          {action && <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>{action}</div>}
        </div>
      )}
      <div
        className={`card-body ${bodyClassName}`}
        style={{
          padding: level === 2 ? '2rem' : '1.75rem'
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default Card;
