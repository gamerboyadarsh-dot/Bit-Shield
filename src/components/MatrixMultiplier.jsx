import React, { useState } from 'react';
import { H_MATRIX, PARITY_CHECKS } from '../lib/hamming.js';

export function MatrixMultiplier({ receivedWord = [0, 1, 1, 0, 0, 0, 1] }) {
  const [selectedRow, setSelectedRow] = useState(0); // 0: S1, 1: S2, 2: S4

  const r = receivedWord;
  const hRow = H_MATRIX[selectedRow];
  const check = PARITY_CHECKS[selectedRow];

  // Modulo-2 dot product computation
  const terms = hRow.map((hVal, idx) => ({
    hVal,
    rVal: r[idx],
    prod: (hVal * r[idx]) & 1,
    pos: idx + 1
  }));

  const activeTerms = terms.filter((t) => t.hVal === 1);
  const result = activeTerms.reduce((acc, t) => acc ^ t.rVal, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      {/* Interactive Matrix Display */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
          background: 'var(--bg-card-subtle)',
          padding: '1.25rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)'
        }}
      >
        {/* Parity Check Matrix H (3x7) */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-subtle)', marginBottom: '0.25rem' }}>
            Matrix H (3 × 7)
          </span>
          <div
            style={{
              display: 'grid',
              gridTemplateRows: 'repeat(3, 1fr)',
              gap: '4px',
              borderLeft: '2px solid var(--border-strong)',
              borderRight: '2px solid var(--border-strong)',
              padding: '0 6px',
              borderRadius: '2px'
            }}
          >
            {H_MATRIX.map((row, rIdx) => (
              <div
                key={rIdx}
                onClick={() => setSelectedRow(rIdx)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 24px)',
                  gap: '4px',
                  padding: '2px 4px',
                  borderRadius: '4px',
                  background: selectedRow === rIdx ? 'var(--accent-light)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s'
                }}
                title={`Click to inspect check ${PARITY_CHECKS[rIdx].name}`}
              >
                {row.map((val, cIdx) => (
                  <span
                    key={cIdx}
                    className="mono tabular-nums"
                    style={{
                      textAlign: 'center',
                      fontWeight: selectedRow === rIdx && val === 1 ? 700 : 400,
                      color: selectedRow === rIdx && val === 1 ? 'var(--accent)' : 'var(--text-main)',
                      fontSize: '0.875rem'
                    }}
                  >
                    {val}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-subtle)' }}>·</span>

        {/* Received Vector r^T (7x1) */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-subtle)', marginBottom: '0.25rem' }}>
            Vector rᵀ (7 × 1)
          </span>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              borderLeft: '2px solid var(--border-strong)',
              borderRight: '2px solid var(--border-strong)',
              padding: '0 6px',
              borderRadius: '2px'
            }}
          >
            {r.map((val, idx) => (
              <span
                key={idx}
                className="mono tabular-nums"
                style={{
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.875rem',
                  fontWeight: hRow[idx] === 1 ? 700 : 400,
                  background: hRow[idx] === 1 ? 'var(--accent-light)' : 'transparent',
                  color: hRow[idx] === 1 ? 'var(--accent)' : 'var(--text-main)',
                  borderRadius: '3px'
                }}
              >
                {val}
              </span>
            ))}
          </div>
        </div>

        <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-subtle)' }}>=</span>

        {/* Syndrome Vector s (3x1) */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-subtle)', marginBottom: '0.25rem' }}>
            Syndrome s (3 × 1)
          </span>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              borderLeft: '2px solid var(--border-strong)',
              borderRight: '2px solid var(--border-strong)',
              padding: '4px 8px',
              borderRadius: '2px'
            }}
          >
            {PARITY_CHECKS.map((chk, idx) => {
              const synBit = H_MATRIX[idx].reduce((acc, hVal, cIdx) => acc ^ (hVal * r[cIdx]), 0);
              return (
                <span
                  key={chk.id}
                  onClick={() => setSelectedRow(idx)}
                  className="mono tabular-nums"
                  style={{
                    width: '32px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.9375rem',
                    fontWeight: 700,
                    background: selectedRow === idx ? 'var(--accent)' : 'var(--bg-card)',
                    color: selectedRow === idx ? '#ffffff' : 'var(--text-main)',
                    borderRadius: '4px',
                    border: `1px solid ${selectedRow === idx ? 'var(--accent)' : 'var(--border-subtle)'}`,
                    cursor: 'pointer'
                  }}
                  title={`Click to inspect ${chk.name}`}
                >
                  {synBit}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row Modulo-2 Dot Product Breakdown */}
      <div
        style={{
          padding: '0.875rem 1rem',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-card)',
          fontSize: '0.875rem'
        }}
      >
        <span style={{ fontWeight: 600, color: 'var(--accent)' }}>
          {check.name} Row Calculation (Row {selectedRow + 1}):
        </span>
        <div className="mono tabular-nums" style={{ marginTop: '0.375rem', lineHeight: 1.6 }}>
          {check.name} = ⨁ (H[{selectedRow + 1}, j] · r[j]) = {activeTerms.map((t) => `r${t.pos}`).join(' ⊕ ')}
          <br />
          = {activeTerms.map((t) => t.rVal).join(' ⊕ ')} = <strong>{result}</strong>{' '}
          <span style={{ color: result === 0 ? 'var(--status-success-text)' : 'var(--status-danger-text)' }}>
            ({result === 0 ? 'Pass / Even' : 'Fail / Odd'})
          </span>
        </div>
      </div>
    </div>
  );
}
