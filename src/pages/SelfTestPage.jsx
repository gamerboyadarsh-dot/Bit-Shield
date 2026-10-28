import React, { useState } from 'react';
import { Play, CheckCircle2, XCircle, ChevronDown, ChevronRight, ShieldCheck } from 'lucide-react';
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

  const toggleSuite = (index) => {
    setExpandedSuites((prev) => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const runAllTests = () => {
    setIsRunning(true);

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
      const cw = encode([1, 0, 1, 1]);
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
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)' }}>
          Self-Test Verification Suite
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginTop: '0.25rem' }}>
          Execute the comprehensive in-browser verification suite across all reference encodings, error injections, and edge cases.
        </p>
      </div>

      {/* Action Card */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-main)', display: 'block' }}>
              In-Browser Mathematical Test Runner
            </span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-subtle)' }}>
              Results shown are produced by running the tests in this browser session.
            </span>
          </div>

          <Button
            variant="primary"
            icon={Play}
            onClick={runAllTests}
            disabled={isRunning}
          >
            {isRunning ? 'Running Tests...' : 'Run All Tests'}
          </Button>
        </div>
      </Card>

      {/* Summary Banner */}
      {testResults && (
        <Callout
          type={testResults.isAllPassed ? 'success' : 'danger'}
          title={testResults.isAllPassed ? 'All Tests Passed' : 'Test Suite Failures Detected'}
        >
          {testResults.isAllPassed
            ? `Successfully executed ${testResults.totalRun} automated assertions with 100% pass rate at ${testResults.timestamp}.`
            : `${testResults.totalFail} of ${testResults.totalRun} assertions failed.`}
        </Callout>
      )}

      {/* Results Table */}
      {testResults && (
        <Card title="Suite Breakdown" subtitle={`${testResults.totalPass} passed / ${testResults.totalRun} total assertions.`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {testResults.suites.map((suite, idx) => {
              const isExpanded = !!expandedSuites[idx];

              return (
                <div
                  key={suite.name}
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
                      padding: '0.75rem 1rem',
                      background: 'var(--bg-card-subtle)',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {isExpanded ? (
                        <ChevronDown size={16} strokeWidth={1.75} color="var(--text-subtle)" />
                      ) : (
                        <ChevronRight size={16} strokeWidth={1.75} color="var(--text-subtle)" />
                      )}
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        {suite.name}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span className="mono tabular-nums" style={{ fontSize: '0.8125rem', color: 'var(--text-subtle)' }}>
                        {suite.casesPassed} / {suite.casesRun} passed
                      </span>
                      <Badge variant={suite.isSuccess ? 'success' : 'danger'} size="sm">
                        {suite.isSuccess ? 'Pass' : 'Fail'}
                      </Badge>
                    </div>
                  </button>

                  {/* Expandable Case Details */}
                  {isExpanded && (
                    <div
                      style={{
                        padding: '0.75rem 1rem',
                        background: 'var(--bg-card)',
                        borderTop: '1px solid var(--border-subtle)',
                        maxHeight: '300px',
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.375rem'
                      }}
                    >
                      {suite.cases.map((c, cIdx) => (
                        <div
                          key={cIdx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            fontSize: '0.8125rem',
                            padding: '0.25rem 0',
                            borderBottom: cIdx < suite.cases.length - 1 ? '1px dashed var(--border-subtle)' : 'none'
                          }}
                        >
                          <span className="mono" style={{ color: 'var(--text-muted)' }}>
                            {c.description}
                          </span>
                          <span style={{ color: c.isOk ? 'var(--status-success-text)' : 'var(--status-danger-text)', fontWeight: 600 }}>
                            {c.isOk ? '✓' : '✗ Fail'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
