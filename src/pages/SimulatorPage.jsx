import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Printer,
  Sparkles,
  ToggleLeft,
  CircleDot,
  Sliders,
  Check,
  Shield,
  Zap,
  Activity
} from 'lucide-react';
import { Card } from '../components/Card.jsx';
import { Button } from '../components/Button.jsx';
import { Badge } from '../components/Badge.jsx';
import { Callout } from '../components/Callout.jsx';
import { Codeword } from '../components/Codeword.jsx';
import { ParityGroups } from '../components/ParityGroups.jsx';
import { StepIndicator } from '../components/StepIndicator.jsx';
import { VennDiagram } from '../components/VennDiagram.jsx';
import {
  validateInput,
  encode,
  parityBreakdown,
  syndrome,
  syndromeBreakdown,
  syndromeToPosition,
  syndromeToString,
  correct,
  flipBit,
  classify,
  arraysEqual,
  cwToString,
  POSITIONS_META,
  PARITY_CHECKS,
  encodeSecded,
  evaluateSecded
} from '../lib/hamming.js';

export function SimulatorPage() {
  const [currentStep, setCurrentStep] = useState(1);

  // Message & input state
  const [inputText, setInputText] = useState('1011');
  const [inputError, setInputError] = useState(null);
  const [toggleBits, setToggleBits] = useState([1, 0, 1, 1]);

  // Codeword state
  const [encodedCodeword, setEncodedCodeword] = useState(() => encode([1, 0, 1, 1]));
  const [corruptedPositions, setCorruptedPositions] = useState([]);
  const [multiErrorMode, setMultiErrorMode] = useState(false);
  const [correctedPositions, setCorrectedPositions] = useState([]);

  // Visualization mode: 'bar' | 'venn'
  const [visualMode, setVisualMode] = useState('bar');

  // SECDED (8,4) Mode Toggle
  const [secdedMode, setSecdedMode] = useState(false);

  // Computed words
  const receivedWord = corruptedPositions.reduce(
    (acc, pos) => flipBit(acc, pos),
    encodedCodeword
  );

  const currentSyndrome = syndrome(receivedWord);
  const detectedPos = syndromeToPosition(currentSyndrome);
  const correctedWord = detectedPos !== 0 ? flipBit(receivedWord, detectedPos) : receivedWord.slice();
  const verifiedSyndrome = syndrome(correctedWord);

  // SECDED 8-bit computations
  const secdedCodeword = encodeSecded(toggleBits);
  const secdedReceived = corruptedPositions.reduce((acc, pos) => {
    const next = acc.slice();
    if (pos <= 8) next[pos - 1] ^= 1;
    return next;
  }, secdedCodeword);
  const secdedEval = evaluateSecded(secdedReceived);

  // Hover states for bi-directional highlighting
  const [hoveredPosition, setHoveredPosition] = useState(null);
  const [activeCheck, setActiveCheck] = useState(null);

  // Sync text input with toggle buttons
  const handleToggleClick = (index) => {
    const next = [...toggleBits];
    next[index] ^= 1;
    setToggleBits(next);
    setInputText(next.join(''));
    handleEncode(next.join(''));
  };

  const handleTextChange = (e) => {
    const val = e.target.value;
    setInputText(val);
    const validation = validateInput(val);
    if (validation.ok) {
      setInputError(null);
      setToggleBits(validation.bits);
    } else {
      setInputError(validation.error);
    }
  };

  const handleEncode = (textToValidate = inputText) => {
    const validation = validateInput(textToValidate);
    if (!validation.ok) {
      setInputError(validation.error);
      return;
    }
    setInputError(null);
    const newCw = encode(validation.bits);
    setEncodedCodeword(newCw);
    setCorruptedPositions([]);
    setCorrectedPositions([]);
    setCurrentStep(2);
  };

  // Presets handler
  const loadPreset = (presetName) => {
    switch (presetName) {
      case 'all-zeros':
        setInputText('0000');
        setToggleBits([0, 0, 0, 0]);
        setEncodedCodeword(encode([0, 0, 0, 0]));
        setCorruptedPositions([]);
        setMultiErrorMode(false);
        setCurrentStep(2);
        break;
      case 'all-ones':
        setInputText('1111');
        setToggleBits([1, 1, 1, 1]);
        setEncodedCodeword(encode([1, 1, 1, 1]));
        setCorruptedPositions([]);
        setMultiErrorMode(false);
        setCurrentStep(2);
        break;
      case 'canonical':
        setInputText('1011');
        setToggleBits([1, 0, 1, 1]);
        setEncodedCodeword(encode([1, 0, 1, 1]));
        setCorruptedPositions([6]); // Flip pos 6
        setMultiErrorMode(false);
        setCurrentStep(3);
        break;
      case 'double-error':
        setInputText('1011');
        setToggleBits([1, 0, 1, 1]);
        setEncodedCodeword(encode([1, 0, 1, 1]));
        setCorruptedPositions([2, 6]); // Flip pos 2 & 6
        setMultiErrorMode(true);
        setCurrentStep(3);
        break;
      case 'undetected-triple':
        setInputText('0000');
        setToggleBits([0, 0, 0, 0]);
        setEncodedCodeword(encode([0, 0, 0, 0]));
        setCorruptedPositions([1, 2, 4]); // 3-bit flip to 1101001 (differs in 1,2,4)
        setMultiErrorMode(true);
        setCurrentStep(3);
        break;
      default:
        break;
    }
    setCorrectedPositions([]);
  };

  const handleBitFlip = (pos) => {
    if (currentStep < 2) return;

    if (!multiErrorMode) {
      if (corruptedPositions.includes(pos)) {
        setCorruptedPositions([]);
      } else {
        setCorruptedPositions([pos]);
      }
    } else {
      if (corruptedPositions.includes(pos)) {
        setCorruptedPositions(corruptedPositions.filter((p) => p !== pos));
      } else {
        setCorruptedPositions([...corruptedPositions, pos]);
      }
    }
    setCorrectedPositions([]);
    if (currentStep >= 4) setCurrentStep(2);
  };

  const handleApplyCorrection = () => {
    if (detectedPos === 0) {
      setCorrectedPositions([]);
    } else {
      setCorrectedPositions([detectedPos]);
    }
    setCurrentStep(5);
  };

  const encodedParity = parityBreakdown(toggleBits);
  const synBreakdown = syndromeBreakdown(receivedWord);
  const outcomeClassification = classify(
    encodedCodeword,
    receivedWord,
    currentSyndrome,
    correctedWord
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.25rem' }}>
      {/* Header & Global Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="mono" style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Interactive Lab
            </span>
          </div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-main)', margin: 0 }}>
            Hamming (7,4) Simulator
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.25rem', margin: '0.25rem 0 0 0' }}>
            Autonomous single-error detection, syndrome decoding, and Galois field GF(2) parity analysis.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Button
            variant="secondary"
            size="sm"
            icon={Printer}
            onClick={() => window.print()}
          >
            Print Lab Report
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={RotateCcw}
            onClick={() => {
              setCorruptedPositions([]);
              setCorrectedPositions([]);
              if (currentStep > 2) setCurrentStep(2);
            }}
            disabled={corruptedPositions.length === 0}
          >
            Reset Error
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setInputText('0000');
              setToggleBits([0, 0, 0, 0]);
              setEncodedCodeword(encode([0, 0, 0, 0]));
              setCorruptedPositions([]);
              setCorrectedPositions([]);
              setMultiErrorMode(false);
              setCurrentStep(1);
            }}
          >
            Reset All
          </Button>
        </div>
      </div>

      {/* Preset Scenario Bar */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={16} strokeWidth={2} style={{ color: 'var(--accent)' }} />
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
              Quick Scenario Presets:
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
            <Button variant="secondary" size="sm" onClick={() => loadPreset('canonical')}>
              Textbook (1011, Pos 6)
            </Button>
            <Button variant="secondary" size="sm" onClick={() => loadPreset('double-error')}>
              Double-Error Miscorrection
            </Button>
            <Button variant="secondary" size="sm" onClick={() => loadPreset('undetected-triple')}>
              Undetected 3-Bit Flip
            </Button>
            <Button variant="ghost" size="sm" onClick={() => loadPreset('all-zeros')}>
              All-Zeros (0000)
            </Button>
            <Button variant="ghost" size="sm" onClick={() => loadPreset('all-ones')}>
              All-Ones (1111)
            </Button>
          </div>
        </div>
      </Card>

      {/* Stepper Navigation */}
      <StepIndicator currentStep={currentStep} onStepClick={(s) => setCurrentStep(s)} />

      {/* Two-Column Workspace */}
      <div className="grid-2col" style={{ alignItems: 'start' }}>
        {/* LEFT COLUMN: Controls & Sequential Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* STEP 1: Message Encoder */}
          <Card
            title="1. Message Encoding"
            subtitle="Enter 4 binary message bits (m₁m₂m₃m₄) mapping to positions d₃, d₅, d₆, d₇."
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
                  Interactive Bit Toggles
                </label>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {toggleBits.map((b, i) => (
                    <motion.button
                      key={i}
                      type="button"
                      onClick={() => handleToggleClick(i)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: 'var(--radius-md)',
                        border: `2px solid ${b ? 'var(--accent)' : 'var(--border-card)'}`,
                        background: b ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : 'var(--bg-card-subtle)',
                        color: b ? '#ffffff' : 'var(--text-main)',
                        boxShadow: b ? '0 0 16px rgba(99, 102, 241, 0.4)' : 'none',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '1.35rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                        outline: 'none'
                      }}
                      aria-label={`Message bit m${i + 1}, currently ${b}, click to toggle`}
                    >
                      {b}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="msg-text-input" style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.4rem' }}>
                  Binary String Entry
                </label>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <input
                    id="msg-text-input"
                    type="text"
                    value={inputText}
                    onChange={handleTextChange}
                    onKeyDown={(e) => e.key === 'Enter' && handleEncode()}
                    maxLength={6}
                    style={{
                      padding: '0.6rem 0.95rem',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '1.15rem',
                      fontWeight: 700,
                      borderRadius: 'var(--radius-md)',
                      border: `1.5px solid ${inputError ? 'var(--status-danger-border)' : 'var(--border-card)'}`,
                      background: 'var(--bg-glass-input)',
                      color: 'var(--text-main)',
                      width: '130px',
                      letterSpacing: '0.25em',
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                    placeholder="1011"
                  />
                  <Button variant="primary" onClick={() => handleEncode()} icon={ArrowRight} iconPosition="right">
                    Encode
                  </Button>
                </div>
                {inputError && (
                  <p style={{ color: 'var(--status-danger-text)', fontSize: '0.825rem', marginTop: '0.45rem', fontWeight: 550 }}>
                    {inputError}
                  </p>
                )}
              </div>

              {/* Parity Equations */}
              <div
                style={{
                  background: 'var(--bg-card-subtle)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  padding: '1rem 1.15rem'
                }}
              >
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Parity Bit Calculations
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginTop: '0.5rem' }}>
                  {encodedParity.map((eq) => (
                    <div key={eq.bit} className="mono tabular-nums" style={{ fontSize: '0.875rem', color: 'var(--bit-parity-text)', fontWeight: 600 }}>
                      {eq.expression}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* STEP 2: Introduce Error & Modes */}
          <Card
            title="2. Channel Noise Simulation"
            subtitle="Click any bit in the inspection panel to inject bit errors."
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
              {/* Custom Styled Switch: Multi-Error Mode */}
              <div
                onClick={() => {
                  const nextVal = !multiErrorMode;
                  setMultiErrorMode(nextVal);
                  if (!nextVal && corruptedPositions.length > 1) {
                    setCorruptedPositions(corruptedPositions.slice(0, 1));
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1.15rem',
                  borderRadius: 'var(--radius-md)',
                  background: multiErrorMode ? 'var(--status-warning-bg)' : 'var(--bg-card-subtle)',
                  border: `1px solid ${multiErrorMode ? 'var(--status-warning-border)' : 'var(--border-subtle)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', display: 'block' }}>
                    Multiple-error mode
                  </span>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-subtle)' }}>
                    Allows corrupting 2+ bits to observe code limitations and miscorrections.
                  </span>
                </div>
                {/* Custom Toggle Switch Pill */}
                <div
                  style={{
                    width: '42px',
                    height: '24px',
                    borderRadius: 'var(--radius-full)',
                    background: multiErrorMode ? 'var(--accent-amber)' : 'var(--border-card)',
                    position: 'relative',
                    transition: 'background-color 0.2s ease',
                    flexShrink: 0
                  }}
                >
                  <motion.div
                    animate={{ x: multiErrorMode ? 20 : 2 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: '#ffffff',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                      position: 'absolute',
                      top: '2px'
                    }}
                  />
                </div>
              </div>

              {/* Custom Styled Switch: SECDED Mode */}
              <div
                onClick={() => setSecdedMode(!secdedMode)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1.15rem',
                  borderRadius: 'var(--radius-md)',
                  background: secdedMode ? 'var(--bit-parity-bg)' : 'var(--bg-card-subtle)',
                  border: `1px solid ${secdedMode ? 'var(--bit-parity-border)' : 'var(--border-subtle)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', display: 'block' }}>
                    SECDED Mode (Hamming 8,4)
                  </span>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-subtle)' }}>
                    Adds 8th overall parity bit p₈ to safely detect double errors without miscorrecting.
                  </span>
                </div>
                {/* Custom Toggle Switch Pill */}
                <div
                  style={{
                    width: '42px',
                    height: '24px',
                    borderRadius: 'var(--radius-full)',
                    background: secdedMode ? 'var(--bit-parity-border)' : 'var(--border-card)',
                    position: 'relative',
                    transition: 'background-color 0.2s ease',
                    flexShrink: 0
                  }}
                >
                  <motion.div
                    animate={{ x: secdedMode ? 20 : 2 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: '#ffffff',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                      position: 'absolute',
                      top: '2px'
                    }}
                  />
                </div>
              </div>

              {/* Original vs Received Comparison */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '90px 1fr',
                  gap: '0.65rem',
                  fontSize: '0.9rem',
                  alignItems: 'center',
                  background: 'var(--bg-card-subtle)',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <span style={{ color: 'var(--text-subtle)', fontWeight: 600 }}>Original c:</span>
                <span className="mono tabular-nums" style={{ fontWeight: 700, letterSpacing: '0.05em' }}>{cwToString(encodedCodeword)}</span>
                <span style={{ color: 'var(--text-subtle)', fontWeight: 600 }}>Received r:</span>
                <span className="mono tabular-nums" style={{ fontWeight: 700, letterSpacing: '0.05em', color: corruptedPositions.length > 0 ? 'var(--status-danger-text)' : 'var(--text-main)' }}>
                  {cwToString(receivedWord)}
                </span>
              </div>

              {corruptedPositions.length > 0 ? (
                <Badge variant="danger">
                  {corruptedPositions.length} corrupted position{corruptedPositions.length > 1 ? 's' : ''}: {corruptedPositions.join(', ')}
                </Badge>
              ) : (
                <Badge variant="neutral">No channel errors injected</Badge>
              )}

              <Button variant="primary" onClick={() => setCurrentStep(3)} icon={ArrowRight} iconPosition="right" style={{ alignSelf: 'flex-start' }}>
                Evaluate Syndrome
              </Button>
            </div>
          </Card>

          {/* STEP 3 & 4: Syndrome Calculation & Correction */}
          <Card
            title="3. Syndrome Evaluation & Correction"
            subtitle="Evaluate parity checks across the received word."
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {synBreakdown.map((chk) => (
                  <div
                    key={chk.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-card-subtle)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.9rem'
                    }}
                  >
                    <div>
                      <strong style={{ color: 'var(--text-main)', marginRight: '0.5rem', fontFamily: 'var(--font-mono)' }}>{chk.check}</strong>
                      <span className="mono tabular-nums" style={{ color: 'var(--text-muted)' }}>
                        {chk.formula} = {chk.substituted} = <strong style={{ color: chk.passed ? 'var(--status-success-text)' : 'var(--status-danger-text)' }}>{chk.result}</strong>
                      </span>
                    </div>
                    <Badge variant={chk.passed ? 'success' : 'danger'} size="sm">
                      {chk.passed ? 'Pass (0)' : 'Fail (1)'}
                    </Badge>
                  </div>
                ))}
              </div>

              {/* SECDED Overall Parity Readout (if enabled) */}
              {secdedMode && (
                <div style={{ padding: '0.85rem 1.15rem', background: 'var(--bit-parity-bg)', border: '1px solid var(--bit-parity-border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--bit-parity-glow)' }}>
                  <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--bit-parity-text)' }}>
                    SECDED 8th Parity Check (P = ⨁ rᵢ): {secdedEval.overallParity} ({secdedEval.overallParity === 0 ? 'Even / Pass' : 'Odd / Fail'})
                  </span>
                  <div style={{ fontSize: '0.825rem', color: 'var(--bit-parity-text)', marginTop: '0.35rem' }}>
                    Diagnosis: <strong>{secdedEval.diagnosis.replace(/_/g, ' ')}</strong>
                  </div>
                </div>
              )}

              {/* Diagnosis Banner */}
              <div
                style={{
                  padding: '1.15rem 1.35rem',
                  borderRadius: 'var(--radius-md)',
                  background: detectedPos === 0 ? 'var(--status-success-bg)' : 'var(--status-warning-bg)',
                  border: `1px solid ${detectedPos === 0 ? 'var(--status-success-border)' : 'var(--status-warning-border)'}`,
                  boxShadow: detectedPos === 0 ? '0 0 16px rgba(52, 211, 153, 0.2)' : '0 0 16px rgba(251, 191, 36, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.75rem'
                }}
              >
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', display: 'block', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                    Calculated Syndrome (S₄ S₂ S₁)
                  </span>
                  <span className="mono tabular-nums" style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                    {syndromeToString(currentSyndrome, true)} = {detectedPos}₁₀
                  </span>
                </div>
                <div>
                  {detectedPos === 0 ? (
                    <Badge variant="success">No error detected</Badge>
                  ) : (
                    <Badge variant="warning">
                      Position {detectedPos} ({POSITIONS_META[detectedPos - 1].name}) is identified
                    </Badge>
                  )}
                </div>
              </div>

              <Button
                variant={detectedPos === 0 ? 'secondary' : 'primary'}
                onClick={handleApplyCorrection}
                icon={CheckCircle2}
                disabled={detectedPos === 0 && currentStep >= 4}
                style={{ alignSelf: 'flex-start' }}
              >
                {detectedPos === 0 ? 'Verify Codeword' : `Correct Position ${detectedPos}`}
              </Button>
            </div>
          </Card>

          {/* STEP 5: Verification & Classification */}
          <Card
            title="4. Verification & Classification"
            subtitle="Re-evaluates syndrome on corrected word and verifies against original codeword."
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
                <div style={{ padding: '0.85rem 1rem', background: 'var(--bg-card-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', display: 'block', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', fontWeight: 650 }}>Recomputed Syn(C)</span>
                  <span className="mono tabular-nums" style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                    {syndromeToString(verifiedSyndrome, true)} ({syndromeToPosition(verifiedSyndrome) === 0 ? 'Zero' : 'Non-zero'})
                  </span>
                </div>
                <div style={{ padding: '0.85rem 1rem', background: 'var(--bg-card-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', display: 'block', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', fontWeight: 650 }}>C Matches Original O?</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 700, color: arraysEqual(correctedWord, encodedCodeword) ? 'var(--status-success-text)' : 'var(--status-danger-text)' }}>
                    {arraysEqual(correctedWord, encodedCodeword) ? 'Yes (Identity)' : 'No (Differ)'}
                  </span>
                </div>
              </div>

              <Callout
                type={
                  outcomeClassification.category === 'corrected'
                    ? 'success'
                    : outcomeClassification.category === 'no-error'
                    ? 'info'
                    : outcomeClassification.category === 'miscorrected'
                    ? 'danger'
                    : 'warning'
                }
                title={outcomeClassification.title}
              >
                {outcomeClassification.message}
              </Callout>
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: Sticky Visualisation Inspection Panel */}
        <div className="sticky-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card
            title="Inspection Panel"
            subtitle="Visual codeword inspection with dual representations."
            action={
              <div style={{ display: 'flex', gap: '0.35rem', background: 'var(--bg-glass-input)', padding: '0.2rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-subtle)' }}>
                <Button
                  variant={visualMode === 'bar' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setVisualMode('bar')}
                  style={{ borderRadius: 'var(--radius-full)' }}
                >
                  Linear Grid
                </Button>
                <Button
                  variant={visualMode === 'venn' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setVisualMode('venn')}
                  style={{ borderRadius: 'var(--radius-full)' }}
                >
                  Venn Circles
                </Button>
              </div>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
              {visualMode === 'bar' ? (
                <>
                  <Codeword
                    bits={currentStep >= 5 ? correctedWord : receivedWord}
                    corruptedPositions={currentStep >= 5 ? [] : corruptedPositions}
                    correctedPositions={currentStep >= 5 ? correctedPositions : []}
                    highlightedPositions={
                      activeCheck
                        ? PARITY_CHECKS.find((c) => c.id === activeCheck)?.positions || []
                        : []
                    }
                    onBitClick={handleBitFlip}
                    onBitHover={(pos) => setHoveredPosition(pos)}
                    size="md"
                  />
                  <ParityGroups
                    hoveredPosition={hoveredPosition}
                    activeCheck={activeCheck}
                    onCheckHover={(chk) => setActiveCheck(chk)}
                    size="md"
                  />
                </>
              ) : (
                <VennDiagram
                  bits={currentStep >= 5 ? correctedWord : receivedWord}
                  corruptedPositions={currentStep >= 5 ? [] : corruptedPositions}
                  syndromeBits={currentSyndrome}
                  onBitClick={handleBitFlip}
                />
              )}

              {/* Legend with Shape Badges */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '1.25rem',
                  fontSize: '0.78rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  color: 'var(--text-subtle)',
                  flexWrap: 'wrap',
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '0.85rem',
                  width: '100%'
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ width: '8px', height: '8px', background: 'var(--bit-parity-border)', borderRadius: '2px', transform: 'rotate(45deg)' }} />
                  Parity [P]
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ width: '8px', height: '8px', background: 'var(--bit-data-border)', borderRadius: '2px' }} />
                  Data [D]
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ width: '8px', height: '8px', background: 'var(--bit-corrupt-border)', borderRadius: '50%' }} />
                  Corrupted
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ width: '8px', height: '8px', background: 'var(--bit-corrected-border)', borderRadius: '50%' }} />
                  Corrected
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default SimulatorPage;
