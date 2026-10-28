// Self-test for BitShield pure functions

function encode(msgBits) {
  const d3=msgBits[0],d5=msgBits[1],d6=msgBits[2],d7=msgBits[3];
  const p1=d3^d5^d7, p2=d3^d6^d7, p4=d5^d6^d7;
  return [p1,p2,d3,p4,d5,d6,d7];
}
function computeSyndrome(r) {
  const S1=r[0]^r[2]^r[4]^r[6];
  const S2=r[1]^r[2]^r[5]^r[6];
  const S4=r[3]^r[4]^r[5]^r[6];
  return [S1,S2,S4];
}
function syndromeToPosition(syn) { return 4*syn[2]+2*syn[1]+1*syn[0]; }
function flipBit(cw,pos) { const a=cw.slice(); a[pos-1]^=1; return a; }
function correct(cw) {
  const s=computeSyndrome(cw);
  const p=syndromeToPosition(s);
  if(p===0) return cw.slice();
  return flipBit(cw,p);
}
function arrEq(a,b) { return a.length===b.length && a.every((v,i)=>v===b[i]); }
function cwStr(cw) { return cw.join(''); }
function parseBits(s) { return s.split('').map(Number); }

function validateInput(raw) {
  const t = raw.trim();
  if (t.length === 0) return { ok:false, error:'Enter exactly 4 bits; the input is empty.' };
  if (t.length !== 4) return { ok:false, error:`Enter exactly 4 bits; you entered ${t.length}.` };
  for (let i=0; i<4; i++) {
    if (t[i] !== '0' && t[i] !== '1')
      return { ok:false, error:`Only 0 and 1 are allowed; found '${t[i]}' at position ${i+1}.` };
  }
  return { ok:true, bits:parseBits(t) };
}

const REF = {
  '0000':'0000000','0001':'1101001','0010':'0101010','0011':'1000011',
  '0100':'1001100','0101':'0100101','0110':'1100110','0111':'0001111',
  '1000':'1110000','1001':'0011001','1010':'1011010','1011':'0110011',
  '1100':'0111100','1101':'1010101','1110':'0010110','1111':'1111111'
};

let pass=0, fail=0;
function check(desc, ok, detail) {
  if (ok) { pass++; }
  else { fail++; console.log('FAIL: '+desc+(detail?' | '+detail:'')); }
}

// 1) Reference table encoding (16 tests)
console.log('--- Suite 1: Reference table encoding ---');
Object.entries(REF).forEach(([m,cw]) => {
  const got = cwStr(encode(parseBits(m)));
  check(`encode(${m})=${cw}`, got===cw, got!==cw?`got ${got}`:null);
});

// 2) All 16 codewords have syndrome 000
console.log('--- Suite 2: Syndrome 000 for valid codewords ---');
Object.entries(REF).forEach(([m,cw]) => {
  const s=computeSyndrome(parseBits(cw));
  const p=syndromeToPosition(s);
  check(`syndrome(${cw})=000`, p===0, p!==0?`pos ${p}`:null);
});

// 3) 112 single-bit errors
console.log('--- Suite 3: 112 single-bit error cases ---');
Object.entries(REF).forEach(([m,cwStr2]) => {
  const cw=parseBits(cwStr2);
  for (let p=1; p<=7; p++) {
    const corr=flipBit(cw,p);
    const s=computeSyndrome(corr);
    const det=syndromeToPosition(s);
    const fixed=correct(corr);
    const ok=det===p && arrEq(fixed,cw);
    check(`msg=${m} flip pos ${p}: det=${det}`, ok, !ok?`det=${det} fixed=${cwStr(fixed)}`:null);
  }
});

// 4) No-error identity (16 tests)
console.log('--- Suite 4: No-error identity ---');
Object.entries(REF).forEach(([m,cwStr2]) => {
  const cw=parseBits(cwStr2);
  const out=correct(cw);
  check(`correct(${cwStr2})=identity`, arrEq(out,cw), !arrEq(out,cw)?cwStr(out):null);
});

// 5) Verified example: 1011
console.log('--- Suite 5: Verified example 1011 ---');
const ex=encode([1,0,1,1]);
check('encode(1011)=0110011', cwStr(ex)==='0110011', cwStr(ex));
const recv=flipBit(ex,6);
check('flip6(0110011)=0110001', cwStr(recv)==='0110001', cwStr(recv));
const syn=computeSyndrome(recv);
check(`S1=${syn[0]} S2=${syn[1]} S4=${syn[2]}`, syn[0]===0&&syn[1]===1&&syn[2]===1, JSON.stringify(syn));
check('pos=6', syndromeToPosition(syn)===6, 'pos='+syndromeToPosition(syn));
const fixed=correct(recv);
check('correct(0110001)=0110011', cwStr(fixed)==='0110011', cwStr(fixed));

// 6) Double-error miscorrection
console.log('--- Suite 6: Double-error miscorrection ---');
const cw2=parseBits('0110011');
let recv2=flipBit(cw2,2); recv2=flipBit(recv2,6);
check('flip pos2&6 of 0110011 = 0010001', cwStr(recv2)==='0010001', cwStr(recv2));
const syn2=computeSyndrome(recv2);
const pos2=syndromeToPosition(syn2);
check(`syndrome S4=${syn2[2]} S2=${syn2[1]} S1=${syn2[0]} pos=4`, pos2===4, `pos=${pos2}`);
const corr2=correct(recv2);
check('miscorrected word=0011001', cwStr(corr2)==='0011001', cwStr(corr2));
check('corrected != original', !arrEq(corr2,cw2), null);
const cSyn2=computeSyndrome(corr2);
check('syndrome(miscorrected)=000 (looks valid)', syndromeToPosition(cSyn2)===0, null);

// 7) Invalid input rejection
console.log('--- Suite 7: Input validation ---');
const invalids = [
  { inp:'',      exp:/empty/ },
  { inp:'   ',   exp:/empty/ },
  { inp:'101',   exp:/exactly 4.*you entered 3/ },
  { inp:'10111', exp:/exactly 4.*you entered 5/ },
  { inp:'10a1',  exp:/Only 0 and 1.*'a'/ },
  { inp:'2011',  exp:/Only 0 and 1.*'2'/ },
  // "1 01" trims to "1 01" (4 chars, space at pos 2 is not 0 or 1) → invalid character error
  { inp:'1 01',  exp:/Only 0 and 1.*' '/ },
];
invalids.forEach(({inp,exp}) => {
  const v=validateInput(inp);
  const ok=!v.ok && exp.test(v.error);
  check(`reject "${inp}"`, ok, !v.ok&&!exp.test(v.error)?`msg="${v.error}"`:v.ok?'was accepted!':null);
});

// Summary
console.log('');
console.log('=== FINAL RESULTS ===');
console.log(`PASS: ${pass}`);
console.log(`FAIL: ${fail}`);
console.log(`Total: ${pass+fail}`);
console.log(fail===0 ? 'ALL TESTS PASSED ✓' : 'SOME TESTS FAILED ✗');
