/* Year 5 competition pool: ONLY the Challenge and Power puzzle questions of Power Maths Practice Book 5A
   (photos of 19 Nov 2026; answers in "Year 5/Books/Challenges and Power Puzzles"). Fixed items use the book's numbers;
   "twin" makers ask the same question with new numbers for the rapid rounds. In every list the RIGHT answer is first. */
'use strict';
(function () {
  const G = BC.Gen, Fig = BC.Fig, V = BC.Vis, { R, n } = BC;
  BC.DATA = BC.DATA || {};
  const sum = (v) => String(v).split('').reduce((a, c) => a + +c, 0);

  /* ---------------- twins: book Challenge types with new numbers (short, for Tug of War and Lightning) ---------------- */
  const T = {
    chests() { // p66
      const a = R.int(12, 39) * 1000 + R.int(1, 9) * 100 + R.int(10, 99), b = R.int(2, 6) * 1000 + R.int(1, 9) * 100, c = R.int(2, 7) * 1000 + R.int(1, 9) * 10;
      const r = a - b - c;
      return { q: `Chest 1 has ${n(a)} coins. Chest 2 has ${n(b)} fewer. Chest 3 has ${n(c)} fewer than chest 2. How many in chest 3?`, opts: G.mc(n(r), [n(a - b), n(a - b + c), n(r + 1000), n(a - c)]), steps: [`${n(a)} − ${n(b)} = ${n(a - b)}`, `${n(a - b)} − ${n(c)} = **${n(r)}**`], ref: 'p. 66 · twin' };
    },
    concert() { // p69
      const tot = R.int(250, 450) * 1000 + R.int(1, 9) * 100, ad = R.int(120, 200) * 1000 + R.int(100, 999), g = R.int(40, 80) * 1000 + R.int(10, 99) * 10;
      const ch = tot - ad, r = ch - g;
      return { q: `${n(tot)} people attend. ${n(ad)} are adults, the rest are children. ${n(g)} children are girls. How many boys?`, opts: G.mc(n(r), [n(ch), n(tot - g), n(r + 10000), n(ad - g)]), steps: [`Children: ${n(tot)} − ${n(ad)} = ${n(ch)}`, `Boys: ${n(ch)} − ${n(g)} = **${n(r)}**`], ref: 'p. 69 · twin' };
    },
    iceberg() { // p49
      const h = R.int(8, 25), k = R.int(5, 9);
      return { q: `The top of an iceberg is ${h} m above sea level. The part below is ${k} times as deep. How tall is the whole iceberg?`, opts: G.mc(`${h + k * h} m`, [`${k * h} m`, `${h * k + k} m`, `${h + k} m`, `${(k - 1) * h} m`]), steps: [`Below: ${k} × ${h} = ${k * h} m`, `${h} + ${k * h} = **${h + k * h} m**`], ref: 'p. 49 · twin' };
    },
    abc() { // p52
      const c0 = R.int(30, 80) * 1000 + R.int(100, 999), C = c0 - 1000, B = C - 10000, A = B + 100000;
      return { q: `A is 100,000 more than B. C is 10,000 more than B. C is 1,000 less than ${n(c0)}. What is A?`, opts: G.mc(n(A), [n(A + 10000), n(c0 + 100000), n(B), n(A - 1000)]), steps: [`C = ${n(C)}`, `B = ${n(B)}`, `A = **${n(A)}**`], ref: 'p. 52 · twin' };
    },
    pattern() { // p55
      const k = R.int(5, 15);
      return { q: `Pattern 1 has 8 grey squares, pattern 2 has 13, pattern 3 has 18. How many grey squares in pattern ${k}?`, opts: G.mc(5 * k + 3, [5 * k, 8 * k, 5 * k + 8, 5 * k - 2]), steps: ['It goes up by 5 each time: 5 × pattern + 3', `5 × ${k} + 3 = **${5 * k + 3}**`], ref: 'p. 55 · twin' };
    },
    seqIn() { // p110
      const s = R.int(1, 5), d = R.pick([6, 7, 8, 9]);
      const right = s + d * R.int(60, 110), trap = right - s;
      return { q: `Which number is in the sequence ${s}, ${s + d}, ${s + 2 * d}, ${s + 3 * d}, …?`, opts: G.mc(n(right), [n(trap), n(right + 1), n(right - 2), n(right + 3)]), steps: [`Every term is ${s} more than a multiple of ${d}.`, `${n(right)} = ${d} × ${(right - s) / d} + ${s} ✔`], ref: 'p. 110 · twin' };
    },
    jumps() { // p87
      const a = R.int(20, 80) * 1000 + R.int(100, 999), j = R.int(15, 30) * 1000 + R.int(100, 999);
      return { q: `Kate jumps the same amount each time. She starts at ${n(a)} and lands on ${n(a + j)}. Where does she land next?`, opts: G.mc(n(a + 2 * j), [n(a + j + a), n(a + 3 * j), n(2 * a + j), n(a + 2 * j + 1000)]), steps: [`Jump = ${n(a + j)} − ${n(a)} = ${n(j)}`, `${n(a + j)} + ${n(j)} = **${n(a + 2 * j)}**`], ref: 'p. 87 · twin' };
    },
    field() { // p145
      const L = R.int(25, 80), W = R.int(10, L - 5), P = 2 * (L + W);
      return { q: `A rectangular field has a perimeter of ${P} m. It is ${L} m long. How wide is it?`, opts: G.mc(`${W} m`, [`${P - L} m`, `${P / 2} m`, `${P - 2 * L} m`, `${W + 5} m`]), steps: [`Length + width = ${P} ÷ 2 = ${P / 2}`, `${P / 2} − ${L} = **${W} m**`], ref: 'p. 145 · twin' };
    },
    cardSquare() { // p154
      const w = R.int(14, 30), h = R.int(8, w - 3);
      return { q: `A card is ${w} cm by ${h} cm. The largest possible square is cut out. What area of card is left?`, opts: G.mc(`${w * h - h * h} cm²`, [`${h * h} cm²`, `${w * h - w * w > 0 ? w * h - w * w : w * h} cm²`, `${(w - h) * w} cm²`, `${w * h} cm²`]), steps: [`Square: ${h} × ${h} = ${h * h} cm²`, `${w * h} − ${h * h} = **${w * h - h * h} cm²**`], ref: 'p. 154 · twin' };
    },
    starTri() { // p134
      const s = R.pick([3, 4, 6, 8, 12, 25, 40]);
      return { q: `Star × 10 = triangle ÷ 10. If the star is ${s}, what is the triangle?`, opts: G.mc(n(s * 100), [n(s * 10), n(s * 1000), n(s), n(s * 20)]), steps: ['The triangle is 100 times the star.', `${s} × 100 = **${n(s * 100)}**`], ref: 'p. 134 · twin' };
    },
    balance() { // p137
      const a = R.pick([300, 400, 600, 800, 900]), k = R.int(2, 8), b = R.pick([100, 200, 300, 400, 600].filter((x) => x !== a && (a * k) % x === 0));
      if (!b) return T.balance();
      return { q: `${k} boxes of ${a} g balance some boxes of ${b} g. How many ${b} g boxes?`, opts: G.mc((a * k) / b, [(a * k) / b + 1, k, a * k / 100, (a * k) / b * 2].filter((v) => v !== (a * k) / b)), steps: [`${k} × ${a} = ${n(a * k)} g`, `${n(a * k)} ÷ ${b} = **${(a * k) / b}**`], ref: 'p. 137 · twin' };
    },
    mental() { // p75
      const t = R.pick([600, 700, 800, 900, 1000]), a = R.int(10, 25) * 10, b = R.int(10, 30) * 10;
      return { q: `${a} + ${b} + □ = ${t}`, opts: G.mc(t - a - b, [t - a, t - b, t - a - b + 100, t - a - b - 10]), steps: [`${a} + ${b} = ${a + b}`, `${t} − ${a + b} = **${t - a - b}**`], ref: 'p. 75 · twin' };
    },
    round2700() { // p11
      const H = R.int(15, 79) * 100, x = H - 50 + R.int(0, 9);
      return { q: `Which number rounds to ${n(H)} (nearest 100), but rounds to ${n(H - 100)} after taking away 10?`, opts: G.mc(n(x), [n(x + 10), n(x - 10), n(H), n(H + 50)]), steps: [`It must be from ${n(H - 50)} to ${n(H - 41)}.`, `${n(x)} − 10 = ${n(x - 10)} → ${n(H - 100)} ✔`], ref: 'p. 11 · twin' };
    },
    cube() { // p125
      const big = R.pick([4, 6, 8, 10, 12]), small = R.pick([2, big / 2].filter((v) => v > 1 && big % v === 0));
      const k = big / small;
      return { q: `How many ${small} × ${small} × ${small} cubes fit inside a ${big} × ${big} × ${big} cube?`, opts: G.mc(k ** 3, [k * k, k * 3, big ** 3 / small, k ** 3 * 2]), steps: [`${k} fit along each edge.`, `${k} × ${k} × ${k} = **${k ** 3}**`], ref: 'p. 125 · twin' };
    },
    tiles() { // p148
      const s = R.pick([5, 10, 4, 6]), kind = R.int(0, 2), m = [10, 12, 14][kind], name = ['a 2 by 3 rectangle', 'an L shape (4 in a row + 2 under one end)', 'one long line'][kind];
      return { q: `6 square tiles each have a perimeter of ${4 * s} cm. They make ${name}. What is its perimeter?`, opts: G.mc(`${m * s} cm`, [`${24 * s} cm`, `${(m + 2) * s} cm`, `${(m - 2) * s} cm`, `${6 * s} cm`]), steps: [`Each side is ${s} cm.`, `Count the outside edges: ${m} × ${s} = **${m * s} cm**`], ref: 'p. 148 · twin' };
    },
  };

  /* ---------------- pictures from the pages (book numbers) ---------------- */
  const P = {
    p40: () => ({ q: 'What number is the arrow pointing to?', fig: Fig.line(300000, 400000, 10000, [300000, 400000], [{ v: 330000, label: '?' }]), ref: 'p. 40 · Challenge', small: true,
      opts: ['330,000', '303,000', '333,000', '340,000'], steps: ['100,000 split into 10 steps: 10,000 each.', '3 steps after 300,000: **330,000**'] }),
    p55: () => ({ q: 'The patterns carry on. One pattern has **9 white squares**. How many grey squares does it have?', fig: Fig.squarePatterns([1, 2, 3]), ref: 'p. 55 · Challenge',
      opts: ['48', '45', '43', '54'], steps: ['Grey: 8, 13, 18 … up by 5 each time.', 'Pattern 9: 8 + 8 × 5 = **48**'] }),
    p89: () => ({ q: 'Each row and column adds up to its total. What is the missing number in the top row?', fig: Fig.table([['', 'A', 'B', 'C', 'Total'], ['Row 1', '13,197', '5,966', '?', '20,000'], ['Row 2', '', '', '15,441', '30,000'], ['Row 3', '', '32,932', '', '60,000'], ['Total', '40,000', '50,000', '20,000', '']]), ref: 'p. 89 · Power puzzle',
      opts: ['837', '19,163', '937', '1,837'], steps: ['13,197 + 5,966 = 19,163', '20,000 − 19,163 = **837**'] }),
    p89b: () => ({ q: 'Each row and column adds up to its total. What number goes where the **?** is?', fig: Fig.table([['', 'A', 'B', 'C', 'Total'], ['Row 1', '13,197', '5,966', '837', '20,000'], ['Row 2', '', '?', '15,441', '30,000'], ['Row 3', '', '32,932', '', '60,000'], ['Total', '40,000', '50,000', '20,000', '']]), ref: 'p. 89 · Power puzzle',
      opts: ['11,102', '14,559', '12,102', '17,068'], steps: ['Column B: 5,966 + 32,932 = 38,898', '50,000 − 38,898 = **11,102**'] }),
    p98: () => ({ q: '100 children did a puzzle. The graph shows how many had finished after each minute. How many finished **between 1 and 3 minutes**?', fig: Fig.lineGraph('Children who have finished', ['1', '2', '3', '4', '5', '6', '7'], [15, 25, 70, 85, 90, 95, 100], 100, 10), ref: 'p. 98 · Challenge',
      opts: ['55', '70', '85', '45'], steps: ['After 1 minute: 15. After 3 minutes: 70.', '70 − 15 = **55**'] }),
    p101: () => ({ q: 'The graph shows the population of a town. About how much did it **increase** from 1980 to 1990?', fig: Fig.lineGraph('Population of a town', ['1960', '1970', '1980', '1990', '2000', '2010'], [35000, 25000, 17000, 32000, 25000, 13000], 40000, 5000), ref: 'p. 101 · Challenge',
      opts: ['15,000', '32,000', '17,000', '49,000'], steps: ['1980: 17,000. 1990: 32,000.', '32,000 − 17,000 = **15,000**'] }),
    p104: () => ({ q: 'The week\'s total was **96**. Wednesday and Thursday had the same number. How many took part on Wednesday?', fig: Fig.bars('Children taking part', ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], [16, 21, 0, 0, 7], 30, 5), ref: 'p. 104 · Challenge',
      opts: ['26', '52', '24', '28'], steps: ['16 + 21 + 7 = 44', '96 − 44 = 52, and 52 ÷ 2 = **26**'] }),
    p107: () => ({ q: '2/5 of all the counters are red. Box 1 has **8 more** red counters than box 2. How many red counters are in box 1?', fig: Fig.table([['', 'Box 1', 'Box 2', 'Total'], ['Red', '?', '', ''], ['Blue', '', '', ''], ['Total', '50', '100', '150']]), ref: 'p. 107 · Power puzzle',
      opts: ['34', '26', '30', '60'], steps: ['Red: 2/5 of 150 = 60', '60 − 8 = 52; 52 ÷ 2 = 26 in box 2', 'Box 1: 26 + 8 = **34**'] }),
    p116: () => ({ q: 'The chart has 6 columns. Which number is **prime** and in the same column as 5, 11 and 17?', fig: Fig.table([[1, 2, 3, 4, 5, 6], [7, 8, 9, 10, 11, 12], [13, 14, 15, 16, 17, 18], [19, 20, 21, 22, 23, 24], [25, 26, 27, 28, 29, 30], [31, 32, 33, 34, 35, 36], [37, 38, 39, 40, 41, 42]].map((r) => r.map(String))), ref: 'p. 116 · Challenge',
      opts: ['41', '35', '39', '37'], steps: ['That column holds 5, 11, 17, 23, 29, 35, 41.', '35 = 5 × 7, so **41** is the prime.'] }),
    p125: () => ({ q: 'How many 2 × 2 × 2 cubes fit inside this 4 × 4 × 4 cube?', fig: Fig.cubes(4, 4, 4), ref: 'p. 125 · Challenge', small: true,
      opts: ['8', '32', '16', '64'], steps: ['2 fit along each edge.', '2 × 2 × 2 = **8**'] }),
    p142: () => ({ q: 'Each square has a perimeter of **20 cm**. Two of them make this rectangle. What is its perimeter?', fig: Fig.gridShape([[0, 0], [2, 0], [2, 1], [0, 1]], { cell: 120 }), ref: 'p. 142 · Challenge', small: true,
      opts: ['30 cm', '40 cm', '20 cm', '25 cm'], steps: ['Each side is 5 cm.', 'The rectangle is 10 cm by 5 cm: 10 + 5 + 10 + 5 = **30 cm**', 'Not 40: the shared side is inside.'] }),
    p148: () => ({ q: 'Each tile has a perimeter of **40 cm**. What is the perimeter of this shape?', fig: Fig.gridShape([[0, 0], [4, 0], [4, 1], [2, 1], [2, 2], [0, 2]], { cell: 80 }), ref: 'p. 148 · Challenge', small: true,
      opts: ['120 cm', '240 cm', '100 cm', '140 cm'], steps: ['Each side is 10 cm.', '12 outside edges × 10 = **120 cm**'] }),
    p154: () => ({ q: 'Ambika cuts the largest possible square from a 25 cm by 20 cm card. What area of card is left?', fig: Fig.rectText('25 cm', '20 cm', 0.8, 0.8, 'square'), ref: 'p. 154 · Challenge',
      opts: ['100 cm²', '400 cm²', '125 cm²', '500 cm²'], steps: ['Square: 20 × 20 = 400 cm²', '25 × 20 = 500; 500 − 400 = **100 cm²**'] }),
    p157: () => ({ q: 'The strip has a perimeter of **82 cm**. The square cut from the end has an area of **100 cm²**. What area is left?', fig: Fig.rectText('perimeter 82 cm', '', 10 / 31, 0.32, '100 cm²'), ref: 'p. 157 · Challenge',
      opts: ['210 cm²', '310 cm²', '220 cm²', '410 cm²'], steps: ['Square side 10 cm, so the strip is 10 cm wide.', '82 ÷ 2 − 10 = 31 cm long', '(31 − 10) × 10 = **210 cm²**'] }),
  };

  /* picture twins (new numbers, same book type) */
  const PT = {
    line40: V.lineArrow([[300000, 400000, 10000, [300000, 400000]], [300000, 500000, 20000, [300000, 400000, 500000]], [320000, 340000, 2000, [320000, 340000]]], 'p. 40 · twin'),
    cubes: V.cubeCount('p. 125 · twin'),
    area80: () => Object.assign(V.areaScale(), { ref: 'p. 151 · twin' }),
  };

  BC.DATA[5] = {
    year: 5, label: 'Year 5', book: 'Practice Book 5A', pool: 'Challenges + Power Puzzles',

    /* ---------------- BUZZ IN: the book's Challenges, word for word where they fit ---------------- */
    buzz: [
      { q: 'Andy uses 0, 2, 5 and 8 once. The 2 is worth 20, the 8 has a larger value than the 5, and there are no 1s. What is Andy\'s number?', opts: ['8,520', '5,820', '8,502', '8,250'], ref: 'p. 8 · Challenge', steps: ['No 1s: 0 is in the ones. The 2 in the tens.', '8 before 5: **8,520**'] },
      { q: 'Kate uses 0, 2, 5 and 8 once. Her 2 is worth 200, her 8 has a smaller value than her 5, and there are no 10s. What is Kate\'s number?', opts: ['5,208', '5,280', '8,205', '2,508'], ref: 'p. 8 · Challenge', steps: ['2 in the hundreds, 0 in the tens.', '5 before 8: **5,208**'] },
      { q: 'A number rounds to 2,700 to the nearest 100. When 10 is subtracted, it rounds to 2,600. Which could it be?', opts: ['2,655', '2,665', '2,645', '2,705'], ref: 'p. 11 · Challenge', steps: ['Rounds to 2,700: 2,650 to 2,749.', 'Minus 10 → 2,600: 2,560 to 2,659.', 'Both: 2,650 to 2,659 → **2,655**'] },
      { q: '5,400 passengers are on three ships. No ship has fewer than 1,000. Which could be the three numbers?', opts: ['2,000 · 2,400 · 1,000', '2,000 · 2,400 · 1,400', '3,000 · 1,500 · 900', '1,800 · 1,800 · 1,700'], ref: 'p. 17 · Challenge', steps: ['They must add to 5,400 and each be at least 1,000.', '2,000 + 2,400 + 1,000 = **5,400** ✔', '900 is fewer than 1,000.'] },
      { q: 'Using the cards 0, 6, 7, 3 and 2, which multiple of 10 is closest to 70,000?', opts: ['72,360', '67,320', '70,632', '73,260'], ref: 'p. 20 · Challenge', steps: ['A multiple of 10 ends in 0.', '67,320 is 2,680 away; 72,360 is **2,360** away.'] },
      { q: 'Car A costs more than Car B. The digits 0, 1, 2, 4 and 5 appear in both amounts. Which pair works?', opts: ['A £54,210 · B £54,201', 'A £45,210 · B £52,410', 'A £54,210 · B £55,210', 'A £52,140 · B £52,410'], ref: 'p. 23 · Challenge', steps: ['Each price uses 0, 1, 2, 4, 5 once.', 'A must be bigger: **54,210 > 54,201**'] },
      { q: 'Sara\'s number rounds UP to the nearest 10,000, DOWN to the nearest 1,000, DOWN to the nearest 100 and UP to the nearest 10. Which could it be?', opts: ['36,428', '34,215', '36,528', '36,423'], ref: 'p. 26 · Challenge', steps: ['Thousands 5+, hundreds 0-4, tens 0-4, ones 5+.', '**36,428** ✔ (34,215: thousands 4; 36,528: hundreds 5; 36,423: ones 3)'] },
      { q: 'Which card goes in the gap so that _DXXI fits between DCCL_ and CCCX_ (descending order)?', opts: ['C', 'D', 'M', 'X'], ref: 'p. 29 · Challenge', steps: ['_DXXI must be between about 750 and 320.', 'CDXXI = **421** ✔'] },
      { q: '375,910 = 300,000 + 60,000 + 800 + 10 + □', opts: ['15,100', '15,910', '75,100', '5,100'], ref: 'p. 37 · Challenge', steps: ['300,000 + 60,000 + 800 + 10 = 360,810', '375,910 − 360,810 = **15,100**'] },
      { q: '709,257 = 700,000 + 7,000 + 100 + 20 + 5 + □', opts: ['2,132', '9,257', '2,032', '1,132'], ref: 'p. 37 · Challenge', steps: ['700,000 + 7,000 + 100 + 20 + 5 = 707,125', '709,257 − 707,125 = **2,132**'] },
      { q: '4□5,□18 < □21,578 < 73□,000. The same digit goes in every box. What is the **smallest** digit?', opts: ['5', '4', '6', '7'], ref: 'p. 43 · Challenge', steps: ['With 4: 445,418 > 421,578 ✘', 'With 5: 455,518 < 521,578 < 735,000 ✔'] },
      { q: '4□5,□18 < □21,578 < 73□,000. The same digit goes in every box. What is the **largest** digit?', opts: ['7', '8', '9', '6'], ref: 'p. 43 · Challenge', steps: ['With 8: 821,578 > 738,000 ✘', 'With 7: 475,718 < 721,578 < 737,000 ✔'] },
      { q: 'Olivia rounds her 6-digit number to the nearest 100,000 and **all** of its digits change. Which could it be?', opts: ['456,789', '445,678', '456,709', '546,789'], ref: 'p. 46 · Challenge', steps: ['456,789 → 500,000: every digit changes ✔', '445,678 → 400,000 keeps the 4; 456,709 keeps the 0; 546,789 → 500,000 keeps the 5.'] },
      { q: 'Kate rounds her number to the nearest 1,000 and **all** of its digits change. Which could it be?', opts: ['499,678', '489,678', '499,478', '500,678'], ref: 'p. 46 · Challenge', steps: ['499,678 → 500,000 ✔', '489,678 → 490,000; 499,478 → 499,000; 500,678 → 501,000.'] },
      { q: 'The top of an iceberg is 12 m above sea level. The part below is 8 times as deep. What is its total height?', opts: ['108 m', '96 m', '20 m', '104 m'], ref: 'p. 49 · Challenge', steps: ['8 × 12 = 96 m below', '12 + 96 = **108 m**'] },
      { q: 'A is 100,000 more than B. C is 10,000 more than B. C is 1,000 less than 37,928. What is **A**?', opts: ['126,928', '136,928', '127,928', '26,928'], ref: 'p. 52 · Challenge', steps: ['C = 36,928', 'B = 26,928', 'A = **126,928**'] },
      { q: 'Zac\'s cards 8, −4, 7, 2, 14, 1, 20, 4, 13, 10, 16 make two sequences. Which is the one that goes **down**?', opts: ['20, 14, 8, 2, −4', '20, 16, 13, 10, 7', '16, 13, 10, 7, 4', '20, 16, 14, 10, 8'], ref: 'p. 57 · Power puzzle', steps: ['Up in 3s: 1, 4, 7, 10, 13, 16.', 'The rest go down in 6s: **20, 14, 8, 2, −4**'] },
      { q: 'What is five thousand more than four hundred thousand?', opts: ['405,000', '400,005', '450,000', '400,500'], ref: 'p. 60 · Challenge', steps: ['400,000 + 5,000 = **405,000**'] },
      { q: 'Using 0-9 once each: which pair of 5-digit numbers adds to **99,657**?', opts: ['12,063 + 87,594', '12,345 + 87,312', '10,234 + 89,423', '13,062 + 86,594'], ref: 'p. 63 · Challenge', steps: ['12,063 + 87,594 = 99,657 and uses each digit once ✔', 'The others repeat a digit or give a different total.'] },
      { q: 'Chest 1 has 18,455 coins. Chest 2 has 4,200 fewer. Chest 3 has 5,120 fewer than chest 2. How many in **chest 3**?', opts: ['9,135', '13,335', '14,255', '9,235'], ref: 'p. 66 · Challenge', steps: ['18,455 − 4,200 = 14,255', '14,255 − 5,120 = **9,135**'] },
      { q: '349,500 people attend. 186,956 are adults. 73,290 of the children are girls. How many **boys**?', opts: ['89,254', '162,544', '113,666', '99,254'], ref: 'p. 69 · Challenge', steps: ['Children: 162,544', 'Boys: 162,544 − 73,290 = **89,254**'] },
      { q: 'What is the **exact** answer to £19,995 + £3,941 − £4,081?', opts: ['£19,855', '£20,000', '£28,017', '£19,955'], ref: 'p. 72 · Challenge', steps: ['£19,995 + £3,941 = £23,936', '£23,936 − £4,081 = **£19,855**'] },
      { q: 'Work it out mentally: 38 + 41 + 199', opts: ['278', '268', '288', '279'], ref: 'p. 75 · Challenge', steps: ['38 + 41 = 79', '79 + 200 − 1 = **278**'] },
      { q: 'Work it out mentally: 126 + 75 − 194', opts: ['7', '17', '395', '−7'], ref: 'p. 78 · Challenge', steps: ['126 + 75 = 201', '201 − 194 = **7**'] },
      { q: 'Mo checks a calculation by working out 764 + 13,500. Which calculation was he checking?', opts: ['14,264 − 13,500 = 764', '13,500 − 764 = 12,736', '14,264 + 764 = 15,028', '14,264 − 746 = 13,518'], ref: 'p. 81 · Challenge', steps: ['764 + 13,500 = 14,264', 'Inverse: **14,264 − 13,500 = 764**'] },
      { q: 'Eggs: Mon 2,040 · Tue 1,990 · Wed 2,000 · Thu 2,960 · Fri 3,450 · Sat 8,720 · Sun 5,940. How many more at the **weekend** than in the week?', opts: ['2,220', '14,660', '12,440', '2,320'], ref: 'p. 84 · Challenge', steps: ['Weekend 14,660', 'Week 12,440', '**2,220** more'] },
      { q: 'Kate jumps the same amount each time. From 75,560 she lands on 100,385. What is the first number above 200,000 she reaches?', opts: ['224,510', '199,685', '200,385', '225,510'], ref: 'p. 87 · Challenge', steps: ['Jump = 24,825', '75,560 + 5 jumps = 199,685', '+ 24,825 = **224,510**'] },
      { q: 'Toshi works 8, 9, 7.5, 4 and 1.5 hours and is paid £15 an hour. How much does he earn?', opts: ['£450', '£435', '£375', '£465'], ref: 'p. 92 · Challenge', steps: ['30 hours', '30 × £15 = **£450**'] },
      { q: 'Is 777 in the sequence 2, 9, 16, 23, 30, …?', opts: ['No: 779 is', 'Yes: 777 is a multiple of 7', 'No: 770 is', 'Yes: it goes up in 7s'], ref: 'p. 110 · Challenge', steps: ['Every term is 2 more than a multiple of 7.', '777 = 7 × 111, so it is not in it; **779** is.'] },
      { q: 'Kate\'s number is a factor of Max\'s number. What must Max\'s number be?', opts: ['A multiple of Kate\'s number', 'A factor of Kate\'s number', 'Bigger than Kate\'s number', 'An even number'], ref: 'p. 113 · Challenge', steps: ['3 is a factor of 12 → 12 is a multiple of 3.', 'It can be equal (4 and 4), so not always bigger.'] },
      { q: 'Which shows 200 as a product of prime factors?', opts: ['2 × 2 × 2 × 5 × 5', '2 × 2 × 5 × 5', '2 × 100', '4 × 5 × 10'], ref: 'p. 119 · Challenge', steps: ['200 = 2 × 100 = 2 × 2 × 50 = 2 × 2 × 2 × 25', '= **2 × 2 × 2 × 5 × 5**'] },
      { q: 'Isla: "Only square numbers have an odd number of factors." Which shows why?', opts: ['36: its pair 6 × 6 counts once', '12: 1, 2, 3, 4, 6, 12', '9 is odd', '25 = 5 + 20'], ref: 'p. 122 · Challenge', steps: ['Factors come in pairs.', 'A square has one pair with the same number twice, so the count is odd.'] },
      { q: '20³ = ?', opts: ['8,000', '60', '400', '800'], ref: 'p. 125 · Challenge', steps: ['20 × 20 × 20', '= 400 × 20 = **8,000**'] },
      { q: 'Andy: 69 ÷ □ = 9 remainder 6. What is the missing number?', opts: ['7', '8', '6', '9'], ref: 'p. 128 · Challenge', steps: ['69 − 6 = 63', '63 ÷ 9 = **7**'] },
      { q: 'Jamie\'s prime is between 50 and 100 and leaves remainder 1 when divided by 6. Which could it be?', opts: ['67', '59', '53', '71'], ref: 'p. 128 · Challenge', steps: ['67 = 6 × 11 + 1 ✔', '59, 53 and 71 are 1 less than a multiple of 6.'] },
      { q: '2,100 ÷ 30 = 21,000 ÷ □', opts: ['300', '30', '3,000', '70'], ref: 'p. 137 · Challenge', steps: ['21,000 is 10 times 2,100', 'so divide by 10 times 30: **300**'] },
      { q: '6 boxes of 600 g balance some boxes of 400 g. How many 400 g boxes?', opts: ['9', '4', '6', '12'], ref: 'p. 137 · Challenge', steps: ['6 × 600 = 3,600 g', '3,600 ÷ 400 = **9**'] },
      { q: 'Which is 210 as a product of prime factors?', opts: ['2 × 3 × 5 × 7', '2 × 105', '3 × 7 × 10', '2 × 3 × 35'], ref: 'p. 139 · Power puzzle', steps: ['210 = 2 × 105 = 2 × 3 × 35', '= **2 × 3 × 5 × 7**'] },
      { q: 'True or false? "A rectangle made of two identical squares has double the perimeter of one square."', opts: ['False: it is 6 sides, not 8', 'True', 'True, if they are big', 'False: it is half'], ref: 'p. 142 · Challenge', steps: ['The shared side is inside.', 'Outside: 6 square sides, not 8.'] },
      { q: 'A rectangular sports field has a perimeter of 180 m. Which could be its size?', opts: ['60 m by 30 m', '90 m by 90 m', '100 m by 80 m', '45 m by 40 m'], ref: 'p. 145 · Challenge', steps: ['Length + width = 90 m', '60 + 30 = 90 ✔'] },
      { q: 'One square is worth 4 m². How many squares make a rectangle of 80 m²?', opts: ['20', '320', '76', '40'], ref: 'p. 151 · Challenge', steps: ['80 ÷ 4 = **20**', 'e.g. 4 by 5 squares'] },
      { q: 'A rectangle has whole-cm sides and a perimeter of 24 cm. What is its **largest** area?', opts: ['36 cm²', '35 cm²', '24 cm²', '144 cm²'], ref: 'p. 162 · Power puzzle', steps: ['Length + width = 12', '6 × 6 = **36 cm²** (5 × 7 = 35)'] },
      { q: 'A rectangle has whole-cm sides and an area of 24 cm². What is its **largest** perimeter?', opts: ['50 cm', '20 cm', '28 cm', '48 cm'], ref: 'p. 162 · Power puzzle', steps: ['1 × 24 is the longest and thinnest.', '2 × (1 + 24) = **50 cm**'] },
    ],

    /* pictures: book numbers first, then twins */
    vis: [P.p40, P.p55, P.p89, P.p89b, P.p98, P.p101, P.p104, P.p107, P.p116, P.p125, P.p142, P.p148, P.p154, P.p157, PT.line40, PT.cubes, PT.area80],

    /* ---------------- CLUE CRACKER ---------------- */
    clue: [
      { title: 'Sara\'s number', cands: ['36,428', '34,215', '36,528', '36,423'],
        clues: ['I round UP to the nearest 10,000.', 'I round DOWN to the nearest 1,000.', 'I round DOWN to the nearest 100.', 'I round UP to the nearest 10.'],
        test: [(v) => Math.round(v / 10000) * 10000 > v, (v) => Math.round(v / 1000) * 1000 < v, (v) => Math.round(v / 100) * 100 < v, (v) => Math.round(v / 10) * 10 > v], ref: 'p. 26 · Challenge' },
      { title: 'Andy\'s number', cands: ['8,520', '5,820', '8,502', '2,850'],
        clues: ['I use the digits 0, 2, 5 and 8.', 'My 2 is worth 20.', 'My 8 is worth more than my 5.', 'I have no 1s.'],
        test: [(v) => String(v).split('').sort().join('') === '0258', (v) => Math.floor(v / 10) % 10 === 2, (v) => String(v).indexOf('8') < String(v).indexOf('5'), (v) => v % 10 === 0], ref: 'p. 8 · Challenge' },
      { title: 'Kate\'s number', cands: ['5,208', '5,280', '8,205', '2,058'],
        clues: ['My 2 is worth 200.', 'My 8 is worth less than my 5.', 'I have no 10s.'],
        test: [(v) => Math.floor(v / 100) % 10 === 2, (v) => String(v).indexOf('8') > String(v).indexOf('5'), (v) => Math.floor(v / 10) % 10 === 0], ref: 'p. 8 · Challenge' },
      { title: 'Mystery number', cands: ['2,655', '2,648', '2,661', '2,750'],
        clues: ['I round to 2,700 to the nearest 100.', 'Take 10 away and I round to 2,600.'],
        test: [(v) => Math.round(v / 100) * 100 === 2700, (v) => Math.round((v - 10) / 100) * 100 === 2600], ref: 'p. 11 · Challenge' },
      { title: 'Mystery number', cands: ['36', '25', '24', '32'],
        clues: ['I have an odd number of factors.', 'I am between 20 and 40.', 'I am even.'],
        test: [(v) => Array.from({ length: v }, (_, i) => i + 1).filter((d) => v % d === 0).length % 2 === 1, (v) => v > 20 && v < 40, (v) => v % 2 === 0], ref: 'p. 122 · Challenge' },
      { title: 'Mystery number', cands: ['47', '43', '49', '41'],
        clues: ['I am a prime number.', 'I am one less than a multiple of 6.', 'My digits add up to 11.'],
        test: [(v) => BC.isPrime(v), (v) => (v + 1) % 6 === 0, (v) => sum(v) === 11], ref: 'p. 116 · Challenge' },
    ],

    /* ---------------- CRACK THE CODE: the book's missing-digit Challenges ---------------- */
    code: [
      { q: '4□5,□18 < □21,578 < 73□,000', note: 'The same digit goes in every box. What is the **smallest** digit that works?', map: [0, 0, 0, 0], boxes: 1, answer: [5], ref: 'p. 43 · Challenge',
        steps: ['Try 4: 445,418 is not less than 421,578 ✘', 'Try 5: 455,518 < 521,578 < 735,000 ✔'] },
      { q: '4□5,□18 < □21,578 < 73□,000', note: 'The same digit goes in every box. What is the **largest** digit that works?', map: [0, 0, 0, 0], boxes: 1, answer: [7], ref: 'p. 43 · Challenge',
        steps: ['Try 8: 821,578 is not less than 738,000 ✘', 'Try 7: 475,718 < 721,578 < 737,000 ✔'] },
      { q: '150 + 230 + □□□ = 800', boxes: 3, answer: [4, 2, 0], ref: 'p. 75 · Challenge', steps: ['150 + 230 = 380', '800 − 380 = **420**'] },
      { q: '80 × □□ = 800 × 7', boxes: 2, answer: [7, 0], ref: 'p. 137 · Challenge', steps: ['800 × 7 = 5,600', '5,600 ÷ 80 = **70**'] },
      { q: '2,100 ÷ 30 = 21,000 ÷ □□□', boxes: 3, answer: [3, 0, 0], ref: 'p. 137 · Challenge', steps: ['2,100 ÷ 30 = 70', '21,000 ÷ 70 = **300**'] },
      { q: '40,000 ÷ 500 = □□□ ÷ 5', boxes: 3, answer: [4, 0, 0], ref: 'p. 137 · Challenge', steps: ['40,000 ÷ 500 = 80', '80 × 5 = **400**'] },
      { q: '69 ÷ □ = 9 r 6', note: 'Andy\'s division. What is the missing number?', boxes: 1, answer: [7], ref: 'p. 128 · Challenge', steps: ['69 − 6 = 63', '63 ÷ 9 = **7**'] },
      { q: '20 × 20 × 20 = □,□□□', boxes: 4, answer: [8, 0, 0, 0], ref: 'p. 125 · Challenge', steps: ['20 × 20 = 400', '400 × 20 = **8,000**'] },
      { q: '709,257 = 700,000 + 7,000 + 100 + 20 + 5 + □,□□□', boxes: 4, answer: [2, 1, 3, 2], ref: 'p. 37 · Challenge', steps: ['700,000 + 7,000 + 125 = 707,125', '709,257 − 707,125 = **2,132**'] },
    ],
    codeGen: [],

    /* ---------------- NUMBER SNIPER: number lines from the pages ---------------- */
    line: [
      () => ({ prompt: 'Mark **330,000**', min: 300000, max: 400000, step: 10000, labels: [300000, 400000], target: 330000, fmt: n, ref: 'p. 40 · Challenge' }),
      () => ({ prompt: 'Mark **330,000** on this line', min: 300000, max: 500000, step: 20000, labels: [300000, 400000, 500000], target: 330000, fmt: n, ref: 'p. 40 · Challenge' }),
      () => ({ prompt: 'Mark **330,000** on this line', min: 320000, max: 340000, step: 2000, labels: [320000, 330000, 340000], target: 330000, fmt: n, ref: 'p. 40 · Challenge' }),
      () => ({ prompt: 'Kate lands next on **125,210**', min: 75000, max: 225000, step: 25000, labels: [75000, 150000, 225000], target: 125210, fmt: n, ref: 'p. 87 · Challenge' }),
      () => ({ prompt: 'The iceberg is **108 m** tall', min: 0, max: 120, step: 10, labels: [0, 60, 120], target: 108, fmt: n, ref: 'p. 49 · Challenge' }),
      () => ({ prompt: 'Mark **A = 126,928**', min: 100000, max: 150000, step: 5000, labels: [100000, 125000, 150000], target: 126928, fmt: n, ref: 'p. 52 · Challenge' }),
      () => ({ prompt: 'Mark the first number above 200,000: **224,510**', min: 150000, max: 250000, step: 10000, labels: [150000, 200000, 250000], target: 224510, fmt: n, ref: 'p. 87 · Challenge' }),
    ],

    /* ---------------- QUICK DRAW: rules from the Challenges ---------------- */
    draw: [
      () => { const r = (v) => (v - 2) % 7 === 0; return { rule: 'a number in the sequence 2, 9, 16, 23, …', ref: 'p. 110', yes: () => String(2 + 7 * R.int(5, 40)), no: () => { let v; do { v = R.int(30, 290); } while (r(v)); return String(v); }, why: (v) => r(+v) ? `${v} = 7 × ${(+v - 2) / 7} + 2` : `${v} is not 2 more than a multiple of 7, so not in it` }; },
      () => { const r = (v) => BC.isPrime(v) && (v + 1) % 6 === 0; const ys = [5, 11, 17, 23, 29, 41, 47, 53, 59, 71, 83, 89]; return { rule: 'a prime that is one less than a multiple of 6', ref: 'p. 116', yes: () => String(R.pick(ys)), no: () => String(R.pick([7, 13, 19, 31, 35, 37, 43, 65, 77, 95, 49, 25])), why: (v) => r(+v) ? `${v} is prime and ${+v + 1} = 6 × ${(+v + 1) / 6}` : `${v} is not a prime one less than a multiple of 6` }; },
      () => ({ rule: 'a number with an odd number of factors', ref: 'p. 122', yes: () => String(R.int(2, 12) ** 2), no: () => String(R.pick([12, 18, 20, 24, 27, 30, 32, 40, 45, 50, 60, 72, 75])), why: (v) => Number.isInteger(Math.sqrt(+v)) ? `${v} = ${Math.sqrt(+v)} × ${Math.sqrt(+v)}: a square, so its factor count is odd` : `${v} is not a square number, so its factors pair up` }),
      () => G.drawRules.cube(),
      () => { const ok = (v) => Math.round(v / 100) * 100 === 2700 && Math.round((v - 10) / 100) * 100 === 2600; return { rule: 'a number that is 2,700 when rounded to the nearest 100, but 2,600 after taking away 10', ref: 'p. 11', yes: () => n(R.int(2650, 2659)), no: () => n(R.pick([R.int(2600, 2649), R.int(2660, 2749)])), why: (v) => ok(+v.replace(/,/g, '')) ? `${v} → 2,700 and ${n(+v.replace(/,/g, '') - 10)} → 2,600` : `${v} does not do both, so it is not one` }; },
      G.drawRules.multiple(7),
    ],

    /* ---------------- rapid rounds: twins of the Challenges ---------------- */
    tug: [T.chests, T.concert, T.iceberg, T.abc, T.pattern, T.seqIn, T.jumps, T.field, T.cardSquare, T.starTri, T.balance, T.mental, T.round2700, T.cube, T.tiles,
      () => { const it = P.p125(); return it; }, () => P.p142(), () => P.p148(), () => P.p40()],
  };
})();
