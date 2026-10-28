import React, { useState } from 'react';
import { HelpCircle, CheckCircle2, XCircle, ArrowRight, RotateCcw, Award } from 'lucide-react';
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Exam Revision & Practice Quiz
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginTop: '0.25rem' }}>
            Randomized practice questions on Galois field arithmetic, syndrome localization, and coding limits.
          </p>
        </div>

        {/* Score Readout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ padding: '0.5rem 1rem', background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', display: 'block' }}>Current Score</span>
            <span className="mono tabular-nums" style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--accent)' }}>
              {score} / {questionsAnswered} {questionsAnswered > 0 ? `(${Math.round((score / questionsAnswered) * 100)}%)` : ''}
            </span>
          </div>

          <Button variant="ghost" size="sm" icon={RotateCcw} onClick={handleResetScore}>
            Reset
          </Button>
        </div>
      </div>

      {/* Question Card */}
      <Card title="Practice Challenge">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <p style={{ fontSize: '1.0625rem', fontWeight: 500, color: 'var(--text-main)', lineHeight: 1.6 }}>
            {currentQuestion.prompt}
          </p>

          {/* Options Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {currentQuestion.options.map((opt, idx) => {
              let bg = 'var(--bg-card-subtle)';
              let border = 'var(--border-subtle)';
              let textColor = 'var(--text-main)';

              if (isAnswered) {
                if (opt.isCorrect) {
                  bg = 'var(--status-success-bg)';
                  border = 'var(--status-success-border)';
                  textColor = 'var(--status-success-text)';
                } else if (selectedOption === idx) {
                  bg = 'var(--status-danger-bg)';
                  border = 'var(--status-danger-border)';
                  textColor = 'var(--status-danger-text)';
                }
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelect(idx)}
                  disabled={isAnswered}
                  style={{
                    padding: '0.875rem 1.25rem',
                    borderRadius: 'var(--radius-md)',
                    background: bg,
                    border: `1px solid ${border}`,
                    color: textColor,
                    textAlign: 'left',
                    fontSize: '0.9375rem',
                    fontWeight: 500,
                    cursor: isAnswered ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>{opt.text}</span>
                  {isAnswered && opt.isCorrect && <CheckCircle2 size={18} strokeWidth={2} />}
                  {isAnswered && selectedOption === idx && !opt.isCorrect && <XCircle size={18} strokeWidth={2} />}
                </button>
              );
            })}
          </div>

          {/* Explanation Box */}
          {isAnswered && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
              <Callout
                type={currentQuestion.options[selectedOption]?.isCorrect ? 'success' : 'danger'}
                title={currentQuestion.options[selectedOption]?.isCorrect ? 'Correct!' : 'Incorrect'}
              >
                {currentQuestion.explanation}
              </Callout>

              <Button
                variant="primary"
                onClick={handleNext}
                icon={ArrowRight}
                iconPosition="right"
                style={{ alignSelf: 'flex-start' }}
              >
                Next Question
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
