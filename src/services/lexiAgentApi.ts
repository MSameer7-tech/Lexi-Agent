import { supabase } from '../lib/supabase';
export interface ChatRequest {
  message: string;
  sessionId: string;
}

export interface ChatResponse {
  success: boolean;
  response: string;
  sessionId: string;
  dictionary?: any | null;
  events?: any[];
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export async function sendMessage(request: ChatRequest, signal?: AbortSignal): Promise<ChatResponse> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    const res = await fetch(`${SUPABASE_URL}/functions/v1/lexi-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(request),
      signal,
    });

    if (!res.ok) {
      throw new Error(`Network response was not ok. Status: ${res.status}`);
    }

    const data = await res.json();
    
    // Ensure we have a valid response structure
    if (!data || typeof data.response !== 'string') {
      throw new Error('Invalid or empty response format received from LexiAgent Edge Function.');
    }
    
    return {
      success: data.success,
      response: data.response,
      sessionId: data.sessionId || request.sessionId,
      dictionary: data.dictionary || null,
      events: data.events || [],
    };
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.log('Request was cancelled');
    } else {
      console.error('LexiAgent API Error:', error);
    }
    throw error;
  }
}
