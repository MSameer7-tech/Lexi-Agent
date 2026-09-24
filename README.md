# 📚 LexiAgent

> Words, understood differently. A modern lexicon that lets you explore language through natural, intelligent conversation.

LexiAgent is an AI-powered conversational dictionary and thesaurus. Instead of simply searching for definitions in a static interface, you can ask follow-up questions, explore nuances, discover synonyms, and hear accurate pronunciations through a premium, editorial conversational interface.

## ✨ Features

- **Agentic Dictionary**: Powered by Groq and the Merriam-Webster API to provide accurate, nuanced, and conversational definitions.
- **Interactive Explorations**: Ask follow-up questions about words, phrases, or linguistic nuances (e.g., "What is the precise difference between ephemeral and fleeting?").
- **Audio Pronunciations**: Listen to the correct pronunciation of words natively fetched from the dictionary.
- **Personal Vocabulary**: Save your favorite words to your personal lexicon and review your search history across devices.
- **Beautiful & Tactile UI**: Designed with a premium editorial aesthetic, featuring subtle animations (Framer Motion), a warm ivory color palette, and full dark-mode support.
- **Secure Edge Architecture**: All AI and Dictionary API calls are handled securely via Supabase Edge Functions.

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **State Management**: Zustand
- **Animation**: Framer Motion, Lucide Icons
- **Backend & Auth**: Supabase (PostgreSQL, Row Level Security, Edge Functions)
- **AI & Data**: Groq (Llama 3), Merriam-Webster Dictionary & Thesaurus APIs

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- [Supabase CLI](https://supabase.com/docs/guides/cli) installed locally
- API Keys for Groq and Merriam-Webster

### Local Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/MSameer7-tech/Lexi-Agent.git
   cd Lexi-Agent
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   ```

4. **Supabase Setup**
   Start the local Supabase environment and apply migrations:
   ```bash
   npx supabase start
   ```

5. **Edge Function Secrets**
   Add your API keys to the Supabase Edge Function environment:
   ```bash
   npx supabase secrets set GROQ_API_KEY=your_groq_key
   npx supabase secrets set MW_DICTIONARY_API_KEY=your_mw_dictionary_key
   npx supabase secrets set MW_THESAURUS_API_KEY=your_mw_thesaurus_key
   ```

6. **Start the Development Server**
   ```bash
   npm run dev
   ```

## 📂 Project Architecture

- `src/components/` - Reusable UI components (Cards, History Drawer, Layouts)
- `src/contexts/` - React contexts (Authentication lifecycle)
- `src/store/` - Zustand global state (History, Theme persistence)
- `src/services/` - API clients bridging the frontend to Supabase
- `supabase/functions/` - Deno Edge Functions handling secure AI routing and Dictionary parsing
- `supabase/migrations/` - Postgres schema, RPCs, and RLS policies

## 📄 License

This project is licensed under the MIT License.
