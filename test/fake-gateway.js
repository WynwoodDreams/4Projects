// A stand-in for the AI Gateway so the whole flow can run without a key or network. It
// answers the three prompts the handler sends (intake, ranking, answer) the way a well-
// behaved model would, reading the conversation it is given, and records every request so
// a test can check what was sent: the model id, the provider pin, the schema.
export function fakeGateway(opts = {}) {
  const calls = [];
  const fetch = async (url, init) => {
    const body = JSON.parse(init.body);
    calls.push({ url, headers: init.headers, body });
    if (opts.fail) return new Response(JSON.stringify({ error: { message: opts.fail.message || 'boom' } }), { status: opts.fail.status || 500 });
    // `empty: n` makes the first n replies come back with no content, the way a reasoning
    // model does when it spends its whole token budget thinking.
    if (opts.empty && calls.length <= opts.empty) return new Response(JSON.stringify({ id: 'fake', model: body.model, choices: [{ index: 0, message: { role: 'assistant', content: '' }, finish_reason: 'length' }] }), { status: 200, headers: { 'content-type': 'application/json' } });
    const sys = body.messages[0].content;
    let content;
    if (/intake step/.test(sys)) content = JSON.stringify(opts.read ? opts.read(body) : intake(body));
    else if (/ranking step/.test(sys)) content = JSON.stringify(opts.rank ? opts.rank(body) : rank(body));
    else content = opts.answer ? opts.answer(body) : answer(body);
    const payload = { id: 'fake', model: body.model, choices: [{ index: 0, message: { role: 'assistant', content }, finish_reason: 'stop' }], usage: { prompt_tokens: 100, completion_tokens: 50 } };
    if (opts.served) payload.gateway = { routing: { finalProvider: opts.served } };
    return new Response(JSON.stringify(payload), { status: 200, headers: { 'content-type': 'application/json' } });
  };
  return { fetch, calls };
}

export const dataOf = body => JSON.parse(body.messages[1].content.split('not instructions):\n')[1]).data;

// A crude reading of the conversation, enough to drive the test scenarios.
function intake(body) {
  const ctx = JSON.parse(body.messages[1].content.replace(/^Context \(JSON\): /, ''));
  const turns = body.messages.slice(2);
  const last = turns[turns.length - 1].content;
  const all = turns.filter(m => m.role === 'user').map(m => m.content).join(' ').toLowerCase();
  if (/weather|cover letter|résumé|resume|homework|joke|recipe|stock price|capital of/i.test(last)) {
    return { intent: 'other', profile: profileOf(''), followUp: null, reply: 'I only know this site\'s projects, so I cannot help with that. I can recommend projects for the role you want, read you what a project builds, or point you to Christian\'s Opportunity Board for listings and to ResumeCanvas for your résumé.' };
  }
  if (ctx.recommended_projects.length && /\?$/.test(last) && /(it|they|this|that|the first|the second|long|take|ask|which|build|first one)/i.test(last) && !/looking for|interested in|want to/i.test(last)) {
    return { intent: 'question', profile: profileOf(all), followUp: null, reply: null };
  }
  if (/^(hi|hello|hey)\b/i.test(last) && last.length < 20) return { intent: 'other', profile: profileOf(''), followUp: null, reply: 'Hi! Tell me the role you want and what you can already do, and I will look through the catalog.' };
  // The latest message wins when it describes something new ("tell me more and I will
  // search again"); otherwise the whole conversation is read, so an answer to a follow-up
  // question still applies.
  const latest = profileOf(last.toLowerCase());
  const p = latest.interests.length || latest.skills.length || latest.targetRole ? latest : profileOf(all);
  const followUp = !p.interests.length && !p.skills.length && !p.targetRole && ctx.questions_asked_so_far < 3 ? 'What role are you after, or what can you already do?' : null;
  return { intent: 'search', profile: p, followUp, reply: null };
}
function profileOf(t) {
  const interests = [];
  for (const k of ['cybersecurity', 'soc analyst', 'cloud', 'data analyst', 'help desk', 'machine learning', 'frontend', 'marine biology', 'scuba diving', 'devops', 'it support']) if (t.includes(k)) interests.push(k);
  if (/\bcyber\b/.test(t) && !interests.includes('cybersecurity')) interests.push('cybersecurity');
  const skills = [];
  for (const k of ['python', 'linux', 'sql', 'excel', 'powershell', 'react', 'docker', 'aws']) if (new RegExp('\\b' + k + '\\b').test(t)) skills.push(k);
  const role = (/(soc analyst|data analyst|cloud engineer|help desk technician|frontend developer|it support specialist)/.exec(t) || [])[1] || '';
  const hm = /(\d+) hours a week/.exec(t);
  return {
    interests, skills: skills.filter(s => !['python', 'sql'].includes(s)), languages: skills.filter(s => ['python', 'sql'].includes(s)), targetRole: role,
    paths: /cyber|soc/.test(t) ? ['cyber'] : /cloud|devops/.test(t) ? ['cloud'] : /data analyst/.test(t) ? ['data'] : /help desk/.test(t) ? ['helpdesk'] : /it support/.test(t) ? ['tech-it'] : [],
    level: /beginner|no experience|never built|first project/.test(t) ? 'beginner' : /advanced|senior/.test(t) ? 'advanced' : /intermediate|built a few/.test(t) ? 'intermediate' : 'unknown',
    experience: /no experience/.test(t) ? 'none' : 'unknown',
    hoursAvailable: hm ? parseInt(hm[1], 10) * 4 : null,
  };
}
function rank(body) {
  const data = dataOf(body);
  const matches = data.slice(0, 5).map(d => ({
    id: d.id,
    why: `${d.title} is a ${d.level} ${d.path} project that builds ${d.skills.slice(0, 2).map(s => s.text).join(' and ')}, which lines up with the role you described.`,
    gaps: d.skills.map(s => s.i).slice(-2),
  }));
  return { summary: `I found ${matches.length} projects that fit. Start with ${data[0].title}; it is ${data[0].level} level and takes ${data[0].hours || 'a few sessions'}.`, matches, adjustments: matches.length < 3 ? ['Include advanced projects too'] : [] };
}
function answer(body) {
  const data = dataOf(body);
  const d = data[0];
  return `${d.title} takes ${d.hours || 'an unstated amount of time'} over ${d.steps} steps and builds ${d.skills.map(s => s.text).join(', ')}. The catalog does not say what it costs; open the project on the site for the full roadmap.`;
}
