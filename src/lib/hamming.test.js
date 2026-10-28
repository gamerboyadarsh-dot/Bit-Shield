import { describe, it, expect } from 'vitest';
import {
  REFERENCE_TABLE,
  POSITIONS_META,
  PARITY_CHECKS,
  H_MATRIX,
  validateInput,
  encode,
  parityBreakdown,
  syndrome,
  syndromeToPosition,
  syndromeToString,
  syndromeBreakdown,
  flipBit,
  correct,
  classify,
  arraysEqual,
  cwToString,
  parseBits,
  encodeSecded,
  evaluateSecded,
  textToNibbles,
  nibblesToText,
  encodeText,
  decodeTextCodewords,
  generateCosets
} from './hamming.js';

describe('Hamming (7,4) Pure Mathematical Engine', () => {
  // Suite 1: Reference Table Encoding (16 tests)
  describe('Suite 1: Reference Table Encoding', () => {
    Object.entries(REFERENCE_TABLE).forEach(([msgStr, expectedCw]) => {
      it(`encode(${msgStr}) should produce ${expectedCw}`, () => {
        const msgBits = parseBits(msgStr);
        const cw = encode(msgBits);
        expect(cwToString(cw)).toBe(expectedCw);
      });
    });
  });

  // Suite 2: All 16 codewords have syndrome 000 (16 tests)
  describe('Suite 2: Zero Syndrome on Valid Codewords', () => {
    Object.entries(REFERENCE_TABLE).forEach(([, cwStr]) => {
      it(`syndrome(${cwStr}) should be [0,0,0] and decimal position 0`, () => {
        const cw = parseBits(cwStr);
        const syn = syndrome(cw);
        expect(syn).toEqual([0, 0, 0]);
        expect(syndromeToPosition(syn)).toBe(0);
        expect(syndromeToString(syn)).toBe('000');
      });
    });
  });

  // Suite 3: All 16 x 7 = 112 single-bit error scenarios (112 tests)
  describe('Suite 3: All 112 Single-Bit Error Injections & Corrections', () => {
    Object.entries(REFERENCE_TABLE).forEach(([msgStr, cwStr]) => {
      const cw = parseBits(cwStr);
      for (let p = 1; p <= 7; p++) {
        it(`msg ${msgStr}: error at pos ${p} correctly located and restored`, () => {
          const corrupted = flipBit(cw, p);
          const syn = syndrome(corrupted);
          const detectedPos = syndromeToPosition(syn);
          const restored = correct(corrupted);

          expect(detectedPos).toBe(p);
          expect(arraysEqual(restored, cw)).toBe(true);

          const classification = classify(cw, corrupted, syn, restored);
          expect(classification.status).toBe('SINGLE_ERROR_CORRECTED');
          expect(classification.isSuccess).toBe(true);
        });
      }
    });
  });

  // Suite 4: All 16 no-error cases (16 tests)
  describe('Suite 4: No-Error Identity Verification', () => {
    Object.entries(REFERENCE_TABLE).forEach(([, cwStr]) => {
      it(`correct(${cwStr}) preserves valid codeword without changes`, () => {
        const cw = parseBits(cwStr);
        const syn = syndrome(cw);
        const restored = correct(cw);
        expect(arraysEqual(restored, cw)).toBe(true);

        const classification = classify(cw, cw, syn, restored);
        expect(classification.status).toBe('NO_ERROR');
        expect(classification.title).toBe('No error');
      });
    });
  });

  // Suite 5: Canonical Verified Example (1011 / 0110011 / pos 6 / syndrome 110)
  describe('Suite 5: Canonical Verified Example (1011)', () => {
    it('executes the full cycle for 1011 corrupted at position 6', () => {
      const msg = [1, 0, 1, 1];
      const cw = encode(msg);
      expect(cwToString(cw)).toBe('0110011');

      const pb = parityBreakdown(msg);
      expect(pb[0].value).toBe(0);
      expect(pb[1].value).toBe(1);
      expect(pb[2].value).toBe(0);

      const received = flipBit(cw, 6);
      expect(cwToString(received)).toBe('0110001');

      const syn = syndrome(received);
      expect(syn).toEqual([0, 1, 1]);
      expect(syndromeToString(syn)).toBe('110');
      expect(syndromeToPosition(syn)).toBe(6);

      const restored = correct(received);
      expect(cwToString(restored)).toBe('0110011');
      expect(arraysEqual(restored, cw)).toBe(true);
    });
  });

  // Suite 6: Double-Error Miscorrection Example
  describe('Suite 6: Double-Error Miscorrection Example', () => {
    it('accurately diagnoses double error as miscorrection', () => {
      const cw = parseBits('0110011');
      let received = flipBit(cw, 2);
      received = flipBit(received, 6);
      expect(cwToString(received)).toBe('0010001');

      const syn = syndrome(received);
      expect(syn).toEqual([0, 0, 1]);
      const pos = syndromeToPosition(syn);
      expect(pos).toBe(4);

      const restored = correct(received);
      expect(cwToString(restored)).toBe('0011001');
      expect(arraysEqual(restored, cw)).toBe(false);

      const classification = classify(cw, received, syn, restored);
      expect(classification.status).toBe('MISCORRECTED');
    });
  });

  // Suite 7: Input Validation
  describe('Suite 7: Input Validation Rejections', () => {
    const testCases = [
      { input: '', expected: /empty/ },
      { input: '   ', expected: /empty/ },
      { input: '101', expected: /exactly 4.*you entered 3/ },
      { input: '10111', expected: /exactly 4.*you entered 5/ },
      { input: '10a1', expected: /Only 0 and 1.*'a'/ },
      { input: '2011', expected: /Only 0 and 1.*'2'/ },
      { input: '1 01', expected: /Only 0 and 1.*' '/ },
      { input: '  1011  ', expectedValid: [1, 0, 1, 1] }
    ];

    testCases.forEach(({ input, expected, expectedValid }) => {
      if (expectedValid) {
        it(`accepts trimmed input "${input}"`, () => {
          const res = validateInput(input);
          expect(res.ok).toBe(true);
          expect(res.bits).toEqual(expectedValid);
        });
      } else {
        it(`rejects invalid input "${input}"`, () => {
          const res = validateInput(input);
          expect(res.ok).toBe(false);
          expect(res.error).toMatch(expected);
        });
      }
    });
  });

  // Suite 8: SECDED (8,4)
  describe('Suite 8: SECDED Extended Hamming (8,4)', () => {
    it('accurately distinguishes single errors from double errors', () => {
      const cw8 = encodeSecded([1, 0, 1, 1]);
      expect(cw8.length).toBe(8);
      // Valid codeword: overall parity should be 0
      const validRes = evaluateSecded(cw8);
      expect(validRes.diagnosis).toBe('NO_ERROR');

      // Single error at pos 6: overall parity = 1, pos = 6
      const r8Single = cw8.slice();
      r8Single[5] ^= 1; // flip pos 6
      const singleRes = evaluateSecded(r8Single);
      expect(singleRes.diagnosis).toBe('SINGLE_ERROR');
      expect(singleRes.pos).toBe(6);
      expect(singleRes.overallParity).toBe(1);

      // Double error at pos 2 and pos 6: overall parity = 0, syn != 0
      const r8Double = cw8.slice();
      r8Double[1] ^= 1;
      r8Double[5] ^= 1;
      const doubleRes = evaluateSecded(r8Double);
      expect(doubleRes.diagnosis).toBe('DOUBLE_ERROR_DETECTED');
      expect(doubleRes.overallParity).toBe(0);
    });
  });

  // Suite 9: Text Transmission & Nibbles
  describe('Suite 9: ASCII Text Transmission', () => {
    it('converts text to nibbles and recovers clean text without error', () => {
      const original = 'HAMMING';
      const nibbles = textToNibbles(original);
      const recovered = nibblesToText(nibbles);
      expect(recovered).toBe(original);

      const codewords = encodeText(original);
      const decoded = decodeTextCodewords(codewords, codewords);
      expect(decoded.text).toBe(original);
      expect(decoded.rawErrors).toBe(0);
    });
  });

  // Suite 10: Coset Decomposition
  describe('Suite 10: Lagrange Cosets (128 / 16 = 8)', () => {
    it('generates exactly 8 cosets with 16 distinct codewords each', () => {
      const cosets = generateCosets();
      expect(cosets.length).toBe(8);
      cosets.forEach((c) => {
        expect(c.members.length).toBe(16);
      });
    });
  });
});
