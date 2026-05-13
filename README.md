# CraftCV

An AI-powered, local-first resume builder for engineers. Upload your resume, edit bullets with AI suggestions, tailor to job descriptions, preview as an ATS-clean PDF, and track your score — all in one tool.

## Features

### Upload & Parse
- Drag-and-drop PDF or DOCX files
- AI extracts your header, work experience, skills, education, and projects into a structured format
- Shows a summary of what was extracted before you start editing

### Editor
- Three-panel layout: sections list, main editor, and live score sidebar
- Edit bullets, experience details, skills, education, and projects inline
- **AI bullet rewriting**: type a rough bullet and get a polished version with metrics, action verbs, and impact framing
- **Block rewrite**: rewrite entire experience descriptions or project blocks at once, with a before/after diff view
- **Resume versions**: branch your master resume into role-specific variants (e.g. "Google — Staff SWE", "Meta — IC5") without losing the original

### Tailor
- Paste a job description and get an instant match score (0–100)
- See which keywords are present (green) and missing (red) from your resume
- Sub-scores for tech stack coverage, language mirroring, and domain terminology
- Language suggestions that map your existing phrases to JD language with rationale
- Save JD profiles locally and reload them with keyboard shortcuts (Cmd+1/2/3)

### Preview
- ATS-compliant single-column PDF layout
- Live page count and overflow indicator (underfilled / good / overfilled)
- Export via Cmd+P — no external tool needed

### Score
- Resume scored 0–100 across five axes: Impact, Language, Tailoring, Format, Length
- Prioritized action items (P1/P2/P3) with direct links to the specific bullets to fix
- Score history chart showing weekly progression
- Compare scores across your resume versions

## AI Providers

CraftCV resolves the LLM provider in this order:

| Environment | Provider | Model |
|---|---|---|
| Local (default) | Ollama | `qwen2.5:14b` |
| Production | Groq | `llama-3.3-70b-versatile` |
| Production (fallback) | Google Gemini | `gemini-1.5-flash` |

All AI responses stream token-by-token. If the AI fails, deterministic scoring rules kick in automatically.

## User Flow

1. **Upload** your existing resume (PDF/DOCX)
2. **Editor** → refine bullets with AI, create role-specific versions
3. **Tailor** → paste a job description, fix missing keywords
4. **Score** → address the top action items
5. **Preview** → export ATS-clean PDF with Cmd+P

## Keyboard Shortcuts

| Shortcut | Page | Action |
|---|---|---|
| Cmd+S | Editor | Force save |
| Cmd+E | Tailor / Score | Switch to Editor |
| Cmd+P | Score | Switch to Preview |
| Cmd+R | Score | Re-run score |
| Cmd+1/2/3 | Tailor / Score | Load saved JD profile or switch version |
| Esc | Any modal | Close |

## Data & Privacy

- All resume data is stored in your browser's localStorage — nothing is sent to a server
- Saved JD profiles never leave your machine
- When using Ollama, all AI inference runs locally with no network calls

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **State**: Zustand
- **AI**: Ollama / Groq / Google Gemini (streaming)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

For local AI inference, install [Ollama](https://ollama.com) and pull the model:

```bash
ollama pull qwen2.5:14b
```

For cloud providers, set environment variables in `.env.local`:

```bash
GROQ_API_KEY=your_key_here
# or
GOOGLE_GENERATIVE_AI_API_KEY=your_key_here
```

## Deployment

The app is deployed on Vercel. Every merge to `main` triggers an automatic redeployment.

For CI: every pull request runs ESLint via GitHub Actions before it can be merged.
