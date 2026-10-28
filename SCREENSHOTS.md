# BitShield – Screenshot Capture Guide for Reports & Posters

This guide details the procedure for capturing high-resolution figures from the compiled BitShield React application (`dist/index.html`) for lab reports, academic posters, and slide decks.

---

## 1. Capture Environment Specifications

| Parameter | Specification |
|---|---|
| **Target Build** | [`dist/index.html`](file:///C:/Users/agraw/.gemini/antigravity/scratch/BitShield/dist/index.html) |
| **Browser** | Google Chrome or Microsoft Edge |
| **Standard Resolutions** | **1920 × 1080** (Full HD) or **1440 × 900** (Laptop WXGA+) |
| **Browser Zoom** | **100%** |
| **Theme** | Light theme (default) |
| **Color Depth** | 24-bit sRGB PNG |

> **Pro-Tip for Pixel-Perfect Captures**:
> In Chrome DevTools (`F12`), press `Ctrl + Shift + M` to toggle Device Mode, enter `1920` by `1080`, and choose **Capture full size screenshot** or **Capture screenshot** from the three-dot menu.

---

## 2. Screenshot Manifest & Capture Instructions

### Figure 1: Home Live Preview & Communication Workflow
- **Filename**: `fig_01_home_live_preview.png`
- **URL Route**: `dist/index.html#home`
- **Resolution**: 1920 × 1080 or 1440 × 900
- **Instructions**:
  1. Open `dist/index.html#home`.
  2. Click bit box 6 ($d_6$) on the right-hand live preview card to show the live syndrome calculation ($110_2 \implies 6_{10}$).
  3. Frame the viewport to capture the title, subtitle, the interactive preview card with the flipped bit, and the 5-node communication workflow SVG diagram.

---

### Figure 2: Simulator with Bit 6 Corrupted
- **Filename**: `fig_02_simulator_bit6_corrupted.png`
- **URL Route**: `dist/index.html#simulator`
- **Resolution**: 1920 × 1080 or 1440 × 900
- **Instructions**:
  1. Open `dist/index.html#simulator`.
  2. Enter message `1011` and click **Encode**.
  3. In the right-hand inspection panel, click bit box 6 ($d_6$) to flip its value from `1` to `0`.
  4. Ensure bit box 6 displays its red border, red background, and the `AlertCircle` warning icon.

---

### Figure 3: Syndrome 110 Calculation Panel
- **Filename**: `fig_03_syndrome_110_panel.png`
- **URL Route**: `dist/index.html#simulator`
- **Resolution**: 1920 × 1080 or 1440 × 900
- **Instructions**:
  1. From Figure 2, click **Evaluate Syndrome**.
  2. Capture the left-hand panel displaying the 3 parity check equations ($S_1=0$, $S_2=1$, $S_4=1$), their pass/fail badges, and the diagnosis banner: `S₄ S₂ S₁ = 110₂ = 6₁₀ — Position 6 is identified`.

---

### Figure 4: Corrected Result & Verification
- **Filename**: `fig_04_corrected_verification.png`
- **URL Route**: `dist/index.html#simulator`
- **Resolution**: 1920 × 1080 or 1440 × 900
- **Instructions**:
  1. Click **Correct Position 6**.
  2. Step 4/5 reveals the verification card displaying `Recomputed Syn(C) = 000` and `C Matches Original O? Yes (Identity)`.
  3. The inspection panel displays bit 6 highlighted in amber with the `Check` icon badge.
  4. Capture the green success callout: `Single error corrected: The single-bit error was accurately located by the syndrome and restored to the original codeword.`

---

### Figure 5: Theory Parity-Check Matrix H Card
- **Filename**: `fig_05_theory_h_matrix.png`
- **URL Route**: `dist/index.html#theory`
- **Resolution**: 1920 × 1080 or 1440 × 900
- **Instructions**:
  1. Navigate to the **Theory** tab and scroll to section **6. Parity-Check Matrix H**.
  2. Capture the aligned $3 \times 7$ matrix $H$, the equation $s = H \cdot r^T = H \cdot e^T$, and the explanation of binary coordinate vectors.

---

### Figure 6: Guided Demonstration Mid-Way (Step 4 / 7)
- **Filename**: `fig_06_demo_step4.png`
- **URL Route**: `dist/index.html#demo`
- **Resolution**: 1920 × 1080 or 1440 × 900
- **Instructions**:
  1. Navigate to the **Demo** tab.
  2. Click **Next** until reaching **Step 4: Syndrome Matrix Multiplication**.
  3. Capture the 7-bit codeword visual, the active ParityGroups matrix row, and the step calculation card showing $S_1=0, S_2=1, S_4=1$.

---

### Figure 7: In-Browser Self-Test Results Panel
- **Filename**: `fig_07_selftest_results.png`
- **URL Route**: `dist/index.html#selftest`
- **Resolution**: 1920 × 1080 or 1440 × 900
- **Instructions**:
  1. Navigate to the **Self-Test** tab.
  2. Click **Run All Tests**.
  3. Capture the green confirmation banner `All Tests Passed — Successfully executed 177 automated assertions with 100% pass rate` and the breakdown of all 8 test suites.

---

### Figure 8: Advanced Multi-Error Miscorrection Example
- **Filename**: `fig_08_multi_error_miscorrection.png`
- **URL Route**: `dist/index.html#simulator`
- **Resolution**: 1920 × 1080 or 1440 × 900
- **Instructions**:
  1. In the **Simulator**, check the **Multiple-error mode** toggle.
  2. On codeword `0110011`, click both bit 2 and bit 6 (received word becomes `0010001`).
  3. Click **Evaluate Syndrome** ($100_2 \implies 4_{10}$).
  4. Click **Correct Position 4**.
  5. Capture the red danger callout:
     `Miscorrected: Standard Hamming(7,4) decoding assumes at most one error. With 2 or more errors, the syndrome points to a different valid codeword. Note that verification passing (syndrome 000) does NOT mean the word is correct; a real receiver cannot detect this miscorrection.`
