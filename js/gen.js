/* Maths Clash question makers: the Practice Book's question types with fresh numbers every match.
   Every maker returns { q, opts:[right, wrong, wrong, wrong], steps?, ref? }. Wrong answers are real mistakes. */
'use strict';
(function () {
  const { R, n } = BC;
  const G = BC.Gen = {};

  /* pick 3 distinct wrong answers (strings) that differ from the right one */
  G.mc = function (right, wrongs, fallback) {
    const r = String(right), seen = new Set([r]), out = [];
    // default: nudge the last number in the right answer (keeps units and brackets)
    fallback = fallback || (() => r.replace(/(\d[\d,]*)(?!.*\d)/, (m) => {
      const v = +m.replace(/,/g, '') + R.pick([-3, -2, -1, 1, 2, 3, 10]);
      return v >= 0 ? n(v) : m + '0';
    }));
    for (const w of wrongs) { const s = String(w); if (!seen.has(s) && s !== 'NaN' && s !== 'undefined') { seen.add(s); out.push(s); } if (out.length === 3) break; }
    let guard = 40;
    while (out.length < 3 && fallback && guard-- > 0) { const s = String(fallback()); if (!seen.has(s)) { seen.add(s); out.push(s); } }
    return [r, ...out];
  };
  const PLACE = { 10: 'ten', 100: 'hundred', 1000: 'thousand', 10000: 'ten thousand', 100000: 'hundred thousand', 1000000: 'million' };
  const placeName = (p) => 'nearest ' + n(p);

  /* ---------- place value ---------- */
  G.round = function (lo, hi, places) {
    const x = R.int(lo, hi), p = R.pick(places);
    const right = Math.round(x / p) * p;
    const other = right > x ? Math.floor(x / p) * p : Math.ceil(x / p) * p;
    const big = places.filter((q) => q !== p);
    const wrongs = [other === right ? right + p : other, ...big.map((q) => Math.round(x / q) * q), right + p, right - p, Math.floor(x / p) * p + p * 10];
    return { q: `Round **${n(x)}** to the ${placeName(p)}.`, opts: G.mc(n(right), wrongs.filter((w) => w >= 0).map(n)), steps: [`Look at the digit to the right of the ${PLACE[p]}s.`, `${n(x)} → **${n(right)}**`] };
  };
  G.digitValue = function (digits) {
    let s;
    do { s = String(R.int(Math.pow(10, digits - 1), Math.pow(10, digits) - 1)); } while (new Set(s).size < digits - 1);
    const pos = R.int(0, digits - 2);       // not the ones digit
    const d = +s[pos];
    if (d === 0) return G.digitValue(digits);
    const k = digits - 1 - pos, v = d * Math.pow(10, k);
    const underlined = s.split('').map((c, i) => (i === pos ? `**${c}**` : c));
    // add thousands commas around the bold digit
    let out = '', cnt = 0;
    for (let i = underlined.length - 1; i >= 0; i--) { out = underlined[i] + out; cnt++; if (cnt % 3 === 0 && i > 0) out = ',' + out; }
    return { q: `What is the value of the bold digit in ${out}?`, opts: G.mc(n(v), [n(v * 10), n(v / 10), String(d), n(v * 100)]), steps: [`The ${d} is in the ${PLACE[Math.pow(10, k)] || 'ones'}s column.`, `It is worth **${n(v)}**.`] };
  };
  G.moreLess = function (lo, hi, steps) {
    const x = R.int(lo, hi), p = R.pick(steps), more = R.chance(0.5);
    const right = more ? x + p : x - p;
    const wrongs = [10, 100, 1000, 10000, 100000, 1000000].filter((q) => q !== p).map((q) => (more ? x + q : x - q)).filter((w) => w > 0);
    return { q: `What is ${n(p)} ${more ? 'more' : 'less'} than **${n(x)}**?`, opts: G.mc(n(right), R.shuffle(wrongs).map(n)) };
  };

  /* ---------- Roman numerals (Year 5, Unit 1) ---------- */
  G.toRoman = function (x) {
    const T = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
    let s = ''; for (const [v, r] of T) while (x >= v) { s += r; x -= v; } return s;
  };
  G.roman = function () {
    let x;
    do { x = R.int(1100, 2030); } while (!/CM|CD|XC|XL|IX|IV/.test(G.toRoman(x)));
    const r = G.toRoman(x);
    const naive = r.split('').reduce((a, c) => a + { M: 1000, D: 500, C: 100, L: 50, X: 10, V: 5, I: 1 }[c], 0);
    return { q: `What number is **${r}**?`, opts: G.mc(n(x), [n(naive), n(x + 100), n(x - 10), n(x + 20), n(x - 100)]), steps: ['A smaller letter before a bigger one is taken away.', `${r} = **${n(x)}**`] };
  };

  /* ---------- mental + and − ---------- */
  G.missingAdd = function () {
    const total = R.pick([90, 100, 120, 150, 200, 300, 1000]);
    const a = R.int(Math.floor(total * 0.2), Math.floor(total * 0.8));
    const right = total - a;
    return { q: `${n(a)} + □ = ${n(total)}`, opts: G.mc(n(right), [n(right + 10), n(right - 10), n(right + 2), n(total + a)]) };
  };
  G.mentalSub = function () {
    const a = R.int(52, 99), b = R.int(17, a - 12);
    const right = a - b;
    return { q: `${a} − ${b} = ?`, opts: G.mc(right, [right + 10, right - 10, right + 2, a + b].filter((v) => v > 0)) };
  };

  /* ---------- multiples, factors, primes, squares, cubes ---------- */
  G.factorOf = function () {
    const N = R.pick([24, 30, 36, 40, 42, 45, 48, 54, 56, 60, 64, 72, 84, 90, 96, 100]);
    const fs = []; for (let i = 3; i < N; i++) if (N % i === 0) fs.push(i);
    const right = R.pick(fs);
    const nots = []; for (let i = 3; i < N; i++) if (N % i !== 0) nots.push(i);
    return { q: `Which number is a **factor** of ${N}?`, opts: G.mc(right, R.shuffle(nots)), steps: [`${N} ÷ ${right} = ${N / right}, no remainder.`] };
  };
  G.multipleOf = function () {
    const k = R.int(6, 12), right = k * R.int(6, 12);
    const near = [right + 1, right - 1, right + 2, right + k - 1, right - k + 1].filter((v) => v % k !== 0);
    return { q: `Which number is a **multiple** of ${k}?`, opts: G.mc(right, R.shuffle(near)), steps: [`${right} = ${k} × ${right / k}`] };
  };
  G.prime = function (lo = 20, hi = 100) {
    const ps = [], traps = [];
    for (let i = lo; i <= hi; i++) { if (BC.isPrime(i)) ps.push(i); else if (i % 2 && i % 5 && i > 9) traps.push(i); }
    const right = R.pick(ps);
    return { q: 'Which number is a **prime number**?', opts: G.mc(right, R.shuffle(traps)), steps: [`${right} has only two factors: 1 and ${right}.`] };
  };
  G.square = function () {
    const k = R.int(4, 12), right = k * k;
    return { q: 'Which number is a **square number**?', opts: G.mc(right, R.shuffle([right + 1, right - 1, k * 2, right + k, k * 10 + k].filter((v) => !Number.isInteger(Math.sqrt(v))))), steps: [`${k} × ${k} = ${right}`] };
  };
  G.cube = function () {
    const k = R.int(2, 6), right = k * k * k;
    return { q: `${k}³ = ?`, opts: G.mc(right, [k * 3, k * k, right + k, 3 * k * k, right * 2]), steps: [`${k}³ = ${k} × ${k} × ${k} = ${right}`] };
  };
  G.times10 = function () {
    const p = R.pick([10, 100, 1000]), up = R.chance(0.55);
    if (up) { const a = R.int(3, 990); const r = a * p; return { q: `${n(a)} × ${n(p)} = ?`, opts: G.mc(n(r), [n(r * 10), n(r / 10), n(a * p / 100 || a + p), n(a + p)]) }; }
    const r = R.int(4, 950), a = r * p;
    return { q: `${n(a)} ÷ ${n(p)} = ?`, opts: G.mc(n(r), [n(r * 10), n(r / 10), n(a / 10 === r ? r * 100 : a / 10), n(a - p)]) };
  };

  /* ---------- perimeter and area (Year 5, Unit 6) ---------- */
  G.perimeter = function () {
    const l = R.int(6, 25), w = R.int(3, l - 1);
    return { q: `A rectangle is ${l} cm by ${w} cm. What is its **perimeter**?`, opts: G.mc(`${2 * (l + w)} cm`, [`${l * w} cm`, `${l + w} cm`, `${2 * l + w} cm`, `${4 * l} cm`]), steps: [`${l} + ${w} + ${l} + ${w} = ${2 * (l + w)} cm`] };
  };
  G.area = function () {
    const l = R.int(4, 15), w = R.int(3, 9);
    return { q: `A rectangle is ${l} m by ${w} m. What is its **area**?`, opts: G.mc(`${l * w} m²`, [`${2 * (l + w)} m²`, `${l + w} m²`, `${l * w + 10} m²`, `${l * (w + 1)} m²`]), steps: [`Area = length × width = ${l} × ${w} = ${l * w} m²`] };
  };
  G.squareSide = function () {
    const s = R.int(6, 40);
    return { q: `A square has a perimeter of ${4 * s} cm. How long is one side?`, opts: G.mc(`${s} cm`, [`${2 * s} cm`, `${4 * s - 4} cm`, `${s + 4} cm`, `${s * s} cm`]), steps: [`4 equal sides: ${4 * s} ÷ 4 = ${s} cm`] };
  };
  G.missingSide = function () {
    const a = R.int(5, 20), b = R.int(4, 25), P = 2 * (a + b);
    return { q: `A rectangle has a perimeter of ${P} cm. One side is ${a} cm. How long is the other side?`, opts: G.mc(`${b} cm`, [`${P - a} cm`, `${P - 2 * a} cm`, `${P / 2} cm`, `${b + a} cm`]), steps: [`${P} − ${a} − ${a} = ${P - 2 * a}`, `${P - 2 * a} ÷ 2 = ${b} cm`] };
  };

  /* ---------- negative numbers (Year 6, Unit 1) ---------- */
  G.negDiff = function () {
    const a = -R.int(2, 15), b = R.int(3, 20);
    return { q: `What is the difference between ${n(a)} and ${b}?`, opts: G.mc(b - a, [b + a, b - a + 1, b - a - 2, Math.abs(a)].filter((v) => v !== 0)), steps: [`${n(a)} → 0 is ${-a}, 0 → ${b} is ${b}.`, `${-a} + ${b} = ${b - a}`] };
  };
  G.temp = function () {
    const a = -R.int(3, 12), up = R.int(5, 18), r = a + up;
    return { q: `It is ${n(a)} °C. It goes **up ${up} °C**. What is it now?`, opts: G.mc(`${n(r)} °C`, [`${n(-r)} °C`, `${n(a - up)} °C`, `${n(up - a)} °C`, `${n(r + 1)} °C`]) };
  };

  /* ---------- order of operations (Year 6, Unit 3) ---------- */
  G.orderOps = function () {
    const a = R.int(2, 9), b = R.int(2, 9), c = R.int(2, 9);
    const forms = [
      [`${a} + ${b} × ${c}`, a + b * c, (a + b) * c],
      [`(${a} + ${b}) × ${c}`, (a + b) * c, a + b * c],
      [`${a * c + b * c} − ${b} × ${c}`, a * c, (a * c) * c],
      [`${b * c} ÷ ${c} + ${a}`, b + a, Math.round(b * c / (c + a) * 10) / 10],
    ];
    const [e, r, w] = R.pick(forms);
    return { q: `${e} = ?`, opts: G.mc(r, [w, r + c, r - 1, r + 10].filter((v) => v > 0 && Number.isInteger(v))), steps: ['Brackets first, then × and ÷, then + and −.', `${e} = **${r}**`] };
  };
  G.lcm = function () {
    const pairs = [[4, 6], [6, 8], [6, 9], [4, 10], [8, 12], [9, 12], [6, 10], [10, 15], [4, 14], [12, 18]];
    const [a, b] = R.pick(pairs), r = BC.lcm(a, b);
    return { q: `What is the **lowest common multiple** of ${a} and ${b}?`, opts: G.mc(r, [a * b, BC.gcd(a, b), a + b, r * 2]), steps: [`Multiples of ${b}: ${b}, ${2 * b}, ${3 * b} … the first one that ${a} also goes into is ${r}.`] };
  };
  G.hcf = function () {
    const pairs = [[12, 18], [16, 24], [18, 27], [20, 30], [24, 36], [15, 25], [28, 42], [30, 45]];
    const [a, b] = R.pick(pairs), r = BC.gcd(a, b);
    return { q: `What is the **highest common factor** of ${a} and ${b}?`, opts: G.mc(r, [BC.lcm(a, b), r / 2, b - a, 2].filter((v) => Number.isInteger(v) && v !== r)), steps: [`${r} goes into both: ${a} ÷ ${r} = ${a / r}, ${b} ÷ ${r} = ${b / r}.`] };
  };
  G.remainder = function () {
    const d = R.int(11, 25), q = R.int(6, 30), r = R.int(1, d - 1), a = d * q + r;
    return { q: `${n(a)} ÷ ${d} = ?`, opts: G.mc(`${q} r ${r}`, [`${q} r ${r + 1}`, `${q + 1} r ${r}`, `${q - 1} r ${r + d}`, `${q} r ${d - r}`]), steps: [`${d} × ${q} = ${d * q}`, `${a} − ${d * q} = ${r} left over`] };
  };

  /* ---------- fractions (Year 6, Units 4 and 5) ---------- */
  const F = (a, b) => BC.fr(a, b);
  G.simplify = function () {
    const pairs = [[2, 3], [3, 4], [2, 5], [3, 5], [4, 5], [5, 6], [3, 8], [5, 8], [7, 8], [4, 9], [7, 10], [5, 12]];
    const [a, b] = R.pick(pairs), k = R.int(3, 8);
    const A = a * k, B = b * k;
    const half = BC.gcd(A, B) > 2 && (A % 2 === 0 && B % 2 === 0) ? F(A / 2, B / 2) : F(a + 1, b);
    return { q: `Simplify ${F(A, B)} fully.`, opts: G.mc(F(a, b), [half, F(b, a), F(a, b + 1), F(A - B > 0 ? A - B : a + 2, B)]), steps: [`Divide top and bottom by ${k}.`, `${F(A, B)} = ${F(a, b)}`] };
  };
  G.fracOf = function () {
    const b = R.pick([3, 4, 5, 6, 8, 10]), a = R.int(1, b - 1);
    if (BC.gcd(a, b) !== 1) return G.fracOf();
    const N = b * R.int(3, 12), r = N / b * a;
    return { q: `What is ${F(a, b)} of ${N}?`, opts: G.mc(r, [N / b, N - r, N * a, r + a].filter((v) => v !== r)), steps: [`${N} ÷ ${b} = ${N / b}`, `${N / b} × ${a} = ${r}`] };
  };
  G.fracWhole = function () {          // ⅔ of a number is 60
    const b = R.pick([3, 4, 5, 6, 8]), a = R.int(2, b - 1);
    if (BC.gcd(a, b) !== 1) return G.fracWhole();
    const whole = b * R.int(3, 12), part = whole / b * a;
    return { q: `${F(a, b)} of a number is ${part}. What is the number?`, opts: G.mc(whole, [part / a, part * b, part + a, whole - b]), steps: [`${part} ÷ ${a} = ${part / a} (that is ${F(1, b)})`, `${part / a} × ${b} = ${whole}`] };
  };
  G.biggestFrac = function () {
    const pool = [[1, 2], [2, 3], [3, 4], [3, 5], [5, 8], [7, 12], [5, 6], [4, 9], [7, 10], [2, 5], [3, 8], [11, 12]];
    const set = R.shuffle(pool).slice(0, 4);
    set.sort((x, y) => y[0] / y[1] - x[0] / x[1]);
    return { q: 'Which fraction is the **biggest**?', opts: set.map(([a, b]) => F(a, b)), steps: ['Make the denominators the same, or compare each with ' + F(1, 2) + '.'] };
  };
  G.fracTimes = function () {
    const b = R.pick([3, 4, 5, 6, 7, 8]), a = R.int(1, b - 1), k = R.int(2, 5);
    if (BC.gcd(a, b) !== 1 || (a * k) % b === 0) return G.fracTimes();
    const right = BC.mixed(a * k, b);
    return { q: `${F(a, b)} × ${k} = ?`, opts: G.mc(right, [F(a * k, b * k), F(a, b * k), BC.mixed(a + k, b), F(a, b + k)]), steps: [`Multiply the numerator: ${a} × ${k} = ${a * k}`, `${F(a * k, b)} = ${right}`] };
  };
  G.fracDiv = function () {
    const b = R.pick([2, 3, 4, 5, 6, 8]), a = R.int(1, b - 1), k = R.int(2, 4);
    if (BC.gcd(a, b) !== 1) return G.fracDiv();
    const right = BC.mixed(a, b * k);
    return { q: `${F(a, b)} ÷ ${k} = ?`, opts: G.mc(right, [BC.mixed(a * k, b), F(a, b + k), F(a, b), F(a, k)].filter((w) => w !== right)), steps: [`Share ${F(a, b)} into ${k} equal parts: the parts are ${k} times smaller.`, `${F(a, b)} ÷ ${k} = ${right}`] };
  };
  G.fracAdd = function () {
    const pairs = [[2, 4], [3, 6], [4, 8], [2, 6], [5, 10], [3, 12], [4, 12], [2, 8]];
    const [b1, b2] = R.pick(pairs), a1 = R.int(1, b1 - 1), a2 = R.int(1, b2 - 1);
    const num = a1 * (b2 / b1) + a2, den = b2;
    const right = BC.mixed(num, den);
    return { q: `${F(a1, b1)} + ${F(a2, b2)} = ?`, opts: G.mc(right, [F(a1 + a2, b1 + b2), F(a1 + a2, b2), BC.mixed(num + 1, den), F(a1 + a2, b1)]), steps: [`${F(a1, b1)} = ${F(a1 * b2 / b1, b2)}`, `${F(a1 * b2 / b1, b2)} + ${F(a2, b2)} = ${right}`] };
  };
  G.translate = function () {
    const x = R.int(-2, 6), y = R.int(-2, 6), dx = R.int(2, 7), dy = R.int(2, 7);
    const L = R.chance(0.5), D = R.chance(0.5);
    const nx = L ? x - dx : x + dx, ny = D ? y - dy : y + dy;
    const p = (a, b) => `(${n(a)}, ${n(b)})`;
    return { q: `Point ${p(x, y)} is translated ${dx} ${L ? 'left' : 'right'} and ${dy} ${D ? 'down' : 'up'}. Where is it now?`, opts: G.mc(p(nx, ny), [p(ny, nx), p(L ? x + dx : x - dx, ny), p(nx, D ? y + dy : y - dy), p(x + (L ? -dy : dy), y + (D ? -dx : dx))]), steps: [`Left/right changes x: ${n(x)} → ${n(nx)}`, `Up/down changes y: ${n(y)} → ${n(ny)}`] };
  };


  /* ---------- Quick Draw: a rule, numbers that fit it and numbers that do not ---------- */
  const pickNot = (make, ok) => { for (let i = 0; i < 200; i++) { const v = make(); if (!ok(v)) return v; } return make(); };
  G.drawRules = {
    multiple: (k) => () => ({ rule: `a multiple of ${k}`, ref: 'multiples',
      yes: () => n(k * R.int(3, 14)), no: () => n(pickNot(() => R.int(15, 120), (v) => v % k === 0)),
      why: (v) => { const x = +v.replace(/,/g, ''); return x % k === 0 ? `${v} = ${k} × ${x / k}` : `${v} is not in the ${k} times table`; } }),
    prime: (lo, hi) => () => {
      const ps = [], traps = [];
      for (let i = lo; i <= hi; i++) { if (BC.isPrime(i)) ps.push(i); else if (i % 2 && i % 5) traps.push(i); }
      return { rule: 'a prime number', ref: 'prime numbers', yes: () => String(R.pick(ps)), no: () => String(R.pick(traps)),
        why: (v) => BC.isPrime(+v) ? `${v} has only two factors: 1 and ${v}` : `${v} is not prime: it has more than two factors` };
    },
    square: () => ({ rule: 'a square number', ref: 'square numbers', yes: () => String(R.int(2, 12) ** 2), no: () => String(pickNot(() => R.int(5, 150), (v) => Number.isInteger(Math.sqrt(v)))),
      why: (v) => Number.isInteger(Math.sqrt(+v)) ? `${v} = ${Math.sqrt(+v)} × ${Math.sqrt(+v)}` : `${v} is not a square number` }),
    cube: () => ({ rule: 'a cube number', ref: 'cube numbers', yes: () => n(R.int(2, 10) ** 3), no: () => n(pickNot(() => R.pick([9, 16, 25, 36, 49, 81, 100, 121, 144, 200, 250, 300, 400, 500, 600, 900, 30, 60, 99, 126, 65]), (v) => Number.isInteger(Math.round(Math.cbrt(v))) && Math.round(Math.cbrt(v)) ** 3 === v)),
      why: (v) => { const x = +v.replace(/,/g, ''), c = Math.round(Math.cbrt(x)); return c ** 3 === x ? `${v} = ${c} × ${c} × ${c}` : `${v} is not a cube number`; } }),
    factorOf: (N) => () => {
      const fs = [], nf = [];
      for (let i = 2; i < N; i++) (N % i === 0 ? fs : nf).push(i);
      return { rule: `a factor of ${N}`, ref: 'factors', yes: () => String(R.pick(fs)), no: () => String(R.pick(nf)),
        why: (v) => N % +v === 0 ? `${N} ÷ ${v} = ${N / +v}` : `${N} ÷ ${v} leaves a remainder, so ${v} is not a factor` };
    },
    roundsTo: (target, p) => () => ({ rule: `a number that rounds to ${n(target)} to the nearest ${n(p)}`, ref: 'rounding',
      yes: () => n(R.int(target - p / 2, target + p / 2 - 1)),
      no: () => n(R.chance(0.5) ? R.int(target - p * 1.5, target - p / 2 - 1) : R.int(target + p / 2, target + p * 1.5)),
      why: (v) => `${v} → ${n(Math.round(+v.replace(/,/g, '') / p) * p)}` }),
    digitIn: (d, place, digits) => () => {
      const make = (ok) => { for (;;) { const x = R.int(10 ** (digits - 1), 10 ** digits - 1); const has = Math.floor(x / place) % 10 === d; if (has === ok) return x; } };
      return { rule: `a number with ${d} in the ${n(place)}s place`, ref: 'place value', yes: () => n(make(true)), no: () => n(make(false)),
        why: (v) => { const x = Math.floor(+v.replace(/,/g, '') / place) % 10; return x === d ? `The ${n(place)}s digit of ${v} is ${d}` : `The ${n(place)}s digit of ${v} is ${x}, not ${d}`; } };
    },
    equalFrac: (a, b) => () => ({ rule: `a fraction equal to ${BC.fr(a, b)}`, ref: 'equivalent fractions',
      yes: () => { const k = R.int(2, 9); return BC.fr(a * k, b * k); },
      no: () => { for (;;) { const d = R.int(3, 24), u = R.int(1, d - 1); if (u * b !== a * d) return BC.fr(u, d); } },
      why: (v) => { const m = /(\d+)\/(\d+)/.exec(v); return +m[1] * b === a * +m[2] ? `${v}: divide top and bottom by ${+m[1] / a} → ${BC.fr(a, b)}` : `${v} does not simplify to ${BC.fr(a, b)}`; } }),
    makes: (target) => () => {
      const ex = () => { const a = R.int(2, 9), b = R.int(2, 9), c = R.int(2, 9); return R.pick([[`${a} + ${b} × ${c}`, a + b * c], [`(${a} + ${b}) × ${c}`, (a + b) * c], [`${a} × ${b} − ${c}`, a * b - c], [`${a * c} ÷ ${c} + ${b}`, a + b]]); };
      const hits = [];
      for (let i = 0; i < 3000; i++) { const e = ex(); if (e[1] === target && !hits.includes(e[0])) hits.push(e[0]); }
      const vals = {};
      return { rule: `a calculation equal to ${target}`, ref: 'order of operations',
        yes: () => R.pick(hits), no: () => { for (;;) { const e = ex(); if (e[1] !== target) { vals[e[0]] = e[1]; return e[0]; } } },
        why: (v) => (hits.includes(v) ? `${v} = ${target}: × and ÷ before + and −` : `${v} = ${vals[v]}, not ${target}`) };
    },
    negAbove: (k) => () => ({ rule: `a number between ${n(-k)} and 0`, ref: 'negative numbers',
      yes: () => n(-R.int(1, k - 1)), no: () => n(R.chance(0.6) ? -R.int(k, k + 9) : R.int(1, 9)),
      why: (v) => { const x = +v.replace('−', '-'); return x > -k && x < 0 ? `${v} is between ${n(-k)} and 0` : `${v} is not between ${n(-k)} and 0`; } }),
  };

  /* ---------- number line targets ---------- */
  /* returns { prompt, min, max, step (tick), labels:[values], target, show(v) } */
  G.line = function (min, max, step, opts = {}) {
    const fine = opts.fine || step / 2;
    let target;
    do { target = min + fine * R.int(1, Math.round((max - min) / fine) - 1); } while (opts.notTick && Math.abs(target / step - Math.round(target / step)) < 1e-9);
    if (opts.round) target = Math.round(target / opts.round) * opts.round;
    return { prompt: opts.prompt ? opts.prompt(target) : `Mark **${n(target)}**`, min, max, step, labels: opts.labels || [min, max], target, fmt: opts.fmt || n, ref: opts.ref };
  };
})();
