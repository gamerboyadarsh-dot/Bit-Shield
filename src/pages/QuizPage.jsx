import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, CheckCircle2, XCircle, ArrowRight, RotateCcw, Award, Sparkles, BookOpen } from 'lucide-react';
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
        prompt: `Received word is ${cwToString(recv)} (original was ${cwToString(cw)}). Syndrome S₄S₂S₁ evaluates to ${synStr}. Which position is corrupted?`,
        options,
        explanation: `Syndrome ${synStr} in binary equals decimal ${flipPos} (4·${syn[2]} + 2·${syn[1]} + 1·${syn[0]}). Hence, position ${flipPos} is identified.`
      };
    } else {
      return {
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

    if (currentQuestion.options[idx].isCorrect) {
      setScore((s) => s + 1);
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
    setSelectedOption(null);
    setIsAnswered(false);
    setCurrentQuestion(generateQuestion());
  };

  const percentage = questionsAnswered > 0 ? Math.round((score / questionsAnswered) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="mono" style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Self-Assessment
            </span>
          </div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-main)', margin: 0 }}>
            Exam Revision &amp; Practice Quiz
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.25rem', margin: '0.25rem 0 0 0' }}>
            Procedurally generated challenges on Galois field XOR arithmetic, syndrome coordinates, and coding limits.
          </p>
        </div>

        {/* Score Readout Card */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            className="glass-panel"
            style={{
              padding: '0.65rem 1.15rem',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              border: '1px solid var(--border-glow)'
            }}
          >
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', fontWeight: 700, display: 'block' }}>
                Accuracy Score
              </span>
              <span className="mono tabular-nums" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                {score} / {questionsAnswered} {questionsAnswered > 0 ? `(${percentage}%)` : ''}
              </span>
            </div>
            {questionsAnswered > 0 && (
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  border: `3px solid ${percentage >= 70 ? 'var(--status-success-border)' : 'var(--accent-amber)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  fontWeight: 800
                }}
              >
                {percentage}%
              </div>
            )}
          </div>

          <Button variant="ghost" size="sm" icon={RotateCcw} onClick={handleResetScore}>
            Reset
          </Button>
        </div>
      </div>

      {/* Question Card */}
      <Card
        title="Interactive Practice Question"
        subtitle="Select the correct mathematical outcome."
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
            <p
              style={{
                fontSize: '1.15rem',
                fontWeight: 600,
                color: 'var(--text-main)',
                lineHeight: 1.6,
                letterSpacing: '-0.01em',
                margin: 0
              }}
            >
              {currentQuestion.prompt}
            </p>

            {/* Options Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {currentQuestion.options.map((opt, idx) => {
                let bg = 'var(--bg-card-subtle)';
                let border = 'var(--border-subtle)';
                let textColor = 'var(--text-main)';
                let glow = 'none';

                if (isAnswered) {
                  if (opt.isCorrect) {
                    bg = 'var(--status-success-bg)';
                    border = 'var(--status-success-border)';
                    textColor = 'var(--status-success-text)';
                    glow = '0 0 16px rgba(52, 211, 153, 0.3)';
                  } else if (selectedOption === idx) {
                    bg = 'var(--status-danger-bg)';
                    border = 'var(--status-danger-border)';
                    textColor = 'var(--status-danger-text)';
                    glow = '0 0 16px rgba(251, 113, 133, 0.3)';
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
                    transition={{ duration: 0.3 }}
                    style={{
                      padding: '1rem 1.35rem',
                      borderRadius: 'var(--radius-md)',
                      background: bg,
                      border: `1.5px solid ${border}`,
                      color: textColor,
                      textAlign: 'left',
                      fontSize: '0.975rem',
                      fontWeight: 600,
                      cursor: isAnswered ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      boxShadow: glow,
                      outline: 'none',
                      transition: 'border-color 0.2s, background-color 0.2s, box-shadow 0.2s'
                    }}
                  >
                    <span>{opt.text}</span>
                    {isAnswered && opt.isCorrect && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        <CheckCircle2 size={20} strokeWidth={2.5} style={{ color: 'var(--status-success-border)' }} />
                      </motion.div>
                    )}
                    {isAnswered && selectedOption === idx && !opt.isCorrect && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        <XCircle size={20} strokeWidth={2.5} style={{ color: 'var(--status-danger-border)' }} />
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
  );
}

export default QuizPage;
