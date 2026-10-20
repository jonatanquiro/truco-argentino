/*
 * Reglas del truco argentino para 2, 4 o 6 jugadores (mano a mano o por equipos), con o sin flor.
 * Los asientos van en orden de juego; los pares son un equipo (0) y los impares el otro (1).
 * Con 2 jugadores, asiento y equipo coinciden.
 */
(function () {
  const { makeDeck, shuffle, rank, envidoPoints, florPoints, isFlor, handWinner } = window.Cards;

  const TRUCO_NAMES = { 2: 'Truco', 3: 'Retruco', 4: 'Vale cuatro' };
  const ENV_NAMES = { envido: 'Envido', real: 'Real envido', falta: 'Falta envido' };
  const FLOR_NAMES = { flor: 'Flor', contraflor: 'Contraflor', resto: 'Contraflor al resto', achico: 'Con flor me achico' };
  const ENV_VALUE = { envido: 2, real: 3 };
  const team = (p) => p % 2;

  // opts: { n: 2|4|6, flor, deck } — deck permite repartir un mazo ya mezclado (p. ej. el de un anfitrión en red)
  function newHand(mano, opts) {
    const o = opts || {};
    const n = o.n || 2;
    const deck = o.deck ? o.deck : shuffle(makeDeck());
    const cards = Array.from({ length: n }, (_, p) => deck.slice(p * 3, p * 3 + 3));
    const florOn = o.flor !== false;
    const fill = (v) => Array.from({ length: n }, () => (typeof v === 'function' ? v() : v));
    return {
      n,
      mano,
      cards,                      // cartas que quedan en la mano de cada uno
      orig: cards.map((c) => c.slice()),
      played: fill(() => []),     // cartas jugadas, en orden de baza
      trick: 0,
      turn: mano,
      trickCards: fill(null),
      trickLeader: mano,
      trickLog: [],               // por baza: { cards: [...por asiento], r, seat }
      results: [],                // por baza: equipo ganador 0/1 o 'p'
      trucoLevel: 1,              // lo que vale la mano ahora
      trucoOwner: null,           // equipo que tiene el quiero (puede subir); null = cualquiera
      trucoPending: null,         // { to, caller, responder }
      trucoCalls: fill(0),
      envCalls: [],               // ['envido','real',...]
      envCallers: [],
      envPending: false,
      envCaller: null,
      envResponder: null,
      envDone: false,
      envPoints: cards.map(envidoPoints),
      envKnown: fill(null),       // puntos de envido que se llegaron a mostrar
      envResult: null,
      florOn,
      hasFlor: cards.map((c) => florOn && isFlor(c)),
      florPts: cards.map(florPoints),
      florSung: fill(false),
      florPending: null,          // { stage: 'flor'|'contraflor'|'resto', caller, responder, from }
      florDone: false,
      florKnown: fill(null),
      florResult: null,
      hist: [],                   // lo que hizo cada uno (la máquina lo usa para "leer" a los demás)
      over: false,
      winner: null,               // equipo ganador
      points: 0,
      endReason: ''
    };
  }

  function actorOf(h) {
    if (h.florPending) return h.florPending.responder;
    if (h.envPending) return h.envResponder;
    if (h.trucoPending) return h.trucoPending.responder;
    return h.turn;
  }

  // El primero del otro equipo (en orden de juego después de p) que cumpla la condición
  function nextOpponent(h, p, cond) {
    for (let k = 1; k < h.n; k++) {
      const q = (p + k) % h.n;
      if (team(q) !== team(p) && (!cond || cond(q))) return q;
    }
    return null;
  }

  // La flor es obligatoria: si la tenés, la cantás antes de tirar tu primera carta
  function mustSingFlor(h, p) {
    return h.hasFlor[p] && !h.florDone && !h.florPending && h.trick === 0 && h.played[p].length === 0;
  }

  function envidoAvailable(h, p) {
    return !h.envDone && !h.envPending && h.trick === 0 && h.played[p].length === 0 &&
      h.trucoLevel === 1 && (!h.trucoPending || team(h.trucoPending.caller) !== team(p));
  }

  function envRaises(calls) {
    const has = (k) => calls.includes(k);
    const nEnv = calls.filter((k) => k === 'envido').length;
    return {
      envido: nEnv < 2 && !has('real') && !has('falta'),
      real: !has('real') && !has('falta'),
      falta: !has('falta')
    };
  }

  function legalActions(h, p) {
    const a = {
      play: false, truco: 0, envido: false, real: false, falta: false, quiero: false, noquiero: false, mazo: false,
      flor: false, contraflor: false, resto: false, achico: false, kind: 'turn'
    };
    if (h.over) return a;
    if (h.florPending) {
      const st = h.florPending.stage;
      a.kind = 'flor';
      if (st === 'flor') { a.contraflor = a.resto = a.achico = true; }
      else if (st === 'contraflor') { a.quiero = a.noquiero = a.resto = true; }
      else { a.quiero = a.noquiero = true; }
      return a;
    }
    if (mustSingFlor(h, p)) {
      a.flor = true;
      a.kind = h.envPending ? 'envido' : h.trucoPending ? 'truco' : 'turn';
      return a;
    }
    if (h.envPending) {
      Object.assign(a, envRaises(h.envCalls));
      a.quiero = a.noquiero = true;
      a.kind = 'envido';
      return a;
    }
    if (h.trucoPending) {
      a.quiero = a.noquiero = a.mazo = true;
      if (h.trucoPending.to < 4) a.truco = h.trucoPending.to + 1;
      if (envidoAvailable(h, p)) Object.assign(a, envRaises([]));
      a.kind = 'truco';
      return a;
    }
    a.play = true;
    a.mazo = true;
    if (h.trucoLevel < 4 && (h.trucoOwner === null || h.trucoOwner === team(p))) a.truco = h.trucoLevel + 1;
    if (envidoAvailable(h, p)) Object.assign(a, envRaises([]));
    return a;
  }

  function faltaValue(scores, target, winner) {
    const lead = Math.max(scores[0], scores[1]);
    if (lead < target / 2) return target - scores[winner];
    return target - lead;
  }

  function envAcceptedValue(calls, scores, target, winner) {
    if (calls.includes('falta')) return faltaValue(scores, target, winner);
    return calls.reduce((s, k) => s + ENV_VALUE[k], 0);
  }

  function envDeclinedValue(calls) {
    if (calls.length === 1) return 1;
    return calls.slice(0, -1).reduce((s, k) => s + ENV_VALUE[k], 0);
  }

  // Irse al mazo por cuenta propia en la primera, cuando todavía se podía jugar el envido, da un punto más.
  // Si te cantaron truco, irte al mazo es como no quererlo; y con el truco querido ya no hay envido: sin punto extra.
  function mazoExtra(h) {
    return h.trick === 0 && !h.envDone && !h.trucoPending && h.trucoLevel === 1 ? 1 : 0;
  }

  /*
   * Quién gana un tanto (envido o flor): se dice en orden desde la mano; el empate lo gana el más cercano a la mano.
   * Devuelve { team, seat } y, si se pasa `ev`, agrega lo que dice cada uno.
   */
  function tantoWinner(h, pts, eligible, ev, known) {
    let best = null;
    for (let k = 0; k < h.n; k++) {
      const q = (h.mano + k) % h.n;
      if (eligible && !eligible(q)) continue;
      if (!best) {
        best = { team: team(q), seat: q, pts: pts[q] };
        if (known) known[q] = pts[q];
        if (ev) ev.push({ t: 'say', p: q, text: 'Tengo ' + pts[q] + '.' });
      } else if (team(q) !== best.team) {
        if (pts[q] > best.pts) {
          best = { team: team(q), seat: q, pts: pts[q] };
          if (known) known[q] = pts[q];
          if (ev) ev.push({ t: 'say', p: q, text: pts[q] + ' son mejores.' });
        } else if (ev) {
          ev.push({ t: 'say', p: q, text: 'Son buenas.' });
        }
      }
    }
    return best;
  }

  function endHand(h, winner, points, reason) {
    h.over = true;
    h.winner = winner;
    h.points = points;
    h.endReason = reason;
  }

  function resolveTrick(h, ev) {
    const leader = h.trickLeader;
    let top = -1;
    for (let p = 0; p < h.n; p++) top = Math.max(top, rank(h.trickCards[p]));
    let winSeat = null;
    const teams = new Set();
    for (let k = 0; k < h.n; k++) {
      const q = (leader + k) % h.n;
      if (rank(h.trickCards[q]) === top) {
        teams.add(team(q));
        if (winSeat === null) winSeat = q;
      }
    }
    const r = teams.size > 1 ? 'p' : team(winSeat);
    h.results.push(r);
    h.trickLog.push({ cards: h.trickCards.slice(), r, seat: r === 'p' ? null : winSeat });
    ev.push({ t: 'trick', r, trick: h.trick, seat: r === 'p' ? null : winSeat });
    const w = handWinner(h.results, team(h.mano));
    h.trickCards = h.trickCards.map(() => null);
    h.trick++;
    h.turn = r === 'p' ? h.mano : winSeat;
    h.trickLeader = h.turn;
    if (w !== null) endHand(h, w, h.trucoLevel, 'cards');
  }

  /*
   * Aplica una acción. Devuelve una lista de eventos para mostrar.
   * scores (por equipo) se modifica in situ para los puntos de envido y flor (se anotan al momento).
   */
  function apply(h, p, act, scores, target) {
    const ev = [];
    h.hist.push({
      p, type: act.type, kind: act.kind, trick: h.trick,
      ctx: h.florPending ? 'flor' : h.envPending ? 'envido' : h.trucoPending ? 'truco' : 'turn',
      envAvail: envidoAvailable(h, p),
      trucoTo: h.trucoPending ? h.trucoPending.to : h.trucoLevel + 1
    });
    switch (act.type) {
      case 'play': {
        const i = h.cards[p].findIndex((c) => c.id === act.card.id);
        const card = h.cards[p].splice(i, 1)[0];
        h.played[p].push(card);
        h.trickCards[p] = card;
        ev.push({ t: 'play', p, card });
        if (h.trickCards.every(Boolean)) resolveTrick(h, ev);
        else h.turn = (p + 1) % h.n;
        break;
      }
      case 'truco': {
        if (h.trucoPending) h.trucoLevel = h.trucoPending.to; // subir implica querer lo anterior
        const to = h.trucoLevel + 1;
        h.trucoPending = { to, caller: p, responder: nextOpponent(h, p) };
        h.trucoCalls[p]++;
        ev.push({ t: 'say', p, text: to === 2 ? '¡Truco!' : to === 3 ? '¡Quiero retruco!' : '¡Quiero vale cuatro!', call: 'truco', to });
        break;
      }
      case 'envido': {
        h.envCalls.push(act.kind);
        h.envCallers.push(p);
        h.envPending = true;
        h.envCaller = p;
        h.envResponder = nextOpponent(h, p);
        ev.push({ t: 'say', p, text: '¡' + ENV_NAMES[act.kind] + '!', call: act.kind });
        break;
      }
      case 'flor': {
        h.florSung[p] = true;
        h.envPending = false;   // la flor anula el envido
        h.envDone = true;
        ev.push({ t: 'say', p, text: '¡Flor!', call: 'flor' });
        const rival = nextOpponent(h, p, (q) => h.hasFlor[q]);
        if (rival !== null) {
          h.florPending = { stage: 'flor', caller: p, responder: rival };
        } else {
          // si nadie del otro equipo tiene, cada flor del equipo vale 3
          const count = h.hasFlor.filter((f, q) => f && team(q) === team(p)).length;
          h.florDone = true;
          scores[team(p)] += 3 * count;
          h.florResult = { winner: team(p), points: 3 * count };
          ev.push({ t: 'flor', winner: team(p), points: 3 * count });
        }
        break;
      }
      case 'contraflor':
      case 'resto': {
        h.florSung[p] = true;
        const from = h.florPending.stage;
        h.florPending = { stage: act.type, caller: p, responder: nextOpponent(h, p, (q) => h.hasFlor[q]), from };
        ev.push({ t: 'say', p, text: '¡' + FLOR_NAMES[act.type] + '!', call: act.type });
        break;
      }
      case 'achico': {
        h.florSung[p] = true;
        const c = team(h.florPending.caller);
        h.florPending = null;
        h.florDone = true;
        scores[c] += 4;
        h.florResult = { winner: c, points: 4 };
        ev.push({ t: 'say', p, text: 'Con flor me achico.', call: 'achico' });
        ev.push({ t: 'flor', winner: c, points: 4 });
        break;
      }
      case 'quiero': {
        ev.push({ t: 'say', p, text: '¡Quiero!' });
        if (h.florPending) {
          const st = h.florPending.stage;
          h.florPending = null;
          h.florDone = true;
          const w = tantoWinner(h, h.florPts, (q) => h.hasFlor[q], ev, h.florKnown).team;
          const val = st === 'resto' ? faltaValue(scores, target, w) : 6;
          scores[w] += val;
          h.florResult = { winner: w, points: val };
          ev.push({ t: 'flor', winner: w, points: val });
        } else if (h.envPending) {
          h.envPending = false;
          h.envDone = true;
          const w = tantoWinner(h, h.envPoints, null, ev, h.envKnown).team;
          const val = envAcceptedValue(h.envCalls, scores, target, w);
          scores[w] += val;
          h.envResult = { winner: w, points: val, accepted: true };
          ev.push({ t: 'envido', winner: w, points: val, accepted: true });
        } else if (h.trucoPending) {
          h.trucoLevel = h.trucoPending.to;
          h.trucoOwner = team(p);
          h.trucoPending = null;
        }
        break;
      }
      case 'noquiero': {
        ev.push({ t: 'say', p, text: 'No quiero.' });
        if (h.florPending) {
          const fp = h.florPending;
          const val = fp.stage === 'resto' && fp.from === 'contraflor' ? 6 : 4;
          h.florPending = null;
          h.florDone = true;
          scores[team(fp.caller)] += val;
          h.florResult = { winner: team(fp.caller), points: val };
          ev.push({ t: 'flor', winner: team(fp.caller), points: val });
        } else if (h.envPending) {
          const val = envDeclinedValue(h.envCalls);
          h.envPending = false;
          h.envDone = true;
          scores[team(h.envCaller)] += val;
          h.envResult = { winner: team(h.envCaller), points: val, accepted: false };
          ev.push({ t: 'envido', winner: team(h.envCaller), points: val, accepted: false });
        } else if (h.trucoPending) {
          endHand(h, team(h.trucoPending.caller), h.trucoLevel, 'noquiero');
          h.trucoPending = null;
        }
        break;
      }
      case 'mazo': {
        // en equipos, irse al mazo es abandonar la mano por todo el equipo
        ev.push({ t: 'say', p, text: 'Me voy al mazo.' });
        const extra = mazoExtra(h);
        if (h.trucoPending) {
          endHand(h, team(h.trucoPending.caller), h.trucoLevel + extra, 'mazo');
          h.trucoPending = null;
        } else {
          endHand(h, 1 - team(p), h.trucoLevel + extra, 'mazo');
        }
        break;
      }
    }
    // Se terminó el partido por el envido o la flor
    if (!h.over && (scores[0] >= target || scores[1] >= target)) {
      endHand(h, scores[0] >= target ? 0 : 1, 0, 'game');
    }
    return ev;
  }

  window.Engine = {
    newHand, actorOf, legalActions, apply, envidoAvailable, mustSingFlor, mazoExtra, tantoWinner, team,
    envAcceptedValue, envDeclinedValue, faltaValue, TRUCO_NAMES, ENV_NAMES, FLOR_NAMES
  };
})();
