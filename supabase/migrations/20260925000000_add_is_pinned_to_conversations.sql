ALTER TABLE public.conversations
ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_conversations_user_is_pinned_updated_at 
ON public.conversations(user_id, is_pinned DESC, updated_at DESC);
