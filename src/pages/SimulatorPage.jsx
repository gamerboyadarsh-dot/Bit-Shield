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
  Activity,
  Layers,
  Terminal,
  ShieldAlert,
  HelpCircle
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

  // Hover states for bi-directional highlighting
  const [hoveredPosition, setHoveredPosition] = useState(null);
  const [activeCheck, setActiveCheck] = useState(null);

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* Header & Global Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="eyebrow-label">
            <Sparkles size={12} className="gradient-text-accent" />
            <span className="gradient-text-accent">INTERACTIVE LABORATORY</span>
          </span>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 850, letterSpacing: '-0.035em', color: 'var(--text-main)', margin: '0.2rem 0 0.35rem 0' }}>
            Hamming (7,4) Simulator
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', margin: 0 }}>
            Autonomous single-error detection, syndrome decoding, and Galois field GF(2) parity analysis.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <Sparkles size={16} strokeWidth={2.2} style={{ color: 'var(--accent)' }} />
            <span style={{ fontSize: '0.9rem', fontWeight: 750, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
              Quick Scenario Presets:
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
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

      {/* Sticky Step Progress Tracker */}
      <StepIndicator currentStep={currentStep} onStepClick={(s) => setCurrentStep(s)} />

      {/* Two-Column Responsive Workspace */}
      <div className="grid-2col" style={{ alignItems: 'start', gap: '2rem' }}>
        {/* LEFT COLUMN: Interactive Stage Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* STEP 1: Message Encoding */}
          <Card
            title="1. Message Encoding"
            subtitle="Enter 4 binary message bits (m₁m₂m₃m₄) mapping to positions d₃, d₅, d₆, d₇."
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.65rem' }}>
              {/* 72px Tactile Bit Toggles */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.65rem' }}>
                  Interactive Message Toggles (Click to Flip)
                </label>
                <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
                  {toggleBits.map((b, i) => (
                    <motion.button
                      key={i}
                      type="button"
                      onClick={() => handleToggleClick(i)}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.94 }}
                      style={{
                        width: '72px',
                        height: '72px',
                        borderRadius: 'var(--radius-lg)',
                        border: `2px solid ${b ? 'var(--accent)' : 'var(--border-card)'}`,
                        background: b
                          ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
                          : 'var(--bg-glass-input)',
                        color: b ? '#ffffff' : 'var(--text-muted)',
                        boxShadow: b
                          ? '0 0 32px rgba(99, 102, 241, 0.7), 0 0 12px rgba(99, 102, 241, 0.4), inset 0 1px 0 rgba(255,255,255,0.4)'
                          : 'var(--shadow-sm)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '1.75rem',
                        fontWeight: 850,
                        cursor: 'pointer',
                        outline: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.15rem',
                        transition: 'border-color 0.15s, background 0.15s, box-shadow 0.15s'
                      }}
                      aria-label={`Message bit m${i + 1}, currently ${b}, click to toggle`}
                    >
                      <span style={b ? { textShadow: '0 0 12px rgba(255,255,255,0.9), 0 0 24px rgba(165,180,252,0.7)' } : {}}>{b}</span>
                      <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: b ? '#e0e7ff' : 'var(--text-subtle)', fontWeight: 700 }}>
                        m{i + 1}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Terminal Code Input Style */}
              <div>
                <label htmlFor="msg-text-input" style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.45rem' }}>
                  Binary Terminal Input
                </label>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <div
                    style={{
                      position: 'relative',
                      display: 'inline-flex',
                      alignItems: 'center'
                    }}
                  >
                    <input
                      id="msg-text-input"
                      type="text"
                      value={inputText}
                      onChange={handleTextChange}
                      onKeyDown={(e) => e.key === 'Enter' && handleEncode()}
                      maxLength={4}
                      style={{
                        padding: '0.65rem 1rem 0.65rem 1rem',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '1.25rem',
                        fontWeight: 800,
                        borderRadius: 'var(--radius-md)',
                        border: `1.5px solid ${inputError ? 'var(--status-danger-border)' : 'var(--border-glow)'}`,
                        background: 'var(--bg-glass-input)',
                        color: 'var(--text-main)',
                        width: '140px',
                        letterSpacing: '0.3em',
                        outline: 'none',
                        boxShadow: inputError ? '0 0 16px rgba(244, 63, 94, 0.3)' : '0 0 16px rgba(99, 102, 241, 0.25)',
                        transition: 'all 0.2s'
                      }}
                      placeholder="1011"
                    />
                  </div>
                  <Button variant="primary" onClick={() => handleEncode()} icon={ArrowRight} iconPosition="right">
                    Encode Payload
                  </Button>
                </div>
                {inputError && (
                  <p style={{ color: 'var(--status-danger-text)', fontSize: '0.825rem', marginTop: '0.45rem', fontWeight: 650 }}>
                    {inputError}
                  </p>
                )}
              </div>

              {/* Three Parity Equation Cards */}
              <div>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.5rem' }}>
                  Parity Derivation Equations (Even Parity)
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {encodedParity.map((eq) => (
                    <motion.div
                      key={eq.bit}
                      whileHover={{ scale: 1.01 }}
                      className="glass-l1"
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        border: '1px solid var(--border-subtle)'
                      }}
                    >
                      <span className="mono tabular-nums" style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 650 }}>
                        {eq.expression}
                      </span>
                      <Badge variant="parity" size="sm">
                        {eq.bit} = {eq.value}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* STEP 2: Introduce Channel Noise */}
          <Card
            title="2. Introduce Channel Error"
            subtitle="Inject single or multiple bit flips to test autonomous recovery."
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.65rem' }}>
              {/* iOS-Style Switch: Multiple-Error Mode */}
              <motion.div
                whileHover={{ y: -2 }}
                onClick={() => {
                  const nextVal = !multiErrorMode;
                  setMultiErrorMode(nextVal);
                  if (!nextVal && corruptedPositions.length > 1) {
                    setCorruptedPositions(corruptedPositions.slice(0, 1));
                  }
                }}
                className="glass-l1"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem 1.25rem',
                  borderRadius: 'var(--radius-lg)',
                  border: `1.5px solid ${multiErrorMode ? 'var(--status-warning-border)' : 'var(--border-subtle)'}`,
                  background: multiErrorMode ? 'var(--status-warning-bg)' : 'var(--bg-glass-input)',
                  cursor: 'pointer',
                  boxShadow: multiErrorMode ? '0 0 20px rgba(251, 191, 36, 0.25)' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: 'var(--radius-md)',
                      background: multiErrorMode ? 'rgba(251, 191, 36, 0.2)' : 'var(--bg-card-subtle)',
                      color: multiErrorMode ? 'var(--accent-amber)' : 'var(--text-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Zap size={20} strokeWidth={2} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.95rem', fontWeight: 750, color: 'var(--text-main)', display: 'block' }}>
                      Multi-Error Stress Mode
                    </span>
                    <span style={{ fontSize: '0.825rem', color: 'var(--text-subtle)' }}>
                      Flip 2+ bits to demonstrate miscorrection &amp; distance limits.
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    width: '46px',
                    height: '26px',
                    borderRadius: 'var(--radius-full)',
                    background: multiErrorMode ? 'var(--accent-amber)' : 'var(--border-card)',
                    position: 'relative',
                    transition: 'background-color 0.2s',
                    flexShrink: 0
                  }}
                >
                  <motion.div
                    animate={{ x: multiErrorMode ? 22 : 3 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: '#ffffff',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                      position: 'absolute',
                      top: '3px'
                    }}
                  />
                </div>
              </motion.div>

              {/* iOS-Style Switch: SECDED Mode */}
              <motion.div
                whileHover={{ y: -2 }}
                onClick={() => setSecdedMode(!secdedMode)}
                className="glass-l1"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem 1.25rem',
                  borderRadius: 'var(--radius-lg)',
                  border: `1.5px solid ${secdedMode ? 'var(--bit-parity-border)' : 'var(--border-subtle)'}`,
                  background: secdedMode ? 'var(--bit-parity-bg)' : 'var(--bg-glass-input)',
                  cursor: 'pointer',
                  boxShadow: secdedMode ? '0 0 20px rgba(34, 211, 238, 0.25)' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: 'var(--radius-md)',
                      background: secdedMode ? 'rgba(34, 211, 238, 0.2)' : 'var(--bg-card-subtle)',
                      color: secdedMode ? 'var(--accent-cyan)' : 'var(--text-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Shield size={20} strokeWidth={2} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.95rem', fontWeight: 750, color: 'var(--text-main)', display: 'block' }}>
                      SECDED (Hamming 8,4) Extension
                    </span>
                    <span style={{ fontSize: '0.825rem', color: 'var(--text-subtle)' }}>
                      Appends 8th overall parity bit p₈ to flag uncorrectable double errors.
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    width: '46px',
                    height: '26px',
                    borderRadius: 'var(--radius-full)',
                    background: secdedMode ? 'var(--bit-parity-border)' : 'var(--border-card)',
                    position: 'relative',
                    transition: 'background-color 0.2s',
                    flexShrink: 0
                  }}
                >
                  <motion.div
                    animate={{ x: secdedMode ? 22 : 3 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: '#ffffff',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                      position: 'absolute',
                      top: '3px'
                    }}
                  />
                </div>
              </motion.div>

              {/* Aligned Bit-Chip Comparison Rows (c vs r) */}
              <div
                className="glass-panel"
                style={{
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-glass-input)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--text-subtle)', textTransform: 'uppercase' }}>
                    Transmitted (c) vs Received (r) Vector
                  </span>
                  {corruptedPositions.length > 0 && (
                    <Badge variant="danger" size="sm">
                      {corruptedPositions.length} Error{corruptedPositions.length > 1 ? 's' : ''} Detected
                    </Badge>
                  )}
                </div>

                {/* Grid Comparison */}
                <div style={{ display: 'grid', gridTemplateColumns: '80px repeat(7, 1fr)', gap: '6px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-subtle)' }}>Trans (c):</span>
                  {encodedCodeword.map((b, idx) => (
                    <span
                      key={idx}
                      className="mono tabular-nums"
                      style={{
                        padding: '0.35rem',
                        textAlign: 'center',
                        borderRadius: 'var(--radius-xs)',
                        background: 'var(--bg-card-subtle)',
                        fontWeight: 700,
                        fontSize: '0.95rem'
                      }}
                    >
                      {b}
                    </span>
                  ))}

                  <span style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-subtle)' }}>Recv (r):</span>
                  {receivedWord.map((b, idx) => {
                    const pos = idx + 1;
                    const isDiff = corruptedPositions.includes(pos);
                    return (
                      <span
                        key={idx}
                        className="mono tabular-nums"
                        style={{
                          padding: '0.35rem',
                          textAlign: 'center',
                          borderRadius: 'var(--radius-xs)',
                          background: isDiff ? 'var(--bit-corrupt-bg)' : 'var(--bg-card-subtle)',
                          border: isDiff ? '1px solid var(--bit-corrupt-border)' : '1px solid transparent',
                          color: isDiff ? 'var(--bit-corrupt-text)' : 'var(--text-main)',
                          fontWeight: 800,
                          fontSize: '0.95rem',
                          boxShadow: isDiff ? 'var(--bit-corrupt-glow)' : 'none'
                        }}
                      >
                        {b}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Channel Status Banner */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  padding: '1rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  background: corruptedPositions.length > 0 ? 'var(--bit-corrupt-bg)' : 'var(--bg-card-subtle)',
                  border: `1.5px solid ${corruptedPositions.length > 0 ? 'var(--bit-corrupt-border)' : 'var(--border-subtle)'}`,
                  boxShadow: corruptedPositions.length > 0 ? 'var(--bit-corrupt-glow)' : 'none'
                }}
              >
                {corruptedPositions.length > 0 ? (
                  <ShieldAlert size={22} strokeWidth={2.2} style={{ color: 'var(--bit-corrupt-border)' }} />
                ) : (
                  <Shield size={22} strokeWidth={2.2} style={{ color: 'var(--accent-cyan)' }} />
                )}
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '0.925rem', fontWeight: 750, color: 'var(--text-main)', display: 'block' }}>
                    {corruptedPositions.length > 0
                      ? `${corruptedPositions.length} Bit Error${corruptedPositions.length > 1 ? 's' : ''} Injected: Pos [${corruptedPositions.join(', ')}]`
                      : 'Channel Clean (No Inversions)'}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {corruptedPositions.length > 0
                      ? 'Syndrome computation will locate the inverted coordinate.'
                      : 'Click any bit in the right-hand inspection panel to introduce noise.'}
                  </span>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                onClick={() => setCurrentStep(3)}
                icon={ArrowRight}
                iconPosition="right"
                style={{ alignSelf: 'flex-start' }}
              >
                Evaluate Syndrome Vector
              </Button>
            </div>
          </Card>

          {/* STEP 3 & 4: Syndrome Calculation & Correction */}
          <Card
            title="3. Syndrome Evaluation &amp; Correction"
            subtitle="Evaluate parity checks across the received word."
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {synBreakdown.map((chk) => (
                  <div
                    key={chk.id}
                    className="glass-l1"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.85rem 1.15rem',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.925rem'
                    }}
                  >
                    <div>
                      <strong style={{ color: 'var(--accent)', marginRight: '0.65rem', fontFamily: 'var(--font-mono)' }}>{chk.check}</strong>
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

              {/* SECDED Overall Parity Readout */}
              {secdedMode && (
                <div style={{ padding: '1rem 1.25rem', background: 'var(--bit-parity-bg)', border: '1.5px solid var(--bit-parity-border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--bit-parity-glow)' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 750, color: 'var(--bit-parity-text)' }}>
                    SECDED 8th Parity Check (P = ⨁ rᵢ): {secdedEval.overallParity} ({secdedEval.overallParity === 0 ? 'Even / Pass' : 'Odd / Fail'})
                  </span>
                  <div style={{ fontSize: '0.85rem', color: 'var(--bit-parity-text)', marginTop: '0.35rem' }}>
                    Diagnosis: <strong>{secdedEval.diagnosis.replace(/_/g, ' ')}</strong>
                  </div>
                </div>
              )}

              {/* Diagnosis Banner */}
              <div
                style={{
                  padding: '1.25rem 1.5rem',
                  borderRadius: 'var(--radius-md)',
                  background: detectedPos === 0 ? 'var(--status-success-bg)' : 'var(--status-warning-bg)',
                  border: `1.5px solid ${detectedPos === 0 ? 'var(--status-success-border)' : 'var(--status-warning-border)'}`,
                  boxShadow: detectedPos === 0 ? '0 0 20px rgba(52, 211, 153, 0.25)' : '0 0 20px rgba(251, 191, 36, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}
              >
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', display: 'block', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>
                    Calculated Syndrome (S₄ S₂ S₁)
                  </span>
                  <span className="mono tabular-nums" style={{ fontSize: '1.45rem', fontWeight: 850 }}>
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
                size="lg"
                onClick={handleApplyCorrection}
                icon={CheckCircle2}
                disabled={detectedPos === 0 && currentStep >= 4}
                style={{ alignSelf: 'flex-start' }}
              >
                {detectedPos === 0 ? 'Verify Codeword' : `Invert & Correct Bit ${detectedPos}`}
              </Button>
            </div>
          </Card>

          {/* STEP 5: Verification & Classification */}
          <Card
            title="4. Verification &amp; Classification"
            subtitle="Re-evaluates syndrome on corrected word and verifies against original codeword."
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                <div className="glass-panel" style={{ padding: '1rem', background: 'var(--bg-glass-input)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', display: 'block', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>Recomputed Syn(C)</span>
                  <span className="mono tabular-nums" style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                    {syndromeToString(verifiedSyndrome, true)} ({syndromeToPosition(verifiedSyndrome) === 0 ? 'Zero / Pass' : 'Non-zero'})
                  </span>
                </div>
                <div className="glass-panel" style={{ padding: '1rem', background: 'var(--bg-glass-input)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', display: 'block', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>C Matches Original O?</span>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, color: arraysEqual(correctedWord, encodedCodeword) ? 'var(--status-success-text)' : 'var(--status-danger-text)' }}>
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

        {/* RIGHT COLUMN: Sticky Hero Level 2 Inspection Panel */}
        <div className="sticky-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card
            level={2}
            halo={true}
            title="Inspection Panel"
            subtitle="Dual representations with live interactive bit-flipping."
            action={
              <div style={{ display: 'flex', gap: '0.35rem', background: 'var(--bg-glass-input)', padding: '0.25rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-subtle)' }}>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', alignItems: 'center' }}>
              {/* Syndrome Rolling Slot Tiles */}
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'var(--bg-glass-input)',
                  padding: '0.75rem 1.15rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-glow)'
                }}
              >
                <div>
                  <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--text-subtle)', textTransform: 'uppercase' }}>
                    Active Syndrome
                  </span>
                  <div style={{ display: 'flex', gap: '0.45rem', marginTop: '0.2rem' }}>
                    {currentSyndrome.map((b, idx) => (
                      <motion.span
                        key={`${idx}-${b}`}
                        initial={{ rotateX: 90, opacity: 0 }}
                        animate={{ rotateX: 0, opacity: 1 }}
                        className="mono tabular-nums"
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: 'var(--radius-xs)',
                          background: b ? 'var(--accent-amber)' : 'var(--bg-card-subtle)',
                          color: b ? '#ffffff' : 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 850,
                          fontSize: '1rem',
                          boxShadow: b ? '0 0 10px var(--accent-amber)' : 'none'
                        }}
                      >
                        {b}
                      </motion.span>
                    ))}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--text-subtle)', textTransform: 'uppercase' }}>
                    Decoder Address
                  </span>
                  <div style={{ marginTop: '0.2rem' }}>
                    <Badge variant={detectedPos === 0 ? 'success' : 'danger'}>
                      {detectedPos === 0 ? 'Zero / Clean' : `Coordinate ${detectedPos}`}
                    </Badge>
                  </div>
                </div>
              </div>

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

              {/* Pill-Style Legend Chips at Bottom */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '0.65rem',
                  fontSize: '0.78rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  color: 'var(--text-subtle)',
                  flexWrap: 'wrap',
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '1rem',
                  width: '100%'
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.25rem 0.65rem',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--bg-glass-input)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <span style={{ width: '8px', height: '8px', background: 'var(--bit-parity-border)', borderRadius: '2px', transform: 'rotate(45deg)' }} />
                  Parity [P]
                </span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.25rem 0.65rem',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--bg-glass-input)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <span style={{ width: '8px', height: '8px', background: 'var(--bit-data-border)', borderRadius: '2px' }} />
                  Data [D]
                </span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.25rem 0.65rem',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--bg-glass-input)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <span style={{ width: '8px', height: '8px', background: 'var(--bit-corrupt-border)', borderRadius: '50%' }} />
                  Corrupted
                </span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.25rem 0.65rem',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--bg-glass-input)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
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
