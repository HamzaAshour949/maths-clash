/* Year 6 competition pool: ONLY the Challenge and Power puzzle questions of Power Maths Practice Book 6A
   (photos of 19 Nov 2026; answers in "Year 6/Books/Challenges and Power Challenges"). Fixed items use the book's numbers;
   "twin" makers ask the same question with new numbers for the rapid rounds. In every list the RIGHT answer is first.
   Left out: p119 Q6 and p146 Q6 (their numbers cannot be read in the photos). */
'use strict';
(function () {
  const G = BC.Gen, Fig = BC.Fig, V = BC.Vis, { R, n } = BC;
  const F = (a, b) => BC.fr(a, b), M = (a, b) => BC.mixed(a, b);
  const P2 = (x, y) => `(${n(x)}, ${n(y)})`;
  BC.DATA = BC.DATA || {};

  /* ---------------- twins: the Challenge types with new numbers ---------------- */
  const T = {
    nines() { // p31a
      const y = R.int(100000, 999999) * (R.chance(0.5) ? 1 : 10) % 9999999, r = 9999999 - y;
      return { q: `9,999,999 − □ = ${n(y)}`, opts: G.mc(n(r), [n(y), n(10000000 - y), n(r - 1), n(9999999 + y)]), steps: ['Use the inverse: 9,999,999 − the answer', `= **${n(r)}**`], ref: 'p. 31 · twin' };
    },
    whole() { // p31b
      const a = R.int(300000, 950000), b = R.int(20000, 90000);
      return { q: `□ − ${n(a)} = ${n(b)}`, opts: G.mc(n(a + b), [n(a - b), n(a + b + 10000), n(a + b - 1000), n(b - a < 0 ? a - b + 10000 : b - a)]), steps: ['The missing number is the whole: add the parts.', `${n(a)} + ${n(b)} = **${n(a + b)}**`], ref: 'p. 31 · twin' };
    },
    bella() { // p34
      const b1 = R.int(10, 30) * 1000 + R.int(1, 9) * 100, b2 = R.int(10, 30) * 1000 + R.int(1, 9) * 100, B = b1 + b2, d = R.int(Math.floor(B / 2000), Math.floor(B / 1100)) * 1000 + 250;
      return { q: `Bella scores ${n(b1)} then ${n(b2)} points. Amelia scores ${n(d)} fewer than Bella. How many points altogether?`, opts: G.mc(n(2 * B - d), [n(B), n(B - d), n(2 * B + d), n(B + d)]), steps: [`Bella: ${n(B)}`, `Amelia: ${n(B - d)}`, `Total: **${n(2 * B - d)}**`], ref: 'p. 34 · twin' };
    },
    missDiv() { // p49
      const d = R.int(12, 39), q = R.int(12, 39), a = d * q;
      return { q: `${n(a)} ÷ □ = ${q}`, opts: G.mc(d, [d + 1, d - 1, q === d ? d + 2 : q, d + 10]), steps: [`Use the inverse: ${n(a)} ÷ ${q}`, `${q} × ${d} = ${n(a)}, so □ = **${d}**`], ref: 'p. 49 · twin' };
    },
    rem() { // p55
      const d = R.int(13, 49), k = R.int(2, 9), r = d * k + d - 1;
      return { q: `Which number leaves a remainder of **${d - 1}** when it is divided by ${d}?`, opts: G.mc(r, [d * k, d * k + 1, d * k + d - 2, r + 2]), steps: [`One less than a multiple of ${d}.`, `${d} × ${k + 1} − 1 = **${r}**`], ref: 'p. 55 · twin' };
    },
    doubleBoth() { // p46
      const b = R.int(4, 12), q = R.int(20, 90), a = b * q;
      return { q: `${n(a)} ÷ ${b} = ${q}. What is ${n(2 * a)} ÷ ${2 * b}?`, opts: G.mc(q, [q / 2, 2 * q, q / 4, q + 2].filter((v) => Number.isInteger(v))), steps: ['Doubling both numbers keeps the answer the same.', `${n(2 * a)} ÷ ${2 * b} = **${q}**`], ref: 'p. 46 · twin' };
    },
    halve() { // p52
      const b = R.int(11, 41), q = 2 * R.int(10, 45), a = b * q;
      return { q: `${n(a)} ÷ ${b} = ${q}. What is ${n(a)} ÷ ${2 * b}?`, opts: G.mc(q / 2, [2 * q, q, q / 2 + 1, q - 2]), steps: ['Double the number you divide by → the answer halves.', `${q} ÷ 2 = **${q / 2}**`], ref: 'p. 52 · twin' };
    },
    workBack() { // p84
      const S = R.int(130, 480) * 1000 + R.int(1, 9) * 100, Fv = (S + 100) * 2 - 250000;
      return { q: `I add 100, double it, then subtract a quarter of a million. I get ${n(Fv)}. What was my number?`, opts: G.mc(n(S), [n((Fv + 250000) / 2), n(Fv / 2 + 250000), n(S + 200), n((Fv - 250000) / 2)]), steps: [`${n(Fv)} + 250,000 = ${n(Fv + 250000)}`, `÷ 2 = ${n((Fv + 250000) / 2)}`, `− 100 = **${n(S)}**`], ref: 'p. 84 · twin' };
    },
    fracMiss() { // p92
      const [p, q] = R.pick([[2, 3], [3, 4], [2, 5], [3, 5], [4, 5], [5, 6]]), k = R.int(3, 7), b = R.int(2, q * k - 2), c = q * k - b, a = R.int(1, p * k - 1), x = p * k - a;
      return { q: `((${a} + □|${b} + ${c})) = [[${p}/${q}]]`, opts: G.mc(x, [p * k, x + 1, x + p, Math.abs(x - p) || x + 3]), steps: [`The bottom is ${q * k} = ${q} × ${k}`, `So the top is ${p} × ${k} = ${p * k}`, `${a} + **${x}** = ${p * k}`], ref: 'p. 92 · twin' };
    },
    jamie() { // p110
      const d1 = R.pick([3, 4, 5, 6]), d2 = R.pick([7, 8, 9, 10].filter((v) => v % d1)), w1 = R.int(15, 25), a1 = R.int(1, d1 - 1), w2 = R.int(5, w1 - 4), a2 = R.int(1, d2 - 1);
      if (BC.gcd(a1, d1) !== 1 || BC.gcd(a2, d2) !== 1) return T.jamie();
      const L = BC.lcm(d1, d2), tot = (w1 * d1 + a1) * (L / d1), part = (w2 * d2 + a2) * (L / d2), r = tot - part;
      return { q: `Two numbers add to [[${w1} ${a1}/${d1}]]. One is [[${w2} ${a2}/${d2}]]. What is the other?`, opts: G.mc(M(r, L), [M(r + L, L), M(tot + part, L), M(r + 1, L), M(r - 1, L)]), steps: [`Use the inverse: [[${w1} ${a1}/${d1}]] − [[${w2} ${a2}/${d2}]]`, `= **${M(r, L)}**`], ref: 'p. 110 · twin' };
    },
    biscuits() { // p149
      const m = R.int(4, 12) * 2, N = 3 * m, rem = 2 * m, [a, b] = R.pick([[1, 2], [3, 4], [1, 4], [5, 8], [3, 8]].filter(([, bb]) => rem % bb === 0));
      if (!b) return T.biscuits();
      const dad = rem / b * a, mum = rem - dad;
      return { q: `Amelia bakes ${N} biscuits and keeps [[1/3]]. She gives [[${a}/${b}]] of the rest to her dad and the rest to her mum. How many does mum get?`, opts: G.mc(mum, [dad, m, rem, mum + m].filter((v) => v > 0)), steps: [`Keeps ${m}, ${rem} left`, `Dad: [[${a}/${b}]] of ${rem} = ${dad}`, `Mum: **${mum}**`], ref: 'p. 149 · twin' };
    },
    pages() { // p152b
      const left = R.int(3, 12) * 3, tot = left * 10 / 3;
      return { q: `Lee reads [[1/4]] of a book, then [[3/5]] of the remaining pages. He has ${left} pages left. How many pages?`, opts: G.mc(tot, [left * 20 / 3, left * 4, left * 5, tot + 10]), steps: ['After Monday [[3/4]] is left; he reads [[3/5]] of it, so [[2/5]] of [[3/4]] = [[3/10]] is left.', `[[3/10]] = ${left}, so the book = **${tot}** pages`], ref: 'p. 152 · twin' };
    },
    maxSimp() { // p140
      const [p, q] = R.pick([[2, 9], [7, 30], [3, 8], [1, 6], [3, 10], [5, 12]]), k = R.pick([2, 3, 4]), D = R.pick([q * 2, q * 3, q * 4]), x = p * k * D / q;
      if (!Number.isInteger(x)) return T.maxSimp();
      return { q: `[[□/${D}]] ÷ ${k} = [[${p}/${q}]]`, opts: G.mc(x, [p * D / q, x + k, p * k, x / k * (k + 1)].filter((v) => Number.isInteger(v))), steps: [`[[${p}/${q}]] = [[${p * D / q}/${D}]]`, `× ${k} gives the top: **${x}**`], ref: 'p. 140 · twin' };
    },
    fence() { // p113
      const w = R.int(2, 5), wa = R.pick([1, 3]), l = R.int(5, 9), la = R.pick([1, 3, 7, 9]), pack = R.pick([4, 5]);
      const per = 2 * (w + wa / 4 + l + la / 10), packs = Math.ceil(per / pack - 1e-9);
      return { q: `A garden is [[${w} ${wa}/4]] m by [[${l} ${la}/10]] m. Fencing comes in ${pack} m packs. How many packs for the whole edge?`, opts: G.mc(packs, [packs - 1, packs + 1, Math.ceil((w + l + 1) / pack), packs + 2].filter((v) => v > 0)), steps: [`Perimeter = 2 × ([[${w} ${wa}/4]] + [[${l} ${la}/10]]) = ${+per.toFixed(2)} m`, `${packs - 1} packs = ${(packs - 1) * pack} m is too short, so **${packs}**`], ref: 'p. 113 · twin' };
    },
    starHeart() { // p116
      const s = R.int(13, 47), b = s + R.int(20, 40), c = s + R.int(10, 60);
      return { q: `★ + ${b - s} = ${b} and ${c} − ★ = ♥. What is ♥?`, opts: G.mc(c - s, [c - b, s, c + s, c - s + 1]), steps: [`★ = ${b} − ${b - s} = ${s}`, `♥ = ${c} − ${s} = **${c - s}**`], ref: 'p. 116 · twin' };
    },
  };

  /* ---------------- pictures from the pages (book numbers) ---------------- */
  const P = {
    p17: () => ({ q: 'About how many more people live in **Switzerland** than in **Finland**?', fig: Fig.bars('Population', ['Finland', 'Bulgaria', 'Switzerland'], [5500000, 7100000, 8500000], 9000000, 1000000), ref: 'p. 17 · Challenge',
      opts: ['about 3,000,000', 'about 1,400,000', 'about 14,000,000', 'about 300,000'], steps: ['Finland ≈ 5,500,000, Switzerland ≈ 8,500,000', '8,500,000 − 5,500,000 ≈ **3,000,000**'] }),
    p26a: () => ({ q: 'The difference between X and Y is **100**. What is the difference between X and Z?', fig: Fig.line(-250, 75, 25, [], [{ v: -225, label: 'Z' }, { v: -50, label: 'X' }, { v: 50, label: 'Y' }]), ref: 'p. 26 · Challenge',
      opts: ['175', '100', '200', '150'], steps: ['X to Y is 4 steps = 100: one step is 25.', 'X to Z is 7 steps: 7 × 25 = **175**'] }),
    p26b: () => ({ q: 'One step is 25, and **0** is half-way between X and Y. What is the value of Z?', fig: Fig.line(-250, 75, 25, [], [{ v: -225, label: 'Z' }, { v: -50, label: 'X' }, { v: 50, label: 'Y' }]), ref: 'p. 26 · Challenge',
      opts: ['−225', '−175', '−250', '225'], steps: ['X = −50, Y = 50', 'Z is 7 steps left of X: −50 − 175 = **−225**'] }),
    p34: () => ({ q: 'Bella scored 15,200 then 21,500 points. Amelia scored **29,750 fewer** than Bella. How many points did they score altogether?', fig: Fig.partWhole('Bella', [{ v: 15200, label: '15,200' }, { v: 21500, label: '21,500' }]), ref: 'p. 34 · Challenge',
      opts: ['43,650', '36,700', '66,450', '6,950'], steps: ['Bella: 36,700', 'Amelia: 36,700 − 29,750 = 6,950', '36,700 + 6,950 = **43,650**'] }),
    p63: () => ({ q: 'Which number is a factor of **all three** numbers?', fig: Fig.table([['35', '50', '70'], ['1', '1', '1'], ['5', '2', '2'], ['7', '5', '5'], ['35', '10', '7'], ['', '25', '10'], ['', '50', '14']]), ref: 'p. 63 · Challenge',
      opts: ['5', '7', '10', '35'], steps: ['Factors of 35: 1, 5, 7, 35', '5 also goes into 50 and 70; 7 does not go into 50.'] }),
    p72: () => ({ q: 'Which number belongs where the **?** is?', fig: Fig.venn('Even', 'Square number', ['14', '2'], ['4', '16', '?'], ['9', '81'], ['13', '91']), ref: 'p. 72 · Challenge',
      opts: ['100', '81', '14', '91'], steps: ['The middle needs even AND square.', '100 = 10 × 10 and is even ✔ (81 is odd; 14 and 91 are not square)'] }),
    p81: () => ({ q: 'Work it out mentally: what is the total of the nine bars?', fig: Fig.barModel(9, Array(9).fill('49'), '?'), ref: 'p. 81 · Challenge',
      opts: ['441', '451', '431', '360'], steps: ['9 × 49 = 9 × 50 − 9', '= 450 − 9 = **441**'] }),
    p104: () => ({ q: 'The cards 3, 4, 6, 8, 9 and 10 are the numerators and denominators of A, B and C. What is **B**?', fig: Fig.line(0, 3, 1, [0, 1, 2, 3], [{ v: 4 / 9, label: 'A' }, { v: 10 / 6, label: 'B' }, { v: 8 / 3, label: 'C' }], (v) => String(v)), ref: 'p. 104 · Challenge',
      opts: ['[[10/6]]', '[[8/6]]', '[[9/6]]', '[[10/8]]'], steps: ['A = [[4/9]] (just under a half), C = [[8/3]] = [[2 2/3]].', 'B = [[10/6]] = [[1 2/3]] uses the last cards.'] }),
    p113: () => ({ q: 'Fencing comes in packs of **4 m**. How many packs does Mo need to go all the way round?', fig: Fig.rectText('5 7/10 m', '3 3/4 m', 0, 0.55), ref: 'p. 113 · Challenge',
      opts: ['5', '4', '19', '6'], steps: ['Perimeter: 2 × (3 3/4 + 5 7/10) = 18 9/10 m', '4 packs = 16 m is too short: **5** packs'] }),
    p122: () => ({ q: 'A = [[1 2/9]], B = [[4 5/6]], C = [[9 1/3]]. How much bigger is the distance BC than AB?', fig: Fig.line(0, 10, 1, [0, 5, 10], [{ v: 1 + 2 / 9, label: 'A' }, { v: 4 + 5 / 6, label: 'B' }, { v: 9 + 1 / 3, label: 'C' }]), ref: 'p. 122 · Challenge',
      opts: ['[[8/9]]', '[[4 1/2]]', '[[3 11/18]]', '[[1 8/9]]'], steps: ['AB = [[3 11/18]], BC = [[4 1/2]]', '[[4 9/18]] − [[3 11/18]] = **[[8/9]]**'] }),
    p154: () => ({ q: 'C is [[2/3]] of the way from A (30) to B (210). What is the value of C?', fig: Fig.line(30, 210, 30, [30, 210], [{ v: 150, label: 'C' }]), ref: 'p. 154 · Power puzzle',
      opts: ['150', '140', '120', '180'], steps: ['A to B = 180', '[[2/3]] of 180 = 120; 30 + 120 = **150**'] }),
    p157: () => ({ q: 'The three squares have equal sides. What are the coordinates of **B**?', fig: Fig.coords(0, 12, 0, 8, [{ x: 2, y: 1, label: '(2, 1)' }, { x: 5, y: 4, label: '(5, 4)' }, { x: 8, y: 7, label: 'B' }], [{ pts: [[2, 1], [5, 1], [5, 4], [2, 4]] }, { pts: [[5, 4], [8, 4], [8, 7], [5, 7]] }, { pts: [[8, 1], [11, 1], [11, 4], [8, 4]] }]), ref: 'p. 157 · Challenge',
      opts: ['(8, 7)', '(7, 8)', '(8, 4)', '(11, 7)'], steps: ['Each side is 5 − 2 = 3.', 'B = (5 + 3, 4 + 3) = **(8, 7)**'] }),
    p160: () => ({ q: 'Mia plotted three corners of a rectangle. What is the **fourth** corner?', fig: Fig.coords(-5, 5, -5, 5, [{ x: -3, y: 3, label: 'A' }, { x: 4, y: 3, label: 'B' }, { x: 4, y: -1, label: 'C' }]), ref: 'p. 160 · Challenge',
      opts: ['(−3, −1)', '(3, −1)', '(−1, −3)', '(−3, 1)'], steps: ['Same x as A: −3', 'Same y as C: −1 → **(−3, −1)**'] }),
    p166: () => ({ q: 'The three parallelograms are identical. What are the coordinates of **B**?', fig: Fig.coords(-4, 10, -5, 6, [{ x: -3, y: 5, label: '(−3, 5)' }, { x: 2, y: 5, label: '(2, 5)' }, { x: -2, y: 2, label: '(−2, 2)' }, { x: 9, y: -1, label: 'B' }], [{ pts: [[-3, 5], [2, 5], [3, 2], [-2, 2]] }, { pts: [[3, 2], [8, 2], [9, -1], [4, -1]] }, { pts: [[-1, -1], [4, -1], [5, -4], [0, -4]] }]), ref: 'p. 166 · Challenge',
      opts: ['(9, −1)', '(8, −1)', '(9, 1)', '(7, −1)'], steps: ['Each side goes 1 right and 3 down; the tops are 5 long.', 'A = (3, 2), then B = (3 + 5 + 1, 2 − 3) = **(9, −1)**'] }),
  };

  BC.DATA[6] = {
    year: 6, label: 'Year 6', book: 'Practice Book 6A', pool: 'Challenges + Power Puzzles',

    buzz: [
      { q: 'Max\'s number: 6-digit, odd, the same number of 1,000s as 1s, more than half a million, digit sum 26. Which could it be?', opts: ['505,295', '505,296', '495,295', '505,395'], ref: 'p. 8 · Challenge', steps: ['Odd ✔, thousands 5 = ones 5 ✔, > 500,000 ✔', '5 + 0 + 5 + 2 + 9 + 5 = 26 ✔'] },
      { q: 'Danny: "You can tell if a number is odd or even from one of its digits." Which digit?', opts: ['The ones digit', 'The first digit', 'Any digit', 'The tens digit'], ref: 'p. 11 · Challenge', steps: ['Odd or even depends only on the ones digit.'] },
      { q: '7 digits; the ten-thousands digit is half the ones digit; the hundreds digit is 3 × the millions digit; the digits total 20. Which works?', opts: ['1,037,306', '1,037,316', '2,037,306', '1,036,306'], ref: 'p. 14 · Challenge', steps: ['3 = half of 6 ✔; hundreds 3 = 3 × 1 ✔', '1 + 0 + 3 + 7 + 3 + 0 + 6 = 20 ✔'] },
      { q: '246,17_ < 24_,1_0 < 246,_ _5 < 246,400. What must the second number be?', opts: ['246,180 or 246,190', '246,170', '245,180', '247,100'], ref: 'p. 20 · Challenge', steps: ['It starts 246,1… and must be bigger than 246,17_.', 'So **246,180** or **246,190**.'] },
      { q: '25,_97 rounds to the same number to the nearest 10, 100 and 1,000. What is the missing digit?', opts: ['9', '0', '5', '4'], ref: 'p. 23 · Challenge', steps: ['25,997 → 26,000 to the nearest 10, 100 and 1,000 ✔'] },
      { q: 'Which 7-digit number fits the Power puzzle: all digits different, odd, between 5 and 7 million, not a multiple of 5…?', opts: ['5,293,187', '5,293,185', '6,293,187', '5,283,197'], ref: 'p. 28 · Power puzzle', steps: ['Millions 5 = hundreds 1 + 4 ✔; tens 8 = 4 × 2 ✔; 9 = 3 × 3 ✔', '5 + 2 + 9 = 1 + 8 + 7 ✔'] },
      { q: '9,999,999 − □ = 909,090', opts: ['9,090,909', '9,090,999', '9,909,909', '10,909,089'], ref: 'p. 31 · Challenge', steps: ['9,999,999 − 909,090', '= **9,090,909**'] },
      { q: '□ − 919,293 = 50,206', opts: ['969,499', '869,087', '969,599', '970,499'], ref: 'p. 31 · Challenge', steps: ['919,293 + 50,206 = **969,499**'] },
      { q: 'Max uses 5, 6, 7, 8, 9 to make a 4-digit × 1-digit multiplication. What is the **biggest** answer?', opts: ['78,885', '86,175', '88,785', '79,155'], ref: 'p. 37 · Challenge', steps: ['8,765 × 9 = **78,885**', '(9,876 × 5 = 49,380 is smaller)'] },
      { q: '3,62□ × □5 = 199,595. What are the missing digits?', opts: ['9 and 5', '5 and 9', '9 and 4', '7 and 5'], ref: 'p. 40 · Challenge', steps: ['3,629 × 55 = **199,595** ✔'] },
      { q: '22 ) _88_ gives the answer 3_3. What is the number being divided?', opts: ['6,886', '6,688', '7,886', '6,866'], ref: 'p. 43 · Challenge', steps: ['22 × 313 = **6,886**'] },
      { q: 'Bella: "If I double both numbers in a division, the answer halves and halves again." Is she right? (480 ÷ 8 = 60)', opts: ['No: 960 ÷ 16 = 60 too', 'Yes: 960 ÷ 16 = 15', 'Yes: 960 ÷ 16 = 30', 'No: 960 ÷ 16 = 120'], ref: 'p. 46 · Challenge', steps: ['Doubling both keeps the answer the same.', '960 ÷ 16 = **60**'] },
      { q: '702 ÷ □ = 27', opts: ['26', '25', '27', '24'], ref: 'p. 49 · Challenge', steps: ['27 × 26 = 702'] },
      { q: '2,790 ÷ 31 = 90. What is 2,790 ÷ 62?', opts: ['45', '180', '90', '31'], ref: 'p. 52 · Challenge', steps: ['Double the divisor → halve the answer.', '90 ÷ 2 = **45**'] },
      { q: 'Which number leaves a remainder of 40 when divided by 41?', opts: ['122', '120', '140', '160'], ref: 'p. 55 · Challenge', steps: ['41 × 3 − 1 = **122**', '122 ÷ 41 = 2 r 40'] },
      { q: 'Cards 1, 1, 3, 5, 7, 9: which 4-digit ÷ 2-digit division gives the **biggest remainder**?', opts: ['1,137 ÷ 95', '9,751 ÷ 13', '1,359 ÷ 71', '7,531 ÷ 91'], ref: 'p. 58 · Challenge', steps: ['1,137 ÷ 95 = 11 r **92**', '(9,751 ÷ 13 = 750 r 1)'] },
      { q: 'Subtraction trap: start with 2, 1, 8, 4 and keep going (largest − smallest). Where do you get stuck?', opts: ['6,174', '7,173', '8,352', '0'], ref: 'p. 60 · Power puzzle', steps: ['… → 8,532 − 2,358 = 6,174', '7,641 − 1,467 = **6,174** again'] },
      { q: 'Lexi\'s three numbers all have the common factors 1, 2, 3, 4 and 5. Which could they be?', opts: ['60, 120, 180', '20, 40, 60', '30, 60, 90', '12, 24, 36'], ref: 'p. 63 · Challenge', steps: ['They must be multiples of 60.', '**60, 120, 180** ✔ (20 has no factor 3)'] },
      { q: 'Andy: "48 and 96 are the only common multiples of 4 and 12 up to 100." How many are there really?', opts: ['8', '2', '4', '12'], ref: 'p. 66 · Challenge', steps: ['Every multiple of 12: 12, 24, 36, 48, 60, 72, 84, 96', '**8** of them'] },
      { q: '"23 is prime, so 123 and 223 must be prime too." Which shows it is wrong?', opts: ['123 = 3 × 41', '223 = 3 × 74', '123 = 7 × 17', '23 = 3 + 20'], ref: 'p. 69 · Challenge', steps: ['1 + 2 + 3 = 6, so 3 goes into 123.', '123 = **3 × 41** is not prime.'] },
      { q: '100 = 10 + □ × 5', opts: ['18', '90', '50', '20'], ref: 'p. 75 · Challenge', steps: ['□ × 5 = 90', '□ = **18**'] },
      { q: 'Using 10 10 10 10 with operations and brackets, what is the **smallest** result?', opts: ['−990', '−20', '−80', '0'], ref: 'p. 78 · Challenge', steps: ['10 − 10 × 10 × 10 = 10 − 1,000', '= **−990**'] },
      { q: 'Mrs Dean adds 100, doubles it, then subtracts a quarter of a million. She gets 600,000. What was her number?', opts: ['424,900', '425,000', '850,000', '424,800'], ref: 'p. 84 · Challenge', steps: ['600,000 + 250,000 = 850,000', '÷ 2 = 425,000; − 100 = **424,900**'] },
      { q: '□□ × 8□ = 2,025', opts: ['25 × 81', '25 × 80', '24 × 84', '35 × 85'], ref: 'p. 87 · Challenge', steps: ['2,025 = 25 × 81 ✔'] },
      { q: '"Any whole number can be made by adding 2 or 3 primes." Which shows 17?', opts: ['2 + 2 + 13', '1 + 3 + 13', '2 + 15', '7 + 9 + 1'], ref: 'p. 89 · Power puzzle', steps: ['2, 2 and 13 are all prime ✔', '(1, 9 and 15 are not prime)'] },
      { q: '((2 + 8|3 + □)) = [[2/5]]', opts: ['22', '25', '12', '20'], ref: 'p. 92 · Challenge', steps: ['Top 10 = 2 × 5, so the bottom is 5 × 5 = 25', '3 + **22** = 25'] },
      { q: 'Simplify [[268/64]].', opts: ['[[4 3/16]]', '[[4 3/8]]', '[[4 1/4]]', '[[67/32]]'], ref: 'p. 95 · Challenge', steps: ['268 ÷ 4 = 67, 64 ÷ 4 = 16: [[67/16]]', '= **[[4 3/16]]**'] },
      { q: '[[1/3]], [[□/12]], [[2/3]], [[5/6]] are in ascending order. Which digit can go in the box?', opts: ['6', '3', '9', '2'], ref: 'p. 101 · Challenge', steps: ['[[1/3]] = [[4/12]] and [[2/3]] = [[8/12]]', '5, 6 or 7 fit: **6** ✔'] },
      { q: '[[□/2]] + [[3/□]] = [[7/8]]', opts: ['[[1/2]] + [[3/8]]', '[[1/2]] + [[3/6]]', '[[2/2]] + [[3/8]]', '[[1/2]] + [[3/4]]'], ref: 'p. 107 · Challenge', steps: ['[[4/8]] + [[3/8]] = **[[7/8]]**'] },
      { q: '[[1/□]] − [[1/□]] = [[5/14]]', opts: ['[[1/2]] − [[1/7]]', '[[1/7]] − [[1/2]]', '[[1/2]] − [[1/14]]', '[[1/3]] − [[1/7]]'], ref: 'p. 107 · Challenge', steps: ['[[7/14]] − [[2/14]] = **[[5/14]]**'] },
      { q: 'Jamie adds two numbers to get [[21 4/5]]. One is [[16 3/8]]. What is the other?', opts: ['[[5 17/40]]', '[[5 1/3]]', '[[38 7/40]]', '[[5 7/40]]'], ref: 'p. 110 · Challenge', steps: ['[[21 32/40]] − [[16 15/40]]', '= **[[5 17/40]]**'] },
      { q: '★ + [[3 5/6]] = [[5 3/4]] and [[6 1/3]] − ★ = ♥. What is ♥?', opts: ['[[4 5/12]]', '[[1 11/12]]', '[[4 7/12]]', '[[2 5/12]]'], ref: 'p. 116 · Challenge', steps: ['★ = [[1 11/12]]', '♥ = [[6 4/12]] − [[1 11/12]] = **[[4 5/12]]**'] },
      { q: 'A double decker bus is [[18 3/5]] m long. How long are 12 of them?', opts: ['[[223 1/5]] m', '[[216 3/5]] m', '[[223 3/5]] m', '[[220 1/5]] m'], ref: 'p. 128 · Challenge', steps: ['12 × 18 = 216; 12 × [[3/5]] = [[7 1/5]]', '= **[[223 1/5]] m**'] },
      { q: '"Proper fraction × proper fraction is smaller than both fractions." Is this always, sometimes or never true?', opts: ['Always', 'Sometimes', 'Never', 'Only for halves'], ref: 'p. 131 · Challenge', steps: ['A part of a part is smaller than both.', '[[1/2]] × [[3/5]] = [[3/10]]'] },
      { q: 'Which way makes [[1/□]] ÷ □ = [[1/48]]?', opts: ['[[1/6]] ÷ 8', '[[1/6]] ÷ 6', '[[1/8]] ÷ 8', '[[1/12]] ÷ 3'], ref: 'p. 137 · Challenge', steps: ['The two numbers must multiply to 48.', '6 × 8 = 48 ✔'] },
      { q: '[[□/60]] ÷ 4 = [[7/30]]', opts: ['56', '28', '14', '7'], ref: 'p. 140 · Challenge', steps: ['[[7/30]] = [[14/60]]', '× 4 = **56**'] },
      { q: '[[3/4]] ÷ ◆ = [[3/20]] and [[4/5]] ÷ 2 = ●. What is ● ÷ ◆?', opts: ['[[2/25]]', '[[2/5]]', '[[1/10]]', '[[8/5]]'], ref: 'p. 142 · Challenge', steps: ['◆ = 5, ● = [[2/5]]', '[[2/5]] ÷ 5 = **[[2/25]]**'] },
      { q: 'Amelia bakes 36 biscuits and keeps [[1/3]]. She gives [[5/8]] of the rest to her dad and the rest to her mum. How many does mum get?', opts: ['9', '15', '12', '24'], ref: 'p. 149 · Challenge', steps: ['24 left after keeping 12', 'Dad: 15', 'Mum: **9**'] },
      { q: 'Alex reads [[1/4]] of a book, then [[3/5]] of the book. 18 pages are left. How many pages?', opts: ['120', '60', '72', '90'], ref: 'p. 152 · Challenge', steps: ['1 − [[1/4]] − [[3/5]] = [[3/20]]', '[[3/20]] = 18, so **120** pages'] },
      { q: 'Lee reads [[1/4]] of a book, then [[3/5]] of the **remaining** pages. 18 pages are left. How many pages?', opts: ['60', '120', '45', '72'], ref: 'p. 152 · Challenge', steps: ['[[2/5]] of [[3/4]] = [[3/10]] is left', '[[3/10]] = 18, so **60** pages'] },
      { q: 'F/9 of 27 = 18 + [[1/3]] of 18. What is F?', opts: ['8', '6', '9', '24'], ref: 'p. 154 · Power puzzle', steps: ['18 + 6 = 24', '[[1/9]] of 27 = 3; 24 ÷ 3 = **8**'] },
      { q: 'Reflect in the y-axis then move 3 right, or move 3 right then reflect. Same result?', opts: ['No: they end 6 apart', 'Yes, always', 'Yes, if you also move down', 'No: one is upside down'], ref: 'p. 163 · Challenge', steps: ['Reflect, then 3 right: x → −x + 3.', 'Move 3 right, then reflect: x → −(x + 3) = −x − 3.', 'They end 3 either side of the plain mirror image: 6 apart.'] },
    ],

    vis: [P.p17, P.p26a, P.p26b, P.p34, P.p63, P.p72, P.p81, P.p104, P.p113, P.p122, P.p154, P.p157, P.p160, P.p166, () => Object.assign(V.fourthCorner(), { ref: 'p. 160 · twin' }), () => Object.assign(V.coordRead(), { ref: 'p. 157 · twin' })],

    clue: [
      { title: 'Max\'s number', cands: ['505,295', '507,293', '485,135', '515,295'],
        clues: ['I am a 6-digit odd number.', 'I have the same number of 1,000s as 1s.', 'I am greater than half a million.', 'My digits add up to 26.'],
        test: [(v) => v > 99999 && v < 1000000 && v % 2 === 1, (v) => Math.floor(v / 1000) % 10 === v % 10, (v) => v > 500000, (v) => String(v).split('').reduce((a, c) => a + +c, 0) === 26], ref: 'p. 8 · Challenge' },
      { title: 'Mystery number', cands: ['1,037,306', '1,047,305', '1,036,406', '1,037,316'],
        clues: ['I have 7 digits.', 'My ten-thousands digit is half my ones digit.', 'My hundreds digit is 3 times my millions digit.', 'My digits add up to 20.'],
        test: [(v) => v >= 1000000 && v < 10000000, (v) => 2 * (Math.floor(v / 10000) % 10) === v % 10, (v) => Math.floor(v / 100) % 10 === 3 * Math.floor(v / 1000000), (v) => String(v).split('').reduce((a, c) => a + +c, 0) === 20], ref: 'p. 14 · Challenge' },
      { title: 'The Power puzzle number', cands: ['5,293,187', '5,293,185', '6,293,187', '5,283,187'],
        clues: ['I am odd and between 5 and 7 million.', 'I am not a multiple of 5.', 'My millions digit is 4 more than my hundreds digit.', 'My ten-thousands digit is 3 times my thousands digit.'],
        test: [(v) => v % 2 === 1 && v > 5000000 && v < 7000000, (v) => v % 5 !== 0, (v) => Math.floor(v / 1000000) === Math.floor(v / 100) % 10 + 4, (v) => Math.floor(v / 10000) % 10 === 3 * (Math.floor(v / 1000) % 10)], ref: 'p. 28 · Power puzzle' },
      { title: 'Mystery number', cands: ['5', '7', '10', '1'],
        clues: ['I am a factor of 35.', 'I am a factor of 50.', 'I am a factor of 70.', 'I am not 1.'],
        test: [(v) => 35 % v === 0, (v) => 50 % v === 0, (v) => 70 % v === 0, (v) => v !== 1], ref: 'p. 63 · Challenge' },
      { title: 'Mystery number', cands: ['64', '100', '16', '81'],
        clues: ['I am even.', 'I am a square number.', 'I am greater than 50.', 'I am less than 80.'],
        test: [(v) => v % 2 === 0, (v) => Number.isInteger(Math.sqrt(v)), (v) => v > 50, (v) => v < 80], ref: 'p. 72 · Challenge' },
      { title: 'Mystery fraction', cands: [F(10, 15), F(12, 18), F(8, 12), F(10, 16)],
        clues: ['I am equal to ' + F(2, 3) + '.', 'My denominator is 3 + 12.'],
        test: [(v) => v[0] * 3 === v[1] * 2, (v) => v[1] === 15], ref: 'p. 92 · Challenge', parse: (s) => s.match(/\d+/g).map(Number) },
    ],

    code: [
      { q: '3,62□ × □5 = 199,595', boxes: 2, answer: [9, 5], ref: 'p. 40 · Challenge', steps: ['The answer ends in 5, so try □5 = 55, 45 …', '3,629 × 55 = 199,595 ✔'] },
      { q: '22 × 3□3 = □,88□', boxes: 3, answer: [1, 6, 6], ref: 'p. 43 · Challenge', steps: ['22 × 313 = 6,886'] },
      { q: '702 ÷ □□ = 27', boxes: 2, answer: [2, 6], ref: 'p. 49 · Challenge', steps: ['27 × 26 = 702'] },
      { q: '□□□ ÷ 31 = 30', boxes: 3, answer: [9, 3, 0], ref: 'p. 52 · Challenge', steps: ['31 × 30 = **930**'] },
      { q: '□□□ ÷ 31 = 27', boxes: 3, answer: [8, 3, 7], ref: 'p. 52 · Challenge', steps: ['31 × 27 = **837**'] },
      { q: '□□□ ÷ 41 = ? r 40', note: 'Find the **smallest 3-digit number** that leaves a remainder of 40.', boxes: 3, answer: [1, 2, 2], ref: 'p. 55 · Challenge', steps: ['One less than a multiple of 41.', '41 × 3 − 1 = **122**'] },
      { q: '100 − □□□ ÷ 5 = 0', boxes: 3, answer: [5, 0, 0], ref: 'p. 75 · Challenge', steps: ['□ ÷ 5 must be 100', '□ = **500**'] },
      { q: '□□□ × □1 = 2,761', boxes: 4, answer: [2, 5, 1, 1], ref: 'p. 87 · Challenge', steps: ['2,761 = 251 × 11 (the only way)'] },
      { q: '□□ × 8□ = 2,025', boxes: 3, answer: [2, 5, 1], ref: 'p. 87 · Challenge', steps: ['25 × 81 = 2,025'] },
      { q: '((2 + □|3 + 12)) = [[2/3]]', boxes: 1, answer: [8], ref: 'p. 92 · Challenge', steps: ['The bottom is 15 = 3 × 5', 'So the top is 10: 2 + **8**'] },
      { q: '[[□/2]] + [[3/□]] = [[7/8]]', boxes: 2, answer: [1, 8], ref: 'p. 107 · Challenge', steps: ['[[1/2]] = [[4/8]]', '[[4/8]] + [[3/8]] = [[7/8]]'] },
      { q: '[[1/□]] − [[1/□]] = [[5/14]]', boxes: 2, answer: [2, 7], ref: 'p. 107 · Challenge', steps: ['[[7/14]] − [[2/14]] = [[5/14]]'] },
      { q: '[[□□/18]] ÷ 3 = [[2/9]]', boxes: 2, answer: [1, 2], ref: 'p. 140 · Challenge', steps: ['[[2/9]] = [[4/18]]', '× 3 = **12**'] },
      { q: '[[□□/24]] ÷ 2 = [[3/8]]', boxes: 2, answer: [1, 8], ref: 'p. 140 · Challenge', steps: ['[[3/8]] = [[9/24]]', '× 2 = **18**'] },
    ],
    codeGen: [],

    line: [
      () => ({ prompt: 'Mark **Z = −225**', min: -250, max: 75, step: 25, labels: [-250, 0, 75], target: -225, fmt: n, ref: 'p. 26 · Challenge' }),
      () => ({ prompt: 'Mark **X = −50**', min: -250, max: 75, step: 25, labels: [-250, 0, 75], target: -50, fmt: n, ref: 'p. 26 · Challenge' }),
      () => ({ prompt: 'Mark **[[7 1/8]]**', min: 0, max: 10, step: 1, labels: [0, 5, 10], target: 7.125, fmt: (v) => String(v), showT: '[[7 1/8]]', ref: 'p. 98 · Challenge' }),
      () => ({ prompt: 'Mark **[[9 3/4]]**', min: 5, max: 10, step: 1, labels: [5, 10], target: 9.75, fmt: (v) => String(v), showT: '[[9 3/4]]', ref: 'p. 98 · Challenge' }),
      () => ({ prompt: 'Mark **[[5 1/2]]**', min: 5, max: 10, step: 1, labels: [5, 10], target: 5.5, fmt: (v) => String(v), showT: '[[5 1/2]]', ref: 'p. 98 · Challenge' }),
      () => ({ prompt: 'Mark **A = [[4/9]]**', min: 0, max: 3, step: 1, labels: [0, 1, 2, 3], target: 4 / 9, fmt: (v) => String(v), showT: '[[4/9]]', ref: 'p. 104 · Challenge' }),
      () => ({ prompt: 'Mark **C = [[8/3]]**', min: 0, max: 3, step: 1, labels: [0, 1, 2, 3], target: 8 / 3, fmt: (v) => String(v), showT: '[[2 2/3]]', ref: 'p. 104 · Challenge' }),
      () => ({ prompt: 'Mark **B = [[4 5/6]]**', min: 0, max: 10, step: 1, labels: [0, 5, 10], target: 4 + 5 / 6, fmt: (v) => String(v), showT: '[[4 5/6]]', ref: 'p. 122 · Challenge' }),
      () => ({ prompt: 'C is [[2/3]] of the way: mark **150**', min: 30, max: 210, step: 30, labels: [30, 210], target: 150, fmt: n, ref: 'p. 154 · Power puzzle' }),
    ],

    draw: [
      () => { const ok = (v) => v % 41 === 40; return { rule: 'a number that leaves a remainder of 40 when divided by 41', ref: 'p. 55', yes: () => String(41 * R.int(1, 9) + 40), no: () => { let v; do { v = R.int(50, 450); } while (ok(v)); return String(v); }, why: (v) => ok(+v) ? `${v} = 41 × ${(+v - 40) / 41} + 40` : `${v} ÷ 41 leaves ${+v % 41}, not 40` }; },
      () => { const ok = (v) => v % 12 === 0; return { rule: 'a common multiple of 4 and 12', ref: 'p. 66', yes: () => String(12 * R.int(1, 8)), no: () => String(R.pick([4, 8, 16, 20, 28, 32, 40, 44, 52, 56, 6, 18, 30])), why: (v) => ok(+v) ? `${v} = 12 × ${+v / 12}, and 4 goes into it too` : `${v} is not a multiple of 12` }; },
      () => { const ys = [23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 223]; return { rule: 'a prime number', ref: 'p. 69', yes: () => String(R.pick(ys)), no: () => String(R.pick([123, 91, 51, 57, 87, 111, 119, 133, 39, 69, 93, 77])), why: (v) => BC.isPrime(+v) ? `${v} has only two factors` : `${v} is not prime: it has more than two factors` }; },
      G.drawRules.equalFrac(2, 3),
      G.drawRules.makes(24),
      () => G.drawRules.square(),
    ],

    tug: [T.nines, T.whole, T.bella, T.missDiv, T.rem, T.doubleBoth, T.halve, T.workBack, T.fracMiss, T.jamie, T.biscuits, T.pages, T.maxSimp, T.fence, T.starHeart],
  };
})();
