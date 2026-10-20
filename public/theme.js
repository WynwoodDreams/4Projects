// Theme switch. Loaded as a classic, blocking script in <head> so the chosen
// theme is on <html> before the first paint — no dark-to-light flash.
//
// Order of precedence: the saved choice (localStorage "bb-theme"), then the OS
// preference, then dark. The toggle button (#theme-toggle) is wired up once
// the DOM is ready; pages without one still get the right theme.
(function () {
  var KEY = 'bb-theme';
  var mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: light)') : null;

  function saved() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function resolve() {
    var s = saved();
    if (s === 'light' || s === 'dark') return s;
    return mq && mq.matches ? 'light' : 'dark';
  }
  function apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'light' ? '#F3F6F7' : '#0C161B');
    var btn = document.getElementById('theme-toggle');
    if (btn) {
      var label = theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode';
      btn.setAttribute('aria-label', label);
      btn.title = label;
    }
  }

  apply(resolve());

  // Follow the OS only while the visitor has not picked a side.
  if (mq && mq.addEventListener) {
    mq.addEventListener('change', function () { if (!saved()) apply(resolve()); });
  }

  document.addEventListener('DOMContentLoaded', function () {
    apply(resolve());
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      try { localStorage.setItem(KEY, next); } catch (e) {}
      apply(next);
    });
  });
})();
