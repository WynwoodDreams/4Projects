// Theme switch. Loaded as a classic, blocking script in <head> so the chosen
// theme is on <html> before the first paint — no dark-to-light flash.
//
// Dark is the default. Light is used only when the visitor picked it with the
// toggle (saved in localStorage "bb-theme"); the OS preference is ignored so
// the site always opens in its own look. The toggle button (#theme-toggle) is
// wired up once the DOM is ready.
(function () {
  var KEY = 'bb-theme';
  function saved() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function resolve() {
    var s = saved();
    return s === 'light' ? 'light' : 'dark';
  }
  function apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'light' ? '#E9CDBB' : '#0C161B');
    var btn = document.getElementById('theme-toggle');
    if (btn) {
      var label = theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode';
      btn.setAttribute('aria-label', label);
      btn.title = label;
    }
  }

  apply(resolve());

  // A page prerendered on hover may have been rendered before the visitor
  // toggled the theme; re-apply when it is actually shown.
  document.addEventListener('prerenderingchange', function () { apply(resolve()); });

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
