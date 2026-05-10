/**
 * Curated dev-tech vocabulary for JD keyword extraction.
 * Multi-word terms appear before their substrings so longest-match wins.
 * All entries are matched case-insensitively against the JD text.
 */
const VOCABULARY: string[] = [
  // multi-word — match these first
  'AWS Lambda',
  'AWS ECS',
  'AWS Fargate',
  'AWS S3',
  'AWS EC2',
  'AWS App Runner',
  'AWS CloudFront',
  'AWS RDS',
  'AWS DynamoDB',
  'Google Cloud',
  'Azure DevOps',
  'CI/CD pipeline',
  'CI/CD',
  'A/B testing',
  'feature flags',
  'distributed systems',
  'concurrent users',
  'at scale',
  'third-party integrations',
  'REST API',
  'REST APIs',
  'GraphQL API',
  'event-driven',
  'event driven',
  'micro services',
  'microservices',
  'service oriented',
  'service-oriented',
  'machine learning',
  'deep learning',
  'natural language processing',
  'computer vision',
  'data pipeline',
  'data pipelines',
  'data warehouse',
  'cloud infrastructure',
  'system design',
  'unit testing',
  'integration testing',
  'end-to-end testing',
  'test driven development',
  'test-driven development',
  'continuous integration',
  'continuous deployment',
  'pull request',
  'code review',
  'agile development',
  'product engineer',
  'product mindset',
  'end-to-end ownership',
  'business impact',
  'measurable impact',
  'cross-functional',
  'cross functional',

  // languages
  'TypeScript',
  'JavaScript',
  'Python',
  'Java',
  'Kotlin',
  'Swift',
  'Objective-C',
  'C++',
  'C#',
  'Go',
  'Rust',
  'Ruby',
  'PHP',
  'Scala',
  'Elixir',
  'Erlang',
  'Haskell',
  'Clojure',
  'Bash',
  'Shell',
  'SQL',
  'HTML',
  'CSS',
  'SCSS',

  // frontend frameworks
  'React.js',
  'React Native',
  'React',
  'Next.js',
  'Vue.js',
  'Vue',
  'Angular',
  'Svelte',
  'SvelteKit',
  'Solid.js',
  'Remix',
  'Astro',
  'Nuxt',
  'Redux',
  'Zustand',
  'Tailwind',
  'Tailwind CSS',
  'Tailwind v4',
  'Material UI',
  'Chakra UI',
  'Radix',
  'Webpack',
  'Vite',
  'Rollup',
  'esbuild',
  'Babel',

  // backend frameworks
  'Node.js',
  'Express',
  'NestJS',
  'Fastify',
  'Hapi',
  'Koa',
  'Django',
  'Flask',
  'FastAPI',
  'Rails',
  'Spring',
  'Spring Boot',
  'Laravel',
  'Symfony',
  '.NET',
  'ASP.NET',
  'Phoenix',

  // data
  'PostgreSQL',
  'MySQL',
  'SQLite',
  'MongoDB',
  'Cassandra',
  'Redis',
  'Memcached',
  'Elasticsearch',
  'OpenSearch',
  'BigQuery',
  'Snowflake',
  'Databricks',
  'Spark',
  'Hadoop',
  'Kafka',
  'RabbitMQ',
  'NATS',
  'Pulsar',

  // cloud/devops
  'AWS',
  'Azure',
  'GCP',
  'Heroku',
  'Vercel',
  'Netlify',
  'DigitalOcean',
  'Cloudflare',
  'Docker',
  'Kubernetes',
  'k8s',
  'Helm',
  'Terraform',
  'Pulumi',
  'Ansible',
  'Chef',
  'Puppet',
  'GitHub Actions',
  'GitLab CI',
  'Jenkins',
  'CircleCI',
  'Travis',
  'ArgoCD',
  'Grafana',
  'Prometheus',
  'Datadog',
  'New Relic',
  'Sentry',
  'PagerDuty',

  // protocols/api
  'GraphQL',
  'gRPC',
  'WebSockets',
  'REST',
  'SOAP',
  'OAuth',
  'OAuth2',
  'OpenID',
  'JWT',
  'SAML',
  'OpenAPI',
  'Swagger',
  'Protobuf',
  'JSON',
  'XML',
  'YAML',

  // tools/methodologies
  'Git',
  'GitHub',
  'GitLab',
  'Bitbucket',
  'Jira',
  'Linear',
  'Notion',
  'Confluence',
  'Figma',
  'Sketch',
  'Storybook',
  'Optimizely',
  'LaunchDarkly',
  'Segment',
  'Amplitude',
  'Mixpanel',
  'Heap',
  'Posthog',
  'Snowplow',
  'Stripe',
  'Twilio',
  'Auth0',
  'Clerk',
  'Firebase',
  'Supabase',
  'Algolia',

  // platforms / 3rd-party
  'YouTube',
  'LinkedIn',
  'Meta',
  'Facebook',
  'Instagram',
  'TikTok',
  'Twitter',
  'Reddit',
  'Snapchat',
  'Pinterest',
  'Slack',
  'Discord',
  'Zoom',

  // ai/ml
  'OpenAI',
  'Anthropic',
  'GPT-4',
  'Claude',
  'LLM',
  'LLMs',
  'RAG',
  'embeddings',
  'transformer',
  'Hugging Face',
  'PyTorch',
  'TensorFlow',
  'scikit-learn',
  'pandas',
  'NumPy',
  'Jupyter',

  // mobile/native
  'iOS',
  'Android',
  'Flutter',
  'Xamarin',
  'Capacitor',
  'Ionic',
  'Expo',

  // misc
  'WebAssembly',
  'WASM',
  'Service Worker',
  'PWA',
  'SSR',
  'CSR',
  'ISR',
  'SEO',
  'Accessibility',
  'a11y',
  'i18n',
  'localization',
  'WCAG',
]

const STOPLIST = new Set<string>([
  'a',
  'an',
  'and',
  'or',
  'the',
  'of',
  'in',
  'on',
  'at',
  'to',
  'for',
  'with',
  'by',
  'is',
  'are',
  'was',
  'were',
  'be',
  'been',
  'being',
  'have',
  'has',
  'had',
  'do',
  'does',
  'did',
  'will',
  'would',
  'should',
  'could',
  'we',
  'you',
  'your',
  'our',
  'they',
  'them',
])

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9+#./-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const VOCAB_SORTED = [...VOCABULARY].sort((a, b) => b.length - a.length)

/**
 * Extract candidate JD keywords from raw text using a curated dev-tech vocabulary.
 * Returns terms in their canonical (vocabulary) casing — display normalization
 * (uppercasing) happens later in the UI layer (KeywordPill).
 */
export function extractKeywords(jdText: string): string[] {
  if (!jdText) return []
  const normalizedJd = normalize(jdText)
  const found: string[] = []
  const seen = new Set<string>()

  for (const term of VOCAB_SORTED) {
    const key = normalize(term)
    if (STOPLIST.has(key)) continue
    if (seen.has(key)) continue
    if (normalizedJd.includes(key)) {
      seen.add(key)
      found.push(term)
    }
  }

  return found
}

export function getVocabulary(): readonly string[] {
  return VOCABULARY
}

export function normalizeForMatch(s: string): string {
  return normalize(s)
}
