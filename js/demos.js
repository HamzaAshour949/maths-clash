/* Maths Clash round intros: a small looping picture of how each round is played (SVG + CSS animations in game.css). */
'use strict';
(function () {
  const RED = '#d7353b', BLUE = '#2d6bcf', INK = '#eef1ff', SOFT = '#9aa3c8', AMB = '#ffc94d', GOOD = '#2fe08a', DARK = '#0d1020';
  const T = (x, y, s, size = 26, fill = INK, w = 800, anchor = 'middle', cls = '') => `<text class="${cls}" x="${x}" y="${y}" fill="${fill}" font-family="Nunito, sans-serif" font-weight="${w}" font-size="${size}" text-anchor="${anchor}" dominant-baseline="middle">${s}</text>`;
  const card = (x, y, w, h, fill = 'rgba(10,12,26,.78)', stroke = 'rgba(255,255,255,.28)', r = 14, cls = '') => `<rect class="${cls}" x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="3"/>`;
  const svg = (body) => `<svg viewBox="0 0 900 330" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
  /* the answer diamond in miniature, at centre (cx, cy) */
  const diamond = (cx, cy, hi = -1, cls = '') => [[0, -48], [-92, 0], [92, 0], [0, 48]].map(([dx, dy], i) =>
    `<rect class="${i === hi ? cls : ''}" x="${cx + dx - 70}" y="${cy + dy - 18}" width="140" height="36" rx="9" fill="${i === hi ? 'rgba(47,224,138,.35)' : 'rgba(255,255,255,.1)'}" stroke="${i === hi ? GOOD : 'rgba(255,255,255,.35)'}" stroke-width="2.5"/>`).join('');
  const buzzer = (x, y, col, cls = '', label = '') => `<g class="${cls}"><circle cx="${x}" cy="${y + 10}" r="62" fill="${DARK}"/><circle cx="${x}" cy="${y}" r="62" fill="${col}"/><circle cx="${x - 18}" cy="${y - 20}" r="16" fill="rgba(255,255,255,.35)"/></g>${label ? T(x, y + 100, label, 24, INK, 800) : ''}`;
  const lock = (x, y, col, txt) => `<g><rect x="${x - 34}" y="${y - 8}" width="68" height="54" rx="10" fill="${col}"/><path d="M${x - 20} ${y - 8} v-14 a20 20 0 0 1 40 0 v14" fill="none" stroke="${col}" stroke-width="8"/>${T(x, y + 19, '?', 30, '#fff', 900)}</g>${T(x, y + 82, txt, 22, INK, 800)}`;

  BC.Demos = {
    buzz: () => svg(
      card(300, 10, 300, 92) + T(450, 40, 'Question', 26, SOFT) + `<rect x="330" y="62" width="240" height="10" rx="5" fill="rgba(255,255,255,.3)"/>` +
      diamond(450, 200) +
      buzzer(110, 150, RED, 'd-press', 'RED buzzes first') + buzzer(790, 150, BLUE, '', 'BLUE can steal') +
      `<g class="d-pop">${card(52, 20, 116, 46, RED, RED, 23)}${T(110, 44, '1st!', 26, '#fff', 900)}</g>` +
      `<g class="d-pop2">${card(370, 268, 160, 50, 'rgba(215, 53, 59,.25)', RED, 25)}${T(450, 294, 'wrong −50', 24, '#f1bdbf', 900)}</g>`),

    board: () => svg(
      ['Numbers', 'Add & Sub', 'Fractions', 'Factors', 'Shapes'].map((n, c) => card(40 + c * 168, 14, 156, 40, 'rgba(255,255,255,.14)', 'rgba(255,255,255,.2)', 11) + T(118 + c * 168, 41, n, 19, INK, 800)).join('') +
      [0, 1, 2].map((r) => [0, 1, 2, 3, 4].map((c) => {
        const hot = r === 1 && c === 2;
        return `<g class="${hot ? 'd-press' : ''}">${card(40 + c * 168, 68 + r * 76, 156, 64, hot ? RED : 'rgba(255,255,255,.1)', hot ? '#fff' : 'rgba(255,255,255,.2)', 13)}${T(100 + c * 168, 110 + r * 76, '+' + [100, 300, 500][r], 28, hot ? '#fff' : AMB, 900)}${T(158 + c * 168, 108 + r * 76, '−' + [50, 150, 250][r], 19, hot ? '#ffe0e6' : '#ec8f92', 900)}</g>`;
      }).join('')).join('') +
      `<g class="d-pop">${card(250, 292, 400, 32, 'rgba(255,255,255,.12)', 'rgba(255,255,255,.2)', 16)}${T(450, 316, 'wrong? the other team may steal it', 20, INK, 800)}</g>`),

    tiebreak: () => svg(
      card(300, 8, 300, 70) + T(450, 34, 'The SAME question', 26, INK, 900) + `<rect x="340" y="54" width="220" height="9" rx="4.5" fill="rgba(255,255,255,.3)"/>` +
      diamond(450, 176, 3, 'd-press') +
      `<rect class="d-blink" x="282" y="152" width="152" height="48" rx="13" fill="none" stroke="${RED}" stroke-width="5"/>` +
      `<rect class="d-blink" x="466" y="152" width="152" height="48" rx="13" fill="none" stroke="${BLUE}" stroke-width="5"/>` +
      T(110, 140, 'RED', 34, '#ff7c80', 900) + T(110, 176, 'presses', 22, SOFT) + T(110, 204, 'an answer', 22, SOFT) +
      T(790, 140, 'BLUE', 34, '#7fb2ff', 900) + T(790, 176, 'presses', 22, SOFT) + T(790, 204, 'an answer', 22, SOFT) +
      [RED, RED, null, BLUE, null, null].map((c, i) => `<circle cx="${662 + i * 36 + (i > 2 ? 14 : 0)}" cy="30" r="14" fill="${c || 'rgba(255,255,255,.16)'}"/>`).join('') + T(776, 64, 'first to 3 points', 19, SOFT) +
      `<g class="d-pop">${card(190, 270, 520, 46, 'rgba(47,224,138,.22)', GOOD, 23)}${T(450, 294, 'FASTEST right answer = 1 point', 25, '#c9ffe3', 900)}</g>`),

    pic: () => svg(
      card(40, 20, 330, 290) + [70, 150, 110, 190].map((h, i) => `<rect x="${85 + i * 70}" y="${270 - h}" width="44" height="${h}" rx="5" fill="${AMB}"/>`).join('') +
      `<line x1="70" y1="272" x2="345" y2="272" stroke="${INK}" stroke-width="3"/>` + T(205, 48, 'a picture question', 22, SOFT) +
      diamond(560, 112) + lock(470, 222, RED, 'RED locked') + lock(650, 222, BLUE, 'BLUE locked') +
      `<g class="d-blink">${T(780, 40, 'hidden', 24, AMB, 900)}${T(780, 70, 'until both', 22, SOFT)}${T(780, 96, 'lock in', 22, SOFT)}</g>`),

    draw: () => svg(
      card(200, 8, 500, 60) + T(450, 40, 'Rule: a multiple of 7', 28, INK, 900) +
      ['12', '19', '21', '30'].map((v, i) => `<g class="d-card d-card${i}">${card(85 + i * 190, 100, 150, 120, 'rgba(255,255,255,.07)', 'rgba(255,255,255,.35)', 18)}${T(160 + i * 190, 162, v, 56, INK, 900)}</g>`).join('') +
      T(450, 262, 'They flash up one by one: press when one fits!', 26, INK) + T(450, 302, '21 = 7 × 3 ✔ · press too early = −50', 24, AMB, 900)),

    line: () => svg(
      `<line x1="70" y1="170" x2="830" y2="170" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>` +
      Array.from({ length: 11 }, (_, i) => `<line x1="${70 + i * 76}" y1="${i % 5 ? 156 : 146}" x2="${70 + i * 76}" y2="${i % 5 ? 184 : 194}" stroke="${INK}" stroke-width="${i % 5 ? 3 : 5}"/>`).join('') +
      T(70, 204, '0', 24, SOFT) + T(450, 204, '50', 24, SOFT) + T(830, 204, '100', 24, SOFT) +
      `<g class="d-pin">${`<line x1="602" y1="110" x2="602" y2="170" stroke="${GOOD}" stroke-width="6"/>`}${card(552, 70, 100, 42, GOOD, GOOD, 21)}${T(602, 92, '70', 28, '#062214', 900)}</g>` +
      `<g class="d-slide-a"><line x1="300" y1="70" x2="300" y2="170" stroke="${RED}" stroke-width="6"/><circle cx="300" cy="62" r="34" fill="${RED}" stroke="#fff" stroke-width="4"/>${T(300, 63, 'R', 26, '#fff', 900)}</g>` +
      `<g class="d-slide-b"><line x1="560" y1="170" x2="560" y2="242" stroke="${BLUE}" stroke-width="6"/><circle cx="560" cy="268" r="27" fill="${BLUE}" stroke="#fff" stroke-width="4"/>${T(560, 269, 'B', 22, '#fff', 900)}</g>` +
      T(450, 316, 'Slide your marker with the stick · the closest team scores', 22, INK)),

    code: () => svg(
      card(130, 10, 640, 80) + T(450, 52, '5 □ × 3 □ = 1,995', 40, INK, 900) +
      [RED, BLUE].map((col, t) => card(60 + t * 430, 120, 350, 190, 'rgba(10,12,26,.78)', col) +
        [0, 1].map((k) => `<g>${card(150 + t * 430 + k * 110, 170, 80, 96, 'rgba(255,255,255,.12)', '#fff', 12)}${T(190 + t * 430 + k * 110, 220, String([7, 5][k]), 50, '#fff', 900, 'middle', k === 0 ? 'd-dial' : '')}` +
          `<path class="d-blink" d="M${178 + t * 430 + k * 110} 160 l12 -16 l12 16 z" fill="#fff"/><path class="d-blink" d="M${178 + t * 430 + k * 110} 276 l12 16 l12 -16 z" fill="#fff"/></g>`).join('')).join('')),

    flash: () => svg(
      `<path d="M120 20 L60 170 L110 170 L80 310 L190 130 L135 130 L180 20 Z" fill="${AMB}"/>` +
      [2, 1, 0].map((k) => `<g class="${k === 0 ? 'd-deal' : ''}">${card(280 + k * 26, 40 + k * 14, 360, 210, k ? 'rgba(20,24,44,.95)' : 'rgba(30,36,64,.98)', 'rgba(255,255,255,.35)')}</g>`).join('') +
      T(460, 110, 'Question after question', 28, INK, 900) + T(460, 160, 'first right answer', 26, SOFT) + T(460, 200, '+50', 40, GOOD, 900) +
      T(780, 120, 'wrong', 28, INK, 900) + T(780, 165, '−25', 44, '#ff8a9a', 900) + T(780, 210, 'and out of', 22, SOFT) + T(780, 238, 'that question', 22, SOFT)),

    clue: () => svg(
      card(40, 14, 540, 300) + T(310, 46, 'Which number am I?', 28, INK, 900) +
      [['I am a multiple of 6.', '200'], ['I am a factor of 60.', '150'], ['I am less than 50.', '100']].map(([c, w], i) =>
        `<g class="d-reveal d-reveal${i}">${T(70, 104 + i * 70, `${i + 1}. ${c}`, 26, INK, 800, 'start')}${card(470, 84 + i * 70, 90, 40, 'rgba(255,201,77,.22)', AMB, 20)}${T(515, 104 + i * 70, w, 24, AMB, 900)}</g>`).join('') +
      diamond(740, 150) + T(740, 250, 'Lock in early', 26, INK, 900) + T(740, 284, 'for more points', 24, SOFT)),

    tug: () => svg(
      `<rect x="80" y="70" width="740" height="16" rx="8" fill="#c9b289"/>` +
      `<circle cx="80" cy="78" r="40" fill="${RED}"/>${T(80, 79, 'R', 30, '#fff', 900)}<circle cx="820" cy="78" r="40" fill="${BLUE}"/>${T(820, 79, 'B', 30, '#fff', 900)}` +
      `<line x1="450" y1="44" x2="450" y2="112" stroke="#fff" stroke-width="4" opacity=".6"/>` +
      `<g class="d-knot"><circle cx="450" cy="78" r="34" fill="#dfe5ff" stroke="#fff" stroke-width="4"/></g>` +
      card(60, 150, 360, 160, 'rgba(215, 53, 59,.12)', RED) + card(480, 150, 360, 160, 'rgba(45, 107, 207,.12)', BLUE) +
      T(240, 200, 'RED answers', 28, INK, 900) + T(240, 245, 'right = pull', 26, '#f1bdbf') + T(660, 200, 'BLUE answers', 28, INK, 900) + T(660, 245, 'wrong = frozen', 26, '#c2dcff') +
      T(450, 132, 'pull the knot to your side', 22, SOFT)),
  };
})();
