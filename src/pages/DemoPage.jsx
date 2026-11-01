import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, CheckCircle2, Sparkles, Layers, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Card } from '../components/Card.jsx';
import { Button } from '../components/Button.jsx';
import { Codeword } from '../components/Codeword.jsx';
import { ParityGroups } from '../components/ParityGroups.jsx';
import { MathBlock } from '../components/MathBlock.jsx';
import { Badge } from '../components/Badge.jsx';
import {
  encode,
  parityBreakdown,
  syndrome,
  syndromeBreakdown,
  syndromeToPosition,
  syndromeToString,
  flipBit,
  correct,
  arraysEqual,
  cwToString
} from '../lib/hamming.js';

export function DemoPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);

  // Canonical demo data
  const msgBits = [1, 0, 1, 1];
  const originalCodeword = encode(msgBits); // [0,1,1,0,0,1,1]
  const receivedWord = flipBit(originalCodeword, 6); // [0,1,1,0,0,0,1]
  const syn = syndrome(receivedWord); // [0,1,1]
  const detectedPos = syndromeToPosition(syn); // 6
  const correctedWord = correct(receivedWord); // [0,1,1,0,0,1,1]

  const parities = parityBreakdown(msgBits);
  const syndromes = syndromeBreakdown(receivedWord);

  const stepsMeta = [
    {
      num: 1,
      shortLabel: 'Ingestion',
      title: '1. Message Ingestion (1011)',
      desc: 'The transmitter accepts 4 information bits: m₁=1, m₂=0, m₃=1, m₄=1.',
      getBits: () => [0, 0, 1, 0, 0, 1, 1], // only data bits set initially in positions 3,5,6,7
      corrupted: [],
      corrected: [],
      highlightCheck: null
    },
    {
      num: 2,
      shortLabel: 'Synthesis',
      title: '2. Codeword Synthesis (0110011)',
      desc: 'Three parity bits (p₁, p₂, p₄) are computed and placed at coordinates 1, 2, and 4.',
      getBits: () => originalCodeword,
      corrupted: [],
      corrected: [],
      highlightCheck: null
    },
    {
      num: 3,
      shortLabel: 'Noise Inversion',
      title: '3. Channel Noise Inversion (Pos 6)',
      desc: 'Channel interference flips bit 6 (d₆) from 1 to 0, producing received word 0110001.',
      getBits: () => receivedWord,
      corrupted: [6],
      corrected: [],
      highlightCheck: null
    },
    {
      num: 4,
      shortLabel: 'Syndrome Eval',
      title: '4. Syndrome Matrix Multiplication',
      desc: 'Checks S₁=0, S₂=1, and S₄=1 are evaluated across their respective subsets.',
      getBits: () => receivedWord,
      corrupted: [6],
      corrected: [],
      highlightCheck: 'S2'
    },
    {
      num: 5,
      shortLabel: 'Localization',
      title: '5. Coordinate Localization (Position 6)',
      desc: 'Binary syndrome S₄S₂S₁ = 110₂ evaluates to decimal position 6.',
      getBits: () => receivedWord,
      corrupted: [6],
      corrected: [],
      highlightCheck: 'S4'
    },
    {
      num: 6,
      shortLabel: 'Autonomous Correction',
      title: '6. Autonomous In-Place Bit Inversion',
      desc: 'The decoder inverts bit 6 from 0 back to 1 without requiring retransmission.',
      getBits: () => correctedWord,
      corrupted: [],
      corrected: [6],
      highlightCheck: null
    },
    {
      num: 7,
      shortLabel: 'Identity Verification',
      title: '7. Re-verification & Identity Assurance',
      desc: 'The syndrome is recomputed as 000, confirming identical alignment with original codeword 0110011.',
      getBits: () => correctedWord,
      corrupted: [],
      corrected: [6],
      highlightCheck: null
    }
  ];

  const currentMeta = stepsMeta[currentStep - 1];

  // Auto-play interval timer: 1.8 seconds per step
  useEffect(() => {
    let timer = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= 7) {
            setIsPlaying(false);
            return 7;
          }
          return prev + 1;
        });
      }, 1800);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* Header */}
      <div>
        <span className="eyebrow-label" style={{ marginBottom: '0.5rem' }}>
          <Play size={13} />
          <span>Interactive Simulation Case</span>
        </span>
        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-main)', margin: 0 }}>
          Guided Demonstration
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.35rem', margin: '0.35rem 0 0 0' }}>
          Step-by-step walkthrough of the canonical textbook case: Message 1011 corrupted at position 6.
        </p>
      </div>

      {/* Control Bar & Progress */}
      <Card level={1}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem' }}>
          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Button
              variant="secondary"
              size="sm"
              icon={RotateCcw}
              onClick={() => {
                setIsPlaying(false);
                setCurrentStep(1);
              }}
            >
              Restart
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={ChevronLeft}
              disabled={currentStep === 1}
              onClick={() => {
                setIsPlaying(false);
                setCurrentStep((s) => Math.max(1, s - 1));
              }}
            >
              Previous
            </Button>
            <Button
              variant={isPlaying ? 'secondary' : 'primary'}
              size="sm"
              icon={isPlaying ? Pause : Play}
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? 'Pause' : 'Auto-Play'}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={ChevronRight}
              iconPosition="right"
              disabled={currentStep === 7}
              onClick={() => {
                setIsPlaying(false);
                setCurrentStep((s) => Math.min(7, s + 1));
              }}
            >
              Next
            </Button>
          </div>

          {/* Progress Indicators */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              {stepsMeta.map((s) => (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentStep(s.num);
                  }}
                  title={s.title}
                  style={{
                    width: currentStep === s.num ? '28px' : '10px',
                    height: '10px',
                    borderRadius: 'var(--radius-full)',
                    background: currentStep === s.num
                      ? 'linear-gradient(90deg, #6366f1, #22d3ee)'
                      : s.num < currentStep
                      ? 'rgba(99, 102, 241, 0.4)'
                      : 'var(--border-subtle)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    padding: 0
                  }}
                />
              ))}
            </div>

            <span className="mono tabular-nums" style={{ fontSize: '0.85rem', color: 'var(--text-subtle)', fontWeight: 700 }}>
              Step {currentStep} / 7
            </span>
          </div>
        </div>
      </Card>

      {/* Main Walkthrough Card (Level 2 Hero Card) */}
      <Card
        level={2}
        halo={true}
        title={currentMeta.title}
        subtitle={currentMeta.desc}
        action={
          <Badge
            variant={
              currentStep === 3
                ? 'danger'
                : currentStep === 4 || currentStep === 5
                ? 'warning'
                : currentStep >= 6
                ? 'success'
                : 'neutral'
            }
          >
            {currentMeta.shortLabel}
          </Badge>
        }
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '2.5rem',
              alignItems: 'center'
            }}
          >
            {/* Left Column: Mathematical Breakdown & Narrative */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div
                style={{
                  padding: '1.25rem 1.4rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-glass-input)',
                  border: '1px solid var(--border-subtle)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)'
                }}
              >
                {currentStep === 1 && (
                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-violet)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Transmitter Input Buffer
                    </span>
                    <p style={{ fontSize: '1rem', color: 'var(--text-main)', margin: '0.5rem 0 0 0', lineHeight: 1.6, fontWeight: 550 }}>
                      Message bits <code className="mono" style={{ color: 'var(--accent-violet)', fontWeight: 700 }}>1 0 1 1</code> are loaded into positions <code className="mono">d₃, d₅, d₆, d₇</code>. Parity coordinates <code className="mono">p₁, p₂, p₄</code> initialize at zero.
                    </p>
                  </div>
                )}

                {currentStep === 2 && (
                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Parity Generator Arithmetic
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.65rem' }}>
                      {parities.map((p) => (
                        <div key={p.bit} className="mono tabular-nums" style={{ fontSize: '0.875rem', color: 'var(--text-main)', fontWeight: 650 }}>
                          {p.expression}
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Synthesized 7-bit codeword: <strong className="mono" style={{ color: 'var(--accent-cyan)' }}>0110011</strong>.
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <AlertTriangle size={16} style={{ color: 'var(--status-danger-border)' }} />
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--status-danger-text)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Additive Channel Noise
                      </span>
                    </div>
                    <p style={{ fontSize: '1rem', color: 'var(--text-main)', margin: 0, lineHeight: 1.6, fontWeight: 550 }}>
                      Physical noise inverts bit coordinate 6 (d₆) from <code className="mono">1</code> to <code className="mono">0</code>. The received sequence arriving at the decoder is <code className="mono" style={{ color: 'var(--status-danger-text)', fontWeight: 700 }}>0110001</code>.
                    </p>
                  </div>
                )}

                {currentStep === 4 && (
                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-amber)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Parity Check Violations
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginTop: '0.65rem' }}>
                      {syndromes.map((s) => (
                        <div
                          key={s.id}
                          className="mono tabular-nums"
                          style={{
                            fontSize: '0.85rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '0.3rem 0.5rem',
                            borderRadius: 'var(--radius-xs)',
                            background: s.passed ? 'transparent' : 'rgba(251, 191, 36, 0.1)',
                            border: s.passed ? '1px solid transparent' : '1px solid rgba(251, 191, 36, 0.3)'
                          }}
                        >
                          <span style={{ color: 'var(--text-main)' }}>{s.check}: {s.substituted} = {s.result}</span>
                          <span style={{ color: s.passed ? 'var(--status-success-text)' : 'var(--accent-amber)', fontWeight: 750 }}>
                            {s.passed ? 'Pass (0)' : 'Violated (1)'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {currentStep === 5 && (
                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-amber)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Binary Coordinate Synthesis
                    </span>
                    <div style={{ margin: '0.65rem 0' }}>
                      <MathBlock>
                        S₄S₂S₁ = 110₂ = (4·1 + 2·1 + 1·0) = 6₁₀
                      </MathBlock>
                    </div>
                    <p style={{ fontSize: '0.925rem', color: 'var(--text-main)', margin: '0.5rem 0 0 0', lineHeight: 1.6 }}>
                      The non-zero syndrome vector directly addresses bit coordinate <strong className="mono" style={{ color: 'var(--accent-amber)' }}>6</strong> as the exact site of transmission error.
                    </p>
                  </div>
                )}

                {currentStep === 6 && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <CheckCircle2 size={16} style={{ color: 'var(--status-success-border)' }} />
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--status-success-text)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Autonomous Inversion
                      </span>
                    </div>
                    <p style={{ fontSize: '1rem', color: 'var(--text-main)', margin: 0, lineHeight: 1.6, fontWeight: 550 }}>
                      The decoder performs algebraic bit flipping at coordinate 6: <code className="mono">0 → 1</code>. Codeword is fully restored to <code className="mono" style={{ color: 'var(--status-success-text)', fontWeight: 700 }}>0110011</code> without retransmission.
                    </p>
                  </div>
                )}

                {currentStep === 7 && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <ShieldCheck size={18} style={{ color: 'var(--status-success-border)' }} />
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--status-success-text)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Cryptographic Verification
                      </span>
                    </div>
                    <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', margin: 0, lineHeight: 1.6 }}>
                      Re-evaluating the syndrome on the corrected word produces <code className="mono" style={{ color: 'var(--status-success-text)', fontWeight: 700 }}>000</code>. Decoded message <code className="mono">1011</code> matches initial transmission with 100% mathematical fidelity.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Live Codeword & Coverage Visualization */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center', justifyContent: 'center' }}>
              <Codeword
                bits={currentMeta.getBits()}
                corruptedPositions={currentMeta.corrupted}
                correctedPositions={currentMeta.corrected}
                size="lg"
              />

              <ParityGroups
                activeCheck={currentMeta.highlightCheck}
                size="lg"
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </Card>
    </div>
  );
}

export default DemoPage;