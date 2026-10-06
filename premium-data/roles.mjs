// Premium career-road data. Served only through /api/premium-data after a
// valid sign-in; never shipped as a static file.
//
// Each role is one road. Keep entries short: the page renders them as a
// vertical road with one stop per section. `projects` are catalog ids from
// index.html, and the page deep-links them with #project=<id>. `videos` are
// YouTube ids; scripts/check-videos.mjs verifies they still embed. Workshop
// and research material goes in `materials` as links (title, kind, url).
//
// Salary bands are Florida early-career base pay (0 to 2 years), rounded
// from 2026 postings and the Oct 2026 refresh of the catalog's national
// bands, which run roughly 5 to 10 percent higher than Florida.

export const UPDATED = '2026-10';

export const ROLES = [
  {
    id: 'junior-cloud',
    title: 'Junior Cloud Engineer',
    path: 'cloud',
    aliases: ['junior cloud', 'cloud engineer', 'cloud support', 'associate cloud', 'cloud associate', 'devops intern', 'junior devops', 'cloud intern', 'aws'],
    summary: 'Entry cloud roles in Florida are mostly support and operations: keeping AWS or Azure accounts healthy, automating the boring parts, and learning the cost side early.',
    salary: { range: '$68k – $95k', note: 'Florida base, 0 to 2 years. Tampa and Jacksonville finance and healthcare employers pay the top of the band.' },
    projects: ['cl-4', 'cl-5', 'it-5', 'cl-3'],
    certs: [
      { name: 'AWS Certified Cloud Practitioner', org: 'AWS', why: 'The screen-out cert. Most Florida postings for junior cloud list it as preferred and it is the fastest one to earn.' },
      { name: 'AWS Solutions Architect Associate', org: 'AWS', why: 'The one that moves you from support into engineering interviews. Pair it with a Terraform project.' },
      { name: 'Microsoft AZ-900 then AZ-104', org: 'Microsoft', why: 'Florida enterprise and government shops run Azure. AZ-104 is what their job posts actually ask for.' },
      { name: 'HashiCorp Terraform Associate', org: 'HashiCorp', why: 'Infrastructure as code is the skill that separates a cloud engineer from a cloud clicker.' }
    ],
    companies: [
      { name: 'Citi', city: 'Tampa', note: 'Large cloud migration teams; hires associates through its early-career program.' },
      { name: 'JPMorgan Chase', city: 'Tampa', note: 'Cloud platform and SRE roles on the Westshore campus.' },
      { name: 'FIS', city: 'Jacksonville', note: 'Fintech with ongoing AWS and Azure work; posts cloud associate roles often.' },
      { name: 'Florida Blue', city: 'Jacksonville', note: 'Healthcare payer with a large Azure estate.' },
      { name: 'Raymond James', city: 'St. Petersburg', note: 'Financial services; cloud operations and infrastructure engineering.' },
      { name: 'Kaseya', city: 'Miami', note: 'IT management software; cloud operations and support engineering at scale.' },
      { name: 'Chewy', city: 'Plantation', note: 'E-commerce platform engineering on AWS.' },
      { name: 'L3Harris', city: 'Melbourne', note: 'Defense; cloud and DevOps roles, many require clearance eligibility.' }
    ],
    resumeTips: [
      'Lead with a Projects section above Experience if you have under a year in the field. Name the services: "EC2, S3, IAM, Terraform", not "AWS".',
      'Put one cost number on the page. "Cut a lab environment bill from $42 to $9 a month with scheduled shutdowns" reads like a cloud engineer.',
      'List certifications with the date earned. An in-progress cert goes as "AWS SAA, exam scheduled Nov 2026", never just "in progress".',
      'Mirror the posting\'s vocabulary: if it says "infrastructure as code", your bullet says "infrastructure as code", not "automation scripts".'
    ],
    linkedinTips: [
      'Headline: "Cloud Engineer | AWS Cloud Practitioner | Terraform, Linux, Python" beats "Aspiring Cloud Engineer". Recruiters search titles, not aspirations.',
      'Post the architecture diagram from one project with three lines on a decision you made and why. One post like that outperforms ten reposts.',
      'Follow and comment on the Tampa Bay and South Florida AWS user group pages; local recruiters watch who shows up there.',
      'Turn on Open to Work for recruiters only, with Tampa, Jacksonville, Orlando, and Miami as locations plus Remote.'
    ],
    videos: [
      { id: "c2SDG5EdgGo", title: "Cloud Engineer Interview - How to answer scenario based questions" }
    ],
    materials: []
  },
  {
    id: 'junior-ai',
    title: 'Junior AI Engineer',
    path: 'ai',
    aliases: ['junior ai', 'ai engineer', 'ml engineer', 'machine learning', 'llm engineer', 'ai developer', 'applied ai', 'genai', 'generative ai'],
    summary: 'Florida AI roles for early-career candidates are mostly applied: building on top of hosted models, wiring retrieval and tools, and proving the thing works with evals.',
    salary: { range: '$85k – $125k', note: 'Florida base, 0 to 2 years. Research-flavored roles are rare here; applied LLM work is where the postings are.' },
    projects: ['ai-5', 'ai-2', 'ai-7', 'ai-6'],
    certs: [
      { name: 'AWS Certified AI Practitioner', org: 'AWS', why: 'Cheap signal that you know the hosted-model landscape. Shows up in Florida enterprise postings more than any other AI cert.' },
      { name: 'Anthropic Academy: Claude Platform 101 and Intro to MCP', org: 'Anthropic', why: 'Free, and MCP is the tool layer every agent framework now uses. Finish the course, then ship the MCP project.' },
      { name: 'Microsoft AI-900 then AI-102', org: 'Microsoft', why: 'Azure OpenAI is the default for Florida healthcare and government. AI-102 is the one they list.' },
      { name: 'DeepLearning.AI short courses', org: 'DeepLearning.AI', why: 'Not a cert, but the RAG and evaluation courses are what interviewers expect you to have internalized.' }
    ],
    companies: [
      { name: 'Kaseya', city: 'Miami', note: 'AI features across its IT platform; hires applied AI engineers.' },
      { name: 'Chewy', city: 'Plantation', note: 'Recommendation, search, and customer-service AI.' },
      { name: 'Carnival Corporation', city: 'Miami', note: 'Guest-experience and operations AI programs.' },
      { name: 'NextEra Energy', city: 'Juno Beach', note: 'Forecasting and operations ML; strong internship pipeline.' },
      { name: 'Citi', city: 'Tampa', note: 'Enterprise GenAI platform teams.' },
      { name: 'Jabil', city: 'St. Petersburg', note: 'Manufacturing AI and computer vision.' },
      { name: 'ReliaQuest', city: 'Tampa', note: 'Security AI; agentic detection and triage.' },
      { name: 'Magic Leap', city: 'Plantation', note: 'Perception and on-device ML for AR.' }
    ],
    resumeTips: [
      'Every AI bullet needs an evaluation number. "Built a RAG assistant" is a hobby; "RAG assistant scoring 87 percent on a 120-question eval set" is a job.',
      'Name the models and the reason: "Claude Haiku for routing, Claude Sonnet for drafting, chosen by cost per resolved ticket".',
      'Put a link to a live demo or a two-minute video in the header. AI résumés without a demo link get skipped.',
      'Keep classical ML on the page too (scikit-learn, a baseline, a confusion matrix). Florida employers still hire for it.'
    ],
    linkedinTips: [
      'Headline with the stack: "AI Engineer | LLM apps, RAG, evals | Python, FastAPI, Claude API".',
      'Post one eval result with the chart. Numbers travel further than demos on LinkedIn.',
      'Write a short post explaining one failure you fixed (a hallucination, a bad retrieval). It signals judgment, which is what juniors lack on paper.',
      'Join the Miami and Tampa AI meetup groups and tag them when you post a project; organizers reshare members\' work.'
    ],
    videos: [
      { id: "XRQ6YTdU0fU", title: "How I Interview AI Engineers (And the Projects That'd Impress Me)" },
      { id: "leXRiJ5TuQo", title: "AI Engineer Interview Questions (From Senior AI Engineer)" }
    ],
    materials: []
  },
  {
    id: 'junior-data-analyst',
    title: 'Junior Data Analyst',
    path: 'data',
    aliases: ['junior data', 'data analyst', 'business analyst', 'bi analyst', 'reporting analyst', 'analytics', 'sql analyst', 'data intern'],
    summary: 'Florida analyst roles sit inside healthcare, logistics, hospitality, and finance. SQL plus one BI tool gets the interview; a dashboard that answers a business question gets the offer.',
    salary: { range: '$55k – $75k', note: 'Florida base, 0 to 2 years. Analytics engineer titles with dbt or Python start closer to $80k.' },
    projects: ['da-1', 'da-4', 'da-6', 'da-5'],
    certs: [
      { name: 'Microsoft PL-300 (Power BI Data Analyst)', org: 'Microsoft', why: 'Power BI dominates Florida corporate reporting. PL-300 is the cert that appears in postings by name.' },
      { name: 'Google Data Analytics Professional Certificate', org: 'Google', why: 'Free to audit, recognized by HR screens, and gives you a capstone to show.' },
      { name: 'Tableau Desktop Specialist', org: 'Tableau', why: 'Second most requested tool here, especially in hospitality and healthcare.' },
      { name: 'dbt Fundamentals', org: 'dbt Labs', why: 'Free, and the bridge to analytics engineer titles that pay more.' }
    ],
    companies: [
      { name: 'Publix', city: 'Lakeland', note: 'Large analytics org across retail, pharmacy, and supply chain.' },
      { name: 'Florida Blue', city: 'Jacksonville', note: 'Healthcare analytics; many analyst I and II postings.' },
      { name: 'Ryder', city: 'Miami', note: 'Logistics and fleet analytics.' },
      { name: 'Royal Caribbean Group', city: 'Miami', note: 'Revenue management and guest analytics.' },
      { name: 'Disney', city: 'Orlando', note: 'Parks analytics; competitive but hires analysts steadily.' },
      { name: 'Baptist Health South Florida', city: 'Coral Gables', note: 'Clinical and operations reporting; Epic and Power BI.' },
      { name: 'Raymond James', city: 'St. Petersburg', note: 'Finance analytics and reporting.' },
      { name: 'Miami-Dade County', city: 'Miami', note: 'Public sector analyst roles with stable hiring.' }
    ],
    resumeTips: [
      'Write bullets as question, method, answer: "Which stores lose margin on delivery? Joined POS and routing data in SQL; found 11 stores driving 40 percent of loss."',
      'List tools in order of job-post frequency: SQL, Excel, Power BI or Tableau, Python. Do not bury SQL under Python.',
      'Link the dashboard. A public Power BI or Tableau Public link is the whole portfolio for this role.',
      'Include one data-cleaning bullet. Every analyst interview asks about messy data; put the answer on the page first.'
    ],
    linkedinTips: [
      'Headline: "Data Analyst | SQL, Power BI, Python | Healthcare and operations analytics".',
      'Post a single chart with a one-sentence insight once a week. Analysts who post charts get messaged by recruiters who need charts.',
      'Add the Tableau Public or GitHub link in the Featured section, not buried in About.',
      'Follow Florida hospital systems and logistics companies; their analysts post openings before the job boards do.'
    ],
    videos: [
      { id: "92zO28a1UDo", title: "10 Data Analyst Interview Questions and Answers - Senior Data Analyst Explains" },
      { id: "tOMkejm15dM", title: "My Real Data Analyst Interview Questions & Answers" }
    ],
    materials: []
  },
  {
    id: 'soc-analyst',
    title: 'SOC Analyst (Tier 1)',
    path: 'cyber',
    aliases: ['soc analyst', 'security analyst', 'cyber analyst', 'cybersecurity analyst', 'tier 1', 'security operations', 'junior security', 'information security analyst', 'cyber'],
    summary: 'Tampa is one of the biggest SOC hiring markets in the country. Entry roles want alert triage, log reading, and calm written communication, usually on a shift schedule.',
    salary: { range: '$58k – $82k', note: 'Florida base, 0 to 2 years. Cleared roles near MacDill and the Space Coast pay $10k to $20k more.' },
    projects: ['cy-5', 'cy-4', 'cy-9', 'it-3'],
    certs: [
      { name: 'CompTIA Security+', org: 'CompTIA', why: 'The baseline for every SOC posting in Florida and a hard requirement for any DoD-adjacent role.' },
      { name: 'CompTIA CySA+', org: 'CompTIA', why: 'The analyst-specific follow-on; signals you can work alerts, not just define terms.' },
      { name: 'Google Cybersecurity Professional Certificate', org: 'Google', why: 'Free to audit with hands-on labs; useful before Security+ if you are starting from zero.' },
      { name: 'Splunk Core Certified User', org: 'Splunk', why: 'Florida SOCs run Splunk or Sentinel. Being able to write a search on day one is the thing they test.' }
    ],
    companies: [
      { name: 'ReliaQuest', city: 'Tampa', note: 'Managed detection and response; the largest SOC employer in the state, hires analysts in cohorts.' },
      { name: 'KnowBe4', city: 'Clearwater', note: 'Security awareness vendor with an internal SOC and security engineering.' },
      { name: 'Citi', city: 'Tampa', note: 'Global cyber fusion center on the Tampa campus.' },
      { name: 'JPMorgan Chase', city: 'Tampa', note: 'Cybersecurity operations and threat intel.' },
      { name: 'Raymond James', city: 'St. Petersburg', note: 'In-house SOC and security engineering.' },
      { name: 'L3Harris', city: 'Melbourne', note: 'Defense SOC roles; clearance a plus.' },
      { name: 'Lockheed Martin', city: 'Orlando', note: 'Cyber operations; many roles require clearance eligibility.' },
      { name: 'Florida Blue', city: 'Jacksonville', note: 'Healthcare security operations.' }
    ],
    resumeTips: [
      'Describe your home lab like a job: "Operated a Wazuh SIEM with Sysmon telemetry; wrote 5 detections mapped to MITRE ATT&CK; validated with Atomic Red Team."',
      'Put Security+ at the top with the date. Without it, many applicant tracking systems filter you out before a human looks.',
      'Add one incident write-up link. A two-page report on a simulated incident shows the written communication the job is really about.',
      'State shift flexibility plainly: "Available for nights and weekends" removes the first objection on a Tier 1 screen.'
    ],
    linkedinTips: [
      'Headline: "SOC Analyst | Security+ | SIEM, detection engineering, incident triage".',
      'Post a detection you wrote, the technique it catches, and the false positives you tuned out. That is a Tier 1 interview answer in public.',
      'Follow ReliaQuest, KnowBe4, and the Tampa Bay ISSA chapter; comment on their posts so the names become familiar to their recruiters.',
      'List your lab as an Experience entry titled "Home SOC Lab (self-directed)" with dates, so it appears in recruiter searches.'
    ],
    videos: [
      { id: "IS_9jho53rs", title: "SOC Analyst Interview Questions And Answers - 5 Entry Level SOC Analyst Interview Questions" },
      { id: "CmNLiCWJ0iE", title: "Top 20 SOC Analyst Tier 1 Interview Questions and Answers" }
    ],
    materials: []
  },
  {
    id: 'help-desk',
    title: 'Help Desk Technician',
    path: 'helpdesk',
    aliases: ['help desk', 'helpdesk', 'service desk', 'tier 1 support', 'desktop support', 'technical support', 'support technician', 'it support'],
    summary: 'The front door to IT in Florida. Employers hire for calm troubleshooting, ticket hygiene, and Microsoft 365 skills, then promote the people who automate their own job.',
    salary: { range: '$40k – $55k', note: 'Florida base, 0 to 2 years. Hospital systems and universities pay above the band and offer tuition help.' },
    projects: ['hd-1', 'hd-8', 'hd-4', 'hd-2'],
    certs: [
      { name: 'CompTIA A+', org: 'CompTIA', why: 'Still the cert on the most Florida help desk postings. Hardware, OS, and troubleshooting method in one.' },
      { name: 'Google IT Support Professional Certificate', org: 'Google', why: 'Free to audit, hands-on, and enough to land a first interview without A+.' },
      { name: 'Microsoft MS-900 or MD-102', org: 'Microsoft', why: 'Every Florida employer runs Microsoft 365 and Intune. MD-102 is the endpoint cert that gets you to Tier 2.' },
      { name: 'ITIL 4 Foundation', org: 'Axelos', why: 'Larger shops and MSPs mention it; it also teaches you the ticketing vocabulary they use in interviews.' }
    ],
    companies: [
      { name: 'Baptist Health South Florida', city: 'Coral Gables', note: 'Large IT service desk with real promotion paths.' },
      { name: 'Jackson Health System', city: 'Miami', note: 'Public hospital system; steady help desk and desktop hiring.' },
      { name: 'AdventHealth', city: 'Altamonte Springs', note: 'Statewide hospital network with a central service desk.' },
      { name: 'Publix', city: 'Lakeland', note: 'Corporate and store support desk.' },
      { name: 'University of Florida', city: 'Gainesville', note: 'Campus IT support with tuition benefits.' },
      { name: 'Miami Dade College', city: 'Miami', note: 'Campus technology support across eight campuses.' },
      { name: 'Kaseya', city: 'Miami', note: 'Vendor support for IT management software; a fast path into MSP tooling.' },
      { name: 'TD SYNNEX', city: 'Clearwater', note: 'Distributor with large technical support operations.' }
    ],
    resumeTips: [
      'Quantify tickets: "Closed about 30 tickets a day with a 94 percent first-contact resolution rate" even from a lab or volunteer role.',
      'Name the stack employers run: Windows 11, Microsoft 365, Entra ID, Intune, Active Directory, ServiceNow or Jira Service Management.',
      'One automation bullet beats five troubleshooting bullets: "Wrote a PowerShell script that onboarded new users in 4 minutes instead of 40."',
      'Customer-facing jobs count. Retail or restaurant experience framed as "de-escalation and clear explanations under time pressure" is exactly what Tier 1 needs.'
    ],
    linkedinTips: [
      'Headline: "IT Support Technician | A+ | Microsoft 365, Intune, PowerShell".',
      'Post a short before-and-after of a fix you documented, with the knowledge-base article you wrote. Documentation is the hidden hiring signal.',
      'Connect with help desk leads at Florida hospital systems; they hire from referrals constantly and reply to polite messages.',
      'Add your Google or CompTIA credential badge the day you earn it; recruiters filter on the skill tags they attach.'
    ],
    videos: [
      { id: "2ZbFQr1I2I8", title: "IT HELP DESK Interview Questions & Answers! (How to PASS an IT HELP DESK SUPPORT Job Interview!)" },
      { id: "wmmkjERnxlA", title: "How To Pass A Helpdesk Interview In 2026" }
    ],
    materials: []
  },
  {
    id: 'it-support-specialist',
    title: 'IT Support Specialist / Junior Sysadmin',
    path: 'tech-it',
    aliases: ['it support specialist', 'systems administrator', 'sysadmin', 'junior sysadmin', 'it specialist', 'it technician', 'tier 2', 'infrastructure technician', 'it automation'],
    summary: 'The step after help desk: owning endpoints, identity, and a few servers. Florida employers want Intune, Entra ID, and scripting, with networking basics.',
    salary: { range: '$52k – $72k', note: 'Florida base, 0 to 2 years in the title. Sysadmin titles with Azure or VMware experience reach $85k by year three.' },
    projects: ['it-7', 'it-10', 'it-8', 'it-9'],
    certs: [
      { name: 'CompTIA Network+', org: 'CompTIA', why: 'The networking baseline every specialist posting lists after A+.' },
      { name: 'Microsoft MD-102 (Endpoint Administrator)', org: 'Microsoft', why: 'Intune and Windows management is the day job; this cert matches it exactly.' },
      { name: 'Microsoft AZ-104', org: 'Microsoft', why: 'Hybrid Entra and Azure administration is where Florida sysadmin salaries climb.' },
      { name: 'CompTIA Linux+ or LPI Linux Essentials', org: 'CompTIA / LPI', why: 'Enough Linux to manage the servers nobody else wants to touch.' }
    ],
    companies: [
      { name: 'NextEra Energy', city: 'Juno Beach', note: 'Large infrastructure and endpoint teams.' },
      { name: 'Florida Power and Light', city: 'Miami', note: 'Enterprise IT operations.' },
      { name: 'Lennar', city: 'Miami', note: 'Corporate IT with hundreds of field offices to support.' },
      { name: 'World Kinect', city: 'Miami', note: 'Global infrastructure and identity administration.' },
      { name: 'Spirit Airlines', city: 'Dania Beach', note: 'Airline IT operations and endpoint management.' },
      { name: 'Darden Restaurants', city: 'Orlando', note: 'Restaurant technology support and infrastructure.' },
      { name: 'Jabil', city: 'St. Petersburg', note: 'Manufacturing IT; plant floor and corporate endpoints.' },
      { name: 'Orange County Government', city: 'Orlando', note: 'Public sector sysadmin roles with pension benefits.' }
    ],
    resumeTips: [
      'Lead with scale: "Managed 400 Intune-enrolled Windows devices" or "Administered Entra ID for 120 users" tells the reader your level instantly.',
      'Show scripting with an outcome: "PowerShell remediation scripts cut recurring disk-space tickets by 70 percent."',
      'List identity and security work explicitly: MFA rollout, conditional access, passwordless. These are the bullets that move you to $70k and up.',
      'Keep a homelab section with the stack (Proxmox, Terraform, Ansible) and what it automates. Hiring managers read it.'
    ],
    linkedinTips: [
      'Headline: "IT Systems Administrator | Intune, Entra ID, PowerShell | Network+".',
      'Post a short write-up of one automation with the script on GitHub. Sysadmins who publish scripts get recruited by MSPs.',
      'Join the Florida Microsoft 365 user groups and the r/sysadmin style communities on LinkedIn; recruiters for mid-size companies live there.',
      'Ask one former help desk colleague who moved up for a recommendation that mentions reliability. For this role it outweighs skills lists.'
    ],
    videos: [
      { id: "UE4MomFaUqI", title: "TOP 70 TECH SUPPORT Interview Questions & Answers, Help Desk, Desktop Support, Net Admin, Sys Admin." },
      { id: "kQQ9K2bBiSo", title: "Comprehensive Guide to System Administrator and Help Desk Interview Questions and Expert Answers" }
    ],
    materials: []
  },
  {
    id: 'junior-software',
    title: 'Junior Software Engineer',
    path: 'swe',
    aliases: ['junior software', 'software engineer', 'software developer', 'junior developer', 'full stack', 'full-stack', 'backend', 'frontend', 'web developer', 'swe', 'programmer', 'junior dev'],
    summary: 'Florida software hiring is spread across fintech in Tampa and Jacksonville, logistics and cruise lines in Miami, and defense and simulation in Orlando. Shipped, tested, deployed work beats a long skills list.',
    salary: { range: '$72k – $100k', note: 'Florida base, 0 to 2 years. Tampa and Jacksonville finance pay the top; defense in Orlando pays mid-band with better stability.' },
    projects: ['sw-6', 'sw-1', 'sw-5', 'sw-8'],
    certs: [
      { name: 'AWS Certified Cloud Practitioner', org: 'AWS', why: 'Not required, but it answers the "can you deploy it" question before it is asked.' },
      { name: 'GitHub Foundations', org: 'GitHub', why: 'Cheap, and it proves you know pull requests, Actions, and branching the way teams use them.' },
      { name: 'Meta Front-End or Back-End Developer Certificate', org: 'Meta', why: 'Free to audit, structured, and fills the gap if you have no CS degree.' },
      { name: 'Oracle Java SE or Microsoft C# fundamentals', org: 'Oracle / Microsoft', why: 'Florida enterprise and defense shops still run Java and .NET; a fundamentals cert signals you will not need retraining.' }
    ],
    companies: [
      { name: 'FIS', city: 'Jacksonville', note: 'Fintech; large early-career engineer intake.' },
      { name: 'JPMorgan Chase', city: 'Tampa', note: 'Software engineer program for new grads.' },
      { name: 'Citi', city: 'Tampa', note: 'Technology analyst program; Java and cloud.' },
      { name: 'Chewy', city: 'Plantation', note: 'E-commerce platform; Java, Kotlin, React.' },
      { name: 'Kaseya', city: 'Miami', note: 'Product engineering across many acquired products; hires juniors.' },
      { name: 'Lockheed Martin', city: 'Orlando', note: 'Simulation and training software; C++ and Java; clearance eligibility.' },
      { name: 'Carnival Corporation', city: 'Miami', note: 'Guest-facing and operations software.' },
      { name: 'UKG', city: 'Weston', note: 'HR and payroll SaaS; large engineering org in Broward.' }
    ],
    resumeTips: [
      'Three projects, each with a live link, a test count, and a deploy target. "Deployed on Render with 42 passing tests and CI on every push" is the bullet.',
      'Write what you built, not what the tutorial built. If the project came from a course, say what you added beyond it.',
      'Put the language in the title of each project bullet so a skim finds it: "Go + Redis URL shortener", "React + Node passkey login".',
      'Keep it to one page. Juniors with two-page résumés look like they are padding, and Florida hiring managers skim fast.'
    ],
    linkedinTips: [
      'Headline with the stack and a proof: "Software Engineer | Node, React, PostgreSQL | 3 deployed projects".',
      'Post a short technical write-up every two weeks: a bug, a design decision, a test strategy. Consistency is what recruiters notice.',
      'Pin your best repository in Featured with a GIF of it running. Recruiters do not clone repos; they watch GIFs.',
      'Attend one Tampa Bay or Miami tech meetup a month and connect with the speakers afterward with a specific comment on their talk.'
    ],
    videos: [
      { id: "32QSPxM7Zjw", title: "How to CRUSH Your New Grad Junior Software Engineer Interview" },
      { id: "15He0i2dRd4", title: "Junior Software Developer Interview Questions & Interview Process !" }
    ],
    materials: []
  },
  {
    id: 'cs-grad',
    title: 'Computer Science Graduate (Systems / Research Engineer)',
    path: 'cs',
    aliases: ['computer science', 'cs grad', 'new grad', 'systems engineer', 'research engineer', 'software engineer new grad', 'graduate engineer', 'cs student'],
    summary: 'For CS graduates who want depth over breadth: systems, distributed computing, and research-flavored engineering. In Florida that means defense, simulation, and a few platform teams.',
    salary: { range: '$78k – $110k', note: 'Florida base for new graduates. Defense and simulation in Orlando and the Space Coast dominate the postings.' },
    projects: ['cs-8', 'cs-6', 'cs-7', 'cs-2'],
    certs: [
      { name: 'None required', org: '', why: 'Research and systems roles hire on projects and fundamentals, not certs. Spend the time on one deep project and a clean write-up.' },
      { name: 'AWS Solutions Architect Associate (optional)', org: 'AWS', why: 'Useful only if you want platform teams; skip it for defense and research.' },
      { name: 'Security+ (defense track)', org: 'CompTIA', why: 'Required by DoD 8570 for many Orlando and Melbourne engineering roles; a cheap unlock for a large employer pool.' },
      { name: 'Kubernetes CKAD (platform track)', org: 'CNCF', why: 'If your project is distributed systems, this proves you can run them, not just design them.' }
    ],
    companies: [
      { name: 'Lockheed Martin', city: 'Orlando', note: 'Simulation, training, and mission systems; large new-grad intake.' },
      { name: 'L3Harris', city: 'Melbourne', note: 'Space and airborne systems software.' },
      { name: 'Northrop Grumman', city: 'Melbourne', note: 'Aerospace systems engineering.' },
      { name: 'Blue Origin', city: 'Merritt Island', note: 'Launch and flight software on the Space Coast.' },
      { name: 'Siemens Energy', city: 'Orlando', note: 'Industrial software and simulation.' },
      { name: 'Kaseya', city: 'Miami', note: 'Platform and infrastructure engineering.' },
      { name: 'FIS', city: 'Jacksonville', note: 'Core banking platforms; systems-heavy work.' },
      { name: 'Jabil', city: 'St. Petersburg', note: 'Manufacturing systems and embedded software.' }
    ],
    resumeTips: [
      'One deep project with a design document beats four shallow apps. "Implemented Raft consensus in Go; 1,200 lines, 95 percent test coverage, documented failure cases" is the bullet.',
      'List coursework only where it is specific: "Distributed Systems, Operating Systems, Compilers", not "relevant coursework".',
      'Put GPA if it is 3.5 or above; defense employers look for it. Otherwise leave it off.',
      'State citizenship or work authorization near the top if you are targeting defense; it is the first filter those recruiters apply.'
    ],
    linkedinTips: [
      'Headline: "CS Graduate | Systems and distributed computing | Go, C++, Rust".',
      'Post the design document from your deep project as a PDF or article. Research-minded recruiters read long form.',
      'Follow the Orlando simulation and Space Coast aerospace employers; they recruit at UCF, FIT, and USF events listed on their pages.',
      'Ask a professor who supervised a project for a recommendation that names the project. For new grads it is the strongest social proof.'
    ],
    videos: [
      { id: "Kh0KVaCVXY8", title: "The Complete Guide to Software Engineering Interviews" },
      { id: "NJV-V-WjuAI", title: "how to interview like a Senior Dev (even if you are Junior)" }
    ],
    materials: []
  }
];
