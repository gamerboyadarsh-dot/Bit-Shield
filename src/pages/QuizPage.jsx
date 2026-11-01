import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, CheckCircle2, XCircle, ArrowRight, RotateCcw, Award, Sparkles, BookOpen, Brain, Zap, Target, Flame } from 'lucide-react';
import { Card } from '../components/Card.jsx';
import { Button } from '../components/Button.jsx';
import { Badge } from '../components/Badge.jsx';
import { Callout } from '../components/Callout.jsx';
import {
  encode,
  syndrome,
  syndromeToPosition,
  syndromeToString,
  flipBit,
  cwToString
} from '../lib/hamming.js';

export function QuizPage() {
  const [score, setScore] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);

  // Generate a random question
  const [currentQuestion, setCurrentQuestion] = useState(() => generateQuestion());

  function generateQuestion() {
    const types = ['parity', 'syndrome', 'theory'];
    const chosenType = types[Math.floor(Math.random() * types.length)];

    if (chosenType === 'parity') {
      const m = [
        Math.random() < 0.5 ? 0 : 1,
        Math.random() < 0.5 ? 0 : 1,
        Math.random() < 0.5 ? 0 : 1,
        Math.random() < 0.5 ? 0 : 1
      ];
      const pIdx = Math.floor(Math.random() * 3); // 0: p1, 1: p2, 2: p4
      const pName = ['p₁', 'p₂', 'p₄'][pIdx];
      const pFormula = ['d₃ ⊕ d₅ ⊕ d₇', 'd₃ ⊕ d₆ ⊕ d₇', 'd₅ ⊕ d₆ ⊕ d₇'][pIdx];
      const correctVal = [m[0] ^ m[1] ^ m[3], m[0] ^ m[2] ^ m[3], m[1] ^ m[2] ^ m[3]][pIdx];

      return {
        category: 'Parity Arithmetic',
        badgeColor: 'var(--accent-cyan)',
        prompt: `Given message m₁m₂m₃m₄ = ${m.join('')}, calculate parity bit ${pName} using formula ${pFormula}:`,
        options: [
          { text: `0`, isCorrect: correctVal === 0 },
          { text: `1`, isCorrect: correctVal === 1 }
        ],
        explanation: `${pName} = ${pFormula} = ${[m[0], m[1], m[2], m[3]].join(' ⊕ ')} = ${correctVal}.`
      };
    } else if (chosenType === 'syndrome') {
      // Pick a random message and flip one bit
      const m = [1, 0, 1, 1];
      const cw = encode(m);
      const flipPos = Math.floor(Math.random() * 7) + 1; // 1..7
      const recv = flipBit(cw, flipPos);
      const syn = syndrome(recv);
      const synStr = syndromeToString(syn);

      const options = [1, 2, 3, 4, 5, 6, 7].map((p) => ({
        text: `Position ${p}`,
        isCorrect: p === flipPos
      }));

      return {
        category: 'Syndrome Localization',
        badgeColor: 'var(--accent-amber)',
        prompt: `Received word is ${cwToString(recv)} (original was ${cwToString(cw)}). Syndrome S₄S₂S₁ evaluates to ${synStr}. Which position is corrupted?`,
        options,
        explanation: `Syndrome ${synStr} in binary equals decimal ${flipPos} (4·${syn[2]} + 2·${syn[1]} + 1·${syn[0]}). Hence, position ${flipPos} is identified.`
      };
    } else {
      return {
        category: 'Coding Theory',
        badgeColor: 'var(--accent-violet)',
        prompt: `In standard Hamming (7,4), what occurs if a transmission experiences exactly 2 bit errors?`,
        options: [
          { text: 'The receiver detects and successfully corrects both bit flips.', isCorrect: false },
          { text: 'The syndrome identifies a 3rd uncorrupted bit, leading to miscorrection.', isCorrect: true },
          { text: 'The syndrome always evaluates to 000, leaving it completely undetected.', isCorrect: false },
          { text: 'The parity-check matrix generates an invalid dimension error.', isCorrect: false }
        ],
        explanation: 'Hamming (7,4) has minimum distance 3. Two bit errors move the received vector to distance 1 from a different valid codeword, causing the single-error decoder to miscorrect.'
      };
    }
  }

  const handleSelect = (idx) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);
    setQuestionsAnswered((q) => q + 1);

    const isCorrect = currentQuestion.options[idx].isCorrect;
    if (isCorrect) {
      setScore((s) => s + 1);
      setStreak((st) => {
        const next = st + 1;
        setBestStreak((b) => Math.max(b, next));
        return next;
      });
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    setCurrentQuestion(generateQuestion());
  };

  const handleResetScore = () => {
    setScore(0);
    setQuestionsAnswered(0);
    setStreak(0);
    setBestStreak(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setCurrentQuestion(generateQuestion());
  };

  const percentage = questionsAnswered > 0 ? Math.round((score / questionsAnswered) * 100) : 0;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (circumference * percentage) / 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="eyebrow-label" style={{ marginBottom: '0.5rem' }}>
            <Award size={13} />
            <span>Self-Assessment Arena</span>
          </span>
          <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-main)', margin: 0 }}>
            Exam Revision &amp; Practice Quiz
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.35rem', margin: '0.35rem 0 0 0' }}>
            Procedurally generated challenges on Galois field XOR arithmetic, syndrome coordinates, and coding limits.
          </p>
        </div>

        <Button variant="ghost" size="sm" icon={RotateCcw} onClick={handleResetScore}>
          Reset Progress
        </Button>
      </div>

      {/* Main Two-Column Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2rem',
          alignItems: 'start'
        }}
      >
        {/* Left Column: Challenge Card (Level 2 Hero Card) */}
        <div style={{ gridColumn: 'span 1' }}>
          <Card
            level={2}
            halo={true}
            title="Interactive Practice Challenge"
            subtitle="Analyze the prompt and select the mathematically sound outcome."
            action={
              <Badge variant="neutral" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {currentQuestion.category}
              </Badge>
            }
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion.prompt}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}
              >
                {/* Prompt Box */}
                <div
                  style={{
                    padding: '1.25rem 1.4rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-glass-input)',
                    border: '1px solid var(--border-subtle)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)'
                  }}
                >
                  <p
                    style={{
                      fontSize: '1.15rem',
                      fontWeight: 650,
                      color: 'var(--text-main)',
                      lineHeight: 1.6,
                      letterSpacing: '-0.015em',
                      margin: 0
                    }}
                  >
                    {currentQuestion.prompt}
                  </p>
                </div>

                {/* Options List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {currentQuestion.options.map((opt, idx) => {
                    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
                    let bg = 'var(--bg-glass-input)';
                    let border = 'var(--border-subtle)';
                    let textColor = 'var(--text-main)';
                    let glow = 'none';

                    if (isAnswered) {
                      if (opt.isCorrect) {
                        bg = 'rgba(52, 211, 153, 0.12)';
                        border = 'rgba(52, 211, 153, 0.6)';
                        textColor = 'var(--status-success-text)';
                        glow = '0 0 20px rgba(52, 211, 153, 0.35)';
                      } else if (selectedOption === idx) {
                        bg = 'rgba(251, 113, 133, 0.12)';
                        border = 'rgba(251, 113, 133, 0.6)';
                        textColor = 'var(--status-danger-text)';
                        glow = '0 0 20px rgba(251, 113, 133, 0.35)';
                      }
                    }

                    return (
                      <motion.button
                        key={idx}
                        type="button"
                        onClick={() => handleSelect(idx)}
                        disabled={isAnswered}
                        whileHover={!isAnswered ? { scale: 1.01, y: -2 } : {}}
                        whileTap={!isAnswered ? { scale: 0.99 } : {}}
                        animate={
                          isAnswered && selectedOption === idx && !opt.isCorrect
                            ? { x: [-4, 4, -3, 3, 0] }
                            : {}
                        }
                        transition={{ duration: 0.25 }}
                        style={{
                          padding: '1rem 1.25rem',
                          borderRadius: 'var(--radius-md)',
                          background: bg,
                          border: `1.5px solid ${border}`,
                          color: textColor,
                          textAlign: 'left',
                          fontSize: '0.95rem',
                          fontWeight: 600,
                          cursor: isAnswered ? 'default' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          justifyContent: 'space-between',
                          boxShadow: glow,
                          outline: 'none',
                          transition: 'border-color 0.2s, background-color 0.2s, box-shadow 0.2s'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                          <span
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: 'var(--radius-xs)',
                              background: isAnswered && opt.isCorrect
                                ? 'rgba(52, 211, 153, 0.25)'
                                : 'var(--bg-glass-input)',
                              border: `1px solid ${isAnswered && opt.isCorrect ? 'var(--status-success-border)' : 'var(--border-subtle)'}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              color: isAnswered && opt.isCorrect ? 'var(--status-success-text)' : 'var(--text-subtle)',
                              flexShrink: 0
                            }}
                          >
                            {letters[idx] || idx + 1}
                          </span>
                          <span style={{ lineHeight: 1.5 }}>{opt.text}</span>
                        </div>

                        {isAnswered && opt.isCorrect && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ flexShrink: 0 }}>
                            <CheckCircle2 size={22} strokeWidth={2.5} style={{ color: 'var(--status-success-border)' }} />
                          </motion.div>
                        )}
                        {isAnswered && selectedOption === idx && !opt.isCorrect && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ flexShrink: 0 }}>
                            <XCircle size={22} strokeWidth={2.5} style={{ color: 'var(--status-danger-border)' }} />
                          </motion.div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Explanation Box & Next Button */}
                {isAnswered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '0.5rem' }}
                  >
                    <Callout
                      type={currentQuestion.options[selectedOption]?.isCorrect ? 'success' : 'danger'}
                      title={currentQuestion.options[selectedOption]?.isCorrect ? 'Correct Solution' : 'Incorrect Solution'}
                    >
                      {currentQuestion.explanation}
                    </Callout>

                    <Button
                      variant="primary"
                      onClick={handleNext}
                      icon={ArrowRight}
                      iconPosition="right"
                      size="lg"
                      style={{ alignSelf: 'flex-start' }}
                    >
                      Next Challenge
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </Card>
        </div>

        {/* Right Column: Telemetry & Reference Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Performance & Scorecard Card (Level 1) */}
          <Card
            level={1}
            title="Telemetry & Mastery"
            subtitle="Live tracking of your analytical proficiency."
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
              {/* Circular SVG Score Ring */}
              <div style={{ position: 'relative', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
                  {/* Track circle */}
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="transparent"
                    stroke="var(--bg-card-subtle)"
                    strokeWidth="8"
                  />
                  {/* Progress circle */}
                  <motion.circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="transparent"
                    stroke={
                      percentage >= 75
                        ? '#34d399'
                        : percentage >= 50
                        ? '#fbbf24'
                        : '#6366f1'
                    }
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    animate={{ strokeDashoffset: questionsAnswered > 0 ? strokeOffset : circumference }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    strokeLinecap="round"
                  />
                </svg>

                {/* Score text in center */}
                <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="mono tabular-nums" style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>
                    {questionsAnswered > 0 ? `${percentage}%` : '0%'}
                  </span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', marginTop: '0.2rem' }}>
                    Accuracy
                  </span>
                </div>
              </div>

              {/* Metrics Grid */}
              <div
                style={{
                  width: '100%',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '0.75rem',
                  textAlign: 'center'
                }}
              >
                <div
                  style={{
                    padding: '0.75rem 0.5rem',
                    background: 'var(--bg-glass-input)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
                    Correct
                  </span>
                  <span className="mono tabular-nums" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--status-success-border)' }}>
                    {score}
                  </span>
                </div>

                <div
                  style={{
                    padding: '0.75rem 0.5rem',
                    background: 'var(--bg-glass-input)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
                    Completed
                  </span>
                  <span className="mono tabular-nums" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                    {questionsAnswered}
                  </span>
                </div>

                <div
                  style={{
                    padding: '0.75rem 0.5rem',
                    background: 'var(--bg-glass-input)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
                    Streak
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                    {streak > 1 && <Flame size={14} style={{ color: 'var(--accent-amber)' }} />}
                    <span className="mono tabular-nums" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-amber)' }}>
                      {streak}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Mathematical Formula Cheat Sheet */}
          <Card
            level={1}
            title="Formula Reference Sheet"
            subtitle="Core identities governing Hamming (7,4)."
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-glass-input)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase', marginBottom: '0.25rem', letterSpacing: '0.04em' }}>
                  Parity Equations
                </div>
                <div className="mono tabular-nums" style={{ fontSize: '0.825rem', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <span>p₁ = d₃ ⊕ d₅ ⊕ d₇</span>
                  <span>p₂ = d₃ ⊕ d₆ ⊕ d₇</span>
                  <span>p₄ = d₅ ⊕ d₆ ⊕ d₇</span>
                </div>
              </div>

              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-glass-input)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-amber)', textTransform: 'uppercase', marginBottom: '0.25rem', letterSpacing: '0.04em' }}>
                  Syndrome Address Decoder
                </div>
                <div className="mono tabular-nums" style={{ fontSize: '0.825rem', color: 'var(--text-main)' }}>
                  Index = 4·S₄ + 2·S₂ + 1·S₁
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Non-zero result yields the exact bit coordinate requiring inversion.
                </div>
              </div>

              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-glass-input)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-emerald)', textTransform: 'uppercase', marginBottom: '0.25rem', letterSpacing: '0.04em' }}>
                  Coding Bounds
                </div>
                <div className="mono tabular-nums" style={{ fontSize: '0.825rem', color: 'var(--text-main)' }}>
                  d_min = 3 &nbsp;|&nbsp; t = ⌊(3-1)/2⌋ = 1 bit error
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default QuizPage;