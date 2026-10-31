// Phase-one motion. Pure DOM and CSS classes, no library. Everything here is
// decoration on top of behaviour that already works without it, so it must
// never block, never throw, and must stand still when the visitor asks for
// reduced motion.
//
// Blink is the site's cursor character: the block cursor at the end of every
// page's headline. It types the headline once per session, leans toward the
// search box when "/" is pressed, nods when a roadmap step is ticked, jumps
// when a project is completed, and "thinks" while the matcher runs. Page
// scripts tell it what happened by dispatching:
//
//   document.dispatchEvent(new CustomEvent('bb:motion', { detail: { type, ... } }))
//
// with type one of: step-done {index}, project-done, thinking, results.
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function makeBlink() {
    var h1 = document.querySelector('.hero h1');
    if (!h1 || h1.querySelector('.blink')) return null;
    var b = document.createElement('span');
    b.className = 'blink';
    b.setAttribute('aria-hidden', 'true');
    h1.classList.add('has-blink');
    h1.appendChild(b);
    return b;
  }

  // Set a state class for a moment, then clear it. Re-triggering restarts it.
  function pulse(el, cls, ms) {
    if (!el) return;
    el.classList.remove(cls);
    void el.offsetWidth; // restart the CSS animation
    el.classList.add(cls);
    clearTimeout(el['__t_' + cls]);
    el['__t_' + cls] = setTimeout(function () { el.classList.remove(cls); }, ms);
  }

  // Type the headline word by word with Blink riding the end of the text.
  // Once per tab session, under half a second, and never with reduced motion.
  function typeHeadline(h1, blink) {
    var key = 'bb-typed:' + location.pathname;
    try { if (sessionStorage.getItem(key)) return; sessionStorage.setItem(key, '1'); } catch (e) { return; }

    var words = [];
    var walker = document.createTreeWalker(h1, NodeFilter.SHOW_TEXT);
    var textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    textNodes.forEach(function (node) {
      if (node.parentNode === blink) return;
      var parts = node.nodeValue.split(/(\s+)/);
      var frag = document.createDocumentFragment();
      parts.forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
        var w = document.createElement('span');
        w.className = 'type-w';
        w.textContent = part;
        frag.appendChild(w);
        words.push(w);
      });
      node.parentNode.replaceChild(frag, node);
    });
    if (!words.length) return;

    var per = Math.min(46, Math.floor(440 / words.length));
    h1.classList.add('is-typing');
    words.forEach(function (w, i) {
      setTimeout(function () {
        w.classList.add('is-on');
        // Blink follows the last word, then returns to the end of the line.
        w.insertAdjacentElement('afterend', blink);
        if (i === words.length - 1) {
          h1.appendChild(blink);
          h1.classList.remove('is-typing');
          h1.classList.add('typed');
        }
      }, per * (i + 1));
    });
  }

  function isTypingTarget(el) {
    return el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
  }

  function init() {
    var blink = makeBlink();
    if (!blink) return;
    if (!reduce) typeHeadline(document.querySelector('.hero h1'), blink);

    // "/" focuses search on the home page; Blink leans toward it.
    // Capture phase: the page's own "/" handler focuses the search box, and
    // Blink must decide before that happens.
    document.addEventListener('keydown', function (e) {
      if (e.key === '/' && !isTypingTarget(document.activeElement) && !reduce) pulse(blink, 'blink-lean', 520);
    }, true);

    // Vertex, the logo creature: a mood on <html> for a moment.
    var html = document.documentElement, vertexTimer;
    function vertex(mood, ms) {
      clearTimeout(vertexTimer);
      html.removeAttribute('data-vertex');
      void html.offsetWidth;
      html.setAttribute('data-vertex', mood);
      if (ms) vertexTimer = setTimeout(function () { if (html.getAttribute('data-vertex') === mood) html.removeAttribute('data-vertex'); }, ms);
    }

    document.addEventListener('bb:motion', function (e) {
      var d = (e.detail || {});
      if (reduce) return;
      if (d.type === 'step-done') vertex('nod', 600);
      else if (d.type === 'project-done') vertex('celebrate', 1000);
      else if (d.type === 'thinking') vertex('think');
      else if (d.type === 'results') vertex('nod', 600);
      if (d.type === 'step-done') {
        pulse(blink, 'blink-nod', 600);
        // The roadmap re-renders synchronously after the event; charge the
        // step on the next frame so the class lands on the new node.
        requestAnimationFrame(function () {
          var step = document.querySelector('.build-step[data-step="' + d.index + '"]');
          if (step) pulse(step, 'is-charged', 900);
        });
      } else if (d.type === 'project-done') {
        pulse(blink, 'blink-jump', 900);
        requestAnimationFrame(function () {
          var badge = document.querySelector('.modal-status-badge.status-done');
          if (badge) pulse(badge, 'is-lit', 1400);
          var card = d.id && document.querySelector('.project-card[data-id="' + d.id + '"]');
          if (card) pulse(card, 'is-lit', 1400);
        });
      } else if (d.type === 'thinking') {
        blink.classList.add('blink-think');
      } else if (d.type === 'results') {
        blink.classList.remove('blink-think');
        pulse(blink, 'blink-nod', 600);
      }
    });
  }

  // Path tab glide. When the career-path row first comes into view and it is
  // wider than the screen (phones and narrow windows), it drifts slowly left
  // to right to show every path, pauses at the end, eases back to where it
  // started, and stops for good. Once per tab session. Any touch, wheel,
  // click, or key on the row stops it on the spot and leaves it where it is.
  function initTabGlide() {
    var row = document.getElementById('path-tabs');
    if (!row || reduce || !('IntersectionObserver' in window)) return;
    try { if (sessionStorage.getItem('bb-tabglide')) return; } catch (e) { return; }

    var raf = 0, stopped = false;
    function stop() {
      stopped = true;
      cancelAnimationFrame(raf);
      row.classList.remove('is-gliding');
      ['pointerdown', 'touchstart', 'wheel', 'keydown'].forEach(function (t) { row.removeEventListener(t, stop); });
    }
    ['pointerdown', 'touchstart', 'wheel', 'keydown'].forEach(function (t) { row.addEventListener(t, stop, { passive: true }); });

    function tween(from, to, ms, done) {
      var start = performance.now();
      var ease = function (t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };
      (function frame(now) {
        if (stopped) return;
        var t = Math.min(1, (now - start) / ms);
        row.scrollLeft = from + (to - from) * ease(t);
        if (t < 1) raf = requestAnimationFrame(frame);
        else if (done) done();
      })(start);
    }

    var io = new IntersectionObserver(function (entries) {
      if (!entries.some(function (e) { return e.isIntersecting; })) return;
      io.disconnect();
      var max = row.scrollWidth - row.clientWidth;
      if (max < 24) return stop(); // everything already fits
      try { sessionStorage.setItem('bb-tabglide', '1'); } catch (e) {}
      var home = row.scrollLeft;
      setTimeout(function () {
        if (stopped) return;
        row.classList.add('is-gliding');
        // About 7ms per pixel: slow enough to read each tab, capped at 6s.
        var out = Math.max(2400, Math.min(6000, (max - home) * 7));
        tween(home, max, out, function () {
          setTimeout(function () {
            if (stopped) return;
            tween(max, home, 900, stop);
          }, 900);
        });
      }, 450);
    }, { threshold: 0.75 });
    io.observe(row);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { init(); initTabGlide(); });
  else { init(); initTabGlide(); }
})();
