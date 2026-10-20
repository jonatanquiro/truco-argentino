/*
 * Pruebas de reglas del truco. Correr con:  node tests/reglas.test.js
 * Cada caso arma una mano con cartas fijas, aplica una secuencia de acciones y compara los puntos.
 */
global.window = global;
require('../js/cards.js');
require('../js/engine.js');
const C = window.Cards, E = window.Engine;

let ok = 0, fail = 0;
function check(name, got, want) {
  const g = JSON.stringify(got), w = JSON.stringify(want);
  if (g === w) ok++;
  else { fail++; console.log('✗', name, '→ dio', g, 'esperaba', w); }
}

const card = (id) => { const [v, s] = id.split('-'); return { v: +v, s, id }; };
// mazo con las primeras cartas fijas (3 por jugador, en orden de asiento)
function deckWith(ids) {
  const fixed = ids.map(card);
  return fixed.concat(C.makeDeck().filter((c) => !ids.includes(c.id)));
}
// juega una secuencia; cada paso es [tipo, kind?] o ['play', id]. Devuelve puntos por equipo al final de la mano.
function play({ n = 2, mano = 0, ids, flor = false, scores = [0, 0], target = 30 }, steps) {
  const h = E.newHand(mano, { n, flor, deck: ids ? deckWith(ids) : undefined });
  const sc = scores.slice();
  for (const [type, x] of steps) {
    const a = E.actorOf(h);
    const act = type === 'play' ? { type, card: h.cards[a].find((c) => c.id === x) } : type === 'envido' ? { type, kind: x } : { type };
    if (type === 'play' && !act.card) throw new Error('el asiento ' + a + ' no tiene ' + x);
    E.apply(h, a, act, sc, target);
    if (h.over) break;
  }
  if (h.over && h.endReason !== 'game') sc[h.winner] += h.points;
  return { sc, h };
}

/* ---------- Cartas ---------- */
const order = ['1-espada', '1-basto', '7-espada', '7-oro', '3-copa', '2-oro', '1-copa', '12-basto', '11-oro', '10-copa', '7-copa', '6-oro', '5-basto', '4-espada'];
for (let i = 0; i < order.length - 1; i++) check(`${order[i]} le gana a ${order[i + 1]}`, C.compare(card(order[i]), card(order[i + 1])), 0);
check('3 de copa empata con 3 de oro', C.compare(card('3-copa'), card('3-oro')), 'p');
check('1 de copa y 1 de oro son falsos (empatan)', C.compare(card('1-copa'), card('1-oro')), 'p');
check('7 de copa empata con 7 de basto', C.compare(card('7-copa'), card('7-basto')), 'p');

/* ---------- Tantos ---------- */
const env = (...ids) => C.envidoPoints(ids.map(card));
check('envido 7+6 de oro = 33', env('7-oro', '6-oro', '1-espada'), 33);
check('envido con figura: 12+5 = 25', env('12-copa', '5-copa', '4-oro'), 25);
check('envido dos figuras = 20', env('10-basto', '12-basto', '7-oro'), 20);
check('envido sin pareja: la más alta', env('7-oro', '4-copa', '2-basto'), 7);
check('envido sin pareja, sólo figuras = 0', env('10-oro', '11-copa', '12-espada'), 0);
check('envido con tres del mismo palo usa las dos mejores', env('5-oro', '12-oro', '7-oro'), 32);
check('flor 7+6+5 = 38', C.florPoints(['7-oro', '6-oro', '5-oro'].map(card)), 38);

/* ---------- Bazas y pardas ---------- */
const hw = C.handWinner;
check('gana dos seguidas', hw([0, 0], 1), 0);
check('parda la primera, decide la segunda', hw(['p', 1], 0), 1);
check('ganó la primera, parda la segunda → gana el de la primera', hw([1, 'p'], 0), 1);
check('primera y segunda pardas, decide la tercera', hw(['p', 'p', 0], 1), 0);
check('todas pardas → gana el mano', hw(['p', 'p', 'p'], 1), 1);
check('una y una, parda la tercera → gana el de la primera', hw([0, 1, 'p'], 1), 0);
check('una y una, gana la tercera', hw([0, 1, 1], 0), 1);
check('con una baza no está definida', hw([0], 0), null);
{
  // después de una parda, sale el mano
  const { h } = play({ mano: 1, ids: ['3-copa', '4-oro', '5-oro', '3-oro', '4-copa', '5-copa'] }, [['play', '3-oro'], ['play', '3-copa']]);
  check('después de parda sale el mano', [h.results[0], h.turn], ['p', 1]);
}

/* ---------- Envido ---------- */
// asiento 0: 33 (7 y 6 de oro), asiento 1: 20; mano = 1 (la máquina canta primero)
const E33 = ['7-oro', '6-oro', '4-basto', '10-copa', '12-copa', '4-espada'];
const envCase = (name, steps, want, opts) => check(name, play(Object.assign({ mano: 1, ids: E33 }, opts), steps).sc, want);
envCase('envido no querido = 1', [['envido', 'envido'], ['noquiero']], [0, 1]);
envCase('envido querido = 2 al mejor', [['envido', 'envido'], ['quiero']], [2, 0]);
envCase('envido-envido no querido = 2', [['envido', 'envido'], ['envido', 'envido'], ['noquiero']], [2, 0]);
envCase('envido-envido querido = 4', [['envido', 'envido'], ['envido', 'envido'], ['quiero']], [4, 0]);
envCase('envido + real no querido = 2', [['envido', 'envido'], ['envido', 'real'], ['noquiero']], [2, 0]);
envCase('envido + real querido = 5', [['envido', 'envido'], ['envido', 'real'], ['quiero']], [5, 0]);
envCase('envido-envido-real no querido = 4', [['envido', 'envido'], ['envido', 'envido'], ['envido', 'real'], ['noquiero']], [0, 4]);
envCase('envido-envido-real querido = 7', [['envido', 'envido'], ['envido', 'envido'], ['envido', 'real'], ['quiero']], [7, 0]);
envCase('real envido no querido = 1', [['envido', 'real'], ['noquiero']], [0, 1]);
envCase('real envido querido = 3', [['envido', 'real'], ['quiero']], [3, 0]);
envCase('falta envido no querida = 1', [['envido', 'falta'], ['noquiero']], [0, 1]);
envCase('envido + falta no querida = 2', [['envido', 'envido'], ['envido', 'falta'], ['noquiero']], [2, 0]);
envCase('envido + real + falta no querida = 5', [['envido', 'envido'], ['envido', 'real'], ['envido', 'falta'], ['noquiero']], [0, 5]);
envCase('falta en las malas gana el partido', [['envido', 'falta'], ['quiero']], [30, 0], { scores: [0, 0] });
envCase('falta en las buenas: lo que le falta al que va ganando (30 - 20 = 10)', [['envido', 'falta'], ['quiero']], [10 + 10, 20], { scores: [10, 20] });
{
  // empate de envido: gana el mano
  const tie = ['7-oro', '6-oro', '4-basto', '7-copa', '6-copa', '4-espada'];
  check('empate de envido lo gana el mano', play({ mano: 1, ids: tie }, [['envido', 'envido'], ['quiero']]).sc, [0, 2]);
}
{
  // no se puede cantar envido después de tirar tu carta, ni con el truco querido
  const { h } = play({ mano: 0, ids: E33 }, [['play', '4-basto']]);
  check('el pie todavía puede cantar envido', E.legalActions(h, 1).envido, true);
  check('el que ya tiró no puede', E.envidoAvailable(h, 0), false);
  const r = play({ mano: 0, ids: E33 }, [['truco'], ['quiero']]);
  check('con el truco querido ya no hay envido', E.legalActions(r.h, 0).envido, false);
  const t = play({ mano: 0, ids: E33 }, [['truco']]);
  check('el envido está primero: podés contestar el truco con envido', E.legalActions(t.h, 1).envido, true);
  const t2 = play({ mano: 0, ids: E33 }, [['truco'], ['envido', 'envido'], ['quiero']]);
  check('después del envido sigue pendiente el truco', [!!t2.h.trucoPending, E.actorOf(t2.h)], [true, 1]);
}

/* ---------- Truco ---------- */
const T = ['1-espada', '1-basto', '7-espada', '4-copa', '5-copa', '6-copa'];
const tr = (name, steps, want, opts) => check(name, play(Object.assign({ mano: 1, ids: T }, opts), steps).sc, want);
tr('truco no querido = 1', [['truco'], ['noquiero']], [0, 1]);
tr('truco querido y retruco no querido = 2', [['truco'], ['truco'], ['noquiero']], [2, 0]);
tr('retruco querido y vale cuatro no querido = 3', [['truco'], ['truco'], ['truco'], ['noquiero']], [0, 3]);
tr('vale cuatro querido y ganado = 4', [['truco'], ['quiero'], ['play', '4-copa'], ['truco'], ['quiero'], ['truco'], ['quiero'], ['play', '1-espada'], ['play', '1-basto'], ['play', '5-copa']], [4, 0]);
{
  const { h } = play({ mano: 1, ids: T }, [['truco'], ['quiero']]);
  check('el que quiso puede subir, el que cantó no', [E.legalActions(h, 1).truco, h.trucoOwner], [0, 0]);
}

/* ---------- Al mazo ---------- */
tr('mazo en la primera sin envido = 2', [['mazo']], [2, 0]);
tr('mazo en la primera después del envido = 1', [['envido', 'envido'], ['noquiero'], ['mazo']], [1, 1]);
tr('te cantan truco y te vas al mazo = 1', [['truco'], ['mazo']], [0, 1]);
tr('te cantan truco antes de tirar cartas y te vas = 1', [['truco'], ['mazo']], [0, 1], { mano: 1 });
tr('truco querido y después al mazo = 2', [['truco'], ['quiero'], ['mazo']], [2, 0]);
tr('retruco cantado y te vas al mazo = 2', [['truco'], ['truco'], ['mazo']], [2, 0]);
tr('mazo en la segunda = 1 (se va el que ganó la primera)', [['play', '4-copa'], ['play', '1-espada'], ['mazo']], [0, 1], { mano: 1 });

/* ---------- Flor ---------- */
const F = ['7-oro', '6-oro', '5-oro', '4-copa', '12-basto', '2-espada'];
{
  const { h } = play({ mano: 0, ids: F, flor: true }, []);
  check('con flor sólo podés cantarla', Object.keys(E.legalActions(h, 0)).filter((k) => E.legalActions(h, 0)[k] === true), ['flor']);
}
check('flor sola = 3', play({ mano: 0, ids: F, flor: true }, [['flor']]).sc, [3, 0]);
{
  const r = play({ mano: 1, ids: F, flor: true }, [['envido', 'envido'], ['flor']]);
  check('la flor anula el envido (sin puntos por el envido)', [r.sc, r.h.envDone, r.h.envPending], [[3, 0], true, false]);
}
const FF = ['7-oro', '6-oro', '5-oro', '1-copa', '2-copa', '3-copa'];
check('con flor me achico = 4 al que cantó', play({ mano: 0, ids: FF, flor: true }, [['flor'], ['achico']]).sc, [4, 0]);
check('contraflor querida = 6 al mejor', play({ mano: 0, ids: FF, flor: true }, [['flor'], ['contraflor'], ['quiero']]).sc, [6, 0]);
check('contraflor no querida = 4 al que la cantó', play({ mano: 0, ids: FF, flor: true }, [['flor'], ['contraflor'], ['noquiero']]).sc, [0, 4]);

/* ---------- Equipos (2 contra 2) ---------- */
// asientos 0 y 2 = nosotros, 1 y 3 = ellos
const TEAM = ['4-oro', '5-copa', '6-basto', '7-copa', '2-copa', '1-basto', '7-oro', '6-oro', '2-espada', '12-basto', '11-basto', '4-espada'];
{
  // mano 1: los pie son el asiento 3 (ellos) y el 0 (nosotros)
  const r = play({ n: 4, mano: 1, ids: TEAM }, [['play', '7-copa'], ['play', '7-oro'], ['envido', 'envido'], ['quiero']]);
  check('equipos: gana el mejor envido de cada equipo (33 de mi compañero)', r.sc, [2, 0]);
  const q = play({ n: 4, mano: 1, ids: TEAM }, [['truco'], ['quiero']]);
  check('equipos: el quiero es del equipo (mi compañero puede subir, el rival no)', [E.legalActions(q.h, 1).truco, q.h.trucoOwner], [0, 0]);
  const m = play({ n: 4, mano: 0, ids: TEAM }, [['mazo']]);
  check('equipos: al mazo en la primera sin envido = 2 para el otro equipo', m.sc, [0, 2]);
}
{
  const tie = ['7-oro', '6-oro', '4-basto', '7-copa', '6-copa', '4-espada', '10-oro', '11-oro', '12-oro', '10-copa', '11-copa', '12-copa'];
  check('equipos: empate de envido lo gana el más cercano a la mano', play({ n: 4, mano: 1, ids: tie }, [['play', '7-copa'], ['play', '10-oro'], ['envido', 'envido'], ['quiero']]).sc, [0, 2]);
}

{
  // el tanto lo cantan sólo los pie: con mano 0 en 2 contra 2, el 3.º (asiento 2) y el 4.º (asiento 3)
  const h = E.newHand(0, { n: 4, flor: false, deck: deckWith(TEAM) });
  check('2v2: el mano y el 2.º no pueden cantar envido', [E.envidoAvailable(h, 0), E.envidoAvailable(h, 1)], [false, false]);
  check('2v2: el 3.º y el 4.º sí', [E.envidoAvailable(h, 2), E.envidoAvailable(h, 3)], [true, true]);
  const r = play({ n: 4, mano: 0, ids: TEAM }, [['play', '4-oro'], ['play', '7-copa'], ['envido', 'envido']]);
  check('2v2: cuando canta el pie (asiento 2), contesta el pie rival (asiento 3)', E.actorOf(r.h), 3);
  const r2 = play({ n: 4, mano: 0, ids: TEAM }, [['play', '4-oro'], ['play', '7-copa'], ['envido', 'envido'], ['envido', 'real']]);
  check('2v2: si el pie rival sube, vuelve a contestar mi pie', E.actorOf(r2.h), 2);
  const h6 = E.newHand(1, { n: 6, flor: false });
  check('3v3: sólo el 5.º y el 6.º pueden cantar tanto', [0, 1, 2, 3, 4, 5].map((q) => E.isPie(h6, q)), [true, false, false, false, false, true]);
}

{
  // "el envido está primero" en equipos: mano 0 canta truco, contesta el rival más cercano a la mano (asiento 1)
  const t = play({ n: 4, mano: 0, ids: TEAM }, [['truco']]);
  check('2v2: el truco lo contesta el rival más cercano a la mano', E.actorOf(t.h), 1);
  check('2v2: el que sigue puede decir "el envido está primero" aunque no sea pie', E.legalActions(t.h, 1).envido, true);
  const e = play({ n: 4, mano: 0, ids: TEAM }, [['truco'], ['envido', 'envido']]);
  check('2v2: ese envido lo contesta el pie del otro equipo (asiento 2)', E.actorOf(e.h), 2);
  const q = play({ n: 4, mano: 0, ids: TEAM }, [['truco'], ['envido', 'envido'], ['quiero']]);
  check('2v2: resuelto el envido, el truco vuelve al que lo tenía que contestar', [E.actorOf(q.h), !!q.h.trucoPending], [1, true]);
  // el 3.º canta truco: contesta el rival más cercano a la mano (el asiento 1, que ya jugó) y puede pedir el envido
  const t3 = play({ n: 4, mano: 0, ids: TEAM }, [['play', '4-oro'], ['play', '7-copa'], ['truco']]);
  check('2v2: si canta el 3.º, contesta el 2.º y todavía puede ir el envido (su pie no jugó)', [E.actorOf(t3.h), E.legalActions(t3.h, 1).envido], [1, true]);
  const t4 = play({ n: 4, mano: 0, ids: TEAM }, [['play', '4-oro'], ['play', '7-copa'], ['play', '7-oro'], ['truco']]);
  check('2v2: si canta el 4.º, contesta el mano; su pie ya jugó, así que no hay envido', [E.actorOf(t4.h), E.legalActions(t4.h, 0).envido], [0, false]);
}
// al mazo con un envido sin contestar: cuenta como no querido, más la mano
tr('al mazo con el envido pendiente = 1 del envido + 1 de la mano', [['envido', 'envido'], ['mazo']], [0, 2]);
tr('al mazo con envido-envido pendiente = 2 + 1', [['envido', 'envido'], ['envido', 'envido'], ['mazo']], [3, 0]);
{
  // pica-pica: la falta envido vale 6
  const h = E.newHand(1, { n: 2, flor: false, faltaFixed: 6, deck: deckWith(E33) });
  const sc = [0, 0];
  E.apply(h, 1, { type: 'envido', kind: 'falta' }, sc, 30);
  E.apply(h, 0, { type: 'quiero' }, sc, 30);
  check('pica-pica: la falta envido vale 6', sc, [6, 0]);
  const r = play({ mano: 1, ids: E33 }, [['envido', 'envido'], ['quiero']]);
  check('se anota quién ganó el envido para mostrar sus cartas', r.h.envResult.seat, 0);
}

{
  // truco fuera de turno: el mano tira y, mientras piensa el rival, le canta truco
  const T2 = ['1-espada', '1-basto', '7-espada', '4-copa', '5-copa', '6-copa'];
  const h = E.newHand(0, { n: 2, flor: false, deck: deckWith(T2) });
  const sc = [0, 0];
  E.apply(h, 0, { type: 'play', card: h.cards[0][0] }, sc, 30);
  check('fuera de turno: el que ya tiró puede cantar truco', [E.actorOf(h), E.canCallTruco(h, 0)], [1, true]);
  E.apply(h, 0, { type: 'truco' }, sc, 30);
  check('fuera de turno: contesta el rival y después sigue su turno', [E.actorOf(h), h.turn], [1, 1]);
  check('fuera de turno: con un canto esperando respuesta no se puede cantar otro', E.canCallTruco(h, 0), false);
  E.apply(h, 1, { type: 'quiero' }, sc, 30);
  check('fuera de turno: después de querer, le toca tirar al rival, que tiene el quiero', [E.actorOf(h), E.canCallTruco(h, 1), E.canCallTruco(h, 0)], [1, true, false]);
  const h4 = E.newHand(0, { n: 4, flor: false, deck: deckWith(TEAM) });
  check('2v2: mi compañero (o yo) podemos cantar truco cuando le toca a otro', [E.canCallTruco(h4, 2), E.canCallTruco(h4, 3)], [true, true]);
}

/* ---------- Fin del partido ---------- */
{
  const r = play({ mano: 1, ids: E33, scores: [28, 0] }, [['envido', 'envido'], ['quiero']]);
  check('si el envido te hace llegar, el partido termina en el momento', [r.h.over, r.h.endReason, r.sc[0] >= 30], [true, 'game', true]);
}

console.log(`\n${ok} reglas bien, ${fail} mal`);
process.exit(fail ? 1 : 0);
