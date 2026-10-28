import React from 'react';

export function MathBlock({
  children,
  className = '',
  style = {},
  caption = null
}) {
  return (
    <div
      className={`math-block-container ${className}`}
      style={{
        margin: '1rem 0',
        ...style
      }}
    >
      <div
        className="mono tabular-nums"
        style={{
          background: 'var(--bg-card-subtle)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '0.875rem 1.25rem',
          fontSize: '0.9375rem',
          overflowX: 'auto',
          lineHeight: 1.6,
          color: 'var(--text-main)',
          textAlign: 'center'
        }}
      >
        {children}
      </div>
      {caption && (
        <p
          style={{
            fontSize: '0.8125rem',
            color: 'var(--text-subtle)',
            textAlign: 'center',
            marginTop: '0.375rem',
            margin: '0.375rem 0 0 0'
          }}
        >
          {caption}
        </p>
      )}
    </div>
  );
}
