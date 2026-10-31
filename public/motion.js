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

  // Path tab stroll. When the career-path row is wider than the screen
  // (phones and narrow windows), it drifts slowly back and forth for as long
  // as it is on screen: left to right, a short rest at the end, then back.
  // A tap on the row pauses it; another tap resumes it. A swipe still scrolls
  // the row by hand, and the stroll picks up from wherever it was left.
  // Off screen it idles; with reduced motion it never moves.
  var STROLL_SPEED = 55;   // pixels per second
  var STROLL_REST = 1400;  // ms paused at each end
  var STROLL_RAMP = 700;   // ms to ease up to speed after a rest or a resume

  function initTabGlide() {
    var row = document.getElementById('path-tabs');
    if (!row || reduce || !('IntersectionObserver' in window)) return;

    var pos = row.scrollLeft, dir = 1, raf = 0, last = 0;
    var visible = false, paused = false, holding = false;
    var restUntil = 0, rampFrom = 0, written = -1, settleUntil = 0;

    function max() { return row.scrollWidth - row.clientWidth; }

    function frame(now) {
      raf = 0;
      if (!visible || paused) return;
      var dt = last ? Math.min(64, now - last) : 16;
      last = now;
      var m = max();
      if (m < 24) return; // everything fits: nothing to show
      raf = requestAnimationFrame(frame);

      // Someone else moved the row (a swipe, momentum, a wheel): adopt their
      // position and let it settle before moving again.
      if (written >= 0 && Math.abs(row.scrollLeft - written) > 2) {
        pos = row.scrollLeft;
        settleUntil = now + 900;
        rampFrom = settleUntil;
      }
      if (holding || now < settleUntil || now < restUntil) { written = row.scrollLeft; return; }

      var ramp = Math.max(0, Math.min(1, (now - rampFrom) / STROLL_RAMP));
      ramp = ramp * ramp * (3 - 2 * ramp); // smoothstep
      pos += dir * STROLL_SPEED * ramp * dt / 1000;
      if (pos >= m) { pos = m; dir = -1; restUntil = now + STROLL_REST; rampFrom = restUntil; }
      else if (pos <= 0) { pos = 0; dir = 1; restUntil = now + STROLL_REST; rampFrom = restUntil; }
      row.scrollLeft = pos;
      written = row.scrollLeft;
    }

    function start() {
      if (raf || !visible || paused) return;
      last = 0;
      pos = row.scrollLeft;
      written = -1;
      rampFrom = performance.now();
      raf = requestAnimationFrame(frame);
    }
    function halt() { if (raf) cancelAnimationFrame(raf); raf = 0; }

    // Tap toggles; a drag is a manual scroll, not a tap.
    var downX = 0, downY = 0, downT = 0, moved = false;
    row.addEventListener('pointerdown', function (e) {
      downX = e.clientX; downY = e.clientY; downT = performance.now(); moved = false; holding = true;
    }, { passive: true });
    row.addEventListener('pointermove', function (e) {
      if (holding && (Math.abs(e.clientX - downX) > 8 || Math.abs(e.clientY - downY) > 8)) moved = true;
    }, { passive: true });
    row.addEventListener('pointercancel', function () { holding = false; moved = true; }, { passive: true });
    row.addEventListener('pointerup', function () {
      holding = false;
      if (moved || performance.now() - downT > 500) return;
      paused = !paused;
      row.classList.toggle('is-paused', paused);
      if (paused) halt(); else start();
    }, { passive: true });

    // Keyboard users get a still row while they are tabbing through it.
    row.addEventListener('focusin', function (e) { if (e.target.matches(':focus-visible')) { paused = true; halt(); } });
    row.addEventListener('focusout', function () {
      if (row.classList.contains('is-paused')) return;
      paused = false; start();
    });

    new IntersectionObserver(function (entries) {
      visible = entries.some(function (e) { return e.isIntersecting; });
      if (visible) start(); else halt();
    }, { threshold: 0.5 }).observe(row);

    document.addEventListener('visibilitychange', function () { if (document.hidden) halt(); else start(); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { init(); initTabGlide(); });
  else { init(); initTabGlide(); }
})();
