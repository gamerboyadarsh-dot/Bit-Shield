import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { H_MATRIX, PARITY_CHECKS } from '../lib/hamming.js';

export function MatrixMultiplier({ receivedWord = [0, 1, 1, 0, 0, 0, 1] }) {
  const [selectedRow, setSelectedRow] = useState(0); // 0: S1, 1: S2, 2: S4
  const [hoveredCol, setHoveredCol] = useState(null);

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
      {/* Interactive Matrix Display Container */}
      <div
        className="glass-panel"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.25rem',
          flexWrap: 'wrap',
          background: 'var(--bg-glass-input)',
          padding: '1.75rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-glow)'
        }}
      >
        {/* Parity Check Matrix H (3x7) with Curved Brackets */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-subtle)', marginBottom: '0.45rem', textTransform: 'uppercase' }}>
            Matrix H (3 × 7)
          </span>
          <div
            style={{
              display: 'grid',
              gridTemplateRows: 'repeat(3, 1fr)',
              gap: '6px',
              borderLeft: '2px solid var(--accent)',
              borderRight: '2px solid var(--accent)',
              padding: '4px 10px',
              borderRadius: '6px',
              background: 'rgba(99, 102, 241, 0.04)'
            }}
          >
            {H_MATRIX.map((row, rIdx) => (
              <div
                key={rIdx}
                onClick={() => setSelectedRow(rIdx)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 28px)',
                  gap: '6px',
                  padding: '3px 6px',
                  borderRadius: 'var(--radius-sm)',
                  background: selectedRow === rIdx ? 'var(--accent-light)' : 'transparent',
                  border: selectedRow === rIdx ? '1px solid var(--border-glow)' : '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                title={`Click to inspect check ${PARITY_CHECKS[rIdx].name}`}
              >
                {row.map((val, cIdx) => {
                  const isCellActive = selectedRow === rIdx && val === 1;
                  const isColHovered = hoveredCol === cIdx;

                  return (
                    <motion.span
                      key={cIdx}
                      onMouseEnter={() => setHoveredCol(cIdx)}
                      onMouseLeave={() => setHoveredCol(null)}
                      whileHover={{ scale: 1.15 }}
                      className="mono tabular-nums"
                      style={{
                        textAlign: 'center',
                        fontWeight: isCellActive ? 800 : 500,
                        color: isCellActive
                          ? 'var(--accent-cyan)'
                          : isColHovered
                          ? 'var(--accent)'
                          : 'var(--text-main)',
                        fontSize: '0.95rem',
                        textShadow: isCellActive ? '0 0 10px var(--accent-cyan)' : 'none'
                      }}
                    >
                      {val}
                    </motion.span>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>·</span>

        {/* Received Vector r^T (7x1) */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-subtle)', marginBottom: '0.45rem', textTransform: 'uppercase' }}>
            Vector rᵀ (7 × 1)
          </span>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              borderLeft: '2px solid var(--accent-cyan)',
              borderRight: '2px solid var(--accent-cyan)',
              padding: '4px 8px',
              borderRadius: '6px',
              background: 'rgba(34, 211, 238, 0.04)'
            }}
          >
            {r.map((val, idx) => (
              <span
                key={idx}
                onMouseEnter={() => setHoveredCol(idx)}
                onMouseLeave={() => setHoveredCol(null)}
                className="mono tabular-nums"
                style={{
                  width: '28px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.95rem',
                  fontWeight: hRow[idx] === 1 ? 800 : 500,
                  background: hRow[idx] === 1 ? 'var(--accent-light)' : 'transparent',
                  color: hRow[idx] === 1 ? 'var(--accent-cyan)' : 'var(--text-main)',
                  borderRadius: 'var(--radius-xs)',
                  border: hRow[idx] === 1 ? '1px solid var(--border-glow)' : '1px solid transparent',
                  transition: 'all 0.15s ease'
                }}
              >
                {val}
              </span>
            ))}
          </div>
        </div>

        <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>=</span>

        {/* Syndrome Vector s (3x1) */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-subtle)', marginBottom: '0.45rem', textTransform: 'uppercase' }}>
            Syndrome s (3 × 1)
          </span>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              borderLeft: '2px solid var(--accent-amber)',
              borderRight: '2px solid var(--accent-amber)',
              padding: '6px 10px',
              borderRadius: '6px',
              background: 'rgba(251, 191, 36, 0.04)'
            }}
          >
            {PARITY_CHECKS.map((chk, idx) => {
              const synBit = H_MATRIX[idx].reduce((acc, hVal, cIdx) => acc ^ (hVal * r[cIdx]), 0);
              return (
                <motion.span
                  key={chk.id}
                  onClick={() => setSelectedRow(idx)}
                  whileHover={{ scale: 1.08 }}
                  className="mono tabular-nums"
                  style={{
                    width: '36px',
                    height: '26px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1rem',
                    fontWeight: 800,
                    background: selectedRow === idx ? 'var(--accent)' : 'var(--bg-card)',
                    color: selectedRow === idx ? '#ffffff' : 'var(--text-main)',
                    borderRadius: 'var(--radius-sm)',
                    border: `1.5px solid ${selectedRow === idx ? 'var(--accent)' : 'var(--border-subtle)'}`,
                    cursor: 'pointer',
                    boxShadow: selectedRow === idx ? '0 0 14px rgba(99, 102, 241, 0.5)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                  title={`Click to inspect ${chk.name}`}
                >
                  {synBit}
                </motion.span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row Modulo-2 Dot Product Breakdown */}
      <div
        className="glass-panel"
        style={{
          padding: '1.15rem 1.35rem',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-card)',
          fontSize: '0.9rem'
        }}
      >
        <span style={{ fontWeight: 700, color: 'var(--accent)', letterSpacing: '-0.01em' }}>
          {check.name} Row Modulo-2 Inner Product (Row {selectedRow + 1}):
        </span>
        <div className="mono tabular-nums" style={{ marginTop: '0.45rem', lineHeight: 1.7, fontSize: '0.925rem' }}>
          {check.name} = ⨁ (H[{selectedRow + 1}, j] · r[j]) = {activeTerms.map((t) => `r${t.pos}`).join(' ⊕ ')}
          <br />
          = {activeTerms.map((t) => t.rVal).join(' ⊕ ')} = <strong>{result}</strong>{' '}
          <span style={{ color: result === 0 ? 'var(--status-success-text)' : 'var(--status-danger-text)', fontWeight: 700 }}>
            ({result === 0 ? '✓ Pass / Even Parity' : '✗ Fail / Odd Parity'})
          </span>
        </div>
      </div>
    </div>
  );
}

export default MatrixMultiplier;
