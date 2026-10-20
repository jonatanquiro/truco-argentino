/* Pantallas, mesa y entrada del jugador. El partido en sí está en match.js. */
(function () {
  const { cardSVG, backSVG, cardName } = window.Cards;
  const E = window.Engine;
  const $ = (id) => document.getElementById(id);
  const ME = 0, OPP = 1; // asiento de este dispositivo y del rival
  const PERSONAS = window.PERSONAS;

  /* ---------- Guardado local (puede fallar en modo privado) ---------- */
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sin guardado */ } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* nada */ } }
  };

  const FELTS = [
    ['verde', 'Verde clásico', '#1f5c3c'], ['azul', 'Azul noche', '#1d3e66'], ['bordo', 'Bordó', '#5f1d2a'],
    ['petroleo', 'Petróleo', '#145a5e'], ['grafito', 'Grafito', '#2b2f33'], ['marron', 'Tabaco', '#5b3a22']
  ];
  const BACKS = [['rojo', 'Rojo', '#a8362c'], ['azul', 'Azul', '#2d5aa0'], ['verde', 'Verde', '#2f7a46'], ['negro', 'Negro', '#33302c']];

  const DEFAULTS = { target: 30, flor: true, felt: 'verde', back: 'rojo', skin: 'clasica', speed: 1, showEnv: true, summary: false };
  const settings = Object.assign({}, DEFAULTS, store.get('truco.settings', {}));
  // compatibilidad con la versión anterior
  if (store.get('truco.target', null)) settings.target = store.get('truco.target', 30);
  window.TrucoSettings = settings;

  const S = {
    persona: null,
    mode: 'free',     // 'career' | 'free' | 'quick'
    match: null,
    local: null,      // asiento LocalSeat de este dispositivo
    fresh: null,
    tier: 'all'
  };

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms * settings.speed));
  const pickOne = (arr) => arr[Math.floor(Math.random() * arr.length)];
  // Quién es quién en la mesa (asiento → personaje; el 0 sos vos)
  const isTeamGame = () => !!(S.match && S.match.seats.length > 2);
  const personaOf = (seat) => (S.match && S.match.personas ? S.match.personas[seat] : S.persona);
  const nameOf = (seat) => (seat === ME ? 'Vos' : personaOf(seat).name);
  const oppName = () => S.persona.name;
  // equipo → cómo nombrarlo
  const who = (t) => (isTeamGame() ? (t === 0 ? 'tu equipo' : 'los rivales') : t === ME ? 'vos' : oppName());
  const career = () => Math.min(PERSONAS.length, store.get('truco.career', 0)); // cuántos rivales ya venciste en orden

  function saveSettings() {
    store.set('truco.settings', settings);
    store.del('truco.target');
    applyTheme();
  }
  function applyTheme() {
    document.body.dataset.felt = settings.felt;
    document.body.dataset.back = settings.back;
  }

  /* ---------- Navegación (con el botón "atrás" del celular) ---------- */
  const SCREENS = ['home', 'play', 'career', 'free', 'teams', 'options', 'rules', 'game'];
  let current = 'home';
  const backStack = [];

  function show(id) {
    current = id;
    SCREENS.forEach((s) => $(s).classList.toggle('hidden', s !== id));
    document.body.classList.toggle('in-game', id === 'game');
    if (id === 'home') renderHome();
    if (id === 'play') renderPlay();
    if (id === 'career') renderCareer();
    if (id === 'free') renderFree();
    if (id === 'teams') renderTeams();
    if (id === 'options') renderOptions();
    window.scrollTo(0, 0);
  }
  function go(id) {
    backStack.push(current);
    history.pushState({ screen: id }, '');
    show(id);
  }
  function back() {
    if (backStack.length) history.back();
    else show('home');
  }
  window.addEventListener('popstate', () => {
    if (current === 'game' && !leaveGame()) { history.pushState({ screen: 'game' }, ''); return; }
    show(backStack.pop() || 'home');
  });
  history.replaceState({ screen: 'home' }, '');

  document.addEventListener('click', (e) => {
    const g = e.target.closest('[data-go]');
    if (g) { go(g.dataset.go); return; }
    if (e.target.closest('[data-return]')) back();
  });

  /* ---------- Inicio y modos ---------- */
  function renderHome() {
    const c = career();
    $('home-progress').textContent = c >= PERSONAS.length ? 'Carrera completa 🏆' : `Carrera: ${c} de ${PERSONAS.length}`;
  }
  function renderPlay() {
    const c = career();
    $('career-meta').textContent = c >= PERSONAS.length ? '¡Completaste la carrera!' : `Próximo rival: ${PERSONAS[c].name} · ${c} de ${PERSONAS.length}`;
  }

  document.querySelector('[data-quick]').addEventListener('click', () => {
    // un rival al azar cerca de tu progreso
    const c = career();
    const lo = Math.max(0, c - 2), hi = Math.min(PERSONAS.length - 1, c + 1);
    const p = PERSONAS[lo + Math.floor(Math.random() * (hi - lo + 1))];
    startMatch(p, 'quick');
  });

  /* ---------- Carrera ---------- */
  function renderCareer() {
    const c = career();
    const stats = store.get('truco.stats', {});
    $('career-count').textContent = `${c} / ${PERSONAS.length}`;
    $('career-fill').style.width = (100 * c / PERSONAS.length) + '%';
    let lastProv = '';
    $('ladder').innerHTML = PERSONAS.map((p, i) => {
      const state = i < c ? 'done' : i === c ? 'next' : 'locked';
      const st = stats[p.id] || { w: 0, l: 0 };
      const tierHead = p.province !== lastProv ? `<li class="tier-head"><span>${(lastProv = p.province)}</span><em>${p.region} · ${p.levelName}</em></li>` : '';
      const right = state === 'done' ? `<span class="rung-state">✓ Vencido</span><button class="btn small ghost" data-play="${p.id}" type="button">Revancha</button>`
        : state === 'next' ? `<button class="btn small primary" data-play="${p.id}" type="button">Jugar</button>`
        : '<span class="rung-state">🔒</span>';
      return `${tierHead}<li class="rung ${state}" style="--accent:${p.color}">
        <span class="rung-num">${p.level}</span>
        <span class="rung-avatar">${state === 'locked' ? '?' : p.avatar}</span>
        <span class="rung-info"><span class="rung-name">${state === 'locked' ? '???' : p.name}${p.champion && state !== 'locked' ? ' <span class="crown" title="Campeón de la provincia">👑</span>' : ''}</span>
          <span class="rung-desc">${state === 'locked' ? 'Ganale al anterior para conocerlo.' : (st.w || st.l ? `Ganaste ${st.w} · Perdiste ${st.l}` : p.desc)}</span></span>
        <span class="rung-right">${right}</span>
      </li>`;
    }).join('');
    const next = document.querySelector('.rung.next');
    if (next) next.scrollIntoView({ block: 'center' });
  }
  $('ladder').addEventListener('click', (e) => {
    const b = e.target.closest('[data-play]');
    if (b) startMatch(PERSONAS.find((p) => p.id === b.dataset.play), 'career');
  });

  /* ---------- Partida libre ---------- */
  function renderFree() {
    const tiers = ['all', 'champions'].concat(window.REGIONS);
    const label = (t) => (t === 'all' ? 'Todos' : t === 'champions' ? '👑 Campeones' : t);
    $('tier-filter').innerHTML = tiers.map((t) => `<button type="button" role="tab" data-tier="${t}" aria-selected="${t === S.tier}">${label(t)}</button>`).join('');
    const stats = store.get('truco.stats', {});
    const show = (p) => S.tier === 'all' || (S.tier === 'champions' ? p.champion : p.region === S.tier);
    $('personas').innerHTML = PERSONAS.filter(show).map((p) => {
      const st = stats[p.id] || { w: 0, l: 0 };
      const pips = `<i style="width:${Math.round(100 * p.level / PERSONAS.length)}%"></i>`;
      return `<button class="persona" type="button" data-id="${p.id}" style="--accent:${p.color}">
        <div class="persona-head">
          <div class="persona-avatar">${p.avatar}</div>
          <div class="persona-titles">
            <div class="persona-name">${p.name}${st.w ? '<span class="badge">🏆 ' + st.w + '</span>' : ''}</div>
            <div class="persona-level">Nivel ${p.level} · ${p.levelName} · ${p.province}</div>
            <div class="diff" aria-hidden="true">${pips}</div>
          </div>
        </div>
        <p class="persona-desc">${p.desc}</p>
        <div class="persona-foot"><span>Ganaste ${st.w} · Perdiste ${st.l}</span><span class="play">Jugar</span></div>
      </button>`;
    }).join('');
  }
  $('tier-filter').addEventListener('click', (e) => {
    const b = e.target.closest('[data-tier]');
    if (b) { S.tier = b.dataset.tier; renderFree(); }
  });
  $('personas').addEventListener('click', (e) => {
    const b = e.target.closest('.persona');
    if (b) startMatch(PERSONAS.find((p) => p.id === b.dataset.id), 'free');
  });

  /* ---------- Por equipos: armado ---------- */
  const T = store.get('truco.teamSetup', { size: 2, mates: [], rivals: [] });
  const byId = (id) => PERSONAS.find((p) => p.id === id);
  function randomAround(count, exclude) {
    // personajes cerca de tu progreso en la carrera
    const c = career();
    const lo = Math.max(0, c - 6), hi = Math.min(PERSONAS.length - 1, c + 6);
    const pool = PERSONAS.slice(lo, hi + 1).filter((p) => !exclude.includes(p.id));
    const out = [];
    while (out.length < count && pool.length) out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0].id);
    return out;
  }
  function fixTeams() {
    const want = T.size - 1;
    T.mates = T.mates.filter(byId).slice(0, want);
    T.rivals = T.rivals.filter(byId).slice(0, T.size);
    if (T.mates.length < want) T.mates = T.mates.concat(randomAround(want - T.mates.length, T.mates.concat(T.rivals)));
    if (T.rivals.length < T.size) T.rivals = T.rivals.concat(randomAround(T.size - T.rivals.length, T.mates.concat(T.rivals)));
    store.set('truco.teamSetup', T);
  }
  function personaSelect(kind, i, id) {
    let html = `<select class="pick" data-kind="${kind}" data-i="${i}" aria-label="${kind === 'mates' ? 'Compañero' : 'Rival'} ${i + 1}">`;
    let prov = '';
    for (const p of PERSONAS) {
      if (p.province !== prov) { html += (prov ? '</optgroup>' : '') + `<optgroup label="${p.province}">`; prov = p.province; }
      html += `<option value="${p.id}" ${p.id === id ? 'selected' : ''}>${p.avatar} ${p.name} · nivel ${p.level}</option>`;
    }
    return html + '</optgroup></select>';
  }
  function slot(kind, i, id) {
    const p = byId(id);
    return `<div class="team-slot" style="--accent:${p.color}"><span class="slot-avatar">${p.avatar}</span>${personaSelect(kind, i, id)}</div>`;
  }
  function renderTeams() {
    fixTeams();
    document.querySelectorAll('[data-size]').forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.size === T.size)));
    $('team-us').innerHTML = `<div class="team-slot me"><span class="slot-avatar">🙂</span><span class="slot-name">Vos</span></div>` + T.mates.map((id, i) => slot('mates', i, id)).join('');
    $('team-them').innerHTML = T.rivals.map((id, i) => slot('rivals', i, id)).join('');
    const lvl = (ids) => Math.round(ids.reduce((a, id) => a + byId(id).level, 0) / ids.length);
    $('team-meta').textContent = `Nivel promedio de los rivales: ${lvl(T.rivals)}`;
  }
  $('teams').addEventListener('change', (e) => {
    const sel = e.target.closest('.pick');
    if (!sel) return;
    T[sel.dataset.kind][+sel.dataset.i] = sel.value;
    store.set('truco.teamSetup', T);
    renderTeams();
  });
  $('teams').addEventListener('click', (e) => {
    const b = e.target.closest('[data-size]');
    if (b) { T.size = +b.dataset.size; renderTeams(); return; }
    if (e.target.closest('#btn-shuffle')) { T.mates = []; T.rivals = []; renderTeams(); return; }
    if (e.target.closest('#btn-team-play')) startTeamMatch(T.mates.map(byId), T.rivals.map(byId));
  });

  /* ---------- Opciones ---------- */
  function renderOptions() {
    const sw = (list, key) => list.map(([id, name, color]) =>
      `<button type="button" class="swatch" data-key="${key}" data-v="${id}" aria-pressed="${settings[key] === id}" title="${name}" style="--c:${color}"><span></span><em>${name}</em></button>`).join('');
    $('felt-swatches').innerHTML = sw(FELTS, 'felt');
    $('back-swatches').innerHTML = sw(BACKS, 'back');
    const keep = settings.skin;
    $('skin-swatches').innerHTML = Object.entries(window.Cards.SKINS).map(([id, k]) => {
      settings.skin = id;
      const face = cardSVG({ v: 7, s: 'oro', id: '7-oro' });
      return `<button type="button" class="skin" data-key="skin" data-v="${id}" aria-pressed="${keep === id}"><span class="skin-card">${face}</span><em>${k.name}</em></button>`;
    }).join('');
    settings.skin = keep;
    document.querySelectorAll('.seg[data-opt]').forEach((seg) => {
      const k = seg.dataset.opt;
      seg.querySelectorAll('button').forEach((b) => {
        const v = settings[k];
        const on = typeof v === 'boolean' ? (b.dataset.v === '1') === v : String(v) === b.dataset.v;
        b.setAttribute('aria-pressed', String(on));
      });
    });
    document.querySelector('.mini-card.face').innerHTML = cardSVG({ v: 1, s: 'espada', id: '1-espada' });
    document.querySelectorAll('.mini-card.back').forEach((el) => { el.innerHTML = backSVG(); });
  }
  $('options').addEventListener('click', (e) => {
    const s = e.target.closest('.swatch, .skin');
    if (s) { settings[s.dataset.key] = s.dataset.v; saveSettings(); renderOptions(); return; }
    const b = e.target.closest('.seg[data-opt] button');
    if (b) {
      const k = b.closest('.seg').dataset.opt;
      settings[k] = typeof DEFAULTS[k] === 'boolean' ? b.dataset.v === '1' : +b.dataset.v;
      saveSettings();
      renderOptions();
    }
  });
  $('btn-reset').addEventListener('click', () => {
    if (!confirm('¿Borrar el progreso de la carrera y las estadísticas?')) return;
    store.del('truco.career');
    store.del('truco.stats');
    renderOptions();
  });

  /* ---------- Salir de la mesa ---------- */
  function stopMatch() {
    if (S.match) S.match.stop();
    S.match = null;
    $('modal').classList.add('hidden');
    $('hand-overlay').classList.add('hidden');
  }
  // true si se puede salir
  function leaveGame() {
    const m = S.match;
    if (m && m.winner === null && (m.scores[0] || m.scores[1]) && !confirm('¿Abandonar el partido?')) return false;
    stopMatch();
    return true;
  }
  $('btn-back').addEventListener('click', () => back());
  $('btn-menu').addEventListener('click', () => back());
  $('btn-rematch').addEventListener('click', () => (S.mode === 'team' ? startTeamMatch(S.team.mates, S.team.rivals, true) : startMatch(S.persona, S.mode, true)));
  $('btn-next-rival').addEventListener('click', () => startMatch(PERSONAS[career()], 'career', true));

  /* ---------- Partido ---------- */
  function startMatch(persona, mode, replace) {
    stopMatch();
    S.persona = persona;
    S.mode = mode;
    S.local = new window.Seats.LocalSeat();
    const seats = [S.local, new window.Seats.AISeat(persona, () => settings.speed)];
    const target = mode === 'quick' ? 15 : settings.target;
    const m = new window.Match({ seats, target, flor: settings.flor, view });
    m.personas = [null, persona];
    S.match = m;
    setTableMode(2);
    $('log').innerHTML = '';
    $('opp-avatar').textContent = persona.avatar;
    document.querySelector('.table').style.setProperty('--accent', persona.color);
    $('opp-name').textContent = persona.name;
    $('opp-level').textContent = 'Nivel ' + persona.level + ' · ' + persona.levelName;
    if (current !== 'game') go('game');
    else if (!replace) show('game');
    log(`${mode === 'career' ? 'Carrera · ' : ''}Partido a ${target}${settings.flor ? ', con flor' : ', sin flor'}, contra ${persona.name}.`, 'sep');
    say(OPP, pickOne(persona.say.greet), 2400);
    m.run();
  }

  // 2 contra 2 o 3 contra 3: los asientos alternan equipos (pares: el tuyo, impares: los rivales)
  const POS = { 4: [null, 'right', 'top', 'left'], 6: [null, 'br', 'tr', 'top', 'tl', 'bl'] };
  function startTeamMatch(mates, rivals, replace) {
    stopMatch();
    S.mode = 'team';
    S.team = { mates, rivals };
    S.persona = rivals[0];
    S.local = new window.Seats.LocalSeat();
    const n = (mates.length + 1) * 2;
    const personas = [null];
    for (let q = 1; q < n; q++) personas.push(q % 2 ? rivals[(q - 1) / 2] : mates[q / 2 - 1]);
    const seats = personas.map((p, q) => (q === 0 ? S.local : new window.Seats.AISeat(p, () => settings.speed)));
    const m = new window.Match({ seats, target: settings.target, flor: settings.flor, view });
    m.personas = personas;
    S.match = m;
    setTableMode(n);
    $('ring').innerHTML = personas.map((p, q) => (q === 0 ? '' : `
      <div class="seat pos-${POS[n][q]} ${q % 2 ? 'them' : 'us'}" data-seat="${q}" style="--accent:${p.color}">
        <div class="seat-id"><span class="seat-avatar">${p.avatar}</span><span class="seat-text"><b>${p.name}</b><em>${q % 2 ? 'Rival' : 'Compañero'} · nivel ${p.level}</em></span></div>
        <div class="seat-cards" id="seat-cards-${q}"></div>
        <div class="bubble seat-bubble" id="seat-bubble-${q}"></div>
      </div>`)).join('');
    if (current !== 'game') go('game');
    else if (!replace) show('game');
    $('log').innerHTML = '';
    log(`Partido ${n / 2} contra ${n / 2} a ${settings.target}${settings.flor ? ', con flor' : ', sin flor'}. Tu equipo: vos, ${mates.map((x) => x.name).join(' y ')}.`, 'sep');
    say(1, pickOne(rivals[0].say.greet), 2400);
    m.run();
  }

  function setTableMode(n) {
    const team = n > 2;
    const t = document.querySelector('.table');
    t.classList.toggle('team-mode', team);
    t.classList.toggle('six', n === 6);
    $('ring').classList.toggle('hidden', !team);
    $('team-center').classList.toggle('hidden', !team);
    document.querySelector('.opp-zone').classList.toggle('hidden', team);
    $('tricks').classList.toggle('hidden', team);
    if (team) t.style.setProperty('--accent', 'var(--gold)');
  }

  const live = (m) => m === S.match && !m.stopped;

  const view = {
    render(m) { if (live(m)) render(m); },

    async showEvents(events) {
      const m = S.match;
      for (const ev of events) {
        if (!live(m)) return;
        if (ev.t === 'say') {
          const text = ev.p !== ME ? personaLine(ev) : ev.text;
          say(ev.p, text, 1600);
          log(ev.p === ME ? `Vos: ${ev.text}` : `${nameOf(ev.p)}: ${text}`, ev.p === ME ? 'me' : ev.p % 2 === 0 ? 'mate' : '');
          render(m);
          await sleep(ev.p !== ME ? 950 : 500);
        } else if (ev.t === 'play') {
          S.fresh = ev.card.id;
          log(ev.p === ME ? `Tirás el ${cardName(ev.card)}` : `${nameOf(ev.p)} tira el ${cardName(ev.card)}`, 'play');
          render(m);
          await sleep(ev.p !== ME ? 380 : 180);
        } else if (ev.t === 'trick') {
          const n = ['Primera', 'Segunda', 'Tercera'][ev.trick];
          log(ev.r === 'p' ? `${n}: parda` : `${n} para ${who(ev.r)}${isTeamGame() ? ` (${nameOf(ev.seat)})` : ''}`);
          render(m);
          await sleep(isTeamGame() ? 1100 : 700);
        } else if (ev.t === 'envido' || ev.t === 'flor') {
          log(`+${ev.points} de ${ev.t} para ${who(ev.winner)}`, 'pts');
          render(m);
          bump(ev.winner);
          await sleep(750);
        }
      }
    },

    async handOver(h) {
      const m = S.match;
      if (h.points) log(`+${h.points} para ${who(h.winner)} por la mano`, 'pts');
      bump(h.winner);
      say(1, pickOne(h.winner === 1 ? personaOf(1).say.winHand : personaOf(1).say.loseHand), 1600);
      render(m, true);
      if (!settings.summary) { await sleep(1700); return; }
      return new Promise((res) => {
        const them = isTeamGame() ? 'Los rivales' : oppName();
        const reasons = {
          cards: (w) => (w === ME ? 'Ganaron las cartas de tu lado.' : `${them} ganaron con las cartas.`),
          noquiero: (w) => (w === ME ? `${them} no quisieron.` : 'Tu lado no quiso.'),
          mazo: (w) => (w === ME ? `${them} se fueron al mazo.` : 'Tu lado se fue al mazo.')
        };
        $('ov-title').textContent = h.winner === ME ? `¡Mano para ${isTeamGame() ? 'tu equipo' : 'vos'}! +${h.points}` : `Mano para ${them} · +${h.points}`;
        const lines = [reasons[h.endReason](h.winner)];
        if (h.florResult) lines.push(`Flor: +${h.florResult.points} para ${who(h.florResult.winner)}.`);
        if (h.envResult) lines.push(`Envido: +${h.envResult.points} para ${who(h.envResult.winner)}.`);
        if (!isTeamGame()) lines.push(`Envido de cada uno: vos ${h.envPoints[ME]}, ${oppName()} ${h.envPoints[OPP]}.`);
        $('ov-detail').innerHTML = lines.join('<br>');
        $('hand-overlay').classList.remove('hidden');
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
      if (S.mode === 'team') {
        const ts = store.get('truco.teamStats', { w: 0, l: 0 });
        if (won) ts.w++; else ts.l++;
        store.set('truco.teamStats', ts);
        $('btn-next-rival').classList.add('hidden');
        $('modal-avatar').textContent = won ? '🏆' : S.team.rivals.map((p) => p.avatar).join('');
        $('modal-title').textContent = won ? '¡Ganó tu equipo!' : 'Ganaron los rivales';
        $('modal-quote').textContent = '“' + pickOne(won ? S.team.rivals[0].say.loseGame : S.team.rivals[0].say.winGame) + '”';
        $('modal-score').textContent = `Nosotros ${m.scores[0]} — ${m.scores[1]} Ellos · En equipo llevás ${ts.w} ganados y ${ts.l} perdidos`;
        $('modal').classList.remove('hidden');
        $('btn-rematch').focus();
        return;
      }
      const stats = store.get('truco.stats', {});
      const st = stats[S.persona.id] || { w: 0, l: 0 };
      if (won) st.w++; else st.l++;
      stats[S.persona.id] = st;
      store.set('truco.stats', stats);
      const idx = PERSONAS.indexOf(S.persona);
      let unlocked = null;
      if (won && S.mode === 'career' && idx === career()) {
        store.set('truco.career', idx + 1);
        unlocked = PERSONAS[idx + 1] || null;
      }
      $('btn-next-rival').classList.toggle('hidden', !(S.mode === 'career' && won && career() < PERSONAS.length && PERSONAS[career()] !== S.persona));
      $('btn-next-rival').textContent = career() < PERSONAS.length ? `Siguiente: ${PERSONAS[career()].name}` : '';
      $('modal-avatar').textContent = won ? '🏆' : S.persona.avatar;
      $('modal-title').textContent = won ? '¡Ganaste el partido!' : `Ganó ${oppName()}`;
      $('modal-quote').textContent = '“' + pickOne(won ? S.persona.say.loseGame : S.persona.say.winGame) + '”';
      $('modal-score').textContent = `Vos ${m.scores[ME]} — ${m.scores[OPP]} ${oppName()}`
        + (unlocked ? ` · ¡Desbloqueaste a ${unlocked.name}!` : won && S.mode === 'career' && idx === PERSONAS.length - 1 ? ' · ¡Completaste la carrera!' : '');
      $('modal').classList.remove('hidden');
      $('btn-rematch').focus();
    }
  };

  function personaLine(ev) {
    const s = personaOf(ev.p).say;
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
    const el = $(p === ME ? 'me-bubble' : isTeamGame() ? 'seat-bubble-' + p : 'opp-bubble');
    if (!el) return;
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
    if (h.over) return '';
    const actor = E.actorOf(h);
    if (!legal) return isTeamGame() && actor % 2 === 0 ? `Tu compañero ${nameOf(actor)} está pensando…` : `${nameOf(actor)} está pensando…`;
    const p = nameOf(h.florPending ? h.florPending.caller : h.envPending ? h.envCaller : h.trucoPending ? h.trucoPending.caller : 1);
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

    const team = m.seats.length > 2;
    const usName = team ? 'Nosotros' : 'Vos', themName = team ? 'Ellos' : p.name;
    $('top-score').innerHTML = `<span>${usName} <b>${m.scores[ME]}</b></span><span class="sep">·</span><span><b>${m.scores[OPP]}</b> ${themName}</span>`;
    if (team) renderTeamTable(m, h, reveal);
    else renderDuelTable(m, h, reveal);
    renderCommon(m, h, legal, usName, themName);
  }

  function renderTeamTable(m, h, reveal) {
    const n = h.n;
    const actor = h.over ? -1 : E.actorOf(h);
    for (let q = 1; q < n; q++) {
      const seat = document.querySelector(`.seat[data-seat="${q}"]`);
      if (!seat) continue;
      seat.classList.toggle('acting', q === actor);
      seat.classList.toggle('mano', q === h.mano);
      const k = h.cards[q].length;
      $('seat-cards-' + q).innerHTML = h.cards[q].map((c, i) => `<div class="card" style="${fan(i, k, -8)}">${reveal || h.over ? cardSVG(c) : backSVG()}</div>`).join('');
    }
    // baza en juego (o la última, hasta que se tire la primera carta de la siguiente)
    const playing = h.trickCards.some(Boolean);
    const last = h.trickLog[h.trickLog.length - 1];
    const cards = playing || !last ? h.trickCards : last.cards;
    const winSeat = !playing && last ? last.seat : null;
    const pos = POS[n];
    $('tring').innerHTML = cards.map((c, q) => (c ? `<div class="tcard at-${q === 0 ? 'bottom' : pos[q]} ${winSeat === q ? 'win' : ''} ${!playing && last && last.r === 'p' ? 'parda' : ''}"><div class="card${c.id === S.fresh ? ' fresh' : ''}">${cardSVG(c)}</div></div>` : '')).join('');
    $('tsum').innerHTML = [0, 1, 2].map((i) => {
      const r = h.results[i];
      const txt = r === undefined ? (i === h.trick && !h.over ? 'en juego' : '—') : r === 'p' ? 'parda' : r === 0 ? 'nosotros' : 'ellos';
      return `<span class="tchip ${r === undefined ? '' : r === 'p' ? 'r-parda' : r === 0 ? 'r-me' : 'r-opp'}"><em>${['1ra', '2da', '3ra'][i]}</em>${txt}</span>`;
    }).join('');
    const fresh = S.fresh;
    if (fresh) setTimeout(() => { if (S.fresh === fresh) S.fresh = null; }, 350);
  }

  function renderDuelTable(m, h, reveal) {
    const p = S.persona;
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
  }

  function renderCommon(m, h, legal, usName, themName) {
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
      ['Es mano', h.mano === ME ? 'vos' : nameOf(h.mano)],
      ['La mano vale', h.trucoLevel + (h.trucoLevel > 1 ? ' · ' + E.TRUCO_NAMES[h.trucoLevel] : '')]
    ];
    if (settings.showEnv) chips.push([h.hasFlor[ME] ? 'Tu flor' : 'Tu envido', h.hasFlor[ME] ? h.florPts[ME] : h.envPoints[ME]]);
    if (h.florResult) chips.push(['Flor', `+${h.florResult.points} ${who(h.florResult.winner)}`]);
    if (h.envResult) chips.push(['Envido', `+${h.envResult.points} ${who(h.envResult.winner)}`]);
    $('chips').innerHTML = chips.map(([k, v]) => `<div class="chip"><span>${k}</span><b>${v}</b></div>`).join('');

    // Tanteador
    const col = (pl, name) => `<div class="sb-col" data-p="${pl}">
      <div class="sb-name">${name}</div>
      <div class="sb-num">${m.scores[pl]}</div>
      <div class="sb-sub">${m.scores[pl] < m.target / 2 ? 'en las malas' : 'en las buenas'}</div>
      ${matchesSVG(m.scores[pl], m.target)}</div>`;
    $('scoreboard').innerHTML = `<div class="board-title">Tanteador · a ${m.target}</div><div class="board-cols">${col(ME, usName)}${col(OPP, themName)}</div>`;
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

  applyTheme();
  show('home');
})();
