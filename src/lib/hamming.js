/**
 * BitShield - Hamming (7,4) Pure Mathematical Library
 * Course: BAMAT205 Discrete Mathematics and Linear Algebra
 * Module 3: Coding Theory - Error Correction and Detection
 *
 * All functions are pure, deterministic, and have no DOM or React dependencies.
 * Bit positions are 1-indexed (1..7).
 * Codeword format: c = (c1..c7) = (p1, p2, d3, p4, d5, d6, d7).
 * Message bits: (m1, m2, m3, m4) map to (d3, d5, d6, d7).
 * Arithmetic: XOR (addition modulo 2). Even parity.
 */

export const REFERENCE_TABLE = {
  '0000': '0000000',
  '0001': '1101001',
  '0010': '0101010',
  '0011': '1000011',
  '0100': '1001100',
  '0101': '0100101',
  '0110': '1100110',
  '0111': '0001111',
  '1000': '1110000',
  '1001': '0011001',
  '1010': '1011010',
  '1011': '0110011',
  '1100': '0111100',
  '1101': '1010101',
  '1110': '0010110',
  '1111': '1111111'
};

export const POSITIONS_META = [
  { pos: 1, name: 'p1', label: 'p₁', role: 'parity', sub: 1, coveredBy: ['S1'], binary: '001' },
  { pos: 2, name: 'p2', label: 'p₂', role: 'parity', sub: 2, coveredBy: ['S2'], binary: '010' },
  { pos: 3, name: 'd3', label: 'd₃', role: 'data',   sub: 3, dataIndex: 0, msgBit: 'm₁', coveredBy: ['S1', 'S2'], binary: '011' },
  { pos: 4, name: 'p4', label: 'p₄', role: 'parity', sub: 4, coveredBy: ['S4'], binary: '100' },
  { pos: 5, name: 'd5', label: 'd₅', role: 'data',   sub: 5, dataIndex: 1, msgBit: 'm₂', coveredBy: ['S1', 'S4'], binary: '101' },
  { pos: 6, name: 'd6', label: 'd₆', role: 'data',   sub: 6, dataIndex: 2, msgBit: 'm₃', coveredBy: ['S2', 'S4'], binary: '110' },
  { pos: 7, name: 'd7', label: 'd₇', role: 'data',   sub: 7, dataIndex: 3, msgBit: 'm₄', coveredBy: ['S1', 'S2', 'S4'], binary: '111' }
];

export const PARITY_CHECKS = [
  { id: 'S1', name: 'S₁', bitWeight: 1, positions: [1, 3, 5, 7], formula: 'r₁ ⊕ r₃ ⊕ r₅ ⊕ r₇' },
  { id: 'S2', name: 'S₂', bitWeight: 2, positions: [2, 3, 6, 7], formula: 'r₂ ⊕ r₃ ⊕ r₆ ⊕ r₇' },
  { id: 'S4', name: 'S₄', bitWeight: 4, positions: [4, 5, 6, 7], formula: 'r₄ ⊕ r₅ ⊕ r₆ ⊕ r₇' }
];

export const H_MATRIX = [
  // S1 row (covers 1, 3, 5, 7)
  [1, 0, 1, 0, 1, 0, 1],
  // S2 row (covers 2, 3, 6, 7)
  [0, 1, 1, 0, 0, 1, 1],
  // S4 row (covers 4, 5, 6, 7)
  [0, 0, 0, 1, 1, 1, 1]
];

/**
 * Validates a 4-bit message string.
 * Trims whitespace first, then requires exactly 4 characters matching /^[01]{4}$/.
 */
export function validateInput(raw) {
  if (typeof raw !== 'string') {
    return { ok: false, error: 'Input must be a string.', bits: null };
  }
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return { ok: false, error: 'Enter exactly 4 bits; the input is empty.', bits: null };
  }
  if (trimmed.length !== 4) {
    return {
      ok: false,
      error: `Enter exactly 4 bits; you entered ${trimmed.length}.`,
      bits: null
    };
  }
  for (let i = 0; i < 4; i++) {
    if (trimmed[i] !== '0' && trimmed[i] !== '1') {
      return {
        ok: false,
        error: `Only 0 and 1 are allowed; found '${trimmed[i]}' at position ${i + 1}.`,
        bits: null
      };
    }
  }
  return {
    ok: true,
    error: null,
    bits: trimmed.split('').map(Number)
  };
}

/**
 * Encodes 4 message bits into a 7-bit Hamming codeword.
 * msgBits: [m1, m2, m3, m4] -> mapped to [d3, d5, d6, d7].
 * Returns [p1, p2, d3, p4, d5, d6, d7].
 */
export function encode(msgBits) {
  if (!Array.isArray(msgBits) || msgBits.length !== 4) {
    throw new Error('encode requires an array of 4 bits [m1, m2, m3, m4].');
  }
  const d3 = msgBits[0] & 1;
  const d5 = msgBits[1] & 1;
  const d6 = msgBits[2] & 1;
  const d7 = msgBits[3] & 1;

  const p1 = d3 ^ d5 ^ d7;
  const p2 = d3 ^ d6 ^ d7;
  const p4 = d5 ^ d6 ^ d7;

  return [p1, p2, d3, p4, d5, d6, d7];
}

/**
 * Computes the parity calculations breakdown with formula, substituted values, and result.
 */
export function parityBreakdown(msgBits) {
  const d3 = msgBits[0] & 1;
  const d5 = msgBits[1] & 1;
  const d6 = msgBits[2] & 1;
  const d7 = msgBits[3] & 1;

  const p1 = d3 ^ d5 ^ d7;
  const p2 = d3 ^ d6 ^ d7;
  const p4 = d5 ^ d6 ^ d7;

  return [
    {
      bit: 'p₁',
      formula: 'd₃ ⊕ d₅ ⊕ d₇',
      substituted: `${d3} ⊕ ${d5} ⊕ ${d7}`,
      value: p1,
      expression: `p₁ = d₃ ⊕ d₅ ⊕ d₇ = ${d3} ⊕ ${d5} ⊕ ${d7} = ${p1}`
    },
    {
      bit: 'p₂',
      formula: 'd₃ ⊕ d₆ ⊕ d₇',
      substituted: `${d3} ⊕ ${d6} ⊕ ${d7}`,
      value: p2,
      expression: `p₂ = d₃ ⊕ d₆ ⊕ d₇ = ${d3} ⊕ ${d6} ⊕ ${d7} = ${p2}`
    },
    {
      bit: 'p₄',
      formula: 'd₅ ⊕ d₆ ⊕ d₇',
      substituted: `${d5} ⊕ ${d6} ⊕ ${d7}`,
      value: p4,
      expression: `p₄ = d₅ ⊕ d₆ ⊕ d₇ = ${d5} ⊕ ${d6} ⊕ ${d7} = ${p4}`
    }
  ];
}

/**
 * Computes the syndrome on a received 7-bit word r = [r1, r2, r3, r4, r5, r6, r7].
 * Returns [S1, S2, S4].
 */
export function syndrome(r) {
  if (!Array.isArray(r) || r.length !== 7) {
    throw new Error('syndrome requires an array of 7 bits.');
  }
  const S1 = (r[0] ^ r[2] ^ r[4] ^ r[6]) & 1;
  const S2 = (r[1] ^ r[2] ^ r[5] ^ r[6]) & 1;
  const S4 = (r[3] ^ r[4] ^ r[5] ^ r[6]) & 1;

  return [S1, S2, S4];
}

/**
 * Converts syndrome [S1, S2, S4] to the decimal position (0..7).
 * Syndrome is displayed in order S4 S2 S1.
 * Decimal position = 4*S4 + 2*S2 + 1*S1.
 */
export function syndromeToPosition(syn) {
  return 4 * syn[2] + 2 * syn[1] + 1 * syn[0];
}

/**
 * Formats syndrome as the 3-bit binary string 'S4 S2 S1' or 'S4S2S1'.
 */
export function syndromeToString(syn, spaced = false) {
  return spaced ? `${syn[2]} ${syn[1]} ${syn[0]}` : `${syn[2]}${syn[1]}${syn[0]}`;
}

/**
 * Returns detailed syndrome calculations breakdown for each check S1, S2, S4.
 */
export function syndromeBreakdown(r) {
  const [S1, S2, S4] = syndrome(r);
  return [
    {
      check: 'S₁',
      id: 'S1',
      formula: 'r₁ ⊕ r₃ ⊕ r₅ ⊕ r₇',
      positions: [1, 3, 5, 7],
      values: [r[0], r[2], r[4], r[6]],
      substituted: `${r[0]} ⊕ ${r[2]} ⊕ ${r[4]} ⊕ ${r[6]}`,
      result: S1,
      passed: S1 === 0
    },
    {
      check: 'S₂',
      id: 'S2',
      formula: 'r₂ ⊕ r₃ ⊕ r₆ ⊕ r₇',
      positions: [2, 3, 6, 7],
      values: [r[1], r[2], r[5], r[6]],
      substituted: `${r[1]} ⊕ ${r[2]} ⊕ ${r[5]} ⊕ ${r[6]}`,
      result: S2,
      passed: S2 === 0
    },
    {
      check: 'S₄',
      id: 'S4',
      formula: 'r₄ ⊕ r₅ ⊕ r₆ ⊕ r₇',
      positions: [4, 5, 6, 7],
      values: [r[3], r[4], r[5], r[6]],
      substituted: `${r[3]} ⊕ ${r[4]} ⊕ ${r[5]} ⊕ ${r[6]}`,
      result: S4,
      passed: S4 === 0
    }
  ];
}

/**
 * Flips the bit at 1-indexed position `pos` (1..7).
 * Returns a new array.
 */
export function flipBit(cw, pos) {
  if (!Array.isArray(cw) || cw.length !== 7) {
    throw new Error('flipBit requires a 7-bit array.');
  }
  if (pos < 1 || pos > 7) {
    throw new Error(`Position must be between 1 and 7; got ${pos}.`);
  }
  const next = cw.slice();
  next[pos - 1] ^= 1;
  return next;
}

/**
 * Applies single-bit Hamming correction based on the syndrome.
 * If syndrome is 000, returns a copy of cw.
 * Otherwise, inverts the bit at the position indicated by the syndrome.
 */
export function correct(cw) {
  const syn = syndrome(cw);
  const pos = syndromeToPosition(syn);
  if (pos === 0) {
    return cw.slice();
  }
  return flipBit(cw, pos);
}

/**
 * Classifies the outcome based on original O, received R, syndrome s, and corrected C.
 */
export function classify(O, R, syn, C) {
  const rMatchesO = arraysEqual(R, O);
  const cMatchesO = arraysEqual(C, O);
  const pos = syndromeToPosition(syn);

  let diffCount = 0;
  for (let i = 0; i < 7; i++) {
    if (R[i] !== O[i]) diffCount++;
  }

  if (rMatchesO) {
    return {
      status: 'NO_ERROR',
      category: 'no-error',
      title: 'No error',
      message: 'The received word equals the original codeword. No correction needed.',
      diffCount: 0,
      isSuccess: true
    };
  }

  if (diffCount === 1 && pos !== 0 && cMatchesO) {
    return {
      status: 'SINGLE_ERROR_CORRECTED',
      category: 'corrected',
      title: 'Single error corrected',
      message: 'The single-bit error was accurately located by the syndrome and restored to the original codeword.',
      diffCount: 1,
      isSuccess: true
    };
  }

  if (diffCount >= 2 && pos !== 0) {
    return {
      status: 'MISCORRECTED',
      category: 'miscorrected',
      title: 'Miscorrected',
      message: 'Standard Hamming(7,4) decoding assumes at most one error. With 2 or more errors, the syndrome points to a different valid codeword. Note that verification passing (syndrome 000) does NOT mean the word is correct; a real receiver cannot detect this miscorrection.',
      diffCount,
      isSuccess: false
    };
  }

  if (diffCount >= 3 && pos === 0) {
    return {
      status: 'UNDETECTED_ERROR',
      category: 'undetected',
      title: 'Undetected error',
      message: 'The received word happens to be a different valid codeword (syndrome 000), so no error is flagged. The corruption is completely undetected.',
      diffCount,
      isSuccess: false
    };
  }

  return {
    status: 'UNDETECTED_ERROR',
    category: 'undetected',
    title: 'Undetected error',
    message: 'Syndrome is 000 but the received word differs from the original codeword.',
    diffCount,
    isSuccess: false
  };
}

export function arraysEqual(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

export function cwToString(cw) {
  return Array.isArray(cw) ? cw.join('') : '';
}

export function parseBits(str) {
  return str.split('').map(Number);
}

// ============================================================
//  EXTENDED FEATURES: SECDED (Hamming 8,4)
// ============================================================

/**
 * Encodes 4 message bits into an 8-bit SECDED codeword:
 * c8 = (p1, p2, d3, p4, d5, d6, d7, p8)
 * where p8 = c1 ⊕ c2 ⊕ ... ⊕ c7 (overall even parity across all 8 bits)
 */
export function encodeSecded(msgBits) {
  const cw7 = encode(msgBits);
  const p8 = cw7.reduce((acc, b) => acc ^ b, 0);
  return [...cw7, p8];
}

/**
 * Evaluates SECDED syndrome and overall parity on an 8-bit received word.
 * Returns { syn: [S1,S2,S4], pos: number, overallParity: number }
 */
export function evaluateSecded(r8) {
  if (!Array.isArray(r8) || r8.length !== 8) {
    throw new Error('evaluateSecded requires an 8-bit array.');
  }
  const r7 = r8.slice(0, 7);
  const syn = syndrome(r7);
  const pos = syndromeToPosition(syn);
  const overallParity = r8.reduce((acc, b) => acc ^ b, 0); // 0 = even (pass), 1 = odd (fail)

  let diagnosis = 'NO_ERROR';
  let corrected8 = r8.slice();

  if (pos === 0 && overallParity === 0) {
    diagnosis = 'NO_ERROR';
  } else if (pos !== 0 && overallParity === 1) {
    diagnosis = 'SINGLE_ERROR';
    corrected8[pos - 1] ^= 1;
  } else if (pos !== 0 && overallParity === 0) {
    diagnosis = 'DOUBLE_ERROR_DETECTED';
  } else if (pos === 0 && overallParity === 1) {
    diagnosis = 'PARITY_BIT_ERROR'; // p8 itself is flipped
    corrected8[7] ^= 1;
  }

  return {
    syn,
    pos,
    overallParity,
    diagnosis,
    correctedWord: corrected8
  };
}

// ============================================================
//  EXTENDED FEATURES: ASCII Text Transmission
// ============================================================

/**
 * Converts a text string into an array of 4-bit nibbles.
 */
export function textToNibbles(text) {
  const nibbles = [];
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i) & 0xff;
    const high = (code >> 4) & 0x0f;
    const low = code & 0x0f;
    nibbles.push(
      high.toString(2).padStart(4, '0').split('').map(Number),
      low.toString(2).padStart(4, '0').split('').map(Number)
    );
  }
  return nibbles;
}

/**
 * Reconstructs a text string from an array of 4-bit nibbles.
 */
export function nibblesToText(nibbles) {
  let result = '';
  for (let i = 0; i < nibbles.length; i += 2) {
    if (i + 1 >= nibbles.length) break;
    const highVal = parseInt(nibbles[i].join(''), 2);
    const lowVal = parseInt(nibbles[i + 1].join(''), 2);
    const charCode = (highVal << 4) | lowVal;
    result += String.fromCharCode(charCode);
  }
  return result;
}

/**
 * Encodes an ASCII text string into a list of 7-bit codewords.
 */
export function encodeText(text) {
  const nibbles = textToNibbles(text);
  return nibbles.map((nibble) => encode(nibble));
}

/**
 * Simulates a Binary Symmetric Channel (BSC) with error probability `p`.
 * Flips each bit independently with probability `p`.
 */
export function simulateBscNoise(codewords, errorProb) {
  return codewords.map((cw) => {
    return cw.map((bit) => (Math.random() < errorProb ? bit ^ 1 : bit));
  });
}

/**
 * Decodes a list of received 7-bit codewords into recovered text and statistics.
 */
export function decodeTextCodewords(receivedCodewords, originalCodewords = null) {
  const correctedCodewords = receivedCodewords.map((cw) => correct(cw));
  const recoveredNibbles = correctedCodewords.map((cw) => [cw[2], cw[4], cw[5], cw[6]]);
  const text = nibblesToText(recoveredNibbles);

  let totalBits = receivedCodewords.length * 7;
  let rawErrors = 0;
  let remainingErrors = 0;

  if (originalCodewords) {
    for (let c = 0; c < originalCodewords.length; c++) {
      for (let b = 0; b < 7; b++) {
        if (receivedCodewords[c][b] !== originalCodewords[c][b]) rawErrors++;
        if (correctedCodewords[c][b] !== originalCodewords[c][b]) remainingErrors++;
      }
    }
  }

  return {
    text,
    correctedCodewords,
    rawErrors,
    remainingErrors,
    rawBer: totalBits > 0 ? rawErrors / totalBits : 0,
    postBer: totalBits > 0 ? remainingErrors / totalBits : 0
  };
}

// ============================================================
//  EXTENDED FEATURES: Coset Decomposition (Lagrange's Theorem)
// ============================================================

/**
 * Generates the 8 cosets of (Z2^7, XOR) with respect to the codeword subgroup C.
 * Lagrange: 128 elements / 16 codewords = 8 cosets.
 * Each coset has a unique 3-bit syndrome and a minimal weight coset leader.
 */
export function generateCosets() {
  const allCodewords = Object.values(REFERENCE_TABLE).map(parseBits);
  const syndromesList = ['000', '001', '010', '011', '100', '101', '110', '111'];

  // Leaders for the 8 syndromes: leader has 1 at the error position (or all 0 for 000)
  const cosets = syndromesList.map((synStr) => {
    const s4 = Number(synStr[0]);
    const s2 = Number(synStr[1]);
    const s1 = Number(synStr[2]);
    const pos = 4 * s4 + 2 * s2 + s1;

    const leader = [0, 0, 0, 0, 0, 0, 0];
    if (pos > 0) leader[pos - 1] = 1;

    // The coset is leader ⊕ c for each c in C
    const members = allCodewords.map((c) => {
      const word = c.map((bit, idx) => bit ^ leader[idx]);
      return cwToString(word);
    });

    return {
      syndromeStr: synStr,
      pos,
      leader: cwToString(leader),
      leaderWeight: pos === 0 ? 0 : 1,
      description: pos === 0 ? 'Codeword subgroup C (zero error)' : `Single error at position ${pos}`,
      members
    };
  });

  return cosets;
}
