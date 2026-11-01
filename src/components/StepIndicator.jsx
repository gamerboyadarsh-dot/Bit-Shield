import React from 'react';
import { motion } from 'framer-motion';
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
                    top: '16px',
                    right: '50%',
                    left: '-50%',
                    height: '2px',
                    background: stepNum <= currentStep
                      ? 'linear-gradient(90deg, #6366f1, #22d3ee)'
                      : 'var(--border-subtle)',
                    boxShadow: stepNum <= currentStep ? '0 0 10px rgba(99, 102, 241, 0.5)' : 'none',
                    zIndex: -1,
                    transition: 'background 0.3s ease, box-shadow 0.3s ease'
                  }}
                />
              )}

              {/* Step Circle / Badge */}
              <button
                type="button"
                onClick={isClickable ? () => onStepClick(stepNum) : undefined}
                disabled={!isClickable}
                aria-current={isCurrent ? 'step' : undefined}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  border: isCurrent
                    ? '2px solid var(--accent-cyan)'
                    : isCompleted
                    ? '2px solid var(--status-success-border)'
                    : '2px solid var(--border-card)',
                  background: isCurrent
                    ? 'var(--accent)'
                    : isCompleted
                    ? 'var(--status-success-bg)'
                    : 'var(--bg-card-subtle)',
                  color: isCurrent
                    ? '#ffffff'
                    : isCompleted
                    ? 'var(--status-success-text)'
                    : 'var(--text-subtle)',
                  boxShadow: isCurrent
                    ? '0 0 16px rgba(99, 102, 241, 0.6)'
                    : isCompleted
                    ? '0 0 12px rgba(52, 211, 153, 0.3)'
                    : 'none',
                  cursor: isClickable ? 'pointer' : 'default',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  outline: 'none'
                }}
              >
                {isCompleted ? <Check size={16} strokeWidth={2.5} /> : stepNum}
              </button>

              {/* Step Label */}
              <span
                style={{
                  fontSize: '0.78rem',
                  fontWeight: isCurrent ? 700 : 500,
                  color: isCurrent
                    ? 'var(--text-main)'
                    : isCompleted
                    ? 'var(--status-success-text)'
                    : 'var(--text-subtle)',
                  marginTop: '0.45rem',
                  textAlign: 'center',
                  letterSpacing: '-0.01em',
                  transition: 'color 0.2s ease'
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

export default StepIndicator;
