/* Maths Clash graded pool: a SECOND pool of questions, kept apart from the Challenge pool (data-y5.js / data-y6.js).
   Same TYPES of question as the Practice Book's units, with numbers that grow with the level: 1 very easy, 2 easy, 3 medium, 4 hard, 5 very hard.
   The ticket board draws on both pools; nothing else uses this one. Every maker returns { q, opts:[right, wrong, wrong, wrong], steps, fig? }.
   Designed and built by Hamza Ashour. */
'use strict';
(function () {
  const { R, n } = BC, G = BC.Gen, Fig = BC.Fig;
  const F = BC.fr, int = R.int, pick = R.pick, chance = R.chance, gcd = BC.gcd, mixed = BC.mixed;
  const at = (l, a) => a[Math.min(a.length, Math.max(1, l)) - 1];                 // the value for level l from a list of five
  const P = (x, y) => `(${n(x)}, ${n(y)})`;
  const fmt = (v) => (typeof v === 'number' ? n(v) : String(v));
  /* the value of an option when it is a number or a fraction / mixed number, so equal answers in different forms (7 1/2 and 7 6/12) are never both offered */
  const FR = /^\[\[(?:(\d+) )?(\d+)\/(\d+)\]\]$/;
  const valOf = (s) => { const m = FR.exec(s); if (m) return (+(m[1] || 0)) + (+m[2]) / (+m[3]); return /^−?[\d,]+(\.\d+)?$/.test(s) ? +s.replace(/,/g, '').replace('−', '-') : null; };
  const keyOf = (v) => Math.round(v * 1e9);
  const reduceF = (s) => { const m = FR.exec(s); if (!m) return s; const w = +(m[1] || 0), a = +m[2], b = +m[3]; return mixed(w * b + a, b); };   // [[4/8]] -> [[1/2]], [[7 6/12]] -> [[7 1/2]]
  const fracNudge = (r, taken) => {
    const m = FR.exec(r); if (!m) return null;
    const w = +(m[1] || 0), a = +m[2], b = +m[3], c = [];
    for (const [na, nb] of [[a + 1, b], [a, b + 1], [a - 1, b], [a, b - 1], [a + 2, b], [a, b + 2], [a + 1, b + 1], [b, a]]) {
      if (na < 1 || nb < 2 || (!w && na >= nb && na % nb === 0)) continue;
      c.push(w ? `[[${w} ${na}/${nb}]]` : F(na, nb));
    }
    const ok = c.map(reduceF).filter((x) => { const v = valOf(x); return v != null && !taken.has(keyOf(v)); });
    return ok.length ? pick(ok) : null;
  };
  const mk = (q, right, wrongs, steps, extra) => {
    const r = fmt(right), keepNeg = /^[−(]|°/.test(r), seen = new Set(), out = [];
    const rv = valOf(r); if (rv != null) seen.add(keyOf(rv));
    for (const w0 of wrongs) {
      const w = fmt(w0); if (w === r || out.includes(w) || (!keepNeg && /^−/.test(w))) continue;
      const v = valOf(w); if (v != null) { if (seen.has(keyOf(v))) continue; seen.add(keyOf(v)); }
      out.push(w); if (out.length === 3) break;
    }
    let guard = 40;
    while (out.length < 3 && guard-- > 0) {
      let w = FR.test(r) ? fracNudge(r, seen) : G.mc(r, [])[1 + int(0, 2)];
      if (!w || w === r || out.includes(w)) continue;
      const v = valOf(w); if (v != null) { if (seen.has(keyOf(v))) continue; seen.add(keyOf(v)); }
      out.push(w);
    }
    return Object.assign({ q, opts: [r, ...out], steps }, extra);
  };
  /* fractions: every wrong answer is written in lowest terms too, so a reduced right answer does not stand out */
  const mkF = (q, right, wrongs, steps, extra) => mk(q, right, wrongs.map((w) => reduceF(fmt(w))), steps, extra);
  const NAMES = ['Mia', 'Omar', 'Lina', 'Sam', 'Noor', 'Zaid', 'Hana', 'Yusuf', 'Dana', 'Adam'];
  const noCarry = (a, b) => { const A = String(a).split('').reverse(), B = String(b).split('').reverse(); let s = ''; for (let i = 0; i < Math.max(A.length, B.length); i++) s = (((+A[i] || 0) + (+B[i] || 0)) % 10) + s; return +s; };
  const absDigits = (a, b) => { const A = String(a).split('').reverse(), B = String(b).split('').reverse(); let s = ''; for (let i = 0; i < Math.max(A.length, B.length); i++) s = Math.abs((+A[i] || 0) - (+B[i] || 0)) + s; return +s; };
  const PLACE = { 10: 'tens', 100: 'hundreds', 1000: 'thousands', 10000: 'ten thousands', 100000: 'hundred thousands', 1000000: 'millions' };
  const roundTo = (x, p) => Math.round(x / p) * p;
  const lo = (d) => Math.pow(10, d - 1), hi = (d) => Math.pow(10, d) - 1;

  /* =====================================================  place value (Y5 units 1-2, Y6 unit 1)  ===================================================== */
  const digitValue = (d) => () => G.digitValue(d);
  const howMany = (maxBase, big) => (l) => {
    const base = pick([10, 100, 1000, 10000].filter((b) => b <= maxBase)), cnt = big ? int(120, 990) : int(12, 95), N = cnt * base;
    return mk(`How many ${PLACE[base]} are in ${n(N)}?`, n(cnt), [n(cnt * 10), n(Math.round(cnt / 10)), n(cnt + 1), n(N / (base * 100) || cnt + 2)], [`${n(N)} ÷ ${n(base)} = **${n(cnt)}**`]);
  };
  const roundQ = (specs) => (l) => { const [a, b, pl] = at(l, specs); return G.round(a, b, pl); };
  const roundEdge = (unitHi, unitLo) => () => {     // which number rounds to H to the nearest unitHi AND to T to the nearest unitLo
    const H = int(2, 8) * unitHi, t = int(1, 3), T = H + t * unitLo, half = unitLo / 2;
    const right = T + int(-(half - 1), half - 1);
    if (roundTo(right, unitHi) !== H) return roundEdge(unitHi, unitLo)();
    const wrongs = [T + half + int(0, half - 1), T - half - int(0, half - 1), H + unitHi / 2 + int(0, unitHi / 2 - 1), T + unitLo * 2 + int(-5, 5)].filter((w) => roundTo(w, unitHi) !== H || roundTo(w, unitLo) !== T);
    return mk(`Nearest ${n(unitHi)}: **${n(H)}**. Nearest ${n(unitLo)}: **${n(T)}**. Which number?`, n(right), wrongs.map(n), [`To the nearest ${n(unitLo)} it must be between ${n(T - half)} and ${n(T + half - 1)}.`, `${n(right)} → ${n(T)} → ${n(H)}`]);
  };
  const moreLess = (specs) => (l) => {
    const [a, b, steps] = at(l, specs);
    let q, m, guard = 0;
    do { q = G.moreLess(a, b, steps); m = /What is ([\d,]+) (more|less) than \*\*([\d,]+)\*\*/.exec(q.q); guard++; } while (guard < 60 && (m[2] === 'less' ? +m[3].replace(/,/g, '') - +m[1].replace(/,/g, '') < 1 : false));
    q.steps = [`${m[3]} ${m[2] === 'more' ? '+' : '−'} ${m[1]} = **${q.opts[0]}**`];
    return q;
  };
  const orderQ = (nd, close) => () => {
    const big = chance(0.5), base = int(lo(nd), hi(nd)), set = new Set();
    let guard = 200;
    while (set.size < 4 && guard-- > 0) {
      const v = close ? Math.floor(base / Math.pow(10, close)) * Math.pow(10, close) + int(0, Math.pow(10, close) - 1) : int(lo(nd), hi(nd));
      if (v >= lo(nd) && v <= hi(nd)) set.add(v);
    }
    const arr = [...set].sort((a, b) => a - b), right = big ? arr[arr.length - 1] : arr[0];
    return { q: `Which number is the **${big ? 'largest' : 'smallest'}**?`, opts: [n(right), ...arr.filter((v) => v !== right).map(n)].slice(0, 4), steps: [`Compare the digits from the left, one column at a time.`, `The ${big ? 'largest' : 'smallest'} is **${n(right)}**`] };
  };
  const composeQ = (nd, zeros) => () => {
    let d, tries = 0;
    do { d = Array.from({ length: nd }, (_, i) => int(i === 0 ? 1 : 0, 9)); tries++; } while (tries < 200 && (zeros ? !d.slice(1).includes(0) : d.slice(1).includes(0)));
    const val = +d.join(''), parts = d.map((x, i) => (x ? x * Math.pow(10, nd - 1 - i) : 0)).filter(Boolean);
    const shown = zeros ? R.shuffle(parts) : parts;
    const sw = d.slice(); const i = int(0, nd - 2); [sw[i], sw[i + 1]] = [sw[i + 1], sw[i]];
    const noZero = +d.filter((x, k) => k === 0 || x !== 0).join('');
    return mk(`${shown.map(n).join(' + ')} = ?`, n(val), [n(+sw.join('')), n(noZero), n(val + Math.pow(10, nd - 2)), n(val - 1)], [`Put each part in its column. A column with no part is a zero.`, `= **${n(val)}**`]);
  };
  const seqQ = (specs) => (l) => {
    const [a, b, steps, dec] = at(l, specs);
    for (let t = 0; t < 50; t++) {
      const step = pick(steps), down = dec && chance(0.5), start = int(a, b);
      const arr = Array.from({ length: 5 }, (_, i) => start + (down ? -1 : 1) * i * step);
      if (Math.min(...arr) < 0) continue;
      return mk(`What comes next?  ${arr.slice(0, 4).map(n).join(', ')}, …`, n(arr[4]), [n(arr[3] + (down ? -1 : 1) * step * 10), n(arr[3] + (down ? -1 : 1) * Math.max(1, step / 10)), n(arr[3] + (down ? 1 : -1) * step), n(arr[3] + (down ? -1 : 1) * 2 * step)], [`It goes ${down ? 'down' : 'up'} by ${n(step)} each time.`, `${n(arr[3])} ${down ? '−' : '+'} ${n(step)} = **${n(arr[4])}**`]);
    }
    return G.moreLess(100, 999, [10]);
  };
  const romanQ = (ranges) => (l) => {
    const [a, b] = at(l, ranges); let x, r;
    do { x = int(a, b); r = G.toRoman(x); } while (l >= 2 && !/CM|CD|XC|XL|IX|IV/.test(r));
    const naive = r.split('').reduce((s, c) => s + { M: 1000, D: 500, C: 100, L: 50, X: 10, V: 5, I: 1 }[c], 0);
    return mk(`What number is **${r}**?`, n(x), [n(naive), n(x + (x < 100 ? 10 : 100)), n(Math.max(1, x - (x < 100 ? 10 : 10))), n(x + 2)], ['A smaller letter before a bigger one is taken away.', `${r} = **${n(x)}**`]);
  };
  const midpoint = (specs) => (l) => {
    const [unit, span] = at(l, specs), a = int(1, 9) * unit * 2, b = a + int(1, span) * unit * 2, mid = (a + b) / 2;
    return mk(`Which number is exactly half-way between **${n(a)}** and **${n(b)}**?`, n(mid), [n(b - a), n(mid + unit), n(mid - unit), n((a + b))], [`Add them: ${n(a)} + ${n(b)} = ${n(a + b)}`, `Halve it: ${n(a + b)} ÷ 2 = **${n(mid)}**`]);
  };
  const neg = (l) => {
    if (l === 1) { const a = -int(1, 5), up = int(a === -1 ? 2 : -a + 1, 9), r = a + up; return mk(`It is ${n(a)} °C. It goes **up ${up} °C**. What is it now?`, `${n(r)} °C`, [`${n(-r)} °C`, `${n(a - up)} °C`, `${n(up - a)} °C`], [`${n(a)} → 0 is ${-a} degrees, then ${up + a} more.`, `**${n(r)} °C**`]); }
    if (l === 2) return G.temp();
    if (l === 3) { const a = int(2, 9), dn = a + int(3, 12), r = a - dn; return mk(`It is ${a} °C. It goes **down ${dn} °C**. What is it now?`, `${n(r)} °C`, [`${n(dn - a)} °C`, `${n(a + dn)} °C`, `${n(r + 2)} °C`], [`${a} − ${dn} goes below zero.`, `**${n(r)} °C**`]); }
    if (l === 4) return G.negDiff();
    const a = -int(5, 15), up = int(12, 25), dn = int(up + 2, up + 14), r = a + up - dn;
    return mk(`It is ${n(a)} °C. It goes **up ${up} °C**, then **down ${dn} °C**. What is it now?`, `${n(r)} °C`, [`${n(-r)} °C`, `${n(a + up + dn)} °C`, `${n(a - up - dn)} °C`], [`${n(a)} + ${up} = ${n(a + up)}`, `${n(a + up)} − ${dn} = **${n(r)}**`]);
  };
  const negOrder = (l) => {
    const m = at(l, [6, 10, 20, 50, 100]); let set;
    do { set = new Set(); while (set.size < 4) set.add(int(-m, m)); } while ([...set].filter((v) => v < 0).length < 2);
    const arr = [...set].sort((a, b) => a - b), small = chance(0.5), right = small ? arr[0] : arr[3];
    return { q: `Which number is the **${small ? 'smallest' : 'largest'}**?`, opts: [n(right), ...arr.filter((v) => v !== right).map(n)], steps: ['On a number line, numbers to the left are smaller.', `The ${small ? 'smallest' : 'largest'} is **${n(right)}**`] };
  };

  /* =====================================================  addition and subtraction (Y5 unit 3)  ===================================================== */
  const addCol = (l) => {
    const d = at(l, [2, 3, 4, 5, 6]);
    let a, b, tries = 0;
    do { a = int(lo(d), hi(d)); b = int(lo(l >= 5 ? d - 1 : d), hi(l >= 5 ? d - 1 : d)); tries++; } while (tries < 60 && l === 1 && ((a % 10) + (b % 10) > 9));
    const r = a + b;
    return mk(`${n(a)} + ${n(b)} = ?`, n(r), [n(noCarry(a, b)), n(r + Math.pow(10, d - 1)), n(r - Math.pow(10, d - 2)), n(r + 10)], [`Add column by column from the right, carrying when a column makes 10 or more.`, `${n(a)} + ${n(b)} = **${n(r)}**`]);
  };
  const subCol = (l) => {
    const d = at(l, [2, 3, 4, 5, 6]);
    let a, b;
    if (l >= 4) { a = int(2, 9) * Math.pow(10, d - 1) + int(0, 1) * int(1, 9); b = int(lo(d - 1), hi(d - 1)); if (b >= a) b = Math.floor(a / 3); }
    else { a = int(lo(d), hi(d)); b = int(lo(d - 1), a - 1); }
    if (l === 1) { b = int(11, a - 5); }
    const r = a - b;
    return mk(`${n(a)} − ${n(b)} = ?`, n(r), [n(absDigits(a, b)), n(r + Math.pow(10, d - 1)), n(r - Math.pow(10, d - 2)), n(r + 10)], [l >= 4 ? 'Exchange across the zeros: take from the next column that has something.' : 'Subtract column by column, exchanging when the top digit is too small.', `${n(a)} − ${n(b)} = **${n(r)}**`]);
  };
  const missing = (l) => {
    const d = at(l, [2, 3, 4, 5, 6]), form = pick(l === 1 ? [0, 1] : [0, 1, 2]);
    const a = int(lo(d), hi(d) - lo(d)), b = int(lo(d - 1), Math.min(hi(d), a));
    const c = a + b;
    if (form === 0) return mk(`${n(a)} + □ = ${n(c)}`, n(b), [n(c + a), n(b + Math.pow(10, d - 2)), n(a - b > 0 ? a - b : b + 1), n(b - 10 > 0 ? b - 10 : b + 20)], [`${n(c)} − ${n(a)} = **${n(b)}**`]);
    if (form === 1) return mk(`□ − ${n(b)} = ${n(a)}`, n(c), [n(a - b > 0 ? a - b : c + 10), n(c + 10), n(c - 10), n(a + 2 * b)], [`${n(a)} + ${n(b)} = **${n(c)}**`]);
    return mk(`${n(c)} − □ = ${n(a)}`, n(b), [n(c + a), n(a - b > 0 ? a - b : b + 20), n(b + 100), n(b - 10 > 0 ? b - 10 : b + 30)], [`${n(c)} − ${n(a)} = **${n(b)}**`]);
  };
  const addWord = (l) => {
    const nm = pick(NAMES);
    if (l === 1) { const a = int(12, 60), b = int(11, 30), thing = pick(['stickers', 'marbles', 'cards', 'stamps']); return mk(`${nm} has ${a} ${thing} and gets ${b} more. How many ${thing} now?`, n(a + b), [n(a + b + 10), n(a - b), n(a + b - 1)], [`${a} + ${b} = **${a + b}**`]); }
    if (l === 2) { const a = int(120, 480), b = int(110, 390); return mk(`Monday: **${a}** books. Tuesday: **${b}** books. How many in total?`, n(a + b), [n(a + b + 100), n(a + b - 10), n(a - b), n(a + b + 10)], [`${a} + ${b} = **${a + b}**`]); }
    if (l === 3) { const a = int(2400, 6800), b = int(1200, 3900); return mk(`Box A: **${n(a)}** beads. Box B: **${n(b)}** beads. How many more in box A?`, n(a - b), [n(a + b), n(a - b + 1000), n(a - b - 100), n(b - a > 0 ? b - a : a - b + 10)], [`${n(a)} − ${n(b)} = **${n(a - b)}**`]); }
    if (l === 4) { const a = int(24000, 68000), b = int(3100, 9800), c = int(1200, b - 100); return mk(`**${n(a)}** books. **${n(b)}** go out. **${n(c)}** new books come in. How many now?`, n(a - b + c), [n(a - b - c), n(a + b - c), n(a - b), n(a + b + c)], [`${n(a)} − ${n(b)} = ${n(a - b)}`, `${n(a - b)} + ${n(c)} = **${n(a - b + c)}**`]); }
    const a = int(15, 39) * 1000 + int(1, 9) * 100 + int(10, 99), b = int(2, 6) * 1000 + int(1, 9) * 100, c = int(2, 7) * 1000 + int(1, 9) * 10;
    const all = false;                                    // (v0.2: the three-chest total was too wordy)
    if (all) return mk(`Chest 1 has ${n(a)} coins. Chest 2 has ${n(b)} fewer than chest 1. Chest 3 has ${n(c)} fewer than chest 2. How many coins in all three chests?`, n(a + (a - b) + (a - b - c)), [n(a - b - c), n(a + (a - b)), n(3 * a - b - c), n(a + (a - b) + (a - b + c))], [`Chest 2: ${n(a)} − ${n(b)} = ${n(a - b)}`, `Chest 3: ${n(a - b)} − ${n(c)} = ${n(a - b - c)}`, `Total = **${n(a + (a - b) + (a - b - c))}**`]);
    return mk(`**${n(a)}** coins. Take away **${n(b)}**. Then take away **${n(c)}**. How many are left?`, n(a - b - c), [n(a - b), n(a - c), n(a - b + c), n(a - b - c + 1000)], [`${n(a)} − ${n(b)} = ${n(a - b)}`, `${n(a - b)} − ${n(c)} = **${n(a - b - c)}**`]);
  };
  const estimate = (l) => {
    const p = at(l, [10, 10, 100, 1000, 1000]), d = at(l, [2, 3, 4, 4, 5]), sub = l >= 4 && chance(0.5);
    const a = int(lo(d) + 5, hi(d) - 5), b = int(lo(d - 1), hi(d - 1));
    if (sub && b >= a) return estimate(l);
    const ra = roundTo(a, p), rb = roundTo(b, p), r = sub ? ra - rb : ra + rb, ex = sub ? a - b : a + b;
    return mk(`Estimate ${n(a)} ${sub ? '−' : '+'} ${n(b)} by rounding each number to the nearest ${n(p)}.`, n(r), [n(ex), n(r + p), n(r - p), n(sub ? ra + rb : ra - rb > 0 ? ra - rb : r + 2 * p)], [`${n(a)} ≈ ${n(ra)} and ${n(b)} ≈ ${n(rb)}`, `${n(ra)} ${sub ? '−' : '+'} ${n(rb)} = **${n(r)}**`]);
  };
  const inverse = (l) => {
    const d = at(l, [2, 3, 3, 4, 5]), add = chance(0.5), a = int(lo(d), hi(d)), b = int(lo(d - 1), hi(d - 1));
    if (add) { const c = a + b; return { q: `Which calculation checks that ${n(a)} + ${n(b)} = ${n(c)}?`, opts: [`${n(c)} − ${n(b)} = ${n(a)}`, `${n(c)} + ${n(b)} = ${n(c + b)}`, `${n(a)} − ${n(b)} = ${n(a - b)}`, `${n(c)} + ${n(a)} = ${n(c + a)}`].filter((s, i) => i === 0 || (i === 2 && a > b) || i !== 2).slice(0, 4), steps: ['Check an addition by taking one part away from the total.', `${n(c)} − ${n(b)} = ${n(a)} ✓`] }; }
    const big = a + b, c = a;     // big − b = a
    return { q: `Which calculation checks that ${n(big)} − ${n(b)} = ${n(c)}?`, opts: [`${n(c)} + ${n(b)} = ${n(big)}`, `${n(c)} − ${n(b)} = ${n(c - b)}`, `${n(big)} + ${n(b)} = ${n(big + b)}`, `${n(big)} + ${n(c)} = ${n(big + c)}`], steps: ['Check a subtraction by adding the answer back.', `${n(c)} + ${n(b)} = ${n(big)} ✓`] };
  };
  const mentalAdd = (l) => {
    if (l === 1) { const a = int(2, 6) * 10 + int(1, 9), b = int(1, 3) * 10; return mk(`${a} + ${b} = ?`, a + b, [a + b + 10, a + b - 10, a + b + 1], [`${a} + ${b} = **${a + b}**`]); }
    if (l === 2) { const a = int(24, 76), k = pick([9, 19, 29, 99]); return mk(`Work it out mentally: ${a} + ${k}`, a + k, [a + k + 10, a + k - 1, a + k + 1, a + k - 10], [`${a} + ${k + 1} = ${a + k + 1}, then take 1 away.`, `**${a + k}**`]); }
    if (l === 3) { const a = int(20, 60), b = int(21, 70), k = pick([99, 199, 299]); return mk(`Work it out mentally: ${a} + ${b} + ${k}`, a + b + k, [a + b + k + 1, a + b + k - 1, a + b + k + 10, a + b + k - 100], [`${a} + ${b} = ${a + b}`, `${a + b} + ${k + 1} − 1 = **${a + b + k}**`]); }
    if (l === 4) { const a = int(100, 250), b = int(40, 99), c = pick([194, 196, 198, 296]); return mk(`Work it out mentally: ${a} + ${b} − ${c}`, a + b - c, [a + b - c + 10, a + b - c - 4, a + b - c + 2, a + b + c], [`${a} + ${b} = ${a + b}`, `${a + b} − ${c} = **${a + b - c}**`]); }
    const a = int(10, 40) * 1000 - 5, b = int(3, 9) * 1000 + 941, c = int(3, 5) * 1000 + 81;
    return mk(`What is the exact answer to ${n(a)} + ${n(b)} − ${n(c)}?`, n(a + b - c), [n(a + b - c + 10), n(a + b - c - 100), n(a + b - c + 1000), n(a + b + c)], [`${n(a)} + ${n(b)} = ${n(a + b)}`, `${n(a + b)} − ${n(c)} = **${n(a + b - c)}**`]);
  };

  /* =====================================================  graphs and tables (Y5 unit 4)  ===================================================== */
  const barRead = (l) => {
    const sets = [['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], ['Cats', 'Dogs', 'Fish', 'Birds', 'Mice'], ['Red', 'Blue', 'Green', 'Yellow', 'Pink'], ['Tea', 'Milk', 'Juice', 'Water', 'Cola']];
    const cats = pick(sets).slice(0, l <= 2 ? 4 : 5), title = pick(['Books read', 'Votes', 'Goals scored', 'Visitors']);
    const [step, max, unit] = at(l, [[1, 10, 1], [2, 12, 2], [5, 30, 5], [10, 60, 5], [100, 600, 50]]);
    let vals, guard = 100;
    do { vals = cats.map(() => int(1, max / unit - 1) * unit); } while (guard-- > 0 && new Set(vals).size < cats.length);
    const fig = Fig.bars(title, cats, vals, max, step, n);
    const i = int(0, cats.length - 1); let j = int(0, cats.length - 1); while (j === i) j = int(0, cats.length - 1);
    const idx = vals.map((v, k) => k), tall = idx.reduce((a, k) => (vals[k] > vals[a] ? k : a), 0), short = idx.reduce((a, k) => (vals[k] < vals[a] ? k : a), 0);
    if (l === 1) return mk(`How many ${title.toLowerCase()} for **${cats[i]}**?`, n(vals[i]), [n(vals[i] + step), n(vals[i] - step), n(vals[i] + 2 * step)], [`Read the top of the ${cats[i]} bar against the scale.`, `**${n(vals[i])}**`], { fig });
    if (l === 2) { const a = Math.max(vals[i], vals[j]), b = Math.min(vals[i], vals[j]), ca = vals[i] > vals[j] ? cats[i] : cats[j], cb = vals[i] > vals[j] ? cats[j] : cats[i]; return mk(`How many more for **${ca}** than for **${cb}**?`, n(a - b), [n(a + b), n(a - b + step), n(Math.abs(a - b - step)), n(a)], [`${ca} = ${n(a)}, ${cb} = ${n(b)}`, `${n(a)} − ${n(b)} = **${n(a - b)}**`], { fig }); }
    if (l === 3) return mk(`How many altogether for **${cats[i]}** and **${cats[j]}**?`, n(vals[i] + vals[j]), [n(Math.abs(vals[i] - vals[j])), n(vals[i] + vals[j] + step), n(vals[i] + vals[j] - step), n(vals[i] + vals[j] + 2 * step)], [`${cats[i]} = ${n(vals[i])}, ${cats[j]} = ${n(vals[j])}`, `${n(vals[i])} + ${n(vals[j])} = **${n(vals[i] + vals[j])}**`], { fig });
    if (l === 4) return mk('**Tallest** bar − **shortest** bar = ?', n(vals[tall] - vals[short]), [n(vals[tall] + vals[short]), n(vals[tall]), n(vals[tall] - vals[short] + unit), n(Math.abs(vals[tall] - vals[short] - unit))], [`Tallest ${n(vals[tall])}, shortest ${n(vals[short])}`, `${n(vals[tall])} − ${n(vals[short])} = **${n(vals[tall] - vals[short])}**`], { fig });
    const tot = vals.reduce((s, v) => s + v, 0);
    return mk('What is the **total** of all the bars?', n(tot), [n(tot + unit), n(tot - unit), n(tot + 2 * unit), n(tot - 2 * unit)], [`Read every bar: ${vals.map(n).join(' + ')}`, `= **${n(tot)}**`], { fig });
  };
  const tableRead = (l) => {
    const cols = ['Dogs', 'Cats', 'Fish'], rowsN = ['Shop A', 'Shop B', 'Shop C'], mx = at(l, [9, 20, 40, 90, 250]);
    const m = rowsN.map(() => cols.map(() => int(Math.max(2, Math.round(mx / 5)), mx)));
    const rowSum = (r) => m[r].reduce((s, v) => s + v, 0), colSum = (c) => m.reduce((s, r) => s + r[c], 0);
    const head = ['', ...cols];
    const full = (hide) => [head.concat(l >= 3 ? ['Total'] : []), ...rowsN.map((s, i) => [s, ...m[i].map((v, j) => (hide && hide[0] === i && hide[1] === j ? '?' : String(v))), ...(l >= 3 ? [String(rowSum(i))] : [])])];
    const r = int(0, 2), c = int(0, 2);
    if (l === 1) return mk(`How many **${cols[c].toLowerCase()}** does **${rowsN[r]}** have?`, m[r][c], [m[r][(c + 1) % 3], m[(r + 1) % 3][c], m[r][c] + 1], ['Find the row, then the column.', `**${m[r][c]}**`], { fig: Fig.table(full()) });
    if (l === 2) return mk(`How many pets does **${rowsN[r]}** have altogether?`, rowSum(r), [rowSum(r) + 10, rowSum(r) - m[r][0], colSum(c), rowSum(r) - 1], [`Add along the row: ${m[r].join(' + ')}`, `= **${rowSum(r)}**`], { fig: Fig.table(full()) });
    if (l === 3) { const known = rowSum(r) - m[r][c]; return mk('What is the missing number in the table?', m[r][c], [rowSum(r) + known, known, m[r][c] + 10, Math.abs(m[r][c] - 10) || 11], [`${rowsN[r]} has ${rowSum(r)} in total.`, `${rowSum(r)} − ${known} = **${m[r][c]}**`], { fig: Fig.table(full([r, c]).map((row, ri) => row)) }); }
    let c2 = (c + 1) % 3;
    if (l === 4) return mk(`All 3 shops: how many more **${cols[c].toLowerCase()}** than **${cols[c2].toLowerCase()}**?`, Math.abs(colSum(c) - colSum(c2)), [colSum(c) + colSum(c2), Math.abs(colSum(c) - colSum(c2)) + 10, Math.abs(m[r][c] - m[r][c2]), colSum(c)], [`${cols[c]}: ${m.map((x) => x[c]).join(' + ')} = ${colSum(c)}`, `${cols[c2]}: ${m.map((x) => x[c2]).join(' + ')} = ${colSum(c2)}`, `The difference is **${Math.abs(colSum(c) - colSum(c2))}**`], { fig: Fig.table(full()) });
    const all = m.flat().reduce((s, v) => s + v, 0);
    return mk('How many pets are there in **all three shops**?', all, [all + 10, all - 10, all + 100, colSum(0) + colSum(1)], [`Add the three row totals: ${rowsN.map((_, i) => rowSum(i)).join(' + ')}`, `= **${all}**`], { fig: Fig.table(full()) });
  };
  const lineRead = (l) => {
    const cats = ['9am', '10am', '11am', '12pm', '1pm'], [step, max, unit] = at(l, [[2, 10, 1], [5, 30, 5], [10, 60, 5], [10, 80, 10], [20, 160, 10]]);
    let vals, guard = 100;
    do { vals = cats.map(() => int(1, max / unit - 1) * unit); } while (guard-- > 0 && new Set(vals).size < 5);
    const fig = Fig.lineGraph(pick(['People at the pool', 'Cars in the car park', 'Ice creams sold']), cats, vals, max, step);
    const i = int(0, 4); let j = int(0, 4); while (j === i) j = int(0, 4);
    const hi2 = Math.max(vals[i], vals[j]), lo2 = Math.min(vals[i], vals[j]), ch = hi2 === vals[i] ? cats[i] : cats[j], cl = hi2 === vals[i] ? cats[j] : cats[i];
    if (l === 1) return mk(`How many were there at **${cats[i]}**?`, vals[i], [vals[i] + unit, vals[i] - unit, vals[i] + 2 * unit], [`Find ${cats[i]} along the bottom, go up to the dot.`, `**${vals[i]}**`], { fig });
    if (l === 2) return mk(`How many more were there at **${ch}** than at **${cl}**?`, hi2 - lo2, [hi2 + lo2, hi2 - lo2 + unit, Math.abs(hi2 - lo2 - unit) || 2 * unit, hi2], [`${ch}: ${hi2}, ${cl}: ${lo2}`, `${hi2} − ${lo2} = **${hi2 - lo2}**`], { fig });
    if (l === 3) { const diffs = cats.slice(1).map((_, k) => vals[k + 1] - vals[k]), best = diffs.reduce((a, d, k) => (d > diffs[a] ? k : a), 0); const lab = (k) => `${cats[k]} to ${cats[k + 1]}`; return { q: 'Between which two times did the number **rise the most**?', fig, opts: [lab(best), ...[0, 1, 2, 3].filter((k) => k !== best).map(lab)], steps: ['Look for the steepest line going up.', `The biggest rise is from ${lab(best)}: **+${diffs[best]}**`] }; }
    if (l === 4) { const a = vals[0], b = vals[2], c = vals[4]; const r = Math.abs(b - a) + Math.abs(c - b); return mk('Change from **9am to 11am** + change from **11am to 1pm** = ?', r, [Math.abs(c - a), r + unit, r - unit || r + 2 * unit, r + 2 * unit], [`9am→11am: ${Math.abs(b - a)}`, `11am→1pm: ${Math.abs(c - b)}`, `Added: **${r}**`], { fig }); }
    const tot = vals[0] + vals[2] + vals[4];
    return mk('What is the **total** for 9am, 11am and 1pm together?', tot, [tot + unit, tot - unit, tot + 2 * unit, vals.reduce((s, v) => s + v, 0)], [`${vals[0]} + ${vals[2]} + ${vals[4]}`, `= **${tot}**`], { fig });
  };
  const clock = (mins) => { const h = Math.floor(mins / 60) % 24, m = mins % 60; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`; };
  const dur = (m) => `${m >= 60 ? Math.floor(m / 60) + ' h ' : ''}${m % 60 ? (m % 60) + ' min' : ''}`.trim();
  const journey = (l) => {
    const stops = ['Station', 'Market', 'Library', 'Park', 'School'], st = at(l, [60, 30, 15, 5, 5]);
    let t = int(7, 15) * 60 + int(0, 3) * 15, times = [];
    stops.forEach((_, i) => { times.push(t); t += st * int(1, l >= 4 ? 6 : 3) + (l >= 4 ? int(0, 6) * 5 : 0); });
    const a = int(0, 2), b = int(a + 1, 4), d = times[b] - times[a];
    const fig = Fig.table([['Stop', 'Time'], ...stops.map((s, i) => [s, clock(times[i])])]);
    return mk(`Bus: how long from **${stops[a]}** to **${stops[b]}**?`, dur(d), [dur(d + 10), dur(d + 20 > 0 ? d - 10 : d + 30), dur(d + 60), dur(Math.max(5, d - 20))], [`${clock(times[a])} → ${clock(times[b])}`, `**${dur(d)}**`], { fig });
  };

  /* =====================================================  multiplication, division, factors (Y5 unit 5, Y6 units 2-3)  ===================================================== */
  const factorOfQ = (l) => {
    const N = pick(at(l, [[12, 16, 18, 20], [24, 28, 30, 32, 36, 40], [48, 54, 56, 60, 64, 72], [84, 90, 96, 100, 108, 120], [144, 150, 168, 180, 196, 200, 240]]));
    const fs = []; for (let i = 3; i < N / 2; i++) if (N % i === 0) fs.push(i);
    const f = pick(fs.length ? fs : [4]), near = [], far = [];
    for (let i = 3; i <= N / 2 + 6; i++) if (N % i !== 0) (Math.abs(i - f) <= 3 || N % (i - 1) === 0 || N % (i + 1) === 0 ? near : far).push(i);
    return mk(`Which number is a **factor** of ${N}?`, f, R.shuffle(near).concat(R.shuffle(far)), [`${N} ÷ ${f} = ${N / f}, with nothing left over.`]);
  };
  const multipleOfQ = (l) => {
    const k = pick(at(l, [[2, 5, 10], [3, 4], [6, 7, 8], [9, 11, 12], [13, 14, 15, 16, 17, 19]])), m = int(l >= 5 ? 8 : 4, l >= 4 ? 25 : 12), right = k * m;
    const near = []; for (let d = 1; d <= 2 * k + 2; d++) for (const v of [right + d, right - d]) if (v > 0 && v % k !== 0) near.push(v);
    return mk(`Which number is a **multiple** of ${k}?`, right, R.shuffle(near.slice(0, 8)), [`${right} = ${k} × ${m}`]);
  };
  const primeQ = (l) => {
    const [a, b] = at(l, [[2, 20], [11, 40], [30, 70], [60, 100], [20, 80]]);
    if (l === 5) { const s = pick([[20, 40], [50, 70], [60, 80], [30, 50]]); const ps = []; for (let i = s[0]; i <= s[1]; i++) if (BC.isPrime(i)) ps.push(i); return mk(`How many **prime numbers** are there from ${s[0]} to ${s[1]}?`, ps.length, [ps.length + 1, ps.length - 1, ps.length + 2, ps.length - 2 > 0 ? ps.length - 2 : ps.length + 3], [`Primes here: ${ps.join(', ')}`, `That is **${ps.length}**`]); }
    const ps = [], traps = [];
    for (let i = a; i <= b; i++) { if (BC.isPrime(i)) ps.push(i); else if (i > 8 && (l <= 2 || (i % 2 && i % 5))) traps.push(i); }
    return mk('Which number is a **prime number**?', pick(ps), R.shuffle(traps), ['A prime has exactly two factors: 1 and itself.']);
  };
  const squareCube = (l) => {
    if (l === 1) { const k = int(2, 6); return mk(`What is ${k}² (${k} squared)?`, k * k, [k * 2, k * k + k, k * k - 1, k * 3], [`${k} × ${k} = **${k * k}**`]); }
    if (l === 2) { const k = int(6, 10); return mk(`What is ${k}² (${k} squared)?`, k * k, [k * 2, k * k + k, k * k - 1, k * k + 10], [`${k} × ${k} = **${k * k}**`]); }
    if (l === 3) { const k = int(2, 5); return mk(`What is ${k}³ (${k} cubed)?`, k ** 3, [k * 3, k * k, k ** 3 + k, 3 * k * k], [`${k} × ${k} × ${k} = **${k ** 3}**`]); }
    if (l === 4) { const k = chance(0.5) ? int(11, 15) : int(6, 9), cube = k < 10; return mk(`What is ${k}${cube ? '³' : '²'}?`, cube ? k ** 3 : k * k, cube ? [k * 3, k * k, k ** 3 + k, 3 * k * k] : [k * 2, k * k + k, k * k - 1, k * k + 10], [cube ? `${k} × ${k} × ${k} = **${k ** 3}**` : `${k} × ${k} = **${k * k}**`]); }
    return { q: 'Which is a **square** number **and** a **cube** number?', opts: ['64', '16', '27', '100'], steps: ['64 = 8 × 8 and 64 = 4 × 4 × 4.', '16 is only a square, 27 is only a cube.'] };
  };
  const times10 = (l) => {
    if (l === 5) { const b = pick([20, 30, 40, 50, 60]), q = int(3, 9), a = b * q, k = pick([10, 100]); return mk(`${n(a)} ÷ ${b} = ${n(a * k)} ÷ □`, n(b * k), [n(b), n(b * k * 10), n(b * k / 10 || b + 5), n(q * k)], [`${n(a)} became ${n(a * k)}: ${n(k)} times bigger.`, `So ${b} must also be ${n(k)} times bigger: **${n(b * k)}**`]); }
    const p = at(l, [[10], [100], [10, 100], [1000], [10, 100, 1000]]), up = l <= 2 || chance(0.5);
    const k = pick(p);
    if (up) { const a = int(l === 1 ? 2 : 3, l >= 4 ? 990 : 99), r = a * k; return mk(`${n(a)} × ${n(k)} = ?`, n(r), [n(r * 10), n(r / 10), n(a + k), n(a * k / 100 || a + 1)], [`Every digit moves ${String(k).length - 1} place${k > 10 ? 's' : ''} to the left.`, `**${n(r)}**`]); }
    const r = int(4, 950), a = r * k;
    return mk(`${n(a)} ÷ ${n(k)} = ?`, n(r), [n(r * 10), n(r / 10 === Math.floor(r / 10) ? r / 10 : r + 1), n(a - k), n(r + 1)], [`Every digit moves ${String(k).length - 1} place${k > 10 ? 's' : ''} to the right.`, `**${n(r)}**`]);
  };
  const mulQ = (shape) => (l) => {
    const [da, db] = at(l, shape);
    const a = int(lo(da), hi(da)), b = db === 1 ? int(2, 9) : int(lo(db), hi(db)), r = a * b;
    const tens = Math.floor(b / 10) * 10, ones = b % 10;
    const steps = db === 1 ? [`${n(a)} × ${b} = **${n(r)}**`] : [`${n(a)} × ${n(tens)} = ${n(a * tens)}`, `${n(a)} × ${ones} = ${n(a * ones)}`, `${n(a * tens)} + ${n(a * ones)} = **${n(r)}**`];
    return mk(`${n(a)} × ${n(b)} = ?`, n(r), [n(r + 10), n(r - 10), n(r + Math.pow(10, Math.max(1, da - 1))), n(r - Math.pow(10, Math.max(1, da - 1))), n(r + a), n(r - a)], steps);
  };
  const divQ = (spec) => (l) => {
    const [da, db, rem] = at(l, spec);
    const b = int(lo(db) === 1 ? 2 : lo(db), db === 1 ? 9 : hi(db));
    const q = int(Math.max(2, Math.ceil(lo(da) / b)), Math.max(3, Math.floor(hi(da) / b)));
    const r = rem ? int(1, b - 1) : 0, a = b * q + r;
    if (!rem) return mk(`${n(a)} ÷ ${b} = ?`, n(q), [n(q + 1), n(q - 1), n(q + 10), n(q * 10)], [`${b} × ${n(q)} = ${n(a)}`, `So ${n(a)} ÷ ${b} = **${n(q)}**`]);
    return mk(`${n(a)} ÷ ${b} = ?`, `${n(q)} r ${r}`, [`${n(q)} r ${r + 1 < b ? r + 1 : r - 1}`, `${n(q + 1)} r ${r}`, `${n(q - 1)} r ${r + b}`, `${n(q)} r ${b - r}`], [`${b} × ${n(q)} = ${n(b * q)}`, `${n(a)} − ${n(b * q)} = ${r} left over`, `**${n(q)} r ${r}**`]);
  };
  const primeFactors = (l) => {
    const N = pick(at(l, [[12, 18, 20], [12, 18, 20, 28, 30, 45], [12, 18, 20, 28, 30, 45], [36, 40, 48, 60, 72, 75, 90], [120, 150, 200, 210, 300, 360]]));
    const ps = []; let x = N; for (let p = 2; p <= x; p++) while (x % p === 0) { ps.push(p); x /= p; }
    const show = (a) => a.join(' × ');
    const wrongs = [];
    if (ps.length > 2) wrongs.push(show([ps[0] * ps[1], ...ps.slice(2)]));
    wrongs.push(show([1, ...ps]));
    const alt = ps.slice(); alt[alt.length - 1] = alt[alt.length - 1] === 2 ? 3 : alt[alt.length - 1] + 2; wrongs.push(show(alt));
    const alt2 = ps.slice(0, -1).concat(ps.length > 1 ? [] : [ps[0] + 1]); if (alt2.length) wrongs.push(show(alt2));
    wrongs.push(show(ps.concat([2])));
    return mk(`Which shows ${n(N)} as a **product of prime factors**?`, show(ps), wrongs, [`Keep dividing by primes: ${n(N)} → ${ps.map((p, i) => (i ? '' : '') + p).join(', ')}`, `${n(N)} = **${show(ps)}**`]);
  };
  const scaleFact = (l) => {
    const b = pick([11, 12, 15, 21, 31, 35]), k = pick(l <= 3 ? [2] : [2, 3]);
    if (chance(0.5)) {
      const q = k * int(l >= 4 ? 6 : 2, l >= 4 ? 45 : 9), a = b * q;
      return mk(`${n(a)} ÷ ${b} = ${n(q)}. What is ${n(a)} ÷ ${b * k}?`, n(q / k), [n(q * k), n(q), n(q + k), n(q / k + 1)], [`You divide by a number ${k} times bigger, so the answer is ${k} times smaller.`, `${n(q)} ÷ ${k} = **${n(q / k)}**`]);
    }
    const q = int(l >= 4 ? 12 : 3, l >= 4 ? 90 : 9), a = b * q;
    return mk(`${b} × ${n(q)} = ${n(a)}. What is ${b * k} × ${n(q)}?`, n(a * k), [n(a), n(a + k), n(a * k * 10), n(a / k)], [`${b * k} is ${k} times ${b}, so the answer is ${k} times bigger.`, `${n(a)} × ${k} = **${n(a * k)}**`]);
  };
  const orderOps = (l) => {
    const a = int(2, 9), b = int(2, 9), c = int(2, 9);
    if (l === 1) return mk(`${a} + ${b} × ${c} = ?`, a + b * c, [(a + b) * c, a + b + c, a * b + c, a + b * c + 1], ['Multiply before you add.', `${a} + ${b * c} = **${a + b * c}**`]);
    if (l === 2) return mk(`(${a} + ${b}) × ${c} = ?`, (a + b) * c, [a + b * c, a + b + c, a * b * c, (a + b) * c + c], ['Brackets first.', `${a + b} × ${c} = **${(a + b) * c}**`]);
    if (l === 3) { const e = a * c + b * c; return mk(`${e} − ${b} × ${c} = ?`, e - b * c, [(e - b) * c, e - b - c, e - b * c + c, a * c * c], ['Multiply first, then subtract.', `${e} − ${b * c} = **${e - b * c}**`]); }
    if (l === 4) { const d = int(2, 6), sum = d + c, s = sum * int(2, 6), q = s / sum; return mk(`${s} ÷ (${d} + ${c}) + ${a} × ${b} = ?`, q + a * b, [q + a * b + c, (q + a) * b, q + a + b, q + a * b + 1], ['Brackets first, then × and ÷, then +.', `${s} ÷ ${sum} = ${q}, ${a} × ${b} = ${a * b}`, `${q} + ${a * b} = **${q + a * b}**`]); }
    const k = int(2, 5), m = int(2, 6), t = m * int(3, 8), r = (t - m) / m + k * k;
    return mk(`(${t} − ${m}) ÷ ${m} + ${k}² = ?`, r, [t - 1 + k * k, (t - m) / m + 2 * k, (t - m) / m + k, (t - m) / (m + k * k)].map((v) => Math.round(v * 100) / 100), ['Brackets, then powers, then ÷, then +.', `${t - m} ÷ ${m} = ${(t - m) / m}, ${k}² = ${k * k}`, `${(t - m) / m} + ${k * k} = **${r}**`]);
  };
  const lcmHcf = (l) => {
    const pairs = at(l, [[[2, 3], [2, 5], [3, 4], [2, 4]], [[4, 6], [3, 6], [4, 10], [6, 9]], [[6, 8], [8, 12], [6, 10], [9, 12]], [[10, 15], [12, 18], [8, 20], [14, 21]], [[16, 24], [18, 30], [24, 36], [28, 42]]]);
    const [a, b] = pick(pairs);
    if (chance(0.5)) { const r = BC.lcm(a, b); return mk(`What is the **lowest common multiple** of ${a} and ${b}?`, r, [a * b === r ? r * 2 : a * b, gcd(a, b), a + b === r ? r + 2 : a + b, r * 2], [`Multiples of ${Math.max(a, b)}: ${[1, 2, 3, 4].map((k) => k * Math.max(a, b)).join(', ')} …`, `The first one ${Math.min(a, b)} goes into is **${r}**`]); }
    const r = gcd(a, b);
    return mk(`What is the **highest common factor** of ${a} and ${b}?`, r, [BC.lcm(a, b), r * 2 <= Math.min(a, b) ? r * 2 : r + 1, Math.abs(b - a) === r ? r + 2 : Math.abs(b - a), r + 2], [`Factors of ${a} and of ${b}, then the biggest they share.`, `**${r}**`]);
  };
  const divisible = (l) => {
    const k = at(l, [2, 5, 3, 9, 4]), pool = []; for (let i = lo(l >= 3 ? 3 : 2); i <= hi(l >= 3 ? 3 : 2); i++) pool.push(i);
    const yes = pool.filter((v) => v % k === 0), no = pool.filter((v) => v % k !== 0 && (l < 4 || (v % 3 === 0 || v % 2 === 0)));
    return mk(`Which number can be divided by ${k} with nothing left over?`, pick(yes), R.shuffle(no), [k === 9 || k === 3 ? `A number is in the ${k} times table if its digits add up to a multiple of ${k}.` : `Check the ${k} times table / the last digits.`]);
  };
  const factorCount = (l) => {
    const N = pick(at(l, [[6, 8, 10], [12, 15, 16], [18, 20, 24], [30, 36, 28], [48, 60, 72, 100]])), fs = []; for (let i = 1; i <= N; i++) if (N % i === 0) fs.push(i);
    return mk(`How many **factors** does ${N} have?`, fs.length, [fs.length + 1, fs.length - 1, fs.length + 2, fs.length - 2 > 0 ? fs.length - 2 : fs.length + 3], [`Factors of ${N}: ${fs.join(', ')}`, `That is **${fs.length}**`]);
  };
  const wordMul = (l) => {
    const nm = pick(NAMES);
    const [a, b] = at(l, [[int(3, 9), int(11, 25)], [int(12, 40), int(6, 9)], [int(21, 45), int(12, 30)], [int(120, 450), int(12, 29)], [int(1200, 4500), int(12, 38)]]);
    const things = pick([['boxes', 'pencils'], ['packs', 'cards'], ['trays', 'eggs']]);
    return mk(`**${n(a)}** ${things[0]}. **${n(b)}** ${things[1]} in each. How many ${things[1]} in total?`, n(a * b), [n(a + b), n(a * b + 10), n(a * b - 10), n(a * b + 100)], [`${n(a)} × ${n(b)} = **${n(a * b)}**`]);
  };

  /* =====================================================  perimeter and area (Y5 unit 6)  ===================================================== */
  const rectShape = (l) => {
    const W = at(l, [int(3, 5), int(4, 7), int(5, 9), int(6, 10), int(7, 11)]), H = at(l, [int(2, 3), int(3, 5), int(3, 6), int(4, 7), int(5, 8)]);
    const a = int(1, Math.max(1, W - 2)), b = int(1, Math.max(1, H - 1)), m = at(l, [1, 1, 2, 5, 10]);
    const rect = l <= 1, poly = rect ? [[0, 0], [W, 0], [W, H], [0, H]] : [[0, 0], [W, 0], [W, H - b], [W - a, H - b], [W - a, H], [0, H]];
    const A = (rect ? W * H : W * H - a * b), Pm = 2 * (W + H);
    return { W, H, a, b, m, rect, poly, A, Pm };
  };
  const gridArea = (l) => {
    const s = rectShape(l);
    if (l <= 3) return mk('Each square = 1 cm². What is the **area**?', `${s.A} cm²`, [`${s.Pm} cm²`, `${s.W * s.H} cm²`, `${s.A + 1} cm²`, `${s.A - 2} cm²`], s.rect ? [`${s.W} × ${s.H} = **${s.A} cm²**`] : [`Whole rectangle: ${s.W} × ${s.H} = ${s.W * s.H}`, `Take away the corner: ${s.a} × ${s.b} = ${s.a * s.b}`, `**${s.A} cm²**`], { fig: Fig.gridShape(s.poly, {}) });
    const shown = s.rect ? new Set([0, 1]) : new Set([0, 1, 4, 5]);
    const m = s.m, P2 = 2 * (s.W + s.H) * m, shownSum = s.rect ? (s.W + s.H) * m : (s.W + (s.H - s.b) + (s.W - s.a) + s.H) * m;
    return mk('What is the **perimeter** of this shape?', `${P2} cm`, [`${shownSum} cm`, `${s.A * m * m} cm`, `${P2 + 2 * s.b * m} cm`, `${P2 - 2 * m} cm`], s.rect ? [`Two lengths and two widths: 2 × (${s.W * m} + ${s.H * m})`, `**${P2} cm**`] : [`Work out the missing sides from the opposite sides.`, `Add all six sides: **${P2} cm**`], { fig: Fig.gridShape(s.poly, { labels: shown, grid: false, scale: m }) });
  };
  const rectPerim = (l) => {
    const [a, b] = at(l, [[int(3, 8), int(2, 5)], [int(6, 15), int(3, 9)], [int(12, 40), int(8, 25)], [int(30, 90), int(15, 60)], [int(45, 150), int(20, 90)]]), unit = l <= 2 ? 'cm' : 'm';
    const L = Math.max(a, b + 1), W = Math.min(b, L - 1);
    return mk(`A rectangle is ${L} ${unit} by ${W} ${unit}. What is its **perimeter**?`, `${2 * (L + W)} ${unit}`, [`${L * W} ${unit}`, `${L + W} ${unit}`, `${2 * L + W} ${unit}`, `${4 * L} ${unit}`], [`${L} + ${W} + ${L} + ${W} = **${2 * (L + W)} ${unit}**`]);
  };
  const rectArea = (l) => {
    const [a, b] = at(l, [[int(3, 6), int(2, 5)], [int(6, 12), int(3, 9)], [int(11, 25), int(6, 19)], [int(24, 60), int(12, 30)], [int(45, 120), int(25, 60)]]), unit = l <= 2 ? 'cm' : 'm';
    const L = Math.max(a, b + 1), W = Math.min(b, L - 1);
    return mk(`A rectangle is ${L} ${unit} by ${W} ${unit}. What is its **area**?`, `${L * W} ${unit}²`, [`${2 * (L + W)} ${unit}²`, `${L + W} ${unit}²`, `${L * W + 10} ${unit}²`, `${L * (W + 1)} ${unit}²`], [`Area = length × width = ${L} × ${W} = **${L * W} ${unit}²**`]);
  };
  const squareQ = (l) => {
    const s = at(l, [int(2, 6), int(6, 20), int(12, 40), int(5, 12), int(11, 25)]);
    if (l <= 3) return mk(`A square has a **perimeter** of ${4 * s} cm. One side = ?`, `${s} cm`, [`${2 * s} cm`, `${4 * s - 4} cm`, `${s + 4} cm`, `${s * s} cm`], [`4 equal sides: ${4 * s} ÷ 4 = **${s} cm**`]);
    if (l === 4) return mk(`A square has an area of ${s * s} cm². What is its **perimeter**?`, `${4 * s} cm`, [`${2 * s} cm`, `${s * s} cm`, `${4 * s + 4} cm`, `${s} cm`], [`Side = ${s} cm because ${s} × ${s} = ${s * s}.`, `4 × ${s} = **${4 * s} cm**`]);
    return mk(`A square has an **area** of ${s * s} cm². Double each side. **New area** = ?`, `${4 * s * s} cm²`, [`${2 * s * s} cm²`, `${s * s + 2 * s} cm²`, `${8 * s} cm²`, `${s * s * 3} cm²`], [`Side = ${s} cm, new side = ${2 * s} cm.`, `${2 * s} × ${2 * s} = **${4 * s * s} cm²**`]);
  };
  const missingSide = (l) => {
    if (l >= 4) { const w = int(5, 15), len = w + int(2, 15), A = len * w; return mk(`Rectangle: **area** ${A} cm², length ${len} cm. **Perimeter** = ?`, `${2 * (len + w)} cm`, [`${len + w} cm`, `${w} cm`, `${2 * len + w} cm`, `${A} cm`], [`Width: ${A} ÷ ${len} = ${w} cm`, `2 × (${len} + ${w}) = **${2 * (len + w)} cm**`]); }
    const a = at(l, [int(3, 8), int(5, 20), int(8, 30)]), b = a + int(1, 12), P2 = 2 * (a + b);
    return mk(`Rectangle: **perimeter** ${P2} cm. One side is ${a} cm. Other side = ?`, `${b} cm`, [`${P2 - a} cm`, `${P2 - 2 * a} cm`, `${P2 / 2} cm`, `${b + a} cm`], [`${P2} − ${a} − ${a} = ${P2 - 2 * a}`, `${P2 - 2 * a} ÷ 2 = **${b} cm**`]);
  };
  const fenceCost = (l) => {
    const a = int(8, 20), b = int(5, a - 1), price = pick([3, 4, 5, 6]);
    return mk(`A fence goes all around a field **${a} m** by **${b} m**. **£${price}** for each metre. Total cost?`, `£${2 * (a + b) * price}`, [`£${a * b * price}`, `£${(a + b) * price}`, `£${2 * (a + b)}`, `£${(2 * (a + b) + price) * price}`], [`Distance round the edge: 2 × (${a} + ${b}) = ${2 * (a + b)} m`, `${2 * (a + b)} × £${price} = **£${2 * (a + b) * price}**`]);
  };
  const bestRect = (l) => {
    if (l === 5) { const P2 = pick([16, 20, 24, 28, 32, 36]), h = P2 / 2, best = (h / 2) * (h / 2); return mk(`Rectangle: **perimeter** ${P2} cm. What is the **biggest** area it can have?`, `${best} cm²`, [`${best - 4} cm²`, `${h * (h - 1) - 0} cm²`, `${P2 * 2} cm²`, `${best + 8} cm²`], [`Sides add up to ${h}. The closest to a square is ${h / 2} by ${h / 2}.`, `${h / 2} × ${h / 2} = **${best} cm²**`]); }
    const set = new Set(); while (set.size < 4) set.add(`${int(3, 9)} by ${int(3, 9)}`);
    const arr = [...set], area = (s) => s.split(' by ').reduce((a, b) => a * b, 1), vals = arr.map(area), mx = Math.max(...vals);
    if (vals.filter((v) => v === mx).length > 1) return bestRect(l);
    const right = arr[vals.indexOf(mx)];
    return { q: 'Which rectangle has the **largest area**? (sides in cm)', opts: [right, ...arr.filter((s) => s !== right)], steps: arr.map((s) => `${s}: ${area(s)} cm²`).concat([`Largest: **${right}**`]) };
  };

  /* =====================================================  fractions (Y6 units 4-5)  ===================================================== */
  const equiv = (l) => {
    const pairs = at(l, [[[1, 2], [1, 3], [1, 4]], [[1, 2], [2, 3], [3, 4], [1, 5]], [[2, 5], [3, 5], [5, 6], [3, 8]], [[3, 4], [5, 8], [7, 10], [4, 9]], [[5, 12], [7, 9], [11, 15], [9, 14]]]);
    const [a, b] = pick(pairs), k = at(l, [pick([2, 3]), pick([2, 3, 4]), pick([3, 4, 5]), pick([4, 5, 6]), pick([6, 7, 8])]);
    const toTop = chance(0.5);
    if (toTop) return mk(`${F(a, b)} = ${F('□', b * k)}`, a * k, [a + k, a * k + 1, b * k, a * k - 1 > 0 ? a * k - 1 : a * k + 2], [`${b} × ${k} = ${b * k}, so multiply the top by ${k} too.`, `${a} × ${k} = **${a * k}**`]);
    return mk(`${F(a * k, b * k)} = ${F(a, '□')}`, b, [b * k, b + k, b + 1, b - 1 > 0 ? b - 1 : b + 2], [`Divide the top by ${k}: ${a * k} ÷ ${k} = ${a}.`, `Divide the bottom by ${k} too: **${b}**`]);
  };
  const simplify = (l) => {
    const pairs = at(l, [[[1, 2], [1, 3]], [[1, 2], [2, 3], [1, 4]], [[3, 4], [2, 5], [3, 5], [5, 6]], [[3, 8], [5, 8], [7, 8], [4, 9], [7, 10]], [[5, 12], [7, 12], [11, 12], [8, 15], [9, 16]]]), [a, b] = pick(pairs), k = at(l, [2, 2, 3, int(3, 6), int(4, 9)]);
    const A = a * k, B = b * k;
    return mk(`Simplify ${F(A, B)} fully.`, F(a, b), [F(a + 1, b), F(a, b + 1), F(a + 1, b + 1), a > 1 ? F(b, a) : F(a, b * 2)], [`Divide top and bottom by ${k}.`, `${F(A, B)} = ${F(a, b)}`]);
  };
  const compareFrac = (l) => {
    const dens = at(l, [[2, 4], [2, 3, 6], [3, 4, 6, 8], [5, 8, 10, 12], [7, 9, 12, 14]]);
    let a, b, c, d, guard = 100;
    do { b = pick(dens); d = pick(dens); a = int(1, b - 1); c = int(1, d - 1); guard--; } while (guard > 0 && (a / b === c / d || (b === d && l > 1) || BC.gcd(a, b) > 1 || BC.gcd(c, d) > 1));
    const bigger = a / b > c / d ? F(a, b) : F(c, d), smaller = a / b > c / d ? F(c, d) : F(a, b);
    return { q: `Which fraction is **bigger**: ${F(a, b)} or ${F(c, d)}?`, opts: [bigger, smaller, 'They are equal', 'You cannot tell'], steps: [`Write both with the same denominator, ${BC.lcm(b, d)}:`, `${F(a * BC.lcm(b, d) / b, BC.lcm(b, d))} and ${F(c * BC.lcm(b, d) / d, BC.lcm(b, d))}`, `The bigger one is **${bigger}**`] };
  };
  const toMixed = (l) => {
    const d = at(l, [[2], [3, 4], [5, 6], [7, 8], [9, 10, 12]]), den = pick(d), w = int(1, l >= 4 ? 9 : 4), r = int(1, den - 1), num = w * den + r;
    if (BC.gcd(r, den) !== 1 && l < 5) return toMixed(l);
    if (chance(0.5)) return mkF(`Write ${F(num, den)} as a mixed number.`, mixed(num, den), [`[[${w + 1} ${r}/${den}]]`, `[[${w} ${den - r}/${den}]]`, `[[${w > 1 ? w - 1 : w + 2} ${r}/${den}]]`, `[[${w + 2} ${r}/${den}]]`], [`${num} ÷ ${den} = ${w} remainder ${r}`, `${F(num, den)} = **${mixed(num, den)}**`]);
    return mk(`Write [[${w} ${r}/${den}]] as an improper fraction.`, F(num, den), [F(w + r, den), F(w * r + den, den), F(num + 1, den), F(num, den + 1)], [`${w} × ${den} = ${w * den}, then add ${r}: ${num}`, `**${F(num, den)}**`]);
  };
  const addFrac = (l) => {
    const sub = l >= 2 && chance(0.4);
    if (l === 1) { const b = pick([4, 5, 6, 8, 10]), a1 = int(1, b - 2), a2 = int(1, b - a1 - 1); return mkF(`${F(a1, b)} + ${F(a2, b)} = ?`, mixed(a1 + a2, b), [F(a1 + a2, b * 2), F(a1 + a2 + 1, b), F(a1 + a2, 1 + b), F(a1 * a2, b)], [`Same denominator: add the tops.`, `${a1} + ${a2} = ${a1 + a2}`, `**${mixed(a1 + a2, b)}**`]); }
    const pairs = at(l, [[], [[2, 4], [3, 6], [4, 8], [5, 10]], [[2, 6], [3, 12], [4, 12], [2, 8]], [[3, 4], [2, 5], [3, 8], [4, 6], [5, 6]], [[3, 4], [5, 6], [2, 9], [7, 10], [4, 15]]]);
    const [b1, b2] = pick(pairs), den = BC.lcm(b1, b2), a1 = int(1, b1 - 1), a2 = int(1, b2 - 1);
    const x = a1 * den / b1, y = a2 * den / b2;
    if (sub && x === y) return addFrac(l);
    const big = Math.max(x, y), small = Math.min(x, y), num = sub ? big - small : x + y;
    const fA = x >= y ? F(a1, b1) : F(a2, b2), fB = x >= y ? F(a2, b2) : F(a1, b1);
    const op = sub ? '−' : '+';
    return mkF(`${sub ? fA : F(a1, b1)} ${op} ${sub ? fB : F(a2, b2)} = ?`, mixed(num, den), [F(sub ? Math.abs(a1 - a2) : a1 + a2, sub ? Math.abs(b1 - b2) || b1 : b1 + b2), mixed(num + 1, den), F(num, den * 2), mixed(num + den, den)], [`Common denominator: ${den}`, `${F(x, den)} ${op} ${F(y, den)}`, `**${mixed(num, den)}**`]);
  };
  const fracOfAmount = (l) => {
    const b = at(l, [pick([2, 4]), pick([3, 4, 5]), pick([5, 6, 8]), pick([6, 7, 8, 9]), pick([7, 8, 9, 12])]), a = int(1, b - 1);
    if (BC.gcd(a, b) !== 1) return fracOfAmount(l);
    const N = b * int(l >= 4 ? 8 : 3, l >= 4 ? 24 : 10), r = N / b * a;
    return mkF(`What is ${F(a, b)} of ${n(N)}?`, n(r), [n(N / b), n(N - r), n(N * a), n(r + a)], [`${n(N)} ÷ ${b} = ${n(N / b)}`, `${n(N / b)} × ${a} = **${n(r)}**`]);
  };
  const fracWhole = (l) => {
    const b = at(l, [2, 3, 4, 5, pick([6, 8, 9])]), a = l === 1 ? 1 : int(2, b - 1);
    if (BC.gcd(a, b) !== 1) return fracWhole(l);
    const whole = b * int(3, 12) * (l >= 4 ? 2 : 1), part = whole / b * a;
    return mkF(`${F(a, b)} of a number is ${n(part)}. What is the number?`, n(whole), [n(part / a), n(part * b), n(part + a), n(whole - b)], [`${n(part)} ÷ ${a} = ${n(part / a)} (that is ${F(1, b)})`, `${n(part / a)} × ${b} = **${n(whole)}**`]);
  };
  const fracTimesWhole = (l) => {
    const b = at(l, [pick([2, 3]), pick([3, 4, 5]), pick([4, 5, 6, 7]), pick([5, 6, 7, 8]), pick([7, 8, 9, 11])]), a = int(1, b - 1), k = at(l, [2, 3, int(3, 5), int(4, 7), int(5, 9)]);
    if (BC.gcd(a, b) !== 1 || (a * k) % b === 0) return fracTimesWhole(l);
    const right = mixed(a * k, b);
    return mkF(`${F(a, b)} × ${k} = ?`, right, [F(a * k, b * k), F(a, b * k), mixed(a + k, b), F(a, b + k)], [`Multiply the top: ${a} × ${k} = ${a * k}`, `${F(a * k, b)} = **${right}**`]);
  };
  const fracTimesFrac = (l) => {
    const b1 = pick(at(l, [[2, 3], [2, 3, 4], [3, 4, 5], [4, 5, 6, 8], [5, 6, 7, 9]])), b2 = pick([2, 3, 4, 5, 6, 8].filter((x) => x !== b1)), a1 = int(1, b1 - 1), a2 = int(1, b2 - 1);
    const num = a1 * a2, den = b1 * b2, right = mixed(num, den);
    return mkF(`${F(a1, b1)} × ${F(a2, b2)} = ?`, right, [F(a1 + a2, b1 + b2), F(a1 * a2, b1 + b2), F(a1 * b2, b1 * a2), F(num + 1, den)], [`Top × top: ${a1} × ${a2} = ${num}`, `Bottom × bottom: ${b1} × ${b2} = ${den}`, `${F(num, den)}${right !== F(num, den) ? ' = ' + right : ''} → **${right}**`]);
  };
  const fracDivWhole = (l) => {
    const b = pick(at(l, [[2, 3], [2, 3, 4], [3, 4, 5], [4, 5, 6, 8], [5, 6, 7, 9]])), a = int(1, b - 1), k = at(l, [2, 2, 3, int(3, 5), int(4, 7)]);
    if (BC.gcd(a, b) !== 1) return fracDivWhole(l);
    const right = mixed(a, b * k);
    return mkF(`${F(a, b)} ÷ ${k} = ?`, right, [mixed(a * k, b), F(a, b + k), F(a, b), F(a, k)], [`Share ${F(a, b)} into ${k} equal parts: each part is ${k} times smaller.`, `${F(a, b * k)}${right !== F(a, b * k) ? ' = ' + right : ''} → **${right}**`]);
  };
  const fracStory = (l) => {
    const N = pick([24, 36, 48, 60, 72]), keep = pick([[1, 3], [1, 4]]), give = pick([[1, 2], [3, 4], [5, 8], [2, 3]]), nm = pick(NAMES);
    const kept = N * keep[0] / keep[1], rest = N - kept;
    if ((rest * give[0]) % give[1] !== 0) return fracStory(l);
    const gave = rest * give[0] / give[1], left = rest - gave;
    return mkF(`${nm} has **${N}** biscuits. ${nm} eats ${F(...keep)}, then gives away ${F(...give)} of the rest. How many are left?`, left, [gave, kept, rest, left + kept], [`Eats ${F(...keep)} of ${N} = ${kept}, so ${rest} are left.`, `Gives away ${F(...give)} of ${rest} = ${gave}`, `${rest} − ${gave} = **${left}**`]);
  };

  /* =====================================================  position and direction (Y6 unit 6)  ===================================================== */
  const coordRead = (l) => {
    const q4 = l >= 3, rng = at(l, [4, 6, 6, 7, 8]);
    let x, y; do { x = int(q4 ? -rng : 1, rng); y = int(q4 ? -rng + 1 : 1, rng - 1); } while (!x || !y || Math.abs(x) === Math.abs(y));
    const lim = rng + 1;
    return mk('What are the coordinates of point A?', P(x, y), [P(y, x), P(-x, y), P(x, -y), P(-y, -x)], ['Across first (x), then up or down (y).', `A = **${P(x, y)}**`], { fig: Fig.coords(q4 ? -lim : 0, lim, q4 ? -lim + 1 : 0, lim, [{ x, y, label: 'A' }]) });
  };
  const translateQ = (l) => {
    const x = int(l >= 3 ? -5 : 0, 6), y = int(l >= 3 ? -5 : 0, 6), dx = at(l, [int(1, 3), int(2, 4), int(2, 7), int(3, 9), int(4, 11)]), dy = at(l, [0, int(1, 3), int(2, 7), int(3, 9), int(4, 11)]);
    const L = l >= 3 && chance(0.5), D = l >= 3 && chance(0.5), nx = L ? x - dx : x + dx, ny = D ? y - dy : y + dy;
    return mk(`Point ${P(x, y)} is translated ${dx} ${L ? 'left' : 'right'}${dy ? ` and ${dy} ${D ? 'down' : 'up'}` : ''}. Where is it now?`, P(nx, ny), [P(ny, nx), P(L ? x + dx : x - dx, ny), P(nx, D ? y + dy : y - dy), P(nx + 1, ny)], [`Left/right changes x: ${n(x)} ${L ? '−' : '+'} ${dx} = ${n(nx)}`, dy ? `Up/down changes y: ${n(y)} ${D ? '−' : '+'} ${dy} = ${n(ny)}` : 'y stays the same.', `**${P(nx, ny)}**`]);
  };
  const reflectQ = (l) => {
    let x, y; do { x = int(l >= 4 ? -6 : 1, 6); y = int(l >= 4 ? -5 : 1, 5); } while (!x || !y || Math.abs(x) === Math.abs(y));
    const axis = l === 3 ? 'y' : pick(['x', 'y']), img = axis === 'y' ? [-x, y] : [x, -y];
    return mk(`Reflect ${P(x, y)} in the **${axis}-axis**. Where does it go?`, P(...img), [P(...(axis === 'y' ? [x, -y] : [-x, y])), P(-x, -y), P(y, x), P(x, y)], [axis === 'y' ? 'In the y-axis: x changes sign, y stays the same.' : 'In the x-axis: y changes sign, x stays the same.', `**${P(...img)}**`]);
  };
  const cornerQ = (l) => {
    const x1 = int(-6, 1), x2 = int(x1 + 3, 6), y1 = int(-5, 0), y2 = int(y1 + 2, 5), corners = [[x1, y1], [x2, y1], [x2, y2], [x1, y2]], miss = int(0, 3), shown = corners.filter((_, i) => i !== miss), [mx, my] = corners[miss];
    return mk('A, B and C are corners of a rectangle. Where is the **4th** corner?', P(mx, my), [P(my, mx), P(-mx, my), P(mx, -my), P(mx + 1, my)], ['Opposite sides of a rectangle are equal and straight.', `Take the x of one corner and the y of the other: **${P(mx, my)}**`], { fig: Fig.coords(-7, 7, -6, 6, shown.map((c, i) => ({ x: c[0], y: c[1], label: 'ABC'[i] }))) });
  };
  const distanceQ = (l) => {
    const horiz = chance(0.5), k = at(l, [int(2, 5), int(3, 8), int(4, 10), int(5, 12), int(6, 14)]), a = int(-4, 2);
    const fixed = int(-5, 5), p = horiz ? [a, fixed] : [fixed, a], q = horiz ? [a + k, fixed] : [fixed, a + k];
    return mk(`How far apart are the points ${P(...p)} and ${P(...q)}?`, `${k} units`, [`${k + 1} units`, `${k - 1} units`, `${Math.abs(p[0]) + Math.abs(q[0]) + Math.abs(p[1]) + Math.abs(q[1])} units`, `${k * 2} units`], [`They are on the same ${horiz ? 'row (same y)' : 'column (same x)'}.`, `Count the gap along the ${horiz ? 'x' : 'y'} values: **${k}**`]);
  };
  const midpointQ = (l) => {
    const x1 = int(-6, 2) * 2 / 2, y1 = int(-5, 3), dx = 2 * int(1, 4), dy = 2 * int(1, 3), x2 = x1 + dx, y2 = y1 + dy;
    return mk(`What are the coordinates of the point exactly half-way between ${P(x1, y1)} and ${P(x2, y2)}?`, P(x1 + dx / 2, y1 + dy / 2), [P(x2 - x1, y2 - y1), P(x1 + dx, y1 + dy), P(x1 + dx / 2 + 1, y1 + dy / 2), P(y1 + dy / 2, x1 + dx / 2)], [`Half-way across: ${n(x1)} and ${n(x2)} → ${n(x1 + dx / 2)}`, `Half-way up: ${n(y1)} and ${n(y2)} → ${n(y1 + dy / 2)}`, `**${P(x1 + dx / 2, y1 + dy / 2)}**`]);
  };

  /* =====================================================  the two pools' units  ===================================================== */
  const M = (f, from = 1, to = 5) => ({ f, lv: [from, to] });
  BC.Graded = {
    UNITS: {
      5: [
        { name: 'Place Value to 100,000', sub: 'UNIT 1', pages: [8, 32] },
        { name: 'Place Value to 1,000,000', sub: 'UNIT 2', pages: [33, 57] },
        { name: 'Add & Subtract', sub: 'UNIT 3', pages: [58, 89] },
        { name: 'Graphs & Tables', sub: 'UNIT 4', pages: [90, 107] },
        { name: 'Multiply & Divide', sub: 'UNIT 5', pages: [108, 139] },
        { name: 'Area & Perimeter', sub: 'UNIT 6', pages: [140, 175] },
      ],
      6: [
        { name: 'Place Value to 10 Million', sub: 'UNIT 1', pages: [8, 28] },
        { name: 'Four Operations 1', sub: 'UNIT 2', pages: [29, 60] },
        { name: 'Four Operations 2', sub: 'UNIT 3', pages: [61, 89] },
        { name: 'Fractions 1', sub: 'UNIT 4', pages: [90, 125] },
        { name: 'Fractions 2', sub: 'UNIT 5', pages: [126, 154] },
        { name: 'Position & Direction', sub: 'UNIT 6', pages: [155, 175] },
      ],
    },
    MAKERS: {
      5: [
        [ // unit 1: place value within 100,000
          M(() => G.digitValue(3), 1, 1), M(() => G.digitValue(4), 2, 3), M(() => G.digitValue(5), 3, 5), M(howMany(1000, false), 3, 4), M(howMany(10000, true), 5, 5),
          M(roundQ([[11, 99, [10]], [101, 999, [10, 100]], [1001, 9999, [100, 1000]], [10001, 99999, [1000, 10000]], [10001, 99999, [100, 1000, 10000]]]), 1, 4), M(roundEdge(1000, 100), 5, 5), M(roundEdge(10000, 1000), 5, 5),
          M(moreLess([[10, 99, [10]], [100, 999, [10, 100]], [1000, 9999, [100, 1000]], [10000, 98999, [1000, 10000]], [20000, 90000, [100, 1000, 10000]]])), M(orderQ(3, 0), 1, 1), M(orderQ(4, 0), 2, 2), M(orderQ(5, 3), 3, 3), M(orderQ(5, 4), 4, 5),
          M(composeQ(3, false), 1, 1), M(composeQ(4, false), 2, 2), M(composeQ(5, false), 3, 3), M(composeQ(5, true), 4, 5),
          M(seqQ([[100, 500, [10], false], [200, 900, [10, 100], false], [1000, 9000, [100, 1000], true], [10000, 70000, [1000, 10000], true], [30000, 90000, [1000, 10000, 100], true]])),
          M(romanQ([[1, 20], [20, 49], [50, 399], [400, 999], [1000, 2030]])),
        ],
        [ // unit 2: place value within 1,000,000
          M(() => G.digitValue(5), 1, 1), M(() => G.digitValue(6), 2, 5), M(howMany(100000, true), 3, 5),
          M(roundQ([[10001, 99999, [10000]], [10001, 99999, [1000, 10000]], [100001, 999999, [10000, 100000]], [100001, 999999, [1000, 10000, 100000]], [100001, 999999, [1000, 10000, 100000]]]), 1, 4), M(roundEdge(100000, 10000), 5, 5),
          M(moreLess([[10000, 99999, [10000]], [100000, 900000, [10000, 100000]], [100000, 900000, [1000, 10000, 100000]], [100000, 989999, [10000, 100000]], [10000, 989999, [1000, 10000, 100000]]])),
          M(orderQ(5, 0), 1, 1), M(orderQ(6, 0), 2, 2), M(orderQ(6, 3), 3, 3), M(orderQ(6, 4), 4, 5),
          M(composeQ(5, false), 1, 1), M(composeQ(6, false), 2, 3), M(composeQ(6, true), 4, 5),
          M(seqQ([[10000, 50000, [1000, 10000], false], [100000, 500000, [10000, 100000], false], [100000, 800000, [10000, 100000], true], [200000, 900000, [1000, 10000, 100000], true], [200000, 900000, [1000, 10000, 100000, 50000], true]])),
          M(neg), M(negOrder, 1, 5), M(midpoint([[10, 2], [100, 3], [1000, 4], [10000, 4], [10000, 9]])),
        ],
        [ // unit 3: addition and subtraction
          M(addCol), M(subCol), M(missing), M(addWord), M(estimate, 2, 5), M(inverse), M(mentalAdd),
        ],
        [ // unit 4: graphs and tables
          M(barRead), M(tableRead), M(lineRead), M(journey),
        ],
        [ // unit 5: multiplication and division
          M(factorOfQ), M(multipleOfQ), M(primeQ), M(squareCube), M(times10),
          M(mulQ([[2, 1], [2, 1], [3, 1], [4, 1], [3, 2]])), M(divQ([[2, 1], [2, 1], [3, 1], [4, 1], [3, 1, true]])), M(primeFactors, 3, 5), M(factorCount, 2, 5),
        ],
        [ // unit 6: area and perimeter
          M(gridArea), M(rectPerim), M(rectArea), M(squareQ), M(missingSide, 2, 5), M(fenceCost, 3, 5), M(bestRect, 3, 5),
        ],
      ],
      6: [
        [ // unit 1: place value within 10,000,000
          M(() => G.digitValue(5), 1, 1), M(() => G.digitValue(6), 2, 2), M(() => G.digitValue(7), 3, 5), M(howMany(1000000, true), 4, 5),
          M(roundQ([[10001, 99999, [10000]], [100001, 999999, [10000, 100000]], [1000001, 9999999, [100000, 1000000]], [1000001, 9999999, [10000, 100000, 1000000]], [1000001, 9999999, [1000, 10000, 100000, 1000000]]])), M(roundEdge(1000000, 100000), 5, 5),
          M(moreLess([[100000, 900000, [100000]], [1000000, 8000000, [100000, 1000000]], [1000000, 9000000, [10000, 100000, 1000000]], [1000000, 9890000, [100000, 1000000]], [1000000, 9890000, [10000, 100000, 1000000]]])),
          M(orderQ(6, 0), 1, 1), M(orderQ(7, 0), 2, 2), M(orderQ(7, 3), 3, 3), M(orderQ(7, 5), 4, 5),
          M(composeQ(6, false), 1, 2), M(composeQ(7, false), 3, 3), M(composeQ(7, true), 4, 5),
          M(neg), M(negOrder), M(midpoint([[100, 3], [1000, 4], [10000, 5], [100000, 5], [100000, 9]])),
          M(seqQ([[100000, 500000, [10000, 100000], false], [1000000, 5000000, [100000, 1000000], false], [1000000, 8000000, [100000, 1000000], true], [2000000, 9000000, [10000, 100000, 1000000], true], [2000000, 9000000, [10000, 100000, 250000], true]])),
        ],
        [ // unit 2: four operations (1)
          M(mulQ([[2, 1], [3, 1], [2, 2], [3, 2], [4, 2]])), M(divQ([[3, 1], [4, 1], [3, 2], [4, 2], [4, 2, true]])), M(wordMul), M(scaleFact, 3, 5), M(times10, 1, 5),
          M(estimate, 3, 5), M(missing, 3, 5), M(mentalAdd, 3, 5),
        ],
        [ // unit 3: four operations (2)
          M(orderOps), M(lcmHcf), M(primeQ), M(squareCube), M(factorCount), M(divisible), M(primeFactors, 3, 5), M(factorOfQ, 1, 5), M(multipleOfQ, 1, 5),
        ],
        [ // unit 4: fractions (1)
          M(equiv), M(simplify), M(compareFrac), M(toMixed), M(addFrac), M(fracOfAmount, 1, 3),
        ],
        [ // unit 5: fractions (2)
          M(fracTimesWhole), M(fracTimesFrac, 2, 5), M(fracDivWhole), M(fracOfAmount), M(fracWhole), M(fracStory, 4, 5),
        ],
        [ // unit 6: position and direction
          M(coordRead), M(translateQ), M(reflectQ, 3, 5), M(cornerQ, 3, 5), M(distanceQ), M(midpointQ, 4, 5),
        ],
      ],
    },
  };

  /* a maker for (year, unit index, level 1-5): a function that returns a fresh question, or null when the unit has nothing at that level */
  BC.Graded.makers = function (year, unit, lvl) {
    return BC.Graded.MAKERS[year][unit].filter((m) => lvl >= m.lv[0] && lvl <= m.lv[1]).map((m) => () => {
      for (let t = 0; t < 8; t++) {
        let it = null; try { it = m.f(lvl); } catch (e) { it = null; }
        if (it && it.opts && new Set(it.opts).size === 4 && it.opts.every((o) => o != null && !/NaN|undefined|Infinity/.test(String(o))) && !/NaN|undefined|Infinity/.test(String(it.q))) {
          const comma = (t) => String(t).replace(/(?<![\d,.])\d{4,}(?![\d,.])/g, (m) => n(+m));      // 3828 -> 3,828
          it.q = comma(it.q); it.opts = it.opts.map(comma); if (it.steps) it.steps = it.steps.map(comma);
          it.ref = `Unit ${unit + 1} · level ${lvl}`; it.graded = true; it.level = lvl;
          if (!it.steps || !it.steps.length) it.steps = [`The answer is **${it.opts[0]}**`];
          return it;
        }
      }
      return null;
    });
  };
})();
