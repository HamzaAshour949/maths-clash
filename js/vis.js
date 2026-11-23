/* Maths Clash picture questions: the Practice Books' diagrams with fresh numbers.
   Each maker returns { q, fig, opts:[right, ...3 wrong], steps, ref, small? }. small = fits the Tug of War panel. */
'use strict';
(function () {
  const { R, n } = BC, G = BC.Gen, Fig = BC.Fig;
  const F = (a, b) => BC.fr(a, b);
  const V = BC.Vis = {};
  const digitsOf = (v) => String(v).split('').map(Number);

  /* ---------- place value counters (Y5 p35 Q1, Y6 p9 Q2) ---------- */
  V.pvRead = (heads, ref) => () => {
    const nd = heads.length;
    let d;
    do {
      d = Array.from({ length: nd }, (_, i) => R.int(i === 0 ? 1 : 0, 8));
      if (R.chance(0.7)) d[R.int(1, nd - 2)] = 0;
    } while (d.filter((x) => x === 0).length > 2);
    const v = +d.join('');
    const sw = d.slice(); const i = R.int(0, nd - 2); [sw[i], sw[i + 1]] = [sw[i + 1], sw[i]];
    const noZero = d.filter((x, k) => k === 0 || x !== 0).join('');
    const plus = d.slice(); const j = R.int(1, nd - 1); plus[j] = (plus[j] + 1) % 10;
    return { q: 'What number do the counters show?', fig: Fig.pv(heads, d), ref,
      opts: G.mc(n(v), [n(+noZero), n(+sw.join('')), n(+plus.join(''))]),
      steps: [`Count the counters in each column: ${d.map((x, k) => `${x} ${heads[k]}`).join(', ')}`, `An empty column is a zero.`, `The number is **${n(v)}**`] };
  };

  /* ---------- arrow on a number line (Y5 p18 Q1, p38 Q1 · Y6 p16 Q4, p25) ---------- */
  V.lineArrow = (specs, ref) => () => {
    const [min, max, step, labels] = R.pick(specs);
    const nT = Math.round((max - min) / step);
    let k; do { k = R.int(1, nT - 1); } while (labels.some((l) => Math.abs(l - (min + k * step)) < step / 1000));
    const half = R.chance(0.25);
    const v = min + k * step + (half ? step / 2 : 0);
    const wrongStep = (labels[1] - labels[0]) / (Math.round((labels[1] - labels[0]) / step) + 2);
    return { q: 'What number is the arrow pointing to?', fig: Fig.line(min, max, step, labels, [{ v, label: '?' }]), ref,
      opts: G.mc(n(v), [n(v + step), n(v - step), n(Math.round(min + (v - min) / step * wrongStep)), n(v + step / 2)].filter((x) => x !== 'NaN')),
      steps: [`${n(labels[1] - labels[0])} is split into ${Math.round((labels[1] - labels[0]) / step)} equal steps: each step is ${n(step)}.`, `Count the steps from ${n(min)}: ${half ? `${k} and a half` : k} steps.`, `The arrow points to **${n(v)}**`] };
  };

  /* ---------- bar chart: towns (Y5 p19 Q5) ---------- */
  V.barTowns = () => {
    const cats = ['A', 'B', 'C', 'D'];
    const vals = cats.map(() => R.int(2, 11) * 5000);
    if (new Set(vals).size < 4) return V.barTowns();
    let x = R.int(0, 3), y = R.int(0, 3); while (y === x || vals[y] >= vals[x]) { x = R.int(0, 3); y = R.int(0, 3); }
    const d = vals[x] - vals[y];
    return { q: `How many more people live in town **${cats[x]}** than in town **${cats[y]}**?`, fig: Fig.bars('Population of local towns', cats, vals, 60000, 10000), ref: 'p. 19 Q5',
      opts: G.mc(n(d), [n(vals[x] + vals[y]), n(d + 5000), n(Math.abs(d - 5000) || 15000), n(d + 10000)]),
      steps: [`Read each bar: ${cats[x]} = ${n(vals[x])}, ${cats[y]} = ${n(vals[y])} (half-way between lines is 5,000)`, `${n(vals[x])} − ${n(vals[y])} = **${n(d)}**`] };
  };

  /* ---------- line graph: swimming pool (Y5 p96 Q1) ---------- */
  V.linePool = () => {
    const cats = ['9am', '10am', '11am', '12pm', '1pm'];
    const vals = cats.map(() => R.int(1, 11) * 5);
    let x = R.int(0, 4), y = R.int(0, 4); while (y === x || vals[y] >= vals[x]) { x = R.int(0, 4); y = R.int(0, 4); if (Math.max(...vals) === Math.min(...vals)) return V.linePool(); }
    const d = vals[x] - vals[y];
    return { q: `How many more people were in the pool at **${cats[x]}** than at **${cats[y]}**?`, fig: Fig.lineGraph('People at the swimming pool', cats, vals, 60, 10), ref: 'p. 96 Q1',
      opts: G.mc(d, [vals[x] + vals[y], d + 5, d + 10, vals[x]]),
      steps: [`${cats[x]}: ${vals[x]} people, ${cats[y]}: ${vals[y]} people`, `${vals[x]} − ${vals[y]} = **${d}**`] };
  };

  /* ---------- two-way table with a missing cell (Y5 p94 Q3) ---------- */
  V.tablePets = () => {
    const cols = ['Dogs', 'Cats', 'Fish'], shops = ['Shop A', 'Shop B', 'Shop C'];
    const m = shops.map(() => cols.map(() => R.int(4, 39)));
    const r = R.int(0, 2), c = R.int(0, 2), tot = m[r].reduce((s, v) => s + v, 0);
    const rows = [['', ...cols, 'Total'], ...shops.map((s, i) => [s, ...m[i].map((v, j) => (i === r && j === c ? '?' : String(v))), i === r ? String(tot) : String(m[i].reduce((a, b) => a + b, 0))])];
    const known = tot - m[r][c];
    return { q: `What is the missing number in the table?`, fig: Fig.table(rows), ref: 'p. 94 Q3',
      opts: G.mc(m[r][c], [tot + known, known, m[r][c] + 10, Math.abs(m[r][c] - 10) || 11]),
      steps: [`${shops[r]} has ${tot} pets in total.`, `The others in that row: ${m[r].filter((_, j) => j !== c).join(' + ')} = ${known}`, `${tot} − ${known} = **${m[r][c]}**`] };
  };

  /* ---------- arrays: factor pairs (Y5 p113, Y6 p64) ---------- */
  V.arrayPair = () => {
    let r = R.int(3, 8), c = R.int(4, 9); if (r === c) c++;
    return { q: 'The array shows a factor pair. It is a factor pair of which number?', fig: Fig.array(r, c), ref: 'p. 113 · factors', small: true,
      opts: G.mc(r * c, [r + c, (r + 1) * c, r * (c - 1), 2 * (r + c)]), steps: [`${r} rows of ${c}`, `${r} × ${c} = **${r * c}**`] };
  };
  V.squareDots = () => {
    const k = R.int(3, 9);
    return { q: 'Which square number does the picture show?', fig: Fig.array(k, k), ref: 'p. 120 · square numbers', small: true,
      opts: G.mc(k * k, [2 * k, k * k + k, (k + 1) * (k + 1), 4 * k]), steps: [`${k} rows of ${k}`, `${k}² = ${k} × ${k} = **${k * k}**`] };
  };
  V.cubeCount = (ref) => () => {
    const k = R.int(2, 5), vis = 3 * k * k - 3 * k + 1;
    return { q: 'How many small cubes make this big cube?', fig: Fig.cubes(k, k, k), ref, small: k <= 4,
      opts: G.mc(k ** 3, [vis, k * k, 3 * k * k, k * 3]), steps: [`${k} cubes long, ${k} wide, ${k} tall`, `Count the hidden cubes too: ${k} × ${k} × ${k} = **${k ** 3}**`, `(${vis} cubes can be seen from here.)`] };
  };

  /* ---------- perimeter of an L-shape with two sides missing (Y5 p146-147) ---------- */
  V.perimL = () => {
    const W = R.int(5, 9), H = R.int(4, 7), a = R.int(2, W - 2), b = R.int(1, H - 2), m = R.pick([1, 2, 5, 10]);
    const poly = [[0, 0], [W, 0], [W, H - b], [W - a, H - b], [W - a, H], [0, H]];
    const P = 2 * (W + H) * m, shown = [0, 1, 4, 5];
    const shownSum = (W + (H - b) + (W - a) + H) * m;
    return { q: 'What is the perimeter of this shape?', fig: Fig.gridShape(poly, { labels: new Set(shown), grid: false, scale: m }), ref: 'p. 147 Q2',
      opts: G.mc(`${P} cm`, [`${shownSum} cm`, `${(W * H - a * b) * m} cm`, `${P + 2 * b * m} cm`, `${P - 2 * m} cm`]),
      steps: [`Missing sides from the opposite sides: ${W * m} − ${(W - a) * m} = ${a * m} cm and ${H * m} − ${(H - b) * m} = ${b * m} cm`, `All six sides: ${W * m} + ${(H - b) * m} + ${a * m} + ${b * m} + ${(W - a) * m} + ${H * m}`, `= **${P} cm**`] };
  };

  /* ---------- area by counting squares (Y5 p150-152) ---------- */
  V.areaCount = () => {
    const W = R.int(4, 7), H = R.int(3, 5), a = R.int(1, W - 2), b = R.int(1, H - 1);
    const poly = [[0, 0], [W, 0], [W, H - b], [W - a, H - b], [W - a, H], [0, H]];
    const A = W * H - a * b, Pm = 2 * (W + H);
    return { q: 'Each square is 1 cm². What is the area of the shape?', fig: Fig.gridShape(poly, {}), ref: 'p. 152 Q1',
      opts: G.mc(`${A} cm²`, [`${Pm} cm²`, `${W * H} cm²`, `${A + 1} cm²`, `${A - 2} cm²`]),
      steps: [`Whole rectangle: ${W} × ${H} = ${W * H} squares`, `Take away the missing corner: ${a} × ${b} = ${a * b}`, `${W * H} − ${a * b} = **${A} cm²**`] };
  };
  V.areaScale = () => {
    const w = R.int(2, 6), h = R.int(2, 4), k = R.pick([2, 4, 5, 10]);
    const poly = [[0, 0], [w, 0], [w, h], [0, h]];
    return { q: `Each square is worth **${k} m²**. What is the area of the rectangle?`, fig: Fig.gridShape(poly, { cell: 60 }), ref: 'p. 150 Q2', small: true,
      opts: G.mc(`${w * h * k} m²`, [`${w * h} m²`, `${2 * (w + h) * k} m²`, `${w * h + k} m²`, `${(w + h) * k} m²`]),
      steps: [`${w} × ${h} = ${w * h} squares`, `${w * h} × ${k} = **${w * h * k} m²**`] };
  };

  /* ---------- bar model: part-whole (Y5 p82 Q1, p86 Q3) ---------- */
  V.partWhole = () => {
    const total = R.int(30, 90) * 1000, p1 = R.int(8000, Math.floor(total * 0.45)), p2 = R.int(3000, total - p1 - 3000), p3 = total - p1 - p2;
    return { q: 'What is the missing part of the bar model?', fig: Fig.partWhole(n(total), [{ v: p1, label: n(p1) }, { v: p2, label: n(p2) }, { v: p3, label: '?' }]), ref: 'p. 82 Q1',
      opts: G.mc(n(p3), [n(total + p1 + p2), n(total - p1), n(p3 + 1000), n(Math.abs(p3 - 1000))]),
      steps: [`${n(p1)} + ${n(p2)} = ${n(p1 + p2)}`, `${n(total)} − ${n(p1 + p2)} = **${n(p3)}**`] };
  };

  /* ---------- Venn: multiples and factors (Y5 p109 Q5, Y6 p65 Q3) ---------- */
  V.vennMF = (ref) => () => {
    for (let t = 0; t < 50; t++) {
      const m = R.pick([3, 4, 5, 6]), N = R.pick([24, 30, 36, 40, 48, 60]);
      const nums = Array.from({ length: 60 }, (_, i) => i + 2);
      const A = (v) => v % m === 0, B = (v) => N % v === 0;
      const both = nums.filter((v) => A(v) && B(v)), onlyA = nums.filter((v) => A(v) && !B(v)), onlyB = nums.filter((v) => !A(v) && B(v)), none = nums.filter((v) => !A(v) && !B(v) && v < 30);
      if (both.length < 2 || onlyA.length < 3 || onlyB.length < 3) continue;
      const right = R.pick(both), shownBoth = both.filter((v) => v !== right);
      const sa = R.shuffle(onlyA), sb = R.shuffle(onlyB);
      return { q: 'Which number belongs in the middle, where the **?** is?', fig: Fig.venn(`Multiples of ${m}`, `Factors of ${N}`, sa.slice(0, 2).map(String), ['?'], sb.slice(0, 2).map(String), [String(R.pick(none))]), ref,
        opts: G.mc(right, [sa[2], sb[2], R.pick(none), shownBoth.length ? sa[3] || 99 : 99].filter((v) => v !== undefined)),
        steps: [`The middle needs both: a multiple of ${m} AND a factor of ${N}.`, `${right} = ${m} × ${right / m} and ${N} ÷ ${right} = ${N / right}`, `So **${right}** goes in the middle.`] };
    }
    return V.squareDots();
  };

  /* ---------- fractions (Y6 Unit 4-5) ---------- */
  V.fracShaded = () => {
    const shapes = [[2, 4], [3, 4], [2, 5], [2, 6], [3, 3], [4, 4]];
    const circ = R.chance(0.4);
    let nParts, k;
    if (circ) { nParts = R.pick([6, 8, 10, 12]); } else { const [r, c] = R.pick(shapes); nParts = r * c; }
    do { k = R.int(1, nParts - 1); } while (BC.gcd(k, nParts) === 1);
    const fig = circ ? Fig.fracCircle(nParts, k) : (() => { const [r, c] = shapes.find(([a, b]) => a * b === nParts) || [1, nParts]; return Fig.fracRect(r, c, k); })();
    return { q: 'What fraction is shaded? Give it in its **simplest form**.', fig, ref: 'p. 90 · simplifying fractions', small: true,
      opts: G.mc(BC.mixed(k, nParts), [F(k, nParts), BC.mixed(nParts - k, nParts), F(k, nParts - k), BC.mixed(k + 1, nParts)]),
      steps: [`${k} of the ${nParts} equal parts are shaded: ${F(k, nParts)}`, `Divide top and bottom by ${BC.gcd(k, nParts)}`, `= **${BC.mixed(k, nParts)}**`] };
  };
  V.whichShows = () => {
    const [a, b] = R.pick([[1, 2], [3, 4], [2, 3], [1, 3], [3, 5], [2, 5], [1, 4]]);
    const m = R.pick([2, 3, b <= 3 ? 4 : 2]);
    const right = Fig.fracRect(1, b * m, a * m, 40);
    const wrongs = [];
    const used = new Set([`${a}/${b}`]);
    while (wrongs.length < 3) {
      const nn = R.pick([4, 5, 6, 8, 9, 10, 12]), kk = R.int(1, nn - 1);
      if (kk * b === a * nn) continue;
      const key = `${kk / BC.gcd(kk, nn)}/${nn / BC.gcd(kk, nn)}`;
      if (used.has(key)) continue;
      used.add(key); wrongs.push(Fig.fracRect(1, nn, kk, 40));
    }
    return { q: `Which diagram shows ${F(a, b)}?`, fig: null, ref: 'p. 96 · equivalent fractions', small: true, opts: [right, ...wrongs],
      steps: [`The right one has ${a * m} of ${b * m} parts shaded.`, `${F(a * m, b * m)} = ${F(a, b)} (divide top and bottom by ${m})`] };
  };
  V.barWhole = () => {
    const b = R.pick([3, 4, 5, 6, 8]), part = R.int(4, 25);
    const inner = Array.from({ length: b }, (_, i) => (i === 0 ? String(part) : ''));
    return { q: `${F(1, b)} of the animals in a field are sheep. The bar model shows the sheep. How many animals are in the field?`, fig: Fig.barModel(b, inner, '?', [0]), ref: 'p. 150 Q1',
      opts: G.mc(part * b, [part + b, part * (b - 1), part * b + part, part * b - b]), steps: [`One part is ${part}. There are ${b} equal parts.`, `${part} × ${b} = **${part * b}**`] };
  };
  V.barPart = () => {
    const b = R.pick([3, 4, 5, 6, 8]), a = R.int(2, b - 1), each = R.int(3, 15), N = b * each;
    if (BC.gcd(a, b) !== 1) return V.barPart();
    return { q: `What is ${F(a, b)} of ${N}? (The shaded parts.)`, fig: Fig.barModel(b, [], String(N), Array.from({ length: a }, (_, i) => i)), ref: 'p. 147 Q1', small: false,
      opts: G.mc(each * a, [each, N - each * a, each * (a + 1), N / a > 0 && Number.isInteger(N / a) ? N / a : each * b - a]),
      steps: [`${N} ÷ ${b} = ${each} in each part`, `${a} parts: ${each} × ${a} = **${each * a}**`] };
  };
  V.circleShare = () => {
    const k = R.pick([2, 4, 6, 8, 10]);
    const right = BC.mixed(k / 2, 12);
    return { q: `The shaded part (${F(k, 12)}) is shared equally between 2. What fraction of the circle does each get?`, fig: Fig.fracCircle(12, k), ref: 'p. 138 Q1', small: true,
      opts: G.mc(right, [BC.mixed(2 * k, 12), F(k / 2, 6) === right ? F(k, 6) : F(k / 2, 6), F(k, 2), BC.mixed(k + 2, 12)]),
      steps: [`${k} twelfths in 2 equal groups: ${k / 2} twelfths each`, `${F(k / 2, 12)} = **${right}**`] };
  };

  /* ---------- coordinates (Y6 Unit 6) ---------- */
  const P = (x, y) => `(${n(x)}, ${n(y)})`;
  V.coordRead = () => {
    let x, y; do { x = R.int(-6, 6); y = R.int(-5, 5); } while (!x || !y || Math.abs(x) === Math.abs(y));
    return { q: 'What are the coordinates of point A?', fig: Fig.coords(-7, 7, -6, 6, [{ x, y, label: 'A' }]), ref: 'p. 155 · coordinates',
      opts: G.mc(P(x, y), [P(y, x), P(-x, y), P(x, -y), P(-y, -x)]), steps: [`Across first: x = ${n(x)}`, `Then up or down: y = ${n(y)}`, `A = **${P(x, y)}**`] };
  };
  V.translate = () => {
    const dx = R.int(2, 6) * (R.chance(0.5) ? 1 : -1), dy = R.int(2, 5) * (R.chance(0.5) ? 1 : -1);
    if (Math.abs(dx) === Math.abs(dy)) return V.translate();
    const x0 = dx > 0 ? R.int(-7, -5) : R.int(2, 4), y0 = dy > 0 ? R.int(-5, -3) : R.int(1, 3);
    const tri = [[x0, y0], [x0 + 2, y0], [x0, y0 + 2]];
    const moved = tri.map(([x, y]) => [x + dx, y + dy]);
    const d = (h, v) => `${Math.abs(h)} ${h > 0 ? 'right' : 'left'}, ${Math.abs(v)} ${v > 0 ? 'up' : 'down'}`;
    return { q: 'Describe the translation from shape A to shape B.', fig: Fig.coords(-8, 8, -6, 6, [], [{ pts: tri, label: 'A' }, { pts: moved, label: 'B', fill: 'rgba(255,255,255,.12)', stroke: '#eef1ff' }]), ref: 'p. 161 · translations',
      opts: G.mc(d(dx, dy), [d(-dx, -dy), d(dy, dx), d(dx + Math.sign(dx), dy), d(dx, -dy)]),
      steps: [`Follow one corner of A to the same corner of B.`, `Across: ${Math.abs(dx)} ${dx > 0 ? 'right' : 'left'}, then ${Math.abs(dy)} ${dy > 0 ? 'up' : 'down'}`] };
  };
  V.reflect = () => {
    let x, y; do { x = R.int(-6, 6); y = R.int(-5, 5); } while (!x || !y || Math.abs(x) === Math.abs(y));
    const axis = R.pick(['y', 'x']);
    const img = axis === 'y' ? [-x, y] : [x, -y];
    return { q: `Point A is reflected in the **${axis}-axis**. What are the coordinates of its image?`, fig: Fig.coords(-7, 7, -6, 6, [{ x, y, label: 'A' }]), ref: 'p. 161 · reflections',
      opts: G.mc(P(...img), [P(...(axis === 'y' ? [x, -y] : [-x, y])), P(-x, -y), P(y, x), P(x, y)]),
      steps: [`A = ${P(x, y)}`, axis === 'y' ? 'In the y-axis: x changes sign, y stays.' : 'In the x-axis: y changes sign, x stays.', `Image = **${P(...img)}**`] };
  };
  V.fourthCorner = () => {
    const x1 = R.int(-6, 1), x2 = R.int(x1 + 3, 6), y1 = R.int(-5, 0), y2 = R.int(y1 + 2, 5);
    const corners = [[x1, y1], [x2, y1], [x2, y2], [x1, y2]];
    const miss = R.int(0, 3), shown = corners.filter((_, i) => i !== miss);
    const [mx, my] = corners[miss];
    return { q: 'A, B and C are three corners of a rectangle. Where is the fourth corner?', fig: Fig.coords(-7, 7, -6, 6, shown.map((c, i) => ({ x: c[0], y: c[1], label: 'ABC'[i] }))), ref: 'p. 165 Q4',
      opts: G.mc(P(mx, my), [P(my, mx), P(-mx, my), P(mx, -my), P(mx + 1, my)]),
      steps: ['Opposite sides of a rectangle are equal and straight.', `Take the x of one corner and the y of the other: **${P(mx, my)}**`] };
  };
  V.rectAreaFrac = () => {
    const L = R.int(2, 6), d = R.pick([3, 4, 5, 8]), a = R.int(1, d - 1);
    if (BC.gcd(a, d) !== 1) return V.rectAreaFrac();
    const fig = Fig.rectFrac(`${L} m`, [a, d, 'm']);
    return { q: `The rectangle is ${L} m long and ${F(a, d)} m wide. What is its area?`, fig, ref: 'p. 144 Q2',
      opts: G.mc(`${BC.mixed(L * a, d)} m²`, [`${BC.mixed(L * d + a, d)} m²`, `${BC.mixed(2 * (L * d + a), d)} m²`, `${F(a, L * d)} m²`, `${BC.mixed(L * a + 1, d)} m²`]),
      steps: [`Area = length × width`, `${L} × ${F(a, d)} = ${F(L * a, d)}`, `= **${BC.mixed(L * a, d)} m²**`] };
  };

  /* ---------- lists per year ---------- */
  V.Y5 = [
    V.pvRead(['HTh', 'TTh', 'Th', 'H', 'T', 'O'], 'p. 35 Q1'),
    V.lineArrow([[20000, 30000, 1000, [20000, 30000]], [300000, 400000, 10000, [300000, 400000]], [200000, 600000, 50000, [200000, 400000, 600000]], [0, 1000000, 100000, [0, 1000000]], [9000, 10000, 100, [9000, 10000]]], 'p. 38 Q1'),
    V.barTowns, V.linePool, V.tablePets, V.arrayPair, V.squareDots, V.cubeCount('p. 124 · cube numbers'),
    V.perimL, V.areaCount, V.areaScale, V.partWhole, V.vennMF('p. 109 Q5'),
  ];
  V.Y6 = [
    V.pvRead(['M', 'HTh', 'TTh', 'Th', 'H', 'T', 'O'], 'p. 9 Q2'),
    V.lineArrow([[0, 10000000, 1000000, [0, 10000000]], [6000000, 7000000, 100000, [6000000, 7000000]], [-10, 10, 1, [-10, 0, 10]], [-50, 50, 10, [-50, 0, 50]], [-20, 20, 2, [-20, 0, 20]]], 'p. 16 Q4'),
    V.fracShaded, V.whichShows, V.barWhole, V.barPart, V.circleShare, V.cubeCount('p. 70 · cube numbers'),
    V.coordRead, V.translate, V.reflect, V.fourthCorner, V.rectAreaFrac, V.vennMF('p. 65 Q3'), V.arrayPair,
  ];
  /* the year pools (data-y5.js, data-y6.js) choose which of these makers they use */
})();
