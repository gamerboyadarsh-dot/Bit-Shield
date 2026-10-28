import React, { useState } from 'react';
import { Card } from '../components/Card.jsx';
import { MathBlock } from '../components/MathBlock.jsx';
import { Callout } from '../components/Callout.jsx';
import { MatrixMultiplier } from '../components/MatrixMultiplier.jsx';
import { POSITIONS_META, H_MATRIX, generateCosets } from '../lib/hamming.js';

export function TheoryPage() {
  const [activeSection, setActiveSection] = useState('binary-xor');
  const [cosetList] = useState(() => generateCosets());
  const [selectedCoset, setSelectedCoset] = useState(0);

  const sections = [
    { id: 'binary-xor', title: '1. Binary & XOR Operation' },
    { id: 'even-parity', title: '2. Even Parity Concept' },
    { id: 'construction', title: '3. Hamming (7,4) Construction' },
    { id: 'parity-equations', title: '4. Parity-Bit Formulas' },
    { id: 'syndrome-calc', title: '5. Syndrome Calculation' },
    { id: 'h-matrix', title: '6. Matrix Multiplier (s = H·rᵀ)' },
    { id: 'worked-example', title: '7. Worked Example (1011)' },
    { id: 'limitations', title: '8. Mathematical Limitations' },
    { id: 'cosets', title: '9. Cosets & Lagrange’s Theorem' },
    { id: 'dmla-connections', title: '10. Connections to DMLA' }
  ];

  const scrollTo = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2.5rem' }} className="theory-layout">
      {/* LEFT: Sticky Table of Contents */}
      <aside className="theory-toc">
        <div
          style={{
            position: 'sticky',
            top: '5.5rem',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-card)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <h3
            style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--text-subtle)',
              marginBottom: '0.75rem'
            }}
          >
            Table of Contents
          </h3>
          <nav aria-label="Theory topics" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {sections.map((sec) => (
              <button
                key={sec.id}
                type="button"
                onClick={() => scrollTo(sec.id)}
                style={{
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  padding: '0.375rem 0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.875rem',
                  fontWeight: activeSection === sec.id ? 600 : 400,
                  color: activeSection === sec.id ? 'var(--accent)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'color 0.15s ease'
                }}
              >
                {sec.title}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* RIGHT: Theory Articles */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Mathematical Foundations
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.0625rem', marginTop: '0.5rem' }}>
            Course BAMAT205: Discrete Mathematics and Linear Algebra — Coding Theory & Error Correction.
          </p>
        </div>

        {/* 1. Binary & XOR */}
        <section id="binary-xor" style={{ scrollMarginTop: '6rem' }}>
          <Card title="1. Binary Representation & Addition Modulo 2 (XOR)">
            <p>
              In digital coding theory, data symbols belong to the finite Galois field GF(2), consisting of the set {'{0, 1}'}.
              The primary algebraic operation is addition modulo 2, denoted by the exclusive-OR (⊕) operator.
            </p>

            <div style={{ margin: '1.25rem 0', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              <div style={{ flex: '1', minWidth: '220px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-card-subtle)', borderBottom: '2px solid var(--border-card)' }}>
                      <th style={{ padding: '0.5rem' }}>A</th>
                      <th style={{ padding: '0.5rem' }}>B</th>
                      <th style={{ padding: '0.5rem' }}>A ⊕ B</th>
                    </tr>
                  </thead>
                  <tbody className="mono tabular-nums">
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}><td style={{ padding: '0.375rem' }}>0</td><td>0</td><td>0</td></tr>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}><td style={{ padding: '0.375rem' }}>0</td><td>1</td><td>1</td></tr>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}><td style={{ padding: '0.375rem' }}>1</td><td>0</td><td>1</td></tr>
                    <tr><td style={{ padding: '0.375rem' }}>1</td><td>1</td><td>0</td></tr>
                  </tbody>
                </table>
              </div>

              <div style={{ flex: '2', minWidth: '260px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <h4 style={{ fontSize: '0.9375rem', fontWeight: 600 }}>Fundamental Algebraic Properties:</h4>
                <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-muted)', fontSize: '0.9375rem', lineHeight: 1.7 }}>
                  <li><strong>Self-Inverse:</strong> a ⊕ a = 0 (each element is its own additive inverse).</li>
                  <li><strong>Identity:</strong> a ⊕ 0 = a.</li>
                  <li><strong>Commutative & Associative:</strong> Order and grouping of operations do not affect the result.</li>
                </ul>
              </div>
            </div>
          </Card>
        </section>

        {/* 2. Even Parity */}
        <section id="even-parity" style={{ scrollMarginTop: '6rem' }}>
          <Card title="2. Even Parity Constraint">
            <p>
              A parity group is configured such that the sum modulo 2 of all members in the group equals 0 (even parity).
              If the count of 1s in a monitored group is odd, the modulo 2 sum produces 1, signaling that an error has occurred.
            </p>
            <MathBlock>
              x₁ ⊕ x₂ ⊕ ··· ⊕ xₙ = 0  (Valid even parity)
            </MathBlock>
          </Card>
        </section>

        {/* 3. Hamming Construction */}
        <section id="construction" style={{ scrollMarginTop: '6rem' }}>
          <Card title="3. Hamming (7,4) Construction: Position Allocation">
            <p>
              Codewords comprise 7 bits indexed 1 through 7. Parity bits are assigned to coordinates that are powers of two (1, 2, 4).
              The 4 data bits occupy the remaining positions (3, 5, 6, 7).
            </p>
            <MathBlock>
              c = (c₁, c₂, c₃, c₄, c₅, c₆, c₇) = (p₁, p₂, d₃, p₄, d₅, d₆, d₇)
            </MathBlock>

            <div style={{ overflowX: 'auto', marginTop: '1.25rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'center' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-card-subtle)', borderBottom: '2px solid var(--border-card)' }}>
                    <th style={{ padding: '0.625rem' }}>Position</th>
                    <th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th>
                  </tr>
                </thead>
                <tbody className="mono tabular-nums">
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ fontWeight: 600 }}>Symbol</td>
                    <td style={{ color: 'var(--bit-parity-text)' }}>p₁</td>
                    <td style={{ color: 'var(--bit-parity-text)' }}>p₂</td>
                    <td style={{ color: 'var(--bit-data-text)' }}>d₃</td>
                    <td style={{ color: 'var(--bit-parity-text)' }}>p₄</td>
                    <td style={{ color: 'var(--bit-data-text)' }}>d₅</td>
                    <td style={{ color: 'var(--bit-data-text)' }}>d₆</td>
                    <td style={{ color: 'var(--bit-data-text)' }}>d₇</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ fontWeight: 600 }}>Covered by S₁</td>
                    <td>✓</td><td>—</td><td>✓</td><td>—</td><td>✓</td><td>—</td><td>✓</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ fontWeight: 600 }}>Covered by S₂</td>
                    <td>—</td><td>✓</td><td>✓</td><td>—</td><td>—</td><td>✓</td><td>✓</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Covered by S₄</td>
                    <td>—</td><td>—</td><td>—</td><td>✓</td><td>✓</td><td>✓</td><td>✓</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </section>

        {/* 4. Parity Formulas */}
        <section id="parity-equations" style={{ scrollMarginTop: '6rem' }}>
          <Card title="4. Parity-Bit Generation Formulas">
            <MathBlock>
              p₁ = d₃ ⊕ d₅ ⊕ d₇{'\n'}
              p₂ = d₃ ⊕ d₆ ⊕ d₇{'\n'}
              p₄ = d₅ ⊕ d₆ ⊕ d₇
            </MathBlock>
          </Card>
        </section>

        {/* 5. Syndrome Calculation */}
        <section id="syndrome-calc" style={{ scrollMarginTop: '6rem' }}>
          <Card title="5. Syndrome Calculation & Error Localization">
            <MathBlock>
              S₁ = r₁ ⊕ r₃ ⊕ r₅ ⊕ r₇{'\n'}
              S₂ = r₂ ⊕ r₃ ⊕ r₆ ⊕ r₇{'\n'}
              S₄ = r₄ ⊕ r₅ ⊕ r₆ ⊕ r₇
            </MathBlock>
            <MathBlock>
              Error Position = 4·S₄ + 2·S₂ + 1·S₁
            </MathBlock>
          </Card>
        </section>

        {/* 6. Live Matrix Multiplier */}
        <section id="h-matrix" style={{ scrollMarginTop: '6rem' }}>
          <Card
            title="6. Parity-Check Matrix Multiplier: s = H · rᵀ (mod 2)"
            subtitle="Click on any check row (S₁, S₂, S₄) in the matrix to inspect the term-by-term modulo 2 dot product."
          >
            <MatrixMultiplier receivedWord={[0, 1, 1, 0, 0, 0, 1]} />
          </Card>
        </section>

        {/* 7. Worked Example */}
        <section id="worked-example" style={{ scrollMarginTop: '6rem' }}>
          <Card title="7. Worked Numerical Example: Message 1011">
            <p><strong>1. Encoding:</strong> Message m₁m₂m₃m₄ = 1 0 1 1 maps to d₃=1, d₅=0, d₆=1, d₇=1.</p>
            <MathBlock>
              p₁ = 1 ⊕ 0 ⊕ 1 = 0{'\n'}
              p₂ = 1 ⊕ 1 ⊕ 1 = 1{'\n'}
              p₄ = 0 ⊕ 1 ⊕ 1 = 0{'\n'}
              Codeword c = (0, 1, 1, 0, 0, 1, 1) = 0110011
            </MathBlock>
            <p style={{ marginTop: '0.75rem' }}><strong>2. Channel Error:</strong> Bit 6 flips from 1 to 0, producing received word r = 0110001.</p>
            <MathBlock>
              Syndrome S₄S₂S₁ = 110₂ = 6₁₀ → Position 6
            </MathBlock>
            <p style={{ marginTop: '0.75rem' }}><strong>3. Restoration:</strong> Inverting bit 6 recovers original codeword 0110011.</p>
          </Card>
        </section>

        {/* 8. Limitations */}
        <section id="limitations" style={{ scrollMarginTop: '6rem' }}>
          <Card title="8. Mathematical Limitations">
            <Callout type="warning" title="Vulnerabilities Beyond Single Errors">
              Hamming (7,4) has minimum distance d_min = 3. Two bit errors move the received word to distance 1 from a *different* valid codeword, leading to an undetected miscorrection.
            </Callout>
          </Card>
        </section>

        {/* 9. Cosets & Lagrange's Theorem */}
        <section id="cosets" style={{ scrollMarginTop: '6rem' }}>
          <Card
            title="9. Coset Decomposition Explorer (Lagrange’s Theorem)"
            subtitle="By Lagrange’s Theorem, the 128 elements of ℤ₂⁷ partition into exactly 128 / 16 = 8 disjoint cosets matching the 8 syndromes."
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Coset selector buttons */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {cosetList.map((c, idx) => (
                  <button
                    key={c.syndromeStr}
                    type="button"
                    onClick={() => setSelectedCoset(idx)}
                    style={{
                      padding: '0.375rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: `1px solid ${selectedCoset === idx ? 'var(--accent)' : 'var(--border-subtle)'}`,
                      background: selectedCoset === idx ? 'var(--accent)' : 'var(--bg-card)',
                      color: selectedCoset === idx ? '#ffffff' : 'var(--text-main)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Syn {c.syndromeStr} ({c.pos === 0 ? 'C' : `Pos ${c.pos}`})
                  </button>
                ))}
              </div>

              {/* Selected Coset Breakdown */}
              <div style={{ padding: '1rem', background: 'var(--bg-card-subtle)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-subtle)' }}>
                  Coset Leader (Min-Weight Error Vector): <strong className="mono">{cosetList[selectedCoset].leader}</strong> (Weight {cosetList[selectedCoset].leaderWeight})
                </span>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', marginTop: '0.25rem' }}>
                  {cosetList[selectedCoset].description}
                </p>

                <div style={{ marginTop: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-subtle)', textTransform: 'uppercase' }}>
                    All 16 Codeword Vectors in Coset {cosetList[selectedCoset].syndromeStr}:
                  </span>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
                      gap: '0.375rem',
                      marginTop: '0.5rem'
                    }}
                  >
                    {cosetList[selectedCoset].members.map((m, mIdx) => (
                      <span
                        key={mIdx}
                        className="mono tabular-nums"
                        style={{
                          fontSize: '0.8125rem',
                          padding: '0.25rem 0.375rem',
                          background: 'var(--bg-card)',
                          borderRadius: '4px',
                          textAlign: 'center',
                          border: '1px solid var(--border-subtle)'
                        }}
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* 10. Connections to DMLA */}
        <section id="dmla-connections" style={{ scrollMarginTop: '6rem' }}>
          <Card title="10. Connections to Discrete Mathematics & Linear Algebra">
            <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-muted)', lineHeight: 1.8 }}>
              <li><strong>Code Rate:</strong> 4/7 ≈ 57.1% efficiency.</li>
              <li><strong>Minimum Hamming Distance:</strong> d_min = 3. Guaranteed error correction: ⌊(3-1)/2⌋ = 1 error.</li>
              <li><strong>Subgroup of (ℤ₂⁷, ⊕):</strong> The 16 codewords form a linear subspace of GF(2)⁷.</li>
              <li><strong>Lagrange Coset Partition:</strong> 128 / 16 = 8 cosets, perfectly matching the 8 possible syndrome addresses.</li>
              <li><strong>Null Space & Rank-Nullity:</strong> The code C is the null space (kernel) of H: Rank(H) = 3 $\implies$ Nullity = 7 - 3 = 4, verifying a 4-dimensional subspace with 2⁴ = 16 codewords.</li>
            </ul>
          </Card>
        </section>
      </div>

      <style>{`
        @media (min-width: 900px) {
          .theory-layout {
            grid-template-columns: 240px 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
