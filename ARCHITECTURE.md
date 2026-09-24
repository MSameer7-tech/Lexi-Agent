# LexiAgent Architecture

LexiAgent operates on a fully serverless, edge-first architecture. It leverages a modern React frontend and a Supabase backend to provide a seamless, highly responsive conversational dictionary experience.

## System Architecture

```mermaid
flowchart TD
    A[React/Vite Frontend] -->|Auth & DB Queries| E[(Supabase PostgreSQL)]
    A -->|POST /lexi-chat| B(Supabase Edge Function: lexi-chat)
    B <-->|Tool calling| C{Groq LLM (Llama 3)}
    C -->|lookup_word / lookup_thesaurus| D[Merriam-Webster APIs]
    D -->|JSON| C
    C -->|Markdown Response| B
    B -->|Save Chat & Vocabulary| E
    B -->|Return Response| A
```

### 1. Frontend Layer
*   **Framework**: React 19 with TypeScript and Vite.
*   **Routing**: React Router DOM (Handles navigation between Home, History, Vocabulary, Settings, and Auth views).
*   **State Management**: Zustand (`src/store/historyStore.ts`, `themeStore.ts`). Zustand manages optimistic local state while synchronizing with Supabase for authenticated users.
*   **UI/Styling**: Tailwind CSS and Framer Motion. Components include `WordResult.tsx` (dictionary typesetting), `ActivityTimeline.tsx` (agent process visualization), and `HistoryDrawer.tsx` (sidebar).
*   **Parsing**: A custom Markdown parser (`src/lib/parser.ts`) extracts structured data from the LLM markdown response.

### 2. Backend Orchestration (Edge Functions)
*   **Environment**: Deno (Supabase Edge Functions).
*   **Function (`lexi-chat`)**: The central orchestration layer. It receives user prompts, manages conversation history context, and acts as the secure intermediary between the frontend and external AI/Data providers.
*   **Tool Calling**: The Edge Function exposes specific tools to the LLM (`dictionary_lookup`, `thesaurus_lookup`). When the LLM decides it needs definitions, the Edge Function intercepts the tool call, fetches data from the Merriam-Webster APIs, and returns it to the LLM to formulate the final conversational response.

### 3. AI & Data Layer
*   **AI Engine**: **Groq** (currently using `openai/gpt-oss-20b`). Chosen for its ultra-low latency inference, enabling real-time conversational responses.
*   **Dictionary Provider**: **Merriam-Webster Dictionary & Thesaurus APIs**. Provides authoritative definitions, synonyms, antonyms, and native audio pronunciations.

### 4. Database & Authentication
*   **Authentication**: Supabase Auth (Email/Password & OAuth). The `AuthContext` manages robust session hydration to prevent race conditions during page reloads.
*   **Database**: PostgreSQL.
    *   **Conversations & Messages**: Stores full chat history.
    *   **Saved Words**: Manages the user's personal lexicon.
    *   **Word History**: Tracks lookup frequency and timestamps for personalized learning.
*   **Security**: Row Level Security (RLS) ensures users can only access their own conversations and vocabulary.

## Historical Context

*Note: Early prototypes of LexiAgent utilized an n8n webhook for LLM orchestration and the Free Dictionary API. These have been completely sunset. The production application runs entirely on Supabase Edge Functions and the Merriam-Webster API for significantly improved latency, reliability, and security.*
