/* Maths Clash figures: the Practice Book's pictures drawn as SVG (white chalk on the dark board, amber shading). */
'use strict';
(function () {
  const Fig = BC.Fig = {};
  const C = { ink: '#eef1ff', soft: '#9aa3c8', grid: '#353c60', shade: '#ffc94d', shade2: '#ffe3a0', dark: '#0d1020' };
  Fig.C = C;
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const T = (x, y, s, o = {}) => `<text x="${x}" y="${y}" fill="${o.fill || C.ink}" font-family="Nunito, sans-serif" font-weight="${o.w || 800}" font-size="${o.size || 28}" text-anchor="${o.anchor || 'middle'}" dominant-baseline="${o.base || 'middle'}">${esc(s)}</text>`;
  const svg = (w, h, body) => `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">${body}</svg>`;
  const n = (v) => BC.n(v);

  /* place value grid with counters: heads like ['HTh','TTh','Th','H','T','O'], counts per column */
  Fig.pv = function (heads, counts) {
    const cw = 120, hh = 56, rows = 5, R = 19, H = hh + rows * 46 + 20, W = cw * heads.length;
    let b = `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="14" fill="none" stroke="${C.soft}" stroke-width="3"/>`;
    b += `<line x1="0" y1="${hh}" x2="${W}" y2="${hh}" stroke="${C.soft}" stroke-width="3"/>`;
    heads.forEach((h, i) => {
      if (i) b += `<line x1="${i * cw}" y1="0" x2="${i * cw}" y2="${H}" stroke="${C.soft}" stroke-width="3"/>`;
      b += T(i * cw + cw / 2, hh / 2 + 2, h, { size: 30 });
      for (let k = 0; k < counts[i]; k++) {
        const cx = i * cw + cw / 2 + (k % 2 ? 24 : -24), cy = hh + 32 + Math.floor(k / 2) * 46;
        b += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="${C.shade}" stroke="${C.dark}" stroke-width="2"/>`;
      }
    });
    return svg(W, H, b);
  };

  /* number line with ticks, some labels and arrows {v, label} */
  Fig.line = function (min, max, step, labels, arrows, fmt = n) {
    const W = 1100, x0 = 70, x1 = W - 70, y = 150, X = (v) => x0 + ((v - min) / (max - min)) * (x1 - x0);
    let b = `<line x1="${x0 - 30}" y1="${y}" x2="${x1 + 30}" y2="${y}" stroke="${C.ink}" stroke-width="5" stroke-linecap="round"/>`;
    const nT = Math.round((max - min) / step);
    for (let i = 0; i <= nT; i++) {
      const v = min + i * step, big = labels.some((l) => Math.abs(l - v) < step / 1000);
      b += `<line x1="${X(v)}" y1="${y - (big ? 24 : 15)}" x2="${X(v)}" y2="${y + (big ? 24 : 15)}" stroke="${C.ink}" stroke-width="${big ? 4 : 3}"/>`;
    }
    labels.forEach((v) => { b += T(X(v), y + 52, fmt(v), { size: 30, fill: C.soft }); });
    arrows.forEach((a) => {
      const ax = X(a.v);
      b += `<path d="M${ax} ${y - 30} l-16 -28 h32 z" fill="${C.shade}"/><line x1="${ax}" y1="${y - 56}" x2="${ax}" y2="${y - 92}" stroke="${C.shade}" stroke-width="6" stroke-linecap="round"/>`;
      b += T(ax, y - 116, a.label || '?', { size: 38, fill: C.shade, w: 900 });
    });
    return svg(W, 230, b);
  };

  /* vertical bar chart */
  Fig.bars = function (title, cats, vals, max, step, fmt = n) {
    const W = 1000, H = 520, x0 = 150, y0 = 440, top = 70, ph = y0 - top, pw = W - x0 - 30;
    let b = T(W / 2 + 60, 30, title, { size: 30 });
    for (let v = 0; v <= max + 1e-9; v += step) {
      const yy = y0 - (v / max) * ph;
      b += `<line x1="${x0}" y1="${yy}" x2="${x0 + pw}" y2="${yy}" stroke="${C.grid}" stroke-width="2"/>` + T(x0 - 14, yy, fmt(v), { size: 24, anchor: 'end', fill: C.soft });
    }
    const bw = pw / cats.length;
    cats.forEach((c, i) => {
      const h = (vals[i] / max) * ph;
      b += `<rect x="${x0 + i * bw + bw * 0.2}" y="${y0 - h}" width="${bw * 0.6}" height="${h}" rx="6" fill="${C.shade}"/>`;
      b += T(x0 + i * bw + bw / 2, y0 + 34, c, { size: 30 });
    });
    b += `<line x1="${x0}" y1="${top - 10}" x2="${x0}" y2="${y0}" stroke="${C.ink}" stroke-width="4"/><line x1="${x0}" y1="${y0}" x2="${x0 + pw}" y2="${y0}" stroke="${C.ink}" stroke-width="4"/>`;
    return svg(W, H, b);
  };

  /* line graph */
  Fig.lineGraph = function (title, cats, vals, max, step) {
    const W = 1000, H = 520, x0 = 120, y0 = 440, top = 70, ph = y0 - top, pw = W - x0 - 50;
    let b = T(W / 2 + 40, 30, title, { size: 30 });
    for (let v = 0; v <= max + 1e-9; v += step) {
      const yy = y0 - (v / max) * ph;
      b += `<line x1="${x0}" y1="${yy}" x2="${x0 + pw}" y2="${yy}" stroke="${C.grid}" stroke-width="2"/>` + T(x0 - 14, yy, n(v), { size: 24, anchor: 'end', fill: C.soft });
    }
    const dx = pw / (cats.length - 1);
    const pts = vals.map((v, i) => [x0 + i * dx, y0 - (v / max) * ph]);
    b += `<polyline points="${pts.map((p) => p.join(',')).join(' ')}" fill="none" stroke="${C.shade}" stroke-width="6" stroke-linejoin="round"/>`;
    pts.forEach((p, i) => { b += `<circle cx="${p[0]}" cy="${p[1]}" r="10" fill="${C.shade}" stroke="${C.dark}" stroke-width="3"/>` + T(p[0], y0 + 34, cats[i], { size: 26 }); });
    b += `<line x1="${x0}" y1="${top - 10}" x2="${x0}" y2="${y0}" stroke="${C.ink}" stroke-width="4"/><line x1="${x0}" y1="${y0}" x2="${x0 + pw}" y2="${y0}" stroke="${C.ink}" stroke-width="4"/>`;
    return svg(W, H, b);
  };

  /* table: first row = headers */
  Fig.table = function (rows) {
    const cols = rows[0].length, cw = Math.max(150, Math.min(220, 1000 / cols)), rh = 70, W = cw * cols, H = rh * rows.length;
    let b = `<rect x="0" y="0" width="${W}" height="${rh}" fill="rgba(255,255,255,.1)"/>`;
    rows.forEach((r, i) => r.forEach((c, j) => { b += T(j * cw + cw / 2, i * rh + rh / 2 + 2, c, { size: c === '?' ? 40 : 28, w: i === 0 || j === 0 ? 900 : 700, fill: c === '?' ? C.shade : C.ink }); }));
    for (let i = 0; i <= rows.length; i++) b += `<line x1="0" y1="${i * rh}" x2="${W}" y2="${i * rh}" stroke="${C.soft}" stroke-width="2.5"/>`;
    for (let j = 0; j <= cols; j++) b += `<line x1="${j * cw}" y1="0" x2="${j * cw}" y2="${H}" stroke="${C.soft}" stroke-width="2.5"/>`;
    return svg(W, H, b);
  };

  /* dot array r x c */
  Fig.array = function (r, c, color = C.shade) {
    const g = 46, W = c * g + 20, H = r * g + 20;
    let b = '';
    for (let i = 0; i < r; i++) for (let j = 0; j < c; j++) b += `<circle cx="${10 + g / 2 + j * g}" cy="${10 + g / 2 + i * g}" r="16" fill="${color}"/>`;
    return svg(W, H, b);
  };

  /* isometric cuboid made of unit cubes: a (along x) by b (depth) by c (height) */
  Fig.cubes = function (a, b2, c) {
    const s = 44, cx = s * 0.866, cy = s * 0.5;
    const P = (x, y, z) => [x * cx - y * cx, x * cy + y * cy - z * s];
    const ox = b2 * cx + 20, oy = c * s + 20;
    const pt = (x, y, z) => { const p = P(x, y, z); return `${(p[0] + ox).toFixed(1)},${(p[1] + oy).toFixed(1)}`; };
    const W = (a + b2) * cx + 40, H = c * s + (a + b2) * cy + 40;
    const face = (pts, fill) => `<polygon points="${pts.join(' ')}" fill="${fill}" stroke="${C.dark}" stroke-width="2.5" stroke-linejoin="round"/>`;
    let body = '';
    // top face cells
    for (let x = 0; x < a; x++) for (let y = 0; y < b2; y++) body += face([pt(x, y, c), pt(x + 1, y, c), pt(x + 1, y + 1, c), pt(x, y + 1, c)], '#ffe3a0');
    // front-right face (y = b2)
    for (let x = 0; x < a; x++) for (let z = 0; z < c; z++) body += face([pt(x, b2, z), pt(x + 1, b2, z), pt(x + 1, b2, z + 1), pt(x, b2, z + 1)], '#ffc94d');
    // front-left face (x = a)
    for (let y = 0; y < b2; y++) for (let z = 0; z < c; z++) body += face([pt(a, y, z), pt(a, y + 1, z), pt(a, y + 1, z + 1), pt(a, y, z + 1)], '#d99a1e');
    return svg(W, H, body);
  };

  /* rectilinear shape on squared paper. poly = [[x,y],...] in grid units (y down). labels: true = all side lengths,
     or a Set of side indices to show, unit text e.g. 'cm'. */
  Fig.gridShape = function (poly, { labels = null, unit = 'cm', grid = true, cell = 52, scale = 1 } = {}) {
    const xs = poly.map((p) => p[0]), ys = poly.map((p) => p[1]);
    const pad = labels ? 2 : 1;
    const minX = Math.min(...xs) - pad, maxX = Math.max(...xs) + pad, minY = Math.min(...ys) - 1, maxY = Math.max(...ys) + 1;
    const W = (maxX - minX) * cell, H = (maxY - minY) * cell, X = (x) => (x - minX) * cell, Y = (y) => (y - minY) * cell;
    let b = '';
    if (grid) {
      for (let x = minX; x <= maxX; x++) b += `<line x1="${X(x)}" y1="0" x2="${X(x)}" y2="${H}" stroke="${C.grid}" stroke-width="2"/>`;
      for (let y = minY; y <= maxY; y++) b += `<line x1="0" y1="${Y(y)}" x2="${W}" y2="${Y(y)}" stroke="${C.grid}" stroke-width="2"/>`;
    }
    b += `<polygon points="${poly.map((p) => `${X(p[0])},${Y(p[1])}`).join(' ')}" fill="rgba(255,201,77,.35)" stroke="${C.shade}" stroke-width="5" stroke-linejoin="round"/>`;
    if (labels) {
      // centroid to push labels outward
      const mx = xs.reduce((s, v) => s + v, 0) / xs.length, my = ys.reduce((s, v) => s + v, 0) / ys.length;
      poly.forEach((p, i) => {
        if (labels !== true && !labels.has(i)) return;
        const q = poly[(i + 1) % poly.length], len = Math.abs(q[0] - p[0]) + Math.abs(q[1] - p[1]);
        const midx = (p[0] + q[0]) / 2, midy = (p[1] + q[1]) / 2;
        let lx = X(midx), ly = Y(midy);
        if (p[1] === q[1]) ly += (midy < my ? -1 : 1) * 0.42 * cell; else lx += (midx < mx ? -1 : 1) * 0.62 * cell;
        b += T(lx, ly, `${len * scale} ${unit}`, { size: 26, w: 900 });
      });
    }
    return svg(W, H, b);
  };

  /* fraction rectangle: rows x cols, the first k cells shaded (in reading order) */
  Fig.fracRect = function (rows, cols, k, cell = 70) {
    const W = cols * cell + 8, H = rows * cell + 8;
    let b = '';
    for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) {
      const idx = i * cols + j;
      b += `<rect x="${4 + j * cell}" y="${4 + i * cell}" width="${cell}" height="${cell}" fill="${idx < k ? C.shade : 'rgba(255,255,255,.06)'}" stroke="${C.ink}" stroke-width="3"/>`;
    }
    return svg(W, H, b);
  };
  /* fraction circle: n equal sectors, k shaded */
  Fig.fracCircle = function (nParts, k, r = 150) {
    const c = r + 8; let b = '';
    for (let i = 0; i < nParts; i++) {
      const a0 = -Math.PI / 2 + (i / nParts) * Math.PI * 2, a1 = -Math.PI / 2 + ((i + 1) / nParts) * Math.PI * 2;
      const p0 = [c + r * Math.cos(a0), c + r * Math.sin(a0)], p1 = [c + r * Math.cos(a1), c + r * Math.sin(a1)];
      b += `<path d="M${c} ${c} L${p0[0].toFixed(1)} ${p0[1].toFixed(1)} A${r} ${r} 0 ${1 / nParts > 0.5 ? 1 : 0} 1 ${p1[0].toFixed(1)} ${p1[1].toFixed(1)} Z" fill="${i < k ? C.shade : 'rgba(255,255,255,.06)'}" stroke="${C.ink}" stroke-width="3" stroke-linejoin="round"/>`;
    }
    return svg(2 * c, 2 * c, b);
  };

  /* bar model: a whole bar split into equal parts; labels inside parts (array, '' for none); whole label on a brace */
  Fig.barModel = function (parts, inner, whole, shaded = []) {
    const W = 1000, pw = (W - 40) / parts, y = 110, h = 90;
    let b = `<path d="M20 70 v-16 h${W - 40} v16" fill="none" stroke="${C.soft}" stroke-width="3"/>` + T(W / 2, 30, whole, { size: 34, w: 900, fill: whole === '?' ? C.shade : C.ink });
    for (let i = 0; i < parts; i++) {
      b += `<rect x="${20 + i * pw}" y="${y}" width="${pw}" height="${h}" fill="${shaded.includes(i) ? C.shade : 'rgba(255,255,255,.06)'}" stroke="${C.ink}" stroke-width="3"/>`;
      if (inner[i]) b += T(20 + i * pw + pw / 2, y + h / 2 + 2, inner[i], { size: inner[i].length > 6 ? 24 : 32, w: 900, fill: shaded.includes(i) ? C.dark : (inner[i] === '?' ? C.shade : C.ink) });
    }
    return svg(W, 220, b);
  };
  /* part-whole bar with unequal parts (values give widths) */
  Fig.partWhole = function (whole, parts) {
    const W = 1000, tot = parts.reduce((s, p) => s + p.v, 0); let x = 20;
    let b = `<rect x="20" y="20" width="${W - 40}" height="80" fill="rgba(255,255,255,.08)" stroke="${C.ink}" stroke-width="3"/>` + T(W / 2, 62, whole, { size: 32, w: 900, fill: whole === '?' ? C.shade : C.ink });
    parts.forEach((p) => {
      const w = (p.v / tot) * (W - 40);
      b += `<rect x="${x}" y="110" width="${w}" height="80" fill="${p.label === '?' ? 'rgba(255,201,77,.25)' : 'rgba(255,255,255,.06)'}" stroke="${C.ink}" stroke-width="3"/>` + T(x + w / 2, 152, p.label, { size: 30, w: 900, fill: p.label === '?' ? C.shade : C.ink });
      x += w;
    });
    return svg(W, 210, b);
  };

  /* a rectangle with its length on top and a fraction width on the right: wl text, [a, b, unit] */
  Fig.rectFrac = function (wl, frac) {
    const [a, b, unit] = frac, W = 900, H = 380;
    let s = `<rect x="80" y="80" width="560" height="240" fill="rgba(255,201,77,.35)" stroke="${C.shade}" stroke-width="5"/>`;
    s += T(360, 46, wl, { size: 40, w: 900 });
    s += T(720, 166, String(a), { size: 40, w: 900 }) + `<line x1="694" y1="200" x2="746" y2="200" stroke="${C.ink}" stroke-width="4"/>` + T(720, 236, String(b), { size: 40, w: 900 }) + T(760, 202, unit, { size: 40, w: 900, anchor: 'start' });
    return svg(W, H, s);
  };

  /* a rectangle with a plain text label on top and on the right; cut = width of a shaded square at the left */
  Fig.rectText = function (top, side, cut = 0, ratio = 0.45, inner = '') {
    const W = 900, H = 400, w = 600, h = Math.max(120, Math.min(300, w * ratio)), x = 80, y = 70 + (300 - h) / 2;
    let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="rgba(255,201,77,.18)" stroke="${C.shade}" stroke-width="5"/>`;
    if (cut) s += `<rect x="${x}" y="${y}" width="${cut * w}" height="${h}" fill="rgba(255,201,77,.55)" stroke="${C.shade}" stroke-width="4"/>`;
    if (inner) s += T(x + (cut ? cut * w / 2 : w / 2), y + h / 2, inner, { size: 30, w: 900, fill: C.dark });
    s += T(x + w / 2, y - 26, top, { size: 34, w: 900 }) + T(x + w + 20, y + h / 2, side, { size: 34, w: 900, anchor: 'start' });
    return svg(W, H, s);
  };
  /* the book's square patterns: pattern n = 3 rows x (2n + 1) columns, n white squares in the middle row */
  Fig.squarePatterns = function (ns) {
    const c = 34, gap = 60; let x = 20, s = '', H = 3 * c + 70;
    ns.forEach((k) => {
      const cols = 2 * k + 1;
      for (let r = 0; r < 3; r++) for (let j = 0; j < cols; j++) {
        const white = r === 1 && j % 2 === 1;
        s += `<rect x="${x + j * c}" y="${20 + r * c}" width="${c}" height="${c}" fill="${white ? '#ffffff' : '#7d859f'}" stroke="${C.dark}" stroke-width="2"/>`;
      }
      s += T(x + cols * c / 2, 20 + 3 * c + 30, `Pattern ${k}`, { size: 24, fill: C.soft });
      x += cols * c + gap;
    });
    return svg(x, H, s);
  };

  /* coordinate grid: points [{x,y,label}], polys [{pts:[[x,y]...], label, fill}] */
  Fig.coords = function (xmin, xmax, ymin, ymax, points = [], polys = [], cell = 46) {
    const W = (xmax - xmin) * cell + 80, H = (ymax - ymin) * cell + 80, X = (x) => 40 + (x - xmin) * cell, Y = (y) => 40 + (ymax - y) * cell;
    let b = '';
    for (let x = xmin; x <= xmax; x++) b += `<line x1="${X(x)}" y1="${Y(ymin)}" x2="${X(x)}" y2="${Y(ymax)}" stroke="${x === 0 ? C.ink : C.grid}" stroke-width="${x === 0 ? 4 : 2}"/>`;
    for (let y = ymin; y <= ymax; y++) b += `<line x1="${X(xmin)}" y1="${Y(y)}" x2="${X(xmax)}" y2="${Y(y)}" stroke="${y === 0 ? C.ink : C.grid}" stroke-width="${y === 0 ? 4 : 2}"/>`;
    for (let x = xmin; x <= xmax; x++) if (x && x % 2 === 0) b += T(X(x), Y(0) + 22, BC.n(x), { size: 20, fill: C.soft });
    for (let y = ymin; y <= ymax; y++) if (y && y % 2 === 0) b += T(X(0) - 12, Y(y), BC.n(y), { size: 20, fill: C.soft, anchor: 'end' });
    b += T(X(xmax) + 18, Y(0), 'x', { size: 26, fill: C.soft }) + T(X(0), Y(ymax) - 20, 'y', { size: 26, fill: C.soft });
    polys.forEach((p) => {
      b += `<polygon points="${p.pts.map((q) => `${X(q[0])},${Y(q[1])}`).join(' ')}" fill="${p.fill || 'rgba(255,201,77,.35)'}" stroke="${p.stroke || C.shade}" stroke-width="4"/>`;
      if (p.label) { const cxp = p.pts.reduce((s, q) => s + q[0], 0) / p.pts.length, cyp = p.pts.reduce((s, q) => s + q[1], 0) / p.pts.length; b += T(X(cxp), Y(cyp), p.label, { size: 30, w: 900 }); }
    });
    points.forEach((p) => { b += `<circle cx="${X(p.x)}" cy="${Y(p.y)}" r="9" fill="${C.shade}" stroke="${C.dark}" stroke-width="3"/>` + T(X(p.x) + 18, Y(p.y) - 18, p.label, { size: 30, w: 900, fill: C.shade }); });
    return svg(W, H, b);
  };

  /* Venn diagram with labels and numbers placed: inA, inB, both, out; '?' allowed */
  Fig.venn = function (la, lb, inA = [], both = [], inB = [], out = []) {
    const W = 1000, H = 470;
    let b = `<rect x="4" y="4" width="${W - 8}" height="${H - 8}" rx="20" fill="none" stroke="${C.soft}" stroke-width="3"/>`;
    b += `<circle cx="380" cy="250" r="190" fill="rgba(255,255,255,.05)" stroke="${C.ink}" stroke-width="4"/><circle cx="620" cy="250" r="190" fill="rgba(255,255,255,.05)" stroke="${C.ink}" stroke-width="4"/>`;
    b += T(300, 40, la, { size: 28 }) + T(700, 40, lb, { size: 28 });
    const put = (arr, x0, y0) => arr.forEach((v, i) => { b += T(x0, y0 + i * 56, v, { size: v === '?' ? 50 : 36, w: 900, fill: v === '?' ? C.shade : C.ink }); });
    put(inA, 290, 200); put(both, 500, 210); put(inB, 710, 200); put(out, 80, 380);
    return svg(W, H, b);
  };
})();
