import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath, URL } from 'node:url';
import { readIndexProjects } from './projects.mjs';

const SITE = 'https://www.buildersbench.dev';
const DIST = fileURLToPath(new URL('../dist/', import.meta.url));
const PATHS = {
  ai: {
    name: 'AI Engineer',
    title: 'AI Engineering Portfolio Projects',
    description: 'Build AI engineering portfolio projects that demonstrate practical skills in agents, machine learning, and applied AI.',
    intro: 'Build hands-on AI engineering projects that show how you design, test, and ship useful AI systems. The guides include a project roadmap, recommended tools, and ways to explain your work to employers.',
    roles: ['AI Engineer', 'Machine Learning Engineer', 'Applied AI Engineer']
  },
  cloud: {
    name: 'Cloud Computing',
    title: 'Cloud Engineering Portfolio Projects',
    description: 'Build cloud engineering portfolio projects in AWS, Azure, serverless, DevOps, and platform engineering.',
    intro: 'Practice the cloud skills employers look for by building deployable projects in infrastructure, automation, observability, and platform engineering. Each guide helps you turn a hands-on build into something you can demonstrate.',
    roles: ['Cloud Engineer', 'DevOps Engineer', 'Platform Engineer']
  },
  cs: {
    name: 'Computer Science',
    title: 'Computer Science Portfolio Projects',
    description: 'Build computer science portfolio projects in systems, algorithms, compilers, and software engineering.',
    intro: 'Strengthen your computer science portfolio with projects that demonstrate problem solving, systems thinking, and software fundamentals. Follow each roadmap and document the decisions behind your implementation.',
    roles: ['Software Engineer', 'Systems Engineer', 'Research Engineer']
  },
  cyber: {
    name: 'Cybersecurity',
    title: 'Cybersecurity Portfolio Projects',
    description: 'Build cybersecurity portfolio projects in security operations, cloud defense, threat detection, and AI security.',
    intro: 'Develop practical cybersecurity experience in a safe lab environment. These project guides cover defensive security, detection, incident response, and security automation, with clear deliverables you can show in a portfolio.',
    roles: ['SOC Analyst', 'Security Engineer', 'Security Analyst']
  },
  data: {
    name: 'Data Analyst',
    title: 'Data Analytics Portfolio Projects',
    description: 'Build data analytics portfolio projects with SQL, Python, dashboards, business intelligence, and AI.',
    intro: 'Show how you turn raw data into clear findings. These projects help you practice SQL, Python, data visualization, and business intelligence while creating portfolio work you can explain to an employer.',
    roles: ['Data Analyst', 'BI Developer', 'Analytics Engineer']
  },
  helpdesk: {
    name: 'Help Desk',
    title: 'Help Desk and IT Support Portfolio Projects',
    description: 'Build entry-level help desk and IT support projects in troubleshooting, ticketing, endpoint tools, and automation.',
    intro: 'Build practical examples of the work behind help desk and technical support roles. Practice troubleshooting, user support, endpoint management, and automation, then document your process and results.',
    roles: ['Help Desk Technician', 'IT Support Specialist', 'Technical Support Analyst']
  },
  swe: {
    name: 'Software Engineer',
    title: 'Software Engineering Portfolio Projects',
    description: 'Build software engineering portfolio projects in full-stack development, APIs, databases, and production systems.',
    intro: 'Create software projects that demonstrate how you plan, build, test, and ship working applications. Explore full-stack, backend, and systems projects with roadmaps and portfolio-ready deliverables.',
    roles: ['Software Engineer', 'Full-Stack Developer', 'Backend Engineer']
  },
  'tech-it': {
    name: 'Tech / IT Support',
    title: 'IT Support Portfolio Projects',
    description: 'Build IT support portfolio projects in Microsoft 365, PowerShell, endpoint administration, and automation.',
    intro: 'Build projects that demonstrate day-to-day IT skills, from account administration and endpoint support to scripting and automation. Use the guides to create practical work samples for IT support and systems roles.',
    roles: ['IT Support Specialist', 'Systems Administrator', 'IT Automation Engineer']
  }
};

const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, ch => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[ch]);
const plain = value => String(value ?? '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
const shorten = (value, max) => {
  const text = plain(value);
  return text.length <= max ? text : text.slice(0, max - 1).replace(/\s+\S*$/, '') + '…';
};
const jsonLd = value => JSON.stringify(value).replace(/</g, '\\u003c');

function pageShell({ title, description, url, body, schema }) {
  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);
  const safeUrl = escapeHtml(url);
  return '<!doctype html>\n<html lang="en"><head>\n' +
    '<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">\n' +
    '<title>' + safeTitle + '</title><meta name="description" content="' + safeDescription + '">\n' +
    '<link rel="canonical" href="' + safeUrl + '">\n' +
    '<meta property="og:type" content="article"><meta property="og:site_name" content="BuildersBench">\n' +
    '<meta property="og:title" content="' + safeTitle + '"><meta property="og:description" content="' + safeDescription + '"><meta property="og:url" content="' + safeUrl + '">\n' +
    '<meta name="twitter:card" content="summary"><meta name="twitter:title" content="' + safeTitle + '"><meta name="twitter:description" content="' + safeDescription + '">\n' +
    '<meta name="theme-color" content="#0C161B"><link rel="stylesheet" href="/styles.css">\n' +
    '<script type="application/ld+json">' + jsonLd(schema) + '</script>\n' +
    '<style>.seo-page{max-width:900px;margin:0 auto;padding:36px 22px 80px;color:var(--ink,#E6F1F3)}.seo-page a{color:var(--green,#00FF85)}.seo-page .crumbs{font-size:13px;color:var(--ink-muted,#7A8A90);margin-bottom:24px}.seo-page h1{font-size:clamp(2rem,5vw,3.2rem);line-height:1.08;margin:10px 0 18px}.seo-page h2{font-size:1.35rem;margin:32px 0 10px}.seo-page p,.seo-page li{line-height:1.7;color:var(--ink-soft,#B7C5CB)}.seo-page .lead{font-size:1.15rem;max-width:72ch}.seo-page .chips{display:flex;flex-wrap:wrap;gap:8px;padding:0;list-style:none}.seo-page .chips li{border:1px solid var(--line,rgba(255,255,255,.14));border-radius:999px;padding:5px 10px;font-size:.85rem}.seo-page .roadmap li{margin:12px 0}.seo-page .project-list{display:grid;gap:12px;padding:0;list-style:none}.seo-page .project-list li{border:1px solid var(--line,rgba(255,255,255,.14));border-radius:12px;padding:16px;background:var(--glass,rgba(255,255,255,.04))}.seo-page .project-list a{text-decoration:none;font-weight:700}.seo-page .actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:28px}.seo-page .actions a{border:1px solid var(--line-3,rgba(0,255,133,.32));border-radius:999px;padding:10px 15px;text-decoration:none}.seo-page .muted{font-size:.9rem}.seo-page footer{border-top:1px solid var(--line,rgba(255,255,255,.14));margin-top:48px;padding-top:20px}</style>\n' +
    '</head><body><main class="seo-page">' + body + '</main></body></html>\n';
}

function breadcrumb(items) {
  return '<nav class="crumbs" aria-label="Breadcrumb">' + items.map((item, index) =>
    (index ? ' / ' : '') + (item.url ? '<a href="' + escapeHtml(item.url) + '">' + escapeHtml(item.name) + '</a>' : escapeHtml(item.name))
  ).join('') + '</nav>';
}

function breadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url || SITE
    }))
  };
}

function renderProject(project) {
  const path = PATHS[project.path];
  if (!path) return null;
  const url = SITE + '/projects/' + encodeURIComponent(project.id) + '/';
  const title = project.title + ' | BuildersBench';
  const description = shorten(project.summary + ' Build this ' + project.level + '-level tech portfolio project with a guided roadmap and showcase tips.', 158);
  const crumbs = [
    { name: 'Home', url: SITE + '/' },
    { name: path.name + ' Projects', url: SITE + '/paths/' + encodeURIComponent(project.path) + '/' },
    { name: project.title }
  ];
  const tech = Array.isArray(project.tech) ? project.tech : [];
  const steps = Array.isArray(project.steps) ? project.steps : [];
  const showcase = project.showcase || {};
  const body = breadcrumb(crumbs) +
    '<p class="muted">' + escapeHtml(path.name) + ' · ' + escapeHtml(project.level || 'Project') + '</p>' +
    '<h1>' + escapeHtml(project.title) + '</h1>' +
    '<p class="lead">' + escapeHtml(project.summary) + '</p>' +
    '<h2>Project overview</h2><p>' + escapeHtml(project.why || project.summary) + '</p>' +
    (project.useCase ? '<h2>Real-world use case</h2><p>' + escapeHtml(project.useCase) + '</p>' : '') +
    '<h2>Tools and technologies</h2><ul class="chips">' + tech.map(t => '<li>' + escapeHtml(t) + '</li>').join('') + '</ul>' +
    (project.skills ? '<h2>Skills you can demonstrate</h2><p>' + escapeHtml(project.skills) + '</p>' : '') +
    (steps.length ? '<h2>Build roadmap</h2><ol class="roadmap">' + steps.map(step => '<li><strong>' + escapeHtml(step.title) + '</strong><br>' + escapeHtml(step.desc) + '</li>').join('') + '</ol>' : '') +
    (project.bonus ? '<h2>Ways to extend the project</h2><p>' + escapeHtml(project.bonus) + '</p>' : '') +
    (Object.values(showcase).some(Boolean) ? '<h2>How to showcase your work</h2><ul>' +
      (showcase.github ? '<li><strong>GitHub:</strong> ' + escapeHtml(showcase.github) + '</li>' : '') +
      (showcase.linkedin ? '<li><strong>LinkedIn:</strong> ' + escapeHtml(showcase.linkedin) + '</li>' : '') +
      (showcase.resume ? '<li><strong>Resume:</strong> ' + escapeHtml(showcase.resume) + '</li>' : '') +
      '</ul>' : '') +
    '<div class="actions"><a href="' + SITE + '/#project=' + encodeURIComponent(project.id) + '">Open this project in BuildersBench</a><a href="' + SITE + '/paths/' + encodeURIComponent(project.path) + '/">Browse ' + escapeHtml(path.name) + ' projects</a></div>' +
    '<footer><a href="' + SITE + '/">← All BuildersBench projects</a></footer>';
  const schema = [
    { '@context': 'https://schema.org', '@type': 'WebPage', name: project.title, description, url, isPartOf: { '@type': 'WebSite', name: 'BuildersBench', url: SITE + '/' } },
    breadcrumbSchema(crumbs)
  ];
  return { url, path: 'projects/' + project.id + '/index.html', html: pageShell({ title, description, url, body, schema }) };
}

function renderPath(pathId, projects) {
  const path = PATHS[pathId];
  const url = SITE + '/paths/' + encodeURIComponent(pathId) + '/';
  const title = path.title + ' | BuildersBench';
  const description = shorten(path.description, 158);
  const crumbs = [{ name: 'Home', url: SITE + '/' }, { name: path.name + ' Projects' }];
  const body = breadcrumb(crumbs) +
    '<h1>' + escapeHtml(path.title) + '</h1>' +
    '<p class="lead">' + escapeHtml(path.intro) + '</p>' +
    '<h2>Career areas</h2><ul class="chips">' + path.roles.map(role => '<li>' + escapeHtml(role) + '</li>').join('') + '</ul>' +
    '<h2>Browse ' + escapeHtml(path.name) + ' projects</h2>' +
    '<ul class="project-list">' + projects.map(project =>
      '<li><a href="' + SITE + '/projects/' + encodeURIComponent(project.id) + '/">' + escapeHtml(project.title) + '</a>' +
      '<p>' + escapeHtml(project.summary) + '</p><p class="muted">Level: ' + escapeHtml(project.level) +
      (Array.isArray(project.tech) && project.tech.length ? ' · Tools: ' + escapeHtml(project.tech.slice(0, 4).join(', ')) : '') + '</p></li>'
    ).join('') + '</ul>' +
    '<div class="actions"><a href="' + SITE + '/">Browse all tech portfolio projects</a><a href="' + SITE + '/match.html">Match projects to a job</a></div>' +
    '<footer><a href="' + SITE + '/">← All BuildersBench projects</a></footer>';
  const schema = [
    { '@context': 'https://schema.org', '@type': 'CollectionPage', name: path.title, description, url, mainEntity: { '@type': 'ItemList', itemListElement: projects.map((project, index) => ({ '@type': 'ListItem', position: index + 1, name: project.title, url: SITE + '/projects/' + encodeURIComponent(project.id) + '/' })) } },
    breadcrumbSchema(crumbs)
  ];
  return { url, path: 'paths/' + pathId + '/index.html', html: pageShell({ title, description, url, body, schema }) };
}

export async function generateSeoPages() {
  const projects = readIndexProjects();
  const pages = [];
  for (const project of projects) {
    const page = renderProject(project);
    if (page) pages.push(page);
  }
  for (const pathId of Object.keys(PATHS)) {
    const page = renderPath(pathId, projects.filter(project => project.path === pathId));
    pages.push(page);
  }
  for (const page of pages) {
    const outputPath = new URL(page.path, 'file://' + DIST);
    await mkdir(new URL('.', outputPath), { recursive: true });
    await writeFile(outputPath, page.html, 'utf8');
  }
  const staticPages = [
    SITE + '/',
    SITE + '/certifications.html',
    SITE + '/prompts.html',
    SITE + '/match.html'
  ];
  const urls = [...staticPages, ...pages.map(page => page.url)];
  const sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map(url => '  <url><loc>' + escapeHtml(url) + '</loc></url>').join('\n') +
    '\n</urlset>\n';
  await writeFile(new URL('sitemap.xml', 'file://' + DIST), sitemap, 'utf8');
  await writeFile(new URL('robots.txt', 'file://' + DIST), 'User-agent: *\nAllow: /\nSitemap: ' + SITE + '/sitemap.xml\n', 'utf8');
}
