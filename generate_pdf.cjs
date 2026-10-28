const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>BitShield – Hamming (7,4) Comprehensive Academic & Technical Report</title>
  <style>
    @page {
      size: A4;
      margin: 18mm 16mm 18mm 16mm;
      @bottom-right {
        content: counter(page);
      }
    }
    
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    body {
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
      font-size: 13px;
      line-height: 1.55;
      color: #1e293b;
      background: #ffffff;
      margin: 0;
      padding: 0;
    }

    /* Cover / Header Section */
    .header-banner {
      border-bottom: 2px solid #4f46e5;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }

    .badge-bar {
      display: flex;
      gap: 8px;
      margin-bottom: 10px;
    }

    .badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .badge-primary { background: #e0e7ff; color: #4338ca; }
    .badge-secondary { background: #f1f5f9; color: #475569; }
    .badge-teal { background: #ccfbf1; color: #0f766e; }

    h1 {
      font-size: 24px;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 6px 0;
      letter-spacing: -0.5px;
    }

    .subtitle {
      font-size: 13px;
      color: #64748b;
      margin: 0 0 12px 0;
      font-weight: 500;
    }

    .meta-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 10px 14px;
      font-size: 11px;
    }

    .meta-item strong {
      display: block;
      color: #334155;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .meta-item span {
      color: #0f172a;
      font-weight: 600;
    }

    /* Headings */
    h2 {
      font-size: 15px;
      font-weight: 700;
      color: #1e1b4b;
      border-bottom: 1.5px solid #e2e8f0;
      padding-bottom: 5px;
      margin: 24px 0 10px 0;
      display: flex;
      align-items: center;
      gap: 8px;
      page-break-after: avoid;
    }

    h2 .sec-num {
      background: #4f46e5;
      color: white;
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 3px;
    }

    h3 {
      font-size: 13px;
      font-weight: 700;
      color: #334155;
      margin: 14px 0 6px 0;
      page-break-after: avoid;
    }

    p {
      margin: 0 0 8px 0;
      text-align: justify;
    }

    /* Math Formula Blocks */
    .math-block {
      background: #f8fafc;
      border-left: 3px solid #4f46e5;
      border-radius: 0 6px 6px 0;
      padding: 8px 14px;
      margin: 10px 0;
      font-family: 'Consolas', 'Courier New', monospace;
      font-size: 12px;
      color: #0f172a;
      page-break-inside: avoid;
    }

    .math-block .eq-title {
      font-family: 'Segoe UI', sans-serif;
      font-size: 10px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }

    /* Matrix Table */
    .matrix-container {
      display: flex;
      gap: 16px;
      margin: 10px 0;
      page-break-inside: avoid;
    }

    .matrix-card {
      flex: 1;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 10px;
    }

    .matrix-title {
      font-weight: 700;
      font-size: 11px;
      color: #475569;
      margin-bottom: 6px;
      text-transform: uppercase;
    }

    table.matrix-view {
      border-collapse: collapse;
      margin: 0 auto;
      font-family: 'Consolas', monospace;
      font-size: 12px;
    }

    table.matrix-view td {
      width: 24px;
      height: 22px;
      text-align: center;
      border: 1px solid #e2e8f0;
      font-weight: 600;
    }

    table.matrix-view th {
      font-size: 10px;
      color: #64748b;
      padding: 2px 4px;
      font-weight: 600;
    }

    /* Data Tables */
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
      margin: 10px 0;
      page-break-inside: avoid;
    }

    table.data-table th, table.data-table td {
      border: 1px solid #cbd5e1;
      padding: 5px 8px;
      text-align: left;
    }

    table.data-table th {
      background: #f1f5f9;
      font-weight: 700;
      color: #334155;
    }

    table.data-table tr:nth-child(even) td {
      background: #f8fafc;
    }

    .mono {
      font-family: 'Consolas', 'Courier New', monospace;
      font-weight: 600;
    }

    /* Callout Box */
    .callout {
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 9px 12px;
      margin: 10px 0;
      font-size: 11.5px;
      page-break-inside: avoid;
    }

    .callout-info {
      background: #eff6ff;
      border-color: #bfdbfe;
      color: #1e40af;
    }

    .callout-theorem {
      background: #faf5ff;
      border-color: #e9d5ff;
      color: #581c87;
    }

    .callout-warning {
      background: #fef2f2;
      border-color: #fecaca;
      color: #991b1b;
    }

    .callout-title {
      font-weight: 700;
      margin-bottom: 3px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    /* Q&A Items */
    .qa-box {
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 10px 12px;
      margin-bottom: 10px;
      background: #ffffff;
      page-break-inside: avoid;
    }

    .qa-q {
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 4px;
      font-size: 12px;
    }

    .qa-a {
      color: #334155;
      font-size: 11.5px;
      line-height: 1.5;
    }

    .page-break {
      page-break-before: always;
    }
  </style>
</head>
<body>

  <!-- Cover Header -->
  <div class="header-banner">
    <div class="badge-bar">
      <span class="badge badge-primary">Course: BAMAT205</span>
      <span class="badge badge-teal">Module 3: Coding Theory</span>
      <span class="badge badge-secondary">Linear Algebra & Discrete Mathematics</span>
    </div>
    <h1>BitShield: Hamming (7,4) Error Detection & Correction</h1>
    <div class="subtitle">Complete Mathematical Specification, Algorithmic Implementation, & Viva Voce Dossier</div>
    
    <div class="meta-grid">
      <div class="meta-item">
        <strong>Academic Project</strong>
        <span>BitShield System</span>
      </div>
      <div class="meta-item">
        <strong>Repository</strong>
        <span>gamerboyadarsh-dot/Bit-Shield</span>
      </div>
      <div class="meta-item">
        <strong>Live App</strong>
        <span>gamerboyadarsh-dot.github.io</span>
      </div>
      <div class="meta-item">
        <strong>Verification</strong>
        <span>173 / 173 Vitest Suite Passed</span>
      </div>
    </div>
  </div>

  <!-- SECTION 1 -->
  <h2><span class="sec-num">01</span> Problem Statement & Engineering Purpose</h2>
  <p>
    In digital communications and physical storage devices (dynamic RAM, flash memory, deep-space telemetry), binary data is continuously subject to physical disturbances such as cosmic ray ionization, electrical thermal noise, and electromagnetic interference. These physical anomalies invert bits from <strong>0 → 1</strong> or <strong>1 → 0</strong>.
  </p>
  <p>
    Without redundancy, a receiver has no way of verifying data integrity. The objective of <strong>Forward Error Correction (FEC)</strong> is to encode a $k$-bit message by appending $r = n - k$ parity check bits. This forms an $n$-bit codeword that allows the receiver to detect and rectify errors autonomously without requiring a retransmission.
  </p>
  <div class="callout callout-info">
    <div class="callout-title">The Coding Theory Objective: Hamming (7,4)</div>
    Encode $k = 4$ information bits into an $n = 7$ bit codeword using $r = 3$ parity bits. The code guarantees 100% detection and correction of any single-bit error ($t = 1$), and detects all double-bit errors under SECDED (8,4) extension.
  </div>

  <!-- SECTION 2 -->
  <h2><span class="sec-num">02</span> Vector Space Foundations over Galois Field GF(2)</h2>
  <p>
    All operations are strictly executed over the finite field $\\text{GF}(2) = (\\{0, 1\\}, \\oplus, \\cdot)$, where addition is arithmetic modulo 2 (bitwise <strong>XOR</strong>) and multiplication is arithmetic modulo 2 (bitwise <strong>AND</strong>).
  </p>
  <div class="math-block">
    <div class="eq-title">Galois Field Arithmetic Axioms</div>
    0 ⊕ 0 = 0 &nbsp;|&nbsp; 0 ⊕ 1 = 1 &nbsp;|&nbsp; 1 ⊕ 0 = 1 &nbsp;|&nbsp; 1 ⊕ 1 = 0 &nbsp;(Self-inverse: -x = x)<br>
    0 · 0 = 0 &nbsp;|&nbsp; 0 · 1 = 0 &nbsp;|&nbsp; 1 · 0 = 0 &nbsp;|&nbsp; 1 · 1 = 1
  </div>
  <p>
    The vector space of all possible 7-bit binary words is $V = \\text{GF}(2)^7$, containing $|V| = 2^7 = 128$ vectors. The Hamming (7,4) code $C$ constitutes a <strong>4-dimensional linear subspace</strong> of $\\text{GF}(2)^7$, containing exactly $|C| = 2^4 = 16$ valid codewords.
  </p>

  <!-- SECTION 3 -->
  <h2><span class="sec-num">03</span> Mathematical Conventions & Bit Allocation</h2>
  <p>
    Bit positions are indexed 1 through 7 from left to right. Codeword vector:
    <br><center><span class="mono">c = (c₁, c₂, c₃, c₄, c₅, c₆, c₇) = (p₁, p₂, d₃, p₄, d₅, d₆, d₇)</span></center>
  </p>
  <ul>
    <li><strong>Parity bits (p₁, p₂, p₄):</strong> Placed at indices that are powers of 2 (positions 1, 2, and 4), corresponding to single-bit binary masks <span class="mono">001₂</span>, <span class="mono">010₂</span>, and <span class="mono">100₂</span>.</li>
    <li><strong>Data bits (d₃, d₅, d₆, d₇):</strong> The 4-bit message <span class="mono">m = (m₁, m₂, m₃, m₄)</span> maps directly to indices 3, 5, 6, and 7.</li>
  </ul>
  <div class="math-block">
    <div class="eq-title">Even Parity Encoding Formulas</div>
    p₁ = d₃ ⊕ d₅ ⊕ d₇ = m₁ ⊕ m₂ ⊕ m₄ &nbsp;&nbsp;(Covers positions with bit 0 set: 1, 3, 5, 7)<br>
    p₂ = d₃ ⊕ d₆ ⊕ d₇ = m₁ ⊕ m₃ ⊕ m₄ &nbsp;&nbsp;(Covers positions with bit 1 set: 2, 3, 6, 7)<br>
    p₄ = d₅ ⊕ d₆ ⊕ d₇ = m₂ ⊕ m₃ ⊕ m₄ &nbsp;&nbsp;(Covers positions with bit 2 set: 4, 5, 6, 7)
  </div>

  <!-- SECTION 4 -->
  <h2><span class="sec-num">04</span> Matrix Formulation: Generator & Parity-Check Matrices</h2>
  <p>
    Linear block codes are completely described by two fundamental matrices over $\\text{GF}(2)$: the Generator Matrix $G$ and Parity-Check Matrix $H$.
  </p>
  
  <div class="matrix-container">
    <div class="matrix-card">
      <div class="matrix-title">Generator Matrix G (4 × 7) : c = m · G</div>
      <table class="matrix-view">
        <tr><th></th><th>p₁</th><th>p₂</th><th>d₃</th><th>p₄</th><th>d₅</th><th>d₆</th><th>d₇</th></tr>
        <tr><th>m₁</th><td>1</td><td>1</td><td>1</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>
        <tr><th>m₂</th><td>1</td><td>0</td><td>0</td><td>1</td><td>1</td><td>0</td><td>0</td></tr>
        <tr><th>m₃</th><td>0</td><td>1</td><td>0</td><td>1</td><td>0</td><td>1</td><td>0</td></tr>
        <tr><th>m₄</th><td>1</td><td>1</td><td>0</td><td>1</td><td>0</td><td>0</td><td>1</td></tr>
      </table>
    </div>

    <div class="matrix-card">
      <div class="matrix-title">Parity-Check Matrix H (3 × 7) : H · cᵀ = 0</div>
      <table class="matrix-view">
        <tr><th></th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th></tr>
        <tr><th>S₄</th><td>0</td><td>0</td><td>0</td><td>1</td><td>1</td><td>1</td><td>1</td></tr>
        <tr><th>S₂</th><td>0</td><td>1</td><td>1</td><td>0</td><td>0</td><td>1</td><td>1</td></tr>
        <tr><th>S₁</th><td>1</td><td>0</td><td>1</td><td>0</td><td>1</td><td>0</td><td>1</td></tr>
      </table>
    </div>
  </div>

  <div class="callout callout-theorem">
    <div class="callout-title">The Fundamental Linear Algebra Beauty of H</div>
    Column $j$ of matrix $H$ (for $j = 1, 2, \\dots, 7$) is the exact 3-bit binary representation of decimal index $j$, read vertically as $[S_4, S_2, S_1]^T$. Furthermore, $G \\cdot H^T = \\mathbf{0}_{4 \\times 3} \\pmod 2$, proving the code space $C$ is the null space of $H$.
  </div>

  <!-- Page break for readability -->
  <div class="page-break"></div>

  <!-- SECTION 5 -->
  <h2><span class="sec-num">05</span> Channel Transmission, Syndrome Decoding & Correction</h2>
  <p>
    Let $c \\in C$ be the transmitted codeword. Physical noise acts additively: $r = c \\oplus e$, where $e \\in \\text{GF}(2)^7$ is the error vector.
  </p>
  <div class="math-block">
    <div class="eq-title">Syndrome Evaluation Proof</div>
    s = H · rᵀ = H · (c ⊕ e)ᵀ = (H · cᵀ) ⊕ (H · eᵀ) = 0 ⊕ H · eᵀ = H · eᵀ
  </div>
  <p>
    Notice that the syndrome $s$ depends <strong>exclusively on the channel noise $e$</strong> and is completely invariant to the message content $c$.
  </p>
  <div class="math-block">
    <div class="eq-title">Receiver Syndrome Scalar Equations</div>
    S₁ = r₁ ⊕ r₃ ⊕ r₅ ⊕ r₇ &nbsp;&nbsp;(Parity Check on Group 1)<br>
    S₂ = r₂ ⊕ r₃ ⊕ r₆ ⊕ r₇ &nbsp;&nbsp;(Parity Check on Group 2)<br>
    S₄ = r₄ ⊕ r₅ ⊕ r₆ ⊕ r₇ &nbsp;&nbsp;(Parity Check on Group 4)<br><br>
    Decimal Error Position = 4 · S₄ + 2 · S₂ + 1 · S₁
  </div>
  <p>
    <strong>Correction Rule:</strong> If the decimal syndrome equals 0, no single error is detected. Otherwise, the syndrome reveals the exact index $j$. The corrected vector is:
    <br><center><span class="mono">ĉ = r ⊕ eⱼ &nbsp;&nbsp;(Invert bit at index j)</span></center>
  </p>

  <!-- SECTION 6 -->
  <h2><span class="sec-num">06</span> Rigorous Theoretical Proofs</h2>

  <h3>Theorem 1: Minimum Hamming Distance d_min = 3</h3>
  <p>
    <strong>Proof:</strong> The minimum distance of a linear block code equals the minimum weight of its non-zero codewords, which equals the minimum number of linearly dependent columns in $H$.
    <br>1. All columns of $H$ are non-zero $\\implies d_{\\min} > 1$.
    <br>2. All columns of $H$ are pairwise distinct. Over $\\text{GF}(2)$, two vectors are linearly dependent if and only if they are identical. Since no two columns are equal, every pair of columns is linearly independent $\\implies d_{\\min} > 2$.
    <br>3. Columns 1, 2, and 3 satisfy: $\\text{Col}_1 \\oplus \\text{Col}_2 = [0, 0, 1]^T \\oplus [0, 1, 0]^T = [0, 1, 1]^T = \\text{Col}_3$. This demonstrates a set of 3 linearly dependent columns. Hence, $d_{\\min} = 3$. $\\blacksquare$
  </p>

  <h3>Theorem 2: Hamming (7,4) is a "Perfect Code"</h3>
  <p>
    <strong>Proof:</strong> The Sphere-Packing Bound for a code correcting $t = 1$ errors is:
  </p>
  <div class="math-block">
    2^k · [ C(n, 0) + C(n, 1) ] ≤ 2^n<br>
    2⁴ · [ 1 + 7 ] = 16 · 8 = 128 = 2⁷
  </div>
  <p>
    The inequality holds with <strong>exact equality</strong>. The 16 Hamming spheres of radius $t = 1$ centered around the 16 valid codewords completely and partition the entire 128-vector space with zero overlapping or empty elements. $\\blacksquare$
  </p>

  <h3>Theorem 3: Coset Decomposition (Lagrange's Theorem)</h3>
  <p>
    The additive group $(\\text{GF}(2)^7, \\oplus)$ of order 128 is partitioned by the linear code subgroup $C$ of order 16 into exactly $2^{7-4} = 8$ mutually disjoint cosets of size 16:
    <br><center><span class="mono">V = C ∪ (C ⊕ e₁) ∪ (C ⊕ e₂) ∪ ... ∪ (C ⊕ e₇)</span></center>
    Each coset maps bijectively to one of the 8 unique 3-bit syndrome vectors. The coset leaders correspond to the minimum-weight error vectors $\\mathbf{0}$ and $e_1, \\dots, e_7$.
  </p>

  <!-- SECTION 7 -->
  <h2><span class="sec-num">07</span> Multi-Bit Error Regimes & SECDED (8,4) Extension</h2>
  <table class="data-table">
    <thead>
      <tr>
        <th>Error Regime</th>
        <th>Physical Condition</th>
        <th>Standard (7,4) Response</th>
        <th>SECDED (8,4) Response</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>0 Bit Errors</strong></td>
        <td>$e = \\mathbf{0}$</td>
        <td>Syndrome = 000: Correctly says "No error"</td>
        <td>$s = 000, P_{\\text{overall}} = 0$: Valid data</td>
      </tr>
      <tr>
        <td><strong>1 Bit Error</strong></td>
        <td>$e = e_j, \\text{wt}(e) = 1$</td>
        <td>Syndrome = $\\text{bin}(j)$: <strong>Corrected</strong></td>
        <td>$s \\neq 000, P_{\\text{overall}} = 1$: <strong>Corrected</strong></td>
      </tr>
      <tr>
        <td><strong>2 Bit Errors</strong></td>
        <td>$\\text{wt}(e) = 2$</td>
        <td>Syndrome points to 3rd clean bit: <strong>Miscorrection!</strong></td>
        <td>$s \\neq 000, P_{\\text{overall}} = 0$: <strong>Double Error Alert</strong></td>
      </tr>
      <tr>
        <td><strong>3 Bit Errors</strong></td>
        <td>$\\text{wt}(e) = 3$ (valid $c'$)</td>
        <td>Syndrome = 000: <strong>Undetected Error</strong></td>
        <td>$s = 000, P_{\\text{overall}} = 1$: Parity fault detected</td>
      </tr>
    </tbody>
  </table>

  <!-- Page break for codebook and Viva -->
  <div class="page-break"></div>

  <!-- SECTION 8 -->
  <h2><span class="sec-num">08</span> The Complete 16-Codeword Codebook</h2>
  <table class="data-table">
    <thead>
      <tr>
        <th>Dec</th>
        <th>Message (m₁ m₂ m₃ m₄)</th>
        <th>Parity (p₁ p₂ p₄)</th>
        <th>Codeword (p₁ p₂ d₃ p₄ d₅ d₆ d₇)</th>
        <th>Hamming Weight</th>
      </tr>
    </thead>
    <tbody>
      <tr><td>0</td><td class="mono">0000</td><td class="mono">000</td><td class="mono">0000000</td><td>0</td></tr>
      <tr><td>1</td><td class="mono">0001</td><td class="mono">111</td><td class="mono">1101001</td><td>4</td></tr>
      <tr><td>2</td><td class="mono">0010</td><td class="mono">011</td><td class="mono">0101010</td><td>3</td></tr>
      <tr><td>3</td><td class="mono">0011</td><td class="mono">100</td><td class="mono">1000011</td><td>3</td></tr>
      <tr><td>4</td><td class="mono">0100</td><td class="mono">101</td><td class="mono">1001100</td><td>3</td></tr>
      <tr><td>5</td><td class="mono">0101</td><td class="mono">010</td><td class="mono">0100101</td><td>3</td></tr>
      <tr><td>6</td><td class="mono">0110</td><td class="mono">110</td><td class="mono">1100110</td><td>4</td></tr>
      <tr><td>7</td><td class="mono">0111</td><td class="mono">001</td><td class="mono">0001111</td><td>4</td></tr>
      <tr><td>8</td><td class="mono">1000</td><td class="mono">110</td><td class="mono">1110000</td><td>3</td></tr>
      <tr><td>9</td><td class="mono">1001</td><td class="mono">001</td><td class="mono">0011001</td><td>3</td></tr>
      <tr><td>10</td><td class="mono">1010</td><td class="mono">101</td><td class="mono">1011010</td><td>4</td></tr>
      <tr><td>11</td><td class="mono">1011</td><td class="mono">010</td><td class="mono">0110011</td><td>4</td></tr>
      <tr><td>12</td><td class="mono">1100</td><td class="mono">011</td><td class="mono">0111100</td><td>4</td></tr>
      <tr><td>13</td><td class="mono">1101</td><td class="mono">100</td><td class="mono">1010101</td><td>4</td></tr>
      <tr><td>14</td><td class="mono">1110</td><td class="mono">000</td><td class="mono">0010110</td><td>3</td></tr>
      <tr><td>15</td><td class="mono">1111</td><td class="mono">111</td><td class="mono">1111111</td><td>7</td></tr>
    </tbody>
  </table>

  <!-- SECTION 9 -->
  <h2><span class="sec-num">09</span> Software Architecture & Technical Implementation</h2>
  <ul>
    <li><strong>Mathematical Core (<span class="mono">src/lib/hamming.js</span>):</strong> Completely pure functional module with 0 DOM and 0 React dependencies. Exports <span class="mono">encode</span>, <span class="mono">syndrome</span>, <span class="mono">correct</span>, <span class="mono">flipBit</span>, <span class="mono">classify</span>, <span class="mono">evaluateSecded</span>, <span class="mono">generateCosets</span>, <span class="mono">simulateBscNoise</span>.</li>
    <li><strong>Unit Testing Suite (<span class="mono">src/lib/hamming.test.js</span>):</strong> 173 test assertions across 10 suites executed in 16ms with Vitest, guaranteeing 100% mathematical correctness against reference tables.</li>
    <li><strong>Accessibility & Dual-Encoding:</strong> Parity bits use teal and diamond badges; data bits use blue and square badges; corrupted bits use red and alert symbols; corrected bits use amber and checkmarks. No color-blindness reliance.</li>
    <li><strong>Single-File Bundling:</strong> Built using <span class="mono">vite-plugin-singlefile</span> producing a ~892 kB offline executable (<span class="mono">dist/index.html</span>) that runs without internet access.</li>
  </ul>

  <!-- SECTION 10 -->
  <h2><span class="sec-num">10</span> Viva Voce Examination Cheat Sheet</h2>

  <div class="qa-box">
    <div class="qa-q">Q1: Why are the parity bits assigned to positions 1, 2, and 4 instead of positions 1, 2, and 3?</div>
    <div class="qa-a">
      <strong>Answer:</strong> Positions 1, 2, and 4 correspond to $2^0, 2^1, 2^2$ (binary <span class="mono">001</span>, <span class="mono">010</span>, <span class="mono">100</span>). Each contains exactly one binary set bit. Consequently, the binary expansion of every index $1..7$ corresponds to a unique subset of parity bits, allowing the syndrome $(S_4, S_2, S_1)$ to directly form the binary address of the corrupted bit.
    </div>
  </div>

  <div class="qa-box">
    <div class="qa-q">Q2: What is the physical meaning of $H \cdot c^T = \mathbf{0}$?</div>
    <div class="qa-a">
      <strong>Answer:</strong> It establishes that the code space $C$ is the null space (kernel) of linear transformation $H: \text{GF}(2)^7 \to \text{GF}(2)^3$. A vector $c$ is a valid codeword if and only if it satisfies all three simultaneous parity equations.
    </div>
  </div>

  <div class="qa-box">
    <div class="qa-q">Q3: Why does standard Hamming (7,4) fail on double-bit errors?</div>
    <div class="qa-a">
      <strong>Answer:</strong> Because $d_{\min} = 3$. A double-bit error produces a syndrome that equals the sum of two columns of $H$. Because $H$ contains all non-zero 3-bit vectors, that sum equals a third column of $H$. The decoder misinterprets this as a single error at that third location, flipping an uncorrupted bit and resulting in a 3-bit error (miscorrection).
    </div>
  </div>

  <div class="qa-box">
    <div class="qa-q">Q4: How does SECDED resolve double-bit errors?</div>
    <div class="qa-a">
      <strong>Answer:</strong> SECDED adds an 8th parity bit $p_8 = \bigoplus_{i=1}^7 c_i$, elevating $d_{\min}$ to 4. When two bits flip, the 3-bit syndrome is non-zero, but the overall parity check succeeds ($P_{\text{overall}} = 0$). This combination uniquely signals an uncorrectable double error and triggers a retransmission alert.
    </div>
  </div>

</body>
</html>
`;

const htmlPath = path.join(__dirname, 'report_printable.html');
const pdfPath = path.join(__dirname, 'BitShield_Academic_Report.pdf');

fs.writeFileSync(htmlPath, htmlContent, 'utf8');
console.log('HTML written to:', htmlPath);

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

try {
  console.log('Invoking Chrome Headless to generate PDF...');
  const cmd = `"${chromePath}" --headless --disable-gpu --run-all-compositor-stages-before-draw --print-to-pdf="${pdfPath}" "${htmlPath}"`;
  execSync(cmd);
  console.log('SUCCESS! PDF generated at:', pdfPath);
  const stats = fs.statSync(pdfPath);
  console.log('PDF File Size:', stats.size, 'bytes');
} catch (err) {
  console.error('Error rendering PDF:', err.message);
  process.exit(1);
}
