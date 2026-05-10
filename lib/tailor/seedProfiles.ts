import type { JdProfile } from '@/lib/types'

const CANVA_JD = `We are looking for a Full Stack Software Engineer to join the Platform Integrations team at Canva.

You will be responsible for building and maintaining integrations with external platforms including YouTube, LinkedIn, Meta and others.

Requirements:
• 3+ years of TypeScript experience
• Strong React.js / Next.js skills
• Node.js backend development
• AWS infrastructure (ECS, Lambda, S3)
• REST and GraphQL API design
• Experience with A/B testing frameworks (Optimizely a plus)
• Understanding of distributed systems at scale
• CI/CD pipeline experience

We value engineers who take ownership end-to-end and can ship measurable business impact.`

const GOOGLE_JD = `Senior Software Engineer (L5) — Google Cloud Platform

Build and operate large-scale distributed systems serving billions of requests per day.

Responsibilities:
• Design and implement microservices in Go and Java
• Own services end-to-end including on-call rotations
• Drive system architecture decisions
• Mentor mid-level engineers

Requirements:
• 5+ years of professional engineering experience
• Strong system design fundamentals
• Experience with Kubernetes, gRPC, distributed databases
• Proficiency in at least one of Go, Java, C++
• Experience operating production services at scale`

const ATLASSIAN_JD = `Frontend Engineer — Atlassian (Confluence team)

We're hiring frontend engineers to evolve the Confluence editor experience used by millions of teams.

Responsibilities:
• Build collaborative editing features in React and TypeScript
• Optimize bundle size and rendering performance
• Improve accessibility (a11y) across the editor surface
• Work closely with design on Figma specs

Requirements:
• Deep experience with React, Redux, TypeScript
• Familiarity with Webpack and modern build tooling
• Storybook-driven component development
• Strong CSS skills (SCSS, Tailwind a plus)
• A11y / WCAG knowledge`

export const SEED_PROFILES: JdProfile[] = [
  {
    id: 'seed-canva',
    name: 'Canva — Full Stack Engineer',
    jdText: CANVA_JD,
    lastAnalysis: null,
    createdAt: '2026-05-10T00:00:00.000Z',
  },
  {
    id: 'seed-google',
    name: 'Google — Senior SWE L5',
    jdText: GOOGLE_JD,
    lastAnalysis: null,
    createdAt: '2026-05-10T00:00:00.000Z',
  },
  {
    id: 'seed-atlassian',
    name: 'Atlassian — Frontend Engineer',
    jdText: ATLASSIAN_JD,
    lastAnalysis: null,
    createdAt: '2026-05-10T00:00:00.000Z',
  },
]
