/*
 * Un partido: reparte, le pregunta a cada asiento qué hace, aplica las reglas y anota.
 * No sabe nada de la pantalla: le avisa a `view` lo que pasa.
 *
 * view.render(match)            redibujar
 * view.showEvents(events)       mostrar lo que pasó (async)
 * view.handOver(hand)           fin de mano (async: espera que sigan)
 * view.matchOver(winner)        fin del partido
 */
(function () {
  const E = window.Engine;

  class Match {
    constructor({ seats, target, flor, view }) {
      this.seats = seats;
      this.target = target;
      this.flor = flor;
      this.view = view;
      this.scores = [0, 0];
      this.mano = Math.random() < 0.5 ? 0 : 1;
      this.hand = null;
      this.pending = null;   // { seat, legal } mientras se espera una decisión
      this.stopped = false;
      this.winner = null;
    }

    stop() { this.stopped = true; }

    async run() {
      while (!this.stopped) {
        this.hand = E.newHand(this.mano, { flor: this.flor });
        this.view.render(this);
        const ok = await this.playHand();
        if (!ok) return;
        const h = this.hand;
        if (h.endReason !== 'game') this.scores[h.winner] = Math.min(this.target, this.scores[h.winner] + h.points);
        this.seats.forEach((s) => s.onHandEnd && s.onHandEnd(h));
        this.view.render(this);
        if (this.scores[0] >= this.target || this.scores[1] >= this.target) {
          this.winner = this.scores[0] >= this.target ? 0 : 1;
          this.view.matchOver(this.winner, h);
          return;
        }
        await this.view.handOver(h);
        if (this.stopped) return;
        this.mano = 1 - this.mano;
      }
    }

    async playHand() {
      const h = this.hand;
      while (!h.over) {
        const seat = E.actorOf(h);
        const legal = E.legalActions(h, seat);
        this.pending = { seat, legal };
        const decision = this.seats[seat].act(h, seat, legal, { scores: this.scores, target: this.target });
        this.view.render(this);
        const act = await decision;
        this.pending = null;
        if (this.stopped) return false;
        const events = E.apply(h, seat, act, this.scores, this.target);
        await this.view.showEvents(events);
        if (this.stopped) return false;
      }
      return true;
    }
  }

  window.Match = Match;
})();
