export interface ModeCardData {
  num: string
  name: string
  tag: string
  title: string
  desc: string
}

export interface FeatureData {
  icon: string
  title: string
  desc: string
}

export interface StackCardData {
  label: string
  name: string
  note: string
  highlighted?: boolean
}

export const nav = {
  logo: { text: 'CRAFTCV', betaLabel: 'BETA' },
  links: [
    { label: 'MODES', href: '#modes' },
    { label: 'FEATURES', href: '#features' },
    { label: 'STACK', href: '#stack' },
    { label: 'DOCS', href: '#docs' },
    { label: 'GITHUB ↗', href: 'https://github.com', external: true },
  ],
  cta: {
    primary: 'Open App →',
    primaryHref: 'http://localhost:3000/editor',
    secondary: 'View Source',
    secondaryHref: 'https://github.com',
  },
}

export const hero = {
  tagPill: '[ CRAFTCV / V0.1.0-BETA · LIVE ]',
  headlineLine1: 'A RESUME BUILDER',
  headlineLine2: '/ FOR ENGINEERS',
  headlineLine3: '/ WHO SHIP.',
  lead: 'Local-first AI. JD-tailored bullets. Live scoring out of 100. Zero cloud lock-in. Built for one user — you.',
  leadBold: ['JD-tailored', 'Live scoring out of 100', 'Zero cloud lock-in'],
  cta: {
    primary: 'Open App →',
    primaryHref: 'http://localhost:3000/editor',
    secondary: 'View Source',
    secondaryHref: 'https://github.com',
  },
  statusLine: 'OLLAMA RUNNING · QWEN2.5:14B · MAC M2 · LOCAL',
}

export const marqueeItems: string[] = [
  'LOCAL-FIRST AI',
  'JD TAILORING',
  'LIVE SCORING',
  'VERSION SWITCHER',
  'ATS-CLEAN PDF',
  'NO CLOUD LOCK-IN',
  'BULLET REWRITES',
]

export const modes = {
  tag: '[ FOUR MODES ]',
  heading: 'Write, tailor, preview, score. Repeat until 90+.',
  headingHighlight: 'Repeat until 90+.',
  subheading:
    "Every mode does one thing well. Switch tabs, no context loss. Your master resume stays canonical; per-role versions branch off without diverging.",
  cards: [
    {
      num: '01',
      name: 'EDITOR',
      tag: 'PRIMARY',
      title: 'Write bullets.\nAI rewrites them.',
      desc: 'Type a rough bullet — local Ollama rewrites it with metric scaffolding, action verbs, and impact framing. Accept, edit, or skip. No cloud round-trip.',
    },
    {
      num: '02',
      name: 'TAILOR',
      tag: 'JD MATCH',
      title: 'Paste a JD.\nGet a match score.',
      desc: "See exactly which keywords are present, which are missing, and where the JD's language doesn't match your resume's. Mirror the language to close gaps.",
    },
    {
      num: '03',
      name: 'PREVIEW',
      tag: 'PDF-READY',
      title: 'See it as a PDF.\nBefore you send it.',
      desc: 'Single-column, ATS-clean rendering. Switch between master and tailored versions instantly. Cmd+P to export, no design tweaks needed.',
    },
    {
      num: '04',
      name: 'SCORE',
      tag: 'FEEDBACK',
      title: 'Score it.\nFix the gaps.',
      desc: 'Out-of-100 score across Impact, Language, Tailoring, Format, Length. Prioritized action items tell you what to fix first to push the number up.',
    },
  ] satisfies ModeCardData[],
}

export const features = {
  tag: '[ FEATURES ]',
  heading: 'Built like a tool.',
  headingAccent: 'Not a SaaS.',
  subheading:
    "No accounts. No paywalls. No ads. No tracking. Just the things that actually move your resume from 'OK' to 'interview'.",
  items: [
    {
      icon: '⚡',
      title: 'Local-first AI',
      desc: 'Ollama runs on your machine. Bullet rewrites and scoring happen offline. Your resume data never leaves localhost.',
    },
    {
      icon: '◎',
      title: 'JD Tailoring',
      desc: "Paste any JD, get a match score, see missing keywords, and language gaps. Mirror the JD's words intelligently — not stuff them.",
    },
    {
      icon: '▦',
      title: 'Live Scoring',
      desc: 'Out of 100, across five dimensions. Re-scores as you type. Action items show what to fix first for max score gain.',
    },
    {
      icon: '⊞',
      title: 'Master + Versions',
      desc: 'One canonical resume. Branch off per-role versions without losing the truth. Switch in one click. Diff like git.',
    },
    {
      icon: '▤',
      title: 'ATS-clean PDF',
      desc: 'Single column. No photos. No skill bars. No icons. Print-ready. Recruiters and parsers both happy.',
    },
    {
      icon: '★',
      title: 'Bullet Rewrites',
      desc: 'Type a rough bullet, AI rewrites it with metric scaffolding, action verbs, and impact framing. Accept, edit, retry, skip.',
    },
  ] satisfies FeatureData[],
}

export const stack = {
  tag: '[ THE STACK ]',
  heading: 'Free to run.',
  headingAccent: 'Forever.',
  subheading:
    "Local AI for development. Free-tier cloud APIs for production. The kind of architecture that doesn't get more expensive the more you use it.",
  subheadingBold: "doesn't get more expensive",
  cards: [
    { label: '[ LOCAL ]', name: 'Ollama', note: 'qwen2.5:14b for rewrites · qwen2.5:7b for scoring · runs on M2 silently', highlighted: true },
    { label: '[ PROD ]', name: 'Groq', note: 'Llama 3.3 70B · 14,400 req/day free · 500+ tok/sec', highlighted: true },
    { label: '[ FALLBACK ]', name: 'Gemini Flash', note: '1M tokens/day · 1,500 req/day · OpenAI-compatible' },
    { label: '[ APP ]', name: 'Next.js + TS', note: 'Server Components · Tailwind · Vercel deploy · Print CSS', highlighted: true },
    { label: '[ DATA ]', name: 'JSON Files', note: 'master.json + per-version files · git-trackable · zero DB' },
    { label: '[ EXPORT ]', name: 'Native Print', note: 'Cmd+P → PDF · pixel-perfect · no headless Chrome' },
  ] satisfies StackCardData[],
  callout: {
    tag: '[ THE TRICK ]',
    title: 'One env var. Zero code changes.',
    body: "Switch between local Ollama and prod Groq with a single flag. The lib/llm.ts abstraction layer handles everything else.",
    codeBlock: `# .env.local (development)
LLM_PROVIDER=ollama
OLLAMA_MODEL=qwen2.5:14b

# .env.production
LLM_PROVIDER=groq
GROQ_MODEL=llama-3.3-70b`,
  },
}

export const cta = {
  heading: 'READY TO',
  headingAccent: 'CRAFT?',
  subheading:
    'Open the app and start with the master resume — or paste a JD straight into the Tailor tab and watch it match.',
  primary: 'Open App →',
  primaryHref: 'http://localhost:3000/editor',
  secondary: 'Clone the Repo',
  secondaryHref: 'https://github.com',
}

export const footer = {
  left: ['CRAFTCV', ' · PERSONAL BUILD · MAC M2 · OLLAMA LOCAL'],
  right: 'V0.1.0-BETA · 2026 · MIT LICENSE',
}
