import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Sparkles, HelpCircle } from 'lucide-react';
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
          className="glass-l1"
          style={{
            position: 'sticky',
            top: '5.5rem',
            padding: '1.25rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-glow)',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.85rem' }}>
            <BookOpen size={14} className="gradient-text-accent" />
            <h3
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--text-subtle)',
                fontFamily: 'var(--font-mono)',
                margin: 0
              }}
            >
              Table of Contents
            </h3>
          </div>

          <nav aria-label="Theory topics" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {sections.map((sec) => (
              <button
                key={sec.id}
                type="button"
                onClick={() => scrollTo(sec.id)}
                style={{
                  textAlign: 'left',
                  background: activeSection === sec.id ? 'var(--accent-light)' : 'transparent',
                  border: activeSection === sec.id ? '1px solid var(--border-glow)' : '1px solid transparent',
                  padding: '0.45rem 0.65rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  fontWeight: activeSection === sec.id ? 750 : 500,
                  color: activeSection === sec.id ? 'var(--accent)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  outline: 'none'
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
          <span className="eyebrow-label">
            <Sparkles size={12} className="gradient-text-accent" />
            <span className="gradient-text-accent">ACADEMIC SPECIFICATION</span>
          </span>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 850, letterSpacing: '-0.035em', color: 'var(--text-main)', margin: '0.2rem 0 0.35rem 0' }}>
            Mathematical Foundations
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', margin: 0 }}>
            Course BAMAT205: Discrete Mathematics and Linear Algebra — Module 3: Coding Theory &amp; Error Correction.
          </p>
        </div>

        {/* 1. Binary & XOR */}
        <section id="binary-xor" style={{ scrollMarginTop: '6rem' }}>
          <Card title="1. Binary Representation &amp; Addition Modulo 2 (XOR)">
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>
              In digital coding theory, data symbols belong to the finite Galois field GF(2), consisting of the set {'{0, 1}'}.
              The primary algebraic operation is addition modulo 2, denoted by the exclusive-OR (⊕) operator.
            </p>

            <div style={{ margin: '1.5rem 0', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              <div style={{ flex: '1', minWidth: '220px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-glass-input)', borderBottom: '2px solid var(--border-card)' }}>
                      <th style={{ padding: '0.65rem' }}>A</th>
                      <th style={{ padding: '0.65rem' }}>B</th>
                      <th style={{ padding: '0.65rem' }}>A ⊕ B</th>
                    </tr>
                  </thead>
                  <tbody className="mono tabular-nums">
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}><td style={{ padding: '0.5rem' }}>0</td><td>0</td><td>0</td></tr>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}><td style={{ padding: '0.5rem' }}>0</td><td>1</td><td>1</td></tr>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}><td style={{ padding: '0.5rem' }}>1</td><td>0</td><td>1</td></tr>
                    <tr><td style={{ padding: '0.5rem' }}>1</td><td>1</td><td>0</td></tr>
                  </tbody>
                </table>
              </div>

              <div style={{ flex: '2', minWidth: '260px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 750, color: 'var(--text-main)' }}>Fundamental Algebraic Properties:</h4>
                <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-muted)', fontSize: '0.925rem', lineHeight: 1.8 }}>
                  <li><strong>Self-Inverse:</strong> a ⊕ a = 0 (each element is its own additive inverse).</li>
                  <li><strong>Identity:</strong> a ⊕ 0 = a.</li>
                  <li><strong>Commutative &amp; Associative:</strong> Order and grouping of operations do not affect the result.</li>
                </ul>
              </div>
            </div>
          </Card>
        </section>

        {/* 2. Even Parity */}
        <section id="even-parity" style={{ scrollMarginTop: '6rem' }}>
          <Card title="2. Even Parity Constraint">
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>
              A parity group is configured such that the sum modulo 2 of all members in the group equals 0 (even parity).
              If the count of 1s in a monitored group is odd, the modulo 2 sum produces 1, signaling that an error has occurred.
            </p>
            <MathBlock>
              x₁ ⊕ x₂ ⊕ ··· ⊕ xₙ = 0  (Valid even parity constraint)
            </MathBlock>
          </Card>
        </section>

        {/* 3. Hamming Construction */}
        <section id="construction" style={{ scrollMarginTop: '6rem' }}>
          <Card title="3. Hamming (7,4) Construction: Position Allocation">
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>
              Codewords comprise 7 bits indexed 1 through 7. Parity bits are assigned to coordinates that are powers of two (1, 2, 4).
              The 4 data bits occupy the remaining positions (3, 5, 6, 7).
            </p>
            <MathBlock>
              c = (c₁, c₂, c₃, c₄, c₅, c₆, c₇) = (p₁, p₂, d₃, p₄, d₅, d₆, d₇)
            </MathBlock>

            <div style={{ overflowX: 'auto', marginTop: '1.25rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.925rem', textAlign: 'center' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-glass-input)', borderBottom: '2px solid var(--border-card)' }}>
                    <th style={{ padding: '0.75rem' }}>Position</th>
                    <th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th>
                  </tr>
                </thead>
                <tbody className="mono tabular-nums">
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ fontWeight: 750, padding: '0.55rem' }}>Symbol</td>
                    <td style={{ color: 'var(--bit-parity-text)', fontWeight: 750 }}>p₁</td>
                    <td style={{ color: 'var(--bit-parity-text)', fontWeight: 750 }}>p₂</td>
                    <td style={{ color: 'var(--bit-data-text)', fontWeight: 750 }}>d₃</td>
                    <td style={{ color: 'var(--bit-parity-text)', fontWeight: 750 }}>p₄</td>
                    <td style={{ color: 'var(--bit-data-text)', fontWeight: 750 }}>d₅</td>
                    <td style={{ color: 'var(--bit-data-text)', fontWeight: 750 }}>d₆</td>
                    <td style={{ color: 'var(--bit-data-text)', fontWeight: 750 }}>d₇</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ fontWeight: 750, padding: '0.55rem' }}>Covered by S₁</td>
                    <td style={{ color: 'var(--accent-cyan)' }}>✓</td><td>—</td><td style={{ color: 'var(--accent-cyan)' }}>✓</td><td>—</td><td style={{ color: 'var(--accent-cyan)' }}>✓</td><td>—</td><td style={{ color: 'var(--accent-cyan)' }}>✓</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ fontWeight: 750, padding: '0.55rem' }}>Covered by S₂</td>
                    <td>—</td><td style={{ color: 'var(--accent)' }}>✓</td><td style={{ color: 'var(--accent)' }}>✓</td><td>—</td><td>—</td><td style={{ color: 'var(--accent)' }}>✓</td><td style={{ color: 'var(--accent)' }}>✓</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 750, padding: '0.55rem' }}>Covered by S₄</td>
                    <td>—</td><td>—</td><td>—</td><td style={{ color: 'var(--accent-amber)' }}>✓</td><td style={{ color: 'var(--accent-amber)' }}>✓</td><td style={{ color: 'var(--accent-amber)' }}>✓</td><td style={{ color: 'var(--accent-amber)' }}>✓</td>
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
          <Card title="5. Syndrome Calculation &amp; Error Localization">
            <MathBlock>
              S₁ = r₁ ⊕ r₃ ⊕ r₅ ⊕ r₇{'\n'}
              S₂ = r₂ ⊕ r₃ ⊕ r₆ ⊕ r₇{'\n'}
              S₄ = r₄ ⊕ r₅ ⊕ r₆ ⊕ r₇
            </MathBlock>
            <MathBlock>
              Error Coordinate = 4·S₄ + 2·S₂ + 1·S₁
            </MathBlock>
          </Card>
        </section>

        {/* 6. Live Matrix Multiplier (Level 2 Hero Card) */}
        <section id="h-matrix" style={{ scrollMarginTop: '6rem' }}>
          <Card
            level={2}
            halo={true}
            title="6. Parity-Check Matrix Multiplier: s = H · rᵀ (mod 2)"
            subtitle="Click on any check row (S₁, S₂, S₄) in the matrix to inspect the term-by-term modulo 2 dot product."
          >
            <MatrixMultiplier receivedWord={[0, 1, 1, 0, 0, 0, 1]} />
          </Card>
        </section>

        {/* 7. Worked Example */}
        <section id="worked-example" style={{ scrollMarginTop: '6rem' }}>
          <Card title="7. Worked Numerical Example: Message 1011">
            <p style={{ color: 'var(--text-muted)' }}><strong>1. Encoding:</strong> Message m₁m₂m₃m₄ = 1 0 1 1 maps to d₃=1, d₅=0, d₆=1, d₇=1.</p>
            <MathBlock>
              p₁ = 1 ⊕ 0 ⊕ 1 = 0{'\n'}
              p₂ = 1 ⊕ 1 ⊕ 1 = 1{'\n'}
              p₄ = 0 ⊕ 1 ⊕ 1 = 0{'\n'}
              Codeword c = (0, 1, 1, 0, 0, 1, 1) = 0110011
            </MathBlock>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.85rem' }}><strong>2. Channel Error:</strong> Bit 6 flips from 1 to 0, producing received word r = 0110001.</p>
            <MathBlock>
              Syndrome S₄S₂S₁ = 110₂ = 6₁₀ → Error at Position 6
            </MathBlock>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.85rem' }}><strong>3. Restoration:</strong> Inverting bit 6 recovers original codeword 0110011.</p>
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

        {/* 9. Cosets & Lagrange's Theorem (Level 2 Card) */}
        <section id="cosets" style={{ scrollMarginTop: '6rem' }}>
          <Card
            level={2}
            title="9. Coset Decomposition Explorer (Lagrange’s Theorem)"
            subtitle="By Lagrange’s Theorem, the 128 elements of ℤ₂⁷ partition into exactly 128 / 16 = 8 disjoint cosets matching the 8 syndromes."
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Coset selector buttons */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {cosetList.map((c, idx) => (
                  <button
                    key={c.syndromeStr}
                    type="button"
                    onClick={() => setSelectedCoset(idx)}
                    style={{
                      padding: '0.45rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      border: `1.5px solid ${selectedCoset === idx ? 'var(--accent)' : 'var(--border-subtle)'}`,
                      background: selectedCoset === idx ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : 'var(--bg-glass-input)',
                      color: selectedCoset === idx ? '#ffffff' : 'var(--text-main)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.8125rem',
                      fontWeight: 750,
                      cursor: 'pointer',
                      boxShadow: selectedCoset === idx ? '0 0 16px rgba(99, 102, 241, 0.45)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    Syn {c.syndromeStr} ({c.pos === 0 ? 'C' : `Pos ${c.pos}`})
                  </button>
                ))}
              </div>

              {/* Selected Coset Breakdown */}
              <div
                className="glass-panel"
                style={{
                  padding: '1.35rem',
                  background: 'var(--bg-glass-input)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-glow)'
                }}
              >
                <div style={{ fontSize: '0.88rem', color: 'var(--text-subtle)' }}>
                  Coset Leader (Min-Weight Error Vector): <strong className="mono tabular-nums" style={{ color: 'var(--accent-cyan)' }}>{cosetList[selectedCoset].leader}</strong> (Weight {cosetList[selectedCoset].leaderWeight})
                </div>
                <p style={{ fontSize: '0.925rem', color: 'var(--text-main)', marginTop: '0.45rem', lineHeight: 1.65 }}>
                  {cosetList[selectedCoset].description}
                </p>

                <div style={{ marginTop: '1.25rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-subtle)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                    All 16 Codeword Vectors in Coset {cosetList[selectedCoset].syndromeStr}:
                  </span>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(95px, 1fr))',
                      gap: '0.5rem',
                      marginTop: '0.65rem'
                    }}
                  >
                    {cosetList[selectedCoset].members.map((m, mIdx) => (
                      <span
                        key={mIdx}
                        className="mono tabular-nums"
                        style={{
                          fontSize: '0.825rem',
                          padding: '0.4rem 0.5rem',
                          background: 'var(--bg-card-subtle)',
                          borderRadius: 'var(--radius-xs)',
                          textAlign: 'center',
                          border: '1px solid var(--border-subtle)',
                          color: 'var(--text-main)',
                          fontWeight: 700
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
          <Card title="10. Connections to Discrete Mathematics &amp; Linear Algebra">
            <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-muted)', lineHeight: 1.9, fontSize: '0.95rem' }}>
              <li><strong>Code Rate:</strong> 4/7 ≈ 57.1% efficiency.</li>
              <li><strong>Minimum Hamming Distance:</strong> d_min = 3. Guaranteed error correction: ⌊(3-1)/2⌋ = 1 error.</li>
              <li><strong>Subgroup of (ℤ₂⁷, ⊕):</strong> The 16 codewords form a linear subspace of GF(2)⁷.</li>
              <li><strong>Lagrange Coset Partition:</strong> 128 / 16 = 8 cosets, perfectly matching the 8 possible syndrome addresses.</li>
              <li><strong>Null Space &amp; Rank-Nullity:</strong> The code C is the null space (kernel) of H: Rank(H) = 3 $\implies$ Nullity = 7 - 3 = 4, verifying a 4-dimensional subspace with 2⁴ = 16 codewords.</li>
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

export default TheoryPage;
