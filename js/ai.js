/*
 * La máquina. Sólo mira lo que un jugador real podría ver: sus cartas, las jugadas,
 * los cantos y los tantos que el rival mostró.
 *
 * Cómo piensa:
 *  1. Imagina muchas manos posibles del rival con las cartas que no vio.
 *  2. Les da más peso a las que encajan con lo que el rival hizo ("cantó truco: algo tiene",
 *     "no quiso el envido: tiene poco"). Los niveles altos leen más fino y aprenden
 *     durante el partido cuánto mentís y cuánto te achicás.
 *  3. Resuelve cada mano imaginada a cartas vistas y decide por valor esperado.
 * Cada personaje cambia cuántas manos imagina, cuánto confía en esa lectura,
 * cuánto se equivoca, cuánto miente y cuánto arriesga.
 */
(function () {
  const { makeDeck, compare, envidoPoints, florPoints, isFlor, handWinner, rank } = window.Cards;
  const E = window.Engine;
  const FULL = makeDeck();

  const rnd = Math.random;
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const sig = (x) => 1 / (1 + Math.exp(-x));
  const strength = (cards) => cards.reduce((s, c) => s + rank(c), 0);

  function unseenFor(h, me) {
    const opp = 1 - me;
    const out = new Set(h.orig[me].map((c) => c.id).concat(h.played[opp].map((c) => c.id)));
    return FULL.filter((c) => !out.has(c.id));
  }

  function pick(pool, k) {
    const a = pool.slice();
    for (let i = 0; i < k; i++) {
      const j = i + Math.floor(rnd() * (a.length - i));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a.slice(0, k);
  }

  /* ---------- Memoria del partido: cómo juega el humano ---------- */
  function newMemory() {
    return { calls: 0, weak: 0, faced: 0, folds: 0, envCalls: 0, envWeak: 0 };
  }

  function bluffRate(mem, p) {
    if (!p.reads) return 0.2;
    return (mem.weak + 0.6) / (mem.calls + 3);
  }
  function foldRate(mem, p) {
    if (!p.reads) return 0.35;
    return (mem.folds + 1) / (mem.faced + 3);
  }
  function envBluffRate(mem, p) {
    if (!p.reads) return 0.12;
    return (mem.envWeak + 0.4) / (mem.envCalls + 3);
  }

  // Al terminar la mano, anotar lo que se vio del humano (sólo lo que quedó en la mesa)
  function learn(mem, h) {
    const seenAll = h.cards[0].length === 0;
    const full = h.orig[0];
    for (let i = 0; i < h.hist.length; i++) {
      const e = h.hist[i];
      if (e.p === 0 && e.type === 'truco' && seenAll) {
        mem.calls++;
        if (strength(full) < 21) mem.weak++;
      }
      if (e.p === 0 && e.type === 'envido' && h.envKnown[0] !== null) {
        mem.envCalls++;
        if (h.envKnown[0] < 25) mem.envWeak++;
      }
      if (e.p === 1 && e.type === 'truco') {
        const r = h.hist.slice(i + 1).find((x) => x.p === 0 && x.ctx === 'truco');
        if (r) {
          mem.faced++;
          if (r.type === 'noquiero' || r.type === 'mazo') mem.folds++;
        }
      }
    }
  }

  /* ---------- Lectura: qué tan creíble es cada mano imaginada ---------- */
  function likelihood(h, q, full, p, mem) {
    const S = strength(full);
    const env = envidoPoints(full);
    const bt = bluffRate(mem, p);
    const be = envBluffRate(mem, p);
    let L = 1;
    for (const e of h.hist) {
      if (e.p !== q) continue;
      if (e.type === 'envido') {
        L *= be + (1 - be) * sig((env - 26.5 - (e.kind === 'envido' ? 0 : 1.5)) / 1.6);
      } else if (e.ctx === 'envido' && e.type === 'quiero') {
        L *= 0.12 + 0.88 * sig((env - 25) / 1.8);
      } else if (e.ctx === 'envido' && e.type === 'noquiero') {
        L *= 0.06 + 0.94 * sig((26 - env) / 1.8);
      } else if (e.envAvail && e.trick === 0 && e.type !== 'envido') {
        // pudo cantar envido y no lo hizo
        L *= 0.45 + 0.55 * sig((28.5 - env) / 1.5);
      }
      if (e.type === 'truco') {
        L *= bt + (1 - bt) * sig((S - 23 - 1.5 * (e.trucoTo - 2)) / 2.6);
      } else if (e.ctx === 'truco' && e.type === 'quiero') {
        L *= 0.2 + 0.8 * sig((S - 19 - (e.trucoTo - 2)) / 2.6);
      }
    }
    return L;
  }

  // Manos posibles del rival: { rest: cartas que le quedan, full: sus 3 cartas, w: peso }
  function sampleOpp(h, me, p, mem) {
    const opp = 1 - me;
    const pool = unseenFor(h, me);
    const k = h.cards[opp].length;
    const played = h.played[opp];
    const envK = h.envKnown[opp], florK = h.florKnown[opp];
    const sungFlor = h.florSung[opp];
    // Si tuvo la oportunidad y no cantó flor, no tiene
    const noFlor = h.florOn && !sungFlor && (h.played[opp].length > 0 || h.hist.some((e) => e.p === opp && e.trick === 0));
    const ok = (full) =>
      (envK === null || envidoPoints(full) === envK) &&
      (florK === null || florPoints(full) === florK) &&
      (!sungFlor || isFlor(full)) &&
      (!noFlor || !isFlor(full));
    const out = [];
    for (let i = 0; i < p.samples; i++) {
      let rest = pick(pool, k), full = played.concat(rest);
      for (let t = 0; t < 400 && !ok(full); t++) { rest = pick(pool, k); full = played.concat(rest); }
      const w = p.model > 0 ? Math.pow(likelihood(h, opp, full, p, mem), p.model) : 1;
      out.push({ rest, full, w: w + 1e-9 });
    }
    return out;
  }

  /* ---------- Resolución a cartas vistas ---------- */
  function solve(hands, results, trickCards, toPlay, mano, me) {
    const w = handWinner(results, mano);
    if (w !== null) return w === me ? 1 : 0;
    const mine = toPlay === me;
    let best = mine ? -1 : 2;
    const hand = hands[toPlay];
    for (let i = 0; i < hand.length; i++) {
      const card = hand[i];
      const nh = hands.slice();
      nh[toPlay] = hand.slice(0, i).concat(hand.slice(i + 1));
      const tc = trickCards.slice();
      tc[toPlay] = card;
      const other = 1 - toPlay;
      let v;
      if (tc[other]) {
        const r = compare(tc[0], tc[1]);
        v = solve(nh, results.concat([r]), [null, null], r === 'p' ? mano : r, mano, me);
      } else {
        v = solve(nh, results, tc, other, mano, me);
      }
      if (mine ? v > best : v < best) best = v;
      if (mine ? best === 1 : best === 0) break;
    }
    return best;
  }

  function handsFor(h, me, rest) {
    const hands = [null, null];
    hands[me] = h.cards[me];
    hands[1 - me] = rest;
    return hands;
  }

  // Valor (0/1) de cada muestra desde el estado actual
  function sampleValues(h, me, samples) {
    return samples.map((s) => solve(handsFor(h, me, s.rest), h.results, h.trickCards, h.turn, h.mano, me));
  }

  const wavg = (samples, f) => {
    let a = 0, b = 0;
    for (let i = 0; i < samples.length; i++) { const w = samples[i].w; a += w * f(samples[i], i); b += w; }
    return b ? a / b : 0;
  };

  function cardValues(h, me, samples) {
    const opp = 1 - me;
    return h.cards[me].map((card, i) => {
      const rest = h.cards[me].filter((_, j) => j !== i);
      const v = wavg(samples, (s) => {
        const hands = handsFor(h, me, s.rest);
        hands[me] = rest;
        const tc = h.trickCards.slice();
        tc[me] = card;
        if (tc[opp]) {
          const r = compare(tc[0], tc[1]);
          return solve(hands, h.results.concat([r]), [null, null], r === 'p' ? h.mano : r, h.mano, me);
        }
        return solve(hands, h.results, tc, opp, h.mano, me);
      });
      return { card, v };
    });
  }

  function noisy(x, p) {
    return clamp(x + (rnd() * 2 - 1) * p.noise, 0, 1);
  }

  /* ---------- Envido ---------- */
  function envWin(h, me, samples) {
    const mine = h.envPoints[me];
    return wavg(samples, (s) => {
      const e = envidoPoints(s.full);
      return mine > e || (mine === e && h.mano === me) ? 1 : 0;
    });
  }

  // Si el rival todavía no habló, la lectura sobre su envido viene sólo de lo que hizo
  function decideEnvidoCall(h, me, legal, p, ctx, pRaw) {
    const pw = noisy(pRaw, p);
    const { scores, target } = ctx;
    const T = me % 2;
    const behind = scores[1 - T] - scores[T];
    const falta = E.faltaValue(scores, target, T);
    if (legal.falta && pw >= p.envFalta && (falta <= 6 || pw >= 0.93 || behind >= target / 3)) return { type: 'envido', kind: 'falta' };
    if (legal.real && pw >= p.envReal) return { type: 'envido', kind: rnd() < 0.55 ? 'real' : 'envido' };
    if (legal.envido && pw >= p.envCall) return { type: 'envido', kind: 'envido' };
    if (legal.envido && pw < 0.4 && rnd() < p.envBluff) return { type: 'envido', kind: rnd() < 0.3 ? 'real' : 'envido' };
    return null;
  }

  function decideEnvidoResponse(h, me, legal, p, ctx, pRaw) {
    const { scores, target } = ctx;
    const T = me % 2;
    const pw = noisy(pRaw, p);
    const calls = h.envCalls;
    const accept = E.envAcceptedValue(calls, scores, target, T);
    const decline = E.envDeclinedValue(calls);
    if (scores[1 - T] + decline >= target) return { type: 'quiero' };
    const sure = h.n === 2 && (h.envPoints[me] === 33 || (h.envPoints[me] >= 32 && h.mano === me));
    if (sure && legal.falta) return { type: 'envido', kind: 'falta' };
    if (pw >= p.envRaise) {
      if (legal.falta && pw >= p.envFalta) return { type: 'envido', kind: 'falta' };
      if (legal.real && rnd() < 0.7) return { type: 'envido', kind: 'real' };
      if (legal.envido) return { type: 'envido', kind: 'envido' };
      return { type: 'quiero' };
    }
    let thr = (accept - decline) / (2 * accept) + p.envCaution;
    if (calls.includes('falta')) thr = Math.max(thr, 0.42 + p.envCaution);
    if (pw >= thr) return { type: 'quiero' };
    if (legal.real && pw < 0.2 && calls.length === 1 && rnd() < p.envBluff / 3) return { type: 'envido', kind: 'real' };
    return { type: 'noquiero' };
  }

  /* ---------- Flor ---------- */
  function decideFlor(h, me, legal, p, ctx, pRaw) {
    const { scores, target } = ctx;
    const T = me % 2;
    const pf = noisy(pRaw, p);
    const st = h.florPending.stage;
    const falta = E.faltaValue(scores, target, T);
    if (st === 'flor') {
      if (pf >= 0.85 && legal.resto) return { type: 'resto' };
      if (pf >= 0.5) return { type: 'contraflor' };
      return { type: 'achico' };
    }
    if (st === 'contraflor') {
      if (pf >= 0.85 && legal.resto) return { type: 'resto' };
      return pf > 1 / 6 + p.envCaution ? { type: 'quiero' } : { type: 'noquiero' };
    }
    const decline = h.florPending.from === 'contraflor' ? 6 : 4;
    if (scores[1 - T] + decline >= target) return { type: 'quiero' };
    return pf > (falta - decline) / (2 * falta) + 0.1 + p.envCaution ? { type: 'quiero' } : { type: 'noquiero' };
  }

  /* ---------- Truco ---------- */
  // La probabilidad ya viene "leída": si el rival cantó o quiso, las manos fuertes pesan más.
  function decideTrucoCall(h, me, p, ctx, pRaw) {
    const { scores, target, memory } = ctx;
    const T = h.trucoLevel + 1;
    const pNow = noisy(pRaw, p);
    // si el rival está por ganar, no le regalo puntos con una mentira
    if (scores[1 - me % 2] + T >= target && pNow < 0.5) return false;
    let call = pNow >= p.trucoCall;
    if (call && pNow > 0.88 && h.trick === 0 && rnd() < p.slowplay) call = false; // la guarda
    // contra alguien que se achica seguido, miente más
    const bluff = p.bluff * clamp(foldRate(memory, p) / 0.35, 0.5, 2);
    if (!call && pNow < 0.45 && rnd() < bluff) call = true;
    return call;
  }

  function decideTrucoResponse(h, me, legal, p, ctx, pRaw) {
    const { scores, target } = ctx;
    const T = h.trucoPending.to;
    const opp = 1 - me % 2;
    const pr = noisy(pRaw, p);
    const up = legal.truco && (pr >= p.trucoRaise || (pr < 0.3 && rnd() < p.bluff / 3));
    if (up) return { type: 'truco' };
    if (scores[opp] + T - 1 >= target) return { type: 'quiero' }; // no querer es perder el partido
    let thr = 1 / (2 * T) + p.trucoCaution;
    if (scores[opp] + T >= target) thr += 0.12; // perder esto es perder el partido
    return pr >= thr ? { type: 'quiero' } : { type: 'noquiero' };
  }

  function choosePlay(h, me, p, values) {
    const cards = h.cards[me];
    if (cards.length === 1) return { type: 'play', card: cards[0] };
    if (rnd() < p.mistake) return { type: 'play', card: cards[Math.floor(rnd() * cards.length)] };
    const vals = values();
    const best = Math.max(...vals.map((x) => x.v));
    // Entre las que rinden parecido, tirar la más baja (no regalar información ni cartas buenas)
    const near = vals.filter((x) => x.v >= best - 0.015).sort((a, b) => rank(a.card) - rank(b.card));
    return { type: 'play', card: near[0].card };
  }

  /* ---------- Mano a mano: estimaciones ---------- */
  function duelEval(h, me, p, mem) {
    const samples = sampleOpp(h, me, p, mem);
    let vals = null;
    const values = () => vals || (vals = sampleValues(h, me, samples));
    const mineF = h.florPts[me];
    return {
      env: () => envWin(h, me, samples),
      flor: () => wavg(samples, (s) => {
        const f = isFlor(s.full) ? florPoints(s.full) : 0;
        return mineF > f || (mineF === f && h.mano === me) ? 1 : 0;
      }),
      hand: () => { const v = values(); return wavg(samples, (_, i) => v[i]); },
      cards: () => cardValues(h, me, samples)
    };
  }

  /* ---------- Por equipos: estimaciones ----------
   * Se imaginan las cartas de todos los demás (también las del compañero, que no se ven)
   * y se simula el resto de la mano con un criterio simple para cada jugador.
   */
  const team = (q) => q % 2;

  function sampleTable(h, me, p, mem) {
    const n = h.n;
    const seen = new Set(h.orig[me].map((c) => c.id));
    for (let q = 0; q < n; q++) if (q !== me) h.played[q].forEach((c) => seen.add(c.id));
    const pool = FULL.filter((c) => !seen.has(c.id));
    const need = h.cards.map((c, q) => (q === me ? 0 : c.length));
    const total = need.reduce((a, b) => a + b, 0);
    const okFor = (q, full) => {
      const noFlor = h.florOn && !h.florSung[q] && !h.florDone && (h.played[q].length > 0 || h.hist.some((e) => e.p === q && e.trick === 0));
      return (h.envKnown[q] === null || envidoPoints(full) === h.envKnown[q]) &&
        (h.florKnown[q] === null || florPoints(full) === h.florKnown[q]) &&
        (!h.florSung[q] || isFlor(full)) && (!noFlor || !isFlor(full));
    };
    const out = [];
    const N = Math.min(p.samples, 140);
    for (let i = 0; i < N; i++) {
      let hands, fulls;
      for (let t = 0; t < 60; t++) {
        const deal = pick(pool, total);
        hands = []; fulls = [];
        let k = 0, ok = true;
        for (let q = 0; q < n; q++) {
          if (q === me) { hands.push(h.cards[me].slice()); fulls.push(h.orig[me]); continue; }
          const rest = deal.slice(k, k + need[q]);
          k += need[q];
          const full = h.played[q].concat(rest);
          hands.push(rest); fulls.push(full);
          if (!okFor(q, full)) ok = false;
        }
        if (ok) break;
      }
      let w = 1;
      if (p.model > 0) for (let q = 0; q < n; q++) if (q !== me) w *= Math.pow(likelihood(h, q, fulls[q], p, mem), p.model);
      out.push({ hands, fulls, w: w + 1e-12 });
    }
    return out;
  }

  // Criterio simple para simular: si va ganando mi equipo, tiro la más baja; si no, la más baja que gane
  function policy(hand, tc, leader, n, seat, results) {
    let top = -1, topTeam = null;
    for (let k = 0; k < n; k++) {
      const q = (leader + k) % n;
      if (!tc[q]) continue;
      const r = rank(tc[q]);
      if (r > top) { top = r; topTeam = team(q); } else if (r === top && team(q) !== topTeam) topTeam = 'p';
    }
    const sorted = hand.map((c, i) => [rank(c), i]).sort((a, b) => a[0] - b[0]);
    if (top < 0) {
      const last = results[results.length - 1];
      if (results.length === 0) return sorted[Math.floor(sorted.length / 2)][1];
      return last !== undefined && last !== team(seat) ? sorted[sorted.length - 1][1] : sorted[0][1];
    }
    if (topTeam === team(seat)) return sorted[0][1];
    const beat = sorted.find(([r]) => r > top);
    return beat ? beat[1] : sorted[0][1];
  }

  function rollout(hands, tc, results, turn, leader, mano, n, firstCard) {
    hands = hands.map((x) => x.slice());
    tc = tc.slice();
    results = results.slice();
    let w = handWinner(results, team(mano));
    let forced = firstCard;
    while (w === null) {
      const seat = turn;
      let i;
      if (forced) { i = hands[seat].findIndex((c) => c.id === forced.id); forced = null; }
      else i = policy(hands[seat], tc, leader, n, seat, results);
      tc[seat] = hands[seat].splice(i, 1)[0];
      if (tc.every(Boolean)) {
        let top = -1, winSeat = null;
        const teams = new Set();
        for (let q = 0; q < n; q++) top = Math.max(top, rank(tc[q]));
        for (let k = 0; k < n; k++) {
          const q = (leader + k) % n;
          if (rank(tc[q]) === top) { teams.add(team(q)); if (winSeat === null) winSeat = q; }
        }
        const r = teams.size > 1 ? 'p' : team(winSeat);
        results.push(r);
        tc = tc.map(() => null);
        turn = leader = r === 'p' ? mano : winSeat;
        w = handWinner(results, team(mano));
      } else {
        turn = (seat + 1) % n;
      }
    }
    return w;
  }

  function teamEval(h, me, p, mem) {
    const samples = sampleTable(h, me, p, mem);
    const T = team(me);
    const leader = h.trickLeader;
    const cardVals = () => h.cards[me].map((card) => ({
      card,
      v: wavg(samples, (s) => (rollout(s.hands, h.trickCards, h.results, me, leader, h.mano, h.n, card) === T ? 1 : 0))
    }));
    let cv = null;
    return {
      env: () => wavg(samples, (s) => (E.tantoWinner(h, s.fulls.map(envidoPoints), null).team === T ? 1 : 0)),
      flor: () => wavg(samples, (s) => {
        const w = E.tantoWinner(h, s.fulls.map(florPoints), (q) => isFlor(s.fulls[q]));
        return w && w.team === T ? 1 : 0;
      }),
      hand: () => {
        if (h.turn === me) { cv = cv || cardVals(); return Math.max(...cv.map((x) => x.v)); }
        return wavg(samples, (s) => (rollout(s.hands, h.trickCards, h.results, h.turn, leader, h.mano, h.n) === T ? 1 : 0));
      },
      cards: () => cv || (cv = cardVals())
    };
  }

  /*
   * "Poné": jugá para ganar la baza. Si salís vos, con tu mejor carta; si ya hay cartas,
   * con la más baja que gane; si ya va ganando tu equipo o no podés ganar, con la más baja.
   * "Vení": dejámela a mí, tirá la más baja.
   */
  function hintedPlay(h, me, type) {
    const sorted = h.cards[me].slice().sort((a, b) => rank(a) - rank(b));
    const low = { type: 'play', card: sorted[0] };
    if (type === 'veni') return low;
    let top = -1, topTeam = null;
    h.trickCards.forEach((c, q) => {
      if (!c) return;
      if (rank(c) > top) { top = rank(c); topTeam = q % 2; } else if (rank(c) === top && q % 2 !== topTeam) topTeam = 'p';
    });
    if (top < 0) return { type: 'play', card: sorted[sorted.length - 1] };
    if (topTeam === me % 2) return low;
    const beat = sorted.find((c) => rank(c) > top);
    return beat ? { type: 'play', card: beat } : low;
  }

  function decide(h, me, legal, ctx) {
    const p = ctx.persona.ai;
    if (legal.flor) return { type: 'flor' };
    const ev = (h.n || 2) === 2 ? duelEval(h, me, p, ctx.memory) : teamEval(h, me, p, ctx.memory);

    if (legal.kind === 'flor') return decideFlor(h, me, legal, p, ctx, ev.flor());
    if (legal.kind === 'envido') return decideEnvidoResponse(h, me, legal, p, ctx, ev.env());

    // si el compañero le ordenó cantar el tanto, lo canta
    const order = ctx.hints && ctx.hints[me % 2];
    if (legal.envido && order && order.hand === h.no && order.type === 'cantaenvido') return { type: 'envido', kind: 'envido' };

    // "El envido está primero": antes de responder el truco o jugar, ver si conviene cantar
    if (legal.envido || legal.real || legal.falta) {
      const call = decideEnvidoCall(h, me, legal, p, ctx, ev.env());
      if (call) return call;
    }

    if (legal.kind === 'truco') return decideTrucoResponse(h, me, legal, p, ctx, ev.hand());
    // lo que pidió el compañero (sólo vale en esta mano)
    const hint = ctx.hints && ctx.hints[me % 2];
    const live = hint && hint.hand === h.no;
    if (legal.truco && live && hint.type === 'truco' && !h.trucoCalls[me]) return { type: 'truco' };
    if (legal.truco && !(live && hint.type === 'nocantes') && decideTrucoCall(h, me, p, ctx, ev.hand())) return { type: 'truco' };
    if (legal.play && live && hint.trick === h.trick && (hint.type === 'pone' || hint.type === 'veni') && (hint.seat === undefined || hint.seat === me)) return hintedPlay(h, me, hint.type);
    return choosePlay(h, me, p, ev.cards);
  }

  window.AI = { decide, newMemory, learn };
})();
