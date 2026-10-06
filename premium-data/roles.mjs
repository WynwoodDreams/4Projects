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

// The first cohort: 50 students in an AWS Cloud Practitioner program. Roads
// tagged track: 'aws' are the ones built for them and show first; 'general'
// roads stay for later cohorts.
export const COHORT = {
  name: 'AWS Cloud Practitioner cohort',
  note: 'Seven roads for the jobs a Cloud Practitioner can land in Florida, and what to earn next to move up.'
};

export const ROLES = [
  {
    id: 'cloud-support-associate', track: 'aws',
    title: 'Cloud Support Associate',
    path: 'cloud',
    aliases: ['cloud support', 'cloud support associate', 'cloud support engineer', 'technical support engineer', 'aws support', 'support associate', 'csa', 'cloud practitioner', 'aws cloud practitioner', 'entry level aws', 'cloud technical support'],
    summary: 'The most common first job after Cloud Practitioner. You answer customer or internal tickets about AWS accounts, IAM, networking, and billing, and learn the platform by fixing it. Amazon, MSPs, and Florida SaaS companies all hire this title.',
    salary: { range: '$55k – $80k', note: 'Florida base, 0 to 2 years. Amazon and the larger MSPs sit at the top; small MSPs start near $50k but promote fast.' },
    projects: ['cl-4', 'it-2', 'it-5', 'cl-1'],
    certs: [
      { name: 'AWS Certified Cloud Practitioner', org: 'AWS', why: 'You are earning it now. On a support résumé it is the line that gets the screen passed; pair it with one deployed project so it is not the only line.' },
      { name: 'AWS Certified CloudOps Engineer – Associate', org: 'AWS', why: 'The renamed SysOps Associate. It is the support role in exam form: monitoring, IAM, networking, backups. Target it 4 to 6 months after Practitioner.' },
      { name: 'CompTIA Linux+ or LPI Linux Essentials', org: 'CompTIA / LPI', why: 'Half of support tickets end at a Linux shell. Essentials is enough to start; Linux+ is what Amazon lists.' },
      { name: 'CompTIA Network+', org: 'CompTIA', why: 'VPCs, subnets, security groups, and DNS are networking questions in disguise. Network+ is the fastest way to stop guessing.' }
    ],
    companies: [
      { name: 'Amazon Web Services', city: 'Remote / Florida', note: 'Cloud Support Associate is an official AWS early-career title; Florida applicants are hired remote and in regional hubs. Apply through amazon.jobs.' },
      { name: 'Kaseya', city: 'Miami', note: 'Technical support for IT-management SaaS on AWS; hires in cohorts and promotes into cloud operations.' },
      { name: 'TD SYNNEX', city: 'Clearwater', note: 'Distributor with an AWS practice; cloud support and licensing roles.' },
      { name: 'NIX', city: 'Tampa', note: 'AWS Premier consulting partner headquartered in Tampa; support and junior engineer roles.' },
      { name: 'Availity', city: 'Jacksonville', note: 'Healthcare network running heavily on AWS; technical support and cloud ops.' },
      { name: 'ConnectWise', city: 'Tampa', note: 'MSP software vendor; support engineers work with cloud-hosted products daily.' },
      { name: 'Chewy', city: 'Plantation', note: 'Technical support and platform operations on AWS.' },
      { name: 'Spectrum (Charter)', city: 'St. Petersburg', note: 'Large support and operations center; a common first employer before cloud roles.' }
    ],
    resumeTips: [
      'Title your summary "Cloud Support Associate (AWS Certified Cloud Practitioner)" so the ATS and the recruiter both match the posting in the first line.',
      'Write one bullet per AWS service you have actually used in a project: "Configured S3 static hosting with CloudFront and Route 53; documented the setup in a runbook."',
      'Support jobs hire for written communication. Link a short runbook or troubleshooting doc from a project; it is the work sample they cannot get from a cert.',
      'Any customer-facing job counts. Retail, hospitality, or help desk becomes "resolved 25 customer issues a day with clear written follow-up", which is the support job.'
    ],
    linkedinTips: [
      'Headline: "Cloud Support Associate | AWS Certified Cloud Practitioner | Linux, networking, IAM". Put the cert name in full; recruiters search the exact phrase.',
      'Add the AWS badge from Credly the day you pass. Recruiters filter on it, and the badge post gets more views than anything else you will post this year.',
      'Post one troubleshooting story a week: the symptom, what you checked, the fix. That is the support interview, in public.',
      'Follow AWS Training and Certification and the Florida AWS user groups (Tampa Bay, Miami, Orlando); comment with specifics, not congratulations.'
    ],
    videos: [
      { id: 'IgagEB4grEY', title: 'Cloud Support Associate - Student Application & Interview Tips (Amazon)' },
      { id: '-Gc305ZnaEo', title: 'Amazon Cloud Support Associate Interview Questions And Answers' },
      { id: 'qLhTVAGszeg', title: 'AWS Cloud Support Engineer Interview Questions and Answers' }
    ],
    materials: []
  },
  {
    id: 'junior-cloud-engineer', track: 'aws',
    title: 'Junior Cloud Engineer / Cloud Operations Associate',
    path: 'cloud',
    aliases: ['junior cloud', 'cloud engineer', 'cloud operations', 'cloud ops', 'associate cloud engineer', 'cloud associate', 'cloud intern', 'infrastructure engineer', 'aws engineer', 'cloud administrator'],
    summary: 'The engineering step after support: building and running accounts, VPCs, and deployments, usually with Terraform, inside a team that already owns production. Florida finance and healthcare employers hire this title through early-career programs.',
    salary: { range: '$68k – $95k', note: 'Florida base, 0 to 2 years. Tampa and Jacksonville banks and insurers pay the top of the band; smaller companies start near $65k.' },
    projects: ['cl-4', 'cl-5', 'cl-2', 'it-2'],
    certs: [
      { name: 'AWS Certified Solutions Architect – Associate', org: 'AWS', why: 'The cert that turns a Practitioner into an engineering candidate. Plan 3 to 4 months of study with a deployed project alongside it.' },
      { name: 'HashiCorp Terraform Associate', org: 'HashiCorp', why: 'Every Florida cloud team manages infrastructure as code. This plus a Terraform project is what the interview is really about.' },
      { name: 'AWS Certified CloudOps Engineer – Associate', org: 'AWS', why: 'Take it after Solutions Architect if the role is operations-heavy: monitoring, patching, incident response.' },
      { name: 'CompTIA Security+', org: 'CompTIA', why: 'Opens the defense and government cloud roles in Orlando, Tampa, and Melbourne that require DoD 8570 compliance.' }
    ],
    companies: [
      { name: 'Citi', city: 'Tampa', note: 'Cloud platform teams; early-career technology analyst program accepts cloud-track graduates.' },
      { name: 'JPMorgan Chase', city: 'Tampa', note: 'Cloud and SRE roles on the Westshore campus; posts associate-level infrastructure roles.' },
      { name: 'FIS', city: 'Jacksonville', note: 'Fintech with ongoing AWS migration; cloud associate and infrastructure engineer postings.' },
      { name: 'Florida Blue', city: 'Jacksonville', note: 'Healthcare payer with cloud operations and platform teams.' },
      { name: 'Deloitte US Delivery Center', city: 'Lake Mary', note: 'Hires solution analysts for cloud projects; a known on-ramp for new certification holders.' },
      { name: 'Accenture Federal Services', city: 'Tampa', note: 'AWS cloud engineer postings tied to MacDill-area federal work; clearance eligibility helps.' },
      { name: 'Raymond James', city: 'St. Petersburg', note: 'Infrastructure and cloud operations engineering.' },
      { name: 'NextEra Energy', city: 'Juno Beach', note: 'Large cloud and infrastructure org with an internship-to-hire pipeline.' }
    ],
    resumeTips: [
      'Lead with a Projects section above Experience. Name the services and the tool: "ECS Fargate, ECR, IAM, GitHub Actions OIDC, Terraform", not "AWS and CI/CD".',
      'Put one reliability or cost number on the page: "Added CloudWatch alarms and SNS paging; mean time to notice dropped from hours to 2 minutes in a lab" or "cut a lab bill from $42 to $9 a month".',
      'List certifications with dates, and the next one with its exam date: "AWS Solutions Architect – Associate, exam scheduled Jan 2027". Scheduled beats "in progress".',
      'Mirror the posting\'s words. If it says "infrastructure as code", your bullet says "infrastructure as code", not "automation scripts".'
    ],
    linkedinTips: [
      'Headline: "Cloud Engineer | AWS Certified Cloud Practitioner | Terraform, Linux, Python". Recruiters search titles, not "aspiring".',
      'Post the architecture diagram from one project with three lines on a decision you made and why. One post like that outperforms ten reposts.',
      'Follow and comment on the Tampa Bay, Jacksonville, and South Florida AWS user group pages; local recruiters watch who shows up there.',
      'Turn on Open to Work for recruiters only, with Tampa, Jacksonville, Orlando, and Miami as locations plus Remote.'
    ],
    videos: [
      { id: 'c2SDG5EdgGo', title: 'Cloud Engineer Interview - How to answer scenario based questions' },
      { id: '1rpQHTPMnoo', title: 'Top 20 AWS Cloud Interview Questions and Answers Explained' }
    ],
    materials: []
  },
  {
    id: 'noc-cloud-ops-tech', track: 'aws',
    title: 'NOC / Cloud Operations Technician',
    path: 'cloud',
    aliases: ['noc', 'noc technician', 'network operations', 'operations technician', 'cloud operations technician', 'monitoring technician', 'ops tech', 'network operations center', 'data center technician', 'shift technician'],
    summary: 'The 24/7 eyes on dashboards. You watch monitoring, triage alerts, run first-response playbooks, and escalate. It is shift work, it hires without a degree, and it is the fastest path to a cloud operations seat for people who do not yet have one.',
    salary: { range: '$42k – $62k', note: 'Florida base, 0 to 2 years. Nights and weekends often carry a shift differential; Orlando and St. Petersburg telecom NOCs pay the most.' },
    projects: ['it-2', 'it-6', 'cl-6', 'it-5'],
    certs: [
      { name: 'CompTIA Network+', org: 'CompTIA', why: 'NOC interviews are OSI-model and troubleshooting questions. Network+ is the cert on the posting and the vocabulary in the interview.' },
      { name: 'AWS Certified Cloud Practitioner', org: 'AWS', why: 'Separates you from the pure-telecom candidates and is what moves a NOC tech into the cloud operations rotation.' },
      { name: 'AWS Certified CloudOps Engineer – Associate', org: 'AWS', why: 'The exam is literally monitoring, logging, and incident response on AWS. Earn it while on shift and you are promotable.' },
      { name: 'LPI Linux Essentials', org: 'LPI', why: 'Enough shell to read logs and restart services without waiting for Tier 2.' }
    ],
    companies: [
      { name: 'Spectrum (Charter)', city: 'St. Petersburg', note: 'One of the largest NOC operations in the state; steady technician hiring with shift differentials.' },
      { name: 'Verizon', city: 'Lake Mary', note: 'Network operations and monitoring teams in the Orlando area.' },
      { name: 'ConnectWise', city: 'Tampa', note: 'NOC services for MSPs; technicians work customer environments and cloud-hosted tooling.' },
      { name: 'Kaseya', city: 'Miami', note: 'Runs a NOC offering for its MSP customers; entry technician roles.' },
      { name: 'Hotwire Communications', city: 'Fort Lauderdale', note: 'Fiber provider with an in-house NOC.' },
      { name: 'Availity', city: 'Jacksonville', note: 'Operations center for a healthcare network on AWS.' },
      { name: 'Jabil', city: 'St. Petersburg', note: 'Global IT operations center for manufacturing sites.' },
      { name: 'Summit Broadband', city: 'Orlando', note: 'Regional fiber provider; NOC technicians on rotating shifts.' }
    ],
    resumeTips: [
      'State availability in the first three lines: "Available for nights, weekends, and rotating shifts." It is the first filter on a NOC screen.',
      'Describe monitoring like a job: "Built a CloudWatch and Grafana dashboard with alarms for CPU, disk, and 5xx errors; wrote a one-page response playbook per alarm."',
      'Add a networking bullet with real numbers: "Segmented a home network into 4 VLANs with pfSense; captured and read traffic in Wireshark."',
      'Keep it to one page and list Network+ and Cloud Practitioner at the top with dates. NOC hiring managers skim in under a minute.'
    ],
    linkedinTips: [
      'Headline: "NOC Technician | Network+ | AWS Cloud Practitioner | Monitoring, Linux, incident response".',
      'Post a screenshot of a dashboard you built with two lines on what it watches and why. NOC leads hire people who already think in alarms.',
      'Connect with NOC supervisors at Spectrum, ConnectWise, and Verizon in Florida; shift roles are often filled from a supervisor\'s own network.',
      'List your lab as an Experience entry, "Home Lab (self-directed)", with dates, so your profile is not empty under Experience.'
    ],
    videos: [
      { id: 'Rtuyl8e-YTY', title: 'TOP 20 NOC Technician Interview Questions and Answers' },
      { id: 'AIvpoUKlBY0', title: 'TOP 10 BASIC NOC NETWORK ENGINEER INTERVIEW Questions and Answers' }
    ],
    materials: []
  },
  {
    id: 'junior-devops', track: 'aws',
    title: 'Junior DevOps / Platform Engineer',
    path: 'cloud',
    aliases: ['devops', 'junior devops', 'devops engineer', 'platform engineer', 'ci/cd', 'cicd', 'release engineer', 'build engineer', 'site reliability', 'sre', 'junior sre', 'automation engineer'],
    summary: 'Pipelines, containers, and infrastructure as code for a software team. Florida SaaS companies and fintechs hire juniors who can already ship a container through CI to AWS, because that is the whole job on day one.',
    salary: { range: '$75k – $100k', note: 'Florida base, 0 to 2 years. Rare as a true entry role; most juniors arrive from support, NOC, or a software internship.' },
    projects: ['cl-5', 'cl-3', 'cl-6', 'cy-8'],
    certs: [
      { name: 'AWS Certified Developer – Associate', org: 'AWS', why: 'Closer to DevOps work than Solutions Architect: deployment, CI/CD, Lambda, and IAM for pipelines.' },
      { name: 'HashiCorp Terraform Associate', org: 'HashiCorp', why: 'Non-negotiable for platform roles. The exam is cheap; the project you build for it is the interview.' },
      { name: 'GitHub Actions certification', org: 'GitHub', why: 'Most Florida teams run Actions. The cert plus an OIDC-to-AWS pipeline project answers the first technical question.' },
      { name: 'Kubernetes CKAD', org: 'CNCF', why: 'Only once a job posting asks for Kubernetes. ECS roles do not need it; EKS roles will not interview without it.' }
    ],
    companies: [
      { name: 'Chewy', city: 'Plantation', note: 'Platform engineering on AWS; hires associate DevOps and SRE.' },
      { name: 'UKG', city: 'Weston', note: 'Large SaaS engineering org in Broward with dedicated platform teams.' },
      { name: 'Kaseya', city: 'Miami', note: 'DevOps across dozens of acquired products; a lot of junior-friendly pipeline work.' },
      { name: 'FIS', city: 'Jacksonville', note: 'Fintech CI/CD and cloud platform teams.' },
      { name: 'ReliaQuest', city: 'Tampa', note: 'Security platform on AWS; associate engineers rotate through DevOps work.' },
      { name: 'Citi', city: 'Tampa', note: 'Enterprise DevOps and cloud platform engineering.' },
      { name: 'EA (Tiburon)', city: 'Orlando', note: 'Game studio with build and release engineering roles.' },
      { name: 'Hertz', city: 'Estero', note: 'Corporate engineering with platform and cloud operations teams.' }
    ],
    resumeTips: [
      'One bullet should read like a pipeline: "GitHub Actions builds a container, pushes to ECR, and deploys to ECS Fargate via Terraform, authenticated with OIDC and no long-lived keys."',
      'Show observability, not just deployment: "Added OpenTelemetry tracing and Grafana dashboards; found a 1.2 s p95 latency regression before users did."',
      'Name the exact tools in the posting\'s order: Terraform, Docker, GitHub Actions, AWS, Linux, Python. Juniors get filtered on tool names.',
      'Link the repo with the workflow file. Hiring managers for this role open the .github folder before they read the summary.'
    ],
    linkedinTips: [
      'Headline: "DevOps Engineer | AWS, Terraform, GitHub Actions, Docker | AWS Certified Cloud Practitioner".',
      'Post a pipeline diagram and the one failure you fixed in it. A broken-then-fixed story is the most believable junior content there is.',
      'Follow the Tampa Bay DevOps and South Florida Kubernetes meetups; organizers reshare members\' project posts.',
      'Pin the repo with the workflow file in Featured, with a GIF of a green run. Recruiters do not clone; they watch.'
    ],
    videos: [
      { id: '7uysdkEBTZA', title: "Top CI/CD Interview Questions You'll Face in 2025" },
      { id: 'xIDvHx1KznI', title: 'Master DevOps Interviews: 10 Questions Answered' }
    ],
    materials: []
  },
  {
    id: 'cloud-security-analyst', track: 'aws',
    title: 'Cloud Security Analyst (entry)',
    path: 'cyber',
    aliases: ['cloud security', 'cloud security analyst', 'security analyst cloud', 'aws security', 'cloud compliance', 'cloud security engineer', 'iam analyst', 'security operations cloud', 'cloud isso'],
    summary: 'Security work that starts from the AWS account: IAM hygiene, CloudTrail and GuardDuty findings, compliance checks, and misconfiguration cleanup. Tampa is one of the largest security hiring markets in the country and the cloud-flavored roles are the fastest growing part of it.',
    salary: { range: '$65k – $90k', note: 'Florida base, 0 to 2 years. Cleared roles near MacDill and the Space Coast pay $10k to $20k more.' },
    projects: ['it-3', 'cy-5', 'it-5', 'cy-8'],
    certs: [
      { name: 'CompTIA Security+', org: 'CompTIA', why: 'The baseline on every Florida security posting and a hard requirement for anything touching DoD work.' },
      { name: 'AWS Certified Cloud Practitioner', org: 'AWS', why: 'Already yours. It is what makes a Security+ holder a cloud security candidate instead of a generic SOC applicant.' },
      { name: 'AWS Certified Security – Specialty', org: 'AWS', why: 'The target for year two. Study it alongside a real audit project; the exam is IAM, logging, encryption, and incident response.' },
      { name: 'CCSK (Cloud Security Alliance)', org: 'CSA', why: 'Vendor-neutral and cheap; useful when the employer is multi-cloud or in compliance-heavy healthcare and finance.' }
    ],
    companies: [
      { name: 'ReliaQuest', city: 'Tampa', note: 'Largest security employer in Florida; cloud security and detection roles, hires analysts in cohorts.' },
      { name: 'KnowBe4', city: 'Clearwater', note: 'Security vendor with internal cloud security and engineering teams.' },
      { name: 'Citi', city: 'Tampa', note: 'Cloud security and IAM teams in the Tampa cyber fusion center.' },
      { name: 'JPMorgan Chase', city: 'Tampa', note: 'Cloud security engineering and threat intelligence.' },
      { name: 'Deloitte US Delivery Center', city: 'Lake Mary', note: 'Cloud security engineer and analyst roles delivered from Central Florida.' },
      { name: 'Raymond James', city: 'St. Petersburg', note: 'In-house security engineering with a cloud focus.' },
      { name: 'L3Harris', city: 'Melbourne', note: 'Cloud ISSO and security roles; clearance a plus.' },
      { name: 'Florida Blue', city: 'Jacksonville', note: 'Healthcare cloud security and compliance.' }
    ],
    resumeTips: [
      'Lead with an audit you ran: "Scanned a lab AWS account with Prowler against CIS benchmarks; fixed 14 findings including public S3 buckets and IAM users without MFA."',
      'Put Security+ and Cloud Practitioner together at the top with dates. The pair is what the title is looking for.',
      'Add one detection or logging bullet: "Enabled CloudTrail and GuardDuty; wrote an EventBridge rule that pages on root login."',
      'Link a short findings report from a project. Security analysts are hired on how they write up a finding, not just how they find it.'
    ],
    linkedinTips: [
      'Headline: "Cloud Security Analyst | Security+ | AWS Certified Cloud Practitioner | IAM, CloudTrail, compliance".',
      'Post one finding a week from your lab: what was misconfigured, why it matters, how you fixed it. Keep the account ids out.',
      'Follow ReliaQuest, KnowBe4, and the Tampa Bay ISSA and BSides pages; comment with substance so recruiters see the name.',
      'List "Home Cloud Security Lab (self-directed)" under Experience with dates so the profile is not empty under Experience.'
    ],
    videos: [
      { id: 'kdvVt4Khr9Q', title: 'Cloud Security Engineer Interview Questions & Answers' },
      { id: 'hZnNL5c7rJk', title: 'Cloud Security Interview Questions and Answers in 2024' }
    ],
    materials: []
  },
  {
    id: 'associate-solutions-architect', track: 'aws',
    title: 'Associate Solutions Architect / Cloud Pre-Sales',
    path: 'cloud',
    aliases: ['solutions architect', 'associate solutions architect', 'pre-sales', 'presales', 'sales engineer', 'cloud consultant', 'technical account', 'cloud advisor', 'customer solutions', 'partner solutions'],
    summary: 'The talking-and-diagramming side of cloud. You help customers or internal teams pick services, size costs, and draw the architecture, then hand it to engineers. AWS partners and resellers in Florida hire associates with a Practitioner, strong communication, and one solid Solutions Architect project.',
    salary: { range: '$70k – $95k', note: 'Florida base, 0 to 2 years, often with a variable component at partners and resellers.' },
    projects: ['cl-1', 'cl-4', 'cl-2', 'sw-4'],
    certs: [
      { name: 'AWS Certified Solutions Architect – Associate', org: 'AWS', why: 'The title cert. Partners need a count of certified staff for their AWS tier, so this one directly makes you hireable.' },
      { name: 'AWS Certified Cloud Practitioner', org: 'AWS', why: 'Yours already. For pre-sales it is also a teaching credential: you will explain the cloud value proposition to customers who are studying for it.' },
      { name: 'AWS Certified AI Practitioner', org: 'AWS', why: 'Every customer conversation in 2026 includes Bedrock. The AI Practitioner answers those questions without a second specialist in the room.' },
      { name: 'HashiCorp Terraform Associate', org: 'HashiCorp', why: 'Lets you hand engineers a working module, not just a diagram. Architects who can code the skeleton are rare at the associate level.' }
    ],
    companies: [
      { name: 'NIX', city: 'Tampa', note: 'AWS Premier partner headquartered in Tampa; pre-sales and associate architect roles.' },
      { name: 'TD SYNNEX', city: 'Clearwater', note: 'Distributor AWS practice; partner solutions and cloud advisory roles.' },
      { name: 'CDW', city: 'Tampa / Fort Lauderdale', note: 'Reseller with cloud solution architect and inside solutions roles.' },
      { name: 'Presidio', city: 'Orlando / Tampa', note: 'Consulting partner with Florida offices; associate consultant intake.' },
      { name: 'Kaseya', city: 'Miami', note: 'Solutions engineering for an MSP customer base.' },
      { name: 'Deloitte US Delivery Center', city: 'Lake Mary', note: 'Cloud solution analyst roles that lead into architecture tracks.' },
      { name: 'Amazon Web Services', city: 'Remote / Florida', note: 'Associate Solutions Architect is an official AWS early-career program; cohorts are hired nationally, including Florida.' },
      { name: 'Accenture', city: 'St. Petersburg / Miami', note: 'Cloud-first delivery; associate analysts on AWS engagements.' }
    ],
    resumeTips: [
      'Put a diagram link in the header. Architects are hired on one picture and the five minutes they can talk about it.',
      'Write a cost bullet: "Sized a serverless summarizer on Bedrock and Lambda at under $4 a month for 10,000 requests, with the calculation in the README."',
      'Show the trade-off, not the service list: "Chose ECS Fargate over EKS for a two-service app to avoid cluster overhead; documented when EKS would win."',
      'Communication proof matters: a talk at a user group, a workshop you ran, or a tutorial you wrote belongs on the first page.'
    ],
    linkedinTips: [
      'Headline: "Associate Solutions Architect | AWS Certified Cloud Practitioner | Serverless, cost design, Terraform".',
      'Post one architecture a month: diagram, the decision, the monthly cost. Pre-sales recruiters are looking for exactly this voice.',
      'Comment on AWS Heroes\' and local partners\' posts with a real question. Partners hire people who already talk like their customers.',
      'Record a 3-minute walkthrough of one project and pin it in Featured. For pre-sales, the video is the interview.'
    ],
    videos: [
      { id: 'UJVuQfe0lD8', title: 'Solutions Architect Interview Questions AWS 2026' },
      { id: 'c2SDG5EdgGo', title: 'Cloud Engineer Interview - How to answer scenario based questions' }
    ],
    materials: []
  },
  {
    id: 'it-support-cloud-track', track: 'aws',
    title: 'IT Support with a Cloud Track',
    path: 'tech-it',
    aliases: ['it support cloud', 'help desk to cloud', 'desktop support', 'it support', 'help desk', 'service desk', 'junior it', 'it technician cloud', 'support to cloud', 'bridge'],
    summary: 'The bridge road. If you need income now, take a help desk or IT support job at an employer that runs AWS or Microsoft 365, then use the Practitioner plus one project to move into their cloud team within a year. Florida hospitals, colleges, and MSPs do this promotion constantly.',
    salary: { range: '$45k – $62k', note: 'Florida base for the support job itself. Internal moves to cloud operations typically add $15k to $25k.' },
    projects: ['tech-it-0', 'cl-4', 'it-5', 'it-2'],
    certs: [
      { name: 'AWS Certified Cloud Practitioner', org: 'AWS', why: 'Yours now. On a support résumé it signals where you are going and is often the only cloud cert on the whole team.' },
      { name: 'CompTIA A+', org: 'CompTIA', why: 'Still the cert on most Florida help desk postings. Skip it only if you already have a support job.' },
      { name: 'Microsoft MS-900 or AZ-900', org: 'Microsoft', why: 'Florida employers run Microsoft 365 and often Azure next to AWS. A second cloud fundamentals cert makes you the obvious internal candidate.' },
      { name: 'LPI Linux Essentials', org: 'LPI', why: 'The cheapest way to be the person on the help desk who can touch the Linux boxes.' }
    ],
    companies: [
      { name: 'Baptist Health South Florida', city: 'Coral Gables', note: 'Large service desk with real promotion paths into infrastructure and cloud.' },
      { name: 'AdventHealth', city: 'Altamonte Springs', note: 'Statewide hospital network; central service desk and cloud teams.' },
      { name: 'Miami Dade College', city: 'Miami', note: 'Campus IT support across eight campuses; tuition benefits for the next cert.' },
      { name: 'University of Florida', city: 'Gainesville', note: 'Campus IT with research computing and cloud teams to move into.' },
      { name: 'Publix', city: 'Lakeland', note: 'Corporate and store support desk with an internal infrastructure org.' },
      { name: 'Kaseya', city: 'Miami', note: 'Vendor support that touches cloud-hosted products from day one.' },
      { name: 'TD SYNNEX', city: 'Clearwater', note: 'Support operations next to an AWS practice.' },
      { name: 'Spectrum (Charter)', city: 'St. Petersburg', note: 'Support and NOC roles with internal mobility.' }
    ],
    resumeTips: [
      'Quantify tickets even from a lab or volunteer role: "Closed about 30 tickets a day with a 94 percent first-contact resolution rate."',
      'Name the stack employers run: Windows 11, Microsoft 365, Entra ID, Intune, plus "AWS Certified Cloud Practitioner" in the certifications line with the date.',
      'One automation bullet beats five troubleshooting bullets: "PowerShell script onboarded new users in 4 minutes instead of 40."',
      'Add the S3 static site project with its live link. It is the fastest proof that "cloud track" is more than a word on the résumé.'
    ],
    linkedinTips: [
      'Headline: "IT Support Technician | AWS Certified Cloud Practitioner | Microsoft 365, PowerShell, Linux".',
      'Post a short before-and-after of a fix you documented. Documentation is the hidden hiring signal on help desks.',
      'Connect with help desk leads at Florida hospital systems; they hire from referrals and reply to polite, specific messages.',
      'Add the AWS badge from Credly the day you earn it; recruiters filter on the skill tag it attaches.'
    ],
    videos: [
      { id: '2ZbFQr1I2I8', title: 'IT HELP DESK Interview Questions & Answers! (How to PASS an IT HELP DESK SUPPORT Job Interview!)' },
      { id: 'wmmkjERnxlA', title: 'How To Pass A Helpdesk Interview In 2026' }
    ],
    materials: []
  },
  {
    id: 'junior-ai',
    title: 'Junior AI Engineer',
    path: 'ai', track: 'general',
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
    path: 'data', track: 'general',
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
    path: 'cyber', track: 'general',
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
    path: 'helpdesk', track: 'general',
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
    path: 'tech-it', track: 'general',
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
    path: 'swe', track: 'general',
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
    path: 'cs', track: 'general',
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
