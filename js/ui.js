/* Pantallas, mesa y entrada del jugador. El partido en sí está en match.js. */
(function () {
  const { cardSVG, backSVG, cardName } = window.Cards;
  const E = window.Engine;
  const $ = (id) => document.getElementById(id);
  const ME = 0, OPP = 1; // asiento de este dispositivo y del rival

  /* ---------- Guardado local (puede fallar en modo privado) ---------- */
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sin guardado */ } }
  };

  const S = {
    persona: null,
    target: store.get('truco.target', 30),
    flor: store.get('truco.flor', true),
    match: null,
    local: null,      // asiento LocalSeat de este dispositivo
    fresh: null
  };

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const pickOne = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const oppName = () => S.persona.name;
  const who = (p) => (p === ME ? 'vos' : oppName());

  /* ---------- Menú ---------- */
  function renderMenu() {
    const stats = store.get('truco.stats', {});
    $('personas').innerHTML = window.PERSONAS.map((p) => {
      const st = stats[p.id] || { w: 0, l: 0 };
      const pips = Array.from({ length: 8 }, (_, i) => `<i class="${i < p.level ? 'on' : ''}"></i>`).join('');
      return `<button class="persona" type="button" data-id="${p.id}" style="--accent:${p.color}">
        <div class="persona-head">
          <div class="persona-avatar">${p.avatar}</div>
          <div class="persona-titles">
            <div class="persona-name">${p.name}${st.w ? '<span class="badge">🏆 ' + st.w + '</span>' : ''}</div>
            <div class="persona-level">Nivel ${p.level} · ${p.levelName}</div>
            <div class="pips" aria-hidden="true">${pips}</div>
          </div>
        </div>
        <p class="persona-desc">${p.desc}</p>
        <div class="persona-foot"><span>Ganaste ${st.w} · Perdiste ${st.l}</span><span class="play">Jugar</span></div>
      </button>`;
    }).join('');
    document.querySelectorAll('[data-target]').forEach((b) => b.setAttribute('aria-checked', String(+b.dataset.target === S.target)));
    document.querySelectorAll('[data-flor]').forEach((b) => b.setAttribute('aria-checked', String((b.dataset.flor === '1') === S.flor)));
  }

  $('personas').addEventListener('click', (e) => {
    const b = e.target.closest('.persona');
    if (b) startMatch(window.PERSONAS.find((p) => p.id === b.dataset.id));
  });
  document.querySelectorAll('[data-target]').forEach((b) => b.addEventListener('click', () => {
    S.target = +b.dataset.target;
    store.set('truco.target', S.target);
    renderMenu();
  }));
  document.querySelectorAll('[data-flor]').forEach((b) => b.addEventListener('click', () => {
    S.flor = b.dataset.flor === '1';
    store.set('truco.flor', S.flor);
    renderMenu();
  }));

  function showScreen(id) {
    $('menu').classList.toggle('hidden', id !== 'menu');
    $('game').classList.toggle('hidden', id !== 'game');
    document.body.classList.toggle('in-game', id === 'game');
    window.scrollTo(0, 0);
  }

  function stopMatch() {
    if (S.match) S.match.stop();
    S.match = null;
    $('modal').classList.add('hidden');
    $('hand-overlay').classList.add('hidden');
  }

  $('btn-back').addEventListener('click', () => {
    const m = S.match;
    if (m && m.winner === null && (m.scores[0] || m.scores[1]) && !confirm('¿Abandonar el partido?')) return;
    stopMatch();
    renderMenu();
    showScreen('menu');
  });
  $('btn-menu').addEventListener('click', () => { stopMatch(); renderMenu(); showScreen('menu'); });
  $('btn-rematch').addEventListener('click', () => startMatch(S.persona));

  /* ---------- Partido ---------- */
  function startMatch(persona) {
    stopMatch();
    S.persona = persona;
    S.local = new window.Seats.LocalSeat();
    const seats = [S.local, new window.Seats.AISeat(persona)];
    const m = new window.Match({ seats, target: S.target, flor: S.flor, view });
    S.match = m;
    $('log').innerHTML = '';
    $('opp-avatar').textContent = persona.avatar;
    document.querySelector('.table').style.setProperty('--accent', persona.color);
    $('opp-name').textContent = persona.name;
    $('opp-level').textContent = 'Nivel ' + persona.level + ' · ' + persona.levelName;
    showScreen('game');
    log(`Partido a ${S.target}${S.flor ? ', con flor' : ', sin flor'}, contra ${persona.name}.`, 'sep');
    say(OPP, pickOne(persona.say.greet), 2400);
    m.run();
  }

  const live = (m) => m === S.match && !m.stopped;

  const view = {
    render(m) { if (live(m)) render(m); },

    async showEvents(events) {
      const m = S.match;
      for (const ev of events) {
        if (!live(m)) return;
        if (ev.t === 'say') {
          const text = ev.p === OPP ? personaLine(ev) : ev.text;
          say(ev.p, text, 1600);
          log(ev.p === ME ? `Vos: ${ev.text}` : `${oppName()}: ${text}`, ev.p === ME ? 'me' : '');
          render(m);
          await sleep(ev.p === OPP ? 950 : 500);
        } else if (ev.t === 'play') {
          S.fresh = ev.card.id;
          log(ev.p === ME ? `Tirás el ${cardName(ev.card)}` : `${oppName()} tira el ${cardName(ev.card)}`, 'play');
          render(m);
          await sleep(ev.p === OPP ? 380 : 180);
        } else if (ev.t === 'trick') {
          const n = ['Primera', 'Segunda', 'Tercera'][ev.trick];
          log(ev.r === 'p' ? `${n}: parda` : `${n} para ${who(ev.r)}`);
          render(m);
          await sleep(700);
        } else if (ev.t === 'envido' || ev.t === 'flor') {
          log(`+${ev.points} de ${ev.t} para ${who(ev.winner)}`, 'pts');
          render(m);
          bump(ev.winner);
          await sleep(750);
        }
      }
    },

    handOver(h) {
      const m = S.match;
      if (h.points) log(`+${h.points} para ${who(h.winner)} por la mano`, 'pts');
      bump(h.winner);
      say(OPP, pickOne(h.winner === OPP ? S.persona.say.winHand : S.persona.say.loseHand), 1800);
      return new Promise((res) => {
        const reasons = {
          cards: (w) => (w === ME ? 'Ganaste con las cartas.' : `${oppName()} ganó con las cartas.`),
          noquiero: (w) => (w === ME ? `${oppName()} no quiso.` : 'No quisiste.'),
          mazo: (w) => (w === ME ? `${oppName()} se fue al mazo.` : 'Te fuiste al mazo.')
        };
        $('ov-title').textContent = h.winner === ME ? `¡Mano para vos! +${h.points}` : `Mano para ${oppName()} · +${h.points}`;
        const lines = [reasons[h.endReason](h.winner)];
        if (h.florResult) lines.push(`Flor: +${h.florResult.points} para ${who(h.florResult.winner)}.`);
        if (h.envResult) lines.push(`Envido: +${h.envResult.points} para ${who(h.envResult.winner)}.`);
        lines.push(`Envido de cada uno: vos ${h.envPoints[ME]}, ${oppName()} ${h.envPoints[OPP]}.`);
        $('ov-detail').innerHTML = lines.join('<br>');
        $('hand-overlay').classList.remove('hidden');
        render(m, true);
        const btn = $('btn-next');
        btn.focus();
        btn.onclick = () => { $('hand-overlay').classList.add('hidden'); res(); };
      });
    },

    async matchOver(winner) {
      const m = S.match;
      render(m, true);
      await sleep(900);
      if (m !== S.match) return;
      const won = winner === ME;
      const stats = store.get('truco.stats', {});
      const st = stats[S.persona.id] || { w: 0, l: 0 };
      if (won) st.w++; else st.l++;
      stats[S.persona.id] = st;
      store.set('truco.stats', stats);
      $('modal-avatar').textContent = won ? '🏆' : S.persona.avatar;
      $('modal-title').textContent = won ? '¡Ganaste el partido!' : `Ganó ${oppName()}`;
      $('modal-quote').textContent = '“' + pickOne(won ? S.persona.say.loseGame : S.persona.say.winGame) + '”';
      $('modal-score').textContent = `Vos ${m.scores[ME]} — ${m.scores[OPP]} ${oppName()}`;
      $('modal').classList.remove('hidden');
      $('btn-rematch').focus();
    }
  };

  function personaLine(ev) {
    const s = S.persona.say;
    let key = null;
    if (ev.call === 'truco') key = ev.to === 2 ? 'truco' : ev.to === 3 ? 'retruco' : 'vale4';
    else if (ev.call) key = ev.call;
    else if (ev.text === '¡Quiero!') key = 'quiero';
    else if (ev.text === 'No quiero.') key = 'noquiero';
    else if (ev.text === 'Me voy al mazo.') key = 'mazo';
    return key && s[key] ? pickOne(s[key]) : ev.text;
  }

  /* ---------- Entrada del jugador ---------- */
  function myLegal() {
    const m = S.match;
    return m && m.pending && m.pending.seat === ME && S.local.waiting ? m.pending.legal : null;
  }

  $('actions').addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]');
    if (!b || !myLegal()) return;
    const a = b.dataset.act;
    S.local.submit(a === 'envido' || a === 'real' || a === 'falta' ? { type: 'envido', kind: a } : { type: a });
  });
  $('my-hand').addEventListener('click', (e) => {
    const b = e.target.closest('.card');
    const legal = myLegal();
    if (!b || !legal || !legal.play) return;
    const card = S.match.hand.cards[ME].find((c) => c.id === b.dataset.id);
    if (card) S.local.submit({ type: 'play', card });
  });
  document.addEventListener('keydown', (e) => {
    const legal = myLegal();
    if (!legal || !legal.play) return;
    const i = ['1', '2', '3'].indexOf(e.key);
    const c = S.match.hand.cards[ME][i];
    if (c) S.local.submit({ type: 'play', card: c });
  });

  /* ---------- Dibujo ---------- */
  const bubbleTimers = {};
  function say(p, text, ms) {
    const el = $(p === ME ? 'me-bubble' : 'opp-bubble');
    el.textContent = text;
    el.classList.add('show');
    clearTimeout(bubbleTimers[p]);
    bubbleTimers[p] = setTimeout(() => el.classList.remove('show'), ms);
  }

  function log(text, cls) {
    const li = document.createElement('li');
    li.textContent = text;
    if (cls) li.className = cls;
    const ol = $('log');
    ol.prepend(li);
    while (ol.children.length > 80) ol.lastChild.remove();
  }

  function bump(p) {
    const el = document.querySelector(`.sb-col[data-p="${p}"]`);
    if (!el) return;
    el.classList.remove('bump');
    void el.offsetWidth;
    el.classList.add('bump');
  }

  // Abanico: cada carta un poco girada
  const fan = (i, n, deg) => {
    const k = i - (n - 1) / 2;
    return `--rot:${k * deg}deg;--lift:${Math.abs(k) * Math.abs(deg) * 0.9}px`;
  };

  // Fósforos: cuadraditos de 5 (cuatro lados y la diagonal); malas arriba, buenas abajo
  function matchesSVG(score, target) {
    const groups = target / 5, perRow = 3;
    const g = 30, gap = 10;
    const rows = Math.ceil(groups / perRow);
    const W = perRow * g + (perRow - 1) * gap, H = rows * g + (rows - 1) * (gap + 8);
    const sticks = [[0, 0, g, 0], [g, 0, g, g], [g, g, 0, g], [0, g, 0, 0], [0, 0, g, g]];
    let out = `<svg viewBox="-6 -6 ${W + 12} ${H + 12}" aria-label="${score} puntos">`;
    let left = score;
    for (let i = 0; i < groups; i++) {
      const x = (i % perRow) * (g + gap), y = Math.floor(i / perRow) * (g + gap + 8);
      for (let k = 0; k < 5; k++) {
        const [x1, y1, x2, y2] = sticks[k];
        const on = left > 0;
        if (on) left--;
        out += `<line x1="${x + x1}" y1="${y + y1}" x2="${x + x2}" y2="${y + y2}" stroke="${on ? '#f3e2bd' : 'rgba(255,255,255,.08)'}" stroke-width="3.4" stroke-linecap="round"/>`;
        if (on) out += `<circle cx="${x + x2}" cy="${y + y2}" r="3.6" fill="#d2452f"/>`;
      }
    }
    if (rows > 1) out += `<line x1="-4" y1="${g + gap / 2 + 4}" x2="${W + 4}" y2="${g + gap / 2 + 4}" stroke="rgba(255,255,255,.35)" stroke-dasharray="3 4"/>`;
    return out + '</svg>';
  }

  function statusText(h, legal) {
    const p = oppName();
    if (h.over) return '';
    if (!legal) return `${p} está pensando…`;
    if (legal.flor) return '¡Tenés flor! Cantala.';
    if (legal.kind === 'flor') {
      const st = h.florPending.stage;
      return st === 'flor' ? `${p} cantó flor y vos también tenés. ¿Qué hacés?` : `${p} cantó ${E.FLOR_NAMES[st].toLowerCase()}. ¿Querés?`;
    }
    if (legal.kind === 'envido') return `${p} cantó ${E.ENV_NAMES[h.envCalls[h.envCalls.length - 1]].toLowerCase()}. ¿Querés?`;
    if (legal.kind === 'truco') return `${p} cantó ${E.TRUCO_NAMES[h.trucoPending.to].toLowerCase()}. ¿Querés?`;
    return 'Te toca: tirá una carta o cantá.';
  }

  function render(m, reveal) {
    const h = m.hand;
    const p = S.persona;
    if (!h) return;
    const legal = myLegal();

    $('top-score').innerHTML = `<span>Vos <b>${m.scores[ME]}</b></span><span class="sep">·</span><span><b>${m.scores[OPP]}</b> ${p.name}</span>`;

    // Mano del rival
    const showOpp = reveal || h.over;
    const n = h.cards[OPP].length;
    $('opp-hand').innerHTML = h.cards[OPP].map((c, i) => `<div class="card" style="${fan(i, n, -7)}">${showOpp ? cardSVG(c) : backSVG()}</div>`).join('');

    // Bazas
    let tricks = '';
    for (let i = 0; i < 3; i++) {
      const r = h.results[i];
      const cls = (pl) => (r === undefined ? '' : r === 'p' ? 'parda' : r === pl ? 'win' : 'lose');
      const slot = (pl) => {
        const c = h.played[pl][i];
        return `<div class="slot ${pl === ME ? 'mine' : 'theirs'} ${cls(pl)}">${c ? `<div class="card${c.id === S.fresh ? ' fresh' : ''}">${cardSVG(c)}</div>` : ''}</div>`;
      };
      const current = r === undefined && i === h.trick && !h.over;
      const res = r === undefined ? '' : r === 'p' ? 'parda' : r === ME ? 'tuya' : 'de ' + p.name.split(' ').pop();
      const state = current ? 'current' : r === undefined ? '' : r === 'p' ? 'r-parda' : r === ME ? 'r-me' : 'r-opp';
      tricks += `<div class="trick ${state}"><div class="trick-label">${['Primera', 'Segunda', 'Tercera'][i]}</div><div class="pair">${slot(OPP)}${slot(ME)}</div><div class="trick-res">${res}</div></div>`;
    }
    $('tricks').innerHTML = tricks;
    const fresh = S.fresh;
    if (fresh) setTimeout(() => { if (S.fresh === fresh) S.fresh = null; }, 350);

    // Estado
    const st = $('status');
    st.textContent = statusText(h, legal);
    st.classList.toggle('mine', !!legal);
    st.classList.toggle('empty', !st.textContent);

    // Mi mano
    const mh = $('my-hand');
    const canPlay = !!(legal && legal.play);
    mh.classList.toggle('waiting', !legal);
    const mn = h.cards[ME].length;
    mh.innerHTML = h.cards[ME].map((c, i) =>
      `<button type="button" class="card ${canPlay ? 'playable' : ''}" data-id="${c.id}" aria-label="${cardName(c)}" style="${fan(i, mn, 6)}" ${canPlay ? '' : 'tabindex="-1"'}>${cardSVG(c)}</button>`).join('');

    // Botones
    document.querySelectorAll('#actions [data-act]').forEach((b) => {
      const a = b.dataset.act;
      const show = !!(legal && (a === 'truco' ? legal.truco : legal[a]));
      b.classList.toggle('hidden', !show);
      if (a === 'truco' && show) {
        const name = E.TRUCO_NAMES[legal.truco];
        b.textContent = legal.kind === 'truco' ? 'Quiero ' + name.toLowerCase() : name;
      }
    });
    $('actions').classList.toggle('idle', !legal);

    // Datos de la mano
    const chips = [
      ['Es mano', h.mano === ME ? 'vos' : p.name],
      ['La mano vale', h.trucoLevel + (h.trucoLevel > 1 ? ' · ' + E.TRUCO_NAMES[h.trucoLevel] : '')],
      [h.hasFlor[ME] ? 'Tu flor' : 'Tu envido', h.hasFlor[ME] ? h.florPts[ME] : h.envPoints[ME]]
    ];
    if (h.florResult) chips.push(['Flor', `+${h.florResult.points} ${who(h.florResult.winner)}`]);
    if (h.envResult) chips.push(['Envido', `+${h.envResult.points} ${who(h.envResult.winner)}`]);
    $('chips').innerHTML = chips.map(([k, v]) => `<div class="chip"><span>${k}</span><b>${v}</b></div>`).join('');

    // Tanteador
    const col = (pl, name) => `<div class="sb-col" data-p="${pl}">
      <div class="sb-name">${name}</div>
      <div class="sb-num">${m.scores[pl]}</div>
      <div class="sb-sub">${m.scores[pl] < m.target / 2 ? 'en las malas' : 'en las buenas'}</div>
      ${matchesSVG(m.scores[pl], m.target)}</div>`;
    $('scoreboard').innerHTML = `<div class="board-title">Tanteador · a ${m.target}</div><div class="board-cols">${col(ME, 'Vos')}${col(OPP, p.name)}</div>`;
  }

  /* ---------- PWA: instalación y modo sin conexión ---------- */
  let installEvt = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    installEvt = e;
    $('btn-install').classList.remove('hidden');
  });
  $('btn-install').addEventListener('click', async () => {
    if (!installEvt) return;
    installEvt.prompt();
    await installEvt.userChoice;
    installEvt = null;
    $('btn-install').classList.add('hidden');
  });
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }

  renderMenu();
})();
