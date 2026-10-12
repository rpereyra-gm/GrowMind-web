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
  var right = $('#svc-right');
  var track = $('#svc-track');
  var list = $('#svc-list');
  var marker = $('#svc-marker');
  var pop = $('#svc-pop');
  var items = $$('li', list);
  var N = items.length;
  var STEP_PX = 260;
  var rows = null, rowH = 56, stageH = 800, prog = 0, target = 0, hover = -1, raf = null, lastFocus = -2;
  var lineEls = $$('.lines li');

  function buildCopies() {
    if (rows) return;
    function copy(pos) {
      var ul = document.createElement('ul');
      ul.className = 'svc-list-copy svc-copy';
      ul.setAttribute('aria-hidden', 'true');
      items.forEach(function (li) {
        var c = document.createElement('li');
        var s = document.createElement('span');
        s.className = 'svc-copy-name';
        s.textContent = $('.svc-name', li).textContent;
        c.appendChild(s);
        ul.appendChild(c);
      });
      if (pos === 'before') track.insertBefore(ul, list); else track.appendChild(ul);
      return ul;
    }
    var before = copy('before'), after = copy('after');
    rows = $$('.svc-copy-name', before).concat($$('.svc-name', list), $$('.svc-copy-name', after));
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
  }

  function readServices() {
    var r = svc.getBoundingClientRect();
    var total = svc.offsetHeight - stage.offsetHeight;
    target = total > 0 ? clamp(-r.top / total, 0, 1) : 0;
    loopServices();
  }

  function loopServices() {
    if (raf) return;
    raf = requestAnimationFrame(function step() {
      raf = null;
      // Suavizado: el listado persigue al scroll sin saltos entre ítems.
      var diff = target - prog;
      prog = Math.abs(diff) < 0.0003 ? target : prog + diff * 0.16;
      renderServices();
      if (prog !== target) raf = requestAnimationFrame(step);
    });
  }

  function renderServices() {
    if (!rows || reduce.matches) return;
    var f = prog * (N - 1);
    var center = N + f;
    var fi = hover >= 0 ? hover : Math.round(f);
    track.style.transform = 'translateY(' + (stageH / 2 - center * rowH - rowH / 2).toFixed(1) + 'px)';
    for (var g = 0; g < rows.length; g++) {
      var d = Math.abs(g - center);
      var op = d <= 4 ? 1 : (d >= 7.5 ? 0 : 1 - (d - 4) / 3.5);
      rows[g].style.opacity = op.toFixed(3);
    }
    if (fi !== lastFocus) {
      lastFocus = fi;
      for (var g2 = 0; g2 < rows.length; g2++) {
        var dr = Math.abs(g2 - (N + fi));
        rows[g2].style.color = dr === 0 ? '#112B2C' : (dr === 1 ? '#338284' : '#B7D6D7');
      }
      var line = items[fi].getAttribute('data-line');
      lineEls.forEach(function (l) { l.classList.toggle('is-on', l.getAttribute('data-line') === line); });
      if (noHover.matches) showPop(fi, null);
    }
    marker.style.display = hover >= 0 ? 'none' : 'block';
  }

  function showPop(i, e) {
    var li = items[i];
    var line = li.getAttribute('data-line');
    var ps = $$('p', $('.svc-detail', li));
    pop.querySelector('[data-f="line"]').textContent = line;
    pop.querySelector('[data-f="name"]').textContent = $('.svc-name', li).textContent;
    pop.querySelector('[data-f="que"]').textContent = ps[0].textContent;
    pop.querySelector('[data-f="cambia"]').textContent = ps[1].textContent.replace('Qué cambia para vos:', '').trim();
    pop.hidden = false;
    if (e) {
      var rect = stage.getBoundingClientRect();
      var x = clamp(e.clientX - rect.left + 24, 0, rect.width - pop.offsetWidth - 8);
      var y = clamp(e.clientY - rect.top + 24, 16, rect.height - pop.offsetHeight - 16);
      pop.style.left = x + 'px'; pop.style.top = y + 'px'; pop.style.bottom = 'auto';
    } else {
      pop.style.left = '20px'; pop.style.top = 'auto'; pop.style.bottom = '20px';
    }
  }

  function setHover(i, e) {
    if (reduce.matches || !rows) return;
    hover = i;
    lastFocus = -2;
    if (i >= 0) showPop(i, e); else if (!noHover.matches) pop.hidden = true;
    renderServices();
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
      readServices();
    });
  }
  function onResize() {
    sizeProblems();
    sizeServices();
    lastFocus = -2;
    onScroll();
  }

  bindServices();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);
  var onReduce = function () { location.reload(); };
  if (reduce.addEventListener) reduce.addEventListener('change', onReduce);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(onResize);
  onResize();
  prog = target;
  renderServices();
})();
