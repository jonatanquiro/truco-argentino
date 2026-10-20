/* Interfaz y desarrollo del partido */
(function () {
  const { cardSVG, backSVG, cardName } = window.Cards;
  const E = window.Engine;
  const $ = (id) => document.getElementById(id);

  /* ---------- Guardado local (puede fallar en modo privado) ---------- */
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sin guardado */ } }
  };

  const S = {
    persona: null,
    target: store.get('truco.target', 30),
    scores: [0, 0],
    mano: 0,
    hand: null,
    memory: null,
    token: 0,
    humanResolve: null,
    legal: null
  };

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const pickOne = (arr) => arr[Math.floor(Math.random() * arr.length)];

  /* ---------- Menú ---------- */
  function renderMenu() {
    const stats = store.get('truco.stats', {});
    $('personas').innerHTML = window.PERSONAS.map((p) => {
      const st = stats[p.id] || { w: 0, l: 0 };
      const stars = '★'.repeat(p.level) + '<span class="off">' + '★'.repeat(5 - p.level) + '</span>';
      return `<button class="persona" type="button" data-id="${p.id}" style="--accent:${p.color}">
        <div class="persona-head">
          <div class="persona-avatar">${p.avatar}</div>
          <div>
            <div class="persona-name">${p.name}${st.w ? '<span class="badge">🏆 ' + st.w + '</span>' : ''}</div>
            <div class="persona-level"><span class="stars">${stars}</span> · Nivel ${p.level} · ${p.levelName}</div>
          </div>
        </div>
        <p class="persona-desc">${p.desc}</p>
        <div class="persona-foot"><span>Ganaste ${st.w} · Perdiste ${st.l}</span><span class="play">Jugar</span></div>
      </button>`;
    }).join('');
    document.querySelectorAll('.seg button').forEach((b) => b.setAttribute('aria-checked', String(+b.dataset.target === S.target)));
  }

  $('personas').addEventListener('click', (e) => {
    const b = e.target.closest('.persona');
    if (b) startMatch(window.PERSONAS.find((p) => p.id === b.dataset.id));
  });
  document.querySelectorAll('.seg button').forEach((b) => b.addEventListener('click', () => {
    S.target = +b.dataset.target;
    store.set('truco.target', S.target);
    renderMenu();
  }));

  function showScreen(id) {
    $('menu').classList.toggle('hidden', id !== 'menu');
    $('game').classList.toggle('hidden', id !== 'game');
    window.scrollTo(0, 0);
  }

  $('btn-back').addEventListener('click', () => {
    if (S.hand && !S.hand.over && (S.scores[0] || S.scores[1]) && !confirm('¿Abandonar el partido?')) return;
    S.token++;
    $('modal').classList.add('hidden');
    renderMenu();
    showScreen('menu');
  });
  $('btn-menu').addEventListener('click', () => { S.token++; $('modal').classList.add('hidden'); renderMenu(); showScreen('menu'); });
  $('btn-rematch').addEventListener('click', () => { $('modal').classList.add('hidden'); startMatch(S.persona); });

  /* ---------- Partido ---------- */
  function startMatch(persona) {
    S.token++;
    S.persona = persona;
    S.scores = [0, 0];
    S.mano = Math.random() < 0.5 ? 0 : 1;
    S.memory = window.AI.newMemory();
    $('log').innerHTML = '';
    $('opp-avatar').textContent = persona.avatar;
    $('opp-avatar').style.setProperty('--accent', persona.color);
    $('opp-name').textContent = persona.name;
    $('opp-level').textContent = 'Nivel ' + persona.level + ' · ' + persona.levelName;
    showScreen('game');
    log(`Partido a ${S.target} contra ${persona.name}.`, 'sep');
    runMatch(S.token, persona);
  }

  async function runMatch(token, persona) {
    say(1, pickOne(persona.say.greet), 2200);
    while (token === S.token) {
      S.hand = E.newHand(S.mano);
      log(`— Mano nueva · es mano ${S.mano === 0 ? 'vos' : persona.name} —`, 'sep');
      render();
      await sleep(400);
      const ok = await playHand(token);
      if (!ok) return;
      const h = S.hand;
      if (h.endReason !== 'game') S.scores[h.winner] = Math.min(S.target, S.scores[h.winner] + h.points);
      window.AI.learn(S.memory, h);
      if (h.points) log(`+${h.points} para ${h.winner === 0 ? 'vos' : persona.name} por la mano`, 'pts');
      bump(h.winner);
      render();
      const over = S.scores[0] >= S.target || S.scores[1] >= S.target;
      if (over) { await sleep(900); endMatch(); return; }
      if (h.endReason !== 'game') say(1, pickOne(h.winner === 1 ? persona.say.winHand : persona.say.loseHand), 1800);
      await showHandSummary(h);
      if (token !== S.token) return;
      S.mano = 1 - S.mano;
    }
  }

  async function playHand(token) {
    const h = S.hand;
    while (!h.over) {
      const actor = E.actorOf(h);
      const legal = E.legalActions(h, actor);
      let act;
      if (actor === 0) {
        S.legal = legal;
        render();
        act = await new Promise((res) => { S.humanResolve = res; });
        S.humanResolve = null;
        S.legal = null;
      } else {
        S.legal = null;
        render();
        await sleep(legal.kind === 'turn' ? 750 : 950);
        if (token !== S.token) return false;
        act = window.AI.decide(h, 1, legal, { persona: S.persona, scores: S.scores, target: S.target, memory: S.memory });
      }
      if (token !== S.token) return false;
      const events = E.apply(h, actor, act, S.scores, S.target);
      await showEvents(events, token);
      if (token !== S.token) return false;
    }
    return true;
  }

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

  async function showEvents(events, token) {
    for (const ev of events) {
      if (token !== S.token) return;
      const who = (p) => (p === 0 ? 'Vos' : S.persona.name);
      if (ev.t === 'say') {
        const text = ev.p === 1 ? personaLine(ev) : ev.text;
        say(ev.p, text, 1500);
        log(`${who(ev.p)}: ${ev.p === 1 && text !== ev.text ? ev.text + ' — “' + text + '”' : ev.text}`);
        render();
        await sleep(ev.p === 1 ? 900 : 500);
      } else if (ev.t === 'play') {
        S.fresh = ev.card.id;
        log(ev.p === 0 ? `Tirás el ${cardName(ev.card)}` : `${S.persona.name} tira el ${cardName(ev.card)}`);
        render();
        await sleep(ev.p === 1 ? 350 : 150);
      } else if (ev.t === 'trick') {
        const n = ['Primera', 'Segunda', 'Tercera'][ev.trick];
        log(ev.r === 'p' ? `${n}: parda` : `${n} para ${ev.r === 0 ? 'vos' : S.persona.name}`);
        render();
        await sleep(650);
      } else if (ev.t === 'envido') {
        log(`+${ev.points} de envido para ${ev.winner === 0 ? 'vos' : S.persona.name}`, 'pts');
        bump(ev.winner);
        render();
        await sleep(700);
      }
    }
  }

  function showHandSummary(h) {
    return new Promise((res) => {
      const reasons = {
        cards: (w) => (w === 0 ? 'Ganaste la mano con las cartas.' : `${S.persona.name} ganó con las cartas.`),
        noquiero: (w) => (w === 0 ? `${S.persona.name} no quiso.` : 'No quisiste.'),
        mazo: (w) => (w === 0 ? `${S.persona.name} se fue al mazo.` : 'Te fuiste al mazo.')
      };
      $('ov-title').textContent = h.winner === 0 ? `¡Mano para vos! +${h.points}` : `Mano para ${S.persona.name} · +${h.points}`;
      let detail = reasons[h.endReason](h.winner);
      if (h.envResult) detail += `<br>Envido: +${h.envResult.points} para ${h.envResult.winner === 0 ? 'vos' : S.persona.name}.`;
      detail += `<br>Tus puntos de envido eran ${h.envPoints[0]}; los de ${S.persona.name}, ${h.envPoints[1]}.`;
      $('ov-detail').innerHTML = detail;
      $('hand-overlay').classList.remove('hidden');
      render(true);
      const btn = $('btn-next');
      btn.focus();
      btn.onclick = () => { $('hand-overlay').classList.add('hidden'); res(); };
    });
  }

  function endMatch() {
    const won = S.scores[0] >= S.target;
    const stats = store.get('truco.stats', {});
    const st = stats[S.persona.id] || { w: 0, l: 0 };
    if (won) st.w++; else st.l++;
    stats[S.persona.id] = st;
    store.set('truco.stats', stats);
    $('modal-avatar').textContent = won ? '🏆' : S.persona.avatar;
    $('modal-title').textContent = won ? '¡Ganaste el partido!' : `Ganó ${S.persona.name}`;
    $('modal-quote').textContent = '“' + pickOne(won ? S.persona.say.loseGame : S.persona.say.winGame) + '”';
    $('modal-score').textContent = `Vos ${S.scores[0]} — ${S.scores[1]} ${S.persona.name}`;
    $('modal').classList.remove('hidden');
    $('btn-rematch').focus();
  }

  /* ---------- Entrada del jugador ---------- */
  $('actions').addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]');
    if (!b || b.disabled || !S.humanResolve) return;
    const a = b.dataset.act;
    if (a === 'envido' || a === 'real' || a === 'falta') S.humanResolve({ type: 'envido', kind: a });
    else S.humanResolve({ type: a });
  });
  $('my-hand').addEventListener('click', (e) => {
    const b = e.target.closest('.card');
    if (!b || !S.humanResolve || !S.legal || !S.legal.play) return;
    const card = S.hand.cards[0].find((c) => c.id === b.dataset.id);
    if (card) S.humanResolve({ type: 'play', card });
  });

  /* ---------- Dibujo ---------- */
  const bubbleTimers = {};
  function say(p, text, ms) {
    const el = $(p === 0 ? 'me-bubble' : 'opp-bubble');
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

  function cardEl(c, cls, extra) {
    return `<button type="button" class="card ${cls || ''}" data-id="${c.id}" aria-label="${cardName(c)}" ${extra || ''}>${cardSVG(c)}</button>`;
  }
  const backEl = () => `<div class="card">${backSVG()}</div>`;

  // Fósforos: cuadraditos de 5 (cuatro lados y la diagonal), con la raya de las buenas al medio
  function matchesSVG(score, target) {
    const groups = target / 5;
    const g = 34, gap = 8, half = groups / 2;
    const h = groups * (g + gap) + 14;
    const sticks = [[0, 0, g, 0], [g, 0, g, g], [g, g, 0, g], [0, g, 0, 0], [0, 0, g, g]];
    let out = `<svg viewBox="-6 -6 ${g + 12} ${h}" aria-label="${score} puntos">`;
    let left = score;
    for (let i = 0; i < groups; i++) {
      const y = i * (g + gap) + (i >= half ? 14 : 0);
      for (let k = 0; k < 5; k++) {
        const [x1, y1, x2, y2] = sticks[k];
        const on = left > 0;
        if (on) left--;
        out += `<line x1="${x1}" y1="${y + y1}" x2="${x2}" y2="${y + y2}" stroke="${on ? '#f1d9a6' : 'rgba(255,255,255,.1)'}" stroke-width="3.2" stroke-linecap="round"/>`;
        if (on) out += `<circle cx="${x2}" cy="${y + y2}" r="3.4" fill="#c23a2b"/>`;
      }
    }
    const dy = half * (g + gap) + 1;
    out += `<line x1="-4" y1="${dy}" x2="${g + 4}" y2="${dy}" stroke="rgba(255,255,255,.45)" stroke-dasharray="3 3"/>`;
    return out + '</svg>';
  }

  function render(reveal) {
    const h = S.hand;
    const p = S.persona;
    if (!h) return;
    const legal = S.legal;
    const fresh = S.fresh;
    if (fresh) setTimeout(() => { if (S.fresh === fresh) S.fresh = null; }, 320);
    const myTurn = !!legal;

    $('top-score').innerHTML = `Vos <b>${S.scores[0]}</b> · <b>${S.scores[1]}</b> ${p.name} <span style="opacity:.6">/ ${S.target}</span>`;

    // Mano del rival
    const oh = $('opp-hand');
    const showOpp = reveal || h.over;
    oh.classList.toggle('reveal', !!showOpp);
    oh.innerHTML = h.cards[1].map((c) => (showOpp ? `<div class="card">${cardSVG(c)}</div>` : backEl())).join('');

    // Bazas
    let tricks = '';
    for (let i = 0; i < 3; i++) {
      const r = h.results[i];
      const cls = (pl) => (r === undefined ? '' : r === 'p' ? 'parda' : r === pl ? 'win' : 'lose');
      const slot = (pl) => {
        const c = h.played[pl][i];
        return `<div class="slot ${cls(pl)}">${c ? `<div class="card${c.id === S.fresh ? ' fresh' : ''}">${cardSVG(c)}</div>` : ''}</div>`;
      };
      const res = r === undefined ? '' : r === 'p' ? 'parda' : r === 0 ? 'tuya' : 'de ' + p.name.split(' ').pop();
      tricks += `<div class="trick"><div class="trick-label">${['1ra', '2da', '3ra'][i]}</div>${slot(1)}${slot(0)}<div class="trick-res">${res}</div></div>`;
    }
    $('tricks').innerHTML = tricks;

    // Fichas de estado
    const chips = [`Mano: <b>${h.mano === 0 ? 'vos' : p.name}</b>`, `La mano vale <b>${h.trucoLevel}</b>`];
    if (h.trucoLevel > 1) chips.push(`<b>${E.TRUCO_NAMES[h.trucoLevel]}</b> querido`);
    if (h.envResult) chips.push(`Envido: <b>+${h.envResult.points}</b> ${h.envResult.winner === 0 ? 'vos' : p.name}`);
    chips.push(`Tu envido: <b>${h.envPoints[0]}</b>`);
    $('chips').innerHTML = chips.map((c) => `<span class="chip">${c}</span>`).join('');

    // Estado
    let status = '';
    if (h.over) status = '';
    else if (myTurn && legal.kind === 'envido') status = `${p.name} cantó ${E.ENV_NAMES[h.envCalls[h.envCalls.length - 1]].toLowerCase()}. ¿Querés?`;
    else if (myTurn && legal.kind === 'truco') status = `${p.name} cantó ${E.TRUCO_NAMES[h.trucoPending.to].toLowerCase()}. ¿Querés?`;
    else if (myTurn) status = 'Te toca. Tirá una carta o cantá.';
    else status = `${p.name} está pensando…`;
    $('status').textContent = status;

    // Mi mano
    const mh = $('my-hand');
    mh.classList.toggle('waiting', !myTurn);
    mh.innerHTML = h.cards[0].map((c) => cardEl(c, myTurn && legal.play ? 'playable' : '', myTurn && legal.play ? '' : 'tabindex="-1"')).join('');

    // Botones
    const btns = document.querySelectorAll('#actions [data-act]');
    btns.forEach((b) => {
      const a = b.dataset.act;
      let show = false;
      if (myTurn) {
        if (a === 'truco') show = !!legal.truco;
        else show = !!legal[a];
      }
      b.classList.toggle('hidden', !show);
      if (a === 'truco' && show) {
        const name = E.TRUCO_NAMES[legal.truco];
        b.textContent = legal.kind === 'truco' ? 'Quiero ' + name.toLowerCase() : name;
      }
    });

    // Tanteador
    const col = (pl, name) => `<div class="sb-col" data-p="${pl}">
      <div class="sb-name">${name}</div>
      <div class="sb-num">${S.scores[pl]}</div>
      <div class="sb-sub">${S.scores[pl] < S.target / 2 ? 'en las malas' : 'en las buenas'}</div>
      ${matchesSVG(S.scores[pl], S.target)}</div>`;
    $('scoreboard').innerHTML = col(0, 'Vos') + col(1, p.name);
  }

  /* ---------- Teclado: 1-3 tiran carta ---------- */
  document.addEventListener('keydown', (e) => {
    if (!S.humanResolve || !S.legal || !S.legal.play) return;
    const i = ['1', '2', '3'].indexOf(e.key);
    if (i >= 0 && S.hand.cards[0][i]) S.humanResolve({ type: 'play', card: S.hand.cards[0][i] });
  });

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
