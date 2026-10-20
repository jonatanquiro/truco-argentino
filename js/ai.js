/*
 * La máquina. Sólo mira lo que un jugador real podría ver: sus cartas, las jugadas,
 * los cantos y los puntos de envido que el rival mostró.
 * Estima sus chances simulando muchas manos posibles del rival (Monte Carlo) y
 * resolviendo cada una a cartas vistas. Cada personaje cambia cuántas simula,
 * cuánto se equivoca, cuánto miente y cuánto arriesga.
 */
(function () {
  const { makeDeck, compare, envidoPoints, handWinner, rank } = window.Cards;
  const E = window.Engine;
  const FULL = makeDeck();

  const rnd = Math.random;
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

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

  // Manos posibles del rival (las cartas que le quedan), coherentes con el envido que mostró
  function sampleOpp(h, me, n) {
    const opp = 1 - me;
    const pool = unseenFor(h, me);
    const k = h.cards[opp].length;
    const known = h.envKnown[opp];
    const out = [];
    for (let i = 0; i < n; i++) {
      let s = pick(pool, k);
      if (known !== null) {
        for (let t = 0; t < 300 && envidoPoints(h.played[opp].concat(s)) !== known; t++) s = pick(pool, k);
      }
      out.push(s);
    }
    return out;
  }

  // Resolución a cartas vistas: 1 si gana `me`, 0 si no. Ambos juegan perfecto.
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

  function handsFor(h, me, s) {
    const hands = [null, null];
    hands[me] = h.cards[me];
    hands[1 - me] = s;
    return hands;
  }

  // Probabilidad de ganar la mano desde el estado actual
  function winProb(h, me, samples) {
    let tot = 0;
    for (const s of samples) tot += solve(handsFor(h, me, s), h.results, h.trickCards, h.turn, h.mano, me);
    return tot / samples.length;
  }

  // Valor de jugar cada carta (sólo cuando me toca)
  function cardValues(h, me, samples) {
    return h.cards[me].map((card, i) => {
      let tot = 0;
      for (const s of samples) {
        const hands = handsFor(h, me, s);
        hands[me] = h.cards[me].filter((_, j) => j !== i);
        const tc = h.trickCards.slice();
        tc[me] = card;
        const opp = 1 - me;
        if (tc[opp]) {
          const r = compare(tc[0], tc[1]);
          tot += solve(hands, h.results.concat([r]), [null, null], r === 'p' ? h.mano : r, h.mano, me);
        } else {
          tot += solve(hands, h.results, tc, opp, h.mano, me);
        }
      }
      return { card, v: tot / samples.length };
    });
  }

  // Probabilidad de ganar el envido. weightPow > 0 cuando el rival cantó (seguro tiene algo).
  function envWinProb(h, me, weightPow) {
    const opp = 1 - me;
    const pool = unseenFor(h, me);
    const k = 3 - h.played[opp].length;
    const mine = h.envPoints[me];
    let win = 0, tot = 0;
    for (let i = 0; i < 400; i++) {
      const e = envidoPoints(h.played[opp].concat(pick(pool, k)));
      let w = 1;
      if (weightPow > 0) w = Math.pow(e >= 28 ? 1 : e >= 25 ? 0.55 : e >= 20 ? 0.22 : 0.08, weightPow);
      tot += w;
      if (mine > e || (mine === e && h.mano === me)) win += w;
    }
    return win / tot;
  }

  /* Memoria por partido para los que "leen" al rival */
  function newMemory() {
    return { calls: 0, weakCalls: 0 };
  }

  // Al terminar una mano, ¿el humano había cantado truco con cartas flojas?
  function learn(mem, h) {
    if (!h.trucoCalls[0]) return;
    mem.calls++;
    // Sólo con lo que se vio en la mesa
    const seen = h.played[0];
    const weak = seen.length >= 2 && seen.every((c) => rank(c) < 9);
    if (weak || (h.winner === 1 && h.endReason === 'cards')) mem.weakCalls++;
  }

  function discountFor(p, mem) {
    if (!p.reads || mem.calls < 2) return p.discount;
    const bluffRate = (mem.weakCalls + 1) / (mem.calls + 2);
    // Si el rival miente mucho, desconfía menos de sus cantos
    return clamp(p.discount * (1.6 - 2 * bluffRate), 0, 0.3);
  }

  function noisy(x, p) {
    return clamp(x + (rnd() * 2 - 1) * p.noise, 0, 1);
  }

  function decideEnvidoCall(h, me, legal, p, ctx) {
    const pw = noisy(envWinProb(h, me, 0), p);
    const { scores, target } = ctx;
    const behind = scores[1 - me] - scores[me];
    if (legal.falta && pw >= p.envFalta) return { type: 'envido', kind: 'falta' };
    if (legal.falta && behind >= target / 3 && pw >= p.envReal) return { type: 'envido', kind: 'falta' };
    if (legal.real && pw >= p.envReal) return { type: 'envido', kind: rnd() < 0.5 ? 'real' : 'envido' };
    if (legal.envido && pw >= p.envCall) return { type: 'envido', kind: 'envido' };
    if (legal.envido && pw < 0.35 && rnd() < p.envBluff) return { type: 'envido', kind: 'envido' };
    return null;
  }

  function decideEnvidoResponse(h, me, legal, p, ctx) {
    const { scores, target } = ctx;
    const oppCalls = h.envCallers.filter((c) => c !== me).length;
    const pw = noisy(envWinProb(h, me, oppCalls), p);
    const nextCalls = h.envCalls;
    const winnerIfMe = me;
    const accept = E.envAcceptedValue(nextCalls, scores, target, winnerIfMe);
    const decline = E.envDeclinedValue(nextCalls);
    // Si rechazar le da el partido al rival, hay que querer
    if (scores[1 - me] + decline >= target) return { type: 'quiero' };
    const sure = h.envPoints[me] === 33 || (h.envPoints[me] >= 32 && h.mano === me);
    if (pw >= p.envRaise || sure) {
      if (legal.falta && (sure || pw >= p.envFalta)) return { type: 'envido', kind: 'falta' };
      if (legal.real && rnd() < 0.7) return { type: 'envido', kind: 'real' };
      if (legal.envido) return { type: 'envido', kind: 'envido' };
      return { type: 'quiero' };
    }
    let thr = (accept - decline) / (2 * accept) + p.envCaution;
    if (nextCalls.includes('falta')) thr = Math.max(thr, 0.45 + p.envCaution);
    if (pw >= thr) return { type: 'quiero' };
    if (legal.envido && pw < 0.25 && rnd() < p.envBluff / 2) return { type: 'envido', kind: 'envido' };
    return { type: 'noquiero' };
  }

  function decideTrucoResponse(h, me, legal, p, ctx, samples) {
    const { scores, target, memory } = ctx;
    const to = h.trucoPending.to;
    const decline = to - 1;
    let pr = noisy(winProb(h, me, samples), p);
    pr = pr * (1 - discountFor(p, memory));
    if (scores[1 - me] + decline >= target) return legal.truco && pr > p.trucoRaise ? { type: 'truco' } : { type: 'quiero' };
    let thr = 1 / (2 * to) + p.trucoCaution;
    if (scores[1 - me] + to >= target) thr += 0.12; // perder esto es perder el partido
    if (legal.truco && pr >= p.trucoRaise) return { type: 'truco' };
    if (legal.truco && pr < 0.3 && pr > 0.12 && rnd() < p.bluff / 2) return { type: 'truco' };
    if (pr >= thr) return { type: 'quiero' };
    return { type: 'noquiero' };
  }

  function choosePlay(h, me, p, samples) {
    const cards = h.cards[me];
    if (cards.length === 1) return { type: 'play', card: cards[0] };
    if (rnd() < p.mistake) return { type: 'play', card: cards[Math.floor(rnd() * cards.length)] };
    const vals = cardValues(h, me, samples);
    const best = Math.max(...vals.map((x) => x.v));
    // Entre las que rinden parecido, tirar la más baja (no regalar información ni cartas buenas)
    const near = vals.filter((x) => x.v >= best - 0.02).sort((a, b) => rank(a.card) - rank(b.card));
    return { type: 'play', card: near[0].card };
  }

  function decide(h, me, legal, ctx) {
    const p = ctx.persona.ai;
    const samples = sampleOpp(h, me, p.samples);

    if (legal.kind === 'envido') return decideEnvidoResponse(h, me, legal, p, ctx);

    // "El envido está primero": antes de responder el truco o jugar, ver si conviene cantar
    if (legal.envido || legal.real || legal.falta) {
      const call = decideEnvidoCall(h, me, legal, p, ctx);
      if (call) return call;
    }

    if (legal.kind === 'truco') return decideTrucoResponse(h, me, legal, p, ctx, samples);

    if (legal.truco) {
      const pr = noisy(winProb(h, me, samples), p);
      const { scores, target } = ctx;
      const lastChance = h.cards[me].length === 1 || h.trick === 2;
      let call = pr >= p.trucoCall;
      if (call && pr > 0.85 && h.trick === 0 && rnd() < p.slowplay) call = false; // la guarda
      if (!call && pr < 0.4 && rnd() < p.bluff * (lastChance ? 1.6 : 1)) call = true; // mentira
      // Si el rival está por ganar, no le regalo puntos con una mentira
      if (call && pr < 0.4 && scores[1 - me] + h.trucoLevel >= target) call = false;
      if (call) return { type: 'truco' };
    }

    return choosePlay(h, me, p, samples);
  }

  window.AI = { decide, newMemory, learn, winProb, envWinProb };
})();
