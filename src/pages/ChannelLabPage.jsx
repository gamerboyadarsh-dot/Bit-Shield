import React, { useState } from 'react';
import { Radio, RefreshCw, Send, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';
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

        // Decode
        const S1 = r[0] ^ r[2] ^ r[4] ^ r[6];
        const S2 = r[1] ^ r[2] ^ r[5] ^ r[6];
        const S4 = r[3] ^ r[4] ^ r[5] ^ r[6];
        const synPos = 4 * S4 + 2 * S2 + S1;

        const fixed = synPos > 0 ? r.slice() : r;
        if (synPos > 0) fixed[synPos - 1] ^= 1;

        // Check if fixed matches c
        let fixedDiffs = 0;
        for (let b = 0; b < 7; b++) if (fixed[b] !== c[b]) fixedDiffs++;
        remainingBitFlips += fixedDiffs;

        if (diffs >= 2 && synPos !== 0) miscorrectedWords++;
        if (diffs >= 3 && synPos === 0) undetectedWords++;
      }

      setMonteCarloStats({
        packetCount,
        monteCarloP,
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
    }, 100);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)' }}>
          Communication Channel Laboratory
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginTop: '0.25rem' }}>
          Real-world string transmission and statistical Monte Carlo Binary Symmetric Channel (BSC) simulations.
        </p>
      </div>

      {/* FEATURE 1: ASCII Text Transmission */}
      <Card
        title="1. ASCII Text Transmission through Noisy Channel"
        subtitle="Each character (8 bits) is split into two 4-bit nibbles and protected by Hamming (7,4)."
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: '1', minWidth: '220px' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-subtle)', marginBottom: '0.375rem' }}>
                Message String to Transmit
              </label>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value.slice(0, 16))}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.875rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-card)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-main)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ minWidth: '180px' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-subtle)', marginBottom: '0.375rem' }}>
                Channel Noise Probability: {(textErrorRate * 100).toFixed(1)}%
              </label>
              <input
                type="range"
                min="0"
                max="0.15"
                step="0.01"
                value={textErrorRate}
                onChange={(e) => setTextErrorRate(parseFloat(e.target.value))}
                style={{ width: '100%' }}
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
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1rem'
            }}
          >
            {/* Original */}
            <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-card-subtle)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-subtle)', textTransform: 'uppercase' }}>
                Transmitted Text
              </span>
              <div className="mono" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.25rem' }}>
                {inputText}
              </div>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-subtle)' }}>
                {inputText.length * 2} Hamming codewords ({inputText.length * 14} bits)
              </span>
            </div>

            {/* Corrupted Channel */}
            <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: 'var(--bit-corrupt-bg)', border: '1px solid var(--bit-corrupt-border)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--bit-corrupt-text)', textTransform: 'uppercase' }}>
                Noise-Corrupted Channel
              </span>
              <div className="mono" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--bit-corrupt-text)', marginTop: '0.25rem' }}>
                {textSimulation.decoded.rawErrors} bit flips introduced
              </div>
              <span style={{ fontSize: '0.8125rem', color: 'var(--bit-corrupt-text)' }}>
                Raw BER: {(textSimulation.decoded.rawBer * 100).toFixed(1)}%
              </span>
            </div>

            {/* Recovered */}
            <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: 'var(--status-success-bg)', border: '1px solid var(--status-success-border)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--status-success-text)', textTransform: 'uppercase' }}>
                Decoded & Recovered Text
              </span>
              <div className="mono" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--status-success-text)', marginTop: '0.25rem' }}>
                {textSimulation.decoded.text}
              </div>
              <span style={{ fontSize: '0.8125rem', color: 'var(--status-success-text)' }}>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: '1', minWidth: '200px' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-subtle)', marginBottom: '0.375rem' }}>
                Bit-Flip Probability (p): {(monteCarloP * 100).toFixed(1)}%
              </label>
              <input
                type="range"
                min="0.005"
                max="0.10"
                step="0.005"
                value={monteCarloP}
                onChange={(e) => setMonteCarloP(parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ minWidth: '160px' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-subtle)', marginBottom: '0.375rem' }}>
                Batch Size
              </label>
              <select
                value={packetCount}
                onChange={(e) => setPacketCount(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-card)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-main)',
                  fontSize: '0.9375rem'
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
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginTop: '0.5rem'
              }}
            >
              <div style={{ padding: '0.875rem', background: 'var(--bg-card-subtle)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', display: 'block' }}>Channel Bit Error Rate</span>
                <span className="mono tabular-nums" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--bit-corrupt-text)' }}>
                  {monteCarloStats.rawBer.toFixed(2)}%
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>({monteCarloStats.rawBitFlips} flips)</span>
              </div>

              <div style={{ padding: '0.875rem', background: 'var(--bg-card-subtle)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', display: 'block' }}>Post-Decoding BER</span>
                <span className="mono tabular-nums" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--status-success-text)' }}>
                  {monteCarloStats.postBer.toFixed(2)}%
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>({monteCarloStats.remainingBitFlips} residual)</span>
              </div>

              <div style={{ padding: '0.875rem', background: 'var(--bg-card-subtle)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', display: 'block' }}>Single Errors Corrected</span>
                <span className="mono tabular-nums" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--status-success-text)' }}>
                  {monteCarloStats.singleErrorWords}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>100% successfully fixed</span>
              </div>

              <div style={{ padding: '0.875rem', background: 'var(--bg-card-subtle)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', display: 'block' }}>Double-Error Miscorrections</span>
                <span className="mono tabular-nums" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--status-danger-text)' }}>
                  {monteCarloStats.miscorrectedWords}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Decoded to wrong codeword</span>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
