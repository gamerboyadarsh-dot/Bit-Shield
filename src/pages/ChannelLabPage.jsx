import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Radio, RefreshCw, Send, CheckCircle2, AlertTriangle, ShieldAlert, BarChart3, Activity, Cpu, Sliders } from 'lucide-react';
import { Card } from '../components/Card.jsx';
import { Button } from '../components/Button.jsx';
import { Badge } from '../components/Badge.jsx';
import { Callout } from '../components/Callout.jsx';
import {
  encodeText,
  simulateBscNoise,
  decodeTextCodewords,
  cwToString
} from '../lib/hamming.js';

export function ChannelLabPage() {
  // --- Feature 1: ASCII Text Transmission ---
  const [inputText, setInputText] = useState('BAMAT205');
  const [textErrorRate, setTextErrorRate] = useState(0.04); // 4% error probability
  const [textSimulation, setTextSimulation] = useState(() => runTextSim('BAMAT205', 0.04));

  function runTextSim(text, p) {
    const origCw = encodeText(text);
    const noisyCw = simulateBscNoise(origCw, p);
    const decoded = decodeTextCodewords(noisyCw, origCw);
    return { origCw, noisyCw, decoded };
  }

  const handleTransmitText = () => {
    setTextSimulation(runTextSim(inputText, textErrorRate));
  };

  // --- Feature 2: BSC Monte Carlo Statistical Channel ---
  const [monteCarloP, setMonteCarloP] = useState(0.03); // 3%
  const [packetCount, setPacketCount] = useState(500); // 500 codewords
  const [monteCarloStats, setMonteCarloStats] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const runMonteCarlo = () => {
    setIsSimulating(true);

    setTimeout(() => {
      let rawBitFlips = 0;
      let remainingBitFlips = 0;
      let cleanWords = 0;
      let singleErrorWords = 0;
      let doubleErrorWords = 0;
      let triplePlusWords = 0;
      let miscorrectedWords = 0;
      let undetectedWords = 0;

      const totalBits = packetCount * 7;

      for (let i = 0; i < packetCount; i++) {
        // Generate random 4 bits
        const m = [
          Math.random() < 0.5 ? 0 : 1,
          Math.random() < 0.5 ? 0 : 1,
          Math.random() < 0.5 ? 0 : 1,
          Math.random() < 0.5 ? 0 : 1
        ];
        const d3 = m[0], d5 = m[1], d6 = m[2], d7 = m[3];
        const p1 = d3 ^ d5 ^ d7;
        const p2 = d3 ^ d6 ^ d7;
        const p4 = d5 ^ d6 ^ d7;
        const c = [p1, p2, d3, p4, d5, d6, d7];

        // Transmit through BSC with probability p
        const r = c.map((bit) => {
          if (Math.random() < monteCarloP) {
            rawBitFlips++;
            return bit ^ 1;
          }
          return bit;
        });

        // Count diffs
        let diffs = 0;
        for (let b = 0; b < 7; b++) if (r[b] !== c[b]) diffs++;

        if (diffs === 0) cleanWords++;
        else if (diffs === 1) singleErrorWords++;
        else if (diffs === 2) doubleErrorWords++;
        else triplePlusWords++;

        // Compute syndrome on received word
        const s1 = r[0] ^ r[2] ^ r[4] ^ r[6];
        const s2 = r[1] ^ r[2] ^ r[5] ^ r[6];
        const s4 = r[3] ^ r[4] ^ r[5] ^ r[6];
        const synPos = 4 * s4 + 2 * s2 + s1;

        const corrected = r.slice();
        if (synPos > 0) corrected[synPos - 1] ^= 1;

        // Check against original
        let postDiffs = 0;
        for (let b = 0; b < 7; b++) if (corrected[b] !== c[b]) postDiffs++;
        remainingBitFlips += postDiffs;

        if (diffs > 1 && synPos > 0 && postDiffs > 0) miscorrectedWords++;
        if (diffs >= 3 && synPos === 0) undetectedWords++;
      }

      setMonteCarloStats({
        packetCount,
        totalBits,
        rawBitFlips,
        remainingBitFlips,
        rawBer: (rawBitFlips / totalBits) * 100,
        postBer: (remainingBitFlips / totalBits) * 100,
        cleanWords,
        singleErrorWords,
        doubleErrorWords,
        triplePlusWords,
        miscorrectedWords,
        undetectedWords
      });

      setIsSimulating(false);
    }, 250);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <span className="mono" style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Transmission Laboratory
          </span>
        </div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-main)', margin: 0 }}>
          Channel Noise &amp; Statistical Lab
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.25rem', margin: '0.25rem 0 0 0' }}>
          Simulate transmission across a noisy Binary Symmetric Channel (BSC), inspect ASCII text recovery, and run large-scale Monte Carlo trials.
        </p>
      </div>

      {/* FEATURE 1: ASCII Text Transmission */}
      <Card
        title="1. ASCII String Transmission &amp; Real-Time Decoding"
        subtitle="Splits text into 4-bit nibbles, encodes into Hamming (7,4) codewords, applies channel noise, and decodes."
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Controls Bar */}
          <div
            style={{
              display: 'flex',
              gap: '1.25rem',
              alignItems: 'flex-end',
              flexWrap: 'wrap',
              background: 'var(--bg-card-subtle)',
              padding: '1.25rem',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <div style={{ flex: '1', minWidth: '180px' }}>
              <label htmlFor="ascii-input" style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.45rem' }}>
                Text Payload
              </label>
              <input
                id="ascii-input"
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value.slice(0, 16))}
                maxLength={16}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.95rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-card)',
                  background: 'var(--bg-glass-input)',
                  color: 'var(--text-main)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1rem',
                  fontWeight: 700,
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ minWidth: '220px', flex: '1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Channel Crossover Prob (p)
                </span>
                <span className="mono tabular-nums" style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-rose)' }}>
                  {(textErrorRate * 100).toFixed(1)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="0.15"
                step="0.01"
                value={textErrorRate}
                onChange={(e) => setTextErrorRate(parseFloat(e.target.value))}
                style={{
                  width: '100%',
                  accentColor: 'var(--accent)',
                  cursor: 'pointer'
                }}
              />
            </div>

            <Button
              variant="primary"
              icon={Send}
              onClick={handleTransmitText}
            >
              Simulate Transmission
            </Button>
          </div>

          {/* Results Comparison Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1.25rem'
            }}
          >
            {/* Original */}
            <div
              className="glass-panel"
              style={{
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-card-subtle)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                Transmitted Payload
              </span>
              <div className="mono" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.35rem' }}>
                {inputText}
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', marginTop: '0.25rem', display: 'block' }}>
                {inputText.length * 2} Hamming codewords ({inputText.length * 14} bits)
              </span>
            </div>

            {/* Corrupted Channel */}
            <div
              className="glass-panel"
              style={{
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bit-corrupt-bg)',
                border: '1px solid var(--bit-corrupt-border)',
                boxShadow: 'var(--bit-corrupt-glow)'
              }}
            >
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--bit-corrupt-text)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                Noise-Corrupted Channel
              </span>
              <div className="mono" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--bit-corrupt-text)', marginTop: '0.35rem' }}>
                {textSimulation.decoded.rawErrors} bit flips introduced
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--bit-corrupt-text)', marginTop: '0.25rem', display: 'block' }}>
                Raw BER: {(textSimulation.decoded.rawBer * 100).toFixed(1)}%
              </span>
            </div>

            {/* Recovered */}
            <div
              className="glass-panel"
              style={{
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--status-success-bg)',
                border: '1px solid var(--status-success-border)',
                boxShadow: 'var(--bit-corrected-glow)'
              }}
            >
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--status-success-text)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                Decoded &amp; Restored Text
              </span>
              <div className="mono" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--status-success-text)', marginTop: '0.35rem' }}>
                {textSimulation.decoded.text}
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--status-success-text)', marginTop: '0.25rem', display: 'block' }}>
                {textSimulation.decoded.remainingErrors === 0 ? '✓ 100% Perfectly Restored' : `${textSimulation.decoded.remainingErrors} residual bit errors`}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* FEATURE 2: BSC Monte Carlo Statistical Channel */}
      <Card
        title="2. Binary Symmetric Channel (BSC) Monte Carlo Simulation"
        subtitle="Empirical statistical testing across large batches of random transmissions."
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          <div
            style={{
              display: 'flex',
              gap: '1.5rem',
              alignItems: 'flex-end',
              flexWrap: 'wrap',
              background: 'var(--bg-card-subtle)',
              padding: '1.25rem',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <div style={{ flex: '1', minWidth: '220px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Bit-Flip Probability (p)
                </span>
                <span className="mono tabular-nums" style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-rose)' }}>
                  {(monteCarloP * 100).toFixed(1)}%
                </span>
              </div>
              <input
                type="range"
                min="0.005"
                max="0.10"
                step="0.005"
                value={monteCarloP}
                onChange={(e) => setMonteCarloP(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }}
              />
            </div>

            <div style={{ minWidth: '180px' }}>
              <label htmlFor="batch-select" style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.45rem' }}>
                Batch Size
              </label>
              <select
                id="batch-select"
                value={packetCount}
                onChange={(e) => setPacketCount(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-card)',
                  background: 'var(--bg-glass-input)',
                  color: 'var(--text-main)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  outline: 'none'
                }}
              >
                <option value={100}>100 codewords (700 bits)</option>
                <option value={500}>500 codewords (3,500 bits)</option>
                <option value={1000}>1,000 codewords (7,000 bits)</option>
              </select>
            </div>

            <Button
              variant="primary"
              icon={RefreshCw}
              onClick={runMonteCarlo}
              disabled={isSimulating}
            >
              {isSimulating ? 'Simulating Channel...' : 'Run Simulation Batch'}
            </Button>
          </div>

          {/* Statistical Report */}
          {monteCarloStats && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
            >
              {/* Metric Cards Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                  gap: '1rem'
                }}
              >
                <div className="glass-panel" style={{ padding: '1.15rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-card-subtle)' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                    Channel Bit Error Rate
                  </span>
                  <div className="mono tabular-nums" style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--bit-corrupt-text)', marginTop: '0.25rem' }}>
                    {monteCarloStats.rawBer.toFixed(2)}%
                  </div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>({monteCarloStats.rawBitFlips} flips in {monteCarloStats.totalBits} bits)</span>
                </div>

                <div className="glass-panel" style={{ padding: '1.15rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-card-subtle)' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                    Post-Decoding BER
                  </span>
                  <div className="mono tabular-nums" style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--status-success-text)', marginTop: '0.25rem' }}>
                    {monteCarloStats.postBer.toFixed(2)}%
                  </div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>({monteCarloStats.remainingBitFlips} residual errors)</span>
                </div>

                <div className="glass-panel" style={{ padding: '1.15rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-card-subtle)' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                    Single Errors Fixed
                  </span>
                  <div className="mono tabular-nums" style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--status-success-text)', marginTop: '0.25rem' }}>
                    {monteCarloStats.singleErrorWords}
                  </div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>100% successfully fixed</span>
                </div>

                <div className="glass-panel" style={{ padding: '1.15rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-card-subtle)' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                    Double Miscorrections
                  </span>
                  <div className="mono tabular-nums" style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--status-danger-text)', marginTop: '0.25rem' }}>
                    {monteCarloStats.miscorrectedWords}
                  </div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>Decoded to wrong codeword</span>
                </div>
              </div>

              {/* Visual Distribution Bar */}
              <div
                className="glass-panel"
                style={{
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-card-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}
              >
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Codeword Outcome Distribution ({monteCarloStats.packetCount} Packets)
                </span>
                
                {/* Segmented Distribution Bar */}
                <div
                  style={{
                    height: '24px',
                    width: '100%',
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden',
                    display: 'flex',
                    background: 'var(--bg-glass-input)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div
                    style={{
                      width: `${(monteCarloStats.cleanWords / monteCarloStats.packetCount) * 100}%`,
                      background: 'var(--status-success-border)',
                      height: '100%'
                    }}
                    title={`Clean: ${monteCarloStats.cleanWords}`}
                  />
                  <div
                    style={{
                      width: `${(monteCarloStats.singleErrorWords / monteCarloStats.packetCount) * 100}%`,
                      background: 'var(--accent-cyan)',
                      height: '100%'
                    }}
                    title={`Single Fixed: ${monteCarloStats.singleErrorWords}`}
                  />
                  <div
                    style={{
                      width: `${(monteCarloStats.miscorrectedWords / monteCarloStats.packetCount) * 100}%`,
                      background: 'var(--status-danger-border)',
                      height: '100%'
                    }}
                    title={`Miscorrected: ${monteCarloStats.miscorrectedWords}`}
                  />
                  <div
                    style={{
                      width: `${(monteCarloStats.undetectedWords / monteCarloStats.packetCount) * 100}%`,
                      background: 'var(--accent-amber)',
                      height: '100%'
                    }}
                    title={`Undetected: ${monteCarloStats.undetectedWords}`}
                  />
                </div>

                {/* Bar Legend */}
                <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span style={{ width: '8px', height: '8px', background: 'var(--status-success-border)', borderRadius: '2px' }} />
                    Clean ({monteCarloStats.cleanWords})
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span style={{ width: '8px', height: '8px', background: 'var(--accent-cyan)', borderRadius: '2px' }} />
                    Single Fixed ({monteCarloStats.singleErrorWords})
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span style={{ width: '8px', height: '8px', background: 'var(--status-danger-border)', borderRadius: '2px' }} />
                    Miscorrected ({monteCarloStats.miscorrectedWords})
                  </span>
                  {monteCarloStats.undetectedWords > 0 && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span style={{ width: '8px', height: '8px', background: 'var(--accent-amber)', borderRadius: '2px' }} />
                      Undetected ({monteCarloStats.undetectedWords})
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </Card>
    </div>
  );
}

export default ChannelLabPage;
