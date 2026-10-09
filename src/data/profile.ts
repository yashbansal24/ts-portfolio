// Single source of truth for every fact on the site.
// Sources: résumé (Yash_Bansal_Modern.pdf, 2026), github.com/yashbansal24,
// and the previous version of this site (legacy/src/Experience.tsx).

export const profile = {
  name: 'Yash Bansal',
  firstName: 'Yash',
  lastName: 'Bansal',
  title: 'Staff Software Engineer',
  focus: ['Applied AI & Agentic Systems', 'Distributed Systems', 'AI Platform Engineering'],
  location: 'United Arab Emirates',
  summary:
    'I build multi-agent systems that run for hours without falling over — and the distributed platforms underneath them. ' +
    'Eight years across PayPal, H1, Dataloop, Deel and Presight (G42): payments at 25M+ daily users, ' +
    'data platforms at terabyte scale, and today, agent harnesses that automate the whole software lifecycle.',
  email: 'yashbansal97@gmail.com',
  links: {
    linkedin: 'https://www.linkedin.com/in/theyashbansal',
    github: 'https://github.com/yashbansal24',
    website: 'https://www.theyashbansal.com',
    slayb: 'https://slayb.tech',
  },
  careerStart: 2018,
} as const;

export type Stat = { value: string; label: string; context: string };

export const stats: Stat[] = [
  { value: '98%+', label: 'agent workflow success', context: 'Long-running agent harnesses at Presight' },
  { value: '~70%', label: 'less SDLC time', context: 'Multi-agent SDLC automation across 100+ apps' },
  { value: '25M+', label: 'daily active users', context: 'PayPal invoicing & payouts, sub-200 ms' },
  { value: '20M+', label: 'notification events', context: "Deel's Notifications platform, built from zero" },
  { value: '2', label: 'US patents', context: 'Machine learning & web performance' },
  { value: '$1M+', label: 'saved per year', context: 'Patented neural-network algorithm at PayPal' },
];

export type Role = {
  company: string;
  companyNote?: string;
  title: string;
  location: string;
  start: string;
  end: string;
  headline: string;
  highlights: string[];
  stack: string[];
};

export const experience: Role[] = [
  {
    company: 'Presight',
    companyNote: 'G42',
    title: 'Staff Software Engineer — Cloud AI',
    location: 'UAE',
    start: 'Nov 2025',
    end: 'Present',
    headline: 'Multi-agent systems that automate the end-to-end software lifecycle.',
    highlights: [
      'Architected production multi-agent systems automating requirements, design, PRD, planning, parallel coding/QA and deployment — 100+ applications, 100+ modules, up to 6 agents per module, ~70% less SDLC time.',
      'Designed long-running agent harnesses with 98%+ workflow success: model routing, context-window management, automatic compaction, structured outputs, tool calling and MCP — at ~0.7M–3M tokens per application.',
      'Built agent evals and reliability: bounded loops, retry policies, deterministic build/test graders, LLM-as-a-Judge, human-in-the-loop and escalation paths.',
      'Led architecture for secure B2B AI platforms — sandboxed and air-gapped deployments, RBAC, guardrails, auditability, blast-radius isolation, SOC 2, GDPR and data residency.',
      'Designed serving for self-hosted open-weight models alongside hosted APIs; evaluated LoRA adapters and distillation against prompting and RAG.',
    ],
    stack: ['Multi-agent orchestration', 'MCP', 'LLM evals', 'Kubernetes', 'Air-gapped', 'LoRA'],
  },
  {
    company: 'Deel',
    title: 'Senior Backend Engineer',
    location: 'UAE',
    start: 'Jun 2024',
    end: 'Oct 2025',
    headline: 'Founded the Notifications platform; built LangGraph agents for approvals.',
    highlights: [
      "Founded and built Deel's Notifications platform from scratch — 20M+ events across email, push and in-app.",
      'Built LangGraph AI agents that automate approvals, validations and change-management workflows.',
      'Developed RAG retrieval over customer data and support knowledge bases.',
      'Built secure sandboxes against RCE, prompt injection, XSS and tool misuse — inside SOC 2, PCI DSS and GDPR constraints.',
    ],
    stack: ['LangGraph', 'RAG', 'Kafka', 'Node.js', 'PostgreSQL', 'AWS'],
  },
  {
    company: 'Dataloop.ai',
    companyNote: 'acquired by Dell',
    title: 'Senior Software Engineer',
    location: 'UAE',
    start: 'May 2023',
    end: 'Jun 2024',
    headline: 'AI data infrastructure for annotation, training and petabyte-scale datasets.',
    highlights: [
      'Core backend and SDK work; Redis caching over 6 TB of SQL and 15 TB of MongoDB data.',
      'SDK capabilities for efficient access to petabyte-scale AI datasets.',
      'Database compaction and archival that saved ~$300K a year.',
      'Testing frameworks for clients across GCP, AWS and Azure.',
    ],
    stack: ['TypeScript', 'Redis', 'SingleStore', 'MongoDB', 'GCP'],
  },
  {
    company: 'H1',
    title: 'Lead Software Engineer',
    location: 'India',
    start: 'Feb 2022',
    end: 'May 2023',
    headline: 'Led a team of four building a Snowflake-like ingestion platform.',
    highlights: [
      'Led 4 engineers building a highly scalable ingestion platform processing 10M+ records in minutes.',
      'Hugging Face transformer models generating insights on healthcare data for 1M+ key industry doctors.',
      'Entity-resolution pipelines with graph databases to deduplicate and connect records across sources.',
      'Ran organisation-wide workshops on LLMs, transformers and ML systems; Terraform on AWS and CI/CD.',
    ],
    stack: ['Python', 'Hugging Face', 'Kafka', 'NestJS', 'Terraform', 'AWS'],
  },
  {
    company: 'PayPal',
    title: 'Senior Software Engineer',
    location: 'India',
    start: 'Jun 2018',
    end: 'Feb 2022',
    headline: 'Invoicing and payouts for 25M+ daily users at sub-200 ms.',
    highlights: [
      'Architecture for invoicing and payout systems serving 25M+ DAU with sub-200 ms latency; APIs at 10k+ QPS.',
      'Launched 5 high-impact A/B payment experiments serving 5M+ daily checkouts.',
      'Built the new Invoicing mobile and desktop experience from scratch in React.',
      'Invented and patented a neural-network-based algorithm saving $1M+ a year; applied CQRS, Saga, Outbox and distributed locking.',
      'Improved wildcard search response time over a billion records by 25%.',
    ],
    stack: ['Node.js', 'React', 'Java', 'Redis', 'Distributed systems'],
  },
];

export type Patent = { number: string; title: string; issued: string; employer: string; note: string };

export const patents: Patent[] = [
  {
    number: 'US 10,956,698',
    title: 'Systems and methods for using machine learning to determine an origin of code',
    issued: 'Mar 2021',
    employer: 'PayPal',
    note: 'Machine learning that traces where a piece of code came from.',
  },
  {
    number: 'US 17393941',
    title: 'Reducing computing calls for webpage load times and resources',
    issued: 'Feb 2023',
    employer: 'PayPal',
    note: 'Fewer calls, faster pages, lighter infrastructure.',
  },
];

export type SkillGroup = { name: string; items: string[] };

export const skills: SkillGroup[] = [
  {
    name: 'Applied AI',
    items: [
      'Agentic systems', 'Multi-agent orchestration', 'Guardrails', 'RAG', 'Context engineering',
      'Model routing', 'Context compaction', 'Structured outputs', 'Tool calling', 'MCP',
      'LLM-as-a-Judge', 'Deterministic evals', 'Human-in-the-loop', 'Long-running workflows',
    ],
  },
  {
    name: 'Frameworks & Backend',
    items: ['Python', 'FastAPI', 'LangGraph', 'OpenClaw', 'Hugging Face', 'Node.js', 'TypeScript', 'REST', 'GraphQL'],
  },
  {
    name: 'Infrastructure',
    items: [
      'Kubernetes', 'Docker', 'Sandboxed execution', 'Kafka', 'Message queues', 'Microservices',
      'API gateways', 'Observability', 'CI/CD', 'Terraform', 'Argo Workflows',
    ],
  },
  {
    name: 'Cloud & Data',
    items: ['AWS', 'GCP', 'PostgreSQL', 'MongoDB', 'DynamoDB', 'SingleStore', 'Redis', 'Elasticsearch', 'MinIO'],
  },
  {
    name: 'Security & Reliability',
    items: [
      'AI security', 'Air-gapped deployments', 'Agent permission controls', 'Prompt-injection mitigation',
      'RCE mitigation', 'Privacy & data governance', 'JWT / CSRF / XSS', 'Unit, integration & E2E testing',
    ],
  },
  {
    name: 'Model Adaptation & Serving',
    items: [
      'Fine-tuning', 'LoRA adapters', 'Distillation', 'Open-weight self-hosting', 'Streaming inference',
      'Low-latency serving', 'Throughput tuning',
    ],
  },
  {
    name: 'Regulated Domains',
    items: ['Fintech', 'Payments', 'SOC 2', 'PCI DSS', 'GDPR', 'Data residency'],
  },
];

export type Education = { school: string; degree: string; place: string };

export const education: Education[] = [
  { school: 'Deakin University', degree: 'MBA', place: 'Australia' },
  { school: 'BITS Pilani', degree: 'B.E., Computer Science', place: 'India' },
];

export type Project = {
  name: string;
  tagline: string;
  description: string;
  tech: string[];
  url: string;
  urlLabel: string;
  stars?: number;
  year?: string;
  featured?: boolean;
};

// Slayb is from the résumé; the rest are verified against each repository's code and README.
export const projects: Project[] = [
  {
    name: 'Slayb',
    tagline: 'A live agentic AI platform with 20+ paying customers.',
    description:
      'Describe a goal and a coordinated team of agents carries it out. Slayb builds web apps and websites, and makes designs, data visualizations and slide decks on one platform. Its collaborative execution is inspired by MiroFish: many agents working on shared goals across multi-step workflows.',
    tech: ['Multi-agent orchestration', 'Generative AI', 'Goal-driven agents', 'Product engineering'],
    url: 'https://slayb.tech',
    urlLabel: 'slayb.tech',
    featured: true,
  },
  {
    name: 'Legal Intel Dashboard',
    tagline: 'Upload contracts in bulk, then ask them questions in plain English.',
    description:
      'A full-stack legal documents app. Bulk PDF/DOCX upload, metadata extraction (agreement type, governing law, geography, industry), natural-language questions translated into database filters, and a charts dashboard. Production touches: rate limiting, request IDs, security headers, health probes and Prometheus metrics.',
    tech: ['FastAPI', 'SQLModel', 'React', 'TypeScript', 'TanStack Query', 'Prometheus', 'Docker'],
    url: 'https://github.com/yashbansal24/legal-intel-dashboard',
    urlLabel: 'legal-intel-dashboard',
    year: '2025',
  },
  {
    name: 'Vehicle Detection & Counting',
    tagline: 'Counting traffic with classical computer vision.',
    description:
      'Detects moving vehicles in traffic video and overlays a live per-frame count. Uses MOG2 background subtraction, morphological cleanup with shadow removal, and connected-component analysis to box each vehicle.',
    tech: ['Python', 'OpenCV', 'NumPy'],
    url: 'https://github.com/yashbansal24/Vehicle_Detection_and_Counting',
    urlLabel: 'Vehicle_Detection_and_Counting',
    stars: 8,
    year: '2018',
  },
  {
    name: 'Kafka Producer–Consumer',
    tagline: 'An event pipeline from a public API into MongoDB.',
    description:
      'A TypeScript publisher pulls city street data from a government open-data API and streams it through Kafka. A consumer persists it to MongoDB via Prisma. The local stack runs in Docker Compose: Redpanda, its console, MongoDB, SingleStore and RabbitMQ.',
    tech: ['TypeScript', 'Node.js', 'Kafka', 'Prisma', 'MongoDB', 'Docker Compose'],
    url: 'https://github.com/yashbansal24/producer-consumer-nodejs-ts',
    urlLabel: 'producer-consumer-nodejs-ts',
    year: '2023',
  },
  {
    name: 'Fuzzy Dietary Clustering',
    tagline: 'Fuzzy logic that plans a meal.',
    description:
      'Turns nutrients into triangular fuzzy numbers, clusters foods with fuzzy C-means across several cluster counts, then builds a diet plan from the best calorie cluster with a 0/1 knapsack. Ships with a Tkinter GUI.',
    tech: ['Python', 'scikit-fuzzy', 'NumPy', 'Tkinter'],
    url: 'https://github.com/yashbansal24/Fuzzy_Based_Dietary_Clustering',
    urlLabel: 'Fuzzy_Based_Dietary_Clustering',
    stars: 5,
    year: '2017',
  },
  {
    name: 'Vector Space Search Engine',
    tagline: 'Retrieval before RAG: tf-idf, autocorrect and voice.',
    description:
      'A team-built ranked-retrieval engine over the Sherlock Holmes stories. It uses an inverted index with tf-idf weighting, heap-based ranking, Levenshtein autocorrect for query terms, and spoken queries via speech-to-text.',
    tech: ['Python', 'NLTK', 'Information retrieval', 'Speech recognition'],
    url: 'https://github.com/yashbansal24/Vector_space_model',
    urlLabel: 'Vector_space_model',
    stars: 3,
    year: '2017',
  },
  {
    name: 'PageRank',
    tagline: "Google's original idea, by power iteration.",
    description:
      'PageRank in C++ on a directed graph of 6,301 nodes and 20,777 edges. Teleportation handles dead ends and spider traps, and Python plots show the convergence and the ranked graph.',
    tech: ['C++', 'Python', 'networkx'],
    url: 'https://github.com/yashbansal24/PAGERANK_GOOGLE',
    urlLabel: 'PAGERANK_GOOGLE',
    stars: 2,
    year: '2017',
  },
  {
    name: 'SVD & CUR Recommenders',
    tagline: 'Four ways to guess what you will watch next.',
    description:
      'Compares user-user collaborative filtering, a baseline estimator, SVD (full and 90% energy) and CUR decomposition on about 1M movie ratings. Each method is scored on RMSE, Spearman correlation, precision@100 and runtime.',
    tech: ['C++', 'Python', 'NumPy', 'SciPy'],
    url: 'https://github.com/yashbansal24/SVD_CUR_COLLABORATIVE',
    urlLabel: 'SVD_CUR_COLLABORATIVE',
    year: '2017',
  },
];
