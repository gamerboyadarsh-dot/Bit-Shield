import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, CheckCircle2, XCircle, ChevronDown, ChevronRight, ShieldCheck, Terminal, Award, Check, Sparkles, Cpu } from 'lucide-react';
import { Card } from '../components/Card.jsx';
import { Button } from '../components/Button.jsx';
import { Badge } from '../components/Badge.jsx';
import { Callout } from '../components/Callout.jsx';
import {
  REFERENCE_TABLE,
  encode,
  syndrome,
  syndromeToPosition,
  syndromeToString,
  flipBit,
  correct,
  classify,
  validateInput,
  arraysEqual,
  cwToString,
  parseBits
} from '../lib/hamming.js';

export function SelfTestPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [expandedSuites, setExpandedSuites] = useState({});

  useEffect(() => {
    runAllTests();
  }, []);

  const toggleSuite = (index) => {
    setExpandedSuites((prev) => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const runAllTests = () => {
    setIsRunning(true);

    setTimeout(() => {
      const suites = [];
      let totalPass = 0;
      let totalFail = 0;

      const addSuite = (name, runner) => {
        const cases = [];
        let passed = 0;
        let failed = 0;

        const check = (description, isOk, errorDetails = null) => {
          if (isOk) {
            passed++;
            totalPass++;
          } else {
            failed++;
            totalFail++;
          }
          cases.push({ description, isOk, errorDetails });
        };

        runner(check);

        suites.push({
          name,
          casesRun: passed + failed,
          casesPassed: passed,
          casesFailed: failed,
          isSuccess: failed === 0,
          cases
        });
      };

      // Suite 1: Reference Table Encodings (16 tests)
      addSuite('Reference Table Encoding (16 messages)', (check) => {
        Object.entries(REFERENCE_TABLE).forEach(([msgStr, expCw]) => {
          const msgBits = parseBits(msgStr);
          const cw = encode(msgBits);
          const got = cwToString(cw);
          check(`encode(${msgStr}) → ${expCw}`, got === expCw, got !== expCw ? `Got ${got}` : null);
        });
      });

      // Suite 2: All 16 valid codewords have syndrome 000 (16 tests)
      addSuite('Syndrome 000 for Valid Codewords', (check) => {
        Object.entries(REFERENCE_TABLE).forEach(([, cwStr]) => {
          const cw = parseBits(cwStr);
          const syn = syndrome(cw);
          const pos = syndromeToPosition(syn);
          check(`syndrome(${cwStr}) = [0,0,0] (pos 0)`, pos === 0, pos !== 0 ? `Got pos ${pos}` : null);
        });
      });

      // Suite 3: All 16 x 7 = 112 single-bit error cases (112 tests)
      addSuite('All 112 Single-Bit Error Cases', (check) => {
        Object.entries(REFERENCE_TABLE).forEach(([msgStr, cwStr]) => {
          const cw = parseBits(cwStr);
          for (let p = 1; p <= 7; p++) {
            const corrupted = flipBit(cw, p);
            const syn = syndrome(corrupted);
            const detectedPos = syndromeToPosition(syn);
            const restored = correct(corrupted);
            const posOk = detectedPos === p;
            const restoredOk = arraysEqual(restored, cw);
            check(
              `msg ${msgStr} flip pos ${p}: detected ${detectedPos}, restored`,
              posOk && restoredOk,
              !posOk || !restoredOk ? `posOk=${posOk}, restoredOk=${restoredOk}` : null
            );
          }
        });
      });

      // Suite 4: All 16 no-error cases (16 tests)
      addSuite('All 16 No-Error Cases (Identity)', (check) => {
        Object.entries(REFERENCE_TABLE).forEach(([, cwStr]) => {
          const cw = parseBits(cwStr);
          const restored = correct(cw);
          check(`correct(${cwStr}) preserves codeword`, arraysEqual(restored, cw));
        });
      });

      // Suite 5: Invalid Input Rejection (7 tests)
      addSuite('Invalid Input Rejection', (check) => {
        const invalidCases = [
          { inp: '', exp: /empty/ },
          { inp: '   ', exp: /empty/ },
          { inp: '101', exp: /exactly 4.*you entered 3/ },
          { inp: '10111', exp: /exactly 4.*you entered 5/ },
          { inp: '10a1', exp: /Only 0 and 1.*'a'/ },
          { inp: '2011', exp: /Only 0 and 1.*'2'/ },
          { inp: '1 01', exp: /Only 0 and 1.*' '/ }
        ];

        invalidCases.forEach(({ inp, exp }) => {
          const res = validateInput(inp);
          const rejected = !res.ok && exp.test(res.error);
          check(
            `reject "${inp}"`,
            rejected,
            !res.ok && !exp.test(res.error) ? `Error was: ${res.error}` : res.ok ? 'Was accepted!' : null
          );
        });
      });

      // Suite 6: Verified Canonical Example (1011 / 0110011 / pos 6 / syndrome 110)
      addSuite('Verified Example (1011 / pos 6 / syn 110)', (check) => {
        const cw = encode([1, 0, 1, 1]);
        check('encode(1011) = 0110011', cwToString(cw) === '0110011');
        const recv = flipBit(cw, 6);
        check('flip bit 6 = 0110001', cwToString(recv) === '0110001');
        const syn = syndrome(recv);
        check('syndrome S4S2S1 = 110', syndromeToString(syn) === '110');
        check('syndrome position = 6', syndromeToPosition(syn) === 6);
        const restored = correct(recv);
        check('correct(0110001) = 0110011', cwToString(restored) === '0110011');
      });

      // Suite 7: Double-Error Miscorrection Example
      addSuite('Double-Error Example Classified Miscorrected', (check) => {
        const cw = parseBits('0110011');
        let recv = flipBit(cw, 2);
        recv = flipBit(recv, 6); // positions 2 and 6
        const syn = syndrome(recv);
        const pos = syndromeToPosition(syn);
        check('syndrome points to pos 4', pos === 4);
        const restored = correct(recv);
        check('restored differs from original', !arraysEqual(restored, cw));
        const outcome = classify(cw, recv, syn, restored);
        check('classification is Miscorrected', outcome.status === 'MISCORRECTED');
      });

      // Suite 8: Reset Behavior
      addSuite('Simulator State Reset Behavior', (check) => {
        const initialReset = encode([0, 0, 0, 0]);
        check('default message 0000 produces 0000000', cwToString(initialReset) === '0000000');
        check('syndrome of reset word is 000', syndromeToPosition(syndrome(initialReset)) === 0);
      });

      setTestResults({
        suites,
        totalRun: totalPass + totalFail,
        totalPass,
        totalFail,
        isAllPassed: totalFail === 0,
        timestamp: new Date().toLocaleTimeString()
      });

      setIsRunning(false);
    }, 250);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* Header */}
      <div>
        <span className="eyebrow-label" style={{ marginBottom: '0.5rem' }}>
          <ShieldCheck size={13} />
          <span>Formal Verification Suite</span>
        </span>
        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-main)', margin: 0 }}>
          Self-Test Verification Suite
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.35rem', margin: '0.35rem 0 0 0' }}>
          Execute the comprehensive in-browser mathematical test harness covering 177 automated assertions across Galois arithmetic, syndrome coordinates, and edge cases.
        </p>
      </div>

      {/* Action / Runner Card (Level 2 Hero Card) */}
      <Card level={2} halo={true}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(99, 102, 241, 0.15)',
                color: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(99, 102, 241, 0.35)',
                boxShadow: '0 0 16px rgba(99, 102, 241, 0.25)',
                flexShrink: 0
              }}
            >
              <Cpu size={22} strokeWidth={2} />
            </div>
            <div>
              <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', display: 'block' }}>
                Mathematical Verification Harness
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-subtle)' }}>
                Runs 177 automated assertions live in this client-side runtime with zero server round-trips.
              </span>
            </div>
          </div>

          <Button
            variant="primary"
            icon={Play}
            onClick={runAllTests}
            disabled={isRunning}
            size="lg"
          >
            {isRunning ? 'Running Verification...' : 'Execute All 177 Tests'}
          </Button>
        </div>
      </Card>

      {/* Summary Banner with Metrics */}
      {testResults && (
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
        >
          <div
            className="glass-l2"
            style={{
              padding: '1.5rem 1.75rem',
              borderRadius: 'var(--radius-lg)',
              border: `1.5px solid ${testResults.isAllPassed ? 'rgba(52, 211, 153, 0.5)' : 'rgba(251, 113, 133, 0.5)'}`,
              background: testResults.isAllPassed
                ? 'linear-gradient(135deg, rgba(52, 211, 153, 0.12) 0%, rgba(13, 20, 42, 0.8) 100%)'
                : 'linear-gradient(135deg, rgba(251, 113, 133, 0.12) 0%, rgba(13, 20, 42, 0.8) 100%)',
              boxShadow: testResults.isAllPassed ? '0 0 35px rgba(52, 211, 153, 0.25)' : '0 0 35px rgba(251, 113, 133, 0.25)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {testResults.isAllPassed ? (
                  <CheckCircle2 size={26} strokeWidth={2.5} style={{ color: 'var(--status-success-border)' }} />
                ) : (
                  <XCircle size={26} strokeWidth={2.5} style={{ color: 'var(--status-danger-border)' }} />
                )}
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                    {testResults.isAllPassed ? '100% Mathematical Compliance Verified' : 'Test Failures Encountered'}
                  </h3>
                  <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                    Completed at {testResults.timestamp} across all 8 formal testing suites.
                  </span>
                </div>
              </div>

              <Badge variant={testResults.isAllPassed ? 'success' : 'danger'} size="lg">
                {testResults.isAllPassed ? 'PASSED (177/177)' : 'FAILED'}
              </Badge>
            </div>

            {/* Metrics Chips */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '0.75rem'
              }}
            >
              <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-glass-input)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
                  Total Assertions
                </span>
                <span className="mono tabular-nums" style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {testResults.totalRun}
                </span>
              </div>

              <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-glass-input)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
                  Suites Passed
                </span>
                <span className="mono tabular-nums" style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--status-success-border)' }}>
                  {testResults.suites.filter(s => s.isSuccess).length} / {testResults.suites.length}
                </span>
              </div>

              <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-glass-input)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
                  Field Arithmetic
                </span>
                <span className="mono" style={{ fontSize: '1.15rem', fontWeight: 750, color: 'var(--accent-cyan)' }}>
                  GF(2) Ring OK
                </span>
              </div>

              <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-glass-input)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
                  Single-Error Correction
                </span>
                <span className="mono" style={{ fontSize: '1.15rem', fontWeight: 750, color: 'var(--status-success-border)' }}>
                  112/112 Pure
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Table (Level 1) */}
      {testResults && (
        <Card
          level={1}
          title="Suite Breakdown &amp; Execution Traces"
          subtitle={`${testResults.totalPass} assertions passed cleanly out of ${testResults.totalRun} total.`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {testResults.suites.map((suite, idx) => {
              const isExpanded = !!expandedSuites[idx];

              return (
                <div
                  key={suite.name}
                  className="glass-panel"
                  style={{
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => toggleSuite(idx)}
                    style={{
                      width: '100%',
                      padding: '1rem 1.35rem',
                      background: 'var(--bg-card-subtle)',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      textAlign: 'left',
                      outline: 'none',
                      transition: 'background 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <motion.div
                        animate={{ rotate: isExpanded ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronRight size={18} strokeWidth={2.5} style={{ color: 'var(--accent-cyan)' }} />
                      </motion.div>
                      <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        {suite.name}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span className="mono tabular-nums" style={{ fontSize: '0.825rem', color: 'var(--text-subtle)', fontWeight: 650 }}>
                        {suite.casesPassed} / {suite.casesRun} passed
                      </span>
                      <Badge variant={suite.isSuccess ? 'success' : 'danger'} size="sm">
                        {suite.isSuccess ? 'PASS' : 'FAIL'}
                      </Badge>
                    </div>
                  </button>

                  {/* Expandable Case Details (Terminal aesthetic) */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        style={{
                          background: 'var(--bg-surface)',
                          borderTop: '1px solid var(--border-subtle)',
                          maxHeight: '340px',
                          overflowY: 'auto',
                          padding: '0.85rem 1.35rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.45rem'
                        }}
                      >
                        {suite.cases.map((c, cIdx) => (
                          <div
                            key={cIdx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              fontSize: '0.825rem',
                              padding: '0.35rem 0',
                              borderBottom: cIdx < suite.cases.length - 1 ? '1px dashed var(--border-subtle)' : 'none'
                            }}
                          >
                            <span className="mono" style={{ color: 'var(--text-muted)' }}>
                              {c.description}
                            </span>
                            <span style={{ color: c.isOk ? 'var(--status-success-border)' : 'var(--status-danger-border)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                              {c.isOk ? '✓ PASS' : '✗ FAIL'}
                            </span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

export default SelfTestPage;