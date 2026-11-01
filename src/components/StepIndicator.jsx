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
        position: 'sticky',
        top: '4.75rem',
        zIndex: 80,
        width: '100%',
        margin: '0.5rem 0 1.5rem',
        ...style
      }}
    >
      <div
        className="glass-l1"
        style={{
          borderRadius: 'var(--radius-full)',
          padding: '0.65rem 1.5rem',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid var(--border-glow)',
          boxShadow: '0 12px 32px -4px rgba(0, 0, 0, 0.5), 0 0 20px -5px rgba(99, 102, 241, 0.25)'
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
                      height: '3px',
                      background: stepNum <= currentStep
                        ? 'linear-gradient(90deg, #6366f1, #22d3ee)'
                        : 'var(--border-subtle)',
                      boxShadow: stepNum <= currentStep ? '0 0 12px rgba(34, 211, 238, 0.6)' : 'none',
                      zIndex: -1,
                      transition: 'background 0.3s ease, box-shadow 0.3s ease'
                    }}
                  />
                )}

                {/* Step Circle / Badge */}
                <motion.button
                  type="button"
                  onClick={isClickable ? () => onStepClick(stepNum) : undefined}
                  disabled={!isClickable}
                  whileHover={isClickable ? { scale: 1.12 } : {}}
                  whileTap={isClickable ? { scale: 0.92 } : {}}
                  aria-current={isCurrent ? 'step' : undefined}
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    border: isCurrent
                      ? '2px solid var(--accent-cyan)'
                      : isCompleted
                      ? '2px solid var(--status-success-border)'
                      : '2px solid var(--border-card)',
                    background: isCurrent
                      ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
                      : isCompleted
                      ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                      : 'var(--bg-glass-input)',
                    color: isCurrent || isCompleted ? '#ffffff' : 'var(--text-subtle)',
                    boxShadow: isCurrent
                      ? '0 0 20px rgba(99, 102, 241, 0.7), 0 0 35px rgba(34, 211, 238, 0.4)'
                      : isCompleted
                      ? '0 0 14px rgba(52, 211, 153, 0.4)'
                      : 'none',
                    cursor: isClickable ? 'pointer' : 'default',
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                    outline: 'none',
                    position: 'relative'
                  }}
                >
                  {/* Pulsing ring for active step */}
                  {isCurrent && (
                    <motion.div
                      animate={{ scale: [1, 1.45, 1], opacity: [0.7, 0, 0.7] }}
                      transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                      style={{
                        position: 'absolute',
                        inset: '-4px',
                        borderRadius: '50%',
                        border: '2px solid var(--accent-cyan)',
                        pointerEvents: 'none'
                      }}
                    />
                  )}

                  {isCompleted ? <Check size={18} strokeWidth={2.8} /> : stepNum}
                </motion.button>

                {/* Step Label */}
                <span
                  style={{
                    fontSize: '0.78rem',
                    fontFamily: 'var(--font-sans)',
                    fontWeight: isCurrent ? 800 : 600,
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
      </div>
    </nav>
  );
}

export default StepIndicator;
