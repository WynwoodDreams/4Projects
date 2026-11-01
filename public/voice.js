// Talk instead of type. Shared by index.html (project search) and match.html (Career Match).
//
// A mic button next to a text field turns the browser's own speech recognition into text in
// that field. Nothing is submitted for the visitor: they see the words land, fix them if
// needed, and run the search or match themselves. The button always shows, so people can find
// it; where the browser has no speech recognition (Firefox, Chrome on iPhone, in-app
// browsers) a tap says so and suggests one that does. Typing always works.
//
// Markup: <button class="voice-mic" data-voice-for="FIELD_ID" data-voice-note="NOTE_ID"
//          [data-voice-keywords] [data-voice-done="what to do next"] hidden>…</button>
// data-voice-keywords keeps only the meaningful words, for a search that needs every word
// to match ("show me cloud projects with python" becomes "cloud python").
(function () {
  const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
  const UNSUPPORTED = 'Talking is not available in this browser. Open this page in Safari, Chrome or Edge, or type instead.';

  const FILLER = new Set(('a an and any are about can could do find for from get give help i i\'m im in is it ' +
    'like looking me my need of on or please project projects show some something that the to want with ' +
    'what which you build building learn learning would').split(' '));
  const keywords = text => text.toLowerCase().replace(/[^\p{L}\p{N}\s.+#-]/gu, ' ')
    .split(/\s+/).map(w => w.replace(/^[.-]+|[.-]+$/g, '')).filter(w => w && !FILLER.has(w)).join(' ');

  const WHY = {
    'not-allowed': 'The microphone is blocked. Allow it in your browser\'s site settings, or type instead.',
    'service-not-allowed': 'This browser will not turn speech into text here. Type instead.',
    'audio-capture': 'No microphone was found. Type instead.',
    'network': 'Voice needs an internet connection in this browser. Type instead.',
    'no-speech': 'Did not hear anything. Tap the mic and try again.',
    'language-not-supported': 'This browser cannot recognise that language. Type instead.'
  };
  const lang = () => /^es\b/i.test(navigator.language || '') ? 'es-US' : 'en-US';

  function attach(mic) {
    const field = document.getElementById(mic.dataset.voiceFor);
    const note = document.getElementById(mic.dataset.voiceNote);
    if (!field) return;
    const trim = 'voiceKeywords' in mic.dataset;
    const done = mic.dataset.voiceDone || 'Check the text, then search.';
    const max = field.maxLength > 0 ? field.maxLength : 4000;
    let rec = null, on = false, base = '', heard = '', failed = false;

    const say = (text, warn) => {
      if (!note) return;
      note.textContent = text || '';
      note.classList.toggle('warn', !!warn);
      note.hidden = !text;
    };
    const set = v => {
      on = v;
      mic.classList.toggle('on', v);
      mic.setAttribute('aria-pressed', String(v));
      mic.setAttribute('aria-label', v ? 'Stop listening' : 'Talk instead of typing');
    };
    const write = () => {
      const words = trim ? keywords(heard) : heard;
      const joined = base && words ? base.replace(/\s+$/, '') + ' ' + words : (base || words);
      field.value = joined.slice(0, max);
      // Let the page react as it does to typing (the project grid filters live).
      field.dispatchEvent(new Event('input', { bubbles: true }));
    };

    function start() {
      if (on || field.disabled) return;
      rec = new Rec();
      rec.lang = lang();
      rec.interimResults = true;
      rec.continuous = !trim;   // a search is a few words; a job description can run on
      base = field.value; heard = ''; failed = false;
      rec.onresult = e => {
        let text = '';
        for (let i = 0; i < e.results.length; i++) text += e.results[i][0].transcript;
        heard = text.trim();
        write();
      };
      rec.onerror = e => {
        if (e.error === 'aborted') return;
        failed = true;
        say(WHY[e.error] || 'Voice stopped. Type instead, or tap the mic to try again.', true);
      };
      rec.onend = () => {
        set(false); rec = null;
        if (heard && !failed) say(done);
        field.focus();
      };
      try { rec.start(); set(true); say('Listening… tap the mic again when you are done.'); }
      catch (_) { rec = null; set(false); say('Voice could not start. Type instead.', true); }
    }
    function stop() { if (rec) try { rec.stop(); } catch (_) { /* already stopped */ } }

    mic.hidden = false;
    mic.addEventListener('click', () => (!Rec ? say(UNSUPPORTED, true) : on ? stop() : start()));
    field.addEventListener('keydown', () => { if (!on) say(''); });
  }

  const run = () => document.querySelectorAll('.voice-mic[data-voice-for]').forEach(attach);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
