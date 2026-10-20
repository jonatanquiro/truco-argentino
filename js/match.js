/*
 * Un partido: reparte, le pregunta a cada asiento qué hace, aplica las reglas y anota.
 * No sabe nada de la pantalla: le avisa a `view` lo que pasa.
 *
 * view.render(match)            redibujar
 * view.showEvents(events)       mostrar lo que pasó (async)
 * view.handOver(hand)           fin de mano (async: espera que sigan)
 * view.handResult(hand)         anotar el resultado de la última mano cuando termina el partido
 * view.matchOver(winner)        fin del partido
 * view.picaResults(results)     resultado de los mano a mano que no jugaste vos (pica-pica)
 *
 * Pica-pica (sólo 3 contra 3 a 30): cuando algún equipo llega a 5 y hasta que alguno llegue a 25,
 * se alterna una mano normal con una en la que cada uno juega mano a mano contra el rival de enfrente.
 */
(function () {
  const E = window.Engine;
  const PICA_FROM = 5, PICA_TO = 25;

  class Match {
    constructor({ seats, target, flor, view }) {
      this.seats = seats;
      this.target = target;
      this.flor = flor;
      this.view = view;
      this.scores = [0, 0];
      this.mano = Math.floor(Math.random() * seats.length);
      this.hand = null;
      this.pending = null;   // { seat, legal } mientras se espera una decisión
      this.stopped = false;
      this.winner = null;
      this.handNo = 0;
      this.hints = {};      // pedidos entre compañeros: { equipo: { type, hand, trick } }
      this.duelMap = null;  // en una mano de pica-pica: asiento del mano a mano → asiento real
      this.picaNext = true; // la primera mano dentro del rango es de pica-pica
      this.pica = false;
    }

    stop() { this.stopped = true; }

    // ¿Esta mano es de pica-pica?
    nextIsPica() {
      if (this.seats.length !== 6 || this.target !== 30) return false;
      const hi = Math.max(this.scores[0], this.scores[1]);
      if (hi < PICA_FROM || hi >= PICA_TO) { this.picaNext = true; return false; }
      const pica = this.picaNext;
      this.picaNext = !pica;
      return pica;
    }

    seat(i) { return this.duelMap ? this.seats[this.duelMap[i]] : this.seats[i]; }

    // en cada mano a mano es mano el que está más cerca de la mano de la ronda
    duelMano(a, b) {
      const n = this.seats.length;
      const d = (q) => (q - this.mano + n) % n;
      return d(a) < d(b) ? 0 : 1;
    }

    newHand(opts) {
      this.hand = E.newHand(opts.mano, { flor: this.flor, n: opts.n });
      this.handNo++;
      this.hand.no = this.handNo;
      return this.hand;
    }

    over() {
      if (this.scores[0] >= this.target || this.scores[1] >= this.target) {
        this.winner = this.scores[0] >= this.target ? 0 : 1;
        return true;
      }
      return false;
    }

    async run() {
      while (!this.stopped) {
        const n = this.seats.length;
        this.pica = this.nextIsPica();
        // tu mano a mano es contra el de enfrente (asiento 0 contra el 3); con 2 asientos el equipo 0 queda en el 0
        this.duelMap = this.pica ? [0, n / 2] : null;
        const h = this.newHand(this.pica ? { n: 2, mano: this.duelMano(0, n / 2) } : { n, mano: this.mano });
        this.view.render(this);
        const ok = await this.playHand();
        if (!ok) return;
        if (h.endReason !== 'game') this.scores[h.winner] = Math.min(this.target, this.scores[h.winner] + h.points);
        if (!this.pica) this.seats.forEach((s) => s.onHandEnd && s.onHandEnd(h));
        this.view.render(this);
        // los otros dos mano a mano se juegan solos (se muestran después del tuyo)
        const results = [];
        if (this.pica && !this.over()) {
          for (let k = 1; k < n / 2 && !this.over(); k++) {
            const a = 2 * k, b = (2 * k + n / 2) % n;   // compañero contra su rival de enfrente
            results.push(this.quickDuel(a, b));
          }
        }
        if (this.over()) {
          if (this.view.handResult) this.view.handResult(h);
          if (results.length) await this.view.picaResults(results);
          this.view.render(this);
          this.view.matchOver(this.winner, h);
          return;
        }
        await this.view.handOver(h);
        if (this.stopped) return;
        if (results.length) {
          await this.view.picaResults(results);
          if (this.stopped) return;
        }
        this.duelMap = null;
        this.mano = (this.mano + 1) % n; // la mano pasa al de la derecha
      }
    }

    // Un mano a mano entre dos asientos de la máquina, al instante
    quickDuel(a, b) {
      const map = [a, b];
      const before = this.scores.slice();
      const h = E.newHand(this.duelMano(a, b), { flor: this.flor, n: 2 });
      h.no = 'pica-' + this.handNo + '-' + a;
      let guard = 0;
      while (!h.over && guard++ < 200) {
        const i = E.actorOf(h);
        const legal = E.legalActions(h, i);
        const s = this.seats[map[i]];
        const act = window.AI.decide(h, i, legal, { persona: s.persona, scores: this.scores, target: this.target, memory: s.memory });
        E.apply(h, i, act, this.scores, this.target);
      }
      if (h.endReason !== 'game') this.scores[h.winner] = Math.min(this.target, this.scores[h.winner] + h.points);
      return { seats: map, won: this.scores.map((x, t) => x - before[t]), hand: h };
    }

    async playHand() {
      const h = this.hand;
      while (!h.over) {
        const seat = E.actorOf(h);
        const legal = E.legalActions(h, seat);
        this.pending = { seat, legal };
        const decision = this.seat(seat).act(h, seat, legal, { scores: this.scores, target: this.target, hints: this.pica ? {} : this.hints });
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
