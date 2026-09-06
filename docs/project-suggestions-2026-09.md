# Project Suggestions — September 2026

Twenty-four candidate cards for the BuildersBench catalog, chosen to fill the thinnest path/level cells and to track what 2026 job postings and hiring guides actually ask for: agents and MCP, evals and observability, passkeys and passwordless, platform engineering, the lakehouse stack, Copilot agents in Microsoft 365, and systems fundamentals compiled to WebAssembly.

Every card needs a video. The video IDs below came from search results and **have not been verified** from this sandbox (YouTube is blocked). Run `npm run check:videos` in GitHub Actions before merging any of them.

## Coverage today

| Path | Beginner | Intermediate | Advanced | Thinnest cell |
|---|---|---|---|---|
| AI Engineer | 1 | 3 | 2 | beginner |
| Cloud | 1 | 3 | 1 | advanced |
| Computer Science | 1 | 2 | 1 | beginner, advanced |
| Cybersecurity | 1 | 3 | 2 | beginner |
| Data Analyst | 1 | 4 | 1 | beginner, advanced |
| Help Desk | 3 | 1 | 1 | intermediate, advanced |
| Software Engineer | 1 | 3 | 1 | beginner, advanced |
| Tech / IT Support | 3 | 2 | 1 | advanced |

## Suggested cards

### AI Engineer

| ID | Level | Title | Stack | Why now | Candidate video |
|---|---|---|---|---|---|
| ai-5 | Beginner | Build an MCP Server for Your Own Data | Python MCP SDK, FastMCP, Claude Desktop / Claude Code, SQLite | MCP is the portable tool layer every agent framework now speaks; a working server is the fastest proof you can wire an LLM to real systems. | `vzGkSn59rDU` — Build an MCP Server in 20 Minutes (with Python) |
| ai-6 | Intermediate | Cost-Aware LLM Model Router | Python, FastAPI, Claude Haiku + Claude Opus (or open-weight via Ollama), LiteLLM, Postgres | Routing easy requests to cheap models and hard ones to frontier models, then proving the savings on a real query log, is a named 2026 portfolio pattern. | `cmetUBIdmvM` — Stop Wasting Money on LLMs: Smart Routing Changes Everything |
| ai-7 | Advanced | Agent Evals and Trace Observability Harness | LangSmith or Langfuse, DeepEval, OpenTelemetry, pytest, GitHub Actions | Lack of trace-level visibility is the top reason agent rollouts stall; teams hire people who can build the regression suite. | `oSjAbx67f0k` — How to Debug, Evaluate, and Ship Reliable AI Agents with LangSmith |

### Cloud Computing

| ID | Level | Title | Stack | Why now | Candidate video |
|---|---|---|---|---|---|
| cl-5 | Intermediate | Keyless Container Deploys: ECS Fargate with Terraform and GitHub OIDC | Terraform, AWS ECS Fargate, ECR, GitHub Actions OIDC, ALB | No long-lived cloud keys in CI is now a baseline expectation; this shows IaC plus a secure pipeline in one repo. | `xeWcdZ_bNBE` — CI/CD Pipeline for AWS ECS Fargate with GitHub Actions and Terraform |
| cl-6 | Intermediate | Full Observability Stack with OpenTelemetry and Grafana LGTM | OpenTelemetry Collector, Grafana, Loki, Tempo, Prometheus, Docker Compose | OpenTelemetry is the second-fastest-growing CNCF project after Kubernetes and appears in most SRE and platform postings. | `WeWgBQVxLus` — Grafana LGTM with Docker Compose, OpenTelemetry and a Crypto API |
| cl-7 | Advanced | Internal Developer Platform with Backstage, Crossplane, and Kyverno | Backstage, Crossplane, ArgoCD, Kyverno, kind or vCluster | Platform engineering is the highest-paid cloud track; a self-service portal with policy-as-code is the canonical proof. | `ptxnxoe1Jbs` — Build an Internal Developer Platform with K8s, Backstage and ArgoCD (2026) |

### Computer Science

| ID | Level | Title | Stack | Why now | Candidate video |
|---|---|---|---|---|---|
| cs-6 | Beginner | Key-Value Store from Scratch with a Write-Ahead Log | Python or Go, LSM-tree basics, WAL, pytest | Storage-engine fundamentals are the most common systems interview topic and show you understand what databases do under the hood. | `tb12omFYE5g` — Build Your Own NoSQL Key Value Store Database in Python |
| cs-7 | Intermediate | Compile a Tiny Language to WebAssembly | TypeScript or Rust, hand-written parser, Wasm binary format, browser runtime | Wasm is production-ready in 2026 and a compiler that targets it proves language, runtime, and binary-format knowledge at once. | `b_PWItoHsr0` — Build your own JS compiler in WebAssembly |
| cs-8 | Advanced | Raft Consensus Key-Value Cluster with Chaos Tests | Go, gRPC, Raft leader election and log replication, Docker Compose, fault-injection tests | Distributed consensus is the gold-standard advanced CS project; adding chaos tests makes it a credible SRE story too. | `y3UsyQTMeyI` — Implementing Raft Consensus in Golang |

### Cybersecurity

| ID | Level | Title | Stack | Why now | Candidate video |
|---|---|---|---|---|---|
| cy-6 | Beginner | Phishing-Resistant Login with Passkeys (WebAuthn) | Node.js, SimpleWebAuthn, React, SQLite | Passkeys are replacing passwords across major platforms; a working relying party demonstrates modern identity fundamentals. | `helyWKUGxJU` — Add Passkey (WebAuthn) Login to Your Web App with ReactJS + NodeJS |
| cy-7 | Intermediate | LLM Red-Team Lab with Garak, PyRIT, and Promptfoo | Ollama local model, Garak, PyRIT, Promptfoo, Markdown findings report | 64% of cyber postings now ask for AI skills; red-teaming a model you host is safe, legal, and directly hireable. | `A6BhGdttz9k` — Red Teaming with Garak, PyRIT, and Promptfoo |
| cy-8 | Advanced | Software Supply-Chain Guard: SBOM, Signing, and Provenance in CI | GitHub Actions, Trivy, Syft, Cosign / Sigstore, SLSA provenance, OPA policy gate | Supply-chain attacks drove the biggest incidents of the last two years; signed artifacts with attestations are a DevSecOps must-have. | `nF15vzo5Gts` — Creating an SBOM Attestation with Trivy and Cosign from Sigstore |
| cy-9 | Advanced | Detection Engineering for AI Agent Telemetry | OpenSearch Security Analytics, Sigma rules, synthetic agent logs (prompts, tool calls, retrievals), Python | Detecting jailbreak loops, credential leakage in prompts, and abnormal retrieval volume is a new, unfilled SOC skill. | `PBXWJqA5NL4` — Creating Custom Rules in OpenSearch Security Analytics |

### Data Analyst

| ID | Level | Title | Stack | Why now | Candidate video |
|---|---|---|---|---|---|
| da-6 | Beginner | Laptop Lakehouse: DuckDB, Parquet, and a One-Page Dashboard | DuckDB, Python, Parquet, Streamlit or Evidence | DuckDB plus Parquet is the default starter analytics stack in 2026 and runs free on any laptop. | `3KZyUboRwM8` — Getting Started With DuckDB For Data Analytics In Python |
| da-7 | Intermediate | Semantic Layer and Data Contracts with dbt, Queried in Plain English | dbt Core, MetricFlow, dbt contracts and tests, DuckDB, small text-to-SQL layer with guardrails | Analytics engineers are now judged on contracts, tests, and machine-readable metric definitions that AI tools can query consistently. | `3YXqY1lbTFI` — dbt Semantic Layer Workshop |
| da-8 | Advanced | Streaming Lakehouse: Redpanda to Iceberg to DuckDB | Redpanda (Kafka API), Apache Iceberg, DuckDB or Trino, Python producer, Grafana | Open table formats are the architecture decision of the decade; a streaming pipeline that lands in Iceberg is a senior-level talking point. | `MCIcgQs0pFo` — Getting started with Redpanda on Apache Iceberg |

### Help Desk

| ID | Level | Title | Stack | Why now | Candidate video |
|---|---|---|---|---|---|
| hd-8 | Intermediate | IT Support Agent in Copilot Studio with SharePoint Knowledge and Ticket Creation | Microsoft Copilot Studio, SharePoint, Power Automate, Microsoft Teams | Microsoft runs its own IT front door on a Copilot agent; building one is the most current help-desk skill you can show. | `KqJ1rbaGGK4` — Create an AI Ticketing System with Copilot |
| hd-9 | Advanced | Employee Self-Service Portal on Power Pages and Dataverse | Power Pages, Dataverse, Power Automate approvals, Entra ID auth | A ticket-and-request portal with role-based access is what enterprises ask junior admins to maintain and extend. | `1RmI6tkaU4I` — Build a Customer Self-Service Portal in Microsoft Power Pages Step-by-Step |

### Software Engineer

| ID | Level | Title | Stack | Why now | Candidate video |
|---|---|---|---|---|---|
| sw-6 | Beginner | API-First Service with OpenAPI, a Generated SDK, and Contract Tests | OpenAPI 3.1, FastAPI or Express, OpenAPI Generator, Schemathesis or Pact, GitHub Actions | Design-first APIs with generated clients are how platform teams ship; contract tests prove you understand integration risk. | `YJK03LdXwfQ` — Complete API Tutorial (from design to implementation with OpenAPI) |
| sw-7 | Intermediate | Local-First Collaborative Editor with CRDTs | React, Yjs, y-webrtc or Hocuspocus, SQLite-Wasm with OPFS, IndexedDB fallback | Local-first is the architecture trend of 2026; CRDT sync shows real concurrency and state-synchronization skill. | `KmuYkvcXp3k` — Collaborative Text Editor like Google Docs with CRDTs and Lexical |
| sw-8 | Advanced | Event-Driven Microservices with the Outbox Pattern and Distributed Tracing | Go or Java, Kafka (Redpanda), Postgres outbox, Debezium, OpenTelemetry, Jaeger or Tempo | Solving the dual-write problem and tracing an event across services is the backend interview question of the year. | `ujeFmq5trik` — Go Kafka: Transactional Outbox Pattern in Microservices |

### Tech / IT Support

| ID | Level | Title | Stack | Why now | Candidate video |
|---|---|---|---|---|---|
| it-8 | Intermediate | Self-Healing Endpoints with Intune Remediation Scripts | Microsoft Intune Remediations, PowerShell detection/remediation pairs, Endpoint Analytics | Intune Suite is now bundled in Microsoft 365 E3/E5 as of July 2026, so remediation skills apply to far more employers. | `2nGe1-IMt34` — Getting Started with Microsoft Intune Proactive Remediations |
| it-9 | Intermediate | Homelab as Code: Proxmox, Terraform, Ansible, and CI | Proxmox VE, Terraform, Packer, Ansible, cloud-init, GitHub Actions or GitLab CI | Rebuildable infrastructure from a repo is what separates a sysadmin from an automation engineer. | `4iQ1E3oazoc` — Automate Your Home Lab with Terraform, Packer, Ansible and GitLab CI/CD (2025) |
| it-10 | Advanced | Passwordless Enterprise: Entra ID, Windows Hello for Business, and FIDO2 | Microsoft Entra ID, Windows Hello for Business, FIDO2 security keys, Conditional Access, Intune | Zero-trust identity is the top security priority in postings, and a passwordless tenant is a concrete, demoable build. | `q1_3ECf9bJU` — Implementing Passwordless Authentication with Microsoft Entra ID for SMB, Part 1 |

## Suggested order

1. **Fill the empty-feeling cells first**: cl-7, cs-6, cs-8, da-6, da-8, hd-8, hd-9, sw-6, sw-8, it-10. That takes every path to at least 2 per level.
2. **Then the AI-adjacent set**: ai-5, ai-7, cy-7, cy-9. These carry the strongest 2026 signal and cross-link well with the existing prompt-injection and multi-agent cards.
3. **Then the rest** as videos verify.

## Before adding any card

- Verify the video in Actions (`npm run check:videos`) and confirm it allows embedding.
- Add the entry to both `index.html` and the `match.html` mirror; the build fails if they drift.
- Reuse the existing card shape: `summary`, `tech`, `skills`, `why`, `useCase`, `bonus`, `aiAssist`, `prompt`, `showcase`, six `steps`.
- Keep `aiAssist` and `prompt` pointed at Claude, as the current cards do.

## Sources

- [4 Portfolio Projects Every AI FDE Should Build in 2026](https://www.sundeepteki.org/advice/the-4-portfolio-projects-every-ai-forward-deployed-engineer-should-build-in-2026)
- [Top 7 AI Agent Frameworks for Developers in 2026](https://dev.to/thedailyagent/top-7-ai-agent-frameworks-for-developers-in-2026-3o63)
- [Agent observability: The complete guide for 2026](https://www.braintrust.dev/articles/agent-observability-complete-guide-2026)
- [New AI Skills for Cybersecurity Engineers in 2026](https://www.practical-devsecops.com/new-ai-skills-cybersecurity-engineers/)
- [5 AI Security Projects That Will Get You Hired in 2026](https://cloudsecurityguy.substack.com/p/5-ai-security-projects-that-will)
- [64% of Cybersecurity Job Listings Now Require AI Skills](https://securitycareers.help/cybersecurity-jobs-ai-ml-skills-required-2026/)
- [Platform Engineering in 2026: The Definitive Guide](https://levstack.io/en/blog/platform-engineering-2026/)
- [10 observability tools platform engineers should evaluate in 2026](https://platformengineering.org/blog/10-observability-tools-platform-engineers-should-evaluate-in-2026)
- [Cloud Computing Projects to Build a Cloud Portfolio (2026)](https://www.datacamp.com/blog/cloud-computing-projects)
- [The analytics engineer in 2026 (dbt Labs)](https://www.getdbt.com/blog/the-analytics-engineer-in-2026-system-designer-governance-owner-ai-context-provider)
- [Open-Source Data Engineering Projects (2022-2026)](https://www.ssp.sh/brain/open-source-data-engineering-projects/)
- [The Architecture Of Local-First Web Development (Smashing, May 2026)](https://www.smashingmagazine.com/2026/05/architecture-local-first-web-development/)
- [WebAssembly Ecosystem 2026](https://reintech.io/blog/webassembly-ecosystem-2026-tools-frameworks-runtimes)
- [Portfolio Roadmap 2026: 5 Projects That Get Interviews](https://medium.com/@ashusk_1790/portfolio-roadmap-2026-5-projects-that-get-interviews-ddcb9716b46b)
- [Microsoft 365 adds advanced Intune solutions at scale](https://techcommunity.microsoft.com/blog/microsoftintuneblog/microsoft-365-adds-advanced-microsoft-intune-solutions-at-scale/4474272)
- [Transforming IT support across Microsoft with the Employee Self-Service Agent](https://www.microsoft.com/insidetrack/blog/transforming-it-support-across-microsoft-with-the-employee-self-service-agent/)
- [The 6 most in-demand tech skills in 2026 (Pluralsight)](https://www.pluralsight.com/resources/blog/upskilling/top-tech-skills-2026-with-tests)
- [2026 Technology job market: In-demand roles (Robert Half)](https://www.roberthalf.com/us/en/insights/research/data-reveals-which-technology-roles-are-in-highest-demand)
