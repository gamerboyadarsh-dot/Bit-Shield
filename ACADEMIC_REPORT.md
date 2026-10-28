# BitShield: Interactive Hamming (7,4) Error Detection & Correction Simulator
## Comprehensive Academic Technical Report, Mathematical Foundations & Project Presentation Guide
**Course:** BAMAT205 – Discrete Mathematics and Linear Algebra  
**Module:** Module 3: Coding Theory – Error Correction and Detection in Communication  
**Application Title:** BitShield – Autonomous Forward Error Correction Laboratory  
**Live Deployment:** [https://gamerboyadarsh-dot.github.io/Bit-Shield/](https://gamerboyadarsh-dot.github.io/Bit-Shield/)  
**Repository:** [https://github.com/gamerboyadarsh-dot/Bit-Shield](https://github.com/gamerboyadarsh-dot/Bit-Shield)

---

## 1. Executive Summary & Problem Formulation

### 1.1 The Physical & Engineering Challenge
In modern telecommunications, aerospace links, distributed cloud clusters, and computer memory (DRAM/SRAM), physical noise is unavoidable:
- **Cosmic rays and alpha particles** trigger single-event upsets (SEUs) in silicon memory cells.
- **Thermal noise, electromagnetic interference (EMI), and crosstalk** corrupt high-frequency voltage thresholds on transmission buses.
- **Magnetic media defects** cause bit inversion during disk read/write cycles.

Without redundancy, a single flipped bit ($0 \to 1$ or $1 \to 0$) corrupts financial transactions, machine code instructions, or encrypted payloads. Traditional retransmission protocols (Automatic Repeat reQuest / ARQ) require feedback channels and incur latency that is unacceptable for deep-space telemetry, high-speed RAM buses, or real-time streaming.

### 1.2 The Mathematical Objective: Forward Error Correction (FEC)
The objective of **Forward Error Correction** is to transmit redundant check bits along with the payload, structured so that:
1. The receiver detects whether corruption occurred.
2. The receiver identifies the **exact coordinate** of the flipped bit.
3. The receiver autonomously inverts the corrupted bit back to its intended state **without retransmission**.

**BitShield** demonstrates Richard Hamming’s 1950 block code, the **Hamming (7,4) code**, designed with linear algebra over the Galois Field $\mathbb{F}_2$ (or $\text{GF}(2)$).

---

## 2. Mathematical Foundations: Algebra over $\text{GF}(2)$

### 2.1 The Galois Field $\text{GF}(2)$
The entire mathematical apparatus operates over the finite field $\text{GF}(2) = (\mathbb{Z}_2, \oplus, \cdot)$:
- The element set is $S = \{0, 1\}$.
- **Addition ($\oplus$)** is equivalent to the **exclusive-OR (XOR)** operation, representing addition modulo 2:
  $$0 \oplus 0 = 0, \quad 0 \oplus 1 = 1, \quad 1 \oplus 0 = 1, \quad 1 \oplus 1 = 0$$
- **Multiplication ($\cdot$)** is equivalent to the logical **AND** operation:
  $$0 \cdot 0 = 0, \quad 0 \cdot 1 = 0, \quad 1 \cdot 0 = 0, \quad 1 \cdot 1 = 1$$
- **Key Algebraic Identities in $\text{GF}(2)$:**
  - **Self-Inverse Property:** For all $x \in \text{GF}(2)$, $x \oplus x = 0$.
  - **Additive Identity:** $x \oplus 0 = x$.
  - **Sign Cancellation:** In $\text{GF}(2)$, $-x = x$. Subtraction is identical to addition ($a - b \equiv a \oplus b$).

### 2.2 Vector Space $\mathbb{F}_2^n$
Codewords and channel words are vectors in the 7-dimensional vector space $\mathbb{F}_2^7$ over the scalar field $\mathbb{F}_2$:
- Vectors: $v = (v_1, v_2, \dots, v_7) \in \{0, 1\}^7$.
- Total elements in space: $|\mathbb{F}_2^7| = 2^7 = 128$ distinct words.
- **Hamming Weight** $\text{wt}(v)$: The number of non-zero coordinates in vector $v$:
  $$\text{wt}(v) = \sum_{i=1}^7 v_i$$
- **Hamming Distance** $d(u, v)$: The number of coordinates where vectors $u$ and $v$ differ:
  $$d(u, v) = \text{wt}(u \oplus v)$$

### 2.3 The Principle of Even Parity
An **even parity check** across an index subset $J \subseteq \{1, 2, \dots, 7\}$ constrains the modulo-2 sum of bits in $J$ to zero:
$$\bigoplus_{j \in J} v_j = 0$$
If an odd number of bits in $J$ invert, the sum evaluates to $1$, flagging a parity violation.

---

## 3. The Hamming (7,4) Code Construction & Exact Conventions

### 3.1 Systematic Position Allocation
The codeword vector $c = (c_1, c_2, c_3, c_4, c_5, c_6, c_7)$ uses 1-based indexing ($1..7$).

Richard Hamming’s key insight was **binary coordinate addressing**:
- Coordinates that are powers of two ($2^0=1, 2^1=2, 2^2=4$) are reserved for **parity bits** ($p_1, p_2, p_4$).
- All remaining coordinates ($3, 5, 6, 7$) hold the **original message data bits** ($d_3, d_5, d_6, d_7$).

$$\begin{array}{|c|c|c|c|c|c|c|c|}
\hline
\textbf{Coordinate } i & 1 & 2 & 3 & 4 & 5 & 6 & 7 \\
\hline
\textbf{Symbol} & p_1 & p_2 & d_3 & p_4 & d_5 & d_6 & d_7 \\
\hline
\textbf{Binary Representation} & 001_2 & 010_2 & 011_2 & 100_2 & 101_2 & 110_2 & 111_2 \\
\hline
\textbf{Bit Role} & \text{Parity } 2^0 & \text{Parity } 2^1 & \text{Data } m_1 & \text{Parity } 2^2 & \text{Data } m_2 & \text{Data } m_3 & \text{Data } m_4 \\
\hline
\end{array}$$

### 3.2 Message Mapping
The 4-bit incoming message $m = (m_1, m_2, m_3, m_4)$ is mapped directly into data positions:
$$d_3 = m_1, \quad d_5 = m_2, \quad d_6 = m_3, \quad d_7 = m_4$$

### 3.3 Parity Encoding Equations
Each parity bit $p_k$ monitors all positions whose binary index has a $1$ at the $2^{\log_2 k}$ bit position:
- **$p_1$ (bit 0 of binary index is 1):** Covers indices $\{1, 3, 5, 7\}$.  
  Even parity condition: $p_1 \oplus d_3 \oplus d_5 \oplus d_7 = 0 \implies \mathbf{p_1 = d_3 \oplus d_5 \oplus d_7}$
- **$p_2$ (bit 1 of binary index is 1):** Covers indices $\{2, 3, 6, 7\}$.  
  Even parity condition: $p_2 \oplus d_3 \oplus d_6 \oplus d_7 = 0 \implies \mathbf{p_2 = d_3 \oplus d_6 \oplus d_7}$
- **$p_4$ (bit 2 of binary index is 1):** Covers indices $\{4, 5, 6, 7\}$.  
  Even parity condition: $p_4 \oplus d_5 \oplus d_6 \oplus d_7 = 0 \implies \mathbf{p_4 = d_5 \oplus d_6 \oplus d_7}$

### 3.4 Exhaustive Reference Codebook
Since there are $2^4 = 16$ distinct messages, the code $C$ consists of exactly 16 valid 7-bit codewords:

$$\begin{array}{|c|c||c|c|}
\hline
\textbf{Message } (m_1m_2m_3m_4) & \textbf{Codeword } (p_1p_2d_3p_4d_5d_6d_7) & \textbf{Message } (m_1m_2m_3m_4) & \textbf{Codeword } (p_1p_2d_3p_4d_5d_6d_7) \\
\hline
0000 & 0000000 & 1000 & 1110000 \\
0001 & 1101001 & 1001 & 0011001 \\
0010 & 0101010 & 1010 & 1011010 \\
0011 & 1000011 & 1011 & 0110011 \\
0100 & 1001100 & 1100 & 0111100 \\
0101 & 0100101 & 1101 & 1010101 \\
0110 & 1100110 & 1110 & 0010110 \\
0111 & 0001111 & 1111 & 1111111 \\
\hline
\end{array}$$

---

## 4. Syndrome Decoding & Error Localization Theory

### 4.1 Channel Transmission Model
Let $c \in C$ be the transmitted codeword. During channel transmission, noise introduces an error vector $e = (e_1, e_2, \dots, e_7) \in \mathbb{F}_2^7$:
$$r = c \oplus e$$
where $r = (r_1, r_2, \dots, r_7)$ is the word received by the decoder.
- If no error occurs: $e = (0, 0, 0, 0, 0, 0, 0) \implies r = c$.
- If a single error occurs at index $k \in \{1..7\}$: $e = e^{(k)}$ (a unit vector with $1$ only at coordinate $k$).

### 4.2 Syndrome Equations
The receiver applies the three parity checks to the received word $r$:
$$S_1 = r_1 \oplus r_3 \oplus r_5 \oplus r_7$$
$$S_2 = r_2 \oplus r_3 \oplus r_6 \oplus r_7$$
$$S_4 = r_4 \oplus r_5 \oplus r_6 \oplus r_7$$

### 4.3 Why the Syndrome Directly Identifies Error Position
Because $r_i = c_i \oplus e_i$, and the original codeword $c$ satisfies the parity equations:
$$S_1 = (c_1 \oplus e_1) \oplus (c_3 \oplus e_3) \oplus (c_5 \oplus e_5) \oplus (c_7 \oplus e_7) = \underbrace{(c_1 \oplus c_3 \oplus c_5 \oplus c_7)}_{= 0} \oplus (e_1 \oplus e_3 \oplus e_5 \oplus e_7) = e_1 \oplus e_3 \oplus e_5 \oplus e_7$$
Similarly:
$$S_2 = e_2 \oplus e_3 \oplus e_6 \oplus e_7$$
$$S_4 = e_4 \oplus e_5 \oplus e_6 \oplus e_7$$

**The syndrome depends strictly on the channel noise $e$, completely independent of the message transmitted.**

Reading the syndrome in reverse weight order **$(S_4, S_2, S_1)$**:
$$\text{Decimal Position } k = 4 \cdot S_4 + 2 \cdot S_2 + 1 \cdot S_1$$
- If $s = 000_2 \implies k = 0$: No error detected.
- If $s \neq 000_2 \implies k \in \{1..7\}$: Bit $r_k$ is inverted.

### 4.4 Autonomous In-Place Correction
To correct the word, the receiver inverts the bit at index $k$:
$$C = \begin{cases} r, & \text{if } k = 0 \\ r \oplus e^{(k)}, & \text{if } k \in \{1..7\} \end{cases}$$

### 4.5 The Canonical Worked Example
- **Input Message:** $m = 1011 \implies d_3 = 1, d_5 = 0, d_6 = 1, d_7 = 1$.
- **Parity Calculations:**
  $$p_1 = 1 \oplus 0 \oplus 1 = 0$$
  $$p_2 = 1 \oplus 1 \oplus 1 = 1$$
  $$p_4 = 0 \oplus 1 \oplus 1 = 0$$
  $$\implies c = (p_1, p_2, d_3, p_4, d_5, d_6, d_7) = \mathbf{0110011}$$
- **Simulated Error at Position 6:** Bit $d_6$ flips from $1 \to 0$:
  $$r = 0110001$$
- **Syndrome Evaluation:**
  $$S_1 = 0 \oplus 1 \oplus 0 \oplus 1 = 0$$
  $$S_2 = 1 \oplus 1 \oplus 0 \oplus 1 = 1$$
  $$S_4 = 0 \oplus 0 \oplus 0 \oplus 1 = 1$$
  $$\implies (S_4, S_2, S_1) = (1, 1, 0)_2 = 4(1) + 2(1) + 1(0) = \mathbf{6}$$
- **Restoration:**
  Bit at position 6 is flipped: $0 \to 1$.
  Restored word: $0110011$ (matches transmitted codeword).

---

## 5. Linear Algebra Deep Dive

### 5.1 Generator Matrix $G$
Linear block encoding can be expressed as vector-matrix multiplication over $\text{GF}(2)$. Given row message vector $m = [m_1, m_2, m_3, m_4]$, the codeword is generated by:
$$c = m \cdot G \pmod 2$$
where $G$ is a $4 \times 7$ matrix:
$$G = \begin{pmatrix}
1 & 1 & 1 & 0 & 0 & 0 & 0 \\
1 & 0 & 0 & 1 & 1 & 0 & 0 \\
0 & 1 & 0 & 1 & 0 & 1 & 0 \\
1 & 1 & 0 & 1 & 0 & 0 & 1
\end{pmatrix}$$
*Notice that columns 3, 5, 6, and 7 of $G$ form the $4 \times 4$ identity matrix $I_4$, ensuring systematic encoding.*

### 5.2 Parity-Check Matrix $H$
The parity-check matrix $H$ is a $3 \times 7$ matrix defined such that each column $j$ corresponds to the binary representation of coordinate $j$:
$$H = \begin{pmatrix}
1 & 0 & 1 & 0 & 1 & 0 & 1 \\
0 & 1 & 1 & 0 & 0 & 1 & 1 \\
0 & 0 & 0 & 1 & 1 & 1 & 1
\end{pmatrix}$$
$$\begin{array}{rccccccc}
\text{Column Index } j: & \mathbf{1} & \mathbf{2} & \mathbf{3} & \mathbf{4} & \mathbf{5} & \mathbf{6} & \mathbf{7} \\
\text{Binary Value: } & \begin{pmatrix}1\\0\\0\end{pmatrix} & \begin{pmatrix}0\\1\\0\end{pmatrix} & \begin{pmatrix}1\\1\\0\end{pmatrix} & \begin{pmatrix}0\\0\\1\end{pmatrix} & \begin{pmatrix}1\\0\\1\end{pmatrix} & \begin{pmatrix}0\\1\\1\end{pmatrix} & \begin{pmatrix}1\\1\\1\end{pmatrix}
\end{array}$$

### 5.3 Orthogonality & Kernel Condition
For every valid codeword $c \in C$:
$$H \cdot c^T = \mathbf{0} \pmod 2$$
Proof: $G \cdot H^T = \mathbf{0}_{4 \times 3} \pmod 2$.
Therefore:
$$s = H \cdot r^T = H \cdot (c \oplus e)^T = H \cdot c^T \oplus H \cdot e^T = \mathbf{0} \oplus H \cdot e^T = H \cdot e^T$$
If $e$ has a single 1 at index $k$, $H \cdot e^T$ extracts the **$k$-th column of $H$**, which is the binary representation of $k$.

### 5.4 Rank-Nullity Theorem over $\text{GF}(2)$
Let $T: \mathbb{F}_2^7 \to \mathbb{F}_2^3$ be the linear mapping defined by $T(v) = H \cdot v^T$.
1. **Rank of $H$:** The rows of $H$ are linearly independent over $\text{GF}(2)$. Hence, $\text{rank}(H) = 3$.
2. **Dimension of Codeword Space:** The codeword space $C$ is the null space (kernel) of $H$:
   $$\text{nullity}(H) = \dim(\ker(H)) = n - \text{rank}(H) = 7 - 3 = 4$$
3. **Cardinality:** The number of valid codewords is $2^{\text{nullity}} = 2^4 = 16$.

---

## 6. Abstract Algebra: Subgroups, Lagrange's Theorem & Cosets

```
               Universe: Vector Space (Z₂⁷, ⊕)  [128 vectors]
   ┌────────────────────────────────────────────────────────────────────────┐
   │  Coset 0 (s=000): Codeword Subgroup C                      [16 words]  │
   │  Coset 1 (s=001): Leader = 1000000 (Error at Pos 1)        [16 words]  │
   │  Coset 2 (s=010): Leader = 0100000 (Error at Pos 2)        [16 words]  │
   │  Coset 3 (s=011): Leader = 0010000 (Error at Pos 3)        [16 words]  │
   │  Coset 4 (s=100): Leader = 0001000 (Error at Pos 4)        [16 words]  │
   │  Coset 5 (s=101): Leader = 0000100 (Error at Pos 5)        [16 words]  │
   │  Coset 6 (s=110): Leader = 0000010 (Error at Pos 6)        [16 words]  │
   │  Coset 7 (s=111): Leader = 0000001 (Error at Pos 7)        [16 words]  │
   └────────────────────────────────────────────────────────────────────────┘
                 Total: 8 Cosets × 16 Codewords = 128 Vectors
```

### 6.1 Subgroup Structure of Codewords
The 16 valid codewords form a subgroup of $(\mathbb{F}_2^7, \oplus)$:
1. **Identity:** $0000000 \in C$.
2. **Closure:** For any $c_a, c_b \in C$, $H \cdot (c_a \oplus c_b)^T = H \cdot c_a^T \oplus H \cdot c_b^T = 0 \oplus 0 = 0 \implies (c_a \oplus c_b) \in C$.
3. **Inverses:** Every element in $\mathbb{F}_2^7$ is its own inverse ($c \oplus c = 0$).

### 6.2 Lagrange's Theorem & The 8 Cosets
By **Lagrange’s Theorem**, for any finite group $G$ and subgroup $H$, $|G| = [G : H] \cdot |H|$.
$$\text{Number of Cosets} = \frac{|\mathbb{F}_2^7|}{|C|} = \frac{2^7}{2^4} = \frac{128}{16} = \mathbf{8 \text{ Cosets}}$$
These 8 cosets partition the 128 possible 7-bit words into 8 mutually disjoint sets of 16 vectors each.

### 6.3 Coset Leaders & Syndrome Decoding Table
Every vector in a given coset produces the **exact same syndrome**. The element of minimum Hamming weight in each coset is the **coset leader** (the most likely error pattern):

$$\begin{array}{|c|c|c|c|c|}
\hline
\textbf{Syndrome } (S_4S_2S_1) & \textbf{Decimal} & \textbf{Coset Leader } e & \textbf{Weight} & \textbf{Interpretation} \\
\hline
000 & 0 & 0000000 & 0 & \text{Codeword Subgroup } C \text{ (Zero Error)} \\
001 & 1 & 1000000 & 1 & \text{Single Error at Position 1 } (p_1) \\
010 & 2 & 0100000 & 1 & \text{Single Error at Position 2 } (p_2) \\
011 & 3 & 0010000 & 1 & \text{Single Error at Position 3 } (d_3) \\
100 & 4 & 0001000 & 1 & \text{Single Error at Position 4 } (p_4) \\
101 & 5 & 0000100 & 1 & \text{Single Error at Position 5 } (d_5) \\
110 & 6 & 0000010 & 1 & \text{Single Error at Position 6 } (d_6) \\
111 & 7 & 0000001 & 1 & \text{Single Error at Position 7 } (d_7) \\
\hline
\end{array}$$

Because all 7 single-bit error unit vectors plus the zero vector account for all 8 coset leaders, **standard syndrome decoding is equivalent to coset decoding**.

---

## 7. Code Limitations, Failure Modes & The SECDED (8,4) Extension

### 7.1 Minimum Hamming Distance Bounds
For any linear code, the minimum distance $d_{\min}$ equals the minimum weight of any non-zero codeword:
$$d_{\min} = \min_{c \in C, c \neq 0} \text{wt}(c) = 3$$
- **Error Detection Capability:** $t_{\text{detect}} = d_{\min} - 1 = 3 - 1 = \mathbf{2 \text{ errors}}$ (if no correction is attempted).
- **Error Correction Capability:**
  $$t_{\text{correct}} = \left\lfloor \frac{d_{\min} - 1}{2} \right\rfloor = \left\lfloor \frac{3 - 1}{2} \right\rfloor = \mathbf{1 \text{ error}}$$

### 7.2 Double-Error Miscorrection Vulnerability
When **2 bits flip**, the corrupted word $r$ is at Hamming distance 2 from the transmitted codeword $c_1$, but only distance 1 from a *different* valid codeword $c_2$:
- The syndrome evaluates to a non-zero value pointing to a *third*, uncorrupted bit.
- The decoder inverts that third bit, arriving at $c_2 \neq c_1$.
- The recomputed syndrome on $c_2$ is $000$ (indicating validity).
- **Critical Takeaway:** The receiver has no access to the original message and cannot tell that a miscorrection occurred.

> **Empirical Double-Error Proof:**
> 1. Start with $c = 0110011$ (Message $1011$).
> 2. Flip positions 2 and 6: $r = 0010001$.
> 3. Syndrome: $S_1 = 0, S_2 = 0, S_4 = 1 \implies s = 100_2 = 4_{10}$ (points to position 4).
> 4. Inverting position 4 produces $0011001$.
> 5. $0011001$ is the valid codeword for message **$1001$**, not $1011$.

### 7.3 Triple-Error Undetected Failure Mode
When **3 specific bits flip** that match the difference vector between two codewords, $r$ transforms directly into another valid codeword:
$$s = H \cdot r^T = \mathbf{000}$$
The decoder assumes transmission was pristine and reports **no error**, leaving the corruption undetected.

### 7.4 The SECDED (8,4) Solution (Single Error Correction, Double Error Detection)
To resolve double-error miscorrection, modern enterprise ECC RAM uses **SECDED**. BitShield includes an interactive SECDED mode that adds an 8th overall parity bit:
$$p_8 = \bigoplus_{i=1}^7 c_i$$
At the receiver, the overall parity across all 8 bits is computed: $P = \bigoplus_{i=1}^8 r_i$.

$$\begin{array}{|c|c|l|}
\hline
\textbf{Syndrome } s & \textbf{Overall Parity } P & \textbf{Diagnostic Outcome} \\
\hline
s = 000 & P = 0 & \textbf{No Error:} Transmission is intact. \\
s \neq 000 & P = 1 & \textbf{Single Error:} Bit $s$ is corrupted and safely corrected. \\
s \neq 000 & P = 0 & \textbf{Double Error Detected:} Uncorrectable; system requests re-read without miscorrecting. \\
s = 000 & P = 1 & \textbf{Parity Bit Error:} Overall parity bit $p_8$ itself is flipped. \\
\hline
\end{array}$$

---

## 8. Complete Application Architecture & Feature Inventory

BitShield is divided into 7 interactive modules:

```
                            ┌──────────────────────────────────┐
                            │    BitShield Single-Page App     │
                            │   (Hash Routing, Memory Theme)   │
                            └────────────────┬─────────────────┘
                                             │
      ┌──────────────┬──────────────┬────────┼──────────────┬──────────────┬──────────────┐
      │              │              │        │              │              │              │
┌─────▼──────┐ ┌─────▼──────┐ ┌─────▼──────┐ │        ┌─────▼──────┐ ┌─────▼──────┐ ┌─────▼──────┐
│  1. Home   │ │2.Simulator │ │3.ChannelLab│ │        │ 4. Theory  │ │  5. Demo   │ │6.Self-Test │
│  Dashboard │ │ Laboratory │ │ Transmission│ │        │ Mathematical│ │7-Step Walk │ │173 Automated│
│5-Stage Flow│ │Dual Visual │ │  & BSC Sim │ │        │ Foundations │ │  Through   │ │ Assertions │
└────────────┘ └────────────┘ └────────────┘ │        └────────────┘ └────────────┘ └────────────┘
                                       ┌─────▼──────┐
                                       │  7. Quiz   │
                                       │ Exam Prep  │
                                       │ Randomized │
                                       └────────────┘
```

### Module 1: Home Dashboard (`#home`)
- **Editorial Hero Section:** Clear project title, BAMAT205 course badge, and problem statement.
- **Live Sandbox Preview:** Interactive `<Codeword>` component pre-loaded with $1011 \to 0110011$. Visitors can flip bits and watch the syndrome diagnose the error in real time.
- **5-Node SVG Communication Flowchart:** Visualizes $\text{Message} \to \text{Encoding} \to \text{Channel} \to \text{Syndrome} \to \text{Correction}$.
- **Core Cards:** Structural overviews of The Problem, The Mathematics, and The Solution.

### Module 2: The Core Simulator (`#simulator`)
- **Dual Visualizations:**
  - *7-Cell Linear Grid:* Displays position numbers ($1..7$), symbol tags ($p_1..d_7$), and distinct shape cues (square for data, rounded diamond for parity, `AlertCircle` for error, `Check` for corrected).
  - *Interactive 3-Circle Geometric Venn Diagram:* SVG Venn diagram showing 7 overlapping regions with live-updating check failure outlines.
- **Input Methods:** Synchronized 4-bit binary text box and 4 physical toggle buttons.
- **Scenario Presets Library:** One-click loading of Textbook ($1011$), Double-Error Trap ($0110011 \to \text{pos } 2, 6$), Undetected Triple-Flip, All-Zeros, and All-Ones.
- **Multi-Error Mode & SECDED (8,4) Mode:** Toggles allowing users to test code boundaries and view overall parity behavior.
- **Strict Verification & Classification Banner:**
  - Evaluates $C == O$ and $Syn(C) == 000$.
  - Flags "Single error corrected", "Miscorrected", "Undetected error", or "No error".
- **Academic Lab Sheet Export:** Dedicated print stylesheet (`@media print`) triggered by the **Print Lab Report** button.

### Module 3: Communication Channel Laboratory (`#lab`)
- **ASCII Text Transmission Mode:**
  - Converts user-entered text strings into 8-bit ASCII characters.
  - Splits each character into two 4-bit nibbles.
  - Generates 7-bit Hamming codewords for each nibble.
  - Injects channel noise and displays the corrupted string vs. the restored decoded text.
- **Monte Carlo BSC Simulator:**
  - Configurable bit-flip error probability slider ($p \in [0.5\%, 10\%]$).
  - Batch sizes: $100$, $500$, or $1,000$ codewords ($700$ to $7,000$ bits).
  - Computes channel Bit Error Rate (BER) vs. post-decoding BER, recovery percentage, and double-error miscorrections.

### Module 4: Mathematical Foundations & Theory (`#theory`)
- Sticky left-hand table of contents with 10 sections.
- **Live Matrix Multiplier Component:** Interactive dot-product calculator demonstrating $s = H \cdot r^T \pmod 2$. Clicking any row highlights matrix row $i$ and vector $r$ to display term-by-term modulo-2 arithmetic.
- **Coset Decomposition Explorer:** Interactive selector displaying each of the 8 syndromes, its minimum-weight coset leader, and all 16 codeword vectors in that coset.
- Proofs of rank-nullity, generator orthogonality, and Lagrange partitioning.

### Module 5: Guided Demonstration Mode (`#demo`)
- 7 progressive stages stepping through the canonical $1011$ example.
- Controls: Previous, Next, Auto-play (1.5s interval), and Restart.
- Updates the live `<Codeword>` and `<ParityGroups>` components with real calculated values.

### Module 6: In-Browser Self-Test Panel (`#selftest`)
- Executes 177 automated test assertions in the active browser session.
- Displays summary banner, suite-by-suite pass/fail ratios, and expandable case-level details.

### Module 7: Exam Practice Quiz (`#quiz`)
- Randomized practice challenges testing parity generation, syndrome decoding, and multi-error theory.
- Immediate scoring and arithmetic explanations.

---

## 9. Technical Architecture & Design Decisions

### 9.1 Technology Stack Rationale
| Component | Technology | Technical Rationale |
|---|---|---|
| **Language** | Vanilla JavaScript (ESNext) | Maximum portability without compilation overhead; direct array manipulation. |
| **Framework** | React 19 | Component reusability, declarative state synchronization, and accessible DOM rendering. |
| **Build Tool** | Vite 6 | Sub-second Hot Module Replacement (HMR) and optimized esbuild bundling. |
| **Packaging** | `vite-plugin-singlefile` | Inlines all scripts, CSS, SVGs, and fonts into **one standalone HTML file** (`dist/index.html`, ~892 kB) that runs offline via double-click without a web server. |
| **Styling** | Plain CSS Variables (Tokens) | Zero runtime overhead, clean CSS variable switching for Light/Dark themes, no heavy CSS frameworks. |
| **Typography** | `@fontsource-variable/inter` & `@fontsource/jetbrains-mono` | Offline fonts packaged into the bundle; ensures uniform rendering on exam machines and projectors. |
| **Icons** | `lucide-react` (stroke 1.75) | Professional scientific aesthetic; zero emojis used. |
| **Animations** | `framer-motion` | 150–250ms transitions respecting `prefers-reduced-motion`. |
| **Testing** | Vitest 3 | Native Vite integration, fast test execution (173 tests in 16ms). |

### 9.2 Separation of Mathematics from Presentation
The mathematical engine is encapsulated in `src/lib/hamming.js`. It contains **no React hooks, no DOM manipulation, and zero UI side effects**:
```javascript
export function encode(msgBits) { ... }
export function syndrome(r) { ... }
export function correct(cw) { ... }
export function flipBit(cw, pos) { ... }
export function classify(O, R, syn, C) { ... }
```
This ensures mathematical correctness can be independently verified through CLI scripts, unit test runners, or browser consoles.

---

## 10. Verification, Testing & Quality Assurance

### 10.1 Vitest Automated Test Suite Output
Execution of `npm test` against `src/lib/hamming.test.js`:
```text
> bitshield-hamming74@1.0.0 test
> vitest run

 RUN  v3.2.7 C:/Users/agraw/.gemini/antigravity/scratch/BitShield

 ✓ src/lib/hamming.test.js (173 tests) 16ms

 Test Files  1 passed (1)
      Tests  173 passed (173)
   Start at  01:40:40
   Duration  11.45s (transform 33ms, setup 0ms, collect 41ms, tests 16ms)
```

### 10.2 Test Suite Coverage Matrix
1. **Reference Table Verification (16 tests):** Confirms all 16 messages match the course codebook.
2. **Valid Codeword Zero-Syndrome (16 tests):** Proves $H \cdot c^T = \mathbf{0}$ for every codeword.
3. **Exhaustive Single-Error Correction (112 tests):** Tests all 16 codewords across all 7 error coordinates ($16 \times 7 = 112$). Confirms $100\%$ recovery.
4. **No-Error Identity Verification (16 tests):** Confirms `correct(c) == c` when $e = 0$.
5. **Canonical Worked Example (5 tests):** Validates $1011 \to 0110011 \to \text{pos } 6 \to s=110 \to 0110011$.
6. **Double-Error Miscorrection Verification (4 tests):** Confirms that flipping positions 2 and 6 yields syndrome $100_2 \implies \text{pos } 4$, correcting to $0011001 \neq 0110011$.
7. **Input Validation & Sanitization (7 tests):** Confirms rejection of invalid lengths, empty strings, non-binary symbols, and internal whitespace.
8. **SECDED Extended Parity (2 tests):** Validates correct identification of single errors vs. uncorrectable double errors.
9. **ASCII Text Encoding & Recovery (1 test):** Confirms lossless byte $\to$ nibble $\to$ codeword $\to$ text reconstruction.
10. **Lagrange Coset Partition (1 test):** Confirms existence of exactly 8 cosets containing 16 unique vectors each.

---

## 11. Project Presentation & Viva Oral Defense Guide

When presenting BitShield to your professors or evaluators, structure your defense around these five core themes:

### Theme 1: The Core Innovation (What makes Hamming (7,4) special?)
> **Explanation:** Traditional parity bits can only detect an odd number of errors; they cannot locate which bit broke. Richard Hamming solved this by arranging check bits at power-of-two coordinates ($1, 2, 4$). The check equations are structured such that the 3-bit syndrome is the binary coordinate of the error. This enables forward error correction without retransmission.

### Theme 2: Linear Algebra Connection
> **Explanation:** Codewords are the null space (kernel) of the parity-check matrix $H$. Because $H$ has rank 3 in $\text{GF}(2)^7$, the rank-nullity theorem proves the code space has dimension $7 - 3 = 4$, yielding $2^4 = 16$ valid codewords. The syndrome calculation $s = H \cdot r^T$ evaluates to $H \cdot e^T$, proving the syndrome depends solely on the noise vector and is independent of the data sent.

### Theme 3: Abstract Algebra & Discrete Math Connection
> **Explanation:** The 16 codewords form a subgroup $C$ under addition modulo 2. By Lagrange’s Theorem, the 128 elements of $\mathbb{Z}_2^7$ partition into $128 / 16 = 8$ cosets. Each coset has a unique syndrome, and the minimum-weight vector in each coset is the coset leader (the error pattern). Thus, syndrome decoding is an exact physical implementation of coset decoding.

### Theme 4: Addressing Code Limitations
> **Explanation:** Hamming (7,4) has minimum distance $d_{\min} = 3$, meaning it can only correct single errors. If 2 bits flip, the word lands closer to a different codeword, causing the decoder to miscorrect. BitShield demonstrates this vulnerability empirically, and shows how the SECDED (8,4) extension adds an 8th parity bit to detect double errors without miscorrecting.

### Common Viva Defense Questions & Prepared Answers

**Q1: Why are parity bits placed at positions 1, 2, and 4 instead of at the end?**
> **Answer:** Placing parity bits at indices that are powers of 2 ($2^0, 2^1, 2^2$) ensures each parity bit has exactly one bit set in its binary representation ($001_2, 010_2, 100_2$). This makes the columns of $H$ at those positions standard unit vectors ($e_1, e_2, e_3$), simplifying the check equations and allowing the syndrome to directly read as a binary integer.

**Q2: What happens if 3 bits flip?**
> **Answer:** If 3 bits flip, two outcomes are possible:
> 1. The 3-bit error vector equals the difference between two codewords. The received word becomes another valid codeword, yielding syndrome $000$ (an undetected error).
> 2. The corrupted word lands in a coset of weight 1, causing a miscorrection.

**Q3: Why can't Hamming (7,4) correct double errors?**
> **Answer:** By coding theory bounds, to correct $t$ errors, the minimum distance must satisfy $d_{\min} \ge 2t + 1$. For $t = 2$, we would require $d_{\min} \ge 5$. Hamming (7,4) only has $d_{\min} = 3$, so $t = \lfloor (3-1)/2 \rfloor = 1$. Hamming spheres of radius 1 around codewords are disjoint, but spheres of radius 2 overlap.

**Q4: How does SECDED distinguish between 1 and 2 errors?**
> **Answer:** By checking overall parity $P = \bigoplus_{i=1}^8 r_i$. A single error inverts overall parity ($P = 1$), whereas a double error inverts two bits, preserving even parity ($P = 0$). Thus, if syndrome $s \neq 0$ and $P = 0$, the receiver knows two errors occurred and flags an uncorrectable double error rather than miscorrecting.

---
*Report compiled for BAMAT205 Discrete Mathematics and Linear Algebra — Group Project Evaluation.*
