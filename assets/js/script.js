(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var noHover = window.matchMedia('(hover: none)');
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };

  /* ---------- Menú: sección activa, tono claro/oscuro y botón ---------- */
  var header = $('#site-header');
  var toggle = $('#nav-toggle');
  var navLinks = $$('.pill a');
  var navSections = navLinks.map(function (a) { return $(a.getAttribute('href')); });
  var hero = $('#portada');
  var darks = $$('[data-tone="dark"]').filter(function (el) { return el !== header; });

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
    var probe = 62, active = -1, tone = 'light', fade = '';
    navSections.forEach(function (s, i) {
      var r = s.getBoundingClientRect();
      if (r.top <= 120 && r.bottom > 120) active = i;
    });
    navLinks.forEach(function (a, i) {
      if (i === active) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
    darks.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top <= probe && r.bottom > probe) { tone = 'dark'; fade = getComputedStyle(el).backgroundColor; }
    });
    if (fade) header.style.setProperty('--fade', fade); else header.style.removeProperty('--fade');
    header.setAttribute('data-tone', tone);
    header.setAttribute('data-hero', hero.getBoundingClientRect().bottom > 80 ? 'true' : 'false');
  }

  /* ---------- Problemas: cubo que gira en vertical ---------- */
  var prob = $('#problemas');
  var cube = $('#cube');
  var faces = $$('.phrase', cube);
  var count = $('#count');
  var fill = $('#fill');
  var STEP = 0.8; // pantallas de scroll por frase

  // d = distancia de la cara a la posición actual. Meseta en el centro y giro entre caras.
  function ease(d) {
    var a = clamp((Math.abs(d) - 0.12) / 0.76, 0, 1);
    a = a * a * (3 - 2 * a);
    return d < 0 ? -a : a;
  }

  function sizeProblems() {
    if (reduce.matches) { prob.style.removeProperty('--problems-h'); return; }
    prob.style.setProperty('--problems-h', ((faces.length - 1) * STEP * 100 + 100) + 'vh');
  }

  function updateProblems() {
    if (reduce.matches) {
      faces.forEach(function (f) { f.style.transform = ''; f.style.opacity = ''; });
      return;
    }
    var r = prob.getBoundingClientRect();
    var total = prob.offsetHeight - window.innerHeight;
    var t = total > 0 ? clamp(-r.top / total, 0, 1) : 0;
    var p = t * (faces.length - 1);
    var h = cube.offsetHeight;
    faces.forEach(function (f, i) {
      var d = i - p, e = ease(d);
      if (Math.abs(d) >= 1) { f.style.opacity = '0'; f.style.transform = 'none'; return; }
      // Cada frase es una cara de un cubo de lado h: gira alrededor del eje que pasa por su centro.
      f.style.opacity = '1';
      f.style.transform = 'translateZ(' + (-h / 2).toFixed(1) + 'px) rotateX(' + (-e * 90).toFixed(2) + 'deg) translateZ(' + (h / 2).toFixed(1) + 'px)';
    });
    count.textContent = (Math.round(p) + 1) + ' de ' + faces.length;
    fill.style.width = (t * 100).toFixed(1) + '%';
  }

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
    pop.animate([
      { transform: 'scale(.88)', opacity: 0 },
      { transform: 'scale(1)', opacity: 1 }
    ], { duration: 190, easing: 'cubic-bezier(.2,.7,.3,1)' });
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
    ], { duration: 120, easing: 'ease-in', fill: 'forwards' });
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

  /* ---------- Año y eventos ---------- */
  var onScrollQueued = false;
  function onScroll() {
    if (onScrollQueued) return;
    onScrollQueued = true;
    requestAnimationFrame(function () {
      onScrollQueued = false;
      updateHeader();
      updateProblems();
    });
  }
  function onResize() {
    sizeProblems();
    sizeServices();
    onScroll();
    readServices();
    pos = target;
    renderServices();
  }

  bindServices();
  window.addEventListener('scroll', function () { onScroll(); readServices(); }, { passive: true });
  window.addEventListener('resize', onResize);
  var onReduce = function () { location.reload(); };
  if (reduce.addEventListener) reduce.addEventListener('change', onReduce);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(onResize);
  onResize();
})();
