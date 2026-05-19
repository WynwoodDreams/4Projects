import { inject, track } from '@vercel/analytics';

inject();

window.bbTrack = (name, props) => {
  try { track(name, props); } catch (e) { /* analytics may be blocked */ }
};
