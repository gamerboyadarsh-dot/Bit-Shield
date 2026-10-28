import React from 'react';
import { Check } from 'lucide-react';

export function StepIndicator({
  steps = ['Encode', 'Corrupt', 'Syndrome', 'Correct', 'Verify'],
  currentStep = 1, // 1..5
  onStepClick = null,
  className = '',
  style = {}
}) {
  return (
    <nav
      aria-label="Simulation Progress"
      className={`step-indicator-nav ${className}`}
      style={{
        width: '100%',
        margin: '1.25rem 0',
        ...style
      }}
    >
      <ol
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          listStyle: 'none',
          padding: 0,
          margin: 0,
          position: 'relative'
        }}
      >
        {steps.map((label, index) => {
          const stepNum = index + 1;
          const isCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;
          const isClickable = onStepClick && stepNum <= currentStep;

          return (
            <li
              key={label}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative',
                zIndex: 1,
                flex: 1
              }}
            >
              {/* Connector line between steps */}
              {index > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '14px',
                    right: '50%',
                    left: '-50%',
                    height: '2px',
                    background: stepNum <= currentStep ? 'var(--accent)' : 'var(--border-subtle)',
                    zIndex: -1,
                    transition: 'background-color 0.2s ease'
                  }}
                />
              )}

              {/* Step Circle */}
              <button
                type="button"
                onClick={isClickable ? () => onStepClick(stepNum) : undefined}
                disabled={!isClickable}
                aria-current={isCurrent ? 'step' : undefined}
                aria-label={`Step ${stepNum}: ${label}`}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: 'var(--radius-full)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isCompleted
                    ? 'var(--status-success-bg)'
                    : isCurrent
                    ? 'var(--accent)'
                    : 'var(--bg-card)',
                  color: isCompleted
                    ? 'var(--status-success-text)'
                    : isCurrent
                    ? 'var(--accent-fg)'
                    : 'var(--text-subtle)',
                  border: `2px solid ${
                    isCompleted
                      ? 'var(--status-success-border)'
                      : isCurrent
                      ? 'var(--accent)'
                      : 'var(--border-subtle)'
                  }`,
                  fontSize: '0.8125rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  cursor: isClickable ? 'pointer' : 'default',
                  transition: 'all 0.15s ease',
                  padding: 0
                }}
              >
                {isCompleted ? <Check size={14} strokeWidth={2.5} /> : stepNum}
              </button>

              {/* Step Label */}
              <span
                style={{
                  marginTop: '0.375rem',
                  fontSize: '0.8125rem',
                  fontWeight: isCurrent ? 600 : 500,
                  color: isCurrent
                    ? 'var(--text-main)'
                    : isCompleted
                    ? 'var(--text-muted)'
                    : 'var(--text-subtle)',
                  textAlign: 'center'
                }}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
