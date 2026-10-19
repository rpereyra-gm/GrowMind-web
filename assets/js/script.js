(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var noHover = window.matchMedia('(hover: none)');
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };

  // Resorte amortiguado convertido a una curva CSS linear(): pasa levemente de largo y se asienta.
  function springEasing(stiffness, damping, seconds) {
    var w0 = Math.sqrt(stiffness), z = damping / (2 * w0), wd = w0 * Math.sqrt(1 - z * z), pts = [];
    for (var i = 0; i <= 40; i++) {
      var t = i / 40 * seconds;
      pts.push((1 - Math.exp(-z * w0 * t) * (Math.cos(wd * t) + (z * w0 / wd) * Math.sin(wd * t))).toFixed(4));
    }
    return 'linear(' + pts.join(',') + ')';
  }
  var SPRING = springEasing(170, 15, 0.9);
  var EASE_IO = 'cubic-bezier(.65, 0, .35, 1)';

  /* ---------- Portada: las palabras llegan en cascada, de izquierda a derecha, saliendo del desenfoque ---------- */
  var header = $('#site-header');
  var heroEl = $('#portada');
  // Parte el texto en palabras (que no se cortan) y cada palabra en letras; cada letra lleva su retraso.
  function splitLetters(el, start, step, scrub) {
    var text = el.textContent.trim().replace(/\s+/g, ' ');
    var holders = $$('span', el).length ? $$('span', el) : [el];
    var n = 0;
    var full = document.createElement('span');
    full.className = 'sr';
    full.textContent = text;
    holders.forEach(function (holder) {
      var words = holder.textContent.trim().split(' ');
      holder.textContent = '';
      words.forEach(function (w, i) {
        var wd = document.createElement('span');
        wd.className = scrub ? 'sw' : 'wd';
        wd.setAttribute('aria-hidden', 'true');
        w.split('').forEach(function (ch) {
          var l = document.createElement('span');
          l.className = scrub ? 'sl' : 'l';
          if (scrub) l.style.setProperty('--i', n); else l.style.setProperty('--d', (start + n * step) + 'ms');
          l.textContent = ch;
          wd.appendChild(l);
          n++;
        });
        holder.appendChild(wd);
        if (i < words.length - 1) holder.appendChild(document.createTextNode(' '));
      });
      holder.appendChild(document.createTextNode(' '));
    });
    el.insertBefore(full, el.firstChild);
    if (scrub) el.style.setProperty('--n', n);
    return start + n * step;
  }
  var h1 = $('#hero-h1'), heroLead = $('#hero-lead'), heroDesc = $('#hero-desc');
  var heroBtns = $('#hero-btns'), heroCue = $('#hero-cue');
  var brand = $('.brand', document), menuEls = [$('#main-nav'), $('.btn-nav'), $('#nav-toggle')];
  var heroGeo = null;
  if (!reduce.matches) {
    [heroDesc, h1, heroLead].forEach(function (el) { splitLetters(el, 0, 0, true); el.classList.add('scrub'); });
  }

  // Títulos de sección: las letras aparecen con el scroll (y se van al subir), con el desenfoque bajando al llegar
  var scrubEls = [];
  var scrubP = [];
  if (!reduce.matches) {
    $$('.section .head h2, .section .head .lead, .closing .big').forEach(function (el) {
      splitLetters(el, 0, 0, true);
      el.classList.add('scrub');
      scrubEls.push(el);
      scrubP.push(-1);
    });
  }
  function updateScrub() {
    var vh = window.innerHeight;
    scrubEls.forEach(function (el, k) {
      var r = el.getBoundingClientRect();
      var p = clamp((vh * 0.96 - r.top) / (vh * 0.42), 0, 1);
      if (Math.abs(p - scrubP[k]) > 0.002) { scrubP[k] = p; el.style.setProperty('--p', p.toFixed(3)); }
    });
  }

  /* ---------- Portada: logo grande -> esquina; luego título y bajada; luego botones ---------- */
  // Tramos del recorrido P (0 a 1): logo 0-0.40 · título 0.36-0.75 · bajada 0.52-0.78 · botones 0.71-0.80
  function seg(P, a, b) { return clamp((P - a) / (b - a), 0, 1); }
  function inOut(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }

  function measureHero() {
    if (reduce.matches || !brand) return;
    brand.style.transform = 'none';
    var r = brand.getBoundingClientRect();
    var vw = window.innerWidth, vh = window.innerHeight;
    var bigW = Math.min(vw * 0.62, 760);
    var s0 = bigW / r.width;
    heroGeo = {
      s0: s0,
      tx: (vw - bigW) / 2 - r.left,
      ty: (vh - r.height * s0) / 2 - r.top
    };
  }

  // La presentación no mueve la página: mientras dura, la rueda, el touch y el teclado la hacen avanzar (o retroceder)
  // y la barra de scroll queda arriba. Al terminar se libera el scroll normal y ya no vuelve a empezar.
  var introOn = !reduce.matches && window.pageYOffset < 5;
  var introT = 0, introS = 0, introRaf = null, touchY = null;
  var INTRO_LEN = 2.4; // pantallas de rueda que dura la presentación

  function finishIntro() { introOn = false; introT = introS = 1; renderHero(1); }

  function pushIntro(d) {
    introT = clamp(introT + d, 0, 1);
    if (!introRaf) introRaf = requestAnimationFrame(tickIntro);
  }

  function tickIntro() {
    introRaf = null;
    introS += (introT - introS) * 0.12;
    if (Math.abs(introT - introS) < 0.0008) introS = introT;
    renderHero(introS);
    if (introS >= 1) { introOn = false; return; }
    if (introS !== introT) introRaf = requestAnimationFrame(tickIntro);
  }

  function wheelPx(e) { return e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * window.innerHeight : e.deltaY; }

  window.addEventListener('wheel', function (e) {
    if (!introOn) return;
    e.preventDefault();
    pushIntro(wheelPx(e) / (window.innerHeight * INTRO_LEN));
  }, { passive: false });
  window.addEventListener('touchstart', function (e) { if (introOn) touchY = e.touches[0].clientY; }, { passive: true });
  window.addEventListener('touchmove', function (e) {
    if (!introOn || touchY === null) return;
    e.preventDefault();
    var y = e.touches[0].clientY;
    pushIntro((touchY - y) * 1.6 / (window.innerHeight * INTRO_LEN));
    touchY = y;
  }, { passive: false });
  window.addEventListener('keydown', function (e) {
    if (!introOn || /input|textarea|select/i.test(e.target.tagName)) return;
    var k = e.key, step = 0.18;
    if (k === 'ArrowDown' || k === 'PageDown' || (k === ' ' && !e.shiftKey)) { e.preventDefault(); pushIntro(step); }
    else if (k === 'ArrowUp' || k === 'PageUp' || (k === ' ' && e.shiftKey)) { e.preventDefault(); pushIntro(-step); }
    else if (k === 'End') { e.preventDefault(); pushIntro(1); }
  });
  // Si la página se mueve por otro camino (arrastrar la barra, un enlace con #, restaurar la posición), se completa.
  window.addEventListener('scroll', function () { if (introOn && window.pageYOffset > 2) finishIntro(); }, { passive: true });

  function updateHero() {
    if (reduce.matches || !heroGeo) return;
    renderHero(introOn ? introS : 1);
  }

  function renderHero(P) {
    if (reduce.matches || !heroGeo) return;
    var e = inOut(seg(P, 0, 0.45));              // 0 = logo grande y centrado, 1 = en su lugar
    var k = 1 - e;
    brand.style.transform = 'translate(' + (heroGeo.tx * k).toFixed(1) + 'px,' + (heroGeo.ty * k).toFixed(1) + 'px) scale(' + (1 + (heroGeo.s0 - 1) * k).toFixed(4) + ')';
    var menu = seg(P, 0.2, 0.45);                // el menú aparece junto con el viaje del logo
    header.style.setProperty('--menu', menu.toFixed(3));
    menuEls.forEach(function (m) { if (m) { if (menu < 0.6) m.setAttribute('inert', ''); else m.removeAttribute('inert'); } });
    var tt = seg(P, 0.4, 0.85);                  // el título arranca con el logo al 90 %
    heroDesc.style.setProperty('--p', tt.toFixed(3));
    h1.style.setProperty('--p', tt.toFixed(3));
    heroLead.style.setProperty('--p', seg(P, 0.58, 0.9).toFixed(3));
    var b = seg(P, 0.8, 0.94);                   // los botones, con el título al 90 %
    heroBtns.style.setProperty('--b', b.toFixed(3));
    if (b < 0.5) heroBtns.setAttribute('inert', ''); else heroBtns.removeAttribute('inert');
    heroCue.style.setProperty('--cue', (1 - seg(P, 0, 0.1)).toFixed(3));
  }

  /* ---------- Menú: sección activa, tono claro/oscuro y botón ---------- */
  var toggle = $('#nav-toggle');
  var navLinks = $$('.pill a');
  var navSections = navLinks.map(function (a) { return $(a.getAttribute('href')); });
  var hero = $('#portada');
  var pie = $('#pie');
  var onDark = false;

  toggle.addEventListener('click', function () {
    var open = header.classList.toggle('nav-open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  $('#main-nav').addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      header.classList.remove('nav-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  function updateHeader() {
    var probe = PROBE, active = -1, tone = 'light', fade = '';
    navSections.forEach(function (s, i) {
      var r = s.getBoundingClientRect();
      if (r.top <= 120 && r.bottom > 120) active = i;
    });
    navLinks.forEach(function (a, i) {
      if (i === active) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
    if (onDark) { tone = 'dark'; fade = getComputedStyle(pie).backgroundColor; }
    if (fade) header.style.setProperty('--fade', fade); else header.style.removeProperty('--fade');
    header.setAttribute('data-tone', tone);
    header.setAttribute('data-hero', hero.getBoundingClientRect().bottom > 80 ? 'true' : 'false');
  }

  // El menú pasa a tono oscuro cuando el pie está bajo la línea del menú.
  var pieObserver = null, PROBE = 62;
  function watchPie() {
    if (!('IntersectionObserver' in window)) return;
    if (pieObserver) pieObserver.disconnect();
    var h = window.innerHeight;
    pieObserver = new IntersectionObserver(function (entries) {
      onDark = entries[entries.length - 1].isIntersecting;
      updateHeader();
    }, { rootMargin: '-' + PROBE + 'px 0px -' + Math.max(0, h - PROBE - 1) + 'px 0px' });
    pieObserver.observe(pie);
  }

  // Hora de Rosario, cada 30 segundos
  var clock = $('#clock');
  var fmt = new Intl.DateTimeFormat('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', hour: '2-digit', minute: '2-digit', hour12: false });
  function tickClock() {
    var now = new Date();
    clock.textContent = fmt.format(now);
    clock.setAttribute('datetime', now.toISOString());
  }
  tickClock();
  setInterval(tickClock, 30000);

  /* ---------- Problemas: cubo que gira en vertical ---------- */
  var prob = $('#problemas');
  var cube = $('#cube');
  var faces = $$('.phrase', cube);
  var lines = faces.map(function (f) { return $$('span', f); });
  var count = $('#count');
  var fill = $('#fill');
  var STEP = 1;     // pantallas de scroll por frase
  var LAG = 0.05;    // la segunda línea llega y sale un poco después (escalonado)
  var probT = 0, probP = 0, probRaf = null, probTop = 0, probTotal = 0;

  // d = distancia de la cara a la posición actual. Meseta en el centro y giro inOut entre caras.
  function ease(d) {
    var a = clamp((Math.abs(d) - 0.1) / 0.8, 0, 1);
    a = a < 0.5 ? 4 * a * a * a : 1 - Math.pow(-2 * a + 2, 3) / 2;
    return d < 0 ? -a : a;
  }

  function sizeProblems() {
    if (reduce.matches) { prob.style.removeProperty('--problems-h'); return; }
    prob.style.setProperty('--problems-h', ((faces.length - 1) * STEP * 100 + 100) + 'vh');
    probTotal = prob.offsetHeight - window.innerHeight;
    probTop = prob.getBoundingClientRect().top + window.pageYOffset;
    // Cada línea gira alrededor del eje del cubo: pasa por el centro de la cara, a media altura de profundidad.
    var h = cube.offsetHeight;
    faces.forEach(function (f, i) {
      lines[i].forEach(function (sp) {
        sp.style.transformOrigin = '0 ' + (h / 2 - (sp.offsetTop - f.offsetTop)).toFixed(1) + 'px ' + (-h * 0.8).toFixed(1) + 'px';
      });
    });
  }

  function updateProblems() {
    if (reduce.matches) {
      lines.forEach(function (pair) { pair.forEach(function (sp) { sp.style.transform = ''; sp.style.opacity = ''; }); });
      return;
    }
    probT = probTotal > 0 ? clamp((window.pageYOffset - probTop) / probTotal, 0, 1) : 0;
    wakeProblems();
  }

  function wakeProblems() {
    if (probRaf || reduce.matches) return;
    probRaf = requestAnimationFrame(function step() {
      probRaf = null;
      probP += (probT - probP) * 0.14;           // suavizado: la posición persigue al scroll
      var settled = Math.abs(probT - probP) < 0.0004;
      if (settled) probP = probT;
      renderProblems();
      if (!settled) probRaf = requestAnimationFrame(step);
    });
  }

  function renderProblems() {
    var p = probP * (faces.length - 1);
    faces.forEach(function (f, i) {
      var d = i - p;
      lines[i].forEach(function (sp, k) {
        var dk = d + k * LAG, e = ease(dk);
        if (Math.abs(dk) >= 1) { sp.style.opacity = '0'; sp.style.transform = 'none'; return; }
        // la cara que se aleja se apaga a medida que gira, como si quedara en sombra
        sp.style.opacity = (1 - 0.7 * Math.pow(Math.abs(e), 1.6)).toFixed(3);
        sp.style.transform = 'rotateX(' + (-e * 90).toFixed(2) + 'deg)';
      });
    });
    count.textContent = (Math.round(p) + 1) + ' de ' + faces.length;
    fill.style.width = (probP * 100).toFixed(1) + '%';
  }

  /* ---------- Diagrama: lo controla la barra inferior (no el scroll) ---------- */
  var dgRange = $('#dg-range'), dgCap = $('#dg-caption'), dgCountEl = $('#dg-count');
  var dgCards = $$('.dg-card'), dgArrows = $$('.dg-arrow'), dgAuto = $$('.dg-auto');
  var dgLinks = $$('.dg-link'), dgDot = $('#dg-dot'), dgStops = $$('.dg-stop');
  var dgElbow = $('#dg-elbow'), dgBar = $('#dg-bar');
  var dgRaf = null, dgCur = 0, dgTarget = 0, dgStopIdx = -1, dgCountTxt = '';
  // Cada parada tiene un tramo quieto (para que el estado se vea un momento) y entre tramos las piezas se mueven.
  // Entre 02 y 03 hay más recorrido, para que se vea despacio.
  var DG_HOLDS = [[0, 0.03], [0.22, 0.32], [0.6, 0.68], [0.88, 1]];
  var DG_STOPS = [0, 0.27, 0.64, 1];   // a dónde va la barra al tocar cada parada
  var DG_CAP = ['7 pasos, cada uno en un lugar distinto.', 'Ordenamos los pasos y se ve qué sobra.', 'Sacamos lo que sobra: quedan 4 pasos.', 'Lo que se repite sale solo.'];
  // Por tarjeta (en orden), por estado [01, 02, 03, 04]: [x %, y px, giro grados, opacidad]
  var DG_CARD = [
    [[38, 150, -8, 1], [3, 40, 0, 1], [3, 150, 0, 1], [3, 150, 0, 1]],    // 1 Consulta
    [[70, 30, 6, 1], [27, 40, 0, 1], [27, 150, 0, 0], [27, 150, 0, 0]],   // 2 Precios (se mete en Presupuesto)
    [[6, 40, 9, 1], [51, 40, 0, 1], [27, 150, 0, 1], [27, 150, 0, 1]],    // 3 Presupuesto
    [[52, 250, -5, 1], [75, 40, 0, 1], [27, 150, 0, 0], [27, 150, 0, 0]], // 4 Enviar PDF (se mete en Presupuesto)
    [[20, 180, 7, 1], [3, 230, 0, 1], [51, 150, 0, 0], [51, 150, 0, 0]],  // 5 Recordar (se mete en Seguimiento)
    [[76, 200, -10, 1], [27, 230, 0, 1], [51, 150, 0, 1], [51, 150, 0, 1]], // 6 Seguimiento
    [[44, 8, 4, 1], [51, 230, 0, 1], [75, 150, 0, 1], [75, 150, 0, 1]]    // 7 Cargar la venta / Registro
  ];
  // Flechas, por estado: [x %, y px, opacidad]. Del 4 al 5 va una flecha en codo (dg-elbow, en el SVG)
  var DG_ARROW = [
    [[25, 78, 0], [26, 78, 1], [26, 188, 1], [26, 188, 1]],
    [[49, 78, 0], [50, 78, 1], [50, 188, 1], [50, 188, 1]],
    [[73, 78, 0], [74, 78, 1], [74, 188, 1], [74, 188, 1]],
    [[25, 268, 0], [26, 268, 1], [26, 268, 0], [26, 268, 0]],
    [[49, 268, 0], [50, 268, 1], [50, 268, 0], [50, 268, 0]]
  ];
  var DG_LINKS = [[0, 2], [0, 5], [1, 3], [1, 4], [2, 6], [3, 4], [5, 6], [4, 6]]; // pares unidos por puntos al inicio
  var DG_FB = [0, 2, 5, 6];    // tarjetas que cambian de texto en 03 (Consulta, Presupuesto, Seguimiento, Registro)
  var DG_MERGE = [1, 3, 4];    // tarjetas que se tachan y se meten dentro de otra

  function dgState(p) {        // progreso 0 a 1 -> estado continuo 0 a 3, quieto en cada parada
    for (var i = 0; i < 4; i++) if (p >= DG_HOLDS[i][0] && p <= DG_HOLDS[i][1]) return i;
    for (var j = 0; j < 3; j++) {
      var a = DG_HOLDS[j][1], b = DG_HOLDS[j + 1][0];
      if (p > a && p < b) { var f = (p - a) / (b - a); return j + f * f * (3 - 2 * f); }
    }
    return 3;
  }
  function dgMix(states, s) {  // interpola entre los dos estados vecinos
    var k = Math.min(Math.floor(s), 2), f = s - k;
    var a = states[k], b = states[k + 1];
    return a.map(function (v, j) { return v + (b[j] - v) * f; });
  }
  function renderDiagram() {
    var s = dgState(dgCur), centers = [];
    dgCards.forEach(function (c, i) {
      var v = dgMix(DG_CARD[i], s);
      centers[i] = [v[0] + 11, v[1] + 38];  // centro de la tarjeta (ancho 22 %, alto 76 px)
      c.style.left = v[0].toFixed(2) + '%';
      c.style.top = v[1].toFixed(1) + 'px';
      c.style.transform = 'rotate(' + v[2].toFixed(2) + 'deg)';
      c.style.opacity = v[3].toFixed(3);
    });
    dgLinks.forEach(function (ln, k) {
      var a = centers[DG_LINKS[k][0]], b = centers[DG_LINKS[k][1]];
      ln.setAttribute('x1', a[0].toFixed(2)); ln.setAttribute('y1', a[1].toFixed(1));
      ln.setAttribute('x2', b[0].toFixed(2)); ln.setAttribute('y2', b[1].toFixed(1));
      ln.style.opacity = (clamp(1 - s, 0, 1) * 0.9).toFixed(3);
    });
    dgElbow.style.opacity = clamp(1 - Math.abs(s - 1) * 2, 0, 1).toFixed(3);
    dgArrows.forEach(function (el, j) {
      var v = dgMix(DG_ARROW[j], s);
      el.style.left = v[0].toFixed(2) + '%';
      el.style.top = v[1].toFixed(1) + 'px';
      el.style.opacity = v[2].toFixed(3);
    });
    DG_FB.forEach(function (i) {
      var fb = clamp((s - 1.5) * 2, 0, 1), card = dgCards[i];
      card.querySelector('.dg-fb').style.opacity = fb.toFixed(3);
      card.querySelector('.dg-fa').style.opacity = (1 - fb).toFixed(3);
    });
    DG_MERGE.forEach(function (i) { dgCards[i].classList.toggle('merge', s >= 1.5); });
    var late = clamp((s - 2.6) * 2.5, 0, 1).toFixed(3);
    dgAuto.forEach(function (el) { el.style.opacity = late; });
    dgDot.style.opacity = late;
    var cnt = s >= 1.9 ? 'Una consulta, de principio a fin · 4 pasos' : 'Una consulta, de principio a fin · 7 pasos';
    if (cnt !== dgCountTxt) { dgCountTxt = cnt; dgCountEl.textContent = cnt; }
    var near = Math.min(3, Math.max(0, Math.round(s)));
    if (near !== dgStopIdx) {
      dgStopIdx = near;
      dgStops.forEach(function (btn, i) { btn.classList.toggle('on', i === near); });
      dgCap.textContent = DG_CAP[near];
    }
  }
  function tickDiagram() {
    dgRaf = null;
    dgCur += (dgTarget - dgCur) * 0.14;
    if (Math.abs(dgTarget - dgCur) < 0.0005) dgCur = dgTarget;
    renderDiagram();
    if (dgCur !== dgTarget) dgRaf = requestAnimationFrame(tickDiagram);
  }
  function wakeDiagram() {
    if (reduce.matches) { dgCur = dgTarget; renderDiagram(); return; }
    if (!dgRaf) dgRaf = requestAnimationFrame(tickDiagram);
  }
  dgRange.addEventListener('input', function () { dgBar.classList.remove('hint'); dgTarget = dgRange.value / 100; wakeDiagram(); });
  dgStops.forEach(function (btn, i) {
    btn.addEventListener('click', function () {
      dgBar.classList.remove('hint');
      dgTarget = DG_STOPS[i];
      dgRange.value = (DG_STOPS[i] * 100).toFixed(1);
      wakeDiagram();
    });
  });

  /* ---------- Servicios: listado en tres copias con foco central ---------- */
  var svc = $('#servicios');
  var stage = $('#svc-stage');
  var track = $('#svc-track');
  var list = $('#svc-list');
  var marker = $('#svc-marker');
  var pop = $('#svc-pop');
  var items = $$('li', list);
  var N = items.length;
  var STEP_PX = 260;
  var EASE = 0.12;
  var INK = [17, 43, 44], P600 = [51, 130, 132], P200 = [183, 214, 215], P800 = [27, 83, 85];
  var lineEls = $$('.lines li');
  var lineItems = lineEls.map(function (l) {
    var name = l.getAttribute('data-line');
    return items.map(function (li, i) { return li.getAttribute('data-line') === name ? i : -1; }).filter(function (i) { return i >= 0; });
  });

  // Todo lo que se mide del layout se guarda acá y se recalcula solo al cambiar el tamaño.
  var rows = null, rowH = 56, stageH = 800, secTop = 0, total = 0;
  var cache = [];                 // último color y opacidad escritos en cada fila
  var pos = 0, target = 0;        // posición suavizada y objetivo, en px de scroll dentro de la sección
  var hover = -1, hoverW = 0, hoverIdx = 0, hoverTarget = 0;
  var raf = null, lastPop = -2, shownIdx = -1;

  function buildCopies() {
    if (rows) return;
    function copy(where) {
      var ul = document.createElement('ul');
      ul.className = 'svc-list-copy svc-copy';
      ul.setAttribute('aria-hidden', 'true');
      items.forEach(function (li) {
        var c = document.createElement('li');
        var sp = document.createElement('span');
        sp.className = 'svc-copy-name';
        sp.textContent = $('.svc-name', li).textContent;
        c.appendChild(sp);
        ul.appendChild(c);
      });
      if (where === 'before') track.insertBefore(ul, list); else track.appendChild(ul);
      return ul;
    }
    var before = copy('before'), after = copy('after');
    rows = $$('.svc-copy-name', before).concat($$('.svc-name', list), $$('.svc-copy-name', after));
    cache = rows.map(function () { return { c: '', o: '' }; });
  }

  function sizeServices() {
    if (reduce.matches) { svc.style.removeProperty('--svc-h'); return; }
    buildCopies();
    stageH = stage.offsetHeight || window.innerHeight;
    var fs = parseFloat(getComputedStyle($('.svc-name', list)).fontSize) || 40;
    rowH = Math.round(fs * 1.3);
    svc.style.setProperty('--row-h', rowH + 'px');
    svc.style.setProperty('--svc-h', (stageH + (N - 1) * STEP_PX) + 'px');
    marker.style.top = (stageH / 2 - 5) + 'px';
    total = svc.offsetHeight - stageH;
    secTop = svc.getBoundingClientRect().top + window.pageYOffset;
    cache.forEach(function (c) { c.c = ''; c.o = ''; });
  }

  function readServices() {
    if (reduce.matches || !rows) return;
    target = total > 0 ? clamp(window.pageYOffset - secTop, 0, total) : 0;
    wakeServices();
  }

  function wakeServices() {
    if (raf || reduce.matches) return;
    raf = requestAnimationFrame(tickServices);
  }

  // Un solo ciclo: la posición suavizada persigue al objetivo y todo se calcula desde ella.
  function tickServices() {
    raf = null;
    pos += (target - pos) * EASE;
    hoverW += (hoverTarget - hoverW) * 0.2;
    var settled = Math.abs(target - pos) < 0.05 && Math.abs(hoverTarget - hoverW) < 0.002;
    if (settled) { pos = target; hoverW = hoverTarget; }
    renderServices();
    if (!settled) raf = requestAnimationFrame(tickServices);
  }

  function mix(a, b, t) {
    return Math.round(a[0] + (b[0] - a[0]) * t) + ',' + Math.round(a[1] + (b[1] - a[1]) * t) + ',' + Math.round(a[2] + (b[2] - a[2]) * t);
  }

  function renderServices() {
    if (!rows || reduce.matches) return;
    var f = total > 0 ? pos / total * (N - 1) : 0;   // servicio en el centro, continuo
    var center = N + f;
    var cf = f + hoverW * (hoverIdx - f);            // servicio que lleva el foco de color
    var cc = N + cf;
    track.style.transform = 'translate3d(0,' + (stageH / 2 - center * rowH - rowH / 2).toFixed(2) + 'px,0)';
    for (var g = 0; g < rows.length; g++) {
      var d = Math.abs(g - center);
      var o = d <= 4 ? '1' : (d >= 7.5 ? '0' : (1 - (d - 4) / 3.5).toFixed(3));
      var dc = Math.min(Math.abs(g - cc), 2);
      var col = 'rgb(' + (dc <= 1 ? mix(INK, P600, dc) : mix(P600, P200, dc - 1)) + ')';
      var c = cache[g];
      if (c.o !== o) { rows[g].style.opacity = o; c.o = o; }
      if (c.c !== col) { rows[g].style.color = col; c.c = col; }
    }
    // Las tres líneas de la izquierda se tiñen según cuánto foco tienen sus servicios.
    for (var k = 0; k < lineEls.length; k++) {
      var w = 0;
      lineItems[k].forEach(function (i) { w = Math.max(w, 1 - Math.min(Math.abs(i - cf), 1)); });
      lineEls[k].style.color = 'rgb(' + mix(P800, INK, w) + ')';
    }
    marker.style.opacity = (1 - hoverW).toFixed(3);
    if (noHover.matches) {
      var fi = Math.round(cf);
      if (fi !== lastPop) { lastPop = fi; showPop(fi, null); }
    }
  }

  var popBusy = false, popE = null;

  function fillPop(i) {
    var li = items[i];
    var ps = $$('p', $('.svc-detail', li));
    pop.querySelector('[data-f="line"]').textContent = li.getAttribute('data-line');
    pop.querySelector('[data-f="name"]').textContent = $('.svc-name', li).textContent;
    pop.querySelector('[data-f="que"]').textContent = ps[0].textContent;
    pop.querySelector('[data-f="cambia"]').textContent = ps[1].textContent.replace('Qué cambia para vos:', '').trim();
  }

  function placePop(e) {
    if (e) {
      var rect = stage.getBoundingClientRect();
      var x = clamp(e.clientX - rect.left + 24, 0, rect.width - pop.offsetWidth - 8);
      var y = clamp(e.clientY - rect.top + 24, 16, rect.height - pop.offsetHeight - 16);
      pop.style.left = x + 'px'; pop.style.top = y + 'px'; pop.style.bottom = 'auto';
    } else {
      pop.style.left = '20px'; pop.style.top = 'auto'; pop.style.bottom = '20px';
    }
  }

  function popIn() {
    if (!pop.animate || reduce.matches) return;
    pop.getAnimations().forEach(function (a) { a.cancel(); });
    // El zoom va con resorte (pasa de largo y se asienta) y la opacidad sube rápido, para no dejar un hueco vacío
    pop.animate([{ transform: 'scale(.84)' }, { transform: 'scale(1)' }], { duration: 560, easing: SPRING });
    pop.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 140, easing: 'ease-out' });
    // El contenido entra escalonado, línea por línea
    Array.prototype.forEach.call(pop.children, function (c, i) {
      c.animate([
        { opacity: 0, transform: 'translateY(8px)' },
        { opacity: 1, transform: 'none' }
      ], { duration: 320, delay: i * 50, easing: EASE_IO, fill: 'backwards' });
    });
  }

  function hidePop() {
    popBusy = false; shownIdx = -1;
    if (pop.getAnimations) pop.getAnimations().forEach(function (a) { a.cancel(); });
    pop.hidden = true;
  }

  // Al cambiar de servicio, la ficha actual se achica y desaparece, y la nueva se abre.
  function showPop(i, e) {
    popE = e;
    var visible = !pop.hidden && shownIdx !== -1;
    if (visible && i === shownIdx) { if (!popBusy) placePop(e); return; }
    var prev = shownIdx;
    shownIdx = i;
    if (!visible || reduce.matches || !pop.animate) {
      fillPop(i); pop.hidden = false; placePop(e); popIn();
      return;
    }
    popBusy = true;
    var out = pop.animate([
      { transform: 'scale(1)', opacity: 1 },
      { transform: 'scale(.88)', opacity: 0 }
    ], { duration: 90, easing: 'ease-in', fill: 'forwards' });
    out.onfinish = function () {
      if (!popBusy || shownIdx !== i) return;   // el puntero ya se fue o cambió de nuevo
      popBusy = false;
      fillPop(i); placePop(popE); popIn();
    };
  }

  function setHover(i, e) {
    if (reduce.matches || !rows) return;
    hover = i;
    if (i >= 0) { hoverIdx = i; hoverTarget = 1; showPop(i, e); } else { hoverTarget = 0; if (!noHover.matches) hidePop(); }
    wakeServices();
  }

  function bindServices() {
    items.forEach(function (li, i) {
      var b = $('.svc-name', li);
      b.addEventListener('mousemove', function (e) { setHover(i, e); });
      b.addEventListener('focus', function () {
        var r = b.getBoundingClientRect();
        setHover(i, { clientX: r.left + 40, clientY: r.bottom - 16 });
      });
      b.addEventListener('blur', function () { setHover(-1); });
      // Al salir del texto del servicio la ficha desaparece, salvo que se pase directo a otro servicio
      b.addEventListener('mouseleave', function (e) {
        var to = e.relatedTarget;
        if (!(to && to.classList && to.classList.contains('svc-name'))) setHover(-1);
      });
    });
    stage.addEventListener('mouseleave', function () { setHover(-1); });
  }


  /* ---------- Preguntas: acordeón con altura animada ---------- */
  var faqs = $$('.faq details');
  function faqPanel(d) { return $('p', d); }
  function faqIcon(d) { return $('.icon', d); }

  function faqOpen(d) {
    d.open = true;
    if (reduce.matches || !d.animate) return;
    var p = faqPanel(d), h = p.offsetHeight, pb = getComputedStyle(p).paddingBottom;
    p.getAnimations().forEach(function (a) { a.cancel(); });
    p.style.overflow = 'hidden';
    var anim = p.animate([{ height: '0px', paddingBottom: '0px', opacity: 0 }, { height: h + 'px', paddingBottom: pb, opacity: 1 }], { duration: 420, easing: EASE_IO });
    anim.onfinish = anim.oncancel = function () { p.style.overflow = ''; };
    faqIcon(d).animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(180deg)' }], { duration: 560, easing: SPRING });
  }

  function faqClose(d) {
    if (!d.open) return;
    if (reduce.matches || !d.animate) { d.open = false; return; }
    var p = faqPanel(d), h = p.offsetHeight, pb = getComputedStyle(p).paddingBottom;
    p.getAnimations().forEach(function (a) { a.cancel(); });
    p.style.overflow = 'hidden';
    var anim = p.animate([{ height: h + 'px', paddingBottom: pb, opacity: 1 }, { height: '0px', paddingBottom: '0px', opacity: 0 }], { duration: 420, easing: EASE_IO });
    anim.onfinish = function () { d.open = false; p.style.overflow = ''; };
    faqIcon(d).animate([{ transform: 'rotate(180deg)' }, { transform: 'rotate(0deg)' }], { duration: 340, easing: EASE_IO });
  }

  faqs.forEach(function (d) {
    $('summary', d).addEventListener('click', function (e) {
      e.preventDefault();
      if (d.open) { faqClose(d); return; }
      faqs.forEach(function (o) { if (o !== d) faqClose(o); });
      faqOpen(d);
    });
  });

  /* ---------- Año y eventos ---------- */
  var onScrollQueued = false;
  function onScroll() {
    if (onScrollQueued) return;
    onScrollQueued = true;
    requestAnimationFrame(function () {
      onScrollQueued = false;
      updateHeader();
      updateProblems();
      updateScrub();
      updateHero();
    });
  }
  function onResize() {
    measureHero();
    watchPie();
    sizeProblems();
    sizeServices();
    onScroll();
    readServices();
    pos = target;
    renderServices();
    updateProblems();
    renderDiagram();
    updateScrub();
    updateHero();
    probP = probT;
    if (!reduce.matches) renderProblems();
  }

  bindServices();
  window.addEventListener('scroll', function () { onScroll(); readServices(); }, { passive: true });
  window.addEventListener('resize', onResize);
  var onReduce = function () { location.reload(); };
  if (reduce.addEventListener) reduce.addEventListener('change', onReduce);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(onResize);
  onResize();
})();
