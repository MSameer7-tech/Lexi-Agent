-- Phase 6B RPC: Atomic upsert for word history

CREATE OR REPLACE FUNCTION public.upsert_word_history(
  p_word TEXT,
  p_dictionary_data JSONB
)
RETURNS void AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get the authenticated user ID
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO public.word_history (user_id, word, dictionary_data, lookup_count, first_seen_at, last_seen_at)
  VALUES (
    v_user_id, 
    lower(trim(p_word)), 
    p_dictionary_data, 
    1, 
    now(), 
    now()
  )
  ON CONFLICT (user_id, word) DO UPDATE 
  SET 
    dictionary_data = EXCLUDED.dictionary_data,
    lookup_count = public.word_history.lookup_count + 1,
    last_seen_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
