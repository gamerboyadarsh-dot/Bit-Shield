# BitShield – Hamming (7,4) Error Detection & Correction Simulator

A comprehensive, professional React + Vite educational application built for **BAMAT205 Discrete Mathematics and Linear Algebra** (Module 3: Coding Theory – Error Correction and Detection in Communication).

---

## 1. Quick Start & Offline Execution

### Option A: Open Compiled Single-File Build (Zero Setup)
The production build compiles HTML, React, CSS, Lucide icons, fonts, and logic into **one offline-capable file**:
1. Open [`dist/index.html`](file:///C:/Users/agraw/.gemini/antigravity/scratch/BitShield/dist/index.html).
2. **Double-click `dist/index.html`** to launch it in Google Chrome, Microsoft Edge, or any modern web browser.
3. Completely standalone; zero internet connection or background server needed.

### Option B: Development Server & Terminal Execution
```bash
# 1. Install dependencies
npm install

# 2. Run local development server with Hot Module Replacement (HMR)
npm run dev
# Live at: http://localhost:5173/

# 3. Execute unit test suite via Vitest
npm test
# 173 passed assertions in 16ms

# 4. Compile single-file distribution
npm run build
# Output: dist/index.html (~892 kB)
```

---

## 2. Comprehensive Feature Suite

### 1. Interactive Simulator (`#simulator`)
- **Dual Visual Modes**: Toggle between the **7-Bit Linear Grid** (`<Codeword>` + `<ParityGroups>`) and the **Geometric 3-Circle Venn Diagram** (`<VennDiagram>`).
- **Synchronized Message Input**: 4 binary toggle buttons synchronized in real time with binary text entry.
- **Scenario Presets Library**: One-click scenario buttons:
  - *Textbook Canonical (`1011` with pos 6 error)*
  - *Double-Error Miscorrection Trap (`0110011` with pos 2 & 6 errors)*
  - *Undetected 3-Bit Flip (`0000000` vs `1101001`)*
  - *All-Zeros baseline (`0000`)*
  - *All-Ones symmetry (`1111`)*
- **SECDED Mode Toggle**: Extended Hamming (8,4) with overall parity bit $p_8$, differentiating single errors (correctable) from double errors (safely detected).
- **Print Academic Lab Report**: Clean `@media print` report stylesheet triggered via the **Print Lab Report** button.

### 2. Communication Channel Laboratory (`#lab`)
- **ASCII Text Transmission**: Type phrases (e.g. `"BAMAT205"`, `"HELLO WORLD"`). Converts characters to 8-bit ASCII $\to$ two 4-bit nibbles $\to$ 7-bit Hamming codewords. Demonstrates real-time noise corruption and error recovery.
- **Monte Carlo BSC Channel Simulator**: Configure bit-flip probability $p$ and batch sizes (100, 500, 1000 words). Measures raw channel Bit Error Rate (BER) vs. post-decoding BER, single-error recovery rate, and double-error miscorrections.

### 3. Exam Revision & Practice Quiz (`#quiz`)
- Randomized practice challenges:
  - Parity bit calculations ($p_1, p_2, p_4$)
  - Syndrome decoding & coordinate localization ($S_4 S_2 S_1 \to \text{pos } k$)
  - Coding theory bounds & multi-error limitations
- Immediate explanations with substituted modulo-2 arithmetic, scoring, and progress tracking.

### 4. Mathematical Foundations & Theory (`#theory`)
- **Live Matrix Multiplier**: Interactive dot-product calculator evaluating $s = H \cdot r^T \pmod 2$.
- **Coset Decomposition Explorer**: Visualizes the 8 cosets of $\mathbb{Z}_2^7 / C$ according to Lagrange's theorem, with their minimal-weight coset leaders and all 16 codeword vectors.
- Position allocation tables, Galois field GF(2) properties, worked examples, and rank-nullity proofs.

### 5. Guided Demonstration (`#demo`)
- 7-stage guided walkthrough of $1011 \to 0110011 \to \text{flip pos 6} \to S=110 \to \text{restore}$ with manual step controls and 1.5-second auto-play.

### 6. In-Browser Self-Test Panel (`#selftest`)
- Live execution of 177 automated assertions with real-time pass/fail indicators and expandable details.

---

## 3. Mathematical Reference

### Parity Equations
$$p_1 = d_3 \oplus d_5 \oplus d_7, \quad p_2 = d_3 \oplus d_6 \oplus d_7, \quad p_4 = d_5 \oplus d_6 \oplus d_7$$

### Syndrome Coordinates
$$S_1 = r_1 \oplus r_3 \oplus r_5 \oplus r_7, \quad S_2 = r_2 \oplus r_3 \oplus r_6 \oplus r_7, \quad S_4 = r_4 \oplus r_5 \oplus r_6 \oplus r_7$$
$$\text{Error Position} = 4 \cdot S_4 + 2 \cdot S_2 + 1 \cdot S_1$$

### Parity-Check Matrix $H$
$$H = \begin{pmatrix} 1 & 0 & 1 & 0 & 1 & 0 & 1 \\ 0 & 1 & 1 & 0 & 0 & 1 & 1 \\ 0 & 0 & 0 & 1 & 1 & 1 & 1 \end{pmatrix}$$
$$s = H \cdot r^T = H \cdot e^T \pmod 2$$
