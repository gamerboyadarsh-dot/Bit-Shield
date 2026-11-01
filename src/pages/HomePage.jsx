import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
  ArrowRight,
  Play,
  BookOpen,
  ShieldAlert,
  Cpu,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Zap,
  Activity,
  Layers
} from 'lucide-react';
import { Button } from '../components/Button.jsx';
import { Card } from '../components/Card.jsx';
import { Codeword } from '../components/Codeword.jsx';
import { Badge } from '../components/Badge.jsx';
import {
  encode,
  syndrome,
  syndromeToPosition,
  syndromeToString,
  flipBit,
  POSITIONS_META
} from '../lib/hamming.js';

// Interactive Binary Matrix Rain Background Component
function BinaryDriftBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = canvas.parentElement.offsetWidth);
    let height = (canvas.height = canvas.parentElement.offsetHeight);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.offsetWidth;
      height = canvas.height = canvas.parentElement.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    const fontSize = 14;
    const columns = Math.floor(width / 24);
    const drops = Array.from({ length: columns }, () => Math.random() * -50);
    const bits = Array.from({ length: columns }, () => Math.random() > 0.5 ? '1' : '0');

    let lastTime = 0;
    const render = (time) => {
      // Limit to ~30-40 fps to stay ultra lightweight
      if (time - lastTime > 45) {
        lastTime = time;
        ctx.clearRect(0, 0, width, height);
        ctx.font = `${fontSize}px 'JetBrains Mono', monospace`;

        for (let i = 0; i < drops.length; i++) {
          const x = i * 24 + 12;
          const y = drops[i] * fontSize;

          // Occasionally flip bit value
          if (Math.random() < 0.03) {
            bits[i] = bits[i] === '1' ? '0' : '1';
          }

          // Random corrupted bit flashing rose
          const isErrorGlitch = Math.random() < 0.015;

          if (isErrorGlitch) {
            ctx.fillStyle = 'rgba(251, 113, 133, 0.75)';
            ctx.shadowColor = '#fb7185';
            ctx.shadowBlur = 8;
          } else {
            ctx.fillStyle = 'rgba(99, 102, 241, 0.18)';
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
          }

          ctx.fillText(bits[i], x, y);

          if (y > height && Math.random() > 0.975) {
            drops[i] = 0;
          }
          drops[i] += 0.85;
        }
      }
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.85,
        maskImage: 'radial-gradient(circle at 50% 50%, black 50%, transparent 95%)',
        WebkitMaskImage: 'radial-gradient(circle at 50% 50%, black 50%, transparent 95%)'
      }}
    />
  );
}

export function HomePage({ onNavigate }) {
  // Live interactive preview for 1011
  const initialBits = encode([1, 0, 1, 1]); // [0, 1, 1, 0, 0, 1, 1]
  const [corruptedPos, setCorruptedPos] = useState(null);

  const currentBits = corruptedPos ? flipBit(initialBits, corruptedPos) : initialBits;
  const currentSyn = syndrome(currentBits);
  const detectedPos = syndromeToPosition(currentSyn);

  const handleBitClick = (pos) => {
    if (corruptedPos === pos) {
      setCorruptedPos(null); // Clear error
    } else {
      setCorruptedPos(pos); // Flip selected bit
    }
  };

  // 3D Tilt effect on interactive card
  const cardX = useMotionValue(0);
  const cardY = useMotionValue(0);
  const springX = useSpring(cardX, { stiffness: 300, damping: 30 });
  const springY = useSpring(cardY, { stiffness: 300, damping: 30 });
  const rotateX = useTransform(springY, [-150, 150], [6, -6]);
  const rotateY = useTransform(springX, [-150, 150], [-6, 6]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    cardX.set(e.clientX - centerX);
    cardY.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    cardX.set(0);
    cardY.set(0);
  };

  // Pipeline node descriptions
  const pipelineNodes = [
    {
      step: '01',
      title: 'Message',
      desc: '4 data bits (m₁..m₄)',
      color: 'var(--bit-data-border)',
      bg: 'var(--bit-data-bg)',
      glow: 'var(--bit-data-glow)',
      icon: Layers
    },
    {
      step: '02',
      title: 'Encoding',
      desc: '+3 parity bits (p₁, p₂, p₄)',
      color: 'var(--bit-parity-border)',
      bg: 'var(--bit-parity-bg)',
      glow: 'var(--bit-parity-glow)',
      icon: Cpu
    },
    {
      step: '03',
      title: 'Channel',
      desc: 'Noise / bit flip (r = c ⊕ e)',
      color: 'var(--bit-corrupt-border)',
      bg: 'var(--bit-corrupt-bg)',
      glow: 'var(--bit-corrupt-glow)',
      pulse: true,
      icon: Zap
    },
    {
      step: '04',
      title: 'Syndrome',
      desc: 's = H · rᵀ identifies bit',
      color: 'var(--status-warning-border)',
      bg: 'var(--status-warning-bg)',
      glow: '0 0 16px rgba(251, 191, 36, 0.25)',
      icon: Activity
    },
    {
      step: '05',
      title: 'Correction',
      desc: 'Inverted bit restored',
      color: 'var(--status-success-border)',
      bg: 'var(--status-success-bg)',
      glow: '0 0 18px rgba(52, 211, 153, 0.3)',
      icon: CheckCircle2
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4.5rem', position: 'relative' }}>
      {/* Cinematic Hero Section */}
      <section
        style={{
          position: 'relative',
          borderRadius: 'var(--radius-2xl)',
          overflow: 'hidden',
          padding: '2.5rem 1.5rem 3.5rem'
        }}
      >
        <BinaryDriftBackground />

        <div
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '3rem',
            alignItems: 'center'
          }}
          className="hero-grid"
        >
          {/* Left Hero Column */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
          >
            {/* Pill Header Chip */}
            <div style={{ display: 'inline-flex' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.35rem 0.85rem',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--bg-glass-input)',
                  border: '1px solid var(--border-glow)',
                  boxShadow: '0 0 16px -2px rgba(99, 102, 241, 0.35)',
                  fontSize: '0.78rem',
                  fontWeight: 650,
                  fontFamily: 'var(--font-mono)'
                }}
              >
                <Sparkles size={13} className="gradient-text-accent" />
                <span className="gradient-text-accent">BAMAT205 · MODULE 3: CODING THEORY</span>
              </div>
            </div>

            {/* Main Headline */}
            <div>
              <h1
                style={{
                  fontSize: 'clamp(2.5rem, 5.5vw, 4rem)',
                  fontWeight: 800,
                  letterSpacing: '-0.04em',
                  lineHeight: 1.08,
                  margin: 0
                }}
              >
                Bit<span className="gradient-text-accent">Shield</span>
              </h1>
              <div
                style={{
                  fontSize: 'clamp(1.15rem, 2vw, 1.35rem)',
                  fontWeight: 500,
                  color: 'var(--text-muted)',
                  marginTop: '0.75rem',
                  letterSpacing: '-0.015em'
                }}
              >
                Hamming (7,4) Error Detection &amp; Correction Simulator
              </div>
            </div>

            {/* Editorial Description */}
            <p
              style={{
                fontSize: '1.05rem',
                color: 'var(--text-muted)',
                lineHeight: 1.65,
                maxWidth: '540px',
                margin: 0
              }}
            >
              An interactive mathematical laboratory demonstrating autonomous single-error detection, syndrome localization, and Galois field GF(2) linear block code mechanics.
            </p>

            {/* Call-to-Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', paddingTop: '0.5rem' }}>
              <Button
                variant="primary"
                size="lg"
                icon={ArrowRight}
                iconPosition="right"
                onClick={() => onNavigate('simulator')}
              >
                Open Simulator
              </Button>
              <Button
                variant="secondary"
                size="lg"
                icon={Play}
                onClick={() => onNavigate('demo')}
              >
                Run Demonstration
              </Button>
            </div>

            {/* Read Theory Link */}
            <div>
              <button
                type="button"
                onClick={() => onNavigate('theory')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-subtle)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-subtle)')}
              >
                <BookOpen size={16} strokeWidth={2} />
                <span>Explore the full mathematical proofs &amp; matrices</span>
              </button>
            </div>

            {/* Animated Credibility Stats Chips */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0.75rem',
                paddingTop: '0.75rem',
                maxWidth: '520px'
              }}
            >
              <div
                className="glass-panel"
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '1.35rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }} className="gradient-text-cyan">
                  [7, 4, 3]
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 650 }}>
                  Code Parameters
                </div>
              </div>

              <div
                className="glass-panel"
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '1.35rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }} className="gradient-text-accent">
                  100%
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 650 }}>
                  Single-Error Fix
                </div>
              </div>

              <div
                className="glass-panel"
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '1.35rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }} className="gradient-text-amber">
                  d_min = 3
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 650 }}>
                  Perfect Code
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Hero Column: 3D Tilting Interactive Sandbox Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            style={{ perspective: 1000 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <motion.div
              style={{
                rotateX,
                rotateY,
                transformStyle: 'preserve-3d'
              }}
            >
              <Card
                title="Interactive Live Sandbox"
                subtitle="Click any bit below to inject channel noise and observe real-time syndrome resolution."
                action={
                  corruptedPos !== null && (
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={RotateCcw}
                      onClick={() => setCorruptedPos(null)}
                    >
                      Reset Bit
                    </Button>
                  )
                }
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
                  {/* Codeword Header Metadata */}
                  <div
                    style={{
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.8125rem',
                      color: 'var(--text-subtle)',
                      background: 'var(--bg-card-subtle)',
                      padding: '0.5rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <span>Message m: <strong className="mono tabular-nums" style={{ color: 'var(--text-main)' }}>1011</strong></span>
                    <span>Codeword c: <strong className="mono tabular-nums" style={{ color: 'var(--text-main)' }}>0110011</strong></span>
                  </div>

                  {/* Interactive Codeword Grid */}
                  <Codeword
                    bits={currentBits}
                    corruptedPositions={corruptedPos ? [corruptedPos] : []}
                    onBitClick={handleBitClick}
                    size="md"
                  />

                  {/* Dynamic Status / Diagnosis Card */}
                  <div
                    style={{
                      width: '100%',
                      padding: '1rem 1.25rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-card-subtle)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '1rem'
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', display: 'block', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', fontWeight: 650 }}>
                        Syndrome Vector (S₄ S₂ S₁)
                      </span>
                      <span className="mono tabular-nums" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {syndromeToString(currentSyn, true)}
                      </span>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', display: 'block', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', fontWeight: 650, marginBottom: '0.2rem' }}>
                        Channel Status
                      </span>
                      {detectedPos === 0 ? (
                        <Badge variant="success">No error detected</Badge>
                      ) : (
                        <Badge variant="danger">
                          Fault at position {detectedPos} ({POSITIONS_META[detectedPos - 1].name})
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Redesigned Communication Pipeline Workflow Section */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ textAlign: 'center' }}>
          <h2
            style={{
              fontSize: '1.65rem',
              fontWeight: 750,
              letterSpacing: '-0.025em',
              color: 'var(--text-main)',
              margin: '0 0 0.5rem 0'
            }}
          >
            Communication Pipeline Workflow
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '600px', margin: '0 auto' }}>
            The 5-stage transformation pipeline from message generation to parity synthesis, channel noise, and autonomous correction.
          </p>
        </div>

        {/* 5-Node Interactive Bento Pipeline */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            position: 'relative'
          }}
        >
          {pipelineNodes.map((node, idx) => {
            const Icon = node.icon;
            return (
              <motion.div
                key={node.step}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="glass-panel"
                style={{
                  padding: '1.25rem 1.15rem',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem',
                  border: `1px solid ${node.color}`,
                  background: 'var(--bg-card)',
                  boxShadow: node.glow
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: node.color
                    }}
                  >
                    STAGE {node.step}
                  </span>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: 'var(--radius-sm)',
                      background: node.bg,
                      color: node.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Icon size={16} strokeWidth={2} />
                  </div>
                </div>

                <div>
                  <h3
                    style={{
                      fontSize: '1.05rem',
                      fontWeight: 700,
                      color: 'var(--text-main)',
                      letterSpacing: '-0.01em',
                      margin: 0
                    }}
                  >
                    {node.title}
                  </h3>
                  <p
                    style={{
                      fontSize: '0.825rem',
                      color: 'var(--text-muted)',
                      lineHeight: 1.45,
                      marginTop: '0.35rem',
                      margin: '0.35rem 0 0 0'
                    }}
                  >
                    {node.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Three Deep Architectural Bento Cards */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1.5rem' }}>
        <Card hoverEffect>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bit-corrupt-bg)',
                color: 'var(--bit-corrupt-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--bit-corrupt-glow)'
              }}
            >
              <ShieldAlert size={22} strokeWidth={2} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>The Channel Problem</h3>
            <p style={{ fontSize: '0.925rem', color: 'var(--text-muted)', lineHeight: 1.65 }}>
              In real-world memory arrays and satellite downlinks, thermal noise, cosmic radiation, and capacitive coupling flip bits. Unprotected data leads to silent corruption or costly retransmissions.
            </p>
          </div>
        </Card>

        <Card hoverEffect>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bit-data-bg)',
                color: 'var(--bit-data-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--bit-data-glow)'
              }}
            >
              <Cpu size={22} strokeWidth={2} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>The GF(2) Mathematics</h3>
            <p style={{ fontSize: '0.925rem', color: 'var(--text-muted)', lineHeight: 1.65 }}>
              Linear algebra over the Galois field GF(2) provides generator matrix G and parity-check matrix H. Each column of H is the unique 3-bit binary address of that bit position.
            </p>
          </div>
        </Card>

        <Card hoverEffect>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bit-parity-bg)',
                color: 'var(--bit-parity-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--bit-parity-glow)'
              }}
            >
              <CheckCircle2 size={22} strokeWidth={2} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>Autonomous Correction</h3>
            <p style={{ fontSize: '0.925rem', color: 'var(--text-muted)', lineHeight: 1.65 }}>
              By computing syndrome vector s = H · rᵀ, the receiver evaluates the exact error coordinate in a single operation, flipping the damaged bit back instantly with zero packet roundtrips.
            </p>
          </div>
        </Card>
      </section>

      {/* Project Academic Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '2.5rem',
          textAlign: 'center',
          color: 'var(--text-subtle)',
          fontSize: '0.875rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}
      >
        <p style={{ fontWeight: 650, color: 'var(--text-muted)' }}>
          BAMAT205 Discrete Mathematics and Linear Algebra – Coding Theory Project
        </p>
        <p>Interactive Simulator Designed for Academic Rigor &amp; Industrial Polish</p>
      </footer>

      <style>{`
        @media (min-width: 960px) {
          .hero-grid {
            grid-template-columns: 1.15fr 0.85fr !important;
          }
        }
      `}</style>
    </div>
  );
}

export default HomePage;
