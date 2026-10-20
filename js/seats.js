/*
 * Asientos: quién decide en cada lugar de la mesa.
 * El partido (match.js) sólo le pregunta a cada asiento "¿qué hacés?" y aplica la respuesta,
 * así que da lo mismo si del otro lado hay una persona, la máquina o alguien por internet.
 *
 * Interfaz de un asiento:
 *   seat.act(hand, seatIndex, legal, ctx) -> Promise<acción>
 *   seat.onHandEnd?(hand)                     (opcional)
 * Una acción es un objeto plano y serializable: { type: 'play', card } | { type: 'truco' } |
 * { type: 'envido', kind } | { type: 'quiero' } | ...
 *
 * Para multijugador alcanzaría con un RemoteSeat que mande `legal` y espere la acción por la red,
 * y que el anfitrión mezcle y comparta el mazo (Engine.newHand acepta opts.deck).
 */
(function () {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // Persona en este dispositivo: espera que toque una carta o un botón
  class LocalSeat {
    constructor() { this.resolve = null; }
    act() { return new Promise((res) => { this.resolve = res; }); }
    submit(action) {
      if (!this.resolve) return false;
      const r = this.resolve;
      this.resolve = null;
      r(action);
      return true;
    }
    get waiting() { return !!this.resolve; }
  }

  // La máquina
  class AISeat {
    // ask(h, seat): opcional; un compañero tuyo puede preguntarte antes de tirar ("¿Pongo o vengo?")
    // consult(h, seat, legal, propia): opcional; te consulta antes de contestar un canto y devuelve tu decisión (o null)
    constructor(persona, speed, ask, consult) {
      this.persona = persona;
      this.speed = speed || (() => 1);
      this.ask = ask || null;
      this.consult = consult || null;
      this.memory = window.AI.newMemory();
    }
    async act(h, seat, legal, ctx) {
      await sleep((legal.kind === 'turn' && !legal.flor ? 750 : 950) * this.speed());
      const think = (lg) => window.AI.decide(h, seat, lg || legal, { persona: this.persona, scores: ctx.scores, target: ctx.target, memory: this.memory, hints: ctx.hints });
      let act = think();
      if (this.consult && !legal.flor) {
        // si le cantaron a él, te dice qué haría y decidís vos por el equipo
        if (['truco', 'envido', 'flor'].includes(legal.kind)) {
          const yours = await this.consult(h, seat, legal, act, 'respond');
          return yours || act;
        }
        // si quiere cantar por su cuenta, te pide permiso (salvo que se lo hayas pedido vos)
        const hint = ctx.hints && ctx.hints[seat % 2];
        const asked = hint && hint.hand === h.no && hint.type === 'truco' && act.type === 'truco';
        if ((act.type === 'truco' || act.type === 'envido') && !asked) {
          const calls = Object.assign({}, legal, { play: false, mazo: false, pass: true });
          const yours = await this.consult(h, seat, calls, act, 'call');
          if (yours && yours.type !== 'pass') return yours;
          act = think(Object.assign({}, legal, { truco: 0, envido: false, real: false, falta: false }));
        }
      }
      // si iba a tirar una carta, primero le pregunta al compañero (si corresponde) y vuelve a pensar con la respuesta
      // (ya decidió no cantar, así que vuelve a pensar sólo qué carta tirar)
      if (act.type === 'play' && this.ask && (await this.ask(h, seat))) return think(Object.assign({}, legal, { truco: 0, envido: false, real: false, falta: false }));
      return act;
    }
    // la lectura del humano sólo se hace mano a mano (en equipos hay varios a quienes leer)
    onHandEnd(h) { if (h.n === 2) window.AI.learn(this.memory, h); }
  }

  window.Seats = { LocalSeat, AISeat };
})();
