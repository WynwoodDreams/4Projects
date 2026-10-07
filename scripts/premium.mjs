// Build-time checks for the premium career-road data.
//
// The roads point at catalog projects by id and at YouTube videos by id.
// Neither is checked at runtime (the page just renders what it gets), so a
// typo would ship as a dead card. Both are validated here during `vite build`.

import { readIndexProjects } from './projects.mjs';
import { ROLES } from '../premium-data/roles.mjs';

export function validatePremium() {
  const errors = [];
  const catalog = new Set(readIndexProjects().map(p => p.id));
  const seen = new Set();

  for (const r of ROLES) {
    const where = `premium role "${r.id || '(missing id)'}"`;
    if (!r.id) errors.push('A premium role is missing an id.');
    else if (seen.has(r.id)) errors.push(`Duplicate premium role id: ${r.id}`);
    else seen.add(r.id);

    if (!['aws', 'general'].includes(r.track)) errors.push(`${where} needs track: 'aws' or 'general'.`);
    for (const key of ['title', 'summary', 'path']) {
      if (!r[key]) errors.push(`${where} has no ${key}.`);
    }
    if (!r.salary || !r.salary.range) errors.push(`${where} has no salary range.`);
    if (!Array.isArray(r.projects) || !r.projects.length) errors.push(`${where} lists no projects.`);
    for (const id of r.projects || []) {
      if (!catalog.has(id)) errors.push(`${where} points at project "${id}", which is not in the catalog.`);
    }
    for (const v of r.videos || []) {
      if (!v.id || v.id.length !== 11) errors.push(`${where} has a malformed video id: "${v.id}".`);
      if (!v.title) errors.push(`${where} has a video (${v.id}) with no title.`);
    }
    for (const list of ['certs', 'companies', 'resumeTips', 'linkedinTips']) {
      if (!Array.isArray(r[list]) || !r[list].length) errors.push(`${where} has an empty ${list} list.`);
    }
  }
  return errors;
}
