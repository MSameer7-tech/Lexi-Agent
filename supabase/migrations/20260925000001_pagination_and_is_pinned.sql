-- 1. Ensure is_pinned and index exist (safeguard from 10A)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversations' AND column_name = 'is_pinned') THEN
        ALTER TABLE public.conversations ADD COLUMN is_pinned BOOLEAN NOT NULL DEFAULT false;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_conversations_user_is_pinned_updated_at 
ON public.conversations(user_id, is_pinned DESC, updated_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_messages_conv_created_at_id 
ON public.messages(conversation_id, created_at DESC, id DESC);

-- 2. RPC for paginated conversations with search and preview
CREATE OR REPLACE FUNCTION get_conversations_page(
    p_limit INT,
    p_cursor_pinned BOOLEAN DEFAULT NULL,
    p_cursor_updated_at TIMESTAMPTZ DEFAULT NULL,
    p_cursor_id UUID DEFAULT NULL,
    p_search TEXT DEFAULT NULL
) RETURNS TABLE (
    id UUID,
    session_id TEXT,
    title TEXT,
    preview TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    is_pinned BOOLEAN
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_user_id UUID := auth.uid();
BEGIN
    RETURN QUERY
    WITH convs AS (
        SELECT c.id, c.session_id, c.title, c.created_at, c.updated_at, c.is_pinned,
               (SELECT m.content FROM messages m WHERE m.conversation_id = c.id AND m.role = 'user' ORDER BY m.created_at ASC, m.id ASC LIMIT 1) as preview
        FROM conversations c
        WHERE c.user_id = v_user_id
    )
    SELECT *
    FROM convs
    WHERE (p_search IS NULL OR p_search = '' OR convs.title ILIKE '%' || p_search || '%' OR convs.preview ILIKE '%' || p_search || '%')
      AND (p_cursor_id IS NULL OR
           (convs.is_pinned, convs.updated_at, convs.id) < (p_cursor_pinned, p_cursor_updated_at, p_cursor_id))
    ORDER BY convs.is_pinned DESC, convs.updated_at DESC, convs.id DESC
    LIMIT p_limit;
END;
$$;

-- 3. RPC for paginated messages
CREATE OR REPLACE FUNCTION get_messages_page(
    p_session_id TEXT,
    p_limit INT,
    p_cursor_created_at TIMESTAMPTZ DEFAULT NULL,
    p_cursor_id UUID DEFAULT NULL
) RETURNS TABLE (
    id UUID,
    role TEXT,
    content TEXT,
    dictionary_data JSONB,
    events JSONB,
    created_at TIMESTAMPTZ
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_conv_id UUID;
BEGIN
    SELECT c.id INTO v_conv_id FROM conversations c WHERE c.session_id = p_session_id AND c.user_id = v_user_id;
    IF v_conv_id IS NULL THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT m.id, m.role, m.content, m.dictionary_data, m.events, m.created_at
    FROM messages m
    WHERE m.conversation_id = v_conv_id
      AND (p_cursor_id IS NULL OR (m.created_at, m.id) < (p_cursor_created_at, p_cursor_id))
    ORDER BY m.created_at DESC, m.id DESC
    LIMIT p_limit;
END;
$$;
