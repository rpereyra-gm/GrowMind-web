(function () {
  var header = document.querySelector('.site-header');
  var toggle = document.getElementById('nav-toggle');
  var nav = document.getElementById('main-nav');

  toggle.addEventListener('click', function () {
    var isOpen = header.classList.toggle('nav-open');
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  nav.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      header.classList.remove('nav-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
