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

    document.addEventListener('bb:motion', function (e) {
      var d = (e.detail || {});
      if (reduce) return;
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

  // Constellation float. The hero's node graph drops in from above the panel
  // and never quite settles: gravity keeps it hopping on the floor, it rebounds
  // off the walls, squashes a little on each landing, and every few seconds it
  // takes a fresh hop so it stays lively instead of dying down. It treats the
  // graph as a circle so a rotating shape never pokes out. Stops off screen and
  // in background tabs; with reduced motion the graph stays where the
  // stylesheet puts it.
  var FLOAT_GRAVITY = 900;    // px/s^2, always on
  var FLOAT_BOUNCE = 0.72;    // energy kept per floor bounce
  var FLOAT_WALL = 0.86;      // energy kept per wall bounce
  var FLOAT_DRIFT = 44;       // px/s sideways it tries to keep
  var FLOAT_SPIN = 26;        // degrees per second
  var FLOAT_HOP = 430;        // px/s upward kick when it has gone quiet (about 100px high)
  var FLOAT_HOP_EVERY = 2.6;  // seconds between kicks, give or take

  function initConstellationFloat() {
    var svg = document.getElementById('constellation');
    var box = svg && svg.parentElement;
    if (!svg || !box || reduce || !('IntersectionObserver' in window)) return;

    var size = 0, x = 0, y = 0, vx = 0, vy = 0, angle = 0, spin = FLOAT_SPIN;
    var squash = 0, sinceHop = 0, falling = true;
    var raf = 0, last = 0, visible = false, ready = false;

    // Fit the viewBox to whatever the graph currently holds and size the
    // element from it: a seed of five nodes is small; a big constellation
    // grows, capped so it always has room to move.
    function fit() {
      var bb;
      try { bb = svg.getBBox(); } catch (e) { return false; }
      if (!bb || !bb.width) return false;
      var pad = 10, side = Math.max(bb.width, bb.height) + pad * 2;
      var cx = bb.x + bb.width / 2, cy = bb.y + bb.height / 2;
      svg.setAttribute('viewBox', (cx - side / 2) + ' ' + (cy - side / 2) + ' ' + side + ' ' + side);
      var panel = box.getBoundingClientRect();
      size = Math.round(Math.min(side * 1.55, panel.height * 0.62, panel.width * 0.45, 260));
      svg.style.width = svg.style.height = size + 'px';
      return true;
    }

    function bounds() {
      var r = box.getBoundingClientRect();
      // Circle of the rotated square, slightly forgiving at the corners.
      var rad = size * 0.62;
      return { minX: rad - size / 2, maxX: r.width - rad - size / 2, minY: rad - size / 2, maxY: r.height - rad - size / 2 };
    }

    function place() {
      // Squash on landing: wider and shorter, easing back to round.
      var sx = 1 + squash * 0.16, sy = 1 - squash * 0.14;
      svg.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) rotate(' + angle.toFixed(2) + 'deg) scale(' + sx.toFixed(3) + ',' + sy.toFixed(3) + ')';
    }

    function hop(strength) {
      vy = -(FLOAT_HOP * strength) * (0.8 + Math.random() * 0.4);
      // Nudge sideways too, favouring whichever way it is already going.
      var dir = vx >= 0 ? 1 : -1;
      vx = dir * (FLOAT_DRIFT * (0.7 + Math.random() * 0.6));
      sinceHop = 0;
    }

    function frame(now) {
      raf = 0;
      if (!visible) return;
      var dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
      last = now;
      var b = bounds();
      if (b.maxX < b.minX || b.maxY < b.minY) { raf = requestAnimationFrame(frame); return; }

      vy += FLOAT_GRAVITY * dt;
      x += vx * dt; y += vy * dt;

      if (x <= b.minX) { x = b.minX; vx = Math.abs(vx) * FLOAT_WALL; spin = -spin; squash = Math.max(squash, 0.5); }
      else if (x >= b.maxX) { x = b.maxX; vx = -Math.abs(vx) * FLOAT_WALL; spin = -spin; squash = Math.max(squash, 0.5); }
      if (!falling && y <= b.minY) { y = b.minY; vy = Math.abs(vy) * FLOAT_WALL; }
      if (y >= b.maxY) {
        y = b.maxY; falling = false;
        var hit = Math.abs(vy);
        vy = -hit * FLOAT_BOUNCE;
        squash = Math.min(1, hit / 520);
        // A floor bounce that has gone soft becomes a fresh hop.
        if (hit < 140) hop(0.6 + Math.random() * 0.4);
      }
      // Keep some sideways life, and take a hop now and then on its own.
      if (Math.abs(vx) < FLOAT_DRIFT * 0.4) vx += (vx >= 0 ? 1 : -1) * FLOAT_DRIFT * dt * 2;
      sinceHop += dt;
      if (sinceHop > FLOAT_HOP_EVERY + Math.random() * 1.5 && y > b.maxY - size * 0.3) hop(1);

      angle += spin * (1 + Math.min(1, Math.abs(vy) / 400)) * dt;
      squash = Math.max(0, squash - dt * 4);

      if (x < b.minX) x = b.minX; if (x > b.maxX) x = b.maxX;
      place();
      raf = requestAnimationFrame(frame);
    }

    function start() { if (!raf && visible && ready) { last = 0; raf = requestAnimationFrame(frame); } }
    function halt() { if (raf) cancelAnimationFrame(raf); raf = 0; }

    function launch() {
      if (!fit()) return;
      svg.classList.add('is-floating');
      var b = bounds();
      // Drop from above the panel, toward the right where the copy is thinner.
      x = b.minX + (b.maxX - b.minX) * (0.55 + Math.random() * 0.35);
      y = -size;
      vx = (Math.random() < 0.5 ? -1 : 1) * (FLOAT_DRIFT * (0.6 + Math.random() * 0.5));
      vy = 0;
      angle = Math.random() * 360;
      spin = (Math.random() < 0.5 ? -1 : 1) * FLOAT_SPIN;
      falling = true; squash = 0; sinceHop = 0;
      place();
      ready = true;
      start();
    }

    // renderConstellation() rewrites the SVG on every save or step; refit it
    // in place so a growing graph keeps moving without a restart.
    new MutationObserver(function () {
      if (!ready) { launch(); return; }
      fit();
      var b = bounds();
      x = Math.min(Math.max(x, b.minX), b.maxX);
      y = Math.min(Math.max(y, falling ? -size : b.minY), b.maxY);
    }).observe(svg, { childList: true });

    new IntersectionObserver(function (entries) {
      visible = entries.some(function (e) { return e.isIntersecting; });
      if (visible) start(); else halt();
    }, { threshold: 0.1 }).observe(box);
    document.addEventListener('visibilitychange', function () { if (document.hidden) halt(); else start(); });
    window.addEventListener('resize', function () { if (ready) fit(); });

    if (svg.childNodes.length) launch();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { init(); initTabGlide(); initConstellationFloat(); });
  else { init(); initTabGlide(); initConstellationFloat(); }
})();
