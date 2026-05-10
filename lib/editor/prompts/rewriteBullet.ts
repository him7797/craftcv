export type RewriteRequest = {
  rough: string
  context: {
    role?: string
    company?: string
    tech?: string[]
    siblingBullets?: string[]
  }
  retryHint?: 'different-angle' | 'shorter' | 'add-metric'
}

const HINTS: Record<NonNullable<RewriteRequest['retryHint']>, string> = {
  'different-angle':
    'This is a retry. Take a different angle from the previous attempt.',
  shorter:
    'This is a retry. Make this shorter — aim for ≤ 22 words.',
  'add-metric':
    'This is a retry. Force a concrete metric, even if you have to invent a plausible placeholder shape.',
}

export function buildRewritePrompt(req: RewriteRequest): string {
  const { rough, context, retryHint } = req
  const role = context.role?.trim() || 'Software Engineer'
  const company = context.company?.trim() || 'Unknown Company'
  const tech =
    context.tech && context.tech.length > 0 ? context.tech.join(', ') : 'None'
  const siblings =
    context.siblingBullets && context.siblingBullets.length > 0
      ? context.siblingBullets.map((s) => `- ${s}`).join('\n')
      : 'None'
  const hintLine = retryHint ? HINTS[retryHint] : ''

  return `You rewrite resume bullets for a senior software engineer. Output ONE bullet only — no preamble, no explanation, no quotes.

CONTEXT:
- Role: ${role}
- Company: ${company}
- Tech: ${tech}

SIBLING BULLETS (match their tone):
${siblings}

USER'S ROUGH BULLET:
${rough.trim()}

REWRITE RULES:
1. Start with a strong action verb: Engineered / Built / Deployed / Led / Shipped / Architected / Designed / Optimized / Reduced / Migrated.
2. Include at least one metric or quantifiable outcome. If the rough bullet has none, leave a literal placeholder: (add metric — e.g. X% session length increase).
3. Stay under 32 words.
4. Wrap metrics in {{m:...}}, tech/products in {{t:...}}, italic notes in {{i:...}}.
5. Match the tone of the sibling bullets above.
6. ${hintLine}

OUTPUT THE BULLET NOW:`
}
