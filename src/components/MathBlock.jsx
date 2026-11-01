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
        margin: '1.25rem 0',
        ...style
      }}
    >
      <div
        className="glass-panel mono tabular-nums"
        style={{
          background: 'var(--bg-glass-input)',
          border: '1px solid var(--border-glow)',
          borderRadius: 'var(--radius-md)',
          padding: '1.15rem 1.5rem',
          fontSize: '1rem',
          overflowX: 'auto',
          lineHeight: 1.7,
          color: 'var(--text-main)',
          textAlign: 'center',
          boxShadow: '0 0 20px -5px rgba(99, 102, 241, 0.2)'
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
            marginTop: '0.45rem',
            margin: '0.45rem 0 0 0'
          }}
        >
          {caption}
        </p>
      )}
    </div>
  );
}

export default MathBlock;
