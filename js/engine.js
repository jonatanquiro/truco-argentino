/* Reglas del truco argentino (2 jugadores, sin flor). Jugador 0 = vos, 1 = la máquina. */
(function () {
  const { makeDeck, shuffle, compare, envidoPoints, handWinner } = window.Cards;

  const TRUCO_NAMES = { 2: 'Truco', 3: 'Retruco', 4: 'Vale cuatro' };
  const ENV_NAMES = { envido: 'Envido', real: 'Real envido', falta: 'Falta envido' };
  const ENV_VALUE = { envido: 2, real: 3 };

  function newHand(mano) {
    const deck = shuffle(makeDeck());
    const cards = [deck.slice(0, 3), deck.slice(3, 6)];
    return {
      mano,
      cards,                      // cartas que quedan en la mano
      orig: [cards[0].slice(), cards[1].slice()],
      played: [[], []],           // cartas jugadas, en orden de baza
      trick: 0,
      turn: mano,
      trickCards: [null, null],
      results: [],                // 0 / 1 / 'p' por baza
      trickLeaders: [mano],
      trucoLevel: 1,              // lo que vale la mano ahora
      trucoOwner: null,           // quién tiene el quiero (puede subir); null = cualquiera
      trucoPending: null,         // { to, caller }
      trucoCalls: [0, 0],         // cuántas veces cantó/subió cada uno
      envCalls: [],               // ['envido','real',...]
      envCallers: [],
      envPending: false,
      envCaller: null,
      envDone: false,
      envPoints: [envidoPoints(cards[0]), envidoPoints(cards[1])],
      envKnown: [null, null],     // puntos de envido que el rival llegó a ver
      envResult: null,
      over: false,
      winner: null,
      points: 0,
      endReason: ''
    };
  }

  function actorOf(h) {
    if (h.envPending) return 1 - h.envCaller;
    if (h.trucoPending) return 1 - h.trucoPending.caller;
    return h.turn;
  }

  function envidoAvailable(h, p) {
    return !h.envDone && !h.envPending && h.trick === 0 && h.played[p].length === 0 &&
      h.trucoLevel === 1 && (!h.trucoPending || h.trucoPending.caller !== p);
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
    const a = { play: false, truco: 0, envido: false, real: false, falta: false, quiero: false, noquiero: false, mazo: false, kind: 'turn' };
    if (h.over) return a;
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
    if (h.trucoLevel < 4 && (h.trucoOwner === null || h.trucoOwner === p)) a.truco = h.trucoLevel + 1;
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

  function endHand(h, winner, points, reason) {
    h.over = true;
    h.winner = winner;
    h.points = points;
    h.endReason = reason;
  }

  /*
   * Aplica una acción. Devuelve una lista de eventos para mostrar.
   * scores se modifica in situ para los puntos de envido (se anotan al momento).
   */
  function apply(h, p, act, scores, target) {
    const ev = [];
    const o = 1 - p;
    switch (act.type) {
      case 'play': {
        const i = h.cards[p].findIndex((c) => c.id === act.card.id);
        const card = h.cards[p].splice(i, 1)[0];
        h.played[p].push(card);
        h.trickCards[p] = card;
        ev.push({ t: 'play', p, card });
        if (h.trickCards[o]) {
          const r = compare(h.trickCards[0], h.trickCards[1]);
          h.results.push(r);
          ev.push({ t: 'trick', r, trick: h.trick });
          const w = handWinner(h.results, h.mano);
          h.trickCards = [null, null];
          h.trick++;
          h.turn = r === 'p' ? h.mano : r;
          h.trickLeaders.push(h.turn);
          if (w !== null) endHand(h, w, h.trucoLevel, 'cards');
        } else {
          h.turn = o;
        }
        break;
      }
      case 'truco': {
        if (h.trucoPending) h.trucoLevel = h.trucoPending.to; // subir implica querer lo anterior
        const to = h.trucoLevel + 1;
        h.trucoPending = { to, caller: p };
        h.trucoCalls[p]++;
        ev.push({ t: 'say', p, text: to === 2 ? '¡Truco!' : to === 3 ? '¡Quiero retruco!' : '¡Quiero vale cuatro!', call: 'truco', to });
        break;
      }
      case 'envido': {
        h.envCalls.push(act.kind);
        h.envCallers.push(p);
        h.envPending = true;
        h.envCaller = p;
        ev.push({ t: 'say', p, text: '¡' + ENV_NAMES[act.kind] + '!', call: act.kind });
        break;
      }
      case 'quiero': {
        if (h.envPending) {
          ev.push({ t: 'say', p, text: '¡Quiero!' });
          h.envPending = false;
          h.envDone = true;
          const e = h.envPoints, m = h.mano, nm = 1 - m;
          const w = e[nm] > e[m] ? nm : m;
          const val = envAcceptedValue(h.envCalls, scores, target, w);
          h.envKnown[m] = e[m];
          ev.push({ t: 'say', p: m, text: 'Tengo ' + e[m] + '.' });
          if (w === nm) {
            h.envKnown[nm] = e[nm];
            ev.push({ t: 'say', p: nm, text: e[nm] + ' son mejores.' });
          } else {
            ev.push({ t: 'say', p: nm, text: 'Son buenas.' });
          }
          scores[w] += val;
          h.envResult = { winner: w, points: val, accepted: true };
          ev.push({ t: 'envido', winner: w, points: val });
        } else if (h.trucoPending) {
          h.trucoLevel = h.trucoPending.to;
          h.trucoOwner = p;
          h.trucoPending = null;
          ev.push({ t: 'say', p, text: '¡Quiero!' });
        }
        break;
      }
      case 'noquiero': {
        ev.push({ t: 'say', p, text: 'No quiero.' });
        if (h.envPending) {
          const val = envDeclinedValue(h.envCalls);
          h.envPending = false;
          h.envDone = true;
          scores[h.envCaller] += val;
          h.envResult = { winner: h.envCaller, points: val, accepted: false };
          ev.push({ t: 'envido', winner: h.envCaller, points: val });
        } else if (h.trucoPending) {
          endHand(h, h.trucoPending.caller, h.trucoLevel, 'noquiero');
          h.trucoPending = null;
        }
        break;
      }
      case 'mazo': {
        ev.push({ t: 'say', p, text: 'Me voy al mazo.' });
        if (h.trucoPending) {
          endHand(h, h.trucoPending.caller, h.trucoLevel, 'mazo');
          h.trucoPending = null;
        } else {
          endHand(h, o, h.trucoLevel, 'mazo');
        }
        break;
      }
    }
    // Se terminó el partido por el envido
    if (!h.over && (scores[0] >= target || scores[1] >= target)) {
      endHand(h, scores[0] >= target ? 0 : 1, 0, 'game');
    }
    return ev;
  }

  window.Engine = { newHand, actorOf, legalActions, apply, envidoAvailable, envAcceptedValue, envDeclinedValue, faltaValue, TRUCO_NAMES, ENV_NAMES };
})();
