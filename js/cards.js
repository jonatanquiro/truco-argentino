/* Mazo español de 40 cartas: valores, jerarquía del truco, envido y dibujo SVG */
(function () {
  const SUITS = ['espada', 'basto', 'oro', 'copa'];
  const VALUES = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12];
  const SUIT_COLORS = { oro: '#c8930f', copa: '#b8322a', espada: '#2a5598', basto: '#3f7a26' };
  const FIGURES = { 10: 'SOTA', 11: 'CABALLO', 12: 'REY' };

  function makeDeck() {
    const deck = [];
    for (const s of SUITS) for (const v of VALUES) deck.push({ v, s, id: v + '-' + s });
    return deck;
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Jerarquía: 1 espada > 1 basto > 7 espada > 7 oro > 3 > 2 > 1 falsos > 12 > 11 > 10 > 7 falsos > 6 > 5 > 4
  function rank(c) {
    if (c.v === 1 && c.s === 'espada') return 14;
    if (c.v === 1 && c.s === 'basto') return 13;
    if (c.v === 7 && c.s === 'espada') return 12;
    if (c.v === 7 && c.s === 'oro') return 11;
    switch (c.v) {
      case 3: return 10;
      case 2: return 9;
      case 1: return 8;
      case 12: return 7;
      case 11: return 6;
      case 10: return 5;
      case 7: return 4;
      case 6: return 3;
      case 5: return 2;
      case 4: return 1;
    }
    return 0;
  }

  // 0 si gana a, 1 si gana b, 'p' si es parda
  function compare(a, b) {
    const ra = rank(a), rb = rank(b);
    if (ra === rb) return 'p';
    return ra > rb ? 0 : 1;
  }

  const envValue = (c) => (c.v >= 10 ? 0 : c.v);

  function envidoPoints(cards) {
    let best = 0;
    for (let i = 0; i < cards.length; i++) {
      best = Math.max(best, envValue(cards[i]));
      for (let j = i + 1; j < cards.length; j++) {
        if (cards[i].s === cards[j].s) best = Math.max(best, 20 + envValue(cards[i]) + envValue(cards[j]));
      }
    }
    return best;
  }

  // Quién gana la mano según las bazas (0/1/'p'). null si todavía no está definida.
  function handWinner(r, mano) {
    if (r.length >= 2) {
      if (r[0] !== 'p' && r[0] === r[1]) return r[0];
      if (r[0] === 'p' && r[1] !== 'p') return r[1];
      if (r[0] !== 'p' && r[1] === 'p') return r[0];
    }
    if (r.length === 3) {
      if (r[0] === 'p' && r[1] === 'p') return r[2] === 'p' ? mano : r[2];
      if (r[2] === 'p') return r[0];
      return r[2];
    }
    return null;
  }

  function cardName(c) {
    const n = FIGURES[c.v] ? FIGURES[c.v].charAt(0) + FIGURES[c.v].slice(1).toLowerCase() : c.v;
    return n + ' de ' + c.s;
  }

  /* ---------- Dibujo ---------- */
  const SUIT_SVG = {
    oro: '<circle r="16" fill="#e7b730" stroke="#8a6408" stroke-width="2"/><circle r="10.5" fill="none" stroke="#8a6408" stroke-width="1.6"/><circle r="4" fill="#b8860b"/>',
    copa: '<path d="M-14,-15 H14 Q14,3 0,5 Q-14,3 -14,-15 Z" fill="#c8402f" stroke="#7a1d14" stroke-width="1.8"/><path d="M-11,-11 H11" stroke="#f2c14e" stroke-width="2.5"/><rect x="-2.5" y="4" width="5" height="9" fill="#e0a92e" stroke="#7a1d14" stroke-width="1"/><ellipse cx="0" cy="15" rx="10" ry="3.5" fill="#e0a92e" stroke="#7a1d14" stroke-width="1.4"/>',
    espada: '<path d="M0,-21 L4,-14 L4,7 L-4,7 L-4,-14 Z" fill="#9fb8dc" stroke="#1f3f72" stroke-width="1.6"/><line x1="0" y1="-14" x2="0" y2="5" stroke="#1f3f72" stroke-width="1"/><rect x="-11" y="7" width="22" height="4" rx="1.5" fill="#e0a92e" stroke="#1f3f72" stroke-width="1.2"/><rect x="-2.2" y="11" width="4.4" height="7" fill="#2a5598"/><circle cy="20" r="3" fill="#e0a92e" stroke="#1f3f72" stroke-width="1"/>',
    basto: '<path d="M-3.5,19 L3.5,19 L7,-12 Q0,-24 -7,-12 Z" fill="#6f9a35" stroke="#2f5216" stroke-width="1.8"/><circle cx="-3" cy="-8" r="1.8" fill="#2f5216"/><circle cx="3" cy="-1" r="1.6" fill="#2f5216"/><circle cx="-1.5" cy="8" r="1.5" fill="#2f5216"/><path d="M-3.5,19 L3.5,19" stroke="#c8930f" stroke-width="3"/>'
  };

  const PIPS = {
    1: [[50, 75]],
    2: [[50, 42], [50, 108]],
    3: [[50, 34], [50, 75], [50, 116]],
    4: [[32, 42], [68, 42], [32, 108], [68, 108]],
    5: [[32, 38], [68, 38], [50, 75], [32, 112], [68, 112]],
    6: [[32, 36], [68, 36], [32, 75], [68, 75], [32, 114], [68, 114]],
    7: [[32, 32], [68, 32], [50, 54], [32, 77], [68, 77], [32, 116], [68, 116]]
  };

  function suitAt(s, x, y, scale) {
    return `<g transform="translate(${x},${y}) scale(${scale})">${SUIT_SVG[s]}</g>`;
  }

  function cardSVG(c) {
    const col = SUIT_COLORS[c.s];
    let body = '';
    if (FIGURES[c.v]) {
      body += `<rect x="20" y="22" width="60" height="106" rx="5" fill="#fbf3df" stroke="${col}" stroke-width="2"/>`;
      body += suitAt(c.s, 50, 62, 1.35);
      body += `<text x="50" y="112" text-anchor="middle" font-size="${c.v === 11 ? 10 : 13}" font-weight="700" fill="${col}" font-family="Georgia,serif" letter-spacing="1">${FIGURES[c.v]}</text>`;
    } else {
      const big = c.v === 1;
      const scale = big ? 2.1 : c.v >= 6 ? 0.68 : 0.8;
      for (const [x, y] of PIPS[c.v]) body += suitAt(c.s, x, y, scale);
    }
    return `<svg viewBox="0 0 100 150" class="card-svg" aria-hidden="true">
      <rect x="1.5" y="1.5" width="97" height="147" rx="9" fill="#fffaf0" stroke="#bfae8a" stroke-width="2"/>
      <rect x="6" y="6" width="88" height="138" rx="6" fill="none" stroke="${col}" stroke-width="1.4" stroke-dasharray="${c.s === 'oro' ? 'none' : c.s === 'copa' ? '6 2' : c.s === 'espada' ? '2 3' : '10 3'}"/>
      <text x="12" y="22" font-size="17" font-weight="700" fill="${col}" font-family="Georgia,serif">${c.v}</text>
      <text x="88" y="140" font-size="17" font-weight="700" fill="${col}" font-family="Georgia,serif" text-anchor="end">${c.v}</text>
      ${body}
    </svg>`;
  }

  function backSVG() {
    return `<svg viewBox="0 0 100 150" class="card-svg" aria-hidden="true">
      <defs><pattern id="bk" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="12" height="12" fill="#8e2a22"/><rect width="6" height="12" fill="#a8362c"/></pattern></defs>
      <rect x="1.5" y="1.5" width="97" height="147" rx="9" fill="#fffaf0" stroke="#bfae8a" stroke-width="2"/>
      <rect x="7" y="7" width="86" height="136" rx="6" fill="url(#bk)"/>
      <circle cx="50" cy="75" r="17" fill="#fffaf0" stroke="#e0a92e" stroke-width="3"/>
      <text x="50" y="82" text-anchor="middle" font-size="20" font-weight="700" fill="#8e2a22" font-family="Georgia,serif">T</text>
    </svg>`;
  }

  window.Cards = { SUITS, VALUES, makeDeck, shuffle, rank, compare, envidoPoints, handWinner, cardName, cardSVG, backSVG };
})();
