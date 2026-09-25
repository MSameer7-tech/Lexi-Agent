<p align="center">
  <h1 align="center">📚 LexiAgent</h1>
  <h3 align="center">Words, understood differently.</h3>
</p>

<p align="center">
An agentic AI dictionary that turns vocabulary lookup into a conversational learning experience.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React_19-20232A?style=flat&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Supabase-3FCF8E?style=flat&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Groq-F55036?style=flat" alt="Groq" />
  <img src="https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white" alt="Vercel" />
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=flat" alt="MIT License" />
</p>

<p align="center">
  <a href="https://lexiagent.vercel.app"><strong>Live Demo →</strong></a>&nbsp;&nbsp;·&nbsp;&nbsp;<a href="https://github.com/MSameer7-tech/Lexi-Agent"><strong>GitHub</strong></a>
</p>

<br/>

<p align="center">
  <img src="docs/screenshots/home.png" alt="LexiAgent" width="100%" />
</p>

<table>
  <tr>
    <td><img src="docs/screenshots/dictionary-result.png" alt="Dictionary" /></td>
    <td><img src="docs/screenshots/vocabulary.png" alt="Vocabulary" /></td>
  </tr>
</table>

---

## ✦ Features

🤖 **Agentic lookup** — Groq autonomously decides when to fetch dictionary data and invokes the tool.

📖 **Rich word intelligence** — Definitions, examples, pronunciation audio, synonyms, and antonyms from Merriam-Webster.

💬 **Conversational** — Ask follow-up questions. Continue the dialogue instead of isolated searches.

🧠 **Personal vocabulary** — Save words, track lookup history, build your lexicon across sessions.

🎤 **Voice input** — Speak your query using native Web Speech API.

🌗 **Light & dark** — Carefully designed editorial themes with warm ivory palette and tactile motion.

---

## ✦ How it works

```mermaid
flowchart LR
    A["User"] --> B["React Frontend"]
    B --> C["Supabase Edge Function"]
    C --> D["Groq LLM"]
    D -->|"Tool Call"| E["Merriam-Webster APIs"]
    E --> D
    D --> C
    C --> F[("PostgreSQL")]
    C --> B
```

User sends a message. The Edge Function routes it to Groq, which can autonomously invoke a dictionary tool to fetch definitions and thesaurus data from Merriam-Webster. Structured word data and the conversational response are persisted and returned to the frontend. All API keys stay server-side.

---

## ✦ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 · TypeScript · Vite · Tailwind CSS 4 |
| Animation | Framer Motion |
| State | Zustand |
| Backend | Supabase Edge Functions (Deno) |
| AI | Groq |
| Dictionary | Merriam-Webster Dictionary & Thesaurus APIs |
| Auth & DB | Supabase (PostgreSQL · Row Level Security · OAuth) |
| Deployment | Vercel + Supabase |

---

## ✦ Quick Start

```bash
git clone https://github.com/MSameer7-tech/Lexi-Agent.git
cd Lexi-Agent
npm install
```

Create `.env`:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
```

```bash
npm run dev
```

> Backend secrets (Groq, Merriam-Webster) are configured in [Supabase Edge Function secrets](https://supabase.com/docs/guides/functions/secrets) and are never exposed to the browser.

---

<p align="center">
  <strong><a href="https://lexiagent.vercel.app">lexiagent.vercel.app</a></strong>
</p>

---

<p align="center">
Dictionary and thesaurus data provided by the <a href="https://dictionaryapi.com">Merriam-Webster API</a>.<br/>
Licensed under MIT.
</p>
