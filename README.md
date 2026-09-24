<p align="center">
  <h1 align="center">📚 LexiAgent</h1>
  <h3 align="center">Words, understood differently.</h3>
</p>

<p align="center">
An agentic AI dictionary and thesaurus that turns vocabulary lookup<br/>into a natural conversation.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React_19-20232A?style=flat&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Supabase-3FCF8E?style=flat&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Groq-F55036?style=flat&logo=data:image/svg+xml;base64,&logoColor=white" alt="Groq" />
  <img src="https://img.shields.io/badge/Merriam--Webster-2B579A?style=flat" alt="Merriam-Webster" />
  <img src="https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white" alt="Vercel" />
</p>

<p align="center">
  <a href="https://lexiagent.vercel.app"><strong>Live Demo</strong></a> · <a href="https://github.com/MSameer7-tech/Lexi-Agent"><strong>Repository</strong></a>
</p>

---

## Preview

> Screenshots coming soon.

---

## Why LexiAgent?

Traditional dictionaries are optimized for **lookup**. You enter a word, read one definition, and leave.

LexiAgent is designed for **exploration**.

```
"What does ephemeral mean?"
"How is it different from temporary?"
"Give me a literary example."
"What are its antonyms?"
```

It combines authoritative dictionary data from Merriam-Webster with a conversational AI layer powered by Groq, turning vocabulary into an interactive dialogue rather than a static page.

---

## Features

| | Feature | Description |
|---|---|---|
| 🤖 | **Agentic Dictionary** | Groq tool calling decides when to fetch dictionary data — the model reasons, then acts. |
| 📖 | **Structured Definitions** | Part-of-speech, meanings, and usage examples sourced from Merriam-Webster's Collegiate Dictionary. |
| 🔄 | **Conversational Exploration** | Ask follow-up questions about usage, nuance, etymology, and context. |
| 🔊 | **Pronunciation** | Phonetic notation and native audio playback from Merriam-Webster. |
| 🔎 | **Synonyms & Antonyms** | Dedicated thesaurus lookup, merged into dictionary results automatically. |
| 🧠 | **Personal Vocabulary** | Save words to a personal collection. Word history tracks lookup frequency and timestamps. |
| 💬 | **Cloud Conversations** | Authenticated users get persistent, paginated chat history across sessions and devices. |
| 🔐 | **Secure Architecture** | All API keys remain server-side inside Supabase Edge Functions. Nothing leaks to the browser. |
| 🌗 | **Light & Dark Themes** | Carefully designed for both modes with synchronized global state. |
| ✨ | **Editorial UI** | Warm ivory palette, restrained motion via Framer Motion, and tactile typographic design. |

---

## How the Agent Works

LexiAgent uses an **agentic loop** — the LLM can autonomously decide to call backend tools before composing its response.

```mermaid
flowchart LR
    A["User Message"] --> B["Supabase Edge Function"]
    B --> C["Groq LLM"]
    C -->|"Tool Call"| D["dictionary_lookup"]
    D --> E["Merriam-Webster Dictionary"]
    D --> F["Merriam-Webster Thesaurus"]
    E --> D
    F --> D
    D -->|"Tool Result"| C
    C -->|"Final Response"| B
    B --> G["Response + Structured Data"]
    B --> H[("Supabase PostgreSQL")]
```

**The flow:**

1. User sends a message from the React frontend.
2. The Edge Function forwards the message (with up to 12 messages of conversation history) to Groq.
3. If the LLM determines dictionary data is needed, it issues a `dictionary_lookup` tool call.
4. The Edge Function fetches both the **dictionary** and **thesaurus** from Merriam-Webster concurrently, merges synonyms and antonyms, and returns the combined result to the model.
5. Groq generates the final conversational response using the retrieved data.
6. The Edge Function persists the conversation and word history to Supabase, then returns the response along with structured dictionary data and agent event metadata.

The model can iterate up to **3 tool-calling rounds** per request. Only two tools are permitted: `dictionary_lookup` and `thesaurus_lookup`. Any other tool call is rejected with an error.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 · TypeScript · Vite |
| Styling | Tailwind CSS 4 |
| State | Zustand |
| Animation | Framer Motion |
| Icons | Lucide React |
| Markdown | react-markdown |
| Backend | Supabase Edge Functions (Deno) |
| Database | PostgreSQL via Supabase |
| Auth | Supabase Auth (Email, Google, GitHub) |
| LLM | Groq (Llama 3) |
| Dictionary | Merriam-Webster Collegiate Dictionary API |
| Thesaurus | Merriam-Webster Thesaurus API |
| Linter | oxlint |
| Deployment | Vercel (frontend) · Supabase (backend) |

---

## Architecture

```
┌───────────────────────────────────┐
│          React Frontend           │
│   Routing · State · Auth · UI    │
└───────────────┬───────────────────┘
                │ authenticated request
                ▼
┌───────────────────────────────────┐
│     Supabase Edge Function        │
│  lexi-chat · Deno · CORS · RLS  │
└───────┬───────────────┬───────────┘
        │               │
        ▼               ▼
┌──────────────┐ ┌─────────────────┐
│   Groq LLM   │ │ Merriam-Webster │
│ Tool Calling │ │ Dictionary/     │
│   (Llama 3)  │ │ Thesaurus API   │
└──────────────┘ └─────────────────┘
                │
                ▼
        ┌───────────────┐
        │   Supabase    │
        │ PostgreSQL    │
        │ Auth · RLS    │
        └───────────────┘
```

**Security boundary:** The browser never sees Groq or Merriam-Webster API keys. The frontend sends authenticated requests to the Edge Function, which holds all server-side secrets. Row Level Security on every database table ensures complete account isolation.

---

## Project Structure

```
Lexi-Agent/
├── public/                        # Static assets, favicon, MW logos
├── src/
│   ├── components/
│   │   ├── agent/                 # ActivityTimeline — agent process visualization
│   │   ├── dictionary/            # WordResult — structured dictionary card
│   │   ├── history/               # HistoryDrawer — sidebar chat history
│   │   └── ui/                    # MarkdownRenderer
│   ├── contexts/                  # AuthContext — session lifecycle, guest/cloud hydration
│   ├── layouts/                   # MainLayout — navbar, theme toggle, routing shell
│   ├── lib/                       # Supabase client, response parser, motion utilities
│   ├── pages/                     # Home, Auth, Vocabulary, Settings, History
│   ├── services/                  # lexiAgentApi — all Edge Function calls
│   ├── store/                     # Zustand stores (history, theme)
│   └── types/                     # TypeScript interfaces
├── supabase/
│   ├── functions/
│   │   └── lexi-chat/             # Edge Function: index.ts, groq.ts, tools/, prompts/
│   └── migrations/                # 4 SQL migrations: schema, saved words, word history, pagination
├── package.json
├── vite.config.ts
├── tsconfig.json
└── ARCHITECTURE.md
```

---

## Local Development

### Prerequisites

- Node.js ≥ 18
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- A Supabase project
- API keys for [Groq](https://console.groq.com) and [Merriam-Webster](https://dictionaryapi.com)

### Setup

```bash
git clone https://github.com/MSameer7-tech/Lexi-Agent.git
cd Lexi-Agent
npm install
```

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

Start the dev server:

```bash
npm run dev
```

---

## Supabase Setup

Link your project and apply the database schema:

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

Deploy the Edge Function:

```bash
npx supabase functions deploy lexi-chat --no-verify-jwt
```

Set server-side secrets:

```bash
npx supabase secrets set GROQ_API_KEY=your_key
npx supabase secrets set MW_DICTIONARY_API_KEY=your_key
npx supabase secrets set MW_THESAURUS_API_KEY=your_key
```

---

## Environment Variables

**Frontend** (`.env`)

| Variable | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anonymous/publishable key |

**Supabase Edge Function** (server-side secrets)

| Secret | Purpose |
|---|---|
| `GROQ_API_KEY` | Groq API authentication |
| `MW_DICTIONARY_API_KEY` | Merriam-Webster Dictionary access |
| `MW_THESAURUS_API_KEY` | Merriam-Webster Thesaurus access |

> **Security:** Server-side API keys must never appear in frontend `.env` files, Vite source code, or client-side requests. They are injected as Deno environment variables inside the Edge Function runtime only.

---

## Authentication & Data

LexiAgent supports three access modes:

- **Email/Password** — standard Supabase Auth registration and login.
- **OAuth** — Google and GitHub sign-in via Supabase Auth.
- **Guest** — unauthenticated users can explore words with ephemeral local-only sessions. New visitors are redirected to the auth screen; they can explicitly choose to continue as guest.

**For authenticated users:**

- Conversations, messages, saved words, and word history are persisted in PostgreSQL.
- **Row Level Security** is enabled on every table (`profiles`, `conversations`, `messages`, `saved_words`, `word_history`). Users can only read and write their own data.
- Chat history is paginated via database RPCs (`get_conversations_page`, `get_messages_page`) for efficient loading.
- Word history tracks lookup frequency (`lookup_count`) and timestamps (`first_seen_at`, `last_seen_at`).

**For guests:**

- Conversations are stored in `localStorage` and do not persist across browsers.

---

## Agent Tooling

The Edge Function defines two tools available to the Groq model:

| Tool | Source | Returns |
|---|---|---|
| `dictionary_lookup` | Merriam-Webster Collegiate API | Word, phonetic, audio URL, definitions (with part of speech and examples), stems |
| `thesaurus_lookup` | Merriam-Webster Thesaurus API | Synonyms, antonyms, related words, short definitions |

Both tools are fetched **concurrently** when a dictionary lookup is triggered. Results are merged before being returned to the model.

Tool execution is restricted: if the model attempts to call any tool other than these two, the Edge Function returns a `"Tool not found or not permitted"` error. The agentic loop is capped at **3 iterations** to prevent runaway tool chains.

**Response structure** returned to the frontend:

```json
{
  "success": true,
  "response": "Markdown-formatted conversational response",
  "sessionId": "session-uuid",
  "dictionary": { "word": "...", "phonetic": "...", "audio": "...", "definitions": [...], "synonyms": [...], "antonyms": [...] },
  "events": [
    { "type": "tool_call", "tool": "dictionary_lookup", "input": "ephemeral" },
    { "type": "tool_result", "tool": "dictionary_lookup", "success": true }
  ]
}
```

---

## Security

| Protection | Implementation |
|---|---|
| Server-side secrets | Groq and MW API keys are Deno env vars, inaccessible to the browser |
| Row Level Security | Enabled on all 5 database tables with per-user policies |
| Input validation | Message length capped at 5,000 chars; word at 100; note at 500 |
| Rate limiting | In-isolate rate limiter: 50 requests/minute per user/IP |
| Tool restriction | Only `dictionary_lookup` and `thesaurus_lookup` are permitted |
| Loop cap | Agentic loop terminates after 3 iterations maximum |
| Auth verification | Bearer token validated via `supabase.auth.getUser()` for all data operations |
| CORS | Configurable `Access-Control-Allow-Origin` via `CORS_ALLOWED_ORIGIN` env var |

---

## Design Philosophy

LexiAgent intentionally avoids the typical AI dashboard aesthetic.

Vocabulary is treated as an **editorial experience** rather than a utility screen. The interface draws from book design and magazine typesetting — warm ivory backgrounds, restrained serif-adjacent typography, deliberate whitespace, and quiet micro-interactions via Framer Motion.

Cards feel tactile. Transitions feel intentional. The dark theme is crafted as its own palette, not an inverted afterthought.

---

## Scripts

```bash
npm run dev       # Start Vite dev server
npm run build     # TypeScript check + production build
npm run lint      # Run oxlint with React plugins
npm run preview   # Preview production build locally
```

---

## Deployment

| Component | Platform |
|---|---|
| Frontend | [Vercel](https://vercel.com) — automatic deploys from `main` branch |
| Edge Function | [Supabase](https://supabase.com) — deployed via `supabase functions deploy` |
| Database & Auth | [Supabase](https://supabase.com) — managed PostgreSQL with RLS |

**Live:** [lexiagent.vercel.app](https://lexiagent.vercel.app)

---

## Roadmap

- [ ] Expanded language support
- [ ] Vocabulary learning modes and spaced repetition
- [ ] Additional pronunciation variants
- [ ] Richer linguistic tools (etymology, word frequency, usage over time)

---

## Attribution

Dictionary and thesaurus data provided by the [Merriam-Webster API](https://dictionaryapi.com). LexiAgent includes the required Merriam-Webster logo attribution in both light and dark themes.

---

## Acknowledgements

[Groq](https://groq.com) · [Supabase](https://supabase.com) · [Merriam-Webster](https://dictionaryapi.com) · [React](https://react.dev) · [Vite](https://vite.dev)

---

## License

This project is licensed under the MIT License.
