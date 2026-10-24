// boot.js — runs before the first paint: it sets the colour theme (saved choice, or your system's), so the page never flashes in the wrong theme.
(function () {
  try {
    var d = document.documentElement, q = new URLSearchParams(location.search);
    var theme = q.get('theme') || window.localStorage.getItem('mb-theme');
    if (theme !== 'light' && theme !== 'dark') theme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    d.setAttribute('data-theme', theme);
  } catch (e) { /* storage blocked: keep the defaults */ }
})();
