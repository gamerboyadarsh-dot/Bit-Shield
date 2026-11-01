import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, CheckCircle2, Sparkles, Layers } from 'lucide-react';
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
      title: '1. Message Ingestion (1011)',
      desc: 'The transmitter accepts 4 information bits: m₁=1, m₂=0, m₃=1, m₄=1.',
      getBits: () => [0, 0, 1, 0, 0, 1, 1], // only data bits set initially in positions 3,5,6,7
      corrupted: [],
      corrected: [],
      highlightCheck: null
    },
    {
      num: 2,
      title: '2. Codeword Synthesis (0110011)',
      desc: 'Three parity bits (p₁, p₂, p₄) are computed and placed at coordinates 1, 2, and 4.',
      getBits: () => originalCodeword,
      corrupted: [],
      corrected: [],
      highlightCheck: null
    },
    {
      num: 3,
      title: '3. Simulated Noise Inversion (Pos 6)',
      desc: 'Channel interference flips bit 6 (d₆) from 1 to 0, producing received word 0110001.',
      getBits: () => receivedWord,
      corrupted: [6],
      corrected: [],
      highlightCheck: null
    },
    {
      num: 4,
      title: '4. Syndrome Matrix Multiplication',
      desc: 'Checks S₁=0, S₂=1, and S₄=1 are evaluated across their respective subsets.',
      getBits: () => receivedWord,
      corrupted: [6],
      corrected: [],
      highlightCheck: 'S2'
    },
    {
      num: 5,
      title: '5. Coordinate Localization (Position 6)',
      desc: 'Binary syndrome S₄S₂S₁ = 110₂ evaluates to decimal position 6.',
      getBits: () => receivedWord,
      corrupted: [6],
      corrected: [],
      highlightCheck: 'S4'
    },
    {
      num: 6,
      title: '6. Autonomous In-Place Bit Inversion',
      desc: 'The decoder inverts bit 6 from 0 back to 1 without retransmission.',
      getBits: () => correctedWord,
      corrupted: [],
      corrected: [6],
      highlightCheck: null
    },
    {
      num: 7,
      title: '7. Re-verification & Identity Assurance',
      desc: 'The syndrome is recomputed as 000, confirming identical alignment with original codeword 0110011.',
      getBits: () => correctedWord,
      corrupted: [],
      corrected: [6],
      highlightCheck: null
    }
  ];

  const currentMeta = stepsMeta[currentStep - 1];

  // Auto-play interval timer: 1.5 seconds per step
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
      }, 1500);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <span className="mono" style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Cinematic Walkthrough
          </span>
        </div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-main)', margin: 0 }}>
          Guided Demonstration
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.25rem', margin: '0.25rem 0 0 0' }}>
          Step-by-step walkthrough of the canonical textbook case: Message 1011 corrupted at position 6.
        </p>
      </div>

      {/* Control Bar & Progress */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
              {isPlaying ? 'Pause' : 'Auto-play (1.5s)'}
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-subtle)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
              Step {currentStep} of 7
            </span>
            <div
              style={{
                width: '140px',
                height: '8px',
                background: 'var(--bg-glass-input)',
                borderRadius: 'var(--radius-full)',
                overflow: 'hidden',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <motion.div
                animate={{ width: `${(currentStep / 7) * 100}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, #6366f1, #22d3ee)',
                  boxShadow: '0 0 10px rgba(99, 102, 241, 0.5)'
                }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Main Walkthrough Card */}
      <Card
        title={currentMeta.title}
        subtitle={currentMeta.desc}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center' }}
          >
            {/* Interactive Codeword for the current step */}
            <Codeword
              bits={currentMeta.getBits()}
              corruptedPositions={currentMeta.corrupted}
              correctedPositions={currentMeta.corrected}
              size="lg"
            />

            {/* Parity Groups projection */}
            <ParityGroups
              activeCheck={currentMeta.highlightCheck}
              size="lg"
            />

            {/* Step-Specific Mathematical Explanation Box */}
            <div
              className="glass-panel"
              style={{
                width: '100%',
                maxWidth: '680px',
                padding: '1.5rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-card-subtle)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem'
              }}
            >
              {currentStep === 1 && (
                <div>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', margin: 0, lineHeight: 1.6 }}>
                    Message bits <code className="mono">1 0 1 1</code> are assigned to data positions <code className="mono">d₃, d₅, d₆, d₇</code>. Parity coordinates <code className="mono">p₁, p₂, p₄</code> await calculation.
                  </p>
                </div>
              )}

              {currentStep === 2 && (
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                    Computed Parities
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.35rem' }}>
                    {parities.map((p) => (
                      <div key={p.bit} className="mono tabular-nums" style={{ fontSize: '0.9rem', color: 'var(--bit-parity-text)', fontWeight: 650 }}>
                        {p.expression}
                      </div>
                    ))}
                  </div>
                  <p style={{ marginTop: '0.65rem', fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0.65rem 0 0 0' }}>
                    Synthesized 7-bit codeword: <strong className="mono" style={{ color: 'var(--text-main)' }}>0110011</strong>.
                  </p>
                </div>
              )}

              {currentStep === 3 && (
                <div>
                  <Badge variant="danger" style={{ marginBottom: '0.65rem' }}>
                    Noise Corruption Injected
                  </Badge>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', margin: 0, lineHeight: 1.6 }}>
                    Bit 6 flipped from <code className="mono">1</code> to <code className="mono">0</code>. The received word transmitted to the decoder is <code className="mono" style={{ color: 'var(--status-danger-text)', fontWeight: 700 }}>0110001</code>.
                  </p>
                </div>
              )}

              {currentStep === 4 && (
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                    Syndrome Checks on Received Word
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.45rem' }}>
                    {syndromes.map((s) => (
                      <div key={s.id} className="mono tabular-nums" style={{ fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0' }}>
                        <span>{s.check}: {s.formula} = {s.substituted} = {s.result}</span>
                        <span style={{ color: s.passed ? 'var(--status-success-text)' : 'var(--status-danger-text)', fontWeight: 750 }}>
                          {s.passed ? 'Pass (0)' : 'Fail (1)'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 5 && (
                <div>
                  <Badge variant="warning" style={{ marginBottom: '0.65rem' }}>
                    Syndrome Address Resolution
                  </Badge>
                  <MathBlock>
                    Syndrome S₄S₂S₁ = 110₂ = (4·1 + 2·1 + 1·0) = 6₁₀
                  </MathBlock>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', marginTop: '0.65rem', margin: '0.65rem 0 0 0', lineHeight: 1.6 }}>
                    The failing parity checks S₄ and S₂ directly point to coordinate 6 (d₆) as the flipped bit.
                  </p>
                </div>
              )}

              {currentStep === 6 && (
                <div>
                  <Badge variant="success" style={{ marginBottom: '0.65rem' }}>
                    Autonomous Correction Inversion
                  </Badge>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', margin: 0, lineHeight: 1.6 }}>
                    Bit at position 6 inverted back: <code className="mono">0 → 1</code>. Codeword is restored to <code className="mono" style={{ color: 'var(--status-success-text)', fontWeight: 700 }}>0110011</code>.
                  </p>
                </div>
              )}

              {currentStep === 7 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle2 size={20} strokeWidth={2.5} style={{ color: 'var(--status-success-border)' }} />
                    <strong style={{ color: 'var(--status-success-text)', fontSize: '1rem' }}>
                      Identity Verification Confirmed
                    </strong>
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
                    Recomputing syndrome on restored word yields S₄S₂S₁ = 000. Codeword strictly matches the initial transmitted message.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </Card>
    </div>
  );
}

export default DemoPage;
