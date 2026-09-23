-- Phase 6A: Vocabulary Library Schema

-- 1. Create word_history table
CREATE TABLE public.word_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word TEXT NOT NULL CHECK (word = lower(trim(word))),
  dictionary_data JSONB,
  lookup_count INTEGER NOT NULL DEFAULT 1,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT word_history_user_id_word_key UNIQUE(user_id, word)
);

-- 2. Create saved_words table
CREATE TABLE public.saved_words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word TEXT NOT NULL CHECK (word = lower(trim(word))),
  dictionary_data JSONB,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT saved_words_user_id_word_key UNIQUE(user_id, word)
);

-- Indexes for word_history
-- Note: (user_id) is already efficiently covered by the composite UNIQUE(user_id, word) index.
CREATE INDEX idx_word_history_last_seen_at ON public.word_history(last_seen_at);
CREATE INDEX idx_word_history_word ON public.word_history(word);

-- Indexes for saved_words
-- Note: (user_id) is already efficiently covered by the composite UNIQUE(user_id, word) index.
CREATE INDEX idx_saved_words_created_at ON public.saved_words(created_at);
CREATE INDEX idx_saved_words_word ON public.saved_words(word);

-- RLS: word_history
ALTER TABLE public.word_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own word_history" 
ON public.word_history FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own word_history" 
ON public.word_history FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own word_history" 
ON public.word_history FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own word_history" 
ON public.word_history FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- RLS: saved_words
ALTER TABLE public.saved_words ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own saved_words" 
ON public.saved_words FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved_words" 
ON public.saved_words FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved_words" 
ON public.saved_words FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved_words" 
ON public.saved_words FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- Trigger for saved_words updated_at
CREATE TRIGGER update_saved_words_updated_at
BEFORE UPDATE ON public.saved_words
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
