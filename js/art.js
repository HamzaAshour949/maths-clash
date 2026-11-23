/* Maths Clash art: the kids in the stands, the two robot mascots, bursts and bunting, all drawn as SVG.
   Flat gradient colouring: every shape is a light-to-rich gradient with a softer outline of its own colour, no black.
   Designed and built by Hamza Ashour. */
'use strict';
(function () {
  const Art = BC.Art = {};

  /* ---------- colour helpers ---------- */
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const toHex = (c) => '#' + c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  /* f < 1 mixes toward a deep version of the same colour, f > 1 toward white */
  const shade = (h, f) => {
    const c = hex(h);
    return f < 1 ? toHex(c.map((v) => v * f)) : toHex(c.map((v) => v + (255 - v) * (f - 1)));
  };
  Art.shade = shade;
  const FEAT = '#3a2142';            // eyebrows, smiles, pupils: a deep plum, never black
  const GOLD = { top: '#fff0a6', mid: '#ffcf3f', low: '#f4a000', edge: '#c98400' };
  Art.GOLD = GOLD;
  const TEAM = {
    red: { main: '#d7353b', light: '#ec6f73', deep: '#a3282d', edge: '#7f1d22', brain: '#cf4a4f', fold: '#a52c31' },
    blue: { main: '#2d6bcf', light: '#6fa2e3', deep: '#1d4fa8', edge: '#173d80', brain: '#4278cd', fold: '#2557b0' },
  };
  Art.TEAM = TEAM;
  const SKIN = ['#ffdcc0', '#f3c19b', '#dca274', '#bb7d50', '#8d5a3a'];
  const HAIR = ['#2b1b12', '#4a2e1a', '#7a4a24', '#d9a43a', '#c4622d', '#26262f'];

  /* one hidden sheet of gradients that every drawing points to */
  Art.defs = function () {
    /* every fill is the colour with a very soft light-to-dark shift, no highlights */
    const lin = (id, top, mid) => `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade(mid, 1.1)}"/><stop offset="0.55" stop-color="${mid}"/><stop offset="1" stop-color="${shade(mid, 0.92)}"/></linearGradient>`;
    let d = '';
    for (const t of ['red', 'blue']) {
      const T = TEAM[t];
      d += lin('g-' + t, T.light, T.main, T.deep);
      d += `<linearGradient id="g-${t}-brain" gradientUnits="userSpaceOnUse" x1="0" y1="20" x2="0" y2="280"><stop offset="0" stop-color="${shade(T.brain, 1.1)}"/><stop offset="0.55" stop-color="${T.brain}"/><stop offset="1" stop-color="${shade(T.brain, 0.9)}"/></linearGradient>`;
    }
    SKIN.forEach((s, i) => { d += lin('g-skin' + i, shade(s, 1.18), s, shade(s, 0.86)); });
    HAIR.forEach((s, i) => { d += lin('g-hair' + i, shade(s, 1.5), s, shade(s, 0.7)); });
    d += lin('g-gold', GOLD.top, GOLD.mid, GOLD.low);
    d += lin('g-white', '#ffffff', '#f1f4ff', '#cfd8fb');
    /* the stands the audience sits on: dark, a little lighter at the top edge */
    d += lin('g-riser-red', '', '#1a0d27');
    d += lin('g-riser-blue', '', '#0a1331');
    return `<svg id="art-defs" width="0" height="0" style="position:absolute" aria-hidden="true"><defs>${d}</defs></svg>`;
  };

  Art.starPath = function (cx, cy, R, r, n = 5, rot = -Math.PI / 2) {
    let d = '';
    for (let i = 0; i < n * 2; i++) {
      const rad = i % 2 ? r : R, a = rot + (i * Math.PI) / n;
      d += (i ? 'L' : 'M') + (cx + Math.cos(a) * rad).toFixed(1) + ' ' + (cy + Math.sin(a) * rad).toFixed(1);
    }
    return d + 'Z';
  };
  /* a tiny seeded random, so the same crowd comes back every time */
  Art.rng = function (seed) {
    let a = seed | 0;
    return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  };

  /* ---------------------------------------------------------------- the kids ---------------------------------------------------------------- */
  const TORSO = 'M14 172 C14 124 36 104 70 104 C104 104 126 124 126 172 Z';
  const SHORT = 'M26 62 C22 30 44 14 70 14 C98 14 118 30 114 62 C110 46 98 38 70 38 C44 38 30 46 26 62 Z';
  const FRINGE = 'M26 62 C22 30 44 14 70 14 C98 14 118 30 114 62 C108 52 100 44 86 40 C78 52 56 50 44 42 C36 46 30 52 26 62 Z';
  const BUZZ = 'M30 52 C30 30 48 17 70 17 C94 17 112 30 110 52 C104 38 90 30 70 30 C50 30 36 38 30 52 Z';
  const LONG_BACK = 'M20 64 C10 104 16 128 34 142 L106 142 C124 128 130 104 120 64 C116 40 94 24 70 24 C46 24 24 40 20 64 Z';

  function arm(x, T, skinEdge, skinFill, prop, side, glowCol) {
    let p = '';
    if (prop === 'glow') {
      /* two glow sticks, lit in the dark */
      /* the glow is a wider, see-through copy under the stick (no blur filters: they are slow when they move) */
      const stick = (a) => `<g transform="rotate(${a} ${x} 176)"><rect x="${x - 9}" y="172" width="18" height="64" rx="9" fill="${glowCol}" fill-opacity=".3"/><rect x="${x - 4}" y="176" width="8" height="54" rx="4" fill="${glowCol}"/><rect x="${x - 1.4}" y="180" width="2.8" height="46" rx="1.4" fill="#fff" fill-opacity=".75"/></g>`;
      p = `<g>${stick(-9)}${stick(11)}</g>`;
    } else if (prop === 'phone') {
      p = `<g><rect x="${x - 13}" y="169" width="26" height="38" rx="9" fill="#bfe6ff" fill-opacity=".3"/><rect x="${x - 8}" y="174" width="16" height="28" rx="3.5" fill="#dff2ff"/><rect x="${x - 6}" y="177" width="12" height="20" rx="2" fill="#fff"/></g>`;
    } else if (prop === 'pompom') {
      const pts = Array.from({ length: 7 }, (_, k) => [x + Math.cos((k * 2 * Math.PI) / 7) * 14, 184 + Math.sin((k * 2 * Math.PI) / 7) * 14]);
      p = pts.map(([px, py]) => `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="8.5" fill="url(#g-gold)" stroke="${GOLD.edge}" stroke-width="1.8"/>`).join('') + `<circle cx="${x}" cy="184" r="11" fill="${GOLD.top}"/>`;
    } else if (prop === 'flag' && side === 'r') {
      p = `<rect x="${x - 2.5}" y="166" width="5" height="78" rx="2.5" fill="#f1f4ff" stroke="#aab5e6" stroke-width="1.6"/><path d="M${x + 2.5} 224 L${x + 46} 238 L${x + 2.5} 254 Z" fill="${T.main}" stroke="${T.deep}" stroke-width="2" stroke-linejoin="round"/><path d="${Art.starPath(x + 16, 239, 7, 3, 5)}" fill="${GOLD.mid}"/>`;
    }
    return `<path d="M${x} 122 L${x} 158" stroke="${T.deep}" stroke-width="22" stroke-linecap="round" fill="none"/><path d="M${x} 122 L${x} 158" stroke="${T.main}" stroke-width="17" stroke-linecap="round" fill="none"/><circle cx="${x}" cy="168" r="10.5" fill="${skinFill}" stroke="${skinEdge}" stroke-width="2.4"/>${p}`;
  }

  /* o: {team, skinI, hairI, hair (style), acc ('cap'|'band'|'bandTeam'|''), prop ('pompom'|'flag'|'')} */
  Art.kid = function (o) {
    const T = TEAM[o.team], skin = SKIN[o.skinI], hc = HAIR[o.hairI];
    const sEdge = shade(skin, 0.68), hEdge = shade(hc, 0.55);
    const skinF = `url(#g-skin${o.skinI})`, hairF = `url(#g-hair${o.hairI})`;
    const hp = (d) => `<path d="${d}" fill="${hairF}" stroke="${hEdge}" stroke-width="2.4" stroke-linejoin="round"/>`;
    let back = '', front = '';
    switch (o.hair) {
      case 'fringe': front = hp(FRINGE); break;
      case 'buzz': front = `<path d="${BUZZ}" fill="${hairF}" fill-opacity=".85" stroke="${hEdge}" stroke-width="2.4" stroke-linejoin="round"/>`; break;
      case 'long': back = hp(LONG_BACK); front = hp(FRINGE); break;
      case 'ponytail': back = hp('M96 34 C136 22 148 64 126 96 C124 74 112 58 98 50 Z') + `<circle cx="104" cy="42" r="6.5" fill="url(#g-gold)" stroke="${GOLD.edge}" stroke-width="1.6"/>`; front = hp(SHORT); break;
      case 'pigtails':
        back = hp('M30 44 C4 50 -2 88 14 108 C28 92 34 70 36 52 Z') + hp('M110 44 C136 50 142 88 126 108 C112 92 106 70 104 52 Z');
        front = hp(SHORT) + `<circle cx="31" cy="48" r="6.5" fill="url(#g-${o.team})" stroke="${T.deep}" stroke-width="1.6"/><circle cx="109" cy="48" r="6.5" fill="url(#g-${o.team})" stroke="${T.deep}" stroke-width="1.6"/>`; break;
      case 'curly': {
        const c = [[26, 52, 15], [34, 30, 17], [52, 17, 19], [72, 13, 20], [92, 17, 19], [108, 30, 17], [116, 52, 15], [70, 30, 24]];
        front = `<g stroke="${hEdge}" stroke-width="6" fill="${hEdge}">${c.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('')}</g><g fill="${hairF}">${c.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('')}</g>`;
        break;
      }
      default: front = hp(SHORT);
    }
    let acc = '';
    if (o.acc === 'cap') {
      acc = `<path d="M22 50 C20 18 44 6 70 6 C98 6 120 18 118 50 Z" fill="url(#g-${o.team})" stroke="${T.deep}" stroke-width="2.4" stroke-linejoin="round"/><path d="M20 50 C40 64 100 64 120 50 C100 42 40 42 20 50 Z" fill="${T.deep}" stroke="${T.edge}" stroke-width="2" stroke-linejoin="round"/><path d="${Art.starPath(70, 27, 10, 4.4, 5)}" fill="url(#g-gold)" stroke="${GOLD.edge}" stroke-width="1.2"/>`;
    } else if (o.acc === 'band' || o.acc === 'bandTeam') {
      const fill = o.acc === 'band' ? 'url(#g-gold)' : `url(#g-${o.team})`, edge = o.acc === 'band' ? GOLD.edge : T.deep;
      acc = `<path d="M24 46 C40 34 100 34 116 46" stroke="${edge}" stroke-width="14" fill="none" stroke-linecap="round"/><path d="M24 46 C40 34 100 34 116 46" stroke="${o.acc === 'band' ? GOLD.mid : T.main}" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M30 42 C46 33 94 33 110 42" stroke="#fff" stroke-opacity=".45" stroke-width="3" fill="none" stroke-linecap="round"/>`;
      void fill;
    }
    const eyes = (ry, py) => `<ellipse cx="54" cy="72" rx="9" ry="${ry}" fill="#fff"/><ellipse cx="86" cy="72" rx="9" ry="${ry}" fill="#fff"/><circle cx="55" cy="${py}" r="5.2" fill="${FEAT}"/><circle cx="87" cy="${py}" r="5.2" fill="${FEAT}"/><circle cx="57" cy="${py - 2}" r="1.8" fill="#fff"/><circle cx="89" cy="${py - 2}" r="1.8" fill="#fff"/>`;
    const brow = (d) => `<path d="${d}" stroke="${FEAT}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
    const face = `
      <g class="f f-idle"><g class="blink">${eyes(10.5, 73)}</g>${brow('M44 58 Q54 52 64 57')}${brow('M76 57 Q86 52 96 58')}<path d="M56 90 Q70 100 84 90" stroke="${FEAT}" stroke-width="4" fill="none" stroke-linecap="round"/></g>
      <g class="f f-happy"><path d="M45 74 Q54 60 63 74" stroke="${FEAT}" stroke-width="4.4" fill="none" stroke-linecap="round"/><path d="M77 74 Q86 60 95 74" stroke="${FEAT}" stroke-width="4.4" fill="none" stroke-linecap="round"/><path d="M48 86 Q70 118 92 86 Z" fill="#7a1630" stroke="#7a1630" stroke-width="2" stroke-linejoin="round"/><path d="M52 88 Q70 94 88 88 L86 93 Q70 98 54 93 Z" fill="#fff"/></g>
      <g class="f f-wow">${eyes(13, 72)}${brow('M43 52 Q54 44 65 51')}${brow('M75 51 Q86 44 97 52')}<ellipse cx="70" cy="96" rx="8" ry="11" fill="#7a1630"/></g>
      <g class="f f-sad">${eyes(10, 76)}${brow('M43 60 Q52 56 65 50')}${brow('M75 50 Q88 56 97 60')}<path d="M54 98 Q70 84 86 98" stroke="${FEAT}" stroke-width="4.2" fill="none" stroke-linecap="round"/></g>
      <g class="f f-angry"><circle cx="42" cy="86" r="10" fill="#ff4a4a" opacity=".42"/><circle cx="98" cy="86" r="10" fill="#ff4a4a" opacity=".42"/><ellipse cx="54" cy="74" rx="8.5" ry="7" fill="#fff"/><ellipse cx="86" cy="74" rx="8.5" ry="7" fill="#fff"/><circle cx="56" cy="75" r="4.6" fill="${FEAT}"/><circle cx="84" cy="75" r="4.6" fill="${FEAT}"/>${brow('M42 54 L65 66')}${brow('M75 66 L98 54')}<path d="M52 90 H88 V102 Q70 108 52 102 Z" fill="#fff" stroke="${FEAT}" stroke-width="2.6" stroke-linejoin="round"/><path d="M61 90 V104 M70 90 V106 M79 90 V104" stroke="${FEAT}" stroke-width="1.8"/></g>
      <g class="f f-nerv">${eyes(8, 72)}${brow('M44 54 Q54 56 64 52')}${brow('M76 52 Q86 56 96 54')}<path d="M54 94 q4 -6 8 0 t8 0 t8 0 t8 0" stroke="${FEAT}" stroke-width="3.8" fill="none" stroke-linecap="round"/></g>`;
    const drop = (d, cls) => `<path class="${cls}" d="${d}" fill="#8fdcff" stroke="#4fb4e6" stroke-width="1.4"/>`;
    const extras = drop('M44 84 q-6 10 0 13 q6 -3 0 -13z', 'tear') + drop('M96 84 q-6 10 0 13 q6 -3 0 -13z', 'tear t2') + drop('M112 36 q-7 11 0 15 q7 -4 0 -15z', 'sweat')
      + `<g class="steam"><circle cx="46" cy="8" r="6" fill="#fff" stroke="#c9d2fb" stroke-width="1.6"/><circle cx="70" cy="0" r="7" fill="#fff" stroke="#c9d2fb" stroke-width="1.6"/><circle cx="94" cy="8" r="6" fill="#fff" stroke="#c9d2fb" stroke-width="1.6"/></g>`;
    return `<svg class="ksv" viewBox="0 0 140 170" xmlns="http://www.w3.org/2000/svg">
      ${back}
      <path d="${TORSO}" fill="url(#g-${o.team})" stroke="${T.deep}" stroke-width="2.6" stroke-linejoin="round"/>
      <path d="${Art.starPath(70, 132, 10, 4.4, 5)}" fill="url(#g-gold)" stroke="${GOLD.edge}" stroke-width="1.2" stroke-linejoin="round"/>
      <g class="arm l"><g class="wv">${arm(28, T, sEdge, skinF, o.prop, 'l', o.glowCol)}</g></g>
      <g class="arm r"><g class="wv">${arm(112, T, sEdge, skinF, o.prop, 'r', o.glowCol)}</g></g>
      <g class="hd"><g class="hh">
        <circle cx="26" cy="68" r="8.5" fill="${skinF}" stroke="${sEdge}" stroke-width="2.4"/><circle cx="114" cy="68" r="8.5" fill="${skinF}" stroke="${sEdge}" stroke-width="2.4"/>
        <circle cx="70" cy="62" r="44" fill="${skinF}" stroke="${sEdge}" stroke-width="2.6"/>
        <circle cx="45" cy="88" r="7" fill="#ff8a8a" opacity=".34"/><circle cx="95" cy="88" r="7" fill="#ff8a8a" opacity=".34"/>
        ${face}
        ${front}${acc}${extras}
      </g></g>
    </svg>`;
  };

  /* a random-but-repeatable kid for a team */
  Art.randomKid = function (team, seed, i) {
    const r = Art.rng(seed * 977 + i * 131 + (team === 'red' ? 7 : 19));
    const pick = (a) => a[Math.floor(r() * a.length)];
    const hair = pick(['short', 'short', 'fringe', 'curly', 'ponytail', 'pigtails', 'long', 'buzz']);
    const acc = pick(['', '', 'cap', 'band', 'bandTeam']);
    const prop = pick(['glow', 'glow', 'glow', 'glow', 'phone', 'phone', 'pompom', 'flag', '']);
    const glowCol = pick(team === 'red' ? ['#e8666a', '#e8666a', '#ffc43d', '#ec9a9c'] : ['#5f9be6', '#5f9be6', '#5bd9a1', '#9cc0ee']);
    return { team, skinI: Math.floor(r() * SKIN.length), hairI: Math.floor(r() * HAIR.length), hair, acc: hair === 'curly' && acc === 'cap' ? 'band' : acc, prop, glowCol };
  };

  /* ---------------------------------------------------------------- brain mascots ---------------------------------------------------------------- */
  Art.brain = function (team) {
    const T = TEAM[team], edge = shade(T.fold, 0.72), tone = T.fold;
    const HEX = '52,168 106,72 214,72 268,168 214,268 106,268';
    const shape = team === 'red'
      ? `<polygon points="${HEX}" fill="${edge}" stroke="${edge}" stroke-width="18" stroke-linejoin="round"/><polygon points="${HEX}" fill="${T.brain}" stroke="${T.brain}" stroke-width="6" stroke-linejoin="round"/><path d="M98 116 C104 100 116 92 134 90" stroke="#fff" stroke-opacity=".4" stroke-width="10" fill="none" stroke-linecap="round"/>`
      : `<circle cx="160" cy="168" r="110" fill="${edge}"/><circle cx="160" cy="168" r="102" fill="${T.brain}"/><path d="M84 124 C92 100 112 86 138 84" stroke="#fff" stroke-opacity=".4" stroke-width="10" fill="none" stroke-linecap="round"/>`;
    const glove = `fill="url(#g-white)" stroke="#aab5e6" stroke-width="3"`;
    const arm = (side) => {
      const x = side === 'l' ? 58 : 262, hx = side === 'l' ? 34 : 286;
      const d = `M${x} 204 Q${(x + hx) / 2} 250 ${hx} 268`;
      return `<g class="marm ${side}"><g class="wv"><path d="${d}" stroke="${edge}" stroke-width="24" fill="none" stroke-linecap="round"/><path d="${d}" stroke="${T.brain}" stroke-width="17" fill="none" stroke-linecap="round"/><circle cx="${hx}" cy="276" r="21" ${glove}/><circle cx="${side === 'l' ? hx + 14 : hx - 14}" cy="266" r="9" ${glove}/></g></g>`;
    };
    const eye = (x) => `<ellipse cx="${x}" cy="172" rx="24" ry="28" fill="#fff"/><ellipse cx="${x}" cy="172" rx="24" ry="28" fill="none" stroke="#d3daf7" stroke-width="3"/><circle cx="${x + 3}" cy="176" r="13" fill="${FEAT}"/><circle cx="${x + 8}" cy="170" r="5" fill="#fff"/>`;
    const lid = `stroke="${FEAT}" stroke-width="7" fill="none" stroke-linecap="round"`;
    return `<svg class="msv" viewBox="0 0 320 380" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="160" cy="358" rx="96" ry="14" fill="#0b0e50" opacity=".28"/>
      <g class="mbody">
        <g class="mleg"><rect x="116" y="250" width="32" height="68" rx="15" fill="${T.brain}" stroke="${edge}" stroke-width="4"/><rect x="172" y="250" width="32" height="68" rx="15" fill="${T.brain}" stroke="${edge}" stroke-width="4"/>
          <ellipse cx="128" cy="332" rx="30" ry="16" fill="url(#g-white)" stroke="#aab5e6" stroke-width="3"/><ellipse cx="192" cy="332" rx="30" ry="16" fill="url(#g-white)" stroke="#aab5e6" stroke-width="3"/></g>
        ${arm('l')}${arm('r')}
        <line x1="160" y1="70" x2="160" y2="38" stroke="${edge}" stroke-width="10" stroke-linecap="round"/><circle cx="160" cy="28" r="16" fill="${GOLD.mid}" stroke="${GOLD.edge}" stroke-width="4"/>
        ${shape}
        <circle cx="98" cy="204" r="13" fill="#e0888d" opacity=".6"/><circle cx="222" cy="204" r="13" fill="#e0888d" opacity=".6"/>
        <g class="mf mf-idle"><g class="blink">${eye(126)}${eye(194)}</g><path d="M116 156 Q126 148 140 152" ${lid}/><path d="M180 152 Q194 148 204 156" ${lid}/>
          <path d="M116 210 Q160 254 204 210" stroke="${FEAT}" stroke-width="9" fill="none" stroke-linecap="round"/></g>
        <g class="mf mf-cheer"><path d="M100 178 Q126 142 152 178" stroke="${FEAT}" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M168 178 Q194 142 220 178" stroke="${FEAT}" stroke-width="9" fill="none" stroke-linecap="round"/>
          <path d="M112 202 Q160 280 208 202 Z" fill="#7a1630" stroke="#7a1630" stroke-width="3" stroke-linejoin="round"/><path d="M122 206 Q160 222 198 206 L192 220 Q160 234 128 220 Z" fill="#fff"/></g>
        <g class="mf mf-sad">${eye(126)}${eye(194)}<path d="M104 150 Q122 146 142 134" ${lid}/><path d="M178 134 Q198 146 216 150" ${lid}/>
          <path d="M126 242 Q160 208 194 242" ${lid}/><path class="tear" d="M104 196 q-10 18 0 24 q10 -6 0 -24z" fill="#8fdcff" stroke="#4fb4e6" stroke-width="2"/></g>
        <g class="mf mf-wow">${eye(126)}${eye(194)}<path d="M110 144 Q126 130 144 142" ${lid}/><path d="M176 142 Q194 130 210 144" ${lid}/><ellipse cx="160" cy="226" rx="17" ry="22" fill="#7a1630"/></g>
      </g>
    </svg>`;
  };

  Art.mascot = Art.brain;

  /* ---------------------------------------------------------------- decorations ---------------------------------------------------------------- */
  /* the little face of a mascot for the score plates */
  Art.avatar = function (team) {
    const T = TEAM[team], edge = shade(T.fold, 0.72);
    const HEX = '8,50 28,12 72,12 92,50 72,88 28,88';
    const body = team === 'red'
      ? `<polygon points="${HEX}" fill="${edge}" stroke="${edge}" stroke-width="8" stroke-linejoin="round"/><polygon points="${HEX}" fill="${T.brain}" stroke="${T.brain}" stroke-width="2" stroke-linejoin="round"/>`
      : `<circle cx="50" cy="50" r="46" fill="${edge}"/><circle cx="50" cy="50" r="42" fill="${T.brain}"/>`;
    return `<svg class="avatar" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${body}<ellipse cx="34" cy="46" rx="9" ry="11" fill="#fff"/><ellipse cx="66" cy="46" rx="9" ry="11" fill="#fff"/><circle cx="36" cy="48" r="5" fill="${FEAT}"/><circle cx="68" cy="48" r="5" fill="${FEAT}"/><path d="M32 64 Q50 80 68 64 Z" fill="#7a1630"/></svg>`;
  };
})();
