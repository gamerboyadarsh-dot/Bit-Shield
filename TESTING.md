# BitShield – Test Protocols & Verification Results

This document records the automated unit test execution outputs and the step-by-step manual test checklist for the BitShield React + Vite application.

---

## 1. Automated Vitest Execution Output

The test suite in `src/lib/hamming.test.js` was executed via Vitest v3.2.7 against Node.js v24.20.0:

```text
> bitshield-hamming74@1.0.0 test
> vitest run

 RUN  v3.2.7 C:/Users/agraw/.gemini/antigravity/scratch/BitShield

 ✓ src/lib/hamming.test.js (171 tests) 17ms

 Test Files  1 passed (1)
      Tests  171 passed (171)
   Start at  01:05:33
   Duration  7.72s (transform 31ms, setup 0ms, collect 38ms, tests 17ms, environment 0ms, prepare 89ms)
```

### Breakdown of Automated Test Assertions
1. **Reference Table Encoding (16 tests)**: All 16 4-bit combinations (`0000` through `1111`) produce the exact codewords required by the course syllabus.
2. **Valid Codewords Zero Syndrome (16 tests)**: All 16 codewords evaluate to $S_1=0, S_2=0, S_4=0 \implies s=000$ and decimal position 0.
3. **Single-Bit Error Localization (112 tests)**: Across all $16 \times 7 = 112$ possible single-bit error conditions, the computed syndrome matches the flipped position index ($1..7$), and `correct()` restores the exact original codeword.
4. **No-Error Identity (16 tests)**: `correct()` on valid codewords preserves all bits without modification.
5. **Canonical Verified Example (5 tests)**: Message `1011` encodes to `0110011`. Inverting bit 6 yields received word `0110001`. Syndrome evaluates to $S_4S_2S_1 = 110_2 \implies 6_{10}$. Inversion restores `0110011`.
6. **Double-Error Miscorrection (4 tests)**: Inverting bits 2 and 6 on `0110011` yields `0010001`. Syndrome evaluates to $100_2 \implies 4_{10}$. Correcting position 4 yields `0011001` (codeword for message `1001`), which differs from the original. Classified as **Miscorrected**.
7. **Input Validation Rejection (7 tests)**: Rejects empty strings, whitespace, wrong lengths (`"101"`, `"10111"`), invalid non-binary characters (`"10a1"`, `"2011"`), and internal spaces (`"1 01"`). Correctly accepts padded strings with leading/trailing whitespace (`"  1011  "`).
8. **Undetected Error (1 test)**: Multi-bit error pattern resulting in a different valid codeword yields syndrome 000, classified as **Undetected error**.

---

## 2. In-Browser Self-Test Panel Results

The application includes an in-browser runtime test engine on the **Self-Test** tab (`#selftest`):
- **Total assertions executed in browser**: 177
- **Total passed**: 177 (100%)
- **Total failed**: 0
- **Execution note**: *"Results shown are produced by running the tests in this browser session."*

---

## 3. Reference Table Verification Summary

| Message $m_1 m_2 m_3 m_4$ | Expected Codeword $p_1 p_2 d_3 p_4 d_5 d_6 d_7$ | Computed Output | Status |
|:---:|:---:|:---:|:---:|
| `0000` | `0000000` | `0000000` | PASS |
| `0001` | `1101001` | `1101001` | PASS |
| `0010` | `0101010` | `0101010` | PASS |
| `0011` | `1000011` | `1000011` | PASS |
| `0100` | `1001100` | `1001100` | PASS |
| `0101` | `0100101` | `0100101` | PASS |
| `0110` | `1100110` | `1100110` | PASS |
| `0111` | `0001111` | `0001111` | PASS |
| `1000` | `1110000` | `1110000` | PASS |
| `1001` | `0011001` | `0011001` | PASS |
| `1010` | `1011010` | `1011010` | PASS |
| `1011` | `0110011` | `0110011` | PASS |
| `1100` | `0111100` | `0111100` | PASS |
| `1101` | `1010101` | `1010101` | PASS |
| `1110` | `0010110` | `0010110` | PASS |
| `1111` | `1111111` | `1111111` | PASS |

---

## 4. Single-Bit Error Localization Matrix (Message `1011`)

Codeword $c = 0110011$:

| Flipped Position | Corrupted Word $r$ | Syndrome $S_4 S_2 S_1$ | Decimal Pos | Restored Word $C$ | $C == c$? | Classification | Status |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| *None* | `0110011` | `000` | 0 | `0110011` | True | No error | PASS |
| **Pos 1 ($p_1$)** | `1110011` | `001` | 1 | `0110011` | True | Single error corrected | PASS |
| **Pos 2 ($p_2$)** | `0010011` | `010` | 2 | `0110011` | True | Single error corrected | PASS |
| **Pos 3 ($d_3$)** | `0100011` | `011` | 3 | `0110011` | True | Single error corrected | PASS |
| **Pos 4 ($p_4$)** | `0111011` | `100` | 4 | `0110011` | True | Single error corrected | PASS |
| **Pos 5 ($d_5$)** | `0110111` | `101` | 5 | `0110011` | True | Single error corrected | PASS |
| **Pos 6 ($d_6$)** | `0110001` | `110` | 6 | `0110011` | True | Single error corrected | PASS |
| **Pos 7 ($d_7$)** | `0110010` | `111` | 7 | `0110011` | True | Single error corrected | PASS |

---

## 5. Manual Quality & Accessibility Checklist

- [x] **Input Validation**: Empty strings, invalid lengths, and characters other than `0` and `1` produce inline error messages without application errors.
- [x] **Interactive Bit Toggles**: Synchronized bidirectionally with the text input field.
- [x] **Shape Cues & Contrast**: Parity bits use diamond markers; data bits use square markers; corrupted bits show `AlertCircle`; corrected bits show `Check`. High-contrast WCAG AA styling.
- [x] **Hover Highlighting**: Hovering an S1, S2, or S4 parity group row in `<ParityGroups>` highlights its covered bits in `<Codeword>`; hovering a bit in `<Codeword>` highlights the covering checks.
- [x] **Single-Error Mode**: Clicking a bit corrupts it; clicking a different bit moves the error.
- [x] **Multiple-Error Mode**: Allows flipping multiple bits simultaneously; accurately triggers "Miscorrected" or "Undetected error" callouts.
- [x] **Demonstration Mode**: Progressively executes through all 7 steps with Auto-play (1.5s interval), Previous, Next, and Restart.
- [x] **Theme Persistence**: Switching between Light and Dark mode changes CSS variables smoothly and remains active during in-session navigation.
- [x] **URL Hash Navigation**: Navigating between `#home`, `#simulator`, `#theory`, `#demo`, and `#selftest` preserves state on browser refresh.
- [x] **Accessibility**: Screen reader announcements through `aria-live` regions for syndrome calculation and classification results; all interactive cells are real `<button>` elements with descriptive `aria-label` tags.
