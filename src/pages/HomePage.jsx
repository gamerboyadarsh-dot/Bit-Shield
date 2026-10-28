import React, { useState } from 'react';
import { ArrowRight, Play, BookOpen, ShieldAlert, Cpu, CheckCircle2, RotateCcw } from 'lucide-react';
import { Button } from '../components/Button.jsx';
import { Card } from '../components/Card.jsx';
import { Codeword } from '../components/Codeword.jsx';
import { Badge } from '../components/Badge.jsx';
import { encode, syndrome, syndromeToPosition, syndromeToString, flipBit, POSITIONS_META } from '../lib/hamming.js';

export function HomePage({ onNavigate }) {
  // Live interactive preview for 1011
  const initialBits = encode([1, 0, 1, 1]); // [0, 1, 1, 0, 0, 1, 1]
  const [corruptedPos, setCorruptedPos] = useState(null);

  const currentBits = corruptedPos ? flipBit(initialBits, corruptedPos) : initialBits;
  const currentSyn = syndrome(currentBits);
  const detectedPos = syndromeToPosition(currentSyn);

  const handleBitClick = (pos) => {
    if (corruptedPos === pos) {
      setCorruptedPos(null); // Clear error
    } else {
      setCorruptedPos(pos); // Flip selected bit
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem' }}>
      {/* Editorial Hero Section */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '2.5rem',
          alignItems: 'center',
          paddingTop: '1rem'
        }}
        className="hero-grid"
      >
        {/* Left Column: Typography & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--accent)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}
            >
              BAMAT205 · Module 3 · Coding Theory
            </span>
            <h1
              style={{
                fontSize: '2.75rem',
                fontWeight: 700,
                letterSpacing: '-0.03em',
                color: 'var(--text-main)',
                marginTop: '0.5rem',
                lineHeight: 1.15
              }}
            >
              BitShield
            </h1>
          </div>

          <p
            style={{
              fontSize: '1.125rem',
              color: 'var(--text-muted)',
              lineHeight: 1.6,
              maxWidth: '540px'
            }}
          >
            A rigorous interactive simulator demonstrating single-error detection and correction in digital communication using the Hamming (7,4) linear block code over GF(2).
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', flexWrap: 'wrap' }}>
            <Button
              variant="primary"
              size="lg"
              icon={ArrowRight}
              iconPosition="right"
              onClick={() => onNavigate('simulator')}
            >
              Open Simulator
            </Button>
            <Button
              variant="secondary"
              size="lg"
              icon={Play}
              onClick={() => onNavigate('demo')}
            >
              Run Demonstration
            </Button>
          </div>

          <div>
            <button
              type="button"
              onClick={() => onNavigate('theory')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-subtle)',
                fontSize: '0.9375rem',
                textDecoration: 'underline',
                cursor: 'pointer',
                padding: 0,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem'
              }}
            >
              <BookOpen size={15} strokeWidth={1.75} />
              Read the theoretical foundation
            </button>
          </div>
        </div>

        {/* Right Column: Live Interactive Sandbox Preview */}
        <div>
          <Card
            title="Interactive Preview"
            subtitle="Click any bit below to inject an error and observe syndrome resolution."
            action={
              corruptedPos !== null && (
                <Button
                  variant="ghost"
                  size="sm"
                  icon={RotateCcw}
                  onClick={() => setCorruptedPos(null)}
                >
                  Reset
                </Button>
              )
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', alignItems: 'center' }}>
              <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: 'var(--text-subtle)' }}>
                <span>Message: <strong className="mono">1011</strong></span>
                <span>Codeword: <strong className="mono">0110011</strong></span>
              </div>

              {/* Live Interactive Codeword */}
              <Codeword
                bits={currentBits}
                corruptedPositions={corruptedPos ? [corruptedPos] : []}
                onBitClick={handleBitClick}
                size="md"
              />

              {/* Dynamic Live Status Readout */}
              <div
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-card-subtle)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.75rem'
                }}
              >
                <div>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-subtle)', display: 'block' }}>
                    Syndrome (S₄ S₂ S₁)
                  </span>
                  <span className="mono tabular-nums" style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {syndromeToString(currentSyn, true)}
                  </span>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-subtle)', display: 'block' }}>
                    Diagnosis
                  </span>
                  {detectedPos === 0 ? (
                    <Badge variant="success">No error detected</Badge>
                  ) : (
                    <Badge variant="danger">
                      Error at position {detectedPos} ({POSITIONS_META[detectedPos - 1].name})
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* 5-Node Pipeline Diagram */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)', textAlign: 'center' }}>
          Communication Pipeline Workflow
        </h2>
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-card)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.75rem 1.25rem',
            boxShadow: 'var(--shadow-sm)',
            overflowX: 'auto'
          }}
        >
          <svg
            width="100%"
            height="90"
            viewBox="0 0 880 90"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ minWidth: '700px' }}
          >
            {/* Connecting Lines */}
            <path d="M 120 45 L 220 45" stroke="var(--border-strong)" strokeWidth="2" strokeDasharray="4 4" />
            <path d="M 320 45 L 420 45" stroke="var(--border-strong)" strokeWidth="2" />
            <path d="M 520 45 L 620 45" stroke="var(--border-strong)" strokeWidth="2" />
            <path d="M 720 45 L 800 45" stroke="var(--border-strong)" strokeWidth="2" />

            {/* Node 1: Message */}
            <g transform="translate(20, 15)">
              <rect width="100" height="60" rx="8" fill="var(--bit-data-bg)" stroke="var(--bit-data-border)" strokeWidth="1.5" />
              <text x="50" y="30" textAnchor="middle" fill="var(--bit-data-text)" fontFamily="var(--font-sans)" fontWeight="600" fontSize="13">Message</text>
              <text x="50" y="47" textAnchor="middle" fill="var(--bit-data-text)" fontFamily="var(--font-mono)" fontSize="11">4 bits (m₁..m₄)</text>
            </g>

            {/* Node 2: Encode */}
            <g transform="translate(220, 15)">
              <rect width="100" height="60" rx="8" fill="var(--bit-parity-bg)" stroke="var(--bit-parity-border)" strokeWidth="1.5" />
              <text x="50" y="30" textAnchor="middle" fill="var(--bit-parity-text)" fontFamily="var(--font-sans)" fontWeight="600" fontSize="13">Encoding</text>
              <text x="50" y="47" textAnchor="middle" fill="var(--bit-parity-text)" fontFamily="var(--font-mono)" fontSize="11">+3 parity bits</text>
            </g>

            {/* Node 3: Noisy Channel */}
            <g transform="translate(420, 15)">
              <rect width="100" height="60" rx="8" fill="var(--bit-corrupt-bg)" stroke="var(--bit-corrupt-border)" strokeWidth="1.5" />
              <text x="50" y="30" textAnchor="middle" fill="var(--bit-corrupt-text)" fontFamily="var(--font-sans)" fontWeight="600" fontSize="13">Channel</text>
              <text x="50" y="47" textAnchor="middle" fill="var(--bit-corrupt-text)" fontFamily="var(--font-mono)" fontSize="11">Noise / bit flip</text>
            </g>

            {/* Node 4: Syndrome */}
            <g transform="translate(620, 15)">
              <rect width="100" height="60" rx="8" fill="var(--bit-corrected-bg)" stroke="var(--bit-corrected-border)" strokeWidth="1.5" />
              <text x="50" y="30" textAnchor="middle" fill="var(--bit-corrected-text)" fontFamily="var(--font-sans)" fontWeight="600" fontSize="13">Syndrome</text>
              <text x="50" y="47" textAnchor="middle" fill="var(--bit-corrected-text)" fontFamily="var(--font-mono)" fontSize="11">s = H·rᵀ</text>
            </g>

            {/* Node 5: Correction */}
            <g transform="translate(800, 15)">
              <rect width="70" height="60" rx="8" fill="var(--status-success-bg)" stroke="var(--status-success-border)" strokeWidth="1.5" />
              <text x="35" y="30" textAnchor="middle" fill="var(--status-success-text)" fontFamily="var(--font-sans)" fontWeight="600" fontSize="13">Correct</text>
              <text x="35" y="47" textAnchor="middle" fill="var(--status-success-text)" fontFamily="var(--font-mono)" fontSize="11">Restored</text>
            </g>
          </svg>
        </div>
      </section>

      {/* Three Architectural Cards */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', background: 'var(--bit-corrupt-bg)', color: 'var(--bit-corrupt-text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldAlert size={20} strokeWidth={1.75} />
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-main)' }}>The Problem</h3>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              In real-world storage media and telecommunication channels, random thermal noise, cosmic rays, and signal interference can flip binary digits. Without redundancy, corrupted bits go unnoticed or demand high-latency retransmissions.
            </p>
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', background: 'var(--bit-data-bg)', color: 'var(--bit-data-text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Cpu size={20} strokeWidth={1.75} />
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-main)' }}>The Mathematics</h3>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Linear algebra over the Galois field GF(2) enables the synthesis of parity-check matrices where each column vector represents the binary index of its coordinate. The syndrome vector directly evaluates to the error coordinate.
            </p>
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', background: 'var(--bit-parity-bg)', color: 'var(--bit-parity-text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={20} strokeWidth={1.75} />
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-main)' }}>The Solution</h3>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Hamming (7,4) achieves a code rate of 4/7 with a minimum distance of 3. This guarantees autonomous single-bit error detection and immediate in-place bit inversion without requiring feedback channels or round-trip packets.
            </p>
          </div>
        </Card>
      </section>

      {/* Project Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '2rem',
          textAlign: 'center',
          color: 'var(--text-subtle)',
          fontSize: '0.875rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.375rem'
        }}
      >
        <p style={{ fontWeight: 600, color: 'var(--text-muted)' }}>
          BAMAT205 Discrete Mathematics and Linear Algebra – Group Project
        </p>
        <p>Team Members: [Editable Group Member Names Placeholder]</p>
      </footer>

      <style>{`
        @media (min-width: 900px) {
          .hero-grid {
            grid-template-columns: 1.15fr 0.85fr !important;
          }
        }
      `}</style>
    </div>
  );
}
